/**
 * QuestPilot - RuneScape API Integration
 * Fetches real player data from official RuneScape APIs
 */

// RuneScape API endpoints
const RS_API_BASE = 'https://apps.runescape.com/runemetrics';

export class RuneScapeAPI {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    /**
     * Fetch player profile data
     */
    async getPlayerProfile(username) {
        const cacheKey = `profile_${username}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log(`📦 Using cached profile for ${username}`);
                return cached.data;
            }
        }
        
        try {
            const url = `${RS_API_BASE}/profile/profile?user=${encodeURIComponent(username)}`;
            console.log(`🔍 Fetching profile: ${username}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Check for error response
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            console.log(`✅ Profile loaded for ${username}`);
            return data;
            
        } catch (error) {
            console.error(`❌ Error fetching profile for ${username}:`, error.message);
            throw error;
        }
    }
    
    /**
     * Fetch player quest data
     */
    async getPlayerQuests(username) {
        const cacheKey = `quests_${username}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log(`📦 Using cached quests for ${username}`);
                return cached.data;
            }
        }
        
        try {
            const url = `${RS_API_BASE}/quests?user=${encodeURIComponent(username)}`;
            console.log(`🔍 Fetching quests: ${username}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Check for error response
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            console.log(`✅ Quests loaded for ${username} (${data.quests?.length || 0} quests)`);
            return data;
            
        } catch (error) {
            console.error(`❌ Error fetching quests for ${username}:`, error.message);
            throw error;
        }
    }
    
    /**
     * Parse profile data into usable format
     */
    parseProfile(profileData) {
        if (!profileData) {
            return null;
        }
        
        const parsed = {
            name: profileData.name,
            combatLevel: profileData.combatlevel,
            totalLevel: profileData.totalskill,
            totalXP: profileData.totalxp,
            rank: profileData.rank,
            skills: {},
            activities: profileData.activities || []
        };
        
        // Parse skills
        if (profileData.skillvalues) {
            const skillNames = [
                'Attack', 'Defence', 'Strength', 'Constitution', 'Ranged', 'Prayer', 'Magic',
                'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting',
                'Smithing', 'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming',
                'Runecraft', 'Hunter', 'Construction', 'Summoning', 'Dungeoneering', 'Divination',
                'Invention', 'Archaeology', 'Necromancy'
            ];
            
            profileData.skillvalues.forEach((skill, index) => {
                if (index < skillNames.length) {
                    parsed.skills[skillNames[index]] = {
                        level: skill.level,
                        xp: skill.xp,
                        rank: skill.rank
                    };
                }
            });
        }
        
        return parsed;
    }
    
    /**
     * Parse quest data into usable format
     */
    parseQuests(questData) {
        if (!questData || !questData.quests) {
            return null;
        }
        
        const parsed = {
            completed: [],
            notStarted: [],
            started: [],
            totalQuestPoints: 0,
            questPointsEarned: 0
        };
        
        questData.quests.forEach(quest => {
            const questInfo = {
                title: quest.title,
                status: quest.status, // 'COMPLETED', 'STARTED', 'NOT_STARTED'
                difficulty: quest.difficulty, // 0-5 (Novice to Grandmaster)
                questPoints: quest.questPoints,
                members: quest.members,
                eligible: quest.eligible
            };
            
            // Calculate total quest points
            parsed.totalQuestPoints += quest.questPoints;
            
            // Categorize by status
            if (quest.status === 'COMPLETED') {
                parsed.completed.push(questInfo);
                parsed.questPointsEarned += quest.questPoints;
            } else if (quest.status === 'STARTED') {
                parsed.started.push(questInfo);
            } else {
                parsed.notStarted.push(questInfo);
            }
        });
        
        return parsed;
    }
    
    /**
     * Get complete player data
     */
    async getCompletePlayerData(username) {
        console.log(`🔄 Fetching complete data for ${username}...`);
        
        try {
            // Fetch both profile and quests
            const [profile, quests] = await Promise.all([
                this.getPlayerProfile(username),
                this.getPlayerQuests(username)
            ]);
            
            // Parse the data
            const parsedProfile = this.parseProfile(profile);
            const parsedQuests = this.parseQuests(quests);
            
            const completeData = {
                username: username,
                lastUpdated: new Date().toISOString(),
                profile: parsedProfile,
                quests: parsedQuests,
                raw: {
                    profile: profile,
                    quests: quests
                }
            };
            
            console.log(`✅ Complete data loaded for ${username}`);
            console.log(`   📊 Total Level: ${parsedProfile?.totalLevel || 0}`);
            console.log(`   ⭐ Quest Points: ${parsedQuests?.questPointsEarned || 0}/${parsedQuests?.totalQuestPoints || 0}`);
            console.log(`   ✅ Completed Quests: ${parsedQuests?.completed.length || 0}`);
            
            return completeData;
            
        } catch (error) {
            console.error(`❌ Error fetching complete data for ${username}:`, error.message);
            throw error;
        }
    }
    
    /**
     * Clear cache for a specific user
     */
    clearCache(username) {
        if (username) {
            this.cache.delete(`profile_${username}`);
            this.cache.delete(`quests_${username}`);
            console.log(`🗑️ Cache cleared for ${username}`);
        } else {
            this.cache.clear();
            console.log(`🗑️ All cache cleared`);
        }
    }
    
    /**
     * Check if username exists
     */
    async checkUsername(username) {
        try {
            await this.getPlayerProfile(username);
            return true;
        } catch (error) {
            return false;
        }
    }
}

/**
 * Map RuneScape difficulty numbers to names
 */
export function getDifficultyName(difficultyNum) {
    const difficultyMap = {
        0: 'Novice',
        1: 'Intermediate',
        2: 'Experienced',
        3: 'Master',
        4: 'Grandmaster',
        5: 'Special'
    };
    return difficultyMap[difficultyNum] || 'Unknown';
}

/**
 * Calculate quest points percentage
 */
export function calculateQuestProgress(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

/**
 * Get skill level from XP
 */
export function xpToLevel(xp) {
    let points = 0;
    for (let lvl = 1; lvl <= 120; lvl++) {
        points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
        if (xp < Math.floor(points / 4)) {
            return lvl;
        }
    }
    return 120;
}

/**
 * Check if profile is private
 */
export function isProfilePrivate(error) {
    return error.message && (
        error.message.includes('PROFILE_PRIVATE') ||
        error.message.includes('404') ||
        error.message.includes('NO PROFILE')
    );
}

// Export singleton instance
export default new RuneScapeAPI();
