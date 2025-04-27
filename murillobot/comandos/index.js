// comandos/index.js

const { coletarBloco } = require('../recursos');
const mineracao = require('../mineracao');
const recursos = require('../recursos');
const util = require('../util');

let locaisSalvos = {}; // Locais memorizados

function processarComando(bot, username, message) {
  const msg = message.toLowerCase().replace(bot.username.toLowerCase(), '').trim();

  // Comandos disponíveis
  if (util.inclui(msg, "comandos")) {
    const comandos = [
      "📋 Comandos:",
      "- murillobot, minerar",
      "- murillobot, pegue madeira / pedra",
      "- murillobot, status",
      "- murillobot, memorize este lugar como <nome>",
      "- murillobot, vá para <nome>",
      "- murillobot, lugares salvos",
      "- murillobot, me siga",
      "- murillobot, pare",
      "- murillobot, modo automático madeira / pedra",
      "- murillobot, pare o modo automático"
    ];
    comandos.forEach(c => bot.chat(c));
    return;
  }

  // Iniciar mineração inteligente
  if (util.inclui(msg, "minerar")) {
    return mineracao.executarMineracao(bot);
  }

  // Pegar madeira ou pedra
  if (util.inclui(msg, "pegue", "madeira")) return coletarBloco(bot, "wood");
  if (util.inclui(msg, "pegue", "pedra")) return coletarBloco(bot, "stone");

  // Mostrar status
  if (util.inclui(msg, "status")) {
    const pos = bot.entity.position;
    bot.chat(`📍 ${pos.toString()} ❤️ ${bot.health}/20 🍗 ${bot.food}/20 🎒 ${bot.inventory.items().length} itens`);
    return;
  }

  // Memorizar local
  if (util.inclui(msg, "memorize", "como")) {
    const nome = msg.split("como")[1].trim().toLowerCase();
    locaisSalvos[nome] = bot.entity.position.clone();
    bot.chat(`✅ Local "${nome}" memorizado.`);
    return;
  }

  // Ir para local salvo
  if (util.inclui(msg, "vá para")) {
    const nome = msg.split("vá para")[1].trim().toLowerCase();
    if (!locaisSalvos[nome]) {
      bot.chat(`❌ Local "${nome}" não encontrado.`);
      return;
    }
    const { GoalBlock } = require('mineflayer-pathfinder').goals;
    bot.pathfinder.setGoal(new GoalBlock(locaisSalvos[nome].x, locaisSalvos[nome].y, locaisSalvos[nome].z));
    bot.chat(`Indo para "${nome}"...`);
    return;
  }

  // Listar locais salvos
  if (util.inclui(msg, "lugares", "salvos")) {
    const nomes = Object.keys(locaisSalvos);
    if (nomes.length === 0) {
      bot.chat("Nenhum local salvo ainda! 📍");
    } else {
      bot.chat(`📍 Locais salvos: ${nomes.join(", ")}`);
    }
    return;
  }

  // Seguir o jogador
  if (util.inclui(msg, "me siga")) {
    const player = bot.players[username]?.entity;
    if (!player) {
      bot.chat("Não consigo te ver! 😢");
      return;
    }
    const { GoalFollow } = require('mineflayer-pathfinder').goals;
    bot.pathfinder.setGoal(new GoalFollow(player, 1), true);
    bot.chat("Te seguindo! 🧍‍♂️➡️");
    return;
  }

  // Parar de seguir ou de se mover
  if (util.inclui(msg, "pare") && !util.inclui(msg, "modo automático")) {
    bot.pathfinder.setGoal(null);
    bot.chat("Parando. ⛔");
    return;
  }

  // Ativar modo automático (coletar madeira ou pedra)
  if (util.inclui(msg, "modo automático")) {
    if (msg.includes("madeira")) {
      bot.modoAutomatico = "wood";
    } else if (msg.includes("pedra")) {
      bot.modoAutomatico = "stone";
    } else {
      bot.chat("Tipo inválido. Use: madeira ou pedra.");
      return;
    }
    bot.modoLoop = true;
    bot.chat(`🔁 Modo automático de ${bot.modoAutomatico} ativado!`);
    return;
  }

  // Parar modo automático
  if (util.inclui(msg, "pare o modo automático")) {
    bot.modoLoop = false;
    bot.chat("⛔ Modo automático desativado.");
    return;
  }
}

module.exports = {
  processarComando
};
