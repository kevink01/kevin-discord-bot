import { DMChannel, EmbedBuilder, GuildMember, Message } from "discord.js";
import { Command } from "../../Interfaces";
import { resultPrint, delay } from "../../Utility";

export const command: Command = {
  name: "kick",
  description: "Kick a member via mention or ID",
  minArgs: 1,
  args: [
    { argument: "user", required: true },
    { argument: "reason", required: false },
  ],
  permissions: ["KickMembers"],
  aliases: ["k", "boot"],
  examples: [
    { command: "kick @user", description: "Kick user with mention" },
    { command: "kick userID", description: "Kick user with ID" },
    {
      command: "kick userID reason",
      description: "Kick user & provide reason",
    },
  ],
  execute: async (message, client, args) => {
    let reason = args.slice(1).join(" ") ?? "Not specified";
    const user: GuildMember =
      (await message.mentions.members.first()) ||
      (await message.guild.members.cache.find((m) => m.id === args[0]));
    if (!user) {
      resultPrint(message, "Couldn't find user", 2000);
      return;
    }
    if (!user.kickable) {
      resultPrint(message, `Unable to kick member ${user.user.username}`, 2000);
      return;
    }
    const embed = new EmbedBuilder()
      .setColor("DarkOrange")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle(`You were kicked from ${message.guild.name}`)
      .addFields({ name: "Reason:", value: `${reason}` });
    user
      .createDM()
      .then(async (channel: DMChannel) => {
        channel.send({ embeds: [embed] }).catch((err) => {
          console.error(err);
          return;
        });
        user.kick(reason).then(async () => {
          await message
            .reply(`Successfully kicked ${user.user.username}`)
            .then(async (m: Message) => {
              await delay(2000);
              m.delete();
            });
          message.delete();
        });
      })
      .catch((err) => {
        console.error(err);
        user.kick(reason).then(async () => {
          await message
            .reply(`Successfully kicked ${user.user.username}`)
            .then(async (m: Message) => {
              await delay(2000);
              m.delete();
            });
          message.delete();
        });
        return;
      });
  },
};
