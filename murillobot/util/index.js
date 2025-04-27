// recursos/inventario.js

// Função para monitorar a fome e comer se necessário
async function monitorarFome(bot) {
    if (bot.food < 18) {
      const comida = bot.inventory.items().find(item =>
        item.name.includes('beef') ||
        item.name.includes('bread') ||
        item.name.includes('porkchop') ||
        item.name.includes('carrot')
      );
  
      if (comida) {
        try {
          await bot.equip(comida, "hand");
          await bot.consume();
          bot.chat("Comi algo para recuperar energia! 🍖");
        } catch (err) {
          bot.chat("Tentei comer, mas algo deu errado! 😢");
          console.log(err);
        }
      } else {
        bot.chat("Estou com fome mas não tenho comida! 😢");
      }
    }
  }
  
  // Função para verificar se o inventário está cheio
  async function verificarInventarioCheio(bot) {
    if (bot.inventory.emptySlotCount() < 2) {
      bot.chat("Inventário cheio! Indo guardar itens no baú... 📦");
      await guardarNoBau(bot);
    }
  }
  
  // Função para guardar itens no baú
  async function guardarNoBau(bot) {
    const bau = bot.findBlock({
      matching: block => block.name.includes('chest'),
      maxDistance: 32
    });
  
    if (!bau) {
      bot.chat("Não encontrei nenhum baú por perto! 😢");
      return;
    }
  
    try {
      const chestBlock = bot.blockAt(bau.position);
      const chest = await bot.openChest(chestBlock);
  
      const itensParaGuardar = bot.inventory.items().filter(item =>
        item.name.includes('wood') ||
        item.name.includes('stone') ||
        item.name.includes('cobblestone') ||
        item.name.includes('ore') ||
        item.name.includes('coal') ||
        item.name.includes('iron') ||
        item.name.includes('gold') ||
        item.name.includes('diamond')
      );
  
      if (itensParaGuardar.length === 0) {
        bot.chat("Não tenho nada para guardar! 🎒");
        chest.close();
        return;
      }
  
      for (const item of itensParaGuardar) {
        await chest.deposit(item.type, null, item.count);
      }
  
      bot.chat("Itens guardados com sucesso no baú! ✅");
      chest.close();
    } catch (err) {
      bot.chat("Erro ao tentar guardar itens no baú! ❌");
      console.log(err);
    }
  }
  
  // Função para verificar se é noite e tentar dormir
  async function verificarNoiteEDormir(bot) {
    if (!bot.time.isDay) {
      const cama = bot.findBlock({
        matching: block => block.name.includes('bed'),
        maxDistance: 32
      });
  
      if (cama) {
        try {
          await bot.sleep(bot.blockAt(cama.position));
          bot.chat("Dormindo... 😴");
        } catch (err) {
          bot.chat("Não consegui dormir! 😢");
          console.log(err);
        }
      }
    }
  }
  
  // ========== EXPORTS ==========
  module.exports = {
    monitorarFome,
    verificarInventarioCheio,
    guardarNoBau,
    verificarNoiteEDormir
  };
  