const express = require('express');
const bodyParser = require('body-parser');
const { setTimeout } = require('timers/promises');
const fetch = require('node-fetch');
const chalk = require('chalk');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

class Machine {
    constructor(cookie, url, reaction) {
        this.cookie = cookie;
        this.url = url;
        this.reaction = reaction;
        this.headers_buff = {
            'user-agent': 'Mozilla/5.0 (Linux; Android 12; SM-A037F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
            'content-type': 'application/x-www-form-urlencoded',
            'cookie': this.cookie
        };
    }

    async buff() {
        try {
            const get_token = await fetch('https://machineliker.net/auto-reactions').then(res => res.text());
            const token = get_token.split('name="_token" value="')[1].split('"')[0];
            const hash = get_token.split('name="hash" value="')[1].split('"')[0];

            const data_buff = new URLSearchParams({
                'url': this.url,
                'limit': '20',
                'reactions[]': this.reaction,
                '_token': token,
                'hash': hash
            });

            const response = await fetch('https://machineliker.net/auto-reactions', {
                method: 'POST',
                headers: this.headers_buff,
                body: data_buff
            }).then(res => res.text());

            if (response.includes('Order Submitted')) {
                console.log(`Successfully Increased +20 Reactions`);
                return { success: true, message: "Successfully Increased +20 Reactions" };
            } else {
                console.log("Error");
                return { success: false, message: "Error occurred during the reaction process." };
            }
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'An error occurred.' };
        }
    }
}

app.post('/autolike', async (req, res) => {
    const { cookie, url, reaction } = req.body;

    const machine = new Machine(cookie, url, reaction);
    const result = await machine.buff();

    res.json(result);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
