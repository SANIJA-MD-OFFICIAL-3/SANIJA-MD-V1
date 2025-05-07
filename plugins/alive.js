const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["status", "runtime", "uptime"],
    desc: "Check uptime and system status",
    category: "main",
    react: "📟",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Generate system status message
        const status = `╭━━〔 *(◕‿↼) 𝓢𝓐𝓝𝓘𝓙𝓐-𝓜𝓓-𝓿1* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *⏳(◕‿↼) 𝓤𝓹𝓽𝓲𝓶𝓮*:  ${runtime(process.uptime())} 
┃◈┃• *📟(◕‿↼) 𝓡𝓪𝓶 𝓾𝓼𝓪𝓰𝓮*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
┃◈┃• *⚙️(◕‿↼) 𝓗𝓸𝓼𝓽𝓝𝓪𝓶𝓮*: ${os.hostname()}
┃◈┃• *👨‍💻(◕‿↼)  𝓞𝔀𝓷𝓮𝓻*: Sanija Nimtharu
┃◈┃• *🧬(◕‿↼) 𝓥𝓮𝓻𝓼𝓲𝓸𝓷*: 1.0.1
┃◈└───────────┈⊷
╰──────────────┈⊷
> *© (◕‿↼)  𝓟𝓞𝓦𝓔𝓡𝓔𝓓 𝓑𝓨 𝓢𝓐𝓝𝓘𝓙𝓐-𝓜𝓓-𝓿1 ✾*`;

        // Send the status message with an image
        await conn.sendMessage(from, { 
            image: { url: `https://i.ibb.co/BsjkCDP/9555.jpg` },  // Image URL
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363368882758119@newsletter',
                    newsletterName: 'QUEEN-RASHU-MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in alive command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
