class MessageStorage {
    constructor() {
        this.storageKey = 'chat_messages';
    }

    saveMessages(messages) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving messages:', error);
        }
    }

    loadMessages() {
        try {
            const messages = localStorage.getItem(this.storageKey);
            return messages ? JSON.parse(messages) : [];
        } catch (error) {
            console.error('Error loading messages:', error);
            return [];
        }
    }
}
