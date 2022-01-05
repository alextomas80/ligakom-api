const axios = require("axios");
const { response } = require("express");
const { User, League } = require("../models");

// const getUsers = async (req, res = response) => {
//   const users = await User.find().select(["-__v", "-password"]);

//   res.status(201).json({
//     ok: true,
//     users,
//   });
// };

// const findOne = async (req, res = response) => {
//   const userId = req.params.id;

//   try {
//     const user = await User.findById(userId).select(["-__v", "-password"]);
//     if (!user) {
//       return res.status(404).send({
//         ok: false,
//         msg: "El usuario no existe.",
//       });
//     }

//     res.status(201).json({
//       ok: true,
//       user,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       ok: false,
//       msg: "Por favor, hable con el administrador.",
//     });
//   }
// };

const create = async (req, res = response) => {
  const { access_token, refresh_token } = req.body;

  try {
    const resStrava = await axios.get("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id, username, firstname, lastname, sex, profile } = resStrava.data;
    const athlete = {
      idStrava: id,
      username,
      firstname,
      lastname,
      sex,
      profile,
      access_token,
      refresh_token,
    };
    console.log(athlete);

    const userCreated = new User(athlete);
    await userCreated.save();

    return res.status(200).json(userCreated); // let user = await User.findOne({ email });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      ok: false,
      msg: `${error.response.status} - ${error.response.data.message}`,
    });
  }
};
/*
const updateUser = async (req, res = response) => {
  const userId = req.params.id;
  const uid = req.uid;

  try {
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(404).send({
        ok: false,
        msg: "El usuario no existe.",
      });
    }
    // if (user.role.toString() !== 'admin') {
    // 	return res.status(401).send({
    // 		ok: false,
    // 		msg: 'No tiene privilegios de editar este usuario.',
    // 	});
    // }

    const userPayload = {
      ...req.body,
      user: uid,
    };

    const userUpdated = await User.findByIdAndUpdate(userId, userPayload, {
      new: true,
    });
    res.json({ ok: true, user: userUpdated });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      ok: false,
      msg: "Por favor, hable con el administrador.",
    });
  }
};

module.exports = { createUser, getUsers, findOne, updateUser };
*/

const myLeagues = async (req, res = response) => {
  const { userId } = req.params;

  const user = await User.findOne({ idStrava: userId });
  const leagues = await League.find({ athletes: user._id }).populate(
    "segments"
  );
  const leaguesMapped = leagues.map((league) => {
    return {
      league,
      owner: user._id.toString() === league.owner.toString(),
    };
  });
  return res.status(200).json(leaguesMapped);
};
module.exports = { create, myLeagues };
