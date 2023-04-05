const {SlashCommand, randint, shuffle} = require("../base.js");
const {
    open_bank,
    get_bank_data,
    update_bank,
    get_networth_lb,
} = require("../modules/bank_funcs.js");

const {EmbedBuilder, userMention} = require("discord.js");

const coinflip = new SlashCommand()
    .setName("coinflip")
    .setDescription("bet on tossing a coin")
    .addStringOption((option) =>
        option
            .setName("bet_on")
            .setDescription("select either heads or tails")
            .addChoices(
                {name: "heads", value: "heads"},
                {name: "tails", value: "tails"}
            )
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("amount")
            .setDescription("enter a positive integer")
            .setMinValue(500)
            .setMaxValue(5000)
            .setRequired(true)
    )
    .setDMPermission(false);
coinflip.callback(async (interaction) => {
    await interaction.deferReply();

    const user = interaction.user;
    const bet_on = interaction.options.getString("bet_on", true);
    const amount = interaction.options.getInteger("amount", true);

    await open_bank(user);
    const reward = Math.floor(amount / 2);
    const users = await get_bank_data(user);
    if (users[1] < amount)
        return await interaction.followUp("You don't have enough money");

    let coin = ["heads", "tails"];
    const result = coin[randint(0, 1)];

    if (result !== bet_on) {
        await update_bank(user, -amount);
        return await interaction.followUp(`Got ${result}, you lost ${amount}`);
    }

    await update_bank(user, +reward);
    await interaction.followUp(`Got ${result}, you won ${amount + reward}`);
});

const slots = new SlashCommand()
    .setName("slots")
    .setDescription("spin the slots and get reward")
    .addIntegerOption((option) =>
        option
            .setName("amount")
            .setDescription("enter a positive integer")
            .setMinValue(1000)
            .setMaxValue(10000)
            .setRequired(true)
    )
    .setDMPermission(false);
slots.callback(async (interaction) => {
    await interaction.deferReply();

    const user = interaction.user;
    const amount = interaction.options.getInteger("amount", true);

    await open_bank(user);
    if (!(amount >= 1000 && amount <= 10000))
        return await interaction.followUp(
            "You can only bet amount between 1000 and 10000"
        );

    const users = await get_bank_data(user);
    if (users[1] < amount)
        return await interaction.followUp("You don't have enough money");

    let slot1 = ["💝", "🎉", "💎", "💵", "💰", "🚀", "🍿"];
    let slot2 = ["💝", "🎉", "💎", "💵", "💰", "🚀", "🍿"];
    let slot3 = ["💝", "🎉", "💎", "💵", "💰", "🚀", "🍿"];
    const sep = " | ";
    const total = slot1.length;

    slot1 = shuffle(slot1);
    slot2 = shuffle(slot2);
    slot3 = shuffle(slot3);

    let mid;
    if (total % 2 === 0)
        // if even
        mid = Math.floor(total / 2);
    else mid = Math.floor((total + 1) / 2);

    const result = [];
    for (let x = 0; x < total; x++) result.push([slot1[x], slot2[x], slot3[x]]);

    const em = new EmbedBuilder().setDescription(
        "```" +
        `| ${result[mid - 1].join(sep)} |\n` +
        `| ${result[mid].join(sep)} | 📍\n` +
        `| ${result[mid + 1].join(sep)} |\n` +
        "```"
    );

    const slot = result[mid];
    const s1 = slot[0];
    const s2 = slot[1];
    const s3 = slot[2];

    let reward, content;
    if (s1 === s2 && s2 === s3 && s1 === s3) {
        reward = Math.floor(amount / 2);
        await update_bank(user, +reward);
        content = `Jackpot! you won ${amount + reward}`;
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        reward = Math.floor(amount / 4);
        await update_bank(user, +reward);
        content = `GG! you only won ${amount + reward}`;
    } else {
        await update_bank(user, -amount);
        content = `You lost ${amount}`;
    }

    await interaction.followUp({content: content, embeds: [em]});
});

const dice = new SlashCommand()
    .setName("dice")
    .setDescription("bet on number drawn from a rolling dice")
    .addIntegerOption((option) =>
        option
            .setName("amount")
            .setDescription("enter a positive number")
            .setMinValue(1000)
            .setMaxValue(5000)
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("bet_on")
            .setDescription("enter a number of dice, default: 6")
            .setMinValue(1)
            .setMaxValue(6)
            .setRequired(false)
    )
    .setDMPermission(false);
dice.callback(async (interaction) => {
    await interaction.deferReply();

    const user = interaction.user;
    const rdice = [1, 2, 3, 4, 5, 6];
    const amount = interaction.options.getInteger("amount", true);
    let bet_on = interaction.options.getInteger("bet_on", false);
    bet_on = bet_on || 6;

    const users = await get_bank_data(user);
    if (users[1] < amount)
        return await interaction.followUp(`You don't have enough money`);

    const rand_num = rdice[randint(0, rdice.length)];
    if (rand_num !== bet_on) {
        await update_bank(user, -amount);
        return await interaction.followUp(
            `Got ${rand_num}, you lost ${amount}`
        );
    }

    const reward = Math.floor(amount / 2);
    await update_bank(user, +reward);
    await interaction.followUp(`Got ${rand_num}, you won ${amount + reward}`);
});

module.exports = {
    setup: () => {
        console.log(`- ${__filename.slice(__dirname.length + 1)}`);
    },
};
