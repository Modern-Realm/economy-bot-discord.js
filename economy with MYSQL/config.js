require("dotenv").config();

const env = process.env;

class Auth {
    // Make sure to add all details in '.env' file
    static TOKEN = env.TOKEN;
    static CLIENT_ID = env.CLIENT_ID;

    static DB_HOST = env.DB_HOST;
    static DB_PORT = env.DB_PORT;
    static DB_USER = env.DB_USER;
    static DB_PASSWD = env.DB_PASSWD;
    static DB_NAME = env.DB_NAME;
}

module.exports = {
    Auth
};
