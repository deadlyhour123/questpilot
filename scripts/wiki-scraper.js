#!/usr/bin/env node

/**
 * QuestPilot Wiki Scraper
 * Pulls all quest data from RuneScape Wiki
 * Run: npm run scrape
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// RuneScape Wiki API endpoint
const WIKI_API = 'https://runescape.wiki/api.php';

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
        .filter(title => !title.includes('Category:') && !title.includes('Template:'));
    
    console.log(`✅ Found ${quests.length} quests`);
    return quests;
}

// Get detailed quest data
async function getQuestDetails(questName) {
    console.log(`  📖 Fetching: ${questName}`);
    
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
        requirements: {
            skills: parseSkillRequirements(wikitext),
            quests: parseQuestRequirements(wikitext),
            items: parseItemRequirements(wikitext)
        },
        rewards: {
            experience: parseExperienceRewards(wikitext),
            items: parseItemRewards(wikitext),
            questPoints: parseInt(extractField(wikitext, 'quest points')) || 0
        },
        members: !wikitext.toLowerCase().includes('free-to-play'),
        url: `https://runescape.wiki/w/${encodeURIComponent(questName.replace(/ /g, '_'))}`
    };
    
    return quest;
}

// Extract field from wiki infobox
function extractField(wikitext, fieldName) {
    const regex = new RegExp(`\\|\\s*${fieldName}\\s*=\\s*([^\\|\\n]+)`, 'i');
    const match = wikitext.match(regex);
    return match ? match[1].trim().replace(/\[\[|\]\]/g, '').replace(/\{\{|\}\}/g, '') : '';
}

// Parse skill requirements
function parseSkillRequirements(wikitext) {
    const skills = [];
    const skillPattern = /\[\[(\w+)\]\][^\d]*(\d+)/g;
    
    // Look in requirements section
    const reqSection = wikitext.match(/\|requirements\s*=(.*?)(?=\|[a-z]|\}\})/is);
    if (!reqSection) return skills;
    
    let match;
    const skillNames = ['Attack', 'Strength', 'Defence', 'Ranged', 'Prayer', 'Magic', 'Runecraft', 
                       'Construction', 'Dungeoneering', 'Constitution', 'Agility', 'Herblore', 
                       'Thieving', 'Crafting', 'Fletching', 'Slayer', 'Hunter', 'Mining', 
                       'Smithing', 'Fishing', 'Cooking', 'Firemaking', 'Woodcutting', 'Farming',
                       'Summoning', 'Divination', 'Invention', 'Archaeology'];
    
    while ((match = skillPattern.exec(reqSection[0])) !== null) {
        const skill = match[1];
        const level = parseInt(match[2]);
        
        if (skillNames.includes(skill) && level > 1) {
            skills.push({ skill, level });
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
    const questPattern = /\[\[(.*?Quest.*?)\]\]/g;
    let match;
    
    while ((match = questPattern.exec(reqSection[0])) !== null) {
        const questName = match[1].split('|')[0].trim();
        if (!quests.includes(questName)) {
            quests.push(questName);
        }
    }
    
    return quests;
}

// Parse item requirements
function parseItemRequirements(wikitext) {
    // This is complex - would need detailed parsing
    // For now, return empty array (can be enhanced later)
    return [];
}

// Parse experience rewards
function parseExperienceRewards(wikitext) {
    const rewards = [];
    const rewardSection = wikitext.match(/\|rewards\s*=(.*?)(?=\|[a-z]|\}\})/is);
    
    if (!rewardSection) return rewards;
    
    // Look for XP patterns like "1,000 Attack experience"
    const xpPattern = /([\d,]+)\s*\[\[(\w+)\]\]\s*experience/gi;
    let match;
    
    while ((match = xpPattern.exec(rewardSection[0])) !== null) {
        const amount = parseInt(match[1].replace(/,/g, ''));
        const skill = match[2];
        rewards.push({ skill, amount });
    }
    
    return rewards;
}

// Parse item rewards
function parseItemRewards(wikitext) {
    // Simplified - can be enhanced
    return [];
}

// Main scraping function
async function scrapeAllQuests() {
    console.log('🚀 QuestPilot Wiki Scraper Starting...\n');
    
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
            const questData = await getQuestDetails(questName);
            
            if (questData) {
                allQuests.push(questData);
                successCount++;
                console.log(`    ✅ ${successCount}/${questNames.length}`);
            } else {
                console.log(`    ⚠️  Failed to parse: ${questName}`);
            }
            
            // Rate limiting - be nice to the wiki
            await delay(500);
            
        } catch (error) {
            console.error(`    ❌ Error fetching ${questName}:`, error.message);
        }
    }
    
    // Save to JSON file
    const outputPath = path.join(__dirname, '../data/quests.json');
    fs.writeFileSync(outputPath, JSON.stringify(allQuests, null, 2));
    
    console.log(`\n✅ Successfully scraped ${successCount}/${questNames.length} quests`);
    console.log(`📁 Saved to: ${outputPath}`);
    
    // Generate summary
    generateSummary(allQuests);
}

// Generate summary statistics
function generateSummary(quests) {
    const summary = {
        totalQuests: quests.length,
        totalQuestPoints: quests.reduce((sum, q) => sum + q.questPoints, 0),
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
    console.log(`   F2P Quests: ${summary.f2p}`);
    console.log(`   Members Quests: ${summary.members}`);
    console.log('\n   By Difficulty:', summary.byDifficulty);
    console.log('   By Length:', summary.byLength);
    
    // Save summary
    const summaryPath = path.join(__dirname, '../data/quest-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
}

// Run scraper
if (require.main === module) {
    scrapeAllQuests().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { scrapeAllQuests, getQuestDetails };
