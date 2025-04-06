const { inclui } = require('./util');
const config = require('../config');
const { coletarBloco } = require('./recursos');
const { craftarFerramenta } = require('./crafting');
const { guardarNoBau, listarInventario } = require('./gerenciamento');

module.exports = function(bot) {
  bot.on('chat', async (username, message) => {
    if (!message.startsWith(config.prefixo)) return;

    if (username !== config.dono) {
      bot.chat(`Desculpa ${username}, só meu mestre ${config.dono} pode me comandar 😎`);
      return;
    }

    const msg = message.replace(config.prefixo, '').trim().toLowerCase();

    if (inclui(msg, "pegue", "madeira")) return coletarBloco(bot, "wood");
    if (inclui(msg, "pegue", "pedra")) return coletarBloco(bot, "stone");

    if (inclui(msg, "craftar", "machado")) return craftarFerramenta(bot, "wooden_axe");
    if (inclui(msg, "craftar", "picareta")) return craftarFerramenta(bot, "wooden_pickaxe");

    if (inclui(msg, "guardar", "baú")) return guardarNoBau(bot);
    if (inclui(msg, "me dê", "tudo")) return entregarTudo(bot, username);
    if (inclui(msg, "o que", "tem")) return listarInventario(bot);

    if (inclui(msg, "status")) {
      const pos = bot.entity.position;
      return bot.chat(`📍 ${pos.toString()} ❤️ ${bot.health}/20 🍗 ${bot.food}/20 🎒 ${bot.inventory.items().length} itens`);
    }

    if (inclui(msg, "pare")) {
      bot.pathfinder.setGoal(null);
      return bot.chat("Parando.");
    }
  });
};

function entregarTudo(bot, username) {
  const items = bot.inventory.items();
  if (!items.length) return bot.chat("Não tenho nada.");
  items.forEach(i => bot.toss(i.type, null, i.count));
  bot.chat("Dropando tudo pra você!");
}
