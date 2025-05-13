document.addEventListener('DOMContentLoaded', async () => {
    // Validate API key before proceeding
    if (!await validateApiKey()) {
        console.error('Invalid API key');
        document.body.innerHTML = '<div class="error-message">Authentication Error: Invalid API key</div>';
        return;
    }

    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');

    const storage = new MessageStorage();
    const rateLimit = new RateLimit(5, 60000);

    const savedMessages = storage.loadMessages();
    savedMessages.forEach(msg => addMessage(msg.role, msg.content, msg.status));

    let messageQueue = [];
    let isProcessing = false;

    async function processMessageQueue() {
        if (isProcessing || messageQueue.length === 0) return;
        isProcessing = true;

        while (messageQueue.length > 0) {
            const { message, messageElement } = messageQueue[0];
            
            try {
                if (!rateLimit.canMakeRequest()) {
                    const waitTime = rateLimit.getTimeUntilNext();
                    updateMessageStatus(messageElement, `Rate limit reached. Waiting ${Math.ceil(waitTime/1000)}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }

                showTypingIndicator();
                rateLimit.addRequest();

                const response = await fetch('https://api.shapes.inc/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${CONFIG.API_KEY}`,
                        'X-User-Id': CONFIG.USER_ID,
                        'X-Channel-Id': CONFIG.CHANNEL_ID
                    },
                    body: JSON.stringify({
                        model: `shapesinc/${CONFIG.MODEL_USERNAME}`,
                        messages: [{ role: 'user', content: message }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                updateMessageStatus(messageElement, 'Delivered');
                
                const aiResponse = data.choices[0]?.message?.content;
                addMessage('ai', aiResponse);

            } catch (error) {
                console.error('Error:', error);
                handleError(error, messageElement);
            } finally {
                hideTypingIndicator();
                messageQueue.shift();
            }
        }

        isProcessing = false;
    }

    function handleError(error, messageElement) {
        let errorMessage = 'An unknown error occurred.';
        
        if (!navigator.onLine) {
            errorMessage = 'Network connection lost. Please check your internet connection.';
        } else if (error.name === 'TypeError') {
            errorMessage = 'Network error. Unable to reach the server.';
        } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit exceeded. Please wait before sending more messages.';
        } else if (error.message.includes('401')) {
            errorMessage = 'Authentication failed. Please check your API key.';
        } else if (error.message.includes('400')) {
            errorMessage = 'Invalid request. Please check your message.';
        }

        updateMessageStatus(messageElement, `Error: ${errorMessage}`);
        
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry';
        retryButton.classList.add('retry-button');
        retryButton.onclick = () => {
            messageQueue.unshift({ message: messageElement.dataset.message, messageElement });
            updateMessageStatus(messageElement, 'Retrying...');
            processMessageQueue();
        };
        
        messageElement.appendChild(retryButton);
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    function updateMessageStatus(messageElement, status) {
        let statusElement = messageElement.querySelector('.message-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.classList.add('message-status');
            messageElement.appendChild(statusElement);
        }
        statusElement.textContent = status;
    }

    function addMessage(role, content, status = 'Sending...') {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        messageDiv.dataset.message = content;
        
        const timestampDiv = document.createElement('div');
        timestampDiv.classList.add('message-timestamp');
        timestampDiv.textContent = CONFIG.STATIC_TIMESTAMP;
        
        const contentDiv = document.createElement('div');
        contentDiv.textContent = content;
        
        messageDiv.appendChild(timestampDiv);
        messageDiv.appendChild(contentDiv);
        
        if (role === 'user') {
            updateMessageStatus(messageDiv, status);
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save messages to local storage
        const messages = storage.loadMessages();
        messages.push({ role, content, status });
        storage.saveMessages(messages);

        return messageDiv;
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        userInput.value = '';
        const messageElement = addMessage('user', message);
        messageQueue.push({ message, messageElement });
        processMessageQueue();
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Network status monitoring
    window.addEventListener('online', () => {
        console.log('Connection restored');
        processMessageQueue();
    });

    window.addEventListener('offline', () => {
        console.log('Connection lost');
    });

    // Add initial greeting if no saved messages
    if (savedMessages.length === 0) {
        addMessage('ai', 'Hello! I am StarGpt V1. How can I help you today?');
    }
});
