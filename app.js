document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const apiKeyInput = document.getElementById('api-key');
    const shapeUsernameInput = document.getElementById('shape-username');

    async function sendMessage() {
        const message = userInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        const shapeUsername = shapeUsernameInput.value.trim();

        if (!message || !apiKey || !shapeUsername) {
            alert('Please fill in all fields (API Key, Shape Username, and message)');
            return;
        }

        // Display user message
        addMessage('user', message);
        userInput.value = '';

        try {
            const response = await fetch('https://api.shapes.inc/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: `shapesinc/${shapeUsername}`,
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
});
