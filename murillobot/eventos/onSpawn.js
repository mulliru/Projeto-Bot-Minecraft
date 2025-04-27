// eventos/onSpawn.js

const { Movements } = require('mineflayer-pathfinder');
const minecraftData = require('minecraft-data');
const { monitorarFome } = require('../recursos/inventario');
const { verificarNoiteEDormir } = require('../recursos/inventario');
const { verificarInventarioCheio } = require('../recursos/inventario');
const { coletarBloco } = require('../recursos/coleta');

function configurarOnSpawn(bot) {
  bot.once('spawn', () => {
    // Carrega os dados do Minecraft
    bot.mcData = minecraftData(bot.version);

    // Configura os movimentos padrão do Pathfinder
    const movimentosPadrao = new Movements(bot, bot.mcData);
    bot.pathfinder.setMovements(movimentosPadrao);

    // Mensagem inicial
    bot.chat("Murillobot online! Só ouço meu mestre omulliru. Use: murillobot, comandos");

    // Começar a monitorar periodicamente
    setInterval(() => monitorarFome(bot), 5000);
    setInterval(() => verificarNoiteEDormir(bot), 10000);
    setInterval(() => verificarInventarioCheio(bot), 8000);

    // Se modo automático estiver ativo, continua coletando
    setInterval(() => {
      if (bot.modoLoop) {
        coletarBloco(bot, bot.modoAutomatico);
      }
    }, 15000);
  });
}

module.exports = {
  configurarOnSpawn
};
