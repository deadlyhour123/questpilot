/**
 * QuestPilot - Main Application
 * Level 3 to Trim Comp & 5.8B XP Tracker
 */

// ===== Import Chat Reader =====
import { ChatReader, findQuestInDatabase } from './chatReader.js';

// ===== Alt1 Detection =====
let alt1Available = false;
let chatReader = null;

if (window.alt1) {
    alt1Available = true;
    alt1.identifyAppUrl("./app.json");
    console.log("✅ Alt1 Toolkit detected!");
    updateStatus("✅ Alt1 Connected", "success");
} else {
    console.warn("⚠️ Alt1 Toolkit not detected. Some features will be limited.");
    updateStatus("⚠️ Alt1 Not Detected", "warning");
}

// ===== Application State =====
const AppState = {
    account: {
        name: null,
        isIronman: false,
        detected: false
    },
    progress: {
        questPoints: 0,
        totalQuestPoints: 448,
        totalLevel: 0,
        maxLevel: 3360, // 28 skills * 120
        achievements: 0,
        totalAchievements: 3200
    },
    skills: {},
    quests: {
        completed: [],
        inProgress: [],
        available: []
    },
    database: {
        quests: [],
        loaded: false
    },
    chatReader: {
        isMonitoring: false,
        lastMessage: null,
        messagesProcessed: 0
    }
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 QuestPilot initializing...");
    
    // Load saved data
    loadLocalData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load quest database
    loadQuestDatabase();
    
    // Start Alt1 monitoring (if available)
    if (alt1Available) {
        initializeChatReader();
    }
    
    // Update UI
    updateAllUI();
    
    console.log("✅ QuestPilot ready!");
});

// ===== Event Listeners =====
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Scan button
    document.getElementById('scan-btn')?.addEventListener('click', () => {
        scanProgress();
    });
    
    // Settings
    document.getElementById('save-account-btn')?.addEventListener('click', () => {
        saveManualAccountName();
    });
    
    document.getElementById('ironman-mode')?.addEventListener('change', (e) => {
        AppState.account.isIronman = e.target.checked;
        saveLocalData();
    });
    
    document.getElementById('export-data-btn')?.addEventListener('click', () => {
        exportData();
    });
    
    document.getElementById('clear-data-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            clearAllData();
        }
    });
    
    // Quest filters
    document.getElementById('quest-search')?.addEventListener('input', filterQuests);
    document.getElementById('difficulty-filter')?.addEventListener('change', filterQuests);
    document.getElementById('status-filter')?.addEventListener('change', filterQuests);
    document.getElementById('f2p-filter')?.addEventListener('change', filterQuests);
}

// ===== Chat Reader Integration =====
function initializeChatReader() {
    console.log("📖 Initializing Chat Reader...");
    
    chatReader = new ChatReader(
        onAccountDetected,
        onQuestComplete,
        onChatError
    );
    
    // Start monitoring automatically
    startChatMonitoring();
}

function startChatMonitoring() {
    if (!chatReader) {
        console.error("Chat reader not initialized");
        return;
    }
    
    try {
        chatReader.startMonitoring(1000); // Check every 1 second
        AppState.chatReader.isMonitoring = true;
        updateStatus("🔍 Monitoring Chat", "success");
        console.log("✅ Chat monitoring started");
        
        // Add activity log
        addActivityLog("Started monitoring game chat for updates");
    } catch (error) {
        console.error("Failed to start chat monitoring:", error);
        onChatError("Failed to start monitoring", error);
    }
}

function stopChatMonitoring() {
    if (chatReader) {
        chatReader.stopMonitoring();
        AppState.chatReader.isMonitoring = false;
        updateStatus("⏸️ Monitoring Paused", "warning");
        console.log("⏸️ Chat monitoring stopped");
    }
}

// ===== Chat Callbacks =====
function onAccountDetected(accountName) {
    console.log(`✅ Account detected: ${accountName}`);
    
    // Update app state
    AppState.account.name = accountName;
    AppState.account.detected = true;
    
    // Save to local storage
    saveLocalData();
    
    // Update UI
    updateAccountUI();
    
    // Add to activity feed
    addActivityLog(`Account detected: ${accountName}`);
    
    // Show notification
    showNotification(`Welcome, ${accountName}!`, 'success');
}

