const Math = require("mathjs");
const {
    Client,
    GatewayIntentBits,
    Collection,
    SlashCommandBuilder,
} = require("discord.js");
const { sec } = require("mathjs");

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

class Cooldown {
    constructor() {
        this.userID = null;
        this.rate = 0;
        this.per = 0;
        this.cooldown = null;
    }

    setUserID(member_id) {
        this.userID = member_id;
        return this;
    }
    incRate(rate) {
        this.rate += rate;
        return this;
    }
    incPer(per) {
        this.per += per;
        return this;
    }
    setCooldown(date) {
        this.cooldown = date;
        return this;
    }
}

class SlashCommand {
    constructor(builder) {
        this.builder = builder;
        this.execute = null;
        this.per = null;
    }

    setCooldown(per) {
        this.per = per;
        client.cooldowns.set(this.builder.name, new Array());
        return this;
    }

    callback(coro) {
        this.execute = coro;
        client.commands.set(this.builder.name, this);
    }
}

function randint(min, max = null) {
    if (max === null) return Math.floor(Math.random() * min);

    return Math.floor(Math.random() * (max - min + 1) + min);
}

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
    if (secs_ <= 3600)
        return `${minutes}:${seconds}`;
    else if (secs_ < 24 * 3600)
        return `${hours}:${minutes}:${seconds}`;
    else
        return `${days} day(s)`;
}

module.exports = {
    client,
    SlashCommand,
    Cooldown,
    randint,
    time_convertor
};
