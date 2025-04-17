 const fs = require('fs');
 if (fs.existsSync('sanija.env')) require('dotenv').sanija({ path: './sanija.env' });
 
 function convertToBool(text, fault = 'true') {
     return text === fault ? true : false;
 }
 module.exports = {
 AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
 AUTO_VOICE: process.env.AUTO_VOICE || "false",
 AUTO_STICKER: process.env.AUTO_STICKER || "false",
 AUTO_REPLY: process.env.AUTO_REPLY || "false",
 ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/b61wmw.png",
 MENU_IMG: process.env.MENU_IMG || "https://files.catbox.moe/uhn8p1.png",
 ALIVE_MSG: process.env.ALIVE_MSG || "_Hi 💁🏽 How Can I Assist You. I Am alive Now. Thank You For Installing Me To Your Whatsapp_",
 ANTI_LINK: process.env.ANTI_LINK || "true",
 ANTI_BAD: process.env.ANTI_BAD || "true",
 PREFIX: process.env.PREFIX || ".",
 FAKE_RECORDING: process.env.FAKE_RECORDING || "false",
 FAKE_TYPING: process.env.FAKE_TYPING || "false",
 ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
 CURRENT_STATUS: process.env.CURRENT_STATUS || "true",
 AUTO_REACT: process.env.AUTO_REACT || "false",
 HEART_REACT: process.env.HEART_REACT || "false",
 OWNER_REACT: process.env.OWNER_REACT || "false",
 BOT_NAME: process.env.BOT_NAME || "『 SANIJA-MD_V1 』",
 OMDB_API_KEY: process.env.OMDB_API_KEY || "76cb7f39",// omdbapi.com
 START_IMG: process.env.START_IMG || "https://files.catbox.moe/d2d02k.png"
 };
