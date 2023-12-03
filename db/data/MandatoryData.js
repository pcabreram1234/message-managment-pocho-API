require("dotenv").config();
const { Auth } = require("../../services/auth.service");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const PASSWORD = process.env.PASSWORD_TEMPLATE;
const userAuth = new Auth(SALT_ROUNDS, PASSWORD);
const { User } = require("../models/Users");
const { Category } = require("../models/Categories");
const { Contact } = require("../models/Contacts");
const { Message } = require("../models/Messages");

const categories = [
  {
    id: 1,
    categorie_name: "Amor",
    UserId: 1,
  },
  {
    id: 2,
    categorie_name: "Paz",
    UserId: 1,
  },
  {
    id: 3,
    categorie_name: "Perdon",
    UserId: 1,
  },
  {
    id: 4,
    categorie_name: "Trabajo",
    UserId: 1,
  },
];
const contacts = [
  {
    id: 1,
    name: "Phillip",
    email: "pcabreram1234@gmail.com",
    phone_number: "829-324-2728",
    UserId: 1,
  },
  {
    id: 2,
    name: "Carmen",
    email: "carmen12@gmail.com",
    phone_number: "823-324-2721",
    UserId: 1,
  },
  {
    id: 3,
    name: "Renata",
    email: "reni8998@gmail.com",
    phone_number: "827-324-2722",
    UserId: 1,
  },
  {
    id: 4,
    name: "Jose",
    email: "Joseph45@gmail.com",
    phone_number: "825-324-2723",
    UserId: 1,
  },
];
const messages = [
  {
    id: 1,
    message:
      "La vida, siempre tan frágil. No puedo entender la decisión de dejar esta vida, dejando atrás a otro humano en proceso. No me cabe en la cabeza, cómo tomar esta decisión cuando una persona aporta tanto valor y vida en tantos aspectos. Tristeza profunda en el corazón",

    UserId: 1,
  },
  {
    id: 2,
    message:
      "Las crypto son el ejemplo perfecto de que sin UI/UX inclusive el tech mas increíble no llega a las masas.",
    UserId: 1,
  },
  {
    id: 3,
    message:
      "Cuando Steve Jobs volvió a Apple, lo primero que hizo fue cerrar la mayoría de unidades de negocio y productos para enfocarse en unos pocos.",
    UserId: 1,
  },
  {
    id: 4,
    message:
      "Aparte de la invasión, el cambio climático creó sequías en China e India que arruinaron cosechas. Pasa también en California, el cuerno de Africa y el sur de Francia.",
    UserId: 1,
  },
];
const users = [
  {
    user_name: "pcabreram",
    type_user: "adm",
    active: true,
    password: userAuth.syncGenHash(),
    token_active: true,
    email: "pcabreram1234@gmail.com",
  },
];


const MandatoryData = async () => {
  await User.bulkCreate(users).then(() => {
    console.log(`User bulk create`);
  });

  await Category.bulkCreate(categories).then(() => {
    console.log(`Category bulk create`);
  });

  await Contact.bulkCreate(contacts).then(() => {
    console.log(`Contact bulk create`);
  });

  await Message.bulkCreate(messages).then(() => {
    console.log(`Message bulk create`);
  });
};

module.exports = {
  MandatoryData,
  categories,
  contacts,
  messages,
  users,
};
