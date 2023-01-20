
# Kevin Discord bot
> Welcome! This is a bot coded by Kevin :) 

This bot is 100% coded in JavaScript using the Discord JS API.

## Some notes:
1. This bot was originally designed for one server. However, I extended this for multiple servers. 
2. I learned how to code a Discord bot through tutorials and documentation.
3. This bot is to reflect my coding skills. It is mainly for hobby use, not for deploying to multiple servers. However, this bot could theoretically support multiple servers.

# How to setup
1) Invite the bot to your server.
2) The bot will create a role for itself. You can delete this role if you want. However, it needs a role with Administrative permissions.
3) Type ```+setup``` in any channel to follow the setup. Feel free to run this command again to change these settings. 
4) For more information on commands, type ```+help``` (or with the server prefix)

## Some noteable commands:
1) Setting up server settings (such as prefix)
2) A help command for finding information about commands.
3) Retrieving last deleted message
4) Bulk delete messages
5) Add/remove/modify emojis
6) Retrieving information about user accounts.
7) NFL Pickem command[^1] (Discontinued for now)

## Features
1) Command handler for handling commands
    - Bot is setup for the server
    - User has permissions to do such
    - Correct arguments
2) Sends 2 embeds when user joins server
    - Welcome channel (Joined time & member count)
    - Log channel (Created account & which link they used)
3) Event handler for handling events
4) Deleting messages on intervals (i.e. setup command)


## Useful links:
- [Visit my page!](https://github.com/kevink01)
- [Discord.js documentation](https://discord.js.org/#/docs/discord.js/stable/general/welcome)

Other tools used:
- Visual studio code
- Github

[^1]: Because of the end of the 2021-2022 NFL season, this command will be discontinued until the next NFL season.
