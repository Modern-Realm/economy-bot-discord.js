const {SlashCommand} = require("../base.js");
const {shop_items, open_inv} = require("../modules/inventory_funcs.js");

const {EmbedBuilder} = require("discord.js");

const shop = new SlashCommand()
    .setName("shop")
    .setDescription("get the shop items")
    .addStringOption((option) =>
        option
            .setName("item_name")
            .setDescription("get the item information")
            .setRequired(false)
    )
    .setDMPermission(false);
shop.callback(async (interaction) => {
    await interaction.deferReply();
    const user = interaction.user;
    let info = interaction.options.getString("item_name", false);

    await open_inv(user);
    if (info !== null) {
        info = info.trim().toLowerCase();
        for (const item of shop_items) {
            const name = item.name;
            const cost = item.cost;
            const item_info = item.info;

            if (name.toLowerCase() === info) {
                let sell_amt = Math.round(cost / 4);
                const em = new EmbedBuilder()
                    .setTitle(name.toUpperCase())
                    .setDescription(item_info)
                    .addFields(
                        {
                            name: "Buying price",
                            value: `${cost}`,
                            inline: false,
                        },
                        {
                            name: "Selling price",
                            value: `${sell_amt}`,
                            inline: false,
                        }
                    );
                return await interaction.followUp({embeds: [em]});
            }
        }
    } else {
        const em = new EmbedBuilder()
            .setTitle("SHOP")
            .setDescription("Items will appear here");

        let x = 1;
        for (const item of shop_items) {
            const name = item.name;
            const cost = item.cost;
            const item_id = item.id;
            const item_info = item.info;

            x += 1;
            if (x > 1)
                em.addFields({
                    name: `${name.toUpperCase()} -- ${cost}`,
                    value: `${item_info}\nID: \`${item_id}\``,
                    inline: false,
                });
        }

        await interaction.followUp({embeds: [em]});
    }
});

module.exports = {
    setup: () => {
        console.log(`- ${__filename.slice(__dirname.length + 1)}`);
    },
};
