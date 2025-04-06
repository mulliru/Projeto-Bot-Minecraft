const { temFerramenta } = require('./util');

function coletarBloco(bot, tipo) {
  const nomes = tipo === "wood" ? ["log", "wood"] : ["stone", "cobblestone"];
  const ferramenta = tipo === "wood" ? "axe" : "pickaxe";

  if (!temFerramenta(bot, ferramenta)) {
    const { craftarFerramenta } = require('./crafting');
    bot.chat(`Não tenho ${ferramenta}, tentando craftar...`);
    craftarFerramenta(bot, `wooden_${ferramenta}`);
  }

  bot.chat(`Procurando ${tipo}...`);

  const blocos = bot.findBlocks({
    matching: block => nomes.some(n => block.name.includes(n)),
    maxDistance: 64,
    count: 5
  });

  if (!blocos.length) return bot.chat(`Não achei ${tipo} 😢`);

  const targets = blocos.map(pos => bot.blockAt(pos)).filter(Boolean);

  bot.collectBlock.collect(targets)
    .then(() => bot.chat(`${tipo} coletada ✅`))
    .catch(err => {
      bot.chat(`Erro ao coletar ${tipo}`);
      console.log(err);
    });
}

module.exports = { coletarBloco };
