const { searchMovie, getMovie, downloadMovie } = require("mrnima-moviedl");

module.exports = {
  name: "sinhalasub",
  alias: ["moviedl", "getmovie"],
  description: "Download movies or get movie details from sinhalasub.lk",
  category: "media",
  usage: ".movie <movie name>",

  async run(m, { text, prefix, command }) {
    if (!text) return m.reply(`🔎 Usage: ${prefix}${command} <movie name>`);

    try {
      const results = await searchMovie(text);
      if (!results || results.length === 0) return m.reply("❌ Movie not found!");

      const movie = results[0]; // Take first match
      const movieData = await getMovie(movie.id);

      let message = `🎬 *Title:* ${movieData.title}
📆 *Year:* ${movieData.year}
🗂️ *Size:* ${movieData.size}
🧾 *Subtitles:* ${movieData.subtitles.join(", ")}
🔗 *Download link will be sent shortly...*`;

      await m.reply(message);

      const download = await downloadMovie(movie.id);

      // send movie file or download link
      if (download.type === "file" && download.file) {
        await m.sendMessage(m.chat, {
          document: { url: download.file },
          mimetype: "video/mp4",
          fileName: `${movieData.title}.mp4`,
        });
      } else if (download.type === "url" && download.url) {
        await m.reply(`🔗 *Download Link:* ${download.url}`);
      } else {
        await m.reply("⚠️ Failed to download the movie.");
      }
    } catch (err) {
      console.error(err);
      m.reply("❌ An error occurred while fetching the movie.");
    }
  },
};
