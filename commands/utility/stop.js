const { SlashCommandBuilder } = require("discord.js")
const { useQueue } = require("discord-player")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fuckoffclarence")
    .setDescription("Kicks Clarence out of the room"),
  async execute(interaction) {
    await interaction.deferReply()
    const queue = useQueue(interaction.guild.id)
    queue.delete()
    // player.destroy()

    await interaction.followUp(`Those brutal words hurt me`)
  },
}

