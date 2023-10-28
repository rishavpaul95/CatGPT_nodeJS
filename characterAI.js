const CharacterAI = require("node_characterai");
let characterAI = new CharacterAI();
const characterId = "hTP85l95BwEyURXYCKMJ9WQ54eRrzsjHUr4gJG-SYng";

async function initializeCharacterAI() {
    try {
        await characterAI.authenticateAsGuest();
    } catch (error) {
        console.error("Error authenticating as a guest:", error);
        // Retry the authentication once if it fails
        try {
            await characterAI.authenticateAsGuest();
        } catch (retryError) {
            console.error("Error on retry authentication:", retryError);
        }
    }
}

module.exports = {
    initializeCharacterAI,
    createChat: () => characterAI.createOrContinueChat(characterId),
};