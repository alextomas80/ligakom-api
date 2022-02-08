const express = require("express");
const cors = require("cors");
const colors = require("colors");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3100;
    this.paths = {
      league: "/api/league",
      strava: "/strava",
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
    this.app.get("/", function (req, res) {
      return res.status(200).send("LigaKOM online");
    });

    this.app.use(this.paths.strava, require("./routes/strava.routes"));
    this.app.use(this.paths.league, require("./routes/league.routes"));
  }

  // availableRoutesString() {
  //   return this.app._router.stack
  //     .filter((r) => r.route)
  //     .map(
  //       (r) =>
  //         Object.keys(r.route.methods)[0].toUpperCase().padEnd(7) + r.route.path
  //     )
  //     .join("\n");
  // }

  listen() {
    this.app.listen(this.port, () => {
      console.clear();
      console.log(
        `\n✅ ${colors.white("Servidor corriendo en")} ${colors.brightBlue.bold(
          `http://localhost:${this.port}`
        )}`
      );
    });
  }
}

module.exports = Server;
