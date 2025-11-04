// Advanced Username Detection for Alt1
// This module attempts to read the player's username from the RuneScape interface

const UsernameDetector = {
    
    // Try to detect username from various UI elements
    async detectFromGame() {
        if (!window.alt1) {
            console.log('Alt1 not available');
            return null;
        }
        
        console.log('Attempting to detect username from game...');
        
        // Method 1: Try to read from chat box (when you type)
        const chatUsername = await this.readFromChatBox();
        if (chatUsername) return chatUsername;
        
        // Method 2: Try to read from logout button hover
        const logoutUsername = await this.readFromLogoutHover();
        if (logoutUsername) return logoutUsername;
        
        // Method 3: Try to read from interfaces (skills, quest journal, etc.)
        const interfaceUsername = await this.readFromInterface();
        if (interfaceUsername) return interfaceUsername;
        
        console.log('Could not auto-detect username');
        return null;
    },
    
    // Method 1: Read from chat box
    async readFromChatBox() {
        try {
            // This would use Alt1's OCR to read chat
            // Example: "PlayerName: Hello"
            // We need to implement OCR reading here
            
            // For now, return null (not implemented)
            return null;
        } catch (e) {
            console.error('Chat box reading failed:', e);
            return null;
        }
    },
    
    // Method 2: Read from logout button
    async readFromLogoutHover() {
        try {
            // When you hover over logout, it shows your username
            // This would require detecting the tooltip
            
            // For now, return null (not implemented)
            return null;
        } catch (e) {
            console.error('Logout hover reading failed:', e);
            return null;
        }
    },
    
    // Method 3: Read from game interfaces
    async readFromInterface() {
        try {
            // Some interfaces show your username
            // Like the Skills interface or Quest Journal
            
            // For now, return null (not implemented)
            return null;
        } catch (e) {
            console.error('Interface reading failed:', e);
            return null;
        }
    },
    
    // Validate username format
    isValidUsername(username) {
        if (!username) return false;
        
        // RS usernames are 1-12 characters
        if (username.length < 1 || username.length > 12) return false;
        
        // Can contain letters, numbers, spaces, hyphens, underscores
        const validPattern = /^[a-zA-Z0-9 _-]+$/;
        if (!validPattern.test(username)) return false;
        
        return true;
    },
    
    // Clean up detected username
    cleanUsername(username) {
        if (!username) return null;
        
        // Trim whitespace
        username = username.trim();
        
        // Remove common prefixes that might be detected
        const prefixes = ['Player:', 'Username:', 'RSN:'];
        for (const prefix of prefixes) {
            if (username.startsWith(prefix)) {
                username = username.substring(prefix.length).trim();
            }
        }
        
        return username;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsernameDetector;
}
