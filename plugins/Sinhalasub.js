const axios = require('axios');
const fs = require('fs');
const path = require('path');

class SinhalaSubMoviePlugin {
  constructor() {
    this.apiKey = "sky|be538a46034c192460b9ac614a00d705c7fbd7cb";
    this.apiBase = "https://api.skymansion.site/movies-dl/search";
  }

  async searchMovie(query) {
    const res = await axios.get(this.apiBase, {
      params: {
        q: query,
        api_key: this.apiKey
      }
    });

    if (res.data && res.data.success && res.data.result.length > 0) {
      return res.data.result[0]; // pick first result
    }
    throw new Error('Movie not found.');
  }

  async sendMovieSelection(ctx, movieName) {
    try {
      const movie = await this.searchMovie(movieName);

      if (!movie.download || movie.download.length === 0) {
        throw new Error('No download links available.');
      }

      const qualityButtons = movie.download.map(dl => ({
        buttonId: `movie_dl_${Buffer.from(dl.url).toString('base64')}`, // Encode URL
        buttonText: { displayText: `🎥 ${dl.quality}` },
        type: 1
      }));

      await ctx.sendMessage(ctx.chat, {
        text: `🎬 *${movie.title}*\n\nChoose your preferred quality:\n\n©️ SANIJA-MD`,
        buttons: qualityButtons,
        headerType: 1
      });

    } catch (err) {
      console.error(err);
      await ctx.reply('❌ Movie not found or no download links.');
    }
  }

  async downloadMovie(url, filename) {
    const filePath = path.resolve(__dirname, filename);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  }

  async handleQualityDownload(ctx, encodedUrl) {
    try {
      const url = Buffer.from(encodedUrl, 'base64').toString('ascii');
      const filename = `SANIJA-MD_${Date.now()}.mp4`;

      await ctx.reply('⏳ Downloading movie file, please wait...\n\n©️ SANIJA-MD');
      const filePath = await this.downloadMovie(url, filename);

      await ctx.reply('⏫ Uploading movie file, please wait...\n\n©️ SANIJA-MD');
      await ctx.sendMessage(ctx.chat, {
        document: fs.readFileSync(filePath),
        mimetype: 'video/mp4',
        fileName: filename
      });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error(err);
      await ctx.reply('❌ Failed to download or upload the movie.');
    }
  }
}

module.exports = new SinhalaSubMoviePlugin();
