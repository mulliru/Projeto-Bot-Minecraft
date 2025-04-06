function monitorarFome(bot) {
    if (bot.food < 18) {
      const comida = bot.inventory.items().find(i =>
        ["beef", "bread", "porkchop", "carrot"].some(f => i.name.includes(f))
      );
      if (comida) {
        bot.equip(comida, "hand")
          .then(() => bot.consume())
          .then(() => bot.chat("Comi algo, estava com fome 🍖"))
          .catch(() => {});
      } else {
        bot.chat("Tô com fome e sem comida 😢");
      }
    }
  }
  
  function verificarNoiteEDormir(bot) {
    if (!bot.time.isDay) {
      const cama = bot.findBlock({
        matching: block => block.name.includes("bed"),
        maxDistance: 32
      });
  
      if (cama) {
        bot.sleep(bot.blockAt(cama.position))
          .then(() => bot.chat("Dormindo 😴"))
          .catch(() => bot.chat("Não consegui dormir 😢"));
      }
    }
  }
  
  function verificarInventarioCheio(bot) {
    if (bot.inventory.emptySlotCount() < 2) {
      bot.chat("Inventário cheio! Indo guardar recursos...");
      guardarNoBau(bot);
    }
  }
  
  function guardarNoBau(bot) {
    const bau = bot.findBlock({
      matching: block => block.name.includes("chest"),
      maxDistance: 32
    });
  
    if (!bau) return bot.chat("Não achei baú.");
  
    const baublock = bot.blockAt(bau.position);
  
    bot.openChest(baublock)
      .then(chest => {
        const items = bot.inventory.items().filter(i =>
          ["wood", "stone", "log"].some(k => i.name.includes(k))
        );
        if (items.length === 0) {
          bot.chat("Nada pra guardar.");
          chest.close();
          return;
        }
  
        Promise.all(items.map(i => chest.deposit(i.type, null, i.count)))
          .then(() => {
            bot.chat("Guardei os recursos no baú 📦");
            chest.close();
          }).catch(err => {
            bot.chat("Erro ao guardar.");
            console.log(err);
            chest.close();
          });
      }).catch(err => {
        bot.chat("Erro ao abrir o baú.");
        console.log(err);
      });
  }
  
  function listarInventario(bot) {
    const itens = bot.inventory.items().map(i => `${i.count}x ${i.name}`);
    bot.chat(itens.length ? `Tenho: ${itens.join(", ")}` : "Estou vazio 😶");
  }
  
  module.exports = {
    monitorarFome,
    verificarNoiteEDormir,
    verificarInventarioCheio,
    guardarNoBau,
    listarInventario
  };
  