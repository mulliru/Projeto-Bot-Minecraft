// recursos/crafting.js

const Vec3 = require('vec3');

// Função pública para craftar qualquer item
async function craftarItem(bot, nomeItem, quantidade = 1) {
  const mesa = bot.findBlock({
    matching: bot.mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });

  if (!mesa) {
    bot.chat("Não encontrei mesa de trabalho! 😢");
    return;
  }

  const item = bot.mcData.itemsByName[nomeItem];
  const recipe = bot.recipesFor(item.id, null, quantidade, mesa)[0];

  if (!recipe) {
    bot.chat(`Não tenho materiais suficientes para craftar ${nomeItem}! 😢`);
    return;
  }

  try {
    await bot.craft(recipe, quantidade, mesa);
    bot.chat(`${nomeItem.replace("_", " ")} craftado com sucesso! 🛠️`);
  } catch (err) {
    bot.chat(`Erro ao craftar ${nomeItem}! ❌`);
    console.log(err);
  }
}

// Função para craftar uma ferramenta específica
async function craftarFerramenta(bot, tipoFerramenta) {
  const nomeItem = `wooden_${tipoFerramenta}`;

  bot.chat(`Tentando craftar ${nomeItem}...`);

  await craftarItem(bot, nomeItem, 1);
}

// Função para colocar a mesa de trabalho no chão, se o bot tiver
async function colocarMesaDeTrabalho(bot) {
  const blocoAbaixo = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  const mesaItem = bot.inventory.items().find(i => i.name.includes('crafting_table'));

  if (!mesaItem || !blocoAbaixo) {
    bot.chat("Não tenho uma mesa de trabalho pra colocar! 😢");
    return;
  }

  await bot.equip(mesaItem, 'hand');

  try {
    await bot.placeBlock(blocoAbaixo, new Vec3(0, 1, 0));
    bot.chat("Mesa de trabalho colocada! 🛠️");
  } catch (err) {
    bot.chat("Erro ao colocar a mesa de trabalho! ❌");
    console.log(err);
  }
}

// ========== EXPORTS ==========
module.exports = {
  craftarItem,
  craftarFerramenta,
  colocarMesaDeTrabalho
};
