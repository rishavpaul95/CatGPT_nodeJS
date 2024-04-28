const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const { Ollama } = require('ollama');
const port = process.env.PORT || 3001;

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

const crypto = require('crypto');

// Generate a 64-byte long secret
const secret = crypto.randomBytes(64).toString('hex');

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 60 * 60 * 1000 // 1 hour
    }
}));

app.use((req, res, next) => {
    if (!req.session.conversation) {
        req.session.conversation = [];
    }
    next();
});

const ollama = new Ollama(({ host: 'http://127.0.0.1:11434' }));

const model = 'catGPT';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    req.session.conversation.push({ role: 'user', content: userMessage });

    // Limit the size of the conversation history
    if (req.session.conversation.length > 100) {
        req.session.conversation.shift();
    }

    try {
        const response = await ollama.chat({
            model: model,
            messages: req.session.conversation
        });

        const responseBody = response.message.content;

        req.session.conversation.push({ role: 'assistant', content: responseBody });

        // Limit the size of the conversation history
        if (req.session.conversation.length > 100) {
            req.session.conversation.shift();
        }

        res.json({ response: responseBody });

        console.log(req.session.conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error sending message" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});