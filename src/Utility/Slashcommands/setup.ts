import {
  EmbedBuilder,
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  GuildBasedChannel,
  GuildTextBasedChannel,
  Role,
  StringSelectMenuInteraction,
  Collection,
  Message,
  StringSelectMenuBuilder,
} from "discord.js";
import { Defaults, delay, Setup } from "../";
import ExtendedClient from "../../Client";

/* Interface for storing choices */
interface DefaultsInterface {
  welcomeChannel: string;
  logChannel: string;
  memberRole: string;
  muteRole: string;
}

/* Selection Menu for choosing channels and roles from guild */
const selectMenu: ActionRowBuilder<StringSelectMenuBuilder> =
  new ActionRowBuilder<StringSelectMenuBuilder>();

/* Choices */
export const choices: DefaultsInterface = {
  welcomeChannel: undefined,
  logChannel: undefined,
  memberRole: undefined,
  muteRole: undefined,
};

/* Button Menu for choosing channels and roles */
export const selectionRow: ActionRowBuilder<ButtonBuilder> =
  new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId("default")
      .setLabel("Default")
      .setEmoji("❗")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("create")
      .setLabel("Create")
      .setEmoji("➕")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("find")
      .setLabel("Find")
      .setEmoji("🔍")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("skip")
      .setLabel("Skip")
      .setEmoji("⏩")
      .setStyle(ButtonStyle.Danger),
  ]);

/**
 * Creating a new setup
 * @param embed       : Embed to edit
 * @param interaction : Interaction to control
 */
export async function startSetup(
  embed: EmbedBuilder,
  interaction: ButtonInteraction
): Promise<void> {
  /* Row for choosing action for a completed setup */
  const editConfirmRow: ActionRowBuilder<ButtonBuilder> =
    new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("edit")
        .setLabel("Edit setup")
        .setEmoji("📝")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel setup")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Danger),
    ]);

  for (let j = 0; j < Object.keys(Setup).length; j++) {
    switch (j) {
      case 0:
      case 1:
        /* Choosing channels (welcome & log) */
        await chooseChannel(
          embed,
          interaction,
          j === 0 ? Setup.welcome : Setup.log
        )
          .then((value: string) => {
            if (j === 0) {
              choices.welcomeChannel = value;
            } else {
              choices.logChannel = value;
            }
          })
          .catch((err) => {
            throw new Error(err);
          });
        break;
      case 2:
      case 3:
        /* Choosing roles (member & muted) */
        await chooseRole(
          embed,
          interaction,
          j === 2 ? Setup.member : Setup.muted
        )
          .then((value: string) => {
            if (j === 2) {
              choices.memberRole = value;
            } else {
              choices.muteRole = value;
            }
          })
          .catch((err) => {
            throw new Error(err);
          });
        break;
      default:
        break;
    }
  }

  embed
    .setTitle("Do you want to confirm your selection?")
    .setDescription(getChoices())
    .setFields([]);
  await interaction
    .editReply({ components: [editConfirmRow], embeds: [embed] })
    .then(async () => {
      /* Listen to first button response */
      const buttonFilter = (i: any) => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter: buttonFilter,
        max: 1,
        maxUsers: 1,
      });

      collector.on("collect", async (i: ButtonInteraction) => {
        switch (i.customId) {
          case "confirm":
            /* Save changes */
            await confirmSetup(embed, interaction)
              .then(async () => {
                collector.stop();
                await delay(2000);
                embed
                  .setTitle("Finished setup!")
                  .setDescription("Goodbye!")
                  .setColor("Green")
                  .setFields([]);
                await interaction
                  .editReply({ components: [], embeds: [embed] })
                  .then(() => {
                    delay(2000)
                      .then(async () => {
                        await interaction
                          .deleteReply()
                          .then(() => {
                            return;
                          })
                          .catch((err) => {
                            throw new Error(err);
                          });
                      })
                      .catch((err) => {
                        throw new Error(err);
                      });
                  });
              })
              .catch((err) => {
                throw new Error(err);
              });
            break;
          case "edit":
            /* Edit the setup choices */
            await editSetup(embed, interaction, false)
              .then(() => {
                collector.stop();
              })
              .catch((err) => {
                throw new Error(err);
              });
            break;
          case "cancel":
            /* Cancel the setup */
            await cancelSetup(embed, interaction).then(
              async (value: boolean) => {
                collector.stop();
                /* If we cancel, unsaved progress is deleted */
                if (value === true) {
                  embed
                    .setTitle("Cancelling setup...")
                    .setDescription("Goodbye")
                    .setColor("Red")
                    .setFields([]);
                  await interaction
                    .editReply({ components: [], embeds: [embed] })
                    .then(() => {
                      delay(2000).then(() => {
                        interaction
                          .deleteReply()
                          .then(() => {
                            return;
                          })
                          .catch((err) => {
                            throw new Error(err);
                          });
                      });
                    })
                    .catch((err) => {
                      throw new Error(err);
                    });
                } else {
                  /* If we do not cancel, we assume confirmation */
                  await confirmSetup(embed, interaction)
                    .then(async () => {
                      embed
                        .setTitle("Finished setup!")
                        .setDescription("Goodbye!")
                        .setColor("Green")
                        .setFields([]);
                      await interaction
                        .editReply({ components: [], embeds: [embed] })
                        .then(() => {
                          delay(2000).then(async () => {
                            await interaction
                              .deleteReply()
                              .then(() => {
                                return;
                              })
                              .catch((err) => {
                                throw new Error(err);
                              });
                          });
                        })
                        .catch((err) => {
                          throw new Error(err);
                        });
                    })
                    .catch((err) => {
                      throw new Error(err);
                    });
                  return;
                }
              }
            );
            break;
          default:
            break;
        }
      });
      while (!collector.ended) {
        await delay(1000);
      }
      return;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

