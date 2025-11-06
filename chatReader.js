/**
 * QuestPilot - Chat Reader Module
 * Monitors RS3 chat for account info and quest completions
 */

import * as a1lib from "@alt1/base";
import { Chatbox } from "@alt1/chatbox";

export class ChatReader {
    constructor(onAccountDetected, onQuestComplete, onError) {
        this.chatbox = null;
        this.isMonitoring = false;
        this.lastReadTime = Date.now();
        this.monitorInterval = null;
        
        // Callbacks
        this.onAccountDetected = onAccountDetected || (() => {});
        this.onQuestComplete = onQuestComplete || (() => {});
        this.onError = onError || console.error;
        
        // Cache of processed messages to avoid duplicates
        this.processedMessages = new Set();
        this.maxCacheSize = 100;
        
        console.log("📖 ChatReader initialized");
    }
    
    /**
     * Initialize the chatbox reader
     */
    initialize() {
        try {
            if (!window.alt1) {
                throw new Error("Alt1 Toolkit not detected");
            }
            
            this.chatbox = new Chatbox();
            const found = this.chatbox.find();
            
            if (!found) {
                console.warn("⚠️ Chatbox not found. Make sure RS3 is visible.");
                return false;
            }
            
            console.log("✅ Chatbox found and initialized");
            return true;
        } catch (error) {
            this.onError("Failed to initialize chatbox", error);
            return false;
        }
    }
    
    /**
     * Start monitoring chat
     */
    startMonitoring(intervalMs = 1000) {
        if (this.isMonitoring) {
            console.warn("Chat monitoring already running");
            return;
        }
        
        if (!this.initialize()) {
            console.error("Cannot start monitoring - chatbox not initialized");
            return;
        }
        
        this.isMonitoring = true;
        console.log("🔍 Started chat monitoring");
        
        // Read immediately
        this.readChat();
        
        // Then read on interval
        this.monitorInterval = setInterval(() => {
            this.readChat();
        }, intervalMs);
    }
    
