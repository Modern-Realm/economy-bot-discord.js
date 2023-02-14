require("dotenv").config();

const env = process.env;

class Auth {
    // Make sure to add all details in '.env' file
    TOKEN = env.TOKEN;
    CLIENT_ID = env.CLIENT_ID;

    CLUSTER_AUTH_URL = env.CLUSTER_AUTH_URL;
    DB_NAME = env.DB_NAME;
}

module.exports = {
    Auth: new Auth(),
};
