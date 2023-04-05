const {DB} = require("../modules/bank_funcs.js");

const {User} = require("discord.js");

const TABLE_NAME = "`inventory`";

const shop_items = [
    {name: "watch", cost: 100, id: 1, info: "It's a watch"},
    {name: "mobile", cost: 1000, id: 2, info: "It's a mobile"},
    {name: "laptop", cost: 10000, id: 3, info: "It's a laptop"},
    // You can add your items here ...
];
const item_names = shop_items.map((item) => item.name);

async function create_table() {
    await DB.execute(
        `CREATE TABLE IF NOT EXISTS ${TABLE_NAME}
        (
            userID VARCHAR
         (
            100
         ) PRIMARY KEY)`
    );
    for (let col of item_names) {
        try {
            await DB.execute(
                `ALTER TABLE ${TABLE_NAME}
                    ADD COLUMN \`${col}\` MEDIUMINT DEFAULT 0`
            );
        } catch (err) {
        }
    }
}

/**
 *
 * @param {User} user
 */
async function open_inv(user) {
    const data = await DB.execute(
        `SELECT *
         FROM ${TABLE_NAME}
         WHERE userID = ?`,
        [user.id],
        "one"
    );
    if (data === null) {
        await DB.execute(`INSERT INTO ${TABLE_NAME}(userID)
                          VALUES (?)`, [
            user.id,
        ]);
    }
}

/**
 *
 * @param {User} user
 * @returns
 */
async function get_inv_data(user) {
    return await DB.execute(
        `SELECT *
         FROM ${TABLE_NAME}
         WHERE userID = ?`,
        [user.id],
        "one"
    );
}

/**
 *
 * @param {User} user
 * @param {number} amount
 * @param {string} mode
 * @returns
 */
async function update_inv(user, amount, mode) {
    const data = await DB.execute(
        `SELECT \`${mode}\`
         FROM ${TABLE_NAME}
         WHERE userID = ?`,
        [user.id],
        "one"
    );
    if (!(data === null)) {
        await DB.execute(
            `UPDATE ${TABLE_NAME}
             SET \`${mode}\` = \`${mode}\` + ?
             WHERE userID = ?`,
            [amount, user.id]
        );
    }

    return await DB.execute(
        `SELECT \`${mode}\`
         FROM ${TABLE_NAME}
         WHERE userID = ?`,
        [user.id],
        "one"
    );
}

/**
 *
 * @param {User} user
 * @param {number} amount
 * @param {string} mode
 * @returns
 */
async function change_inv(user, amount, mode = "wallet") {
    const data = await DB.execute(
        `SELECT \`${mode}\`
         FROM ${TABLE_NAME}
         WHERE userID = ?`,
        [user.id],
        "one"
    );
    if (!(data === null)) {
        await DB.execute(
            `UPDATE ${TABLE_NAME}
             SET \`${mode}\` = ?
             WHERE userID = ?`,
            [amount, user.id]
        );
    }

    return await DB.execute(
        `SELECT \`${mode}\`
         FROM ${TABLE_NAME}
         WHERE userID = ?`,
        [user.id],
        "one"
    );
}

module.exports = {
    shop_items,
    create_table,
    open_inv,
    get_inv_data,
    update_inv,
    change_inv,
};
