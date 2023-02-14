require("dotenv").config();

const env = process.env;

class Auth {
    // Make sure to add all details in '.env' file
    TOKEN = env.TOKEN;
    CLIENT_ID = env.CLIENT_ID;

    CLUSTER_AUTH_URL = env.CLUSTER_AUTH_URL;
    DB_HOST = env.DB_HOST;
    DB_PORT = env.DB_PORT;
    DB_USER = env.DB_USER;
    DB_PASSWD = env.DB_PASSWD;
    DB_NAME = env.DB_NAME;
}

module.exports = {
    Auth: new Auth(),
};
