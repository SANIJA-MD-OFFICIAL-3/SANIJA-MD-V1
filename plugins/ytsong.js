const { cmd, commands } = require('../command');
const yts = require('yt-search');
const ddownr = require('denethdev-ytmp3'); // Importing the denethdev-ytmp3 package for downloading

cmd({
  pattern: "song",
  desc: "Download songs.",
  category: "download",
  react: '🎧',
  filename: __filename
}, async (messageHandler, context, quotedMessage, { from, reply, q }) => {
  try {
    if (!q) return reply("*Please Provide A Song Name or Url 🙄*");
    
    // Search for the song using yt-search
    const searchResults = await yts(q);
    if (!searchResults || searchResults.videos.length === 0) {
      return reply("*No Song Found Matching Your Query 🧐*");
    }

    const songData = searchResults.videos[0];
    const songUrl = songData.url;

    // Using denethdev-ytmp3 to fetch the download link
    const result = await ddownr.download(songUrl, 'mp3'); // Download in mp3 format
    const downloadLink = result.downloadUrl; // Get the download URL

    let songDetailsMessage = `* SANIJA-MD ＹＯＵＴＵＢＥ ＡＵＤＩＯ ＤＬ*\n\n`;
    songDetailsMessage += `*⚜ Title:* ${songData.title}\n`;
    songDetailsMessage += `*👀 Views:* ${songData.views}\n`;
    songDetailsMessage += `*⏰ Duration:* ${songData.timestamp}\n`;
    songDetailsMessage += `*📆 Uploaded:* ${songData.ago}\n`;
    songDetailsMessage += `*📽 Channel:* ${songData.author.name}\n`;
    songDetailsMessage += `*🖇 URL:* ${songData.url}\n\n`;
    songDetailsMessage += `*Choose Your Download Format:*\n\n`;
    songDetailsMessage += `1 || Audio File 🎶\n`;
    songDetailsMessage += `2 || Document File 📂\n\n`;
    songDetailsMessage += `> SANIJA-MD ʙʏ SANIJA NIMTHARU®`;

    // Send the video thumbnail with song details
    const sentMessage = await messageHandler.sendMessage(from, {
      image: { url: songData.thumbnail },
      caption: songDetailsMessage,
    }, { quoted: quotedMessage });

    // Listen for the user's reply to select the download format
    messageHandler.ev.on("messages.upsert", async (update) => {
      const message = update.messages[0];
      if (!message.message || !message.message.extendedTextMessage) return;

      const userReply = message.message.extendedTextMessage.text.trim();

      // Handle the download format choice
      if (message.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id) {
        switch (userReply) {
          case '1': // Audio File
            await messageHandler.sendMessage(from, {
              audio: { url: downloadLink },
              mimetype: "audio/mpeg"
            }, { quoted: quotedMessage });
            break;
          case '2': // Document File
            await messageHandler.sendMessage(from, {
              document: { url: downloadLink },
              mimetype: 'audio/mpeg',
              fileName: `${songData.title}.mp3`,
              caption: `${songData.title}\n\n> SANIJA-MD ʙʏ SANIJA NIMTHARU®`
            }, { quoted: quotedMessage });
            break;
          default:
            reply("*Invalid Option. Please Select A Valid Option 🙄*");
            break;
        }
      }
    });
  } catch (error) {
    console.error(error);
    reply("*An Error Occurred While Processing Your Request 😔*");
  }
});


// youtube video downlode plugin

const { cmd } = require('../command');
const yts = require('yt-search');
const { ytmp4 } = require('@dark-yasiya/scrap');

cmd({
  pattern: "video",
  desc: "Download YouTube videos.",
  category: "download",
  react: '📹',
  filename: __filename
}, async (messageHandler, context, quotedMessage, { from, reply, q }) => {
  try {
    if (!q) return reply("*Please provide a video name or YouTube URL 🙄*");

    // Search on YouTube
    const searchResults = await yts(q);
    if (!searchResults || searchResults.videos.length === 0) {
      return reply("*No video found matching your query 🧐*");
    }

    const video = searchResults.videos[0];
    const ytUrl = video.url;

    // Get download link using @dark-yasiya/scrap
    const { title, result: { url: downloadUrl } } = await ytmp4(ytUrl);

    let msg = `*SANIJA-MD ＹＯＵＴＵＢＥ ＶＩＤＥＯ ＤＬ*\n\n`;
    msg += `*⚜ Title:* ${video.title}\n`;
    msg += `*👀 Views:* ${video.views}\n`;
    msg += `*⏰ Duration:* ${video.timestamp}\n`;
    msg += `*📆 Uploaded:* ${video.ago}\n`;
    msg += `*📽 Channel:* ${video.author.name}\n`;
    msg += `*🖇 URL:* ${video.url}\n\n`;
    msg += `*Choose Your Download Format:*\n\n`;
    msg += `1 || Video File 🎥\n`;
    msg += `2 || Document File 📂\n\n`;
    msg += `> SANIJA-MD ʙʏ SANIJA NIMTHARU®`;

    // Send thumbnail with caption
    const sent = await messageHandler.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: msg
    }, { quoted: quotedMessage });

    // Listen for user reply to choose format
    messageHandler.ev.on("messages.upsert", async (update) => {
      const m = update.messages[0];
      if (!m.message || !m.message.extendedTextMessage) return;

      const userInput = m.message.extendedTextMessage.text.trim();

      if (m.message.extendedTextMessage.contextInfo?.stanzaId === sent.key.id) {
        switch (userInput) {
          case '1':
            await messageHandler.sendMessage(from, {
              video: { url: downloadUrl },
              mimetype: 'video/mp4'
            }, { quoted: quotedMessage });
            break;
          case '2':
            await messageHandler.sendMessage(from, {
              document: { url: downloadUrl },
              mimetype: 'video/mp4',
              fileName: `${title}.mp4`,
              caption: `${title}\n\n> SANIJA-MD ʙʏ SANIJA NIMTHARU®`
            }, { quoted: quotedMessage });
            break;
          default:
            reply("*Invalid Option. Please select 1 or 2 🙄*");
        }
      }
    });

  } catch (err) {
    console.error(err);
    reply("*An error occurred while fetching the video 😔*");
  }
});




