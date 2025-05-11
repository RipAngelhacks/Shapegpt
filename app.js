document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Configuration
    const MODEL_USERNAME = 'star-tr15';
    
    // Encryption function (one-way hash using SHA-256)
    async function encryptString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Encrypted API key (this is a one-way hash that can't be reversed)
    const ENCRYPTED_API_KEY = 'e8f2d6c91b382a9d827c3877f983b38b12e198c4b26126c0d562a0eac41c21f3';

    async function validateApiKey(key) {
        const hashedKey = await encryptString(key);
        return hashedKey === ENCRYPTED_API_KEY;
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Display user message
        addMessage('user', message);
        userInput.value = '';

        try {
            const response = await fetch('https://api.shapes.inc/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer AhqXQvgXNsmoIR2HfUIUTmGTGs97b_CHpgWXT4NhVXg`,
                },
                body: JSON.stringify({
                    model: `shapesinc/${MODEL_USERNAME}`,
                    messages: [
                        { role: 'user', content: message }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content || 'No response from AI';
            addMessage('ai', aiResponse);

        } catch (error) {
            console.error('Error:', error);
            addMessage('ai', 'Error: Failed to get response from the AI');
        }
    }

    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        messageDiv.textContent = content;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Add initial greeting
    addMessage('ai', 'Hello! I am StarGpt V1. How can I help you today?');
});
