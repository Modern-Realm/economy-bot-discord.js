const {
    Client,
    GatewayIntentBits,
    Collection,
    SlashCommandBuilder,
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
client.cooldowns = new Collection();


class SlashCommand extends SlashCommandBuilder {
    constructor() {
        super();
        this.execute = null;
        this.per = null;
    }

    setCooldown(per) {
        this.per = per;
        client.cooldowns.set(this.name, []);
        return this;
    }


    /**
     *
     * @param {Function} coro
     */
    callback(coro) {
        this.execute = coro;
        client.commands.set(this.name, this);
    }
}

/**
 *
 * @param {number} min
 * @param {number | null} max
 * @returns number
 */
function randint(min, max = null) {
    if (max === null) return Math.floor(Math.random() * min);

    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 *
 * @param {Array} array
 * @returns Array
 */
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

/**
 *
 * @param {number} milliseconds
 * @returns string
 */
function time_convertor(milliseconds) {
    const secs_ = Math.floor(milliseconds / 1000);
    let secs = secs_;

    const days = Math.floor(secs / (24 * 3600));
    secs %= 3600 * 24;

    const hours = Math.floor(secs / 3600);
    secs %= 3600;

    const minutes = Math.floor(secs / 60);
    secs %= 60;

    const seconds = secs;
    if (secs_ <= 3600) return `${minutes}:${seconds}`;
    else if (secs_ < 24 * 3600) return `${hours}:${minutes}:${seconds}`;
    else return `${days} day(s)`;
}

module.exports = {
    client,
    SlashCommand,
    randint,
    shuffle,
    time_convertor,
};
