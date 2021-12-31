require("dotenv").config();
const colors = require("colors");

const Server = require("./models/server");

const server = new Server();
server.listen();