/**
 * Saves the setup choices to client
 * @param embed       : Embed to edit
 * @param interaction : Interaction to control
 */
export async function confirmSetup(
  embed: EmbedBuilder,
  interaction: ButtonInteraction
): Promise<void> {
  /* Update embed to only show changes we will save */
  let selections: string[] = Array(Object.keys(choices).length);
  for (const [key, value] of Object.entries(choices) as [string, string][]) {
    if (value !== undefined && value !== "skip") {
      switch (key) {
        case "welcomeChannel":
          selections.push(
            "**Welcome channel**: " +
              (value.startsWith("find") ? value.split(" ")[1] : value)
          );
          break;
        case "logChannel":
          selections.push(
            "**Log channel**: " +
              (value.startsWith("find") ? value.split(" ")[1] : value)
          );
          break;
        case "memberRole":
          selections.push(
            "**Member role**: " +
              (value.startsWith("find") ? value.split(" ")[1] : value)
          );
          break;
        case "muteRole":
          selections.push(
            "**Muted role**: " +
              (value.startsWith("find") ? value.split(" ")[1] : value)
          );
          break;
        default:
          break;
      }
    }
  }
  selections = selections.filter((value) => value !== undefined);
  /* Each choice will have emoji for progress */
  const status: string[] = Array(selections.length).fill("-");
  embed.setTitle("Attempting to confirm setup...").setDescription(
    status
      .map((value, index) => {
        return value + selections[index];
      })
      .join("\n") || "No choices"
  );
  let statusCounter: number = 0; // Counter for status
  await interaction
    .editReply({ components: [], embeds: [embed] })
    .then(async () => {
      if (choices.welcomeChannel) {
        if (choices.welcomeChannel === "default") {
          /* Default welcome channel: "welcome" */
          interaction.guild.channels
            .create({
              name: "welcome",
              type: ChannelType.GuildText,
              permissionOverwrites: [
                {
                  id: interaction.guild.roles.cache.find(
                    (r: Role) => r.name === "@everyone"
                  ).id,
                  allow: ["ViewChannel"],
                  deny: ["SendMessages", "AddReactions", "ManageMessages"],
                },
              ],
            })
            .then((channel: GuildTextBasedChannel) => {
              (
                interaction.client as ExtendedClient
              ).config.defaults.welcomeChannel = channel;
              status[statusCounter] = "✅";
              embed.setDescription(
                status
                  .map((value, index) => {
                    return value + selections[index];
                  })
                  .filter((value) => value !== "-")
                  .join("\n")
              );
              interaction
                .editReply({ components: [], embeds: [embed] })
                .then(async () => {
                  await delay(Math.random() * 3000);
                })
                .catch((err) => {
                  throw new Error(err);
                });
            })
            .catch((err) => {
              console.error(err);
              status[statusCounter] = "❌";
              embed.setDescription(
                status
                  .map((value, index) => {
                    return value + selections[index];
                  })
                  .filter((value) => value !== "-")
                  .join("\n")
              );
              interaction
                .editReply({ components: [], embeds: [embed] })
                .then(async () => {
                  await delay(Math.random() * 3000);
                })
                .catch((err) => {
                  throw new Error(err);
                });
            });
        } else if (choices.welcomeChannel.startsWith("create")) {
          /* Create welcome channel with user-entered name */
          interaction.guild.channels
            .create({
              name: choices.welcomeChannel.split(" ")[1],
              type: ChannelType.GuildText,
              permissionOverwrites: [
                {
                  id: interaction.guild.roles.cache.find(
                    (r: Role) => r.name === "@everyone"
                  ).id,
                  allow: ["ViewChannel"],
                  deny: ["SendMessages", "AddReactions", "ManageMessages"],
                },
              ],
            })
            .then((channel: GuildTextBasedChannel) => {
              (
                interaction.client as ExtendedClient
              ).config.defaults.welcomeChannel = channel;
              status[statusCounter] = "✅";
              embed.setDescription(
                status
                  .map((value, index) => {
                    return value + selections[index];
                  })
                  .filter((value) => value !== "-")
                  .join("\n")
              );
              interaction
                .editReply({ components: [], embeds: [embed] })
                .then(async () => {
                  await delay(Math.random() * 3000);
                })
                .catch((err) => {
                  throw new Error(err);
                });
            })
            .catch((err) => {
              console.error(err);
              status[statusCounter] = "❌";
              embed.setDescription(
                status
                  .map((value, index) => {
                    return value + selections[index];
                  })
                  .filter((value) => value !== "-")
                  .join("\n")
              );
              interaction
                .editReply({ components: [], embeds: [embed] })
                .then(async () => {
                  await delay(Math.random() * 3000);
                })
                .catch((err) => {
                  throw new Error(err);
                });
            });
        } else if (choices.welcomeChannel.startsWith("find")) {
          /* Set welcome channel to specific channel */
          const channel: GuildBasedChannel =
            interaction.guild.channels.cache.find(
              (c: GuildTextBasedChannel) =>
                c.id === choices.welcomeChannel.split(" ")[2] &&
                c.type === ChannelType.GuildText
            );
          if (!channel) {
            status[statusCounter] = "❌";
            embed.setDescription(
              status
                .map((value, index) => {
                  return value + selections[index];
                })
                .filter((value) => value !== "-")
                .join("\n")
            );
            interaction
              .editReply({ components: [], embeds: [embed] })
              .then(async () => {
                await delay(Math.random() * 3000);
              })
              .catch((err) => {
                throw new Error(err);
              });
          } else {
            (
              interaction.client as ExtendedClient
            ).config.defaults.welcomeChannel = channel as GuildTextBasedChannel;
            status[statusCounter] = "✅";
            embed.setDescription(
              status
                .map((value, index) => {
                  return value + selections[index];
                })
                .filter((value) => value !== "-")
                .join("\n")
            );
            interaction
              .editReply({ components: [], embeds: [embed] })
              .then(async () => {
                await delay(Math.random() * 3000);
              })
              .catch((err) => {
                throw new Error(err);
              });
          }
        }
        statusCounter++;
      }
      if (choices.logChannel) {
        if (choices.logChannel === "default") {
          /* Default log channel: logs */
          interaction.guild.channels
            .create({
              name: "logs",
              type: ChannelType.GuildText,
              permissionOverwrites: [
                {
                  id: interaction.guild.roles.cache.find(
                    (r: Role) => r.name === "@everyone"
                  ).id,
                  allow: ["ViewChannel"],
                  deny: ["SendMessages", "AddReactions", "ManageMessages"],
                },
              ],
            })
            .then((channel: GuildTextBasedChannel) => {
              (
                interaction.client as ExtendedClient
              ).config.defaults.logChannel = channel;
              status[statusCounter] = "✅";
              embed.setDescription(
                status
                  .map((value, index) => {
                    return value + selections[index];
                  })
                  .filter((value) => value !== "-")
                  .join("\n")
              );
              interaction
                .editReply({ components: [], embeds: [embed] })
                .then(async () => {
                  await delay(Math.random() * 3000);
                })
                .catch((err) => {
                  throw new Error(err);
                });
            })
            .catch((err) => {
              console.error(err);
              status[statusCounter] = "❌";
              embed.setDescription(
                status
                  .map((value, index) => {
                    return value + selections[index];
                  })
                  .filter((value) => value !== "-")
                  .join("\n")
              );
              interaction
                .editReply({ components: [], embeds: [embed] })
                .then(async () => {
                  await delay(Math.random() * 3000);
                })
                .catch((err) => {
                  throw new Error(err);
                });
            });
        } else if (choices.welcomeChannel.startsWith("create")) {
          /* Create log channel with user-entered name */
          interaction.guild.channels
            .create({
              name: choices.logChannel.split(" ")[1],
              type: ChannelType.GuildText,
              permissionOverwrites: [
                {
                  id: interaction.guild.roles.cache.find(
                    (r: Role) => r.name === "@everyone"
                  ).id,
                  allow: ["ViewChannel"],
                  deny: ["SendMessages", "AddReactions", "ManageMessages"],
                },
              ],
            })
            .then((channel: GuildTextBasedChannel) => {
              (
                interaction.client as ExtendedClient
              ).config.defaults.logChannel = channel;
              status[statusCounter] = "✅";
              embed.setDescription(
                status
                  .map((value, index) => {
                    return value + selections[index];
                  })
                  .filter((value) => value !== "-")
                  .join("\n")
              );
              interaction
                .editReply({ components: [], embeds: [embed] })
                .then(async () => {
                  await delay(Math.random() * 3000);
                })
                .catch((err) => {
                  throw new Error(err);
                });
            })
            .catch((err) => {
              console.error(err);
              status[statusCounter] = "❌";
              embed.setDescription(
                status
                  .map((value, index) => {
                    return value + selections[index];
                  })
                  .filter((value) => value !== "-")
                  .join("\n")
              );
              interaction
                .editReply({ components: [], embeds: [embed] })
                .then(async () => {
                  await delay(Math.random() * 3000);
                })
                .catch((err) => {
                  throw new Error(err);
                });
            });
        } else if (choices.welcomeChannel.startsWith("find")) {
          /* Set log channel to user-selected channel */
          const channel: GuildBasedChannel =
            interaction.guild.channels.cache.find(
              (c: GuildTextBasedChannel) =>
                c.id === choices.logChannel.split(" ")[2] &&
                c.type === ChannelType.GuildText
            );
          if (!channel) {
            status[statusCounter] = "❌";
            embed.setDescription(
              status
                .map((value, index) => {
                  return value + selections[index];
                })
                .filter((value) => value !== "-")
                .join("\n")
            );
            interaction
              .editReply({ components: [], embeds: [embed] })
              .then(async () => {
                await delay(Math.random() * 3000);
              })
              .catch((err) => {
                throw new Error(err);
              });
          } else {
            (interaction.client as ExtendedClient).config.defaults.logChannel =
              channel as GuildTextBasedChannel;
            status[statusCounter] = "✅";
            embed.setDescription(
              status
                .map((value, index) => {
                  return value + selections[index];
                })
                .filter((value) => value !== "-")
                .join("\n")
            );
            interaction
              .editReply({ components: [], embeds: [embed] })
              .then(async () => {
                await delay(Math.random() * 3000);
              })
              .catch((err) => {
                throw new Error(err);
              });
          }
        }
        statusCounter++;
      }
      if (choices.memberRole) {
        let role: Role = undefined;
        let roleStatus: boolean = false;
        if (choices.memberRole === "default") {
          /* Default member role: Member */
          interaction.guild.roles
            .create({
              name: "Member",
              mentionable: false,
              color: "White",
              permissions: [
                "ChangeNickname",
                "Connect",
                "ReadMessageHistory",
                "SendMessages",
                "SendMessagesInThreads",
                "Speak",
                "Stream",
                "UseExternalEmojis",
                "UseExternalStickers",
                "UseVAD",
                "ViewChannel",
              ],
            })
            .then((r: Role) => {
              role = r;
              (
                interaction.client as ExtendedClient
              ).config.defaults.memberRole = r;
              roleStatus = true;
            })
            .catch((err) => {
              status[statusCounter] = "❌";
              roleStatus = true;
              throw new Error(err);
            });
        } else if (choices.memberRole.startsWith("create")) {
          /* Create member role with user-entered name */
          interaction.guild.roles
            .create({
              name: choices.memberRole.split(" ")[1],
              mentionable: false,
              color: "White",
              permissions: [
                "ChangeNickname",
                "Connect",
                "ReadMessageHistory",
                "SendMessages",
                "SendMessagesInThreads",
                "Speak",
                "Stream",
                "UseExternalEmojis",
                "UseExternalStickers",
                "UseVAD",
                "ViewChannel",
              ],
            })
            .then((r: Role) => {
              role = r;
              (
                interaction.client as ExtendedClient
              ).config.defaults.memberRole = r;
              roleStatus = true;
            })
            .catch((err) => {
              status[statusCounter] = "❌";
              roleStatus = true;
              throw new Error(err);
            });
        } else if (choices.memberRole.startsWith("find")) {
          /* Resolve member role with user-selected choice */
          const findRole: Role = interaction.guild.roles.cache.find(
            (r: Role) => r.id === choices.memberRole.split(" ")[2]
          );
          if (!findRole) {
            status[statusCounter] = "❌";
            roleStatus = true;
          } else {
            role = findRole;
            (interaction.client as ExtendedClient).config.defaults.memberRole =
              findRole;
            roleStatus = true;
          }
        }
        while (!role && !roleStatus) {
          await delay(1000);
        }
        if (role) {
          /* Member role will create verification channel */
          interaction.guild.channels
            .create({
              name: "verified",
              type: ChannelType.GuildText,
              permissionOverwrites: [
                {
                  id: interaction.guild.roles.cache.find(
                    (r: Role) => r.name === "@everyone"
                  ).id,
                  allow: ["SendMessages", "ViewChannel"],
                },
                {
                  id: role.id,
                  deny: ["ViewChannel"],
                },
              ],
            })
            .then((verified: GuildBasedChannel) => {
              /* Setup permissions for server
                 Permissions will prevent non-verified users from accessing server
              */
              interaction.guild.channels.cache.forEach(
                (c: GuildBasedChannel) => {
                  switch (c.type) {
                    case ChannelType.GuildText:
                    case ChannelType.GuildAnnouncement:
                      /* Everyone won't be able to view channels
                         Members will view every channel besides verification channel
                      */
                      c.permissionOverwrites
                        .edit(
                          c.id !== verified.id
                            ? interaction.guild.roles.cache.find(
                                (r: Role) => r.name === "@everyone"
                              )
                            : role,
                          {
                            ViewChannel: false,
                          }
                        )
                        .catch((err) => {
                          status[statusCounter] = "❌";
                          throw new Error(err);
                        });
                      /* Only members will see channels besides verification
                       */
                      c.permissionOverwrites
                        .edit(
                          c.id !== verified.id
                            ? role
                            : interaction.guild.roles.cache.find(
                                (r: Role) => r.name === "@everyone"
                              ),
                          {
                            AddReactions: true,
                            SendMessages: true,
                            SendMessagesInThreads: true,
                            UseExternalEmojis: true,
                            UseExternalStickers: true,
                            ViewChannel: true,
                          }
                        )
                        .catch((err) => {
                          status[statusCounter] = "❌";
                          throw new Error(err);
                        });
                      break;
                    case ChannelType.GuildVoice:
                      /* Everyone won't be able to see voice channels */
                      c.permissionOverwrites
                        .edit(
                          c.id !== verified.id
                            ? interaction.guild.roles.cache.find(
                                (r: Role) => r.name === "@everyone"
                              )
                            : role,
                          {
                            ViewChannel: false,
                          }
                        )
                        .catch((err) => {
                          status[statusCounter] = "❌";
                          throw new Error(err);
                        });
                      /* Members will only be able to connect to voice channels */
                      c.permissionOverwrites
                        .edit(
                          c.id !== verified.id
                            ? role
                            : interaction.guild.roles.cache.find(
                                (r: Role) => r.name === "@everyone"
                              ),
                          {
                            Connect: true,
                            Speak: true,
                            Stream: true,
                            UseVAD: true,
                            ViewChannel: true,
                          }
                        )
                        .catch((err) => {
                          status[statusCounter] = "❌";
                          throw new Error(err);
                        });
                      break;
                    default:
                      break;
                  }
                }
              );
            })
            .catch((err) => {
              console.error(err);
              status[statusCounter] = "❌";
            });
          if (status[statusCounter] === "-") {
            status[statusCounter] = "✅";
          }
        }
        embed.setDescription(
          status
            .map((value, index) => {
              return value + selections[index];
            })
            .filter((value) => value !== "-")
            .join("\n")
        );
        interaction
          .editReply({ components: [], embeds: [embed] })
          .then(async () => {
            await delay(Math.random() * 3000);
          })
          .catch((err) => {
            throw new Error(err);
          });
        statusCounter++;
      }
      if (choices.muteRole) {
        let role: Role = undefined;
        let roleStatus: boolean = false;
        if (choices.muteRole === "default") {
          /* Default mute role: Muted */
          interaction.guild.roles
            .create({
              name: "Muted",
              mentionable: false,
              color: "Grey",
              position: 2,
              permissions: ["ReadMessageHistory"],
            })
            .then((r: Role) => {
              role = r;
              (interaction.client as ExtendedClient).config.defaults.muteRole =
                r;
              roleStatus = true;
            })
            .catch((err) => {
              status[statusCounter] = "❌";
              roleStatus = true;
              throw new Error(err);
            });
        } else if (choices.muteRole.startsWith("create")) {
          /* Create mute role with user-entered name */
          interaction.guild.roles
            .create({
              name: choices.muteRole.split(" ")[1],
              mentionable: false,
              color: "Grey",
              permissions: ["ReadMessageHistory"],
            })
            .then((r: Role) => {
              role = r;
              (interaction.client as ExtendedClient).config.defaults.muteRole =
                r;
              roleStatus = true;
            })
            .catch((err) => {
              status[statusCounter] = "❌";
              roleStatus = true;
              throw new Error(err);
            });
        } else if (choices.muteRole.startsWith("find")) {
          /* Set mute role to user-selected role */
          const findRole: Role = interaction.guild.roles.cache.find(
            (r: Role) => r.id === choices.muteRole.split(" ")[2]
          );
          if (!findRole) {
            status[statusCounter] = "❌";
            roleStatus = true;
          } else {
            role = findRole;
            (interaction.client as ExtendedClient).config.defaults.muteRole =
              findRole;
            roleStatus = true;
          }
        }
        while (!role && !roleStatus) {
          await delay(1000);
        }
        if (role) {
          interaction.guild.channels.cache.forEach((c: GuildBasedChannel) => {
            switch (c.type) {
              case ChannelType.GuildText:
              case ChannelType.GuildAnnouncement:
                /* Muted members cannot send message */
                c.permissionOverwrites
                  .edit(role, {
                    AddReactions: false,
                    SendMessages: false,
                    SendMessagesInThreads: false,
                  })
                  .catch((err) => {
                    status[statusCounter] = "❌";
                    throw new Error(err);
                  });
                break;
              case ChannelType.GuildVoice:
                /* Muted members cannot interact in voice channels */
                c.permissionOverwrites
                  .edit(role, {
                    Connect: false,
                    Speak: false,
                    Stream: false,
                    UseVAD: false,
                  })
                  .catch((err) => {
                    status[statusCounter++] = "❌";
                    throw new Error(err);
                  });
                break;
              default:
                break;
            }
          });
          if (status[statusCounter] === "-") {
            status[statusCounter] = "✅";
          }
          statusCounter++;
        }
        embed.setDescription(
          status
            .map((value, index) => {
              return value + selections[index];
            })
            .filter((value) => value !== "-")
            .join("\n")
        );
        interaction
          .editReply({ components: [], embeds: [embed] })
          .then(async () => {
            await delay(Math.random() * 3000);
          })
          .catch((err) => {
            throw new Error(err);
          });
      }
    })
    .catch((err) => {
      throw new Error(err);
    });
}

