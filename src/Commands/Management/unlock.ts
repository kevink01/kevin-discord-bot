import { PermissionFlagsBits, Role, TextChannel } from "discord.js";
import { Command } from "../../Interfaces";
import { resultPrint } from "../../Utility";

export const command: Command = {
  name: "unlock",
  description: "Unocks the current channel",
  permissions: ["ManageChannels"],
  aliases: ["ul"],
  execute: async (message, client) => {
    let role: Role = client.config.defaults.memberRole;
    if (!role) {
      resultPrint(
        message,
        `Must have member role to unlock channel.\nIf you want to setup a member role, use the setup slash command`,
        5000
      );
      return;
    }

    await (message.channel as TextChannel).permissionOverwrites
      .edit(role, { SendMessages: true })
      .then(() => {
        resultPrint(
          message,
          `Successfully unlocked <#${message.channelId}>`,
          2000
        );
      })
      .catch((err) => {
        console.error(err);
        resultPrint(message, "Unable to unlock channel", 2000);
      });
  },
};
