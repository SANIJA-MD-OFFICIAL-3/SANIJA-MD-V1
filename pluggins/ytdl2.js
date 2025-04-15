const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

// Video Downloader Command
cmd({  
    pattern: "video", 
    alias: ["mp4", "ytv"], 
    react: "🎥", 
    desc: "Download Youtube Video", 
    category: "main", 
    use: '.video <YouTube URL or Name>', 
    filename: __filename 
}, async (conn, mek, m, { from, q, reply }) => { 
    try { 
        if (!q) return await reply("*Please provide a YouTube URL or video name.*");

        const yt = await ytsearch(q);
        if (!yt.results || yt.results.length < 1) return reply("❌ No results found!");

        const yts = yt.results[0];  
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status !== 200 || !data.success || !data.result.download_url) {
            return reply("❌ Failed to fetch the video.");
        }

        const videoInfo = `🎬 *YOUTUBE VIDEO INFO*
        
📌 *Title:* ${yts.title}
⏱️ *Duration:* ${yts.timestamp}
👁️ *Views:* ${yts.views}
🎙️ *Author:* ${yts.author.name}
🔗 *Link:* ${yts.url}

Choose how you want to receive the video👇`;

        await conn.sendMessage(from, {
            image: { url: data.result.thumbnail },
            caption: videoInfo,
            buttons: [
                { buttonId: `video_file ${data.result.download_url}`, buttonText: { displayText: "📽️ Video File" }, type: 1 },
                { buttonId: `video_doc ${data.result.download_url}`, buttonText: { displayText: "📁 Document" }, type: 1 }
            ],
            footer: "Powered by SANIJA-MD",
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("An unexpected error occurred.");
    }
});

// Audio Downloader Command
cmd({ 
    pattern: "mp3", 
    alias: ["yta", "play"], 
    react: "🎶", 
    desc: "Download Youtube song",
    category: "main", 
    use: '.mp3 <YouTube URL or Name>', 
    filename: __filename 
}, async (conn, mek, m, { from, q, reply }) => { 
    try {
        if (!q) return await reply("*Please provide a YouTube URL or Song Name.*");

        const yt = await ytsearch(q);
        if (!yt.results || yt.results.length < 1) return reply("❌ No results found!");

        const yts = yt.results[0];  
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
            return reply("❌ Failed to fetch the audio.");
        }

        const audioMsg = `🎵 *YOUTUBE AUDIO INFO*

📌 *Title:* ${yts.title}
⏱️ *Duration:* ${yts.timestamp}
👁️ *Views:* ${yts.views}
🎙️ *Author:* ${yts.author.name}
🔗 *Link:* ${yts.url}

Choose how you want to receive the audio👇`;

        await conn.sendMessage(from, {
            image: { url: data.result.image },
            caption: audioMsg,
            buttons: [
                { buttonId: `audio_file ${data.result.downloadUrl}`, buttonText: { displayText: "🎧 Audio File" }, type: 1 },
                { buttonId: `audio_doc ${data.result.downloadUrl}`, buttonText: { displayText: "📁 Document" }, type: 1 }
            ],
            footer: "Powered by SANIJA-MD 🍉",
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("An unexpected error occurred.");
    }
});

// Button Handlers
cmd({ pattern: "video_file", hidden: true }, async (conn, mek, m, { from, args }) => {
    const url = args[0];
    await conn.sendMessage(from, { video: { url }, mimetype: "video/mp4" }, { quoted: mek });
});

cmd({ pattern: "video_doc", hidden: true }, async (conn, mek, m, { from, args }) => {
    const url = args[0];
    await conn.sendMessage(from, { document: { url }, mimetype: "video/mp4", fileName: "video.mp4" }, { quoted: mek });
});

cmd({ pattern: "audio_file", hidden: true }, async (conn, mek, m, { from, args }) => {
    const url = args[0];
    await conn.sendMessage(from, { audio: { url }, mimetype: "audio/mpeg" }, { quoted: mek });
});

cmd({ pattern: "audio_doc", hidden: true }, async (conn, mek, m, { from, args }) => {
    const url = args[0];
    await conn.sendMessage(from, { document: { url }, mimetype: "audio/mpeg", fileName: "audio.mp3" }, { quoted: mek });
});
