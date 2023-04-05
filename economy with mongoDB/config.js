require("dotenv").config();

const env = process.env;

class Auth {
    // Make sure to add all details in '.env' file
    static TOKEN = env.TOKEN;
    static CLIENT_ID = env.CLIENT_ID;

    static CLUSTER_AUTH_URL = env.CLUSTER_AUTH_URL;
    static DB_NAME = env.DB_NAME;
}

module.exports = {
    Auth
};