/**
 * Edits a setup
 * @param embed       : Embed to edit
 * @param interaction : Interaction to control
 * @param edit        : Flag for editing saved or current setup
 */
export async function editSetup(
  embed: EmbedBuilder,
  interaction: ButtonInteraction,
  edit: boolean
): Promise<void> {
  /* Row for making edits */
  const buttonFilter = (i: any) => i.user.id === interaction.user.id;
  const confirmRow: ActionRowBuilder<ButtonBuilder> =
    new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success),
    ]);
  /* Add all configuration options */
  confirmRow.addComponents(
    Object.entries(Setup).map(([str, value]: [string, Setup]) => {
      return new ButtonBuilder()
        .setCustomId(value)
        .setLabel(value)
        .setStyle(ButtonStyle.Primary);
    })
  );
  // TODO: Menus?
  let editFirstResponse: boolean =
    false; /* If we are editing current setup, only reset choices ONCE */
  let done: boolean = false; /* Flag for breaking out of while loop */
  let response: boolean = false; /* Wait for a response */
  while (!done) {
    response = false;
    embed
      .setTitle(edit ? "Changes we will make:" : "What do you want to edit?")
      .setDescription(getChoices())
      .setColor("Green")
      .setFields([]);
    await interaction
      .editReply({ components: [confirmRow], embeds: [embed] })
      .then(async () => {
        const collector = interaction.channel.createMessageComponentCollector({
          filter: buttonFilter,
          max: 1,
          maxUsers: 1,
        });
        collector.on("collect", async (i: ButtonInteraction) => {
          /* Only clear choices when editing saved setup */
          if (edit && !editFirstResponse) {
            choices.welcomeChannel = undefined;
            choices.logChannel = undefined;
            choices.memberRole = undefined;
            choices.muteRole = undefined;
          }
          switch (i.customId) {
            case "confirm":
              /* Confirm the changes */
              await confirmSetup(embed, interaction)
                .then(async () => {
                  embed
                    .setTitle("Finished setup!")
                    .setDescription("Goodbye!")
                    .setColor("Green")
                    .setFields([]);
                  await interaction
                    .editReply({ components: [], embeds: [embed] })
                    .then(() => {
                      delay(2000).then(async () => {
                        await interaction
                          .deleteReply()
                          .then(() => {
                            done = true;
                            response = true;
                          })
                          .catch((err) => {
                            throw new Error(err);
                          });
                      });
                    })
                    .catch((err) => {
                      throw new Error(err);
                    });
                })
                .catch((err) => {
                  throw new Error(err);
                });
              break;
            case Setup.welcome:
              /* Edit welcome channel selection */
              await chooseChannel(embed, interaction, Setup.welcome)
                .then((value: string) => {
                  choices.welcomeChannel = value;
                  if (edit) {
                    editFirstResponse = true;
                  }
                  response = true;
                })
                .catch((err) => {
                  throw new Error(err);
                });
              break;
            case Setup.log:
              /* Edit log channel selection */
              await chooseChannel(embed, interaction, Setup.log)
                .then((value: string) => {
                  choices.logChannel = value;
                  if (edit) {
                    editFirstResponse = true;
                  }
                  response = true;
                })
                .catch((err) => {
                  throw new Error(err);
                });
              break;
            case Setup.member:
              /* Edit member role selection */
              await chooseRole(embed, interaction, Setup.member)
                .then((value: string) => {
                  choices.memberRole = value;
                  if (edit) {
                    editFirstResponse = true;
                  }
                  response = true;
                })
                .catch((err) => {
                  throw new Error(err);
                });
              break;
            case Setup.muted:
              /* Edit muted role selection */
              await chooseRole(embed, interaction, Setup.muted)
                .then((value: string) => {
                  choices.muteRole = value;
                  if (edit) {
                    editFirstResponse = true;
                  }
                  response = true;
                })
                .catch((err) => {
                  throw new Error(err);
                });
              break;
            default:
              break;
          }
        });
        while (!collector.ended || !response) {
          await delay(1000);
        }
        collector.stop();
      })
      .catch((err) => {
        throw new Error(err);
      });
  }
}

