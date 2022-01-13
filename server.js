const express = require("express");
const cors = require("cors");
// const fileUpload = require("express-fileupload");
const colors = require("colors");

const { dbConnection } = require("./database/config");

// require("../database/cache");

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

    // database
    this.databaseConnect();

    // middlewares
    this.middlewares();

    // routes
    this.routes();
  }

  databaseConnect() {
    dbConnection();
  }

  middlewares() {
    // CORS
    this.app.use(cors());

    // Directorio Público
    this.app.use(express.static("../admin/build"));

    // Lectura y parseo del body
    this.app.use(express.json());

    // Fileupload - Carga de archivos
    // this.app.use(
    //   fileUpload({
    //     useTempFiles: true,
    //     tempFileDir: "/tmp/",
    //     createParentPath: true,
    //   })
    // );
  }

  routes() {
    this.app.get("/exchange_token", function (req, res) {
      return res.status(200).json(req.query);
    });

    // this.app.use(this.paths.auth, require("../routes/auth.routes"));
    this.app.use(this.paths.strava, require("./routes/strava.routes"));
    this.app.use(this.paths.leagues, require("./routes/leagues.routes"));
    this.app.use(this.paths.users, require("./routes/users.routes"));
    // app.use('/api/users', require('../routes/users'));
    // this.app.use(this.paths.articles, require("../routes/articles.routes"));
    // this.app.use(this.paths.categories, require("../routes/categories.routes"));
    // this.app.use(this.paths.days, require("../routes/days.routes"));
    // this.app.use(this.paths.events, require("../routes/events.routes"));
    // this.app.use(this.paths.gaiatas, require("../routes/gaiatas.routes"));
    // this.app.use(this.paths.locations, require("../routes/locations.routes"));
    // this.app.use(this.paths.notifications, require("../routes/notifications"));
    // this.app.use(this.paths.ocio, require("../routes/ocio.routes"));
    // this.app.use(this.paths.public, require("../routes/public.routes"));
    // this.app.use(this.paths.settings, require("../routes/settings.routes"));
    // this.app.use(this.paths.uploads, require("../routes/uploads.routes"));
    // this.app.use(this.paths.vote, require("../routes/votes.routes"));
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
