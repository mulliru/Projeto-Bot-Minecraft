const mcData = require('minecraft-data');
const { contarItem } = require('./util');

function craftarFerramenta(bot, nomeItem) {
  const mesa = bot.findBlock({
    matching: bot.mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });

  if (!mesa) {
    bot.chat("Preciso de uma mesa de trabalho!");
    return;
  }

  const item = bot.mcData.itemsByName[nomeItem];
  const recipe = bot.recipesFor(item.id, null, 1, mesa)[0];
  if (!recipe) return bot.chat("Não tenho os materiais 😢");

  bot.chat(`Fazendo ${nomeItem.replace("_", " ")}...`);
  bot.craft(recipe, 1, mesa)
    .then(() => bot.chat(`${nomeItem.replace("_", " ")} feito! 🛠️`))
    .catch(err => {
      bot.chat("Erro ao craftar.");
      console.log(err);
    });
}

module.exports = {
  craftarFerramenta
};