/**
 * Loads the choices if the setup was already saved
 * @param defaults : Defaults to load
 */
export async function resetDefaults(defaults: Defaults): Promise<void> {
  choices.welcomeChannel = defaults.welcomeChannel?.name ?? undefined;
  choices.logChannel = defaults.logChannel?.name ?? undefined;
  choices.memberRole = defaults.memberRole?.name ?? undefined;
  choices.muteRole = defaults.muteRole?.name ?? undefined;
}

/**
 * If we run into an error, update embed
 * @param embed         : Embed to edit
 * @param interaction   : Interaction to control
 * @param err           : Error message
 * @returns
 */
export async function handleError(
  embed: EmbedBuilder,
  interaction: ButtonInteraction,
  err: any
): Promise<void> {
  try {
    console.error(err);
    embed
      .setTitle("Something went wrong")
      .setDescription("Cancelling setup")
      .setColor("Red")
      .setFields([]);
    /* Try to edit the interaction */
    await interaction
      .editReply({ components: [], embeds: [embed] })
      .then(() => {
        delay(2000).then(() => {
          interaction.deleteReply();
        });
      });
  } catch (err) {
    console.error(err);
  } finally {
    return;
  }
}

/**
 * Attempts to cancel the setup
 * @param embed         : Embed to edit
 * @param interaction   : Interaction to control
 * @returns
 */
