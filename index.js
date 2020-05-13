const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const path = require('path');

const app = express();
const keys = {
    publicKey: 'BKlPLeGiu4WuUWHlPa9ZWi9L0o2hCVA8Uq3N1XUA86b0HiK3MVAjKrZQ6Tr_d6_D8uG0Y0d8aZE4flmX4FQ9vL8',
    privateKey: 'dc-eHi7kYoe5vLTqPFT0F0EfLKIROu74bK4iEQOxdx0'
};
let intervalPointer;

app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'client')));
app.use((req, res, next) => {
    console.log('req ', req.url);
    next();
});

// setting keys
webpush.setVapidDetails(
    'mailto:test@test.org',
    keys.publicKey,
    keys.privateKey
);

app.get('/public-key', (req, res) => {
    res.status(200).send({ publicKey: keys.publicKey });
});

app.post('/subscribe', (req, res) => {
    res.status(201).json({ subscription: true });

    const subscription = req.body;
    webpush.sendNotification(subscription, '');
    intervalPointer = setInterval(() => {
        console.log('interval');
        webpush.sendNotification(subscription, '');
    }, 10000);
});

app.get('/get-payload-data', (req, res) => {
    res.status(200).json({
        title: 'Push notification from server',
        body: 'Am i joke to you ?',
        image: 'http://localhost:5000/logo.png',
        id: 1
    });
});

app.get('/unsubscribe', (req, res) => {
    clearInterval(intervalPointer);
    res.status(201).json({ subscription: false });
});

app.listen(5000);
console.log('app running on port 5000');