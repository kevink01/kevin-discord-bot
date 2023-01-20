import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  Message,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../Interfaces";
import {
  choices,
  delay,
  editSetup,
  handleError,
  resetDefaults,
  startSetup,
} from "../Utility";

export const slashcommand: SlashCommand = {
  name: "setup",
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("setup the bot for the server")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  execute: async (interaction, client) => {
    await resetDefaults(client.config.defaults);
    const buttonFilter = (i: any) => i.user.id === interaction.user.id;
    const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle("Welcome to setup")
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setFields([
        {
          name: "Click the buttons below for more help",
          value: `Setup done by ${interaction.user.username}`,
          inline: true,
        },
      ])
      .setTimestamp();

    const buttonRow: ActionRowBuilder<ButtonBuilder> =
      new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
          .setCustomId("setup")
          .setLabel("Setup")
          .setEmoji("🛠️")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("edit")
          .setLabel("Edit config")
          .setEmoji("⚙️")
          .setStyle(ButtonStyle.Success)
          .setDisabled(
            Object.values(client.config.defaults || {}).filter(
              (v: any) => v !== undefined
            ).length
              ? false
              : true
          ),
        new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("Cancel setup")
          .setEmoji("❌")
          .setStyle(ButtonStyle.Danger),
      ]);
    if (
      Object.values(choices || {}).filter((v: any) => v !== undefined).length
    ) {
      embed
        .setTitle("The config has already been setup.")
        .setColor("NotQuiteBlack")
        .setFields(
          Object.entries(choices || {})
            .filter((value: [string, any]) => value[1] !== undefined)
            .map((value: [string, any]) => {
              return {
                name: value[0],
                value: value[1],
                inline: true,
              };
            })
        );
      embed.addFields([
        {
          name: "Either reset or edit",
          value: "Reset will start scratch",
          inline: false,
        },
      ]);
    }
    const collector = interaction.channel.createMessageComponentCollector({
      filter: buttonFilter,
      max: 1,
      maxUsers: 1,
    });
    collector.on("collect", async (i: ButtonInteraction) => {
      switch (i.customId) {
        case "setup":
          embed
            .setTitle("Beginning setup")
            .setDescription("Please give a few seconds")
            .setColor("Orange")
            .setFields();
          await i
            .update({ components: [], embeds: [embed] })
            .then(() => {
              collector.stop();
              choices.welcomeChannel = undefined;
              choices.logChannel = undefined;
              choices.memberRole = undefined;
              choices.muteRole = undefined;
              delay(2000).then(async () => {
                await startSetup(embed, i as ButtonInteraction).catch(
                  async (err) => {
                    await handleError(embed, i as ButtonInteraction, err).then(
                      () => {
                        return;
                      }
                    );
                  }
                );
              });
            })
            .catch(async (err) => {
              await handleError(embed, i as ButtonInteraction, err).then(() => {
                return;
              });
            });
          break;
        case "edit":
          embed
            .setTitle("Editing config")
            .setDescription("Please give a few seconds")
            .setColor("Orange")
            .setFields([]);
          i.update({ components: [], embeds: [embed] })
            .then(() => {
              collector.stop();
              delay(2000).then(async () => {
                await editSetup(embed, i as ButtonInteraction, true).catch(
                  async (err) => {
                    await handleError(embed, i as ButtonInteraction, err).then(
                      () => {
                        return;
                      }
                    );
                  }
                );
              });
            })
            .catch(async (err) => {
              await handleError(embed, i as ButtonInteraction, err).then(() => {
                return;
              });
            });
        case "cancel":
          embed
            .setTitle("Cancelling setup")
            .setDescription("Please give a few seconds")
            .setColor("Red")
            .setFields([]);
          i.update({ components: [], embeds: [embed] })
            .then(() => {
              collector.stop();
              delay(2000).then(async () => {
                i.deleteReply();
              });
            })
            .catch(async (err) => {
              await handleError(embed, i as ButtonInteraction, err).then(() => {
                return;
              });
            });
          break;
        default:
          break;
      }
    });
    interaction
      .reply({ components: [buttonRow], embeds: [embed] })
      .catch(async (err) => {
        await interaction.editReply({
          components: [buttonRow],
          embeds: [embed],
        });
        console.error(err);
        await interaction.channel
          .send("Unknown error. Please try again")
          .then((m: Message) => {
            delay(2000).then(() => {
              interaction.deleteReply().catch((err) => {
                console.error(err);
                return;
              });
              m.delete().catch((err) => {
                console.error(err);
                return;
              });
            });
          })
          .catch((err) => {
            console.error(err);
            return;
          });
      });
  },
};
