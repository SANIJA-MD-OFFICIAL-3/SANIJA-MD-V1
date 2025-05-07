const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

// API LINK
const apilink = 'https://dizer-adaderana-news-api.vercel.app/news'; 

cmd({
    pattern: "derananews",
    alias: ["derana", "news3"],
    react: "📑",
    desc: "",
    category: "news",
    use: '.derana',
    filename: __filename
},
async (conn, mek, m, { from, quoted }) => {
    try {
        // Fetch news data from the API
        const response = await axios.get(apilink);
        const news = response.data[0]; // Access the first item of the array

        // Construct the message
        const msg = `
           📑 SANIJA MD DERANA NEWS 📑

* Title - ${news.title || 'Not available'}
* News - ${news.description || 'Not available'}
* Date - ${news.time || 'Not available'}
* Link - ${news.new_url || 'Not available'}

> *© (◕‿↼)  𝓟𝓞𝓦𝓔𝓡𝓔𝓓 𝓑𝓨 𝓢𝓐𝓝𝓘𝓙𝓐-𝓜𝓓-𝓿1 ✾*
        `;

        // Send the news as a message
        await conn.sendMessage(from, { 
            image: { url: news.image || '' }, 
            caption: msg 
        }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply('⚠️ An Error Occured. Cannot get the details from the API');
    }
});
