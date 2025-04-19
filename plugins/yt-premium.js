// yt-premium.js

const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch');

async function fakeProgress(conn, from, mek, message) {
    const bars = [
        '📀 [▀▁▁▁▁▁▁▁▁▁] 10%',
        '📀 [▀▀▁▁▁▁▁▁▁▁] 20%',
        '📀 [▀▀▀▁▁▁▁▁▁▁] 30%',
        '📀 [▀▀▀▀▁▁▁▁▁▁] 40%',
        '📀 [▀▀▀▀▀▁▁▁▁▁] 50%',
        '📀 [▀▀▀▀▀▀▁▁▁▁] 60%',
        '📀 [▀▀▀▀▀▀▀▁▁▁] 70%',
        '📀 [▀▀▀▀▀▀▀▀▁▁] 80%',
        '📀 [▀▀▀▀▀▀▀▀▀▁] 90%',
        '✅ [▀▀▀▀▀▀▀▀▀▀] 100%',
    ];

    let progressMessage = await conn.sendMessage(from, { text: `⏳ ${message}\n${bars[0]}` }, { quoted: mek });

    for (let i = 1; i < bars.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await conn.sendMessage(from, { edit: progressMessage.key, text: `⏳ ${message}\n${bars[i]}` }).catch(() => {});
    }

    await conn.sendMessage(from, { edit: progressMessage.key, text: `✅ *Download Complete!*` }).catch(() => {});
}

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

async function sendYTTemplate(conn, from, mek, type, yts, downloadData) {
    const { download_url, thumbnail, title, filesizeF } = downloadData;

    let caption = `🎬 *Title:* ${yts.title}\n`
                + `🕒 *Duration:* ${yts.timestamp}\n`
                + `👀 *Views:* ${yts.views}\n`
                + `👤 *Author:* ${yts.author.name}\n`
                + `📦 *Size:* ${filesizeF || 'Unknown'}\n`
                + `🔗 *Link:* ${yts.url}\n\n`
                + `> Powered by 𓆩SANIJA-MD𓆪 🎐`;

    const template = {
        image: { url: thumbnail || '' },
        caption,
        footer: `🔻 Choose below`,
        buttons: [
            {
                buttonId: `download_${type} ${yts.url}`,
                buttonText: { displayText: `📥 Download ${type == 'video' ? 'Video' : 'Audio'}` },
                type: 1
            },
            {
                buttonId: `cancel_download`,
                buttonText: { displayText: `❌ Cancel Download` },
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

// Commands
cmd({ pattern: "mp4", alias: ["video", "ytv"], react: "🎥", desc: "YouTube Video", category: "main", use: '.mp4 <query>', filename: __filename },
async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply("❌ Provide a YouTube URL or Name.");
    const yt = await ytsearch(q);
    if (yt.results.length < 1) return reply("❌ No result found!");
    let yts = yt.results[0];
    let data = await fetchDownload('video', yts.url);
    if (!data) return reply("❌ Failed to fetch video.");
    await sendYTTemplate(conn, from, mek, 'video', yts, data.result);
});

cmd({ pattern: "mp3", alias: ["yta", "play"], react: "🎶", desc: "YouTube Audio", category: "main", use: '.mp3 <query>', filename: __filename },
async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply("❌ Provide a YouTube URL or Name.");
    const yt = await ytsearch(q);
    if (yt.results.length < 1) return reply("❌ No result found!");
    let yts = yt.results[0];
    let data = await fetchDownload('audio', yts.url);
    if (!data) return reply("❌ Failed to fetch audio.");
    await sendYTTemplate(conn, from, mek, 'audio', yts, {
        download_url: data.result.downloadUrl,
        thumbnail: data.result.image,
        title: yts.title,
        filesizeF: data.result.filesizeF
    });
});

// Button Handler
cmd({ on: "text" }, async (conn, mek, m, { from, body, reply }) => {
    try {
        if (body.startsWith("download_video ")) {
            let url = body.split(" ")[1];
            if (!url) return reply("❌ URL missing!");
            await fakeProgress(conn, from, mek, "Downloading your video...");
            let data = await fetchDownload('video', url);
            if (!data) return reply("❌ Fetch error.");
            await conn.sendMessage(from, { video: { url: data.result.download_url }, mimetype: "video/mp4" }, { quoted: mek });
        } else if (body.startsWith("download_audio ")) {
            let url = body.split(" ")[1];
            if (!url) return reply("❌ URL missing!");
            await fakeProgress(conn, from, mek, "Downloading your song...");
            let data = await fetchDownload('audio', url);
            if (!data) return reply("❌ Fetch error.");
            await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });
        } else if (body === "cancel_download") {
            await conn.sendMessage(from, { text: "🚫 Download cancelled by user!" }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        reply("❌ Error occured!");
    }
});