async function cancelSetup(
  embed: EmbedBuilder,
  interaction: ButtonInteraction
): Promise<boolean> {
  const buttonFilter = (i: any) => i.user.id === interaction.user.id;
  let response: boolean = false;

  /* Yes & no buttons */
  const confirmRow: ActionRowBuilder<ButtonBuilder> =
    new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setCustomId("yes")
        .setLabel("Yes")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("no")
        .setLabel("No")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Success),
    ]);

  embed
    .setTitle("Are you sure you want to cancel?")
    .setDescription("All unsaved progress will be lost")
    .setColor("Orange")
    .setFields([
      {
        name: "Warning",
        value: "Rejecting cancellation will begin setup",
        inline: true,
      },
    ]);
  await interaction
    .editReply({ components: [confirmRow], embeds: [embed] })
    .then(async () => {
      /* Listen to first button click */
      const collector = interaction.channel.createMessageComponentCollector({
        filter: buttonFilter,
        max: 1,
        maxUsers: 1,
      });
      collector.on("collect", (i: ButtonInteraction) => {
        if (i.customId === "yes") {
          response = true;
        } else {
          response = false;
        }
      });
      while (!collector.ended) {
        await delay(1000);
      }
      collector.stop();
    })
    .catch((err) => {
      throw new Error(err);
    });
  return response;
}

