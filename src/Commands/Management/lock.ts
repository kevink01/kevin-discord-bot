import { PermissionFlagsBits, Role, TextChannel } from "discord.js";
import { Command } from "../../Interfaces";
import { resultPrint } from "../../Utility";

export const command: Command = {
  name: "lock",
  description: "Locks the current channel",
  permissions: ["ManageChannels"],
  aliases: ["l"],
  execute: async (message, client) => {
    let role: Role = client.config.defaults.memberRole;
    if (!role) {
      resultPrint(
        message,
        `Must have member role to lock channel.\nIf you want to setup a member role, use the setup slash command`,
        5000
      );
      return;
    }

    await (message.channel as TextChannel).permissionOverwrites
      .edit(role, {
        SendMessages: false,
      })
      .then(() => {
        resultPrint(
          message,
          `Successfully locked <#${message.channelId}>`,
          2000
        );
      })
      .catch((err) => {
        console.error(err);
        resultPrint(message, "Unable to lock channel", 2000);
      });
  },
};
