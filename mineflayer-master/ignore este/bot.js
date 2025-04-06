// bot.js
const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const collectBlock = require('mineflayer-collectblock').plugin;
const config = require('./config');

// Criando o bot com base nas configs
const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username,
  auth: config.auth
});

// Carregando plugins
bot.loadPlugin(pathfinder);
bot.loadPlugin(collectBlock);

// Carregando eventos
require('./events/onSpawn')(bot);

// Carregando módulos
require('./modules/comandos')(bot);
require('./modules/combate')(bot);
// Gerenciamento e funções automáticas já são chamadas no onSpawn
