const express = require('express');

const cookieParser = require('cookie-parser');
const app = express();
const CharacterAI = require("node_characterai");
const port = process.env.PORT || 3001;

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());


const characterId = "hTP85l95BwEyURXYCKMJ9WQ54eRrzsjHUr4gJG-SYng";

const characterAIInstances = new Map();


function generateUserToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


async function createCharacterAIInstance() {
    try {
        const characterAI = new CharacterAI(characterId);
        await characterAI.authenticateAsGuest();
        return characterAI;
    } catch (error) {
        throw error;
    }
}

function removeCharacterAIInstance(userToken) {
    if (characterAIInstances.has(userToken)) {
        const { characterAI, timeoutId } = characterAIInstances.get(userToken);
        clearTimeout(timeoutId);
        characterAIInstances.delete(userToken);
    //  characterAI.close();
    }
}

app.use(async (req, res, next) => {
    const userToken = req.cookies.userToken || generateUserToken();

    if (!characterAIInstances.has(userToken)) {
        try {
            const characterAI = await createCharacterAIInstance();
            const timeoutId = setTimeout(() => removeCharacterAIInstance(userToken), 3600000);
            characterAIInstances.set(userToken, { characterAI, timeoutId });
            req.characterAI = characterAI;
            next();
        } catch (error) {
            console.error("Error authenticating as a guest:", error);
            res.status(500).json({ error: "Error authenticating" });
        }
    } else {
        const { characterAI, timeoutId } = characterAIInstances.get(userToken);
        clearTimeout(timeoutId);
        const newTimeoutId = setTimeout(() => removeCharacterAIInstance(userToken), 3600000);
        characterAIInstances.set(userToken, { characterAI, timeoutId: newTimeoutId });
        req.characterAI = characterAI;
        next();
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    const characterAI = req.characterAI;

    try {
        const chat = await characterAI.createOrContinueChat(characterId);
        const response = await chat.sendAndAwaitResponse(userMessage, true);
        res.json({ response: response.text });
    } catch (error) {
        console.error(error);
        
        try {
            const characterAI = await createCharacterAIInstance();
            const timeoutId = setTimeout(() => removeCharacterAIInstance(req.cookies.userToken), 3600000);
            characterAIInstances.set(req.cookies.userToken, { characterAI, timeoutId });
            req.characterAI = characterAI;
            const chat = await characterAI.createOrContinueChat(characterId);
            const response = await chat.sendAndAwaitResponse(userMessage, true);
            res.json({ response: response.text });
        } catch (retryError) {
            console.error("Error retrying authentication:", retryError);
            res.status(500).json({ error: "Error authenticating" });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
