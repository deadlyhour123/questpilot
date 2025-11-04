// API Module
// Handles all external API calls (RuneMetrics, RuneScape Wiki)

const API = {
    
    // ===== RUNEMETRICS API =====
    
    // Get player profile data
    async getPlayerProfile(username) {
        try {
            const response = await fetch(
                `https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(username)}&activities=0`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Profile fetch error:', error);
            throw error;
        }
    },
    
    // Get player quest data
    async getPlayerQuests(username) {
        try {
            const response = await fetch(
                `https://apps.runescape.com/runemetrics/quests?user=${encodeURIComponent(username)}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch quests');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Quest fetch error:', error);
            throw error;
        }
    },
    
    // Get monthly XP gains
    async getMonthlyXP(username, skillId = 0) {
        try {
            const response = await fetch(
                `https://apps.runescape.com/runemetrics/xp-monthly?searchName=${encodeURIComponent(username)}&skillid=${skillId}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch XP data');
            }
            
            return await response.json();
        } catch (error) {
            console.error('XP fetch error:', error);
            throw error;
        }
    },
    
    // Get complete player data
    async getCompletePlayerData(username) {
        try {
            const [profile, quests] = await Promise.all([
                this.getPlayerProfile(username),
                this.getPlayerQuests(username)
            ]);
            
            return {
                profile,
                quests,
                skills: this.parseSkillLevels(profile.skillvalues),
                completedQuests: quests
                    .filter(q => q.status === 'COMPLETED')
                    .map(q => this.normalizeQuestName(q.title)),
                questPoints: quests
                    .filter(q => q.status === 'COMPLETED')
                    .reduce((sum, q) => sum + (q.questPoints || 0), 0)
            };
        } catch (error) {
            console.error('Complete data fetch error:', error);
            throw error;
        }
    },
    
    // Parse skill levels from RuneMetrics format
    parseSkillLevels(skillvalues) {
        const skills = {};
        const skillNames = [
            'attack', 'defence', 'strength', 'constitution', 'ranged',
            'prayer', 'magic', 'cooking', 'woodcutting', 'fletching',
            'fishing', 'firemaking', 'crafting', 'smithing', 'mining',
            'herblore', 'agility', 'thieving', 'slayer', 'farming',
            'runecrafting', 'hunter', 'construction', 'summoning',
            'dungeoneering', 'divination', 'invention', 'archaeology',
            'necromancy'
        ];
        
        skillvalues?.forEach((skill, index) => {
            if (index < skillNames.length) {
                skills[skillNames[index]] = skill.level;
            }
        });
        
        return skills;
    },
    
    // Normalize quest names for matching
    normalizeQuestName(questName) {
        return questName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    },
    
    // ===== RUNESCAPE WIKI API =====
    
    // Query wiki for quest data
    async queryWikiQuests() {
        try {
            // MediaWiki API query for quests
            const response = await fetch(
                'https://runescape.wiki/api.php?action=ask&query=[[Category:Quests]]|?Quest difficulty|?Quest length|?Quest points|?Quest requirements|format=json'
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch wiki data');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Wiki fetch error:', error);
            throw error;
        }
    },
    
    // Get specific quest page data
    async getQuestPage(questName) {
        try {
            const response = await fetch(
                `https://runescape.wiki/api.php?action=parse&page=${encodeURIComponent(questName)}&format=json`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch quest page');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Quest page fetch error:', error);
            throw error;
        }
    },
    
    // ===== HISCORES API =====
    
    // Get player hiscores
    async getHiscores(username, mode = 'normal') {
        try {
            const modeUrls = {
                normal: 'https://secure.runescape.com/m=hiscore/index_lite.ws',
                ironman: 'https://secure.runescape.com/m=hiscore_ironman/index_lite.ws',
                hardcore: 'https://secure.runescape.com/m=hiscore_hardcore_ironman/index_lite.ws'
            };
            
            const url = modeUrls[mode] || modeUrls.normal;
            const response = await fetch(`${url}?player=${encodeURIComponent(username)}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch hiscores');
            }
            
            const data = await response.text();
            return this.parseHiscores(data);
        } catch (error) {
            console.error('Hiscores fetch error:', error);
            throw error;
        }
    },
    
    // Parse hiscores CSV format
    parseHiscores(data) {
        const lines = data.trim().split('\n');
        const skills = {};
        
        const skillNames = [
            'overall', 'attack', 'defence', 'strength', 'constitution',
            'ranged', 'prayer', 'magic', 'cooking', 'woodcutting',
            'fletching', 'fishing', 'firemaking', 'crafting', 'smithing',
            'mining', 'herblore', 'agility', 'thieving', 'slayer',
            'farming', 'runecrafting', 'hunter', 'construction', 'summoning',
            'dungeoneering', 'divination', 'invention', 'archaeology',
            'necromancy'
        ];
        
        lines.forEach((line, index) => {
            if (index < skillNames.length) {
                const [rank, level, xp] = line.split(',').map(Number);
                skills[skillNames[index]] = { rank, level, xp };
            }
        });
        
        return skills;
    },
    
    // ===== RATE LIMITING =====
    
    lastRequestTime: 0,
    minRequestInterval: 1000, // 1 second between requests
    
    async throttledRequest(requestFn) {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => 
                setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
        }
        
        this.lastRequestTime = Date.now();
        return await requestFn();
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