function onQuestComplete(questName) {
    console.log(`🎉 Quest completed: ${questName}`);
    
    // Try to find quest in database
    const quest = findQuestInDatabase(questName, AppState.database.quests);
    
    if (quest) {
        completeQuest(quest.name);
        
        // Show detailed notification
        showNotification(
            `Quest Complete: ${quest.name}! (+${quest.questPoints} QP)`,
            'success'
        );
        
        // Add to activity feed
        addActivityLog(
            `Completed: ${quest.name} (+${quest.questPoints} QP)`,
            'quest-complete'
        );
        
        // Update progress
        updateProgress();
        
    } else {
        // Quest not in database - add anyway
        console.warn(`Quest "${questName}" not found in database - adding manually`);
        completeQuestManual(questName);
        
        showNotification(`Quest Complete: ${questName}!`, 'success');
        addActivityLog(`Completed: ${questName}`, 'quest-complete');
    }
}

function onChatError(message, error) {
    console.error("Chat Error:", message, error);
    
    // Try to recover
    if (chatReader && chatReader.isMonitoring) {
        console.log("Attempting to recover chat reader...");
        chatReader.stopMonitoring();
        
        setTimeout(() => {
            chatReader.startMonitoring(1000);
        }, 2000);
    }
}

// ===== Quest Management =====
function completeQuest(questName) {
    // Check if already completed
    if (AppState.quests.completed.includes(questName)) {
        console.log(`Quest "${questName}" already marked as complete`);
        return;
    }
    
    // Find quest in database
    const quest = AppState.database.quests.find(q => q.name === questName);
    
    if (quest) {
        // Add to completed list
        AppState.quests.completed.push(questName);
        
        // Update quest points
        AppState.progress.questPoints += quest.questPoints;
        
        // Remove from in-progress if present
        AppState.quests.inProgress = AppState.quests.inProgress.filter(q => q !== questName);
        
        // Save data
        saveLocalData();
        
        // Update UI
        updateAllUI();
        
        // Check if new quests are now available
        checkNewlyAvailableQuests();
        
        console.log(`✅ Quest "${questName}" marked complete`);
    }
}

function completeQuestManual(questName) {
    // Add quest even if not in database
    if (!AppState.quests.completed.includes(questName)) {
        AppState.quests.completed.push(questName);
        saveLocalData();
        updateAllUI();
    }
}

function checkNewlyAvailableQuests() {
    const previouslyAvailable = AppState.quests.available.length;
    
    // Recalculate available quests
    updateAvailableQuests();
    
    const newlyAvailable = AppState.quests.available.length - previouslyAvailable;
    
    if (newlyAvailable > 0) {
        showNotification(
            `${newlyAvailable} new quest${newlyAvailable > 1 ? 's' : ''} unlocked!`,
            'info'
        );
    }
}

function updateAvailableQuests() {
    AppState.quests.available = AppState.database.quests
        .filter(quest => 
            !AppState.quests.completed.includes(quest.name) && 
            checkQuestRequirements(quest)
        )
        .map(q => q.name);
}

// ===== Data Management =====
function loadLocalData() {
    console.log("Loading saved data...");
    
    const saved = localStorage.getItem('questpilot-data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(AppState, data);
            console.log("✅ Loaded saved data");
        } catch (error) {
            console.error("Error loading saved data:", error);
        }
    }
}

