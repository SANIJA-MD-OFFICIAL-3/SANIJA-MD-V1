const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch');

// Helper for Progress Bar
function createProgressBar(percentage) {
  const totalBlocks = 20;
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  return `⏳ [${'●'.repeat(filledBlocks)}${'○'.repeat(emptyBlocks)}] ${percentage}%`;
}

// Premium YTMP4 Command
cmd({
  pattern: "mp4",
  alias: ["video", "ytv"],
  react: "🎥",
  desc: "Download Youtube Video",
  category: "main",
  use: '.mp4 < YT url or Name >',
  filename: __filename
}, async (conn, mek, m, { from, q, reply, quoted }) => {
  try {
    if (!q) return reply("*Please provide a YouTube URL or Video Name.*");

    const yt = await ytsearch(q);
    if (yt.results.length < 1) return reply("No results found!");

    const yts = yt.results[0];
    const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;

    let response = await fetch(apiUrl);
    let data = await response.json();

    if (data.status !== 200 || !data.success || !data.result.download_url) {
      return reply("Failed to fetch the video. Try again later.");
    }

    let progressMessage = await conn.sendMessage(from, { text: createProgressBar(0) }, { quoted: mek });
    let percent = 0;
    let interval = setInterval(async () => {
      percent += 10;
      if (percent > 100) percent = 100;
      await conn.sendMessage(from, { edit: progressMessage.key, text: createProgressBar(percent) });
      if (percent === 100) clearInterval(interval);
    }, 1000);

    let ytmsg = `
🎵 *YouTube Video Downloader*

✨ *Title:* ${yts.title}
🕗 *Duration:* ${yts.timestamp}
📈 *Views:* ${yts.views}
👤 *Author:* ${yts.author.name}
🔗 *Link:* ${yts.url}

> *Powered by  💫 SANIJA-MD 🌐*`;

    const buttons = [
      { buttonId: `${config.prefix}cancel`, buttonText: { displayText: '❌ Cancel' }, type: 1 },
      { buttonId: `${config.prefix}doc`, buttonText: { displayText: '📄 Document' }, type: 1 },
      { buttonId: `${config.prefix}watch`, buttonText: { displayText: '▶️ Watch' }, type: 1 }
    ];

    await conn.sendMessage(from, {
      image: { url: data.result.thumbnail || '' },
      caption: ytmsg,
      buttons: buttons,
      headerType: 4
    }, { quoted: mek });

    setTimeout(async () => {
      await conn.sendMessage(from, { delete: progressMessage.key });
    }, 30000);

    await conn.sendMessage(from, { video: { url: data.result.download_url }, mimetype: 'video/mp4' }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply("Error occurred, please try again later.");
  }
});

// Premium YTMP3 Command
cmd({
  pattern: "mp3",
  alias: ["yta", "play"],
  react: "🎶",
  desc: "Download Youtube Audio",
  category: "main",
  use: '.mp3 < YT url or Name >',
  filename: __filename
}, async (conn, mek, m, { from, q, reply, quoted }) => {
  try {
    if (!q) return reply("*Please provide a YouTube URL or Song Name.*");

    const yt = await ytsearch(q);
    if (yt.results.length < 1) return reply("No results found!");

    const yts = yt.results[0];
    const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;

    let response = await fetch(apiUrl);
    let data = await response.json();

    if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
      return reply("Failed to fetch the audio. Try again later.");
    }

    let progressMessage = await conn.sendMessage(from, { text: createProgressBar(0) }, { quoted: mek });
    let percent = 0;
    let interval = setInterval(async () => {
      percent += 10;
      if (percent > 100) percent = 100;
      await conn.sendMessage(from, { edit: progressMessage.key, text: createProgressBar(percent) });
      if (percent === 100) clearInterval(interval);
    }, 1000);

    let ytmsg = `
🎵 *YouTube Audio Downloader*

✨ *Title:* ${yts.title}
🕗 *Duration:* ${yts.timestamp}
📈 *Views:* ${yts.views}
👤 *Author:* ${yts.author.name}
🔗 *Link:* ${yts.url}

> *Powered by  💫 SANIJA-MD 🌐*`;

    const buttons = [
      { buttonId: `${config.prefix}cancel`, buttonText: { displayText: '❌ Cancel' }, type: 1 },
      { buttonId: `${config.prefix}doc`, buttonText: { displayText: '📄 Document' }, type: 1 },
      { buttonId: `${config.prefix}listen`, buttonText: { displayText: '🎧 Listen' }, type: 1 }
    ];

    await conn.sendMessage(from, {
      image: { url: data.result.image || '' },
      caption: ytmsg,
      buttons: buttons,
      headerType: 4
    }, { quoted: mek });

    setTimeout(async () => {
      await conn.sendMessage(from, { delete: progressMessage.key });
    }, 30000);

    await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: 'audio/mpeg' }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply("Error occurred, please try again later.");
  }
});
