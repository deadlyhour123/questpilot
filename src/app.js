/**
 * QuestPilot - Main Application
 * Level 3 to Trim Comp & 5.8B XP Tracker
 */

// ===== Alt1 Detection =====
let alt1Available = false;

if (window.alt1) {
    alt1Available = true;
    alt1.identifyAppUrl("./app.json");
    console.log("✅ Alt1 Toolkit detected!");
    updateStatus("✅ Alt1 Connected", "success");
} else {
    console.warn("⚠️ Alt1 Toolkit not detected. Some features will be limited.");
    updateStatus("⚠️ Alt1 Not Detected", "warning");
}

// ===== Import Alt1 Libraries (when available) =====
let ChatBox, a1lib;

if (alt1Available) {
    try {
        // These imports work when running in Alt1
        // For now, we'll handle them conditionally
        console.log("Loading Alt1 libraries...");
    } catch (error) {
        console.error("Error loading Alt1 libraries:", error);
    }
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
        startAlt1Monitoring();
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

// ===== Alt1 Integration =====
function startAlt1Monitoring() {
    console.log("Starting Alt1 monitoring...");
    
    // Try to detect account name from chat
    detectAccountName();
    
    // Monitor chat for quest completions
    startChatMonitoring();
    
    // Monitor XP gains
    startXPMonitoring();
}

async function detectAccountName() {
    if (!alt1Available) return;
    
    try {
        // This would use Alt1's chat reading capability
        // For now, we'll simulate it
        console.log("Attempting to detect account name from chat...");
        
        // In production, this would read the chat for "Welcome to RuneScape, Username!"
        // and extract the username
        
    } catch (error) {
        console.error("Error detecting account name:", error);
    }
}

function startChatMonitoring() {
    if (!alt1Available) return;
    
    console.log("Monitoring chat for quest completions...");
    
    // This would monitor chat messages for quest completion
    setInterval(() => {
        checkForQuestCompletion();
    }, 2000);
}

function checkForQuestCompletion() {
    // In production, this would read chat for:
    // "Congratulations! You have completed [Quest Name]!"
    
    // For now, this is a placeholder
}

function startXPMonitoring() {
    if (!alt1Available) return;
    
    console.log("Monitoring XP gains...");
    
    // This would use Alt1's XP tracker
    // When XP is gained, calculate new levels and update UI
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
        alert(`Account name saved: ${name}`);
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
    
    const f2pBadge = quest.members ? '' : '<span style="color: #27ae60; font-weight: bold;">F2P</span>';
    
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
            const currentLevel = AppState.skills[req.skill] || 1;
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
    alert(`Quest Details:\n\n${quest.name}\n\nDifficulty: ${quest.difficulty}\nLength: ${quest.length}\nQuest Points: ${quest.questPoints}\n\nFull quest guide coming in v0.2!`);
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
            description: 'Click "Scan Progress" or manually enter your account name in Settings'
        });
    }
    
    // Find available quests
    if (AppState.database.loaded) {
        const availableQuests = AppState.database.quests.filter(q => 
            !AppState.quests.completed.includes(q.name) && checkQuestRequirements(q)
        );
        
        if (availableQuests.length > 0) {
            const topQuests = availableQuests.slice(0, 3);
            topQuests.forEach(quest => {
                recs.push({
                    icon: '✅',
                    title: quest.name,
                    description: `${quest.questPoints} QP | ${quest.difficulty} | ${quest.length}`
                });
            });
        }
    }
    
    return recs;
}

// ===== Progress Scanning =====
async function scanProgress() {
    console.log("🔍 Scanning progress...");
    
    if (!alt1Available) {
        alert("Alt1 Toolkit is required for automatic progress scanning.\n\nYou can manually enter your stats in the Settings tab.");
        return;
    }
    
    updateStatus("🔍 Scanning...", "info");
    
    // In production, this would:
    // 1. Read chat for account name
    // 2. Scan skills tab for all levels
    // 3. Read quest log for completed quests
    // 4. Calculate total progress
    
    // For now, simulate a scan
    await simulateScan();
}

async function simulateScan() {
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate finding account name
    if (!AppState.account.name) {
        AppState.account.name = "IronPlayer123";
        AppState.account.detected = true;
    }
    
    // Update UI
    updateAllUI();
    updateStatus("✅ Scan Complete", "success");
    
    alert("Scan complete!\n\nIn the full version, this will read your actual game stats using Alt1.");
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
    }
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
    scanProgress,
    loadQuestDatabase,
    updateAllUI
};

console.log("💡 Debug: Access app state via window.QuestPilot");