function saveLocalData() {
    try {
        localStorage.setItem('questpilot-data', JSON.stringify(AppState));
        console.log("✅ Data saved");
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

function saveManualAccountName() {
    const input = document.getElementById('manual-account-name');
    const name = input.value.trim();
    
    if (name) {
        AppState.account.name = name;
        AppState.account.detected = true;
        saveLocalData();
        updateAccountUI();
        showNotification(`Account name saved: ${name}`, 'success');
    }
}

function exportData() {
    const data = JSON.stringify(AppState, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `questpilot-backup-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

function clearAllData() {
    localStorage.clear();
    location.reload();
}

// ===== Quest Database =====
async function loadQuestDatabase() {
    console.log("Loading quest database...");
    
    try {
        const response = await fetch('./data/quests.json');
        
        if (response.ok) {
            const quests = await response.json();
            AppState.database.quests = quests;
            AppState.database.loaded = true;
            console.log(`✅ Loaded ${quests.length} quests`);
            
            // Update available quests
            updateAvailableQuests();
            
            // Render quests
            renderQuests();
            updateRecommendations();
        } else {
            console.warn("⚠️ Quest database not found. Run: npm run scrape");
            showQuestDatabaseMessage();
        }
    } catch (error) {
        console.error("Error loading quest database:", error);
        showQuestDatabaseMessage();
    }
}

function showQuestDatabaseMessage() {
    const questList = document.getElementById('quest-list');
    if (questList) {
        questList.innerHTML = `
            <div class="loading-message">
                <h3>Quest Database Not Found</h3>
                <p>To populate the quest database, run:</p>
                <code>npm install</code><br>
                <code>npm run scrape</code>
                <p style="margin-top: 15px;">This will fetch all quest data from the RuneScape Wiki.</p>
            </div>
        `;
    }
}

// ===== Quest Rendering =====
function renderQuests() {
    const questList = document.getElementById('quest-list');
    if (!questList || !AppState.database.loaded) return;
    
    const quests = getFilteredQuests();
    
    if (quests.length === 0) {
        questList.innerHTML = '<div class="placeholder-text">No quests match your filters</div>';
        return;
    }
    
    questList.innerHTML = quests.map(quest => createQuestCard(quest)).join('');
    
    // Add click handlers
    questList.querySelectorAll('.quest-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            showQuestDetails(quests[index]);
        });
    });
}

function createQuestCard(quest) {
    const isCompleted = AppState.quests.completed.includes(quest.name);
    const canStart = checkQuestRequirements(quest);
    
    let statusClass = 'status-locked';
    let statusText = '🔒 Locked';
    
    if (isCompleted) {
        statusClass = 'status-completed';
        statusText = '✅ Complete';
    } else if (canStart) {
        statusClass = 'status-ready';
        statusText = '✅ Ready';
    }
    
    const f2pBadge = quest.members ? '' : '<span class="f2p-badge">F2P</span>';
    
    return `
        <div class="quest-item">
            <div class="quest-header">
                <div class="quest-title">${quest.name}</div>
                <div class="quest-status ${statusClass}">${statusText}</div>
            </div>
            <div class="quest-meta">
                <span>📊 ${quest.difficulty || 'Unknown'}</span>
                <span>⏱️ ${quest.length || 'Unknown'}</span>
                <span>⭐ ${quest.questPoints} QP</span>
                ${f2pBadge}
            </div>
        </div>
    `;
}

function getFilteredQuests() {
    let quests = AppState.database.quests;
    
    // Search filter
    const search = document.getElementById('quest-search')?.value.toLowerCase();
    if (search) {
        quests = quests.filter(q => q.name.toLowerCase().includes(search));
    }
    
    // Difficulty filter
    const difficulty = document.getElementById('difficulty-filter')?.value;
    if (difficulty && difficulty !== 'all') {
        quests = quests.filter(q => q.difficulty?.toLowerCase() === difficulty);
    }
    
    // Status filter
    const status = document.getElementById('status-filter')?.value;
    if (status && status !== 'all') {
        quests = quests.filter(q => {
            const completed = AppState.quests.completed.includes(q.name);
            const ready = checkQuestRequirements(q);
            
            if (status === 'completed') return completed;
            if (status === 'ready') return !completed && ready;
            if (status === 'locked') return !completed && !ready;
            return true;
        });
    }
    
    // F2P filter
    const f2pOnly = document.getElementById('f2p-filter')?.checked;
    if (f2pOnly) {
        quests = quests.filter(q => !q.members);
    }
    
    return quests;
}

function filterQuests() {
    renderQuests();
}

function checkQuestRequirements(quest) {
    // Check skill requirements
    if (quest.requirements?.skills) {
        for (const req of quest.requirements.skills) {
            const currentLevel = AppState.skills[req.skill]?.level || 1;
            if (currentLevel < req.level) {
                return false;
            }
        }
    }
    
    // Check quest requirements
    if (quest.requirements?.quests) {
        for (const reqQuest of quest.requirements.quests) {
            if (!AppState.quests.completed.includes(reqQuest)) {
                return false;
            }
        }
    }
    
    return true;
}

function showQuestDetails(quest) {
    const completed = AppState.quests.completed.includes(quest.name);
    const canStart = checkQuestRequirements(quest);
    
    let reqText = 'None';
    if (quest.requirements) {
        const reqs = [];
        if (quest.requirements.skills?.length > 0) {
            reqs.push('Skills: ' + quest.requirements.skills.map(s => `${s.skill} ${s.level}`).join(', '));
        }
        if (quest.requirements.quests?.length > 0) {
            reqs.push('Quests: ' + quest.requirements.quests.length);
        }
        if (reqs.length > 0) {
            reqText = reqs.join('\n');
        }
    }
    
    alert(`Quest Details:\n\n${quest.name}\n\nDifficulty: ${quest.difficulty}\nLength: ${quest.length}\nQuest Points: ${quest.questPoints}\n\nRequirements:\n${reqText}\n\nStatus: ${completed ? 'Completed' : canStart ? 'Ready to start' : 'Locked'}\n\nFull quest guide coming in v0.2!`);
}

// ===== Recommendations =====
function updateRecommendations() {
    const container = document.getElementById('recommendations');
    if (!container) return;
    
    const recommendations = generateRecommendations();
    
    if (recommendations.length === 0) {
        container.innerHTML = '<div class="placeholder-text">No recommendations available yet</div>';
        return;
    }
    
    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <span class="rec-icon">${rec.icon}</span>
            <div class="rec-content">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
            </div>
        </div>
    `).join('');
}

function generateRecommendations() {
    const recs = [];
    
    // Check if account is set up
    if (!AppState.account.detected) {
        recs.push({
            icon: '👤',
            title: 'Set up your account',
            description: 'Log in to RuneScape and QuestPilot will auto-detect your account, or manually enter it in Settings'
        });
        return recs; // Return early - other recommendations need account
    }
    
    // Check if chat monitoring is active
    if (alt1Available && !AppState.chatReader.isMonitoring) {
        recs.push({
            icon: '📖',
            title: 'Chat monitoring paused',
            description: 'Click "Scan Progress" to resume automatic tracking'
        });
    }
    
    // Find available quests
    if (AppState.database.loaded && AppState.quests.available.length > 0) {
        const topQuests = AppState.database.quests
            .filter(q => AppState.quests.available.includes(q.name))
            .sort((a, b) => {
                // Sort by difficulty, then quest points
                const diffOrder = ['Novice', 'Intermediate', 'Experienced', 'Master', 'Grandmaster'];
                return diffOrder.indexOf(a.difficulty) - diffOrder.indexOf(b.difficulty);
            })
            .slice(0, 3);
        
        topQuests.forEach(quest => {
            recs.push({
                icon: '✅',
                title: quest.name,
                description: `${quest.questPoints} QP | ${quest.difficulty} | ${quest.length}`
            });
        });
    } else if (AppState.database.loaded) {
        recs.push({
            icon: '🎉',
            title: 'All available quests complete!',
            description: 'Train some skills to unlock more quests'
        });
    }
    
    return recs;
}

// ===== Activity Feed =====
function addActivityLog(message, type = 'info') {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;
    
    // Remove placeholder if present
    const placeholder = feed.querySelector('.placeholder-text');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Create activity item
    const item = document.createElement('div');
    item.className = `activity-item activity-${type}`;
    item.innerHTML = `
        <span class="activity-time">${new Date().toLocaleTimeString()}</span>
        <span class="activity-text">${message}</span>
    `;
    
    // Add to top of feed
    feed.insertBefore(item, feed.firstChild);
    
    // Keep only last 10 items
    while (feed.children.length > 10) {
        feed.removeChild(feed.lastChild);
    }
}

// ===== Progress Scanning =====
async function scanProgress() {
    console.log("🔍 Scanning progress...");
    
    if (!alt1Available) {
        showNotification("Alt1 Toolkit is required for automatic progress scanning", 'warning');
        return;
    }
    
    updateStatus("🔍 Scanning...", "info");
    
    // If chat reader not initialized, initialize it
    if (!chatReader) {
        initializeChatReader();
    } else if (!AppState.chatReader.isMonitoring) {
        // Restart monitoring if stopped
        startChatMonitoring();
    }
    
    // Try to read chat immediately
    if (chatReader) {
        await chatReader.readOnce();
        showNotification('Chat scan complete! Monitoring for updates...', 'success');
    }
    
    updateStatus("✅ Monitoring Active", "success");
    updateAllUI();
}

// ===== UI Updates =====
function updateAllUI() {
    updateAccountUI();
    updateProgressUI();
    updateRecommendations();
}

function updateAccountUI() {
    const nameEl = document.getElementById('account-name');
    if (nameEl) {
        nameEl.textContent = AppState.account.name || 'Not detected';
    }
    
    const qpEl = document.getElementById('quest-points');
    if (qpEl) {
        qpEl.textContent = `QP: ${AppState.progress.questPoints}/${AppState.progress.totalQuestPoints}`;
    }
    
    const levelEl = document.getElementById('total-level');
    if (levelEl) {
        levelEl.textContent = `Total: ${AppState.progress.totalLevel}`;
    }
}

function updateProgress() {
    // Recalculate total quest points
    AppState.progress.questPoints = 0;
    AppState.quests.completed.forEach(questName => {
        const quest = AppState.database.quests.find(q => q.name === questName);
        if (quest) {
            AppState.progress.questPoints += quest.questPoints;
        }
    });
    
    saveLocalData();
    updateProgressUI();
}

function updateProgressUI() {
    // Quest Points progress
    updateProgressBar('qp', AppState.progress.questPoints, AppState.progress.totalQuestPoints);
    
    // Total Level progress
    updateProgressBar('level', AppState.progress.totalLevel, AppState.progress.maxLevel);
    
    // Achievements progress
    updateProgressBar('achieve', AppState.progress.achievements, AppState.progress.totalAchievements);
}

function updateProgressBar(id, current, max) {
    const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
    
    const bar = document.getElementById(`${id}-progress`);
    const text = document.getElementById(`${id}-text`);
    
    if (bar) {
        bar.style.width = `${percentage}%`;
    }
    
    if (text) {
        text.textContent = `${current} / ${max} (${percentage}%)`;
    }
}

function updateStatus(message, type) {
    const statusEl = document.getElementById('alt1-status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status-badge status-${type}`;
    }
}

// ===== Notifications =====
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // For now, just log to console
    // In future, could create a toast notification system
    addActivityLog(message, type);
}

// ===== Tab Switching =====
function switchTab(tabName) {
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update content visibility
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `${tabName}-tab`);
    });
}

// ===== Utility Functions =====
function xpToLevel(xp) {
    let points = 0;
    for (let lvl = 1; lvl <= 120; lvl++) {
        points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
        if (xp < Math.floor(points / 4)) {
            return lvl;
        }
    }
    return 120;
}

function levelToXp(level) {
    let xp = 0;
    for (let lvl = 1; lvl < level; lvl++) {
        xp += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
    }
    return Math.floor(xp / 4);
}

// ===== Export for debugging =====
window.QuestPilot = {
    state: AppState,
    chatReader: chatReader,
    scanProgress,
    loadQuestDatabase,
    updateAllUI,
    startChatMonitoring,
    stopChatMonitoring,
    completeQuest: completeQuestManual
};

console.log("💡 Debug: Access app state via window.QuestPilot");
