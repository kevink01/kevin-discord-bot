import Client from './Client';

new Client({intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent']}).init();