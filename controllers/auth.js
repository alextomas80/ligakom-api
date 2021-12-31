const { response } = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("./../models");
const { generateJWT } = require("../helpers/jwt");

const authenticateStrava = async (req, res = response) => {
  const { code } = req.query;
  const { client_id, client_secret } = process.env;
  const url = `https://www.strava.com/oauth/token?client_id=${client_id}&client_secret=${client_secret}&code=${code}&grant_type=authorization_code`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const { access_token } = await response.json();

  const url2 = `https://www.strava.com/api/v3/athlete?access_token=${access_token}`;

  const response2 = await fetch(url2, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const { id, firstname, lastname, email, city, state, country } =
    await response2.json();

  const user = await User.findOne({ where: { email } });
};

const strava = async (req, res = response) => {
  console.log("cucu");
  return res.status(200).json({ message: "cucu" });
};
// const loginUser = async (req, res = response) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res
//         .status(400)
//         .send({ msg: "El email o contraseña no coincide." });
//     }

//     // Confirmar los passwords
//     const validPassword = bcrypt.compareSync(password, user.password);
//     if (!validPassword) {
//       return res
//         .status(400)
//         .json({ msg: "El usuario o la contraseña no coinciden." });
//     }

//     // Generar JWT
//     const token = await generateJWT(user.id, user.name);
//     return res.status(200).json({
//       user,
//       token,
//     });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .send({ msg: "Por favor, hable con el administrador." });
//   }
// };

// const renewToken = async (req, res = response) => {
//   const { uid, name } = req;

//   // Generar JWT
//   const token = await generateJWT(uid, name);
//   res.json({ ok: true, uid, name, token });
// };

// const me = async (req, res = response) => {
//   const { uid, name } = req;
//   const { id } = req.params;
//   const item = await User.findById(uid).limit(1);
//   res.status(201).json(item);
// };

module.exports = { authenticateStrava, strava };