/**
 * Interaction to choose a channel
 * @param embed         : Embed to edit
 * @param interaction   : Interaction to control
 * @param choice        : Choice to make
 * @returns             : String choice
 */
async function chooseChannel(
  embed: EmbedBuilder,
  interaction: ButtonInteraction,
  choice: string
): Promise<string> {
  let response: string = "";
  let answer: boolean = false;
  /* If creating a channel, listen to user's messages */
  const messageFilter = async (m: Message) =>
    m.author.id === interaction.user.id;
  const buttonFilter = (i: any) => i.user.id === interaction.user.id;
  switch (choice) {
    case Setup.welcome:
      embed
        .setTitle(Setup.welcome)
        .setDescription("Do you want to setup a welcome channel?")
        .setColor("Green")
        .setFields([
          {
            name: "Warning",
            value:
              "No welcome channel will make system channel the welcome channel",
          },
        ]);
      break;
    case Setup.log:
      embed
        .setTitle(Setup.log)
        .setDescription("Do you want to setup a log channel?")
        .setColor("Green")
        .setFields([
          {
            name: "Warning",
            value: "No log channel will make system channel the log channel",
          },
        ]);
      break;
    default:
      break;
  }
  await interaction
    .editReply({ components: [selectionRow], embeds: [embed] })
    .catch((err) => {
      throw new Error(err);
    });
  /* Listen to first button click */
  const collector = interaction.channel.createMessageComponentCollector({
    filter: buttonFilter,
    max: 1,
    maxUsers: 1,
  });
  collector.on("collect", async (i: ButtonInteraction) => {
    switch (i.customId) {
      case "default":
        /* Will set this to default choices */
        embed
          .setTitle(
            `${choice === Setup.welcome ? "Welcome" : "Logs"} channel selection`
          )
          .setDescription("default")
          .setColor("Yellow")
          .setFields([
            {
              name: "Channel name",
              value: choice === Setup.welcome ? "welcome" : "logs",
              inline: true,
            },
          ]);
        response = "default";
        await interaction
          .editReply({
            components: [selectionRow],
            embeds: [embed],
          })
          .then(() => {
            collector.stop();
          })
          .catch((err) => {
            throw new Error(err);
          });
        answer = true;
        break;
      case "create":
        /* Allow the user to create a channel with a name */
        embed.setFields([
          {
            name: "Create",
            value: "Please type out the channel name",
            inline: true,
          },
        ]);
        await interaction
          .editReply({ components: [], embeds: [embed] })
          .then(async () => {
            await interaction.channel
              .awaitMessages({ filter: messageFilter, max: 1 })
              .then(async (collection: Collection<string, Message>) => {
                const message: Message = collection.first();
                const content = message.content.toLowerCase();
                embed
                  .setTitle(
                    `${
                      choice === Setup.welcome ? "Welcome" : "Logs"
                    } channel selection`
                  )
                  .setDescription("create")
                  .setColor("Yellow")
                  .setFields([
                    { name: "Channel name", value: content, inline: true },
                  ]);
                response = "create " + content;
                await interaction
                  .editReply({
                    components: [],
                    embeds: [embed],
                  })
                  .then(() => {
                    collector.stop();
                    message.delete().catch((err) => {
                      throw new Error(err);
                    });
                  })
                  .catch((err) => {
                    throw new Error(err);
                  });
                answer = true;
              })
              .catch((err) => {
                throw new Error(err);
              });
          })
          .catch((err) => {
            throw new Error(err);
          });
        break;
      case "find":
        /* Let user to select exisitng channel */
        selectMenu.setComponents(
          new StringSelectMenuBuilder()
            .setCustomId("channels")
            .setPlaceholder(
              choice === Setup.welcome
                ? "Select welcome channel"
                : "Select log channel"
            )
            .setOptions(
              interaction.guild.channels.cache
                .filter(
                  (c: GuildBasedChannel) => c.type === ChannelType.GuildText
                )
                .map((c: GuildTextBasedChannel) => {
                  return {
                    label: c.id,
                    description: c.name,
                    value: c.name + " " + c.id,
                  };
                })
                .sort((a, b) => {
                  return a.value > b.value ? 1 : a.value < b.value ? -1 : 0;
                })
            )
        );
        await interaction
          .editReply({
            components: [selectMenu],
            embeds: [embed],
          })
          .then(async () => {
            /* Listen to first selected channel */
            const channelCollector =
              interaction.channel.createMessageComponentCollector({
                filter: buttonFilter,
                max: 1,
                maxUsers: 1,
              });
            channelCollector.on(
              "collect",
              async (i: StringSelectMenuInteraction) => {
                let selection: string;
                await i.guild.channels
                  .fetch(i.values[0].split(" ")[1])
                  .then((c: GuildBasedChannel) => {
                    selection = c.name;
                  })
                  .catch((err) => {
                    throw new Error(err);
                  });
                embed
                  .setTitle(
                    `${
                      choice === Setup.welcome ? "Welcome" : "Logs"
                    } channel selection`
                  )
                  .setDescription("find")
                  .setColor("Yellow")
                  .setFields([
                    { name: "Channel name", value: selection, inline: true },
                  ]);
                response = "find " + selection;
                await interaction
                  .editReply({
                    components: [selectionRow],
                    embeds: [embed],
                  })
                  .then(() => {
                    collector.stop();
                  })
                  .catch((err) => {
                    throw new Error(err);
                  });
                answer = true;
              }
            );
          })
          .catch((err) => {
            throw new Error(err);
          });

        break;
      case "skip":
        /* Let user to skip channel setup */
        embed
          .setTitle(
            `${choice === Setup.welcome ? "Welcome" : "Logs"} channel selection`
          )
          .setDescription("skip")
          .setColor("Yellow")
          .setFields([]);
        response = "skip";
        await interaction
          .editReply({
            components: [selectionRow],
            embeds: [embed],
          })
          .then(() => {
            collector.stop();
          })
          .catch((err) => {
            throw new Error(err);
          });
        answer = true;
        break;
      default:
        collector.stop();
        break;
    }
  });
  while (!answer) {
    await delay(1000);
  }
  await delay(2000);
  return response;
}

