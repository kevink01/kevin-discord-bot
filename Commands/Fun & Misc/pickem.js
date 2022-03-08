const { schedule, byeWeeks } = require('../../Utility/Pickem/schedule');
const { footballEmotes } = require('../../Utility/Pickem/nflEmoji.js');

module.exports = {
    name: 'pickem',
    args: `<week>`,
    minArgs: 1,
    maxArgs: 1,
    permissions: ['ADMINISTRATOR'],
    description: 'Provides with a pickem layout for a given week',
    examples: [
        '+pickem 3 -> Provides pickem for week 3'
    ],
    async execute(message, args) {
        if (isNaN(args[0])) {
            message.channel.send(`Please enter a number between 1-18.`);
            return;
        }
        let week = parseInt(args[0]);   // Gets week number
        if (week < 1 || week > 18) {
            message.channel.send("Must be between Week 1-18!");
            return;
        }

        let lines = schedule[week].split("\n");
        message.channel.send(`**Week ${week}**`);

        for (let line of lines) {
            if (line.indexOf(',') != -1) {
                message.channel.send(`*${line.trim()}*`);   // Has day in the title
            }
            else {
                let words = line.trim().split(' ');

                let team1 = words[words.indexOf('@') - 1];
                if (team1 === 'Team') {
                    team1 = 'Football '.concat(team1);
                }
                let team2 = words[words.length - 1];
                if (team2 === 'Team') {
                    team2 = 'Football '.concat(team2);
                }

                let emote1 = message.guild.emojis.cache.get(footballEmotes[team1]);
                words.unshift(`${emote1}`);
                let emote2 = message.guild.emojis.cache.get(footballEmotes[team2]);
                words.splice(words.indexOf('@') + 1, 0, `${emote2}`);

                let lastMessage = await message.channel.send(`**${words.join(' ')}**`);
                lastMessage.react(footballEmotes[team1]);
                lastMessage.react(footballEmotes[team2]);
            }
        }
        let byes = byeWeeks[week];
        if (byes) {
            message.channel.send(`**Bye Week:**`)
            let lines = byes.split("\n");
            for (let teams of lines) {
                let team = teams.trim().split(" ");
                let teamName = team[team.length - 1];
                if (teamName === 'Team') {
                    teamName = 'Football '.concat(teamName);
                }
                let emote = message.guild.emojis.cache.get(footballEmotes[teamName]);
                team.unshift(`${emote}`);
                message.channel.send(`**${team.join(' ')}**`);
            }

        }
    }
}