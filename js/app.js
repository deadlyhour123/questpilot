// QuestPilot - Main Application JavaScript

// ===== GLOBAL STATE =====
const AppState = {
    currentTab: 'fresh-account',
    playerName: null,
    accountMode: 'regular', // regular, ironman, hardcore
    selectedGoal: 'quest-cape', // quest-cape, comp-cape, max-cape
    completedQuests: [],
    currentStats: {},
    questDatabase: [],
    settings: {
        showOverlay: true,
        autoSync: true,
        notifications: false,
        freshAccountMode: true
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('QuestPilot initializing...');
    
    // Load saved data
    loadFromStorage();
    
    // Initialize UI
    initializeTabs();
    initializeFilters();
    initializeModeCards();
    initializeButtons();
    
    // Detect player name (will use saved name if available)
    setTimeout(() => {
        detectPlayerName();
    }, 500);
    
    // Load quest data
    loadQuestData();
    
    console.log('QuestPilot ready!');
});

// ===== TAB SYSTEM =====
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            AppState.currentTab = targetTab;
            
            // Load tab-specific content
            onTabChange(targetTab);
        });
    });
}

function onTabChange(tabName) {
    console.log(`Switched to tab: ${tabName}`);
    
    switch(tabName) {
        case 'fresh-account':
            updateFreshAccountMode();
            break;
        case 'quests':
            refreshQuestList();
            break;
        case 'progress':
            updateProgressDisplay();
            break;
        case 'pathfinder':
            updatePathfinder();
            break;
        case 'settings':
            updateSettingsDisplay();
            break;
    }
}

// ===== MODE SELECTION =====
function initializeModeCards() {
    // Account mode cards
    document.querySelectorAll('.mode-card[data-mode]').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            
            // Update active state
            document.querySelectorAll('.mode-card[data-mode]').forEach(c => 
                c.classList.remove('active')
            );
            card.classList.add('active');
            
            // Update app state
            AppState.accountMode = mode;
            updateAccountMode(mode);
            
            // Show notification
            showNotification(`Switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} mode`, 'success');
        });
    });
    
    // Goal cards
    document.querySelectorAll('.mode-card[data-goal]').forEach(card => {
        card.addEventListener('click', () => {
            const goal = card.dataset.goal;
            
            // Update active state
            document.querySelectorAll('.mode-card[data-goal]').forEach(c => 
                c.classList.remove('active')
            );
            card.classList.add('active');
            
            // Update app state
            AppState.selectedGoal = goal;
            updateSelectedGoal(goal);
            
            // Show notification
            showNotification(`Goal set to ${goal.replace('-', ' ')}`, 'success');
        });
    });
}

function updateAccountMode(mode) {
    console.log(`Account mode changed to: ${mode}`);
    document.getElementById('accountMode').textContent = 
        mode.charAt(0).toUpperCase() + mode.slice(1);
    
    // Recalculate quest path based on mode
    if (AppState.currentTab === 'fresh-account') {
        calculateOptimalPath();
    }
    
    saveToStorage();
}

function updateSelectedGoal(goal) {
    console.log(`Goal changed to: ${goal}`);
    document.getElementById('selectedGoal').textContent = 
        goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Recalculate quest path based on goal
    if (AppState.currentTab === 'fresh-account') {
        calculateOptimalPath();
    }
    
    saveToStorage();
}

// ===== FILTER SYSTEM =====
function initializeFilters() {
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(btn => 
                btn.classList.remove('active')
            );
            button.classList.add('active');
            
            // Apply filter
            filterQuests(filter);
        });
    });
}

