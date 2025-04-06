function inclui(msg, ...palavras) {
    return palavras.every(p => msg.includes(p));
  }
  
  function contarItem(bot, nome) {
    return bot.inventory.items().filter(i => i.name.includes(nome))
      .reduce((acc, i) => acc + i.count, 0);
  }
  
  function temFerramenta(bot, tipo) {
    return bot.inventory.items().some(i => i.name.includes(tipo));
  }
  
  module.exports = {
    inclui,
    contarItem,
    temFerramenta
  };
  