/**
 * Interaction to choose a role
 * @param embed         : Embed to edit
 * @param interaction   : Interaction to control
 * @param choice        : Choice to make
 * @returns             : String choice
 */
async function chooseRole(
  embed: EmbedBuilder,
  interaction: ButtonInteraction,
  choice: string
): Promise<string> {
  let response: string = "";
  let answer: boolean = false;
  /* Only listen to user messages when creating role */
  const messageFilter = async (m: Message) =>
    m.author.id === interaction.user.id;
  const buttonFilter = (i: any) => i.user.id === interaction.user.id;
  switch (choice) {
    case Setup.member:
      embed
        .setTitle(Setup.member)
        .setDescription("Do you want to setup a member role?")
        .setColor("Green")
        .setFields([
          {
            name: "Warning",
            value: "A member role will implement verification",
          },
        ]);
      break;
    case Setup.muted:
      embed
        .setTitle(Setup.muted)
        .setDescription("Do you want to setup a mute role?")
        .setColor("Green")
        .setFields([]);
      break;
    default:
      break;
  }
  await interaction
    .editReply({ components: [selectionRow], embeds: [embed] })
    .catch((err) => {
      throw new Error(err);
    });
  /* Listen to first button click */
  const collector = interaction.channel.createMessageComponentCollector({
    filter: buttonFilter,
    max: 1,
    maxUsers: 1,
  });
  collector.on("collect", async (i: ButtonInteraction) => {
    switch (i.customId) {
      case "default":
        /* Create role with default name */
        embed
          .setTitle(
            `${choice === Setup.member ? "Member" : "Muted"} role selection`
          )
          .setDescription("default")
          .setColor("Yellow")
          .setFields([
            {
              name: "Role name",
              value: choice === Setup.member ? "Member" : "Muted",
              inline: true,
            },
          ]);
        response = "default";
        await interaction
          .editReply({
            components: [selectionRow],
            embeds: [embed],
          })
          .catch((err) => {
            throw new Error(err);
          });
        answer = true;
        break;
      case "create":
        /* Create role with user-entered name */
        embed.setFields([
          {
            name: "Create",
            value: "Please type out the role name",
            inline: true,
          },
        ]);
        await interaction
          .editReply({ components: [], embeds: [embed] })
          .then(async () => {
            await interaction.channel
              .awaitMessages({ filter: messageFilter, max: 1 })
              .then(async (collection: Collection<string, Message>) => {
                const message: Message = collection.first();
                const content = message.content.toLowerCase();
                embed
                  .setTitle(
                    `${
                      choice === Setup.member ? "Member" : "Muted"
                    } role selection`
                  )
                  .setDescription("create")
                  .setColor("Yellow")
                  .setFields([
                    { name: "Member name", value: content, inline: true },
                  ]);
                response = "create " + content;
                await interaction
                  .editReply({
                    components: [],
                    embeds: [embed],
                  })
                  .then(() => {
                    message.delete().catch((err) => {
                      throw new Error(err);
                    });
                  })
                  .catch((err) => {
                    throw new Error(err);
                  });
                answer = true;
              })
              .catch((err) => {
                throw new Error(err);
              });
          })
          .catch((err) => {
            throw new Error(err);
          });
        break;
      case "find":
        /* Set role to user-selected role */
        selectMenu.setComponents(
          new StringSelectMenuBuilder()
            .setCustomId("roles")
            .setPlaceholder(
              choice === Setup.member
                ? "Select member role"
                : "Select mute role"
            )
            .setOptions(
              interaction.guild.roles.cache
                .map((r: Role) => {
                  return {
                    label: r.id,
                    description: r.name,
                    value: r.name + " " + r.id,
                  };
                })
                .sort((a, b) => {
                  return a.value > b.value ? 1 : a.value < b.value ? -1 : 0;
                })
            )
        );
        await interaction
          .editReply({
            components: [selectMenu],
            embeds: [embed],
          })
          .then(async () => {
            /* Listen to first role selection */
            const roleCollector =
              interaction.channel.createMessageComponentCollector({
                filter: buttonFilter,
                max: 1,
                maxUsers: 1,
              });
            roleCollector.on(
              "collect",
              async (i: StringSelectMenuInteraction) => {
                let selection: string;
                await i.guild.roles
                  .fetch(i.values[0].split(" ")[1])
                  .then((r: Role) => {
                    selection = r.name;
                  })
                  .catch((err) => {
                    throw new Error(err);
                  });
                embed
                  .setTitle(
                    `${
                      choice === Setup.member ? "Member" : "Muted"
                    } role selection`
                  )
                  .setDescription("find")
                  .setColor("Yellow")
                  .setFields([
                    { name: "Role name", value: selection, inline: true },
                  ]);
                response = "find " + selection;
                await interaction
                  .editReply({
                    components: [selectionRow],
                    embeds: [embed],
                  })
                  .catch((err) => {
                    throw new Error(err);
                  });
                answer = true;
              }
            );
          })
          .catch((err) => {
            throw new Error(err);
          });

        break;
      case "skip":
        /* Let user skip role setup */
        embed
          .setTitle(
            `${choice === Setup.member ? "Member" : "Muted"} role selection`
          )
          .setDescription("skip")
          .setColor("Yellow")
          .setFields([]);
        response = "skip";
        await interaction
          .editReply({
            components: [selectionRow],
            embeds: [embed],
          })
          .catch((err) => {
            throw new Error(err);
          });
        answer = true;
        break;
      default:
        collector.stop();
        break;
    }
  });
  while (!answer) {
    await delay(1000);
  }
  await delay(2000);
  return response;
}

/**
 * Gets selections to set embed description
 *
 * @returns String of choices
 */
function getChoices(): string {
  const results: string[] = Array(Object.keys(choices).length).fill("");
  for (const [key, value] of Object.entries(choices) as [string, string][]) {
    switch (key) {
      case "welcomeChannel":
        value !== undefined
          ? (results[0] =
              "**Welcome channel**: " +
              (value.startsWith("find") ? value.split(" ")[1] : value))
          : "";
        break;
      case "logChannel":
        value !== undefined
          ? (results[1] =
              "**Log channel**: " +
              (value.startsWith("find") ? value.split(" ")[1] : value))
          : "";
        break;
      case "memberRole":
        value !== undefined
          ? (results[2] =
              "**Member role**: " +
              (value.startsWith("find") ? value.split(" ")[1] : value))
          : "";
        break;
      case "muteRole":
        value !== undefined
          ? (results[3] =
              "**Muted role**: " +
              (value.startsWith("find") ? value.split(" ")[1] : value))
          : "";
        break;
      default:
        break;
    }
  }
  return results.filter((value: string) => value !== "").join("\n");
}
