const { client, Discord } = require('../index');
module.exports = {
    name: 'ready',
    once: true,
    invites: new Discord.Collection(),
    execute() {
        console.log('The bot is online!');
        client.guilds.cache.forEach(guild => {
            let inviteList = new Discord.Collection();
            guild.invites.fetch().then(async (invite) => {
                invite.forEach(inv => {
                    inviteList.set(inv.code, inv.uses);
                })
                if (guild.vanityURLCode !== null) {
                    await guild.fetchVanityData().then(link => inviteList.set(guild.vanityURLCode, link.uses));
                }
                this.invites.set(guild.id, inviteList);
            })
        })
    }
}