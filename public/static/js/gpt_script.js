const chatContainer = document.getElementById("chat");
const userInput = document.getElementById("user-input");
const submitIcon = document.getElementById("submit-icon");
const chatContent = document.querySelector(".chat-content");
const scrollToBottomButton = document.querySelector("#scroll-to-bottom");

// Variable to track manual scrolling
let manuallyScrolledToBottom = false;
let awaitingResponse = false; // Flag to track if a response is being awaited

// Function to handle scroll event
chatContent.addEventListener("scroll", function() {
    if (chatContent.scrollTop + chatContent.clientHeight < chatContent.scrollHeight) {
        scrollToBottomButton.style.display = "block";
        manuallyScrolledToBottom = false;
    } else {
        scrollToBottomButton.style.display = manuallyScrolledToBottom ? "none" : "block";
    }
});

// Function to send a message
async function sendMessage() {
    if (awaitingResponse) {
        return; // If awaiting a response, do not allow sending new messages
    }

    const userMessage = userInput.value.trim();

    if (userMessage !== "") {
        appendMessage("user-msg", userMessage);
        userInput.value = "";
        const generatingResponseMessage = appendMessage("bot-msg generating-response", "Generating response");
        userInput.focus();

        try {
            awaitingResponse = true; // Set flag to indicate awaiting response
            const response = await sendUserMessageToServer(userMessage);
            generatingResponseMessage.remove();
            appendMessage("bot-msg", response);
        } catch (error) {
            console.error(error);
            generatingResponseMessage.textContent = "Error generating response";
        } finally {
            awaitingResponse = false; // Reset the flag
        }

        chatContent.scrollTop = chatContent.scrollHeight;
        manuallyScrolledToBottom = false;
        scrollToBottomButton.style.display = "none";
    }
}

// Function to generate a response using CharacterAI
async function sendUserMessageToServer(userMessage) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
        throw new Error('Failed to send message to the server');
    }

    const data = await response.json();
    return data.response;
}

// Handle scroll event again after sending a message
chatContent.addEventListener("scroll", function() {
    if (chatContent.scrollTop + chatContent.clientHeight >= chatContent.scrollHeight) {
        manuallyScrolledToBottom = false;
        scrollToBottomButton.style.display = "none";
    } else {
        scrollToBottomButton.style.display = "block";
    }
});

// Trigger sendMessage on submitIcon click
submitIcon.addEventListener("click", sendMessage);

// Handle user pressing Enter key
userInput.addEventListener("keypress", handleKeyPress);

function handleKeyPress(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
}

// Function to append a message to the chat
function appendMessage(className, message) {
    const chatMessage = document.createElement("li");
    chatMessage.className = className;
    chatMessage.textContent = message;
    chatContainer.appendChild(chatMessage);
    checkIfAtBottom();
    return chatMessage;
}

// Function to check if the chat is at the bottom
function checkIfAtBottom() {
    if (chatContent.scrollTop + chatContent.clientHeight >= chatContent.scrollHeight) {
        manuallyScrolledToBottom = false;
        scrollToBottomButton.style.display = "none";
    }
}

// Handle scrollToBottomButton click to scroll to the bottom
scrollToBottomButton.addEventListener("click", function() {
    chatContent.scrollTop = chatContent.scrollHeight;
    manuallyScrolledToBottom = false;
    scrollToBottomButton.style.display = "none";
});

// Check if the chat is at the bottom and hide the scroll button
checkIfAtBottom();

// Auto-hide scrollToBottomButton after 3 seconds
setTimeout(() => {
    scrollToBottomButton.style.display = "none";
}, 3000);