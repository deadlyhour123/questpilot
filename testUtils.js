/**
 * QuestPilot - Chat Reader Test Utility
 * Use this to test chat reading without needing to be in-game
 */

export class ChatReaderTester {
    constructor() {
        this.testMessages = [];
        this.simulationInterval = null;
    }
    
    /**
     * Simulate a chat message
     */
    simulateMessage(text, delayMs = 0) {
        setTimeout(() => {
            console.log(`[TEST] Simulating message: "${text}"`);
            this.testMessages.push({
                text: text,
                x: 100,
                y: 100 + (this.testMessages.length * 20),
                timestamp: Date.now()
            });
        }, delayMs);
    }
    
    /**
     * Simulate account login
     */
    simulateLogin(username = "TestAccount", delayMs = 1000) {
        this.simulateMessage(`Welcome to RuneScape, ${username}!`, delayMs);
    }
    
    /**
     * Simulate quest completion
     */
    simulateQuestComplete(questName, delayMs = 2000) {
        this.simulateMessage(`Congratulations! Quest complete: ${questName}`, delayMs);
    }
    
    /**
     * Simulate XP gain
     */
    simulateXPGain(skill, amount, delayMs = 3000) {
        this.simulateMessage(`You receive ${amount.toLocaleString()} ${skill} experience.`, delayMs);
    }
    
    /**
     * Run a complete test scenario
     */
    runTestScenario() {
        console.log("🧪 Running test scenario...");
        
        // Clear previous messages
        this.testMessages = [];
        
        // Simulate login
        this.simulateLogin("IronTestPlayer", 500);
        
        // Simulate some XP gains
        this.simulateXPGain("Attack", 1000, 2000);
        this.simulateXPGain("Strength", 850, 3000);
        
        // Simulate quest completion
        this.simulateQuestComplete("Cook's Assistant", 4000);
        
        // Another quest
        this.simulateQuestComplete("The Blood Pact", 6000);
        
        console.log("✅ Test scenario queued");
    }
    
    /**
     * Get all test messages (for mocking ChatBox.read())
     */
    getMessages() {
        return [...this.testMessages];
    }
    
    /**
     * Clear all test messages
     */
    clear() {
        this.testMessages = [];
        console.log("🗑️ Test messages cleared");
    }
    
    /**
     * Run continuous simulation (for stress testing)
     */
    startContinuousSimulation(intervalMs = 5000) {
        console.log("🔄 Starting continuous simulation...");
        
        const quests = [
            "Cook's Assistant",
            "The Blood Pact",
            "Demon Slayer",
            "Rune Mysteries",
            "Dragon Slayer"
        ];
        
        let questIndex = 0;
        
        this.simulationInterval = setInterval(() => {
            const quest = quests[questIndex % quests.length];
            this.simulateQuestComplete(quest, 0);
            questIndex++;
        }, intervalMs);
    }
    
    /**
     * Stop continuous simulation
     */
    stopContinuousSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
            console.log("⏸️ Stopped continuous simulation");
        }
    }
}

/**
 * Mock ChatBox for testing without Alt1
 */
export class MockChatbox {
    constructor(tester) {
        this.tester = tester;
        this.found = true;
    }
    
    find() {
        return this.found;
    }
    
    read() {
        return this.tester.getMessages();
    }
}

/**
 * Setup test environment
 */
export function setupTestEnvironment() {
    // Create tester
    const tester = new ChatReaderTester();
    
    // Expose globally for console access
    window.QuestPilotTest = {
        tester: tester,
        
        // Quick test functions
        login: (name) => tester.simulateLogin(name, 0),
        completeQuest: (name) => tester.simulateQuestComplete(name, 0),
        xpGain: (skill, amount) => tester.simulateXPGain(skill, amount, 0),
        
        // Run full scenario
        scenario: () => tester.runTestScenario(),
        
        // Control
        clear: () => tester.clear(),
        startSim: () => tester.startContinuousSimulation(),
        stopSim: () => tester.stopContinuousSimulation()
    };
    
    console.log("🧪 Test environment ready!");
    console.log("📝 Use window.QuestPilotTest to run tests:");
    console.log("   QuestPilotTest.login('YourName')");
    console.log("   QuestPilotTest.completeQuest('Cook\\'s Assistant')");
    console.log("   QuestPilotTest.scenario() - Run full test");
    
    return tester;
}

// Auto-setup when not in Alt1
if (typeof window !== 'undefined' && !window.alt1) {
    console.log("⚠️ Alt1 not detected - Test mode available");
    console.log("💡 Import setupTestEnvironment() to enable testing");
}
