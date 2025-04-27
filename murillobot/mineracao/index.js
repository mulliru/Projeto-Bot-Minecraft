// mineracao/index.js

const { GoalBlock } = require('mineflayer-pathfinder').goals;
const Vec3 = require('vec3');

// Função principal pública
async function executarMineracao(bot) {
  bot.chat("Iniciando modo mineração completa! ⛏️");

  // Passo 1: garantir picareta
  if (!temPicareta(bot)) {
    await fazerPicareta(bot);
  }

  // Passo 2: coletar pedregulho se necessário
  if (contarItem(bot, "cobblestone") < 744) {
    await coletarPedregulho(bot);
  }

  // Passo 3: descer até a camada de mineração (-59)
  await mineracaoEstrategica(bot);

  // Passo 4: cavar túneis e coletar minérios
  await cavarTunel(bot);

  bot.chat("Mineração completa finalizada! 💎");
}

// ========== Funções privadas internas ========== //

function temPicareta(bot) {
  return bot.inventory.items().some(item => item.name.includes('pickaxe'));
}

async function fazerPicareta(bot) {
  bot.chat("Fazendo uma picareta! 🛠️");

  // Coletar madeira se não tiver
  if (!bot.inventory.items().some(item => item.name.includes('log') || item.name.includes('planks'))) {
    await coletarMadeira(bot);
  }

  // Craftar crafting table se não tiver
  const mesa = bot.findBlock({ matching: bot.mcData.blocksByName.crafting_table.id, maxDistance: 16 });
  if (!mesa) {
    await craftarItem(bot, "crafting_table", 1);
    await colocarMesaDeTrabalho(bot);
  }

  // Craftar a picareta
  await craftarItem(bot, "wooden_pickaxe", 1);
}

async function coletarPedregulho(bot) {
  bot.chat("Coletando pedregulho... 🪨");

  while (contarItem(bot, "cobblestone") < 744) {
    const blocos = bot.findBlocks({
      matching: block => block.name.includes('stone'),
      maxDistance: 64,
      count: 10
    });

    if (blocos.length === 0) {
      bot.chat("Não achei pedra 😢");
      return;
    }

    const targets = blocos.map(pos => bot.blockAt(pos)).filter(Boolean);

    await bot.collectBlock.collect(targets);
  }

  bot.chat("744 pedregulhos coletados! ✅");
}

async function mineracaoEstrategica(bot) {
  bot.chat("Descendo em mineração estratégica! 📉");

  let pos = bot.entity.position.floored();

  while (pos.y > -59) {
    const abaixo = bot.blockAt(pos.offset(0, -1, 0));

    if (!abaixo) {
      bot.chat("Sem bloco abaixo! 😵");
      break;
    }

    if (bot.canDigBlock(abaixo)) {
      await bot.dig(abaixo);
    } else {
      bot.chat(`Não consigo quebrar ${abaixo.name}`);
      break;
    }

    await bot.waitForTicks(5);
    pos = bot.entity.position.floored();
  }

  bot.chat("Cheguei na camada ideal! Vamos cavar túnel! 🛤️");
}

async function cavarTunel(bot) {
  bot.chat("Começando a cavar túnel... 🚇");

  let blocoAtual = 0;

  for (let i = 0; i < 100; i++) {
    const frente = bot.entity.position.offset(1, 0, 0).floored();
    const blocoFrente = bot.blockAt(frente);

    if (blocoFrente && bot.canDigBlock(blocoFrente)) {
      await bot.dig(blocoFrente);
    }

    await verificarMineriosProximos(bot);

    if (blocoAtual % 10 === 0) {
      colocarTocha(bot);
    }

    blocoAtual++;

    if (bot.inventory.emptySlotCount() < 2) {
      bot.chat("Inventário cheio! Indo guardar 📦");
      await guardarItensValiosos(bot);
      break;
    }

    await bot.waitForTicks(10);
  }

  bot.chat("Túnel concluído! 🚀");
}

async function verificarMineriosProximos(bot) {
  const minerios = [
    "coal_ore", "iron_ore", "gold_ore",
    "diamond_ore", "redstone_ore", "lapis_ore"
  ];

  const bloco = bot.findBlock({ matching: b => minerios.includes(b.name), maxDistance: 5 });

  if (bloco && bot.canDigBlock(bloco)) {
    await bot.dig(bloco);
    bot.chat(`Minerando ${bloco.name.replace("_ore", "")}! ✨`);
  }
}

function colocarTocha(bot) {
  const tocha = bot.inventory.items().find(i => i.name.includes("torch"));
  if (!tocha) return;

  const bloco = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  if (!bloco) return;

  bot.equip(tocha, 'hand').then(() => {
    bot.placeBlock(bloco, new Vec3(0, 1, 0)).catch(() => {});
  });
}

async function guardarItensValiosos(bot) {
  // Aqui você pode abrir baú e guardar minério, diamante etc.
  bot.chat("Guardando itens valiosos... 📦");
  // (pode detalhar isso depois se quiser)
}

async function coletarMadeira(bot) {
  bot.chat("Coletando madeira... 🌳");

  const blocos = bot.findBlocks({
    matching: block => block.name.includes('log') || block.name.includes('wood'),
    maxDistance: 64,
    count: 5
  });

  if (blocos.length === 0) {
    bot.chat("Não achei árvores 😢");
    return;
  }

  const targets = blocos.map(pos => bot.blockAt(pos)).filter(Boolean);

  await bot.collectBlock.collect(targets);
}

async function craftarItem(bot, nomeItem, quantidade) {
  const mesa = bot.findBlock({ matching: bot.mcData.blocksByName.crafting_table.id, maxDistance: 16 });
  if (!mesa) {
    bot.chat("Preciso de uma mesa de trabalho para craftar!");
    return;
  }

  const item = bot.mcData.itemsByName[nomeItem];
  const recipe = bot.recipesFor(item.id, null, quantidade, mesa)[0];

  if (!recipe) {
    bot.chat(`Não tenho os materiais para fazer ${nomeItem} 😢`);
    return;
  }

  await bot.craft(recipe, quantidade, mesa);
}

async function colocarMesaDeTrabalho(bot) {
  const bloco = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  const mesaItem = bot.inventory.items().find(i => i.name.includes('crafting_table'));

  if (!mesaItem || !bloco) return;

  await bot.equip(mesaItem, 'hand');
  await bot.placeBlock(bloco, new Vec3(0, 1, 0));
}

function contarItem(bot, nome) {
  return bot.inventory.items().filter(i => i.name.includes(nome)).reduce((acc, i) => acc + i.count, 0);
}

// ========== EXPORTS ==========
module.exports = {
  executarMineracao
};