function filterQuests(filter) {
    console.log(`Filtering quests by: ${filter}`);
    
    const questCards = document.querySelectorAll('.quest-card');
    let visibleCount = 0;
    
    questCards.forEach(card => {
        let shouldShow = false;
        
        switch(filter) {
            case 'all':
                shouldShow = true;
                break;
            case 'available':
                shouldShow = !card.classList.contains('completed');
                break;
            case 'completed':
                shouldShow = card.classList.contains('completed');
                break;
            case 'f2p':
                shouldShow = card.dataset.members === 'false';
                break;
        }
        
        card.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    document.getElementById('questCount').textContent = 
        `Showing ${visibleCount} quest${visibleCount !== 1 ? 's' : ''}`;
}

// ===== BUTTON HANDLERS =====
function initializeButtons() {
    // Refresh player name
    document.getElementById('refreshBtn')?.addEventListener('click', detectPlayerName);
    
    // Make player info clickable
    document.getElementById('playerInfo')?.addEventListener('click', (e) => {
        // Don't trigger if clicking the refresh button
        if (!e.target.closest('.refresh-btn')) {
            detectPlayerName();
        }
    });
    
    // Fresh Account Mode
    document.getElementById('importProgressBtn')?.addEventListener('click', importFromRuneMetrics);
    document.getElementById('recalculatePathBtn')?.addEventListener('click', calculateOptimalPath);
    
    // Progress tab
    document.getElementById('syncProgressBtn')?.addEventListener('click', syncProgress);
    document.getElementById('resetProgressBtn')?.addEventListener('click', resetProgress);
    
    // Pathfinder tab
    document.getElementById('detectStatsBtn')?.addEventListener('click', detectStats);
    document.getElementById('manualStatsBtn')?.addEventListener('click', enterStatsManually);
    
    // Settings
    document.getElementById('exportDataBtn')?.addEventListener('click', exportData);
    document.getElementById('importDataBtn')?.addEventListener('click', importData);
    document.getElementById('clearDataBtn')?.addEventListener('click', clearAllData);
    
    // Quest search
    const searchInput = document.getElementById('questSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', () => searchQuests(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchQuests(searchInput.value);
        });
    }
}

// ===== PLAYER NAME DETECTION =====
async function detectPlayerName() {
    console.log('Detecting player name...');
    
    // First, check if we have a saved username
    if (AppState.playerName && AppState.playerName !== 'Alt1User') {
        console.log('Using saved username:', AppState.playerName);
        updatePlayerNameDisplay();
        return;
    }
    
    // Try to detect from Alt1 screen reading
    let detectedName = null;
    
    if (window.alt1) {
        try {
            // Try to read username from game interface
            // This would require finding the username text on screen
            // For now, we'll skip this and go straight to manual entry
            console.log('Alt1 detected, but automatic username reading not implemented yet');
        } catch (e) {
            console.error('Alt1 detection failed:', e);
        }
    }
    
    // If no name detected, prompt user to enter it
    if (!detectedName) {
        const savedName = AppState.playerName;
        const defaultName = (savedName && savedName !== 'Alt1User') ? savedName : '';
        
        const name = prompt(
            'Enter your RuneScape username:\n\n' +
            '(This will be used to fetch your stats from RuneMetrics)\n\n' +
            'Your username:',
            defaultName
        );
        
        if (name && name.trim()) {
            AppState.playerName = name.trim();
        } else if (!AppState.playerName) {
            AppState.playerName = 'Guest';
        }
    } else {
        AppState.playerName = detectedName;
    }
    
    // Update UI
    updatePlayerNameDisplay();
    
    // Save to storage
    saveToStorage();
    
    // If we have a valid name, try to load their data
    if (AppState.playerName && AppState.playerName !== 'Guest') {
        showNotification('Loading player data...', 'info');
        try {
            await loadPlayerData(AppState.playerName);
        } catch (error) {
            console.error('Failed to load player data:', error);
            showNotification('Could not load player data. Check username and try again.', 'warning');
        }
    }
}

function updatePlayerNameDisplay() {
    const playerNameElements = document.querySelectorAll('#playerName, #settingsPlayerName');
    const playerInfo = document.getElementById('playerInfo');
    const playerAvatar = document.getElementById('playerAvatar');
    
    const displayName = AppState.playerName || 'Click to set →';
    const isSet = AppState.playerName && 
                  AppState.playerName !== 'Guest' && 
                  AppState.playerName !== 'Alt1User' &&
                  AppState.playerName !== 'Click to set →';
    
    playerNameElements.forEach(el => {
        el.textContent = displayName;
    });
    
    // Add visual indicator if not set
    if (playerInfo) {
        if (isSet) {
            playerInfo.classList.remove('unset');
            playerInfo.title = 'Click to change username or refresh data';
        } else {
            playerInfo.classList.add('unset');
            playerInfo.title = 'Click to enter your RuneScape username';
        }
    }
    
    // Update avatar
    if (playerAvatar && isSet) {
        // Could show first letter of username
        playerAvatar.textContent = AppState.playerName.charAt(0).toUpperCase();
    }
}

// ===== RUNEMETRICS API INTEGRATION =====
async function loadPlayerData(username) {
    console.log(`Loading data for: ${username}`);
    
    try {
        // Fetch profile data
        const profileResponse = await fetch(
            `https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(username)}&activities=0`
        );
        const profileData = await profileResponse.json();
        
        // Update stats
        if (profileData.totalskill) {
            document.getElementById('totalLevel').textContent = profileData.totalskill;
            document.getElementById('apiTotalLevel').textContent = profileData.totalskill;
            AppState.currentStats.totalLevel = profileData.totalskill;
        }
        
        if (profileData.questscomplete) {
            document.getElementById('apiQuestsComplete').textContent = profileData.questscomplete;
            document.getElementById('questsDone').textContent = 
                `${profileData.questscomplete} / 268`;
            AppState.completedQuests = profileData.questscomplete;
        }
        
        // Fetch quest data
        const questsResponse = await fetch(
            `https://apps.runescape.com/runemetrics/quests?user=${encodeURIComponent(username)}`
        );
        const questsData = await questsResponse.json();
        
        // Count quest points
        let questPoints = 0;
        questsData.forEach(quest => {
            if (quest.status === 'COMPLETED') {
                questPoints += quest.questPoints || 0;
            }
        });
        
        document.getElementById('apiQuestPoints').textContent = questPoints;
        
        // Update last sync time
        const now = new Date().toLocaleString();
        document.querySelectorAll('#lastSync, #lastUpdated').forEach(el => {
            el.textContent = now;
        });
        
        showNotification('Successfully loaded player data!', 'success');
        
        saveToStorage();
        
    } catch (error) {
        console.error('Error loading player data:', error);
        showNotification('Failed to load player data. Check username and try again.', 'error');
    }
}

// ===== FRESH ACCOUNT MODE =====
function updateFreshAccountMode() {
    console.log('Updating Fresh Account Mode...');
    
    // Calculate optimal path
    calculateOptimalPath();
}

function calculateOptimalPath() {
    console.log('Calculating optimal quest path...');
    
    const nextQuestDiv = document.getElementById('nextQuest');
    const recommendedPathDiv = document.getElementById('recommendedPath');
    
    // Show loading state
    nextQuestDiv.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Calculating optimal path...</p>
        </div>
    `;
    
    // Simulate calculation (would use real algorithm)
    setTimeout(() => {
        // Mock next quest
        nextQuestDiv.innerHTML = `
            <div class="quest-card" style="margin-bottom: 0;">
                <div class="quest-card-header">
                    <div>
                        <div class="quest-name">Cook's Assistant</div>
                        <span class="quest-difficulty difficulty-novice">Novice</span>
                    </div>
                    <div class="quest-points">★ 1</div>
                </div>
                <div class="quest-requirements">
                    <strong>Why now?</strong> No requirements, quick completion, unlocks Lumbridge cooking facilities
                </div>
                <div style="margin-top: 12px;">
                    <button class="btn btn-primary" onclick="startQuest('cooks-assistant')">
                        Start Quest Guide
                    </button>
                </div>
            </div>
        `;
        
        // Mock quest path
        recommendedPathDiv.innerHTML = `
            ${generateQuestCard('Romeo & Juliet', 'novice', 5, 'None')}
            ${generateQuestCard('Sheep Shearer', 'novice', 1, 'None')}
            ${generateQuestCard('Rune Mysteries', 'novice', 1, 'None')}
            ${generateQuestCard('The Restless Ghost', 'novice', 1, 'None')}
            ${generateQuestCard('Ernest the Chicken', 'novice', 4, 'None')}
        `;
        
        // Update time estimate
        document.getElementById('timeToGoal').textContent = '~150h';
        
    }, 1500);
}

function generateQuestCard(name, difficulty, points, requirements) {
    return `
        <div class="quest-card">
            <div class="quest-card-header">
                <div>
                    <div class="quest-name">${name}</div>
                    <span class="quest-difficulty difficulty-${difficulty}">${difficulty}</span>
                </div>
                <div class="quest-points">★ ${points}</div>
            </div>
            <div class="quest-requirements">
                <strong>Requirements:</strong> ${requirements}
            </div>
        </div>
    `;
}

function startQuest(questId) {
    console.log(`Starting quest: ${questId}`);
    showNotification('Quest guide feature coming soon!', 'info');
}

// ===== QUEST LIST =====
function loadQuestData() {
    console.log('Loading quest database...');
    
    // This would load from the quest database
    // For now, the sample quests in HTML will suffice
    
    refreshQuestList();
}

function refreshQuestList() {
    console.log('Refreshing quest list...');
    // Would filter and update the quest list
}

function searchQuests(query) {
    console.log(`Searching quests: ${query}`);
    
    if (!query) {
        filterQuests('all');
        return;
    }
    
    const questCards = document.querySelectorAll('.quest-card');
    let visibleCount = 0;
    
    questCards.forEach(card => {
        const questName = card.querySelector('.quest-name')?.textContent.toLowerCase() || '';
        const shouldShow = questName.includes(query.toLowerCase());
        
        card.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    document.getElementById('questCount').textContent = 
        `Showing ${visibleCount} quest${visibleCount !== 1 ? 's' : ''}`;
}

// ===== PROGRESS TRACKING =====
function updateProgressDisplay() {
    console.log('Updating progress display...');
    
    // Calculate completion percentage
    const completed = AppState.completedQuests.length || 0;
    const total = 268;
    const percentage = Math.round((completed / total) * 100);
    
    // Update UI
    document.getElementById('localQuestCount').textContent = `${completed} / ${total}`;
    document.getElementById('completionPercent').textContent = `${percentage}%`;
    document.getElementById('progressPercent').textContent = `${percentage}%`;
    document.getElementById('progressFill').style.width = `${percentage}%`;
}

async function syncProgress() {
    if (!AppState.playerName) {
        showNotification('Please set your username first!', 'warning');
        return;
    }
    
    showNotification('Syncing with RuneMetrics...', 'info');
    await loadPlayerData(AppState.playerName);
    updateProgressDisplay();
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        AppState.completedQuests = [];
        AppState.currentStats = {};
        saveToStorage();
        updateProgressDisplay();
        showNotification('Progress reset successfully', 'success');
    }
}

// ===== PATHFINDER =====
function updatePathfinder() {
    console.log('Updating pathfinder...');
}

function detectStats() {
    console.log('Detecting stats from game...');
    showNotification('Stat detection feature coming soon!', 'info');
}

function enterStatsManually() {
    console.log('Manual stat entry...');
    showNotification('Manual stat entry feature coming soon!', 'info');
}

// ===== IMPORT/EXPORT =====
async function importFromRuneMetrics() {
    if (!AppState.playerName) {
        await detectPlayerName();
    }
    
    if (AppState.playerName) {
        await loadPlayerData(AppState.playerName);
        calculateOptimalPath();
    }
}

function exportData() {
    const data = JSON.stringify(AppState, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questpilot-data-${Date.now()}.json`;
    a.click();
    
    showNotification('Data exported successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                Object.assign(AppState, data);
                saveToStorage();
                showNotification('Data imported successfully!', 'success');
                updateProgressDisplay();
            } catch (error) {
                showNotification('Invalid data file!', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
}

// ===== STORAGE =====
function saveToStorage() {
    try {
        localStorage.setItem('questpilot-state', JSON.stringify(AppState));
    } catch (e) {
        console.error('Failed to save to storage:', e);
    }
}

function loadFromStorage() {
    try {
        const saved = localStorage.getItem('questpilot-state');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(AppState, data);
            console.log('Loaded saved state');
        }
    } catch (e) {
        console.error('Failed to load from storage:', e);
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: var(--bg-secondary);
        border: 2px solid var(--border-light);
        border-radius: 10px;
        color: var(--text-primary);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set color based on type
    const colors = {
        success: 'var(--accent-green)',
        error: 'var(--accent-red)',
        warning: 'var(--accent-gold)',
        info: 'var(--accent-blue)'
    };
    notification.style.borderLeftColor = colors[type] || colors.info;
    notification.style.borderLeftWidth = '4px';
    
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== SETTINGS =====
function updateSettingsDisplay() {
    // Update checkboxes from state
    document.getElementById('showOverlay').checked = AppState.settings.showOverlay;
    document.getElementById('autoSync').checked = AppState.settings.autoSync;
    document.getElementById('notifications').checked = AppState.settings.notifications;
    document.getElementById('freshAccountMode').checked = AppState.settings.freshAccountMode;
    
    // Add change listeners
    ['showOverlay', 'autoSync', 'notifications', 'freshAccountMode'].forEach(id => {
        const checkbox = document.getElementById(id);
        checkbox.addEventListener('change', () => {
            AppState.settings[id] = checkbox.checked;
            saveToStorage();
        });
    });
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
