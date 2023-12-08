const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

const CharacterAI = require("node_characterai");

// Map to associate userToken with CharacterAI instances
const characterAIInstances = new Map();

// Function to generate a unique user token
function generateUserToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Function to create and initialize a CharacterAI instance
async function createCharacterAIInstance() {
    try {
        const characterAI = new CharacterAI();
        await characterAI.authenticateAsGuest();
        return characterAI;
    } catch (error) {
        throw error;
    }
}

app.use(async (req, res, next) => {
    const userToken = req.cookies.userToken;

    if (!userToken) {
        const newUserToken = generateUserToken();
        res.cookie('userToken', newUserToken, { maxAge: 3600000, httpOnly: true });
        req.userToken = newUserToken;
    } else {
        req.userToken = userToken;
    }

    if (!characterAIInstances.has(req.userToken)) {
        try {
            const characterAI = await createCharacterAIInstance();
            characterAIInstances.set(req.userToken, characterAI);
            req.characterAI = characterAI;
        } catch (error) {
            console.error("Error creating CharacterAI instance:", error);
            res.status(500).json({ error: "Error creating CharacterAI instance" });
            return;
        }
    } else {
        req.characterAI = characterAIInstances.get(req.userToken);
    }

    next();
});

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    const characterAI = req.characterAI;

    try {
        const characterId = "hTP85l95BwEyURXYCKMJ9WQ54eRrzsjHUr4gJG-SYng";
        const chat = await characterAI.createOrContinueChat(characterId);
        const response = await chat.sendAndAwaitResponse(userMessage, true);
        res.json({ response: response.text });
    } catch (error) {
        console.error("Error sending message to CharacterAI:", error);
        res.status(500).json({ error: "Error generating response" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});