    /**
     * Stop monitoring chat
     */
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        
        this.isMonitoring = false;
        console.log("⏸️ Stopped chat monitoring");
    }
    
    /**
     * Read and process chat messages
     */
    readChat() {
        try {
            if (!this.chatbox) {
                return;
            }
            
            // Re-find chatbox in case window moved
            const found = this.chatbox.find();
            if (!found) {
                console.warn("Chatbox lost - will retry next interval");
                return;
            }
            
            // Read all visible messages
            const messages = this.chatbox.read();
            
            if (!messages || messages.length === 0) {
                return;
            }
            
            // Process each message
            messages.forEach(msg => {
                this.processMessage(msg);
            });
            
            // Clean up old cached messages
            if (this.processedMessages.size > this.maxCacheSize) {
                const messagesArray = Array.from(this.processedMessages);
                this.processedMessages = new Set(
                    messagesArray.slice(-this.maxCacheSize)
                );
            }
            
        } catch (error) {
            this.onError("Error reading chat", error);
        }
    }
    
    /**
     * Process a single chat message
     */
    processMessage(message) {
        if (!message || !message.text) {
            return;
        }
        
        const text = message.text;
        const messageId = `${text}_${message.x}_${message.y}`;
        
        // Skip if we've already processed this message
        if (this.processedMessages.has(messageId)) {
            return;
        }
        
        // Mark as processed
        this.processedMessages.add(messageId);
        
        // Check for account name
        this.checkForAccountName(text);
        
        // Check for quest completion
        this.checkForQuestCompletion(text);
        
        // Check for XP gains (for future use)
        this.checkForXPGain(text);
    }
    
    /**
     * Check message for account name
     */
    checkForAccountName(text) {
        // Pattern 1: "Welcome to RuneScape, [Name]!"
        const welcomeMatch = text.match(/Welcome to RuneScape,?\s+([^!]+)!/i);
        if (welcomeMatch) {
            const accountName = welcomeMatch[1].trim();
            console.log(`✅ Account detected: ${accountName}`);
            this.onAccountDetected(accountName);
            return;
        }
        
        // Pattern 2: Login message variations
        const loginMatch = text.match(/Welcome back,?\s+([^!]+)!/i);
        if (loginMatch) {
            const accountName = loginMatch[1].trim();
            console.log(`✅ Account detected: ${accountName}`);
            this.onAccountDetected(accountName);
            return;
        }
    }
    
    /**
     * Check message for quest completion
     */
    checkForQuestCompletion(text) {
        // Pattern 1: "Congratulations! Quest complete: [Quest Name]"
        let match = text.match(/(?:Congratulations!|Quest complete:?)\s*(.+?)(?:\.|$)/i);
        
        // Pattern 2: "You have completed [Quest Name]"
        if (!match) {
            match = text.match(/You have completed\s+(.+?)(?:\.|!|$)/i);
        }
        
        // Pattern 3: "[Quest Name] quest complete"
        if (!match) {
            match = text.match(/(.+?)\s+quest complete/i);
        }
        
        if (match) {
            const questName = match[1].trim();
            
            // Filter out false positives
            if (this.isValidQuestName(questName)) {
                console.log(`🎉 Quest completed: ${questName}`);
                this.onQuestComplete(questName);
            }
        }
    }
    
    /**
     * Check message for XP gains (for future Phase 2 development)
     */
    checkForXPGain(text) {
        // Look for XP drop messages
        // Example: "You receive 1,000 Attack experience."
        const xpMatch = text.match(/You (?:receive|gain)\s+([\d,]+)\s+(\w+)\s+(?:experience|XP)/i);
        
        if (xpMatch) {
            const amount = parseInt(xpMatch[1].replace(/,/g, ''));
            const skill = xpMatch[2];
            
            // Could emit an event for XP tracking in Phase 2
            console.log(`📊 XP Gain detected: +${amount} ${skill}`);
        }
    }
    
    /**
     * Validate if text looks like a real quest name
     */
    isValidQuestName(text) {
        // Too short
        if (text.length < 3) {
            return false;
        }
        
        // Too long (probably not a quest name)
        if (text.length > 50) {
            return false;
        }
        
        // Contains invalid characters
        if (/[<>{}[\]\\]/.test(text)) {
            return false;
        }
        
        // Common false positives
        const falsePositives = [
            'daily challenge',
            'task',
            'achievement',
            'minigame',
            'activity'
        ];
        
        const lowerText = text.toLowerCase();
        for (const fp of falsePositives) {
            if (lowerText.includes(fp)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Manual trigger to read chat once
     */
    async readOnce() {
        if (!this.initialize()) {
            return null;
        }
        
        const messages = this.chatbox.read();
        
        if (messages && messages.length > 0) {
            console.log(`📖 Read ${messages.length} chat messages`);
            messages.forEach(msg => this.processMessage(msg));
            return messages;
        }
        
        return null;
    }
    
    /**
     * Get monitoring status
     */
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            chatboxFound: this.chatbox !== null,
            processedCount: this.processedMessages.size,
            lastReadTime: this.lastReadTime
        };
    }
}

/**
 * Quest name normalization helper
 */
export function normalizeQuestName(name) {
    return name
        .trim()
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/[''']/g, "'")  // Normalize apostrophes
        .replace(/^(The|A)\s+/i, '')  // Remove leading articles for matching
        .toLowerCase();
}

/**
 * Find quest in database by name (fuzzy matching)
 */
export function findQuestInDatabase(detectedName, questDatabase) {
    const normalized = normalizeQuestName(detectedName);
    
    // Try exact match first
    for (const quest of questDatabase) {
        if (normalizeQuestName(quest.name) === normalized) {
            return quest;
        }
    }
    
    // Try partial match
    for (const quest of questDatabase) {
        const questNormalized = normalizeQuestName(quest.name);
        if (questNormalized.includes(normalized) || normalized.includes(questNormalized)) {
            return quest;
        }
    }
    
    return null;
}
