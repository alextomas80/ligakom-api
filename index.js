require("dotenv").config();
const colors = require("colors");

const Server = require("./server");

const server = new Server();
server.listen();
