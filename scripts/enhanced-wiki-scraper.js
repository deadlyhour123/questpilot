#!/usr/bin/env node

/**
 * QuestPilot Enhanced Wiki Scraper
 * Pulls COMPLETE quest data including full walkthrough guides
 * Run: node scripts/enhanced-wiki-scraper.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// RuneScape Wiki API endpoint
const WIKI_API = 'https://runescape.wiki/api.php';
const WIKI_BASE = 'https://runescape.wiki';

// Helper: Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Make wiki API request
async function wikiRequest(params) {
    try {
        const response = await axios.get(WIKI_API, {
            params: {
                format: 'json',
                origin: '*',
                ...params
            }
        });
        return response.data;
    } catch (error) {
        console.error('Wiki API error:', error.message);
        return null;
    }
}

// Get list of all quests
async function getAllQuests() {
    console.log('📚 Fetching all quests from RuneScape Wiki...');
    
    const data = await wikiRequest({
        action: 'query',
        list: 'categorymembers',
        cmtitle: 'Category:Quests',
        cmlimit: 500
    });
    
    if (!data || !data.query) {
        console.error('Failed to fetch quest list');
        return [];
    }
    
    const quests = data.query.categorymembers
        .map(q => q.title)
        .filter(title => 
            !title.includes('Category:') && 
            !title.includes('Template:') &&
            !title.includes('/') && // Exclude subpages
            !title.includes('List of')
        );
    
    console.log(`✅ Found ${quests.length} quests`);
    return quests;
}

// Get quest page HTML for parsing walkthrough
async function getQuestHTML(questName) {
    try {
        const url = `${WIKI_BASE}/w/${encodeURIComponent(questName.replace(/ /g, '_'))}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching HTML for ${questName}:`, error.message);
        return null;
    }
}

// Parse quest walkthrough from HTML
function parseWalkthrough(html, questName) {
    const $ = cheerio.load(html);
    const walkthrough = [];
    
    // Find the walkthrough section
    let walkthroughSection = null;
    $('h2, h3').each((i, elem) => {
        const text = $(elem).text().toLowerCase();
        if (text.includes('walkthrough') || text.includes('guide') || text.includes('quick guide')) {
            walkthroughSection = $(elem).next('ul, ol, p');
            return false; // break
        }
    });
    
    if (!walkthroughSection || walkthroughSection.length === 0) {
        console.log(`    ⚠️  No walkthrough section found for ${questName}`);
        return [];
    }
    
    // Parse steps
    if (walkthroughSection.is('ul') || walkthroughSection.is('ol')) {
        walkthroughSection.find('li').each((i, elem) => {
            const step = $(elem).clone();
            step.find('ul, ol').remove(); // Remove nested lists
            const text = step.text().trim();
            
            if (text.length > 0 && !text.startsWith('Optional')) {
                walkthrough.push({
                    step: i + 1,
                    instruction: text,
                    type: 'main'
                });
            }
        });
    } else {
        // Parse from paragraphs
        let stepNum = 1;
        walkthroughSection.nextUntil('h2, h3').each((i, elem) => {
            if ($(elem).is('p')) {
                const text = $(elem).text().trim();
                if (text.length > 20) { // Filter out short paragraphs
                    walkthrough.push({
                        step: stepNum++,
                        instruction: text,
                        type: 'main'
                    });
                }
            }
        });
    }
    
    return walkthrough;
}

// Get detailed quest data with walkthrough
async function getQuestDetailsWithGuide(questName) {
    console.log(`  📖 Fetching: ${questName}`);
    
    // Get basic quest data from API
    const data = await wikiRequest({
        action: 'parse',
        page: questName,
        prop: 'wikitext',
        section: 0
    });
    
    if (!data || !data.parse) {
        return null;
    }
    
    const wikitext = data.parse.wikitext['*'];
    
    // Parse quest infobox
    const quest = {
        name: questName,
        difficulty: extractField(wikitext, 'difficulty'),
        length: extractField(wikitext, 'length'),
        questPoints: parseInt(extractField(wikitext, 'quest points')) || 0,
        series: extractField(wikitext, 'series'),
        releaseDate: extractField(wikitext, 'release'),
        requirements: {
            skills: parseSkillRequirements(wikitext),
            quests: parseQuestRequirements(wikitext),
            items: parseItemRequirements(wikitext),
            other: parseOtherRequirements(wikitext)
        },
        rewards: {
            experience: parseExperienceRewards(wikitext),
            items: parseItemRewards(wikitext),
            questPoints: parseInt(extractField(wikitext, 'quest points')) || 0,
            unlocks: parseUnlocks(wikitext)
        },
        members: !wikitext.toLowerCase().includes('free-to-play'),
        url: `https://runescape.wiki/w/${encodeURIComponent(questName.replace(/ /g, '_'))}`
    };
    
    // Get walkthrough from HTML
    console.log(`    📝 Parsing walkthrough...`);
    const html = await getQuestHTML(questName);
    if (html) {
        quest.walkthrough = parseWalkthrough(html, questName);
        console.log(`    ✅ Found ${quest.walkthrough.length} walkthrough steps`);
    } else {
        quest.walkthrough = [];
    }
    
    return quest;
}

// Extract field from wiki infobox
function extractField(wikitext, fieldName) {
    const regex = new RegExp(`\\|\\s*${fieldName}\\s*=\\s*([^\\|\\n]+)`, 'i');
    const match = wikitext.match(regex);
    if (!match) return '';
    
    let value = match[1].trim();
    // Clean wiki markup
    value = value.replace(/\[\[|\]\]/g, '');
    value = value.replace(/\{\{|\}\}/g, '');
    value = value.replace(/'''|''/g, '');
    return value;
}

// Parse skill requirements
function parseSkillRequirements(wikitext) {
    const skills = [];
    const reqSection = wikitext.match(/\|requirements\s*=(.*?)(?=\|[a-z]|\}\})/is);
    if (!reqSection) return skills;
    
    const skillNames = [
        'Attack', 'Strength', 'Defence', 'Ranged', 'Prayer', 'Magic', 'Runecraft',
        'Construction', 'Dungeoneering', 'Constitution', 'Agility', 'Herblore',
        'Thieving', 'Crafting', 'Fletching', 'Slayer', 'Hunter', 'Mining',
        'Smithing', 'Fishing', 'Cooking', 'Firemaking', 'Woodcutting', 'Farming',
        'Summoning', 'Divination', 'Invention', 'Archaeology', 'Necromancy'
    ];
    
    // Pattern: [[Skill]] level
    const skillPattern = new RegExp(`\\[\\[(${skillNames.join('|')})\\]\\][^\\d]*(\\d+)`, 'gi');
    let match;
    
    while ((match = skillPattern.exec(reqSection[0])) !== null) {
        const skill = match[1];
        const level = parseInt(match[2]);
        
        if (level > 1 && !skills.find(s => s.skill === skill)) {
            skills.push({ 
                skill, 
                level,
                boostable: reqSection[0].toLowerCase().includes(`${skill.toLowerCase()}.*boost`)
            });
        }
    }
    
    return skills;
}

// Parse quest requirements
function parseQuestRequirements(wikitext) {
    const quests = [];
    const reqSection = wikitext.match(/\|requirements\s*=(.*?)(?=\|[a-z]|\}\})/is);
    if (!reqSection) return quests;
    
    // Look for quest links
    const questPattern = /\[\[([^\]]+?Quest[^\]]*?)\]\]/g;
    let match;
    
    while ((match = questPattern.exec(reqSection[0])) !== null) {
        let questName = match[1].split('|')[0].trim();
        if (!quests.includes(questName) && !questName.includes('point')) {
            quests.push(questName);
        }
    }
    
    return quests;
}

// Parse item requirements
function parseItemRequirements(wikitext) {
    const items = [];
    const reqSection = wikitext.match(/\|requirements\s*=(.*?)(?=\|[a-z]|\}\})/is);
    if (!reqSection) return items;
    
    // Look for item patterns
    const itemPattern = /\*[^*\n]*?\[\[([^\]]+?)\]\][^*\n]*?(\d+)?/g;
    let match;
    
    while ((match = itemPattern.exec(reqSection[0])) !== null) {
        const item = match[1].split('|')[0].trim();
        const quantity = match[2] ? parseInt(match[2]) : 1;
        
        if (!item.includes('Quest') && !item.includes('skill')) {
            items.push({ name: item, quantity });
        }
    }
    
    return items.slice(0, 10); // Limit to 10 items
}

// Parse other requirements
function parseOtherRequirements(wikitext) {
    const other = [];
    const reqSection = wikitext.match(/\|requirements\s*=(.*?)(?=\|[a-z]|\}\})/is);
    if (!reqSection) return other;
    
    // Look for "Completion of", "Access to", etc.
    const patterns = [
        /completion of ([^,\n]+)/gi,
        /access to ([^,\n]+)/gi,
        /must (?:have|be) ([^,\n]+)/gi
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(reqSection[0])) !== null) {
            const req = match[1].trim();
            if (req.length > 3 && req.length < 100) {
                other.push(req);
            }
        }
    });
    
    return [...new Set(other)]; // Remove duplicates
}

// Parse experience rewards
function parseExperienceRewards(wikitext) {
    const rewards = [];
    const rewardSection = wikitext.match(/\|rewards\s*=(.*?)(?=\|[a-z]|\}\})/is);
    if (!rewardSection) return rewards;
    
    // Pattern: number [[Skill]] experience
    const xpPattern = /([\d,]+)\s*\[\[([^\]]+)\]\]\s*(?:experience|XP)/gi;
    let match;
    
    while ((match = xpPattern.exec(rewardSection[0])) !== null) {
        const amount = parseInt(match[1].replace(/,/g, ''));
        const skill = match[2].split('|')[0];
        
        if (!isNaN(amount)) {
            rewards.push({ skill, amount });
        }
    }
    
    return rewards;
}

// Parse item rewards
function parseItemRewards(wikitext) {
    const items = [];
    const rewardSection = wikitext.match(/\|rewards\s*=(.*?)(?=\|[a-z]|\}\})/is);
    if (!rewardSection) return items;
    
    // Look for item links in rewards
    const itemPattern = /\[\[([^\]]+?)\]\]/g;
    let match;
    
    while ((match = itemPattern.exec(rewardSection[0])) !== null) {
        const item = match[1].split('|')[0].trim();
        
        if (!item.includes('experience') && 
            !item.includes('XP') && 
            !item.includes('Quest') &&
            item.length < 50) {
            items.push(item);
        }
    }
    
    return [...new Set(items)].slice(0, 10); // Limit to 10, remove duplicates
}

// Parse unlocks
function parseUnlocks(wikitext) {
    const unlocks = [];
    const sections = wikitext.match(/\|(?:rewards|unlocks)\s*=(.*?)(?=\|[a-z]|\}\})/is);
    if (!sections) return unlocks;
    
    // Look for "Unlocks", "Access to", etc.
    const unlockPattern = /(?:unlock|access to|ability to)[^,.\n]+/gi;
    let match;
    
    while ((match = unlockPattern.exec(sections[0])) !== null) {
        const unlock = match[0].trim();
        if (unlock.length > 10 && unlock.length < 100) {
            unlocks.push(unlock);
        }
    }
    
    return [...new Set(unlocks)];
}

// Main scraping function
async function scrapeAllQuestsWithGuides() {
    console.log('🚀 QuestPilot Enhanced Wiki Scraper Starting...\n');
    
    // Get all quest names
    const questNames = await getAllQuests();
    
    if (questNames.length === 0) {
        console.error('❌ No quests found. Check your internet connection.');
        return;
    }
    
    // Fetch details for each quest
    const allQuests = [];
    let successCount = 0;
    
    for (let i = 0; i < questNames.length; i++) {
        const questName = questNames[i];
        
        try {
            const questData = await getQuestDetailsWithGuide(questName);
            
            if (questData) {
                allQuests.push(questData);
                successCount++;
                console.log(`    ✅ ${successCount}/${questNames.length}`);
            } else {
                console.log(`    ⚠️  Failed to parse: ${questName}`);
            }
            
            // Rate limiting - be nice to the wiki (2 seconds between requests)
            await delay(2000);
            
        } catch (error) {
            console.error(`    ❌ Error fetching ${questName}:`, error.message);
        }
    }
    
    // Save to JSON file
    const outputPath = path.join(__dirname, '../data/quests-full.json');
    fs.writeFileSync(outputPath, JSON.stringify(allQuests, null, 2));
    
    console.log(`\n✅ Successfully scraped ${successCount}/${questNames.length} quests with guides`);
    console.log(`📁 Saved to: ${outputPath}`);
    
    // Generate summary
    generateSummary(allQuests);
}

// Generate summary statistics
function generateSummary(quests) {
    const summary = {
        totalQuests: quests.length,
        totalQuestPoints: quests.reduce((sum, q) => sum + q.questPoints, 0),
        questsWithWalkthrough: quests.filter(q => q.walkthrough && q.walkthrough.length > 0).length,
        totalWalkthroughSteps: quests.reduce((sum, q) => sum + (q.walkthrough?.length || 0), 0),
        byDifficulty: {},
        byLength: {},
        members: quests.filter(q => q.members).length,
        f2p: quests.filter(q => !q.members).length
    };
    
    // Count by difficulty
    quests.forEach(q => {
        summary.byDifficulty[q.difficulty] = (summary.byDifficulty[q.difficulty] || 0) + 1;
        summary.byLength[q.length] = (summary.byLength[q.length] || 0) + 1;
    });
    
    console.log('\n📊 Quest Database Summary:');
    console.log(`   Total Quests: ${summary.totalQuests}`);
    console.log(`   Total Quest Points: ${summary.totalQuestPoints}`);
    console.log(`   Quests with Walkthrough: ${summary.questsWithWalkthrough}`);
    console.log(`   Total Walkthrough Steps: ${summary.totalWalkthroughSteps}`);
    console.log(`   F2P Quests: ${summary.f2p}`);
    console.log(`   Members Quests: ${summary.members}`);
    console.log('\n   By Difficulty:', summary.byDifficulty);
    console.log('   By Length:', summary.byLength);
    
    // Save summary
    const summaryPath = path.join(__dirname, '../data/quest-summary-full.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
}

// Run scraper
if (require.main === module) {
    scrapeAllQuestsWithGuides().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { scrapeAllQuestsWithGuides, getQuestDetailsWithGuide };
