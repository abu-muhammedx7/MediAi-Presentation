document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const suggestionChips = document.querySelectorAll('.chip');

    // Initialize chat
    setTimeout(() => {
        addBotMessage("Hello! I'm MEDIAI, your AI medical assistant. How can I help you today?");
    }, 500);

    // Handle user input
    userInput.addEventListener('input', function() {
        sendBtn.disabled = this.value.trim() === '';
    });

    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey && !sendBtn.disabled) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    // New chat handler
    newChatBtn.addEventListener('click', function() {
        fetch('/api/new_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-content">
                        <h2>New Conversation Started</h2>
                        <p>What would you like to know about your health today?</p>
                    </div>
                </div>
            `;
            setTimeout(() => {
                addBotMessage("I'm ready to assist with your medical questions. What would you like to know?");
            }, 300);
        });
    });

    // Suggested questions
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', function() {
            userInput.value = this.textContent;
            sendBtn.disabled = false;
            userInput.focus();
        });
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addUserMessage(message);
            userInput.value = '';
            sendBtn.disabled = true;
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message bot-message typing-indicator';
            typingIndicator.innerHTML = `
                <div class="typing-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            `;
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Send to backend
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => response.json())
            .then(data => {
                typingIndicator.remove();
                if (data.error) {
                    addBotMessage("Sorry, I encountered an error. Please try again.");
                } else {
                    addBotMessage(data.response);
                }
            })
            .catch(error => {
                typingIndicator.remove();
                addBotMessage("Network error. Please check your connection.");
            });
        }
    }

    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});