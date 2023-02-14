const { Auth } = require("./config.js");
const { register_commands } = require("./sync_commands.js");
const { client } = require("./base.js");
const bank_funcs = require("./modules/bank_funcs.js");
const inventory_funcs = require('./modules/inventory_funcs.js');

const { Events, ActivityType } = require("discord.js");

const path = require('path');
const fs = require("fs");

const commandsPath = path.join(__dirname, "cogs");
const commandFiles = fs.readdirSync(
    commandsPath).filter(file => file.endsWith(".js"));

console.log("Loading cogs:");
for (let file of commandFiles) {
    let filePath = path.join(commandsPath, file);
    require(filePath);
}
console.log();

client.on(Events.ClientReady, async () => {
    await bank_funcs.create_table();
    await inventory_funcs.create_table();
    console.log("Database tables updated!");

    client.user.setActivity(
        { name: "/help", type: ActivityType.Playing }
    );
    console.log(`${client.user.tag}'s online`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    let command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`Slash command Not Found: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const err_msg = {
            content: "something went wrong, try again later",
            ephemeral: true
        };
        if (interaction.deferred)
            await interaction.followUp(err_msg);
        else
            await interaction.reply(err_msg);
    }
});

// Triggers to handle Keyboard Interruption or code break
process.on("exit", code => {
    console.error(`\nProcess ${process.pid} has been interrupted\n` +
        `${client.user.username || "bot"}'s logging out...`);

    // disconnecting from discord.Client and Database
    client.destroy();
    bank_funcs.DB.destroy();

    process.exit(code);
});
process.on('SIGTERM', signal => { process.exit(0); });
process.on("SIGINT", signal => { process.exit(0); });

// sync commands
register_commands(client.commands, false).then(
    () => setTimeout(() => client.login(Auth.TOKEN), 3 * 1000)
);
