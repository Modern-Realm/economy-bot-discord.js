const Math = require("mathjs");
const {
    Client,
    GatewayIntentBits,
    Collection,
    SlashCommandBuilder
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.commands = new Collection();

class SlashCommand {
    constructor(builder) {
        this.builder = builder;
        this.execute = null;
    }

    callback(coro) {
        this.execute = coro;
        client.commands.set(this.builder.name, this);
    }
};

function randint(min, max = null) {
    if (max === null)
        return Math.floor(Math.random() * min);

    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    client,
    SlashCommand,
    randint
}
