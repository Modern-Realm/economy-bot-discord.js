const { Auth } = require("../config.js");

const { User } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

const TABLE_NAME = "`bank`";
const columns = ["wallet", "bank"]; // You can add more Columns in it !

const conn = new sqlite3.Database("../economy.db");

class Database {
    /**
     *
     * @param {string} sql
     * @param {Array} values
     * @param {string | null} fetch
     * @returns
     */
    async execute(sql, values = [], fetch = null) {
        let results;

        // query
        await new Promise((resolve, reject) => {
            if (fetch === null) {
                conn.run(sql, values, (err) => {
                    if (err) return reject(err);
                    results = null;
                    resolve();
                });
            } else {
                conn.all(sql, values, (err, rows) => {
                    if (err) return reject(err);
                    results = rows;
                    resolve();
                });
            }
        });

        if (fetch == null) results = null;
        else {
            try {
                var data = results.map((row) => Object.values(row));
                if (data.length == 0) results = null;
                if (fetch == "all") results = data;
                if (fetch == "one") results = data[0];
            } catch (error) {
                results = null;
            }
        }
        if (results === undefined) return null;
        return results;
    }

    destroy() {
        conn.close();
    }
}

const DB = new Database();

async function create_table() {
    await DB.execute(
        `CREATE TABLE IF NOT EXISTS ${TABLE_NAME}(userID VARCHAR(100) PRIMARY KEY)`
    );
    for (let col of columns) {
        try {
            await DB.execute(
                `ALTER TABLE ${TABLE_NAME} ADD COLUMN \`${col}\` MEDIUMINT`
            );
        } catch (err) {}
    }
}

/**
 *
 * @param {User} user
 */
async function open_bank(user) {
    var data = await DB.execute(
        `SELECT * FROM ${TABLE_NAME} WHERE userID = ?`,
        [user.id],
        "one"
    );
    if (data === null) {
        await DB.execute(`INSERT INTO ${TABLE_NAME}(userID) VALUES(?)`, [
            user.id,
        ]);
        for (let name of columns) {
            await DB.execute(
                `UPDATE ${TABLE_NAME} SET \`${name}\` = ? WHERE userID = ?`,
                [0, user.id]
            );
        }

        await DB.execute(
            `UPDATE ${TABLE_NAME} SET \`wallet\` = ? WHERE userID = ?`,
            [5000, user.id]
        );
    }
}

/**
 *
 * @param {User} user
 * @returns
 */
async function get_bank_data(user) {
    return await DB.execute(
        `SELECT * FROM ${TABLE_NAME} WHERE userID = ?`,
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
async function update_bank(user, amount, mode = "wallet") {
    var data = await DB.execute(
        `SELECT \`${mode}\` FROM ${TABLE_NAME} WHERE userID = ?`,
        [user.id],
        "one"
    );
    if (!(data === null)) {
        await DB.execute(
            `UPDATE ${TABLE_NAME} SET \`${mode}\` = \`${mode}\` + ? WHERE userID = ?`,
            [amount, user.id]
        );
    }

    return await DB.execute(
        `SELECT \`${mode}\` FROM ${TABLE_NAME} WHERE userID = ?`,
        [user.id],
        "one"
    );
}

async function get_networth_lb() {
    return await DB.execute(
        `SELECT userID, wallet + bank FROM ${TABLE_NAME} ` +
            `ORDER BY wallet + bank DESC`,
        [],
        "all"
    );
}

module.exports = {
    DB,
    create_table,
    open_bank,
    get_bank_data,
    update_bank,
    get_networth_lb,
};
