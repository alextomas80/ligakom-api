const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    // console.log("- - - - - - - - - -".green);
    console.log("\n 🚀 Base de datos conectada correctamente.".brightMagenta);
    // console.log("- - - - - - - - - -".green);
  } catch (error) {
    console.log(error);
    throw new Error("Error al iniciar la BBDD");
  }
};

module.exports = { dbConnection };
