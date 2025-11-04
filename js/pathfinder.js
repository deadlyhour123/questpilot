// Pathfinder Module
// Calculates optimal quest paths based on Project Tenacity principles

const Pathfinder = {
    
    // Calculate optimal quest path from current state to goal
    calculateOptimalPath(currentState, goal, accountMode) {
        console.log(`Calculating path for ${accountMode} account to ${goal}`);
        
        const { stats, completedQuests } = currentState;
        
        // Get all available quests
        const availableQuests = this.getAvailableQuests(stats, completedQuests);
        
        // Score each quest
        const scoredQuests = availableQuests.map(quest => ({
            ...quest,
            score: this.calculateQuestScore(quest, stats, goal, accountMode)
        }));
        
        // Sort by score (highest first)
        scoredQuests.sort((a, b) => b.score - a.score);
        
        return scoredQuests;
    },
    
    // Get quests that player can currently start
    getAvailableQuests(stats, completedQuests) {
        return QuestData.quests.filter(quest => {
            // Check if already completed
            if (completedQuests.includes(quest.id)) return false;
            
            // Check skill requirements
            for (const [skill, level] of Object.entries(quest.requirements.skills || {})) {
                if ((stats[skill] || 1) < level) return false;
            }
            
            // Check quest prerequisites
            for (const requiredQuest of quest.requirements.quests || []) {
                if (!completedQuests.includes(requiredQuest)) return false;
            }
            
            return true;
        });
    },
    
    // Calculate efficiency score for a quest
    calculateQuestScore(quest, stats, goal, accountMode) {
        let score = 0;
        
        // 1. Quest Points Value
        score += quest.questPoints * 10;
        
        // 2. XP Reward Value (helps with future requirements)
        const xpValue = this.calculateXPValue(quest.rewards.xp, stats);
        score += xpValue;
        
        // 3. Unlock Value (teleports, areas, items)
        const unlockValue = this.calculateUnlockValue(quest.rewards.unlocks, goal);
        score += unlockValue;
        
        // 4. Time Efficiency (reward per minute)
        const timeEfficiency = score / (quest.timeEstimate || 30);
        score += timeEfficiency * 5;
        
        // 5. Quest Chain Value (unlocks other quests)
        const chainValue = this.calculateChainValue(quest.id);
        score += chainValue;
        
        // 6. Ironman Adjustments
        if (accountMode === 'ironman' || accountMode === 'hardcore') {
            score += this.getIronmanBonus(quest);
        }
        
        // 7. Goal-specific bonuses
        score += this.getGoalBonus(quest, goal);
        
        return score;
    },
    
    // Calculate value of XP rewards
    calculateXPValue(xpRewards, currentStats) {
        let value = 0;
        
        for (const [skill, xp] of Object.entries(xpRewards || {})) {
            const currentLevel = currentStats[skill] || 1;
            
            // Higher value for lower level skills
            const levelMultiplier = Math.max(1, 100 - currentLevel) / 10;
            value += xp * levelMultiplier;
        }
        
        return value / 1000; // Scale down
    },
    
    // Calculate value of quest unlocks
    calculateUnlockValue(unlocks, goal) {
        if (!unlocks || unlocks.length === 0) return 0;
        
        let value = 0;
        
        unlocks.forEach(unlock => {
            // Teleports are valuable
            if (unlock.includes('teleport') || unlock.includes('lodestone')) {
                value += 20;
            }
            
            // Area unlocks are valuable
            if (unlock.includes('area') || unlock.includes('access')) {
                value += 15;
            }
            
            // Training methods are valuable
            if (unlock.includes('training') || unlock.includes('method')) {
                value += 10;
            }
        });
        
        return value;
    },
    
    // Calculate value of unlocking other quests
    calculateChainValue(questId) {
        // Count how many quests require this one
        const dependentQuests = QuestData.quests.filter(q => 
            q.requirements.quests?.includes(questId)
        );
        
        return dependentQuests.length * 15;
    },
    
    // Ironman-specific bonuses
    getIronmanBonus(quest) {
        let bonus = 0;
        
        // Favor quests that give useful items for ironmen
        if (quest.rewards.items?.length > 0) {
            bonus += 10;
        }
        
        // Favor quests that unlock training methods
        if (quest.rewards.unlocks?.some(u => 
            u.includes('shop') || u.includes('training') || u.includes('resource')
        )) {
            bonus += 15;
        }
        
        return bonus;
    },
    
    // Goal-specific bonuses
    getGoalBonus(quest, goal) {
        switch(goal) {
            case 'quest-cape':
                // All quests equally important
                return 5;
            
            case 'comp-cape':
                // Favor quests that unlock comp requirements
                if (quest.rewards.unlocks?.some(u => 
                    u.includes('comp') || u.includes('achievement')
                )) {
                    return 25;
                }
                return 10;
            
            case 'max-cape':
                // Favor quests with good XP rewards
                const totalXP = Object.values(quest.rewards.xp || {})
                    .reduce((sum, xp) => sum + xp, 0);
                return totalXP / 10000;
            
            default:
                return 0;
        }
    },
    
    // Get recommended quest path (top N quests)
    getRecommendedPath(currentState, goal, accountMode, count = 5) {
        const allPaths = this.calculateOptimalPath(currentState, goal, accountMode);
        return allPaths.slice(0, count);
    },
    
    // Estimate time to goal
    estimateTimeToGoal(currentState, goal) {
        const remainingQuests = QuestData.quests.filter(q => 
            !currentState.completedQuests.includes(q.id)
        );
        
        const totalMinutes = remainingQuests.reduce((sum, q) => 
            sum + (q.timeEstimate || 30), 0
        );
        
        const hours = Math.round(totalMinutes / 60);
        
        if (hours < 24) return `${hours}h`;
        if (hours < 168) return `${Math.round(hours / 24)}d`;
        return `${Math.round(hours / 168)}w`;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pathfinder;
}
