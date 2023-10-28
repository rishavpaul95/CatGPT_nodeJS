// DOM elements
const chatContainer = document.getElementById("chat");
const userInput = document.getElementById("user-input");
const submitIcon = document.getElementById("submit-icon");
const chatContent = document.querySelector(".chat-content");
const scrollToBottomButton = document.querySelector("#scroll-to-bottom");
let manuallyScrolledToBottom = false;

// Event listeners

// Scroll event for chatContent
chatContent.addEventListener("scroll", function() {
    if (chatContent.scrollTop + chatContent.clientHeight >= chatContent.scrollHeight) {
        manuallyScrolledToBottom = false;
        scrollToBottomButton.style.display = "none";
    } else {
        scrollToBottomButton.style.display = "block";
    }
});

// Click event for the submitIcon
submitIcon.addEventListener("click", sendMessage);

// Keypress event for Enter key
function handleKeyPress(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
}

userInput.addEventListener("keypress", handleKeyPress);

// Click event for scrollToBottomButton
scrollToBottomButton.addEventListener("click", function() {
    chatContent.scrollTop = chatContent.scrollHeight;
    manuallyScrolledToBottom = false;
    scrollToBottomButton.style.display = "none";
});

// Functions

// Append a message to the chat
function appendMessage(className, message) {
    const chatMessage = document.createElement("li");
    chatMessage.className = className;
    chatMessage.textContent = message;
    chatContainer.appendChild(chatMessage);
    checkIfAtBottom();
    return chatMessage;
}

// Check if the chat is scrolled to the bottom
function checkIfAtBottom() {
    if (chatContent.scrollTop + chatContent.clientHeight >= chatContent.scrollHeight) {
        manuallyScrolledToBottom = false;
        scrollToBottomButton.style.display = "none";
    }
}

// Send a message
function sendMessage() {
    const userMessage = userInput.value.trim();

    if (userMessage !== "") {
        // Disable the submit image
        submitIcon.classList.add("disabled");
        submitIcon.removeEventListener("click", sendMessage); // Remove the click event listener

        appendMessage("user-msg", userMessage);
        userInput.value = "";
        const generatingResponseMessage = appendMessage("bot-msg generating-response", "Generating response");

        userInput.focus(); // Keep the cursor in the user-input field during response generation

        setTimeout(function() {
            generatingResponseMessage.remove();
            const botResponse = generateMeows(userMessage.length);
            appendMessage("bot-msg", botResponse);

            // Re-enable the submit image
            submitIcon.classList.remove("disabled");
            submitIcon.addEventListener("click", sendMessage); // Add back the click event listener

            chatContent.scrollTop = chatContent.scrollHeight;
            manuallyScrolledToBottom = false;
            scrollToBottomButton.style.display = "none";
        }, 3000);
    }
}

// Generate bot responses
function generateMeows(length) {
    if (length <= 6) {
        return "Meow";
    }

    const words = "Meow".split(" ");
    const numMeows = Math.floor(Math.random() * (length - words.length) + 2); // Minimum of 2 meows

    const meowArray = [];
    for (let i = 0; i < numMeows; i++) {
        if (i === 0) {
            meowArray.push("Meow " + words.slice(1).join(" "));
        } else {
            meowArray.push("meow");
        }
    }

    return meowArray.join(" ");
}

// Check if at the bottom on page load
checkIfAtBottom();

// Hide the "scroll to bottom" button after 3 seconds
setTimeout(() => {
    scrollToBottomButton.style.display = "none";
}, 3000);