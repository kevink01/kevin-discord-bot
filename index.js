const Discord = require('discord.js');
const client = new Discord.Client({intents: ['GUILDS', "GUILD_MEMBERS"]});

client.on('ready', () => {
    console.log('Ready');
})

client.login(process.env.TOKEN);