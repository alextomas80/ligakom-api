const express = require("express");
const cors = require("cors");
const colors = require("colors");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3100;
    this.paths = {
      auth: "/api/auth",
      leagues: "/leagues",
      strava: "/strava",
      users: "/users",
    };

    // middlewares
    this.middlewares();

    // routes
    this.routes();
  }

  middlewares() {
    // CORS
    this.app.use(cors());

    // Directorio Público
    this.app.use(express.static("../admin/build"));

    // Lectura y parseo del body
    this.app.use(express.json());
  }

  routes() {
    this.app.get("/exchange_token", function (req, res) {
      return res.status(200).json(req.query);
    });

    this.app.use(this.paths.strava, require("./routes/strava.routes"));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.clear();
      console.log(
        `\n ✅ ${colors.white(
          "Servidor corriendo en"
        )} ${colors.brightBlue.bold(`http://localhost:${this.port}`)}`
      );
    });
  }
}

module.exports = Server;
