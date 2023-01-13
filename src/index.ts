import Client from './Client';

new Client({intents: [
    'AutoModerationExecution',
    'DirectMessages',
    'Guilds', 
    'GuildMessages', 
    'GuildMembers', 
    'MessageContent'
]}).init();