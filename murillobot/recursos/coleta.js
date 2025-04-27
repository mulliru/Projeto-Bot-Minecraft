// recursos/coleta.js

async function coletarBloco(bot, tipo) {
    let nomes = [];
  
    if (tipo === "wood") {
      nomes = ["log", "wood"];
    } else if (tipo === "stone") {
      nomes = ["stone", "cobblestone"];
    } else {
      bot.chat("Tipo de recurso inválido para coleta! 😢");
      return;
    }
  
    const ferramenta = tipo === "wood" ? "axe" : "pickaxe";
  
    // Garante que tenha ferramenta
    if (!temFerramenta(bot, ferramenta)) {
      await craftarFerramentaBasica(bot, ferramenta);
    }
  
    bot.chat(`Procurando ${tipo} para coletar... 🔍`);
  
    const blocos = bot.findBlocks({
      matching: block => nomes.some(n => block.name.includes(n)),
      maxDistance: 64,
      count: 5
    });
  
    if (blocos.length === 0) {
      bot.chat(`Não encontrei ${tipo} perto! 😢`);
      return;
    }
  
    const targets = blocos.map(pos => bot.blockAt(pos)).filter(Boolean);
  
    await bot.collectBlock.collect(targets);
  
    bot.chat(`${tipo} coletada com sucesso! ✅`);
  }
  
  // Função auxiliar interna
  function temFerramenta(bot, tipo) {
    return bot.inventory.items().some(item => item.name.includes(tipo));
  }
  
  // Função auxiliar interna
  async function craftarFerramentaBasica(bot, tipo) {
    bot.chat(`Craftando uma ferramenta básica (${tipo})...`);
  
    const nomeItem = `wooden_${tipo}`;
  
    const mesa = bot.findBlock({
      matching: bot.mcData.blocksByName.crafting_table.id,
      maxDistance: 32
    });
  
    if (!mesa) {
      bot.chat("Preciso de uma mesa de trabalho! 😢");
      return;
    }
  
    const item = bot.mcData.itemsByName[nomeItem];
    const recipe = bot.recipesFor(item.id, null, 1, mesa)[0];
  
    if (!recipe) {
      bot.chat(`Não tenho os materiais para craftar ${nomeItem} 😢`);
      return;
    }
  
    await bot.craft(recipe, 1, mesa);
  }
  
  // ========== EXPORTS ==========
  module.exports = {
    coletarBloco
  };
  