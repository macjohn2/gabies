const TelegramBot = require("node-telegram-bot-api")
const express = require("express")

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
console.log('new bot')

const REMOVE = {
  disable_notification: true,
  reply_markup: {
    remove_keyboard: true,
  },
};

const users = [];

const gabies = [];

console.log("server up and running!");

const keyboardData = [
  ["ruta1", "ruta2"],
  ["ruta3", "ruta4"],
];

const sendChooseDesti = (chatId, str) => {
  bot.sendMessage(chatId, str, {
    reply_markup: {
      one_time_keyboard: true,
      resize_keyboard: true,
      keyboard: keyboardData,
    },
  });
};

const entrar_gabies = (chatId) => {
  const str = `Digues quantes gabies portes`;
  bot.sendMessage(chatId, str, REMOVE);
};

bot.on("polling_error", (error) => {
  console.log(error);
});

bot.on("text", (msg) => {
  if (msg.from.is_bot) {
    return;
  }

  const txt = msg.text;
  const chatId = msg.chat.id;
  const user_id = msg.from.id;
  const lang = msg.from.language_code;

  if (txt[0] === "/") {
    return;
  }

  if (!gabies[user_id]) {
    return
  }
  
  if (!gabies[user_id].ruta) {
    gabies[user_id].ruta = txt;
    const str = `Has escollit la ruta ${txt}`;
    bot.sendMessage(chatId, str, REMOVE);
    entrar_gabies(chatId);
  } else if (!gabies[user_id].gabies) {
    gabies[user_id].gabies = txt;
    const str = `Has entrat ${txt} gabies`;
    bot.sendMessage(chatId, str, REMOVE);
    const str2 = `Si les dades entrades són correctes prem /validar
      ruta: ${gabies[user_id].ruta}
      gabies: ${gabies[user_id].gabies}`;
    bot.sendMessage(chatId, str2, REMOVE);
  }
});

bot.onText(/\/debug/, async (msg) => {
  const chatId = msg.chat.id;
  let str = "chat id: " + chatId + "\n";
  str += "chat type: " + msg.chat.type + "\n";
  str += "user id: " + msg.from.id + "\n";
  str += "user first_name: " + msg.from.first_name + "\n";
  bot.sendMessage(chatId, str, REMOVE);
});

bot.onText(/\/start/, async (msg) => {
  console.log('/start')
  const chatId = msg.chat.id;
  const lang = msg.from.language_code;
  const user_id = msg.from.id;
  const isBot = msg.from.is_bot;
  if (isBot) {
    return;
  }

  if (users.includes(user_id) === false) {
    const str = `Hola ${msg.from.first_name}. Ets un usuari nou. Primer de tot t'enregistraré.`;
    bot.sendMessage(chatId, str, REMOVE);
    users.push(user_id);
    const str2 = `Ok. Ja t'he enregistrat`;
    bot.sendMessage(chatId, str2, REMOVE);
  } else {
    const str = `Benvingut de nou ${msg.from.first_name}.`;
    bot.sendMessage(chatId, str, REMOVE);
  }

  const str = `Per a entrar una nova ruta l'ordre és /new`;
  bot.sendMessage(chatId, str, REMOVE);
  //sendChooseDesti(chatId, str);
});

bot.onText(/\/new/, async (msg) => {
  const chatId = msg.chat.id;
  const user_id = msg.from.id;
  gabies[user_id] = {};
  const str = `Has d'escollir el destí`;
  sendChooseDesti(chatId, str);
});

bot.onText(/\/validar/, async (msg) => {
  const chatId = msg.chat.id;
  const user_id = msg.from.id;
  gabies[user_id] = {};
  const str = `Les dades s'han enregistrat. Prem /new per a un nou destí`;

  bot.sendMessage(chatId, str, REMOVE);
});

// Use Webhooks for the production server
  const app = express();
  app.use(express.json());

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
