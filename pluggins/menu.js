const { readEnv } = require('../config');
const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu",
    alias: ["list"],
    desc: "bot's commands",
    react: "📜",
    category: "main"
}, async (conn, mek, m, { from, senderNumber, pushname, reply }) => {
    try {
        const imageUrl = config.MENU_IMG || 'https://i.imgur.com/fallbackImage.jpg';
        const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(0);
        const device = os.hostname();

        const caption = `👋 Hello *${pushname}*

╭─「 *SANIJA-MD* 」─╮
│ ◈ ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}
│ ◈ ʀᴀᴍ : ${usedRam}MB / ${totalRam}MB
│ ◈ ᴘʟᴀᴛꜰᴏʀᴍ : ${device}
│ ◈ ᴠᴇʀꜱɪᴏɴ : 1.0.1
╰──────────────────╯

📌 Please select a category below to view commands.
> *POWERED BY SANIJA-MD*
`;

        const buttons = [
            { buttonId: `.mainmenu`, buttonText: { displayText: "🛠️ Main" }, type: 1 },
            { buttonId: `.searchmenu`, buttonText: { displayText: "🔍 Search" }, type: 1 },
            { buttonId: `.downloadmenu`, buttonText: { displayText: "📥 Download" }, type: 1 },
            { buttonId: `.groupmenu`, buttonText: { displayText: "👥 Group" }, type: 1 },
            { buttonId: `.ownermenu`, buttonText: { displayText: "👨‍💻 Owner" }, type: 1 },
            { buttonId: `.funmenu`, buttonText: { displayText: "🎉 Fun" }, type: 1 },
        ];

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption,
            buttons,
            footer: "Select an option to see commands",
            headerType: 4
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply('An error occurred while processing your request.');
    }
});
