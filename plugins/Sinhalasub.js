const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = "sky|be538a46034c192460b9ac614a00d705c7fbd7cb";
const API_BASE = "https://api.skymansion.site/movies-dl/search";

module.exports = {
  name: 'sinhalasub',
  alias: [],
  category: 'Movies',
  desc: '🎬 Download movies directly from SinhalaSub (Button Mode)',
  use: '<movie name>',

  async run({ conn, m, text, prefix }) {
    if (!text) {
      return m.reply(`🎬 Please provide a movie name!\n\n_Example:_ ${prefix}sinhalasub Deadpool`);
    }

    try {
      await m.react('🎬'); // React when starting search

      const res = await axios.get(API_BASE, {
        params: {
          q: text,
          api_key: API_KEY
        }
      });

      if (!res.data || !res.data.success || res.data.result.length === 0) {
        await m.react('❌');
        return m.reply('❌ Movie not found on SinhalaSub.');
      }

      const movie = res.data.result[0];
      const downloadOptions = movie.download;

      if (!downloadOptions || downloadOptions.length === 0) {
        await m.react('❌');
        return m.reply('❌ No available download links for this movie.');
      }

      // Create buttons for each available quality
      const buttons = downloadOptions.map(dl => ({
        buttonId: `dl_movie_${Buffer.from(JSON.stringify(dl)).toString('base64')}`,
        buttonText: { displayText: `🎥 ${dl.quality}` },
        type: 1
      }));

      await conn.sendMessage(m.chat, {
        text: `🎬 *${movie.title}*\n\n🔰 Select your preferred quality to download:\n\n©️ SANIJA-MD`,
        buttons,
        headerType: 1
      }, { quoted: m });

    } catch (err) {
      console.error(err);
      await m.react('⚠️');
      await conn.reply(m.chat, '❌ Error fetching movie data.', m);
    }
  },

  async before({ conn, m }) {
    if (!m.buttonId) return;

    if (m.buttonId.startsWith('dl_movie_')) {
      try {
        const encoded = m.buttonId.split('dl_movie_')[1];
        const downloadInfo = JSON.parse(Buffer.from(encoded, 'base64').toString('ascii'));

        const url = downloadInfo.url;
        const quality = downloadInfo.quality;
        const fileName = `SANIJA-MD_${Date.now()}_${quality}.mp4`;
        const tempFilePath = path.join(__dirname, fileName);

        await m.react('📥'); // React when downloading starts

        await conn.reply(m.chat, `⏳ Downloading *${quality}* quality movie...\n\nPlease wait...\n\n©️ SANIJA-MD`, m);

        const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream'
        });

        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        await m.react('📤'); // React when uploading starts

        await conn.reply(m.chat, '⏫ Uploading movie file...\n\nAlmost done!\n\n©️ SANIJA-MD', m);

        await conn.sendMessage(m.chat, {
          document: fs.readFileSync(tempFilePath),
          mimetype: 'video/mp4',
          fileName: fileName
        }, { quoted: m });

        fs.unlinkSync(tempFilePath); // Delete temp file after sending
        await m.react('✅'); // Finished successfully!

      } catch (err) {
        console.error(err);
        await m.react('❌');
        await conn.reply(m.chat, '❌ Failed to download or upload the movie.', m);
      }
    }
  }
};
