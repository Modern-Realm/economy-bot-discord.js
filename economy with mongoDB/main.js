const {Auth} = require("./config.js");
const {register_commands} = require("./sync_commands.js");
const {client, time_convertor} = require("./base.js");
const bank_funcs = require("./modules/bank_funcs.js");
const inventory_funcs = require("./modules/inventory_funcs.js");

const {Events, ActivityType} = require("discord.js");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

const commandsPath = path.join(__dirname, "cogs");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

console.log(chalk.blue("Loading cogs:"));
for (let file of commandFiles) {
    let filePath = path.join(commandsPath, file);
    require(filePath).setup();
}
console.log();

client.on(Events.ClientReady, async () => {
    await bank_funcs.create_table();
    await inventory_funcs.create_table();
    console.log("Database tables updated!");

    client.user.setActivity({name: "/help", type: ActivityType.Playing});
    console.log(`${client.user.tag}'s online`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command_name = interaction.commandName;
    const user = interaction.user;

    const command = interaction.client.commands.get(command_name);
    if (!command) {
        console.error(`Slash command Not Found: ${command_name}`);
        return;
    }

    try {
        // check command cooldown
        let userCD;
        const cooldowns = client.cooldowns.get(command_name);
        if (cooldowns) {
            userCD = cooldowns.filter((cd) => cd.userID === user.id);
            if (userCD.length === 1) {
                userCD = userCD[0];
                const cur_time = new Date();
                const cmd_time = userCD.per;
                if (cur_time.getTime() <= cmd_time.getTime()) {
                    return await interaction.reply(
                        `command on cooldown, retry after ` +
                        `\`${time_convertor(cmd_time - cur_time)}\``
                    );
                } else
                    delete cooldowns[
                        cooldowns.findIndex((cd) => cd.userID === user.id)
                        ];
            }
        }

        await command.execute(interaction);

        // create command cooldown
        if (cooldowns) {
            userCD = cooldowns.filter((cd) => cd.userID === user.id);
            if (userCD.length === 0) {
                const new_date = new Date();
                new_date.setSeconds(new_date.getSeconds() + command.per);
                cooldowns.push({userID: user.id, per: new_date});
            }
        }
    } catch (error) {
        console.error(error);
        const err_msg = {
            content: "something went wrong, try again later",
            ephemeral: true,
        };
        if (interaction.deferred) await interaction.followUp(err_msg);
        else await interaction.reply(err_msg);
    }
});

// Triggers to handle Keyboard Interruption or code break
process.on("exit", (code) => {
    console.error(
        `\nProcess ${process.pid} has been interrupted\n` +
        `${client.user.username || "bot"}'s logging out...`
    );

    // disconnecting from discord.Client and Database
    client.destroy();
    bank_funcs.DB.destroy();

    process.exit(code);
});
process.on("SIGTERM", (signal) => {
    process.exit(0);
});
process.on("SIGINT", (signal) => {
    process.exit(0);
});

// sync commands
register_commands(client.commands, false).then(() =>
    setTimeout(() => client.login(Auth.TOKEN), 3 * 1000)
);
