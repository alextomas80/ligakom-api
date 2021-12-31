const { response } = require("express");
const User = require("./../models/user");

const getUsers = async (req, res = response) => {
  const users = await User.find().select(["-__v", "-password"]);

  res.status(201).json({
    ok: true,
    users,
  });
};

const findOne = async (req, res = response) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select(["-__v", "-password"]);
    if (!user) {
      return res.status(404).send({
        ok: false,
        msg: "El usuario no existe.",
      });
    }

    res.status(201).json({
      ok: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      ok: false,
      msg: "Por favor, hable con el administrador.",
    });
  }
};

const createUser = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).send({
        ok: false,
        msg: "El email ya está registrado.",
      });
    }
    user = new User(req.body);

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(password, salt);

    await user.save();

    // Generar JWT
    const token = await generateJWT(user.id, user.name);

    res.status(201).json({
      ok: true,
      uid: user.id,
      name: user.name,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).send({
      ok: false,
      msg: "Por favor, hable con el administrador.",
    });
  }
};

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
