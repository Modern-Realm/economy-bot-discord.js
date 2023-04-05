const {Auth} = require("./config.js");

const {REST, Routes, Collection} = require("discord.js");

const rest = new REST({version: "10"}).setToken(Auth.TOKEN);

/**
 *
 * @param {Collection} bot_commands
 * @param {boolean} sync
 */
async function register_commands(bot_commands, sync) {
    let data,
        commands = [];
    try {
        for (let val of bot_commands.values()) {
            commands.push(val.toJSON());
        }

        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );
        if (sync) {
            await rest
                .put(Routes.applicationCommands(Auth.CLIENT_ID), {body: []})
                .then(async () => {
                    console.log("syncing commands");
                    data = await rest.put(
                        Routes.applicationCommands(Auth.CLIENT_ID),
                        {body: commands}
                    );
                    console.log(
                        `Successfully reloaded ${data.length} application (/) commands.`
                    );
                });
        } else {
            data = await rest.put(Routes.applicationCommands(Auth.CLIENT_ID), {
                body: commands,
            });
            console.log(
                `Successfully reloaded ${data.length} application (/) commands.`
            );
        }
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error("\nerror\n", error, "\n");
    }
}

module.exports = {
    register_commands,
};
