require("dotenv").config;
const express = require("express");
const { UserService } = require("../services/users.service");
const { logErrors } = require("../middlewares/error.handler");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const { verifyToken } = require("../middlewares/auth.handler");
const {
  sendEmailToNewUserService,
} = require("../services/sendMessage.service");
const {
  VerifyTokenService,
} = require("../services/verificationAcount.service");

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

router.post("/login", async (req, res, next) => {
  try {
    const body = req.body.data;
    const { password, email } = body;
    const resp = await service.findOne(email);
    if (!resp) {
      return res
        .status(511)
        .json({ error: "User does not exist or no actived" });
    }

    const isValid = await bcrypt.compare(password, resp.password);
    console.log(isValid);
    if (isValid) {
      // const data = await service.findOne(resp.email);
      const { id, type_user, email } = resp.dataValues;
      // valido b
      const tokenToSign = jwt.sign(
        {
          email: email,
          id: id,
          type_user: type_user,
          created_at: new Date(),
        },
        process.env.TOKEN_KEY,
        { expiresIn: "1h" }
      );
      console.log(tokenToSign);
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

router.post("/signup", async (req, res, next) => {
  try {
    const newUserervice = new sendEmailToNewUserService();
    const { email, password } = req.body;
    const name = email.split("@")[0];

    // Valida los datos de usuario
    if (!email || !password) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const newUser = await service.addUser({
      email: email,
      user_name: name,
      type_user: "guest",
      password: password,
    });

    console.log(newUser);
    if (newUser?.isBoom === true) {
      return res.status(409).json({ error: newUser?.output?.payload?.message });
    }

    // // Respuesta exitosa
    const rta = await newUserervice.sendEmail(newUser, email);
    if (rta.error || rta?.messageStatus === "error") {
      return res
        .status(500)
        .json({ error: rta?.error || "Problems trying to send the message" });
    } else {
      return res.status(201).json({ messageStatus: "sended" });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token is required." });
  }

  try {
    const tokenService = new VerifyTokenService();
    // Busca el token en la base de datos
    const userToken = await tokenService.verifyToken(token);

    // Verifica si el token existe y si no ha expirado

    if (!userToken || userToken.length === 0) {
      return res.status(400).json({ error: "Invalid token.", status: "error" });
    }

    if (userToken?.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ error: "Expired token.", status: "expired" });
    }

    if (userToken?.expiresAt > new Date() && userToken?.verified === true) {
      return res
        .status(400)
        .json({ error: "Invalid token.", status: "verified" });
    }

    // Aquí puedes marcar al usuario como verificado o realizar alguna acción adicional
    await tokenService.verifyUser(userToken?.userId);
    await tokenService.updateVerifyToken(token.toString());

    console.log(token);
    console.log(userToken);
    return res
      .status(200)
      .json({ message: "Email verified successfully!", status: "success" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred.", status: "error" });
  }
});

module.exports = router;
