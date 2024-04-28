const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const { Ollama } = require('ollama');
const port = process.env.PORT || 3001;

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    if (!req.session.conversation) {
        req.session.conversation = [];
    }
    next();
});

const ollama = new Ollama(({ host: 'http://192.168.0.193:11434' }));

const model = 'chandan';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    req.session.conversation.push({ role: 'user', content: userMessage });

    try {
        const response = await ollama.chat({
            model: model,
            messages: req.session.conversation
        });

        const responseBody = response.message.content;

        req.session.conversation.push({ role: 'assistant', content: responseBody });

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