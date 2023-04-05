const {SlashCommand} = require("../base.js");
const {
    open_bank,
    get_bank_data,
    update_bank,
    get_networth_lb,
} = require("../modules/bank_funcs.js");

const {EmbedBuilder, userMention} = require("discord.js");

const balance = new SlashCommand()
    .setName("balance")
    .setDescription("get bank balance")
    .addUserOption((option) =>
        option
            .setName("member")
            .setDescription("target @member")
            .setRequired(false)
    )
    .setDMPermission(false);
balance.callback(async (interaction) => {
    await interaction.deferReply();
    const member = interaction.options.getUser("member", false);
    const user = member || interaction.user;
    if (user.bot) return await interaction.followUp("Bot's don't have account");
    await open_bank(user);

    const users = await get_bank_data(user);
    const wallet_amt = users[1];
    const bank_amt = users[2];
    let net_amt = wallet_amt + bank_amt;

    const em = new EmbedBuilder()
        .setAuthor({name: user.username, iconURL: user.displayAvatarURL()})
        .setDescription(
            `Wallet: ${wallet_amt}\n` +
            `Bank: ${bank_amt}\n` +
            `Net: ${net_amt}`
        )
        .setColor(0x00ff00);

    await interaction.followUp({embeds: [em]});
});

const withdraw = new SlashCommand()
    .setName("withdraw")
    .setDescription("withdraws money from bank")
    .addStringOption((option) =>
        option
            .setName("amount")
            .setDescription("enter amount, 'all' or 'max'")
            .setRequired(true)
    )
    .setDMPermission(false);
withdraw.callback(async (interaction) => {
    await interaction.deferReply();
    const user = interaction.user;
    let amount = interaction.options.getString("amount");

    const users = await get_bank_data(user);
    const bank_amt = users[2];
    if (["all", "max"].includes(amount.toLowerCase())) {
        await update_bank(user, +bank_amt);
        await update_bank(user, -bank_amt, "bank");

        return await interaction.followUp(
            `${userMention(user.id)} you withdrew ${bank_amt} in your wallet`
        );
    }

    amount = parseInt(amount);
    if (amount > bank_amt)
        return await interaction.followUp(
            `${userMention(user.id)} You don't have enough money!`
        );
    if (amount < 0)
        return await interaction.followUp(
            `${userMention(user.id)} enter a valid amount !`
        );

    await update_bank(user, +amount);
    await update_bank(user, -amount, "bank");
    await interaction.followUp(
        `${userMention(user.id)} you withdraw ${amount} from your bank`
    );
});

const deposit = new SlashCommand()
    .setName("deposit")
    .setDescription("deposit money into bank")
    .addStringOption((option) =>
        option
            .setName("amount")
            .setDescription("enter amount, 'all' or 'max'")
            .setRequired(true)
    )
    .setDMPermission(false);
deposit.callback(async (interaction) => {
    await interaction.deferReply();
    const user = interaction.user;
    let amount = interaction.options.getString("amount");

    const users = await get_bank_data(user);
    const wallet_amt = users[1];
    if (["all", "max"].includes(amount.toLowerCase())) {
        await update_bank(user, -wallet_amt);
        await update_bank(user, +wallet_amt, "bank");

        return await interaction.followUp(
            `${userMention(user.id)} you deposited ${wallet_amt} in your bank`
        );
    }

    amount = parseInt(amount);
    if (amount > wallet_amt)
        return await interaction.followUp(
            `${userMention(user.id)} You don't have enough money`
        );
    if (amount < 0)
        return await interaction.followUp(
            `${userMention(user.id)} enter a valid amount!`
        );

    await update_bank(user, -amount);
    await update_bank(user, +amount, "bank");
    await interaction.followUp(
        `${userMention(user.id)} you deposited ${amount} in your bank`
    );
});

const send = new SlashCommand()
    .setName("send")
    .setDescription("send/transfer money to a member")
    .addUserOption((option) =>
        option
            .setName("member")
            .setDescription("target @member")
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("amount")
            .setDescription("enter a positive integer")
            .setRequired(true)
    )
    .setDMPermission(false);
send.callback(async (interaction) => {
    await interaction.deferReply();

    const user = interaction.user;
    const member = interaction.options.getUser("member", true);
    const amount = interaction.options.getInteger("amount", true);
    if (member.bot)
        return await interaction.followUp("Bot's don't have account");

    const users = await get_bank_data(user);
    const wallet_amt = users[1]
    if (amount <= 0) return await interaction.followUp("Enter a valid amount!");
    if (amount > wallet_amt)
        return await interaction.followUp("You don't habe enough money");

    await update_bank(user, -amount);
    await update_bank(member, +amount);
    await interaction.followUp(
        `You sent ${amount} to ${userMention(member.id)}`
    );
});

const leaderboard = new SlashCommand()
    .setName("leaderboard")
    .setDescription("get the top members w.r.t net worth");
leaderboard.callback(async (interaction) => {
    await interaction.deferReply();

    const guild = interaction.guild;
    const users = await get_networth_lb();
    let data = [];
    let index = 1;
    for (const member of users) {
        if (index > 10) break;

        let member_name = (
            await interaction.client.users.fetch(member[0].toString())
        )?.tag;
        if (member_name === undefined) continue;

        const member_amt = member[1] + member[2];
        if (index === 1) data.push(`**🥇 \`${member_name}\` -- ${member_amt}**`);
        if (index === 2) data.push(`**🥈 \`${member_name}\` -- ${member_amt}**`);
        if (index === 3) data.push(`**🥉 \`${member_name}\` -- ${member_amt}**`);
        if (index >= 4)
            data.push(`**${index} \`${member_name}\` -- ${member_amt}**`);
        index += 1;
    }

    const msg = data.join("\n");
    const em = new EmbedBuilder()
        .setTitle(`Top ${index} Richest Users - Leaderboard`)
        .setDescription(
            "It's Based on Net Worth(wallet + bank) of Global Users\n\n" + msg
        )
        .setColor(0x00ff00)
        .setTimestamp()
        .setFooter({text: `GLOBAL - ${guild.name}`});
    await interaction.followUp({embeds: [em]});
});

module.exports = {
    setup: () => {
        console.log(`- ${__filename.slice(__dirname.length + 1)}`);
    },
};
