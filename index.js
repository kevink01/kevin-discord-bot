const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"] });
module.exports = { client, Discord };
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const commandHandle = require('./Handlers/command-handle');
const eventHandle = require('./Handlers/event-handle.js');

client.commands = new Discord.Collection();

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
            console.log(`   >> Registring folder: ${file}`);
            read(path.join(dir, file));
            console.log(`      << Done with folder: ${file}`);
        }
        else {
            requirements = require(path.join(__dirname, dir, file));
            if (dir === 'Events') {
                eventHandle(client, requirements);
            }
            else if (dir === 'Commands' || subDirectory('Commands', dir)) {
                commandHandle(client, requirements);
            }
        }
    }
}
console.log('>> Registring folder: Commands');
read('Commands');
console.log('   << Finished reading Commands!');
console.log('>> Registring folder: Events');
read('Events');
console.log('   << Finished reading Events!');

console.log('>> Preparing to login');
client.login(process.env.TOKEN);