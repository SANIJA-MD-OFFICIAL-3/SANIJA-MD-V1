/**
 * Copyright (C) 2025.
 * Licensed under the GPL-3.0 License;
 * You may not sell this script.
 * It is supplied in the hope that it may be useful.
 * @project_name : PAID Bot script
 * @author : Sanija Nimtharu
 * @description : A Multi-functional WhatsApp bot script.
 * @version 1.0.0
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers,
    jidNormalizedUser,
    getContentType
} = require('baileys'); // Changed package name here
const l = console.log;
const { getBuffer, getGroupAdmins } = require('./lib/functions');
const fs = require('fs');
const axios = require('axios');
const P = require('pino');
const config = require('./config');
const express = require("express");

const app = express();
const port = process.env.PORT || 9090;
const ownerNumber = ['263780934873'];

//===================SESSION-AUTH============================
const sessionFilePath = __dirname + '/sessions/creds.json';
if (!fs.existsSync(sessionFilePath)) {
    if (!config.SESSION_ID) return l('Please add your session to SESSION_ID env !!');

    const sessdata = config.SESSION_ID.replace("SANIJA-MD=", '');
    axios.get(`https://mega.nz/file/${sessdata}`, { responseType: 'arraybuffer' })
        .then(response => {
            fs.writeFile(sessionFilePath, response.data, () => {
                l("SESSION DOWNLOADED COMPLETED ✅");
            });
        })
        .catch(err => {
            l("Error downloading session:", err);
        });
}

async function connectToWA() {
    l("CONNECTING SANIJA-MD 🧬...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
    l("Auth state loaded.");
    
    const { version } = await fetchLatestBaileysVersion();
    l("Fetched Baileys version:", version);

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    });

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        l("Connection update:", { connection, lastDisconnect });

        if (connection === 'close') {
            if (lastDisconnect.error) {
                l("Connection closed due to error:", lastDisconnect.error);
            }
            connectToWA(); 
        } else if (connection === 'open') {
            l('♻️ CONNECTED TO WHATSAPP ENJOY ✅');

            let up = `*╭──────────────●●►*
> *➺ SANIJA-MD ᴄᴏɴɴᴇᴄᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʏ ᴛʏᴘᴇ .ᴍᴇɴᴜ2 ᴛᴏ ᴄᴏᴍᴍᴀɴᴅ ʟɪsᴛ ᴄʀᴇᴀᴛᴇᴅ ʙʏ Sanija Nimtharu ✅*
> *❁ᴊᴏɪɴ ᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ ᴄʜᴀɴɴᴇʟ ғᴏʀ ᴜᴘᴅᴀᴛᴇs*
*https://www.whatsapp.com/channel/0029Vai5pJa5vK9zcGR1PX2f*
*YOUR BOT ACTIVE NOW ENJOY♥️🪄*\n\n*PREFIX: ${config.PREFIX}*
*╰──────────────●●►*`;
            await conn.sendMessage(conn.user.id, { image: { url: config.START_IMG }, caption: up });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
        if (!mek.messages.length) return; // Ensure there are messages to process
        mek = mek.messages[0];
        if (!mek.message) return;

        mek.message = (getContentType(mek.message) === 'ephemeralMessage')
            ? mek.message.ephemeralMessage.message
            : mek.message;

        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
            await conn.readMessages([mek.key]);
        }

        const type = getContentType(mek.message);
        const body = (type === 'conversation') ? mek.message.conversation :
                     (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                     (type === 'imageMessage' && mek.message.imageMessage.caption) ? mek.message.imageMessage.caption :
                     (type === 'videoMessage' && mek.message.videoMessage.caption) ? mek.message.videoMessage.caption : '';

        const isCmd = body.startsWith(config.PREFIX);
        const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const sender = mek.key.fromMe ? conn.user.id : mek.key.participant || mek.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const isOwner = ownerNumber.includes(senderNumber);

        // Command Handling: Add your command processing logic here...
        if (isCmd) {
            const cmd = commands.find(cmd => cmd.name === command || (cmd.alias && cmd.alias.includes(command)));
            if (cmd) {
                try {
                    await cmd.execute(conn, mek, { body, args, sender, isOwner });
                } catch (e) {
                    l("Error executing command:", e);
                }
            }
        }
    });
}

// Example command structure
const commands = [
    {
        name: 'ping',
        alias: ['p'],
        execute: async (conn, mek, { sender }) => {
            const reply = "Pong!";
            await conn.sendMessage(mek.key.remoteJid, { text: reply }, { quoted: mek });
        }
    }
];

//================================================= Express Server Setup ============================================//
app.get("/", (req, res) => {
    res.send("HEY, SANIJA-MD STARTED ✅");
});

app.listen(port, () => l(`Server listening on port http://localhost:${port}`));

// Start the connection process
setTimeout(() => connectToWA(), 4000);
