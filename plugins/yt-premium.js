const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require("node-fetch");

let activeDownloads = new Map();

/*
  𓆩SANIJA-MD𓆪 🎐 
  YouTube Downloader
  Split into: 
    ▶️ .ytv (Video Download)
    🎵 .yta (Audio Download)
*/

// ▶️ VIDEO DOWNLOAD - .ytv
cmd({
  pattern: "ytv",
  alias: ["youtubevideo", "ytmp4"],
  desc: "Download YouTube Video",
  category: "media",
  filename: __filename,
  use: '.ytv <url or search>'
}, async (conn, mek, m, { q, from, reply }) => {
  if (!q) return reply("*🎥 Provide a YouTube link or name to download video.*");

  try {
    const yt = await ytsearch(q);
    if (!yt.results.length) return reply("❌ No results found.");

    const vid = yt.results[0];
    const thumb = vid.thumbnail || "https://telegra.ph/file/36c1e1e487d9c39a8c1d0.jpg";

    const caption = `╔═══〔 *𓆩SANIJA-MD𓆪 🎐* 〕═══
║ 🎬 *Title:* ${vid.title}
║ ⏱️ *Duration:* ${vid.timestamp}
║ 👁️ *Views:* ${vid.views}
║ 🎙️ *Channel:* ${vid.author.name}
║ 🔗 *Link:* ${vid.url}
╚═══════════════════`;

    const buttons = [
      { buttonId: `download_video ${vid.url}`, buttonText: { displayText: "🎥 Download Video" }, type: 1 },
      { buttonId: `cancel_dl`, buttonText: { displayText: "❌ Cancel" }, type: 1 }
    ];

    await conn.sendMessage(from, {
      image: { url: thumb },
      caption,
      footer: "Powered by 𓆩SANIJA-MD𓆪 🎐",
      buttons,
      headerType: 4
    }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply("❌ Error occurred during video search.");
  }
});

// 🎵 AUDIO DOWNLOAD - .yta
cmd({
  pattern: "yta",
  alias: ["youtubemp3", "ytaudio"],
  desc: "Download YouTube Audio",
  category: "media",
  filename: __filename,
  use: '.yta <url or search>'
}, async (conn, mek, m, { q, from, reply }) => {
  if (!q) return reply("*🎶 Provide a YouTube link or name to download audio.*");

  try {
    const yt = await ytsearch(q);
    if (!yt.results.length) return reply("❌ No results found.");

    const vid = yt.results[0];
    const thumb = vid.thumbnail || "https://telegra.ph/file/36c1e1e487d9c39a8c1d0.jpg";

    const caption = `╔═══〔 *𓆩SANIJA-MD𓆪 🎐* 〕═══
║ 🎵 *Title:* ${vid.title}
║ ⏱️ *Duration:* ${vid.timestamp}
║ 👁️ *Views:* ${vid.views}
║ 🎙️ *Channel:* ${vid.author.name}
║ 🔗 *Link:* ${vid.url}
╚═══════════════════`;

    const buttons = [
      { buttonId: `download_audio ${vid.url}`, buttonText: { displayText: "🎶 Download Audio" }, type: 1 },
      { buttonId: `cancel_dl`, buttonText: { displayText: "❌ Cancel" }, type: 1 }
    ];

    await conn.sendMessage(from, {
      image: { url: thumb },
      caption,
      footer: "Powered by 𓆩SANIJA-MD𓆪 🎐",
      buttons,
      headerType: 4
    }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply("❌ Error occurred during audio search.");
  }
});

// 🔵 HANDLE BUTTON RESPONSES
cmd({ on: "text" }, async (conn, mek, m, { body, from, reply }) => {
  const [command, url] = body.split(" ");
  if (!["download_audio", "download_video", "cancel_dl"].includes(command)) return;

  if (command === "cancel_dl") {
    if (activeDownloads.has(from)) {
      clearTimeout(activeDownloads.get(from));
      activeDownloads.delete(from);
      return reply("✅ Download canceled successfully.");
    } else {
      return reply("❌ No active download to cancel.");
    }
  }

  const isAudio = command === "download_audio";
  const apiUrl = isAudio
    ? `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(url)}`
    : `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(url)}`;

  try {
    const progress = await conn.sendMessage(from, { text: `📀 [░░░░░░░░░░] 0% Starting...` }, { quoted: mek });

    let percent = 0;
    const bar = ["░", "▓"];
    const updateInterval = setInterval(async () => {
      percent += 10;
      if (percent > 100) return;

      const progBar = `📀 [${bar[1].repeat(percent / 10)}${bar[0].repeat(10 - percent / 10)}] ${percent}%`;
      await conn.sendMessage(from, { edit: progress.key, text: `⏳ Downloading...\n\n${progBar}` });
    }, 1000);

    activeDownloads.set(from, updateInterval);

    const res = await fetch(apiUrl);
    const data = await res.json();

    clearInterval(updateInterval);
    activeDownloads.delete(from);

    await conn.sendMessage(from, { delete: progress.key });

    if (!data.success || !(data.result.downloadUrl || data.result.download_url)) {
      return reply("❌ Failed to fetch media.");
    }

    const downloadUrl = data.result.downloadUrl || data.result.download_url;
    const fileTitle = (data.result.title || "File").replace(/[^\w\s]/gi, "");

    const sendOptions = isAudio
      ? { audio: { url: downloadUrl }, mimetype: "audio/mpeg" }
      : { video: { url: downloadUrl }, mimetype: "video/mp4" };

    await conn.sendMessage(from, sendOptions, { quoted: mek });

    // Also send as document
    await conn.sendMessage(from, {
      document: { url: downloadUrl },
      mimetype: sendOptions.mimetype,
      fileName: `${fileTitle}.${isAudio ? "mp3" : "mp4"}`,
      caption: `✅ Downloaded Successfully!\n\n🎵 *${fileTitle}*\n\n> Powered by 𓆩SANIJA-MD𓆪 🎐`
    }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply("❌ Error while downloading.");
  }
});
