const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch');

// Progress Bar Function with Dynamic Emojis
async function fakeProgress(conn, from, mek, message) {
    const bars = [
        '📀 [▰▱▱▱▱▱▱▱▱▱] 10%',
        '📀 [▰▰▱▱▱▱▱▱▱▱] 20%',
        '📀 [▰▰▰▱▱▱▱▱▱▱] 30%',
        '📀 [▰▰▰▰▱▱▱▱▱▱] 40%',
        '📀 [▰▰▰▰▰▱▱▱▱▱] 50%',
        '📀 [▰▰▰▰▰▰▱▱▱▱] 60%',
        '📀 [▰▰▰▰▰▰▰▱▱▱] 70%',
        '📀 [▰▰▰▰▰▰▰▰▱▱] 80%',
        '📀 [▰▰▰▰▰▰▰▰▰▱] 90%',
        '✅ [▰▰▰▰▰▰▰▰▰▰] 100%',
    ];

    let progressMessage = await conn.sendMessage(from, { text: `⏳ ${message}\n${bars[0]}` }, { quoted: mek });

    for (let i = 1; i < bars.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600)); // 600ms
        await conn.sendMessage(from, { edit: progressMessage.key, text: `⏳ ${message}\n${bars[i]}` }).catch(() => {});
    }

    await conn.sendMessage(from, { edit: progressMessage.key, text: `✅ *Download Complete!*` }).catch(() => {});
}

// Send Buttons with File Size Info
async function sendYTTemplate(conn, from, mek, type, yts, downloadData) {
    const { download_url, thumbnail, title, filesizeF } = downloadData;

    let caption = `🎬 *Title:* ${yts.title}
🕒 *Duration:* ${yts.timestamp}
👀 *Views:* ${yts.views}
👤 *Author:* ${yts.author.name}
📦 *Size:* ${filesizeF || 'Unknown'}
🔗 *Link:* ${yts.url}

> Powered by 𓆩SANIJA-MD𓆪 🎐`;

    const template = {
        image: { url: thumbnail || '' },
        caption,
        footer: `🔻 Select an option below`,
        buttons: [
            {
                buttonId: `download_${type} ${yts.url}`,
                buttonText: { displayText: `📥 Download ${type == 'video' ? 'Video' : 'Audio'} (${filesizeF})` },
                type: 1
            },
            {
                buttonId: `open ${yts.url}`,
                buttonText: { displayText: `🌐 Watch on YouTube` },
                type: 1
            }
        ]
    };

    await conn.sendMessage(from, template, { quoted: mek });
}

// Auto Fetch Video or Audio (Handles retry)
async function fetchDownload(type, url) {
    const apiUrl = type == 'video'
        ? `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(url)}`
        : `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(url)}`;

    let attempt = 0;
    let data;
    while (attempt < 3) {
        try {
            const response = await fetch(apiUrl);
            data = await response.json();
            if (data.status === 200 && data.success) break;
        } catch {}
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━
// Command: MP4 Download
cmd({
    pattern: "video",
    alias: ["mp4", "ytv"],
    react: "🎥",
    desc: "Download YouTube Video",
    category: "main",
    use: '.mp4 < YT url or Name >',
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply }) => {
    try {
        if (!q) return await reply("*🔍 Provide a YouTube URL or Video Name.*");

        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("❌ No results found!");

        let yts = yt.results[0];
        let data = await fetchDownload('video', yts.url);

        if (!data || data.status !== 200 || !data.result.download_url) {
            return reply("❌ Failed to fetch video. Please try later.");
        }

        await sendYTTemplate(conn, from, mek, 'video', yts, data.result);
        await fakeProgress(conn, from, mek, "Preparing your video...");
        await conn.sendMessage(from, { video: { url: data.result.download_url }, mimetype: "video/mp4" }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Unexpected error. Try again!");
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━
// Command: MP3 Download
cmd({
    pattern: "song",
    alias: ["yta", "mp3"],
    react: "🎶",
    desc: "Download YouTube Audio",
    category: "main",
    use: '.mp3 < YT url or Name >',
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply }) => {
    try {
        if (!q) return await reply("*🔍 Provide a YouTube URL or Song Name.*");

        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("❌ No results found!");

        let yts = yt.results[0];
        let data = await fetchDownload('audio', yts.url);

        if (!data || data.status !== 200 || !data.result.downloadUrl) {
            return reply("❌ Failed to fetch audio. Please try later.");
        }

        await sendYTTemplate(conn, from, mek, 'audio', yts, {
            download_url: data.result.downloadUrl,
            thumbnail: data.result.image,
            title: yts.title,
            filesizeF: data.result.filesizeF
        });
        await fakeProgress(conn, from, mek, "Preparing your song...");
        await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Unexpected error. Try again!");
    }
});
