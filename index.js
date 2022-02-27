const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"] });
module.exports = { client, Discord };
const fs = require('fs');
const path = require('path');
const commandHandle = require('./Handlers/command-handle');
const eventHandle = require('./Handlers/event-handle.js');

const subDirectory = (file1, file2) => {
    if (file2 === null) {
        return false;
    }
    if (file2 === file1) {
        return true;
    }
    return subDirectory(file1, path.dirname(file2));
}

const read = (dir) => {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
        const stats = fs.lstatSync(path.join(__dirname, dir, file));
        if (stats.isDirectory()) {
            read(path.join(dir, file));
        }
        else {
            commands = require(path.join(__dirname, dir, file));
            if (dir === 'Events') {
                eventHandle(client, commands);
            }
            else if (dir === 'Commands' || subDirectory('Commands', dir)) {
                commandHandle(client, commands);
            }
        }
    }
}
console.log(`-> Registring folder: Commands`);
read('Commands');
console.log(`-> Registring folder: Events`);
read('Events');

client.login(process.env.TOKEN);