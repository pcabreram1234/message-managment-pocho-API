require("dotenv").config;
const express = require("express");
const { UserService } = require("../services/users.service");
const { logErrors } = require("../middlewares/error.handler");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const { verifyToken } = require("../middlewares/auth.handler");

const service = new UserService();

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const users = await service.isAdmUser(req.user);
    if (users !== null) {
      const getUsers = await service.find();
      res.json(getUsers);
    } else {
      res.json(users);
    }
  } catch (error) {
    next(error);
  }
});

router.post("/login", logErrors, async (req, res, next) => {
  try {
    const body = req.body.data;
    const { password, user_name } = body;
    const resp = await service.findOne(user_name);
    if (!resp) {
      return res.status(511).json({ error: "User does not exist" });
    }

    const isValid = await bcrypt.compare(password, resp.password);

    if (isValid) {
      const data = await service.findOne(resp.user_name);
      const { id, type_user, user_name } = data.dataValues;
      // valido
      const tokenToSign = jwt.sign(
        {
          user_name: user_name,
          id: id,
          type_user: type_user,
          created_at: new Date(),
        },
        process.env.TOKEN_KEY,
        { expiresIn: "1h" }
      );
      res.json({ token: tokenToSign });
    } else {
      res.status(511).json({ error: "Password incorrect" });
    }
    // Crear el token luego de que el usuario realmente tenga una contrasena valida.
  } catch (error) {
    next(error);
  }
});

router.post("/adduser", verifyToken, logErrors, async (req, res, next) => {
  try {
    const body = req.body.data;
    const newUser = await service.addUser(body);
    res.json(newUser);
  } catch (error) {
    next(error);
  }
});

router.post("/edituser", verifyToken, logErrors, async (req, res, next) => {
  try {
    const { id, type_user, user_name, email } = req.body.data;
    const type_user_request = req.user.type_user;
    const data = { id, type_user, user_name, email, type_user_request };
    res.setHeader("token", req.token);
    const userToEdit = await service.editUser(data);
    return res.json(userToEdit);
  } catch (error) {
    next(error);
  }
});

router.delete("/deleteuser", verifyToken, logErrors, async (req, res, next) => {
  try {
  } catch (error) {}
});

module.exports = router;
