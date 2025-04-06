const { Movements } = require('mineflayer-pathfinder');
const mcData = require('minecraft-data');
const gerenciamento = require('../modules/gerenciamento');

module.exports = (bot) => {
  bot.once('spawn', () => {
    // Define mcData diretamente no bot para reutilizar
    bot.mcData = mcData(bot.version);

    // Configura movimentação padrão
    const defaultMove = new Movements(bot, bot.mcData);
    bot.pathfinder.setMovements(defaultMove);

    // Mensagem inicial
    bot.chat("Murillobot online! Só ouço meu mestre. Use /b comandos.");

    // Inicia as rotinas automáticas
    setInterval(() => gerenciamento.monitorarFome(bot), 5000);
    setInterval(() => gerenciamento.verificarNoiteEDormir(bot), 10000);
    setInterval(() => gerenciamento.verificarInventarioCheio(bot), 8000);
  });
};
