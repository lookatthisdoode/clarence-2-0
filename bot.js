require('dotenv').config()
const fs = require('node:fs')
const path = require('node:path')
const { Player } = require('discord-player')
const { Collection, Client, GatewayIntentBits } = require('discord.js')
const { log } = require('node:console')

const express = require('express')
const gTTS = require('gtts')
const { getVoiceConnection } = require('@discordjs/voice')

const app = express()

app.get('/', function (req, res) {
  const gtts = new gTTS('йахаай блять', 'ru')
  gtts.stream().pipe(res)
})
//make changes from /musicbot given params to play from browser

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    'GuildVoiceStates',
    'GuildMessages',
    'MessageContent',
  ],
})

client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    )
  }
}

// slash commands handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      })
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      })
    }
  }
})

//player initialisation
client.player = new Player(client, {
  leaveOnEmpty: false,
  skipFFmpeg: false,
  deafenOnJoin: true,
  lagMonitor: 1000,
  ytdlOptions: {
    filter: 'audioonly',
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
})

client.on('ready', () => {
  // console.log(client.player.scanDeps())
  console.log(`Logged in as ${client.user.tag}`)
})

client.player.events.on('playerStart', (queue, track) => {
  // we will later define queue.metadata object while creating the queue
  // queue.metadata.channel.send(`Started playing **${track.title}**!`)
  queue.metadata.channel.send({
    embeds: [
      {
        description: `Erhm, guys, allow me to play this **${track.title}** by ${track.author}`,
        // description: `**${track.title}** by ${track.author}`,
        Image: {
          url: track.thumbnail,
        },
        color: 0xffffff,
        //   timestamp: new Date(),
      },
    ],
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Clarence 2.0 running on port ${PORT}`)
})

client.login(process.env.BOT_TOKEN)

client.player.on('error', (error) => {
  console.log(error)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})
