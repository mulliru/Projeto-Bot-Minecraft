
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const collectBlock = require('mineflayer-collectblock').plugin;
const { GoalBlock, GoalFollow } = goals;
const Vec3 = require('vec3'); // IMPORTANTE



const DONO = 'omulliru';
const NOME_BOT = 'murillobot';

const bot = mineflayer.createBot({
  host: 'juliabesta.aternos.me',
  port: 16856,
  username: 'murillobot',
  auth: 'offline'
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(collectBlock);

let mcData;
let locaisSalvos = {};
let modoAutomatico = null;
let modoLoop = false;
let tempoInicial = Date.now();
let hasMinedCobble744 = false;
let baseTemporaria = null;
let minerando = false;
let blocoAtual = 0;



bot.once('spawn', () => {
  mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMove);
  bot.chat("Murillobot online! Só ouço meu mestre omulliru. Use: murillobot, comandos");
  setInterval(monitorarFome, 5000);
  setInterval(verificarNoiteEDormir, 10000);
  setInterval(verificarInventarioCheio, 8000);
  setInterval(() => {
    if (modoLoop) coletarBloco(modoAutomatico);
  }, 15000);
});

function inclui(msg, ...palavras) {
  return palavras.every(p => msg.includes(p));
}

bot.on('chat', async (username, message) => {
  if (!message.toLowerCase().startsWith(NOME_BOT)) return;

  if (username !== DONO) {
    bot.chat(`Desculpa ${username}, só meu mestre ${DONO} pode me comandar 😎`);
    return;
  }

  const msg = message.toLowerCase().replace(NOME_BOT, '').trim();

  if (inclui(msg, "comandos")) {
    return [
      "📋 Comandos:",
      "- murillobot, pegue madeira / pedra",
      "- murillobot, craftar machado / picareta",
      "- murillobot, guardar no baú",
      "- murillobot, me dê tudo",
      "- murillobot, o que você tem?",
      "- murillobot, status",
      "- murillobot, memorize este lugar como <nome>",
      "- murillobot, vá para <nome>",
      "- murillobot, lugares salvos",
      "- murillobot, me siga / pare",
      "- murillobot, modo automático madeira / pedra",
      "- murillobot, pare o modo automático"
    ].forEach(l => bot.chat(l));
  }


  if (inclui(msg, "vá", "minerar")) {
    bot.chat("Ok, vou começar a minerar por aqui! ⛏️");
    iniciarMineracaoColaborativa();
  }  

  if (inclui(msg, "mineracao", "estrategica")) {
    bot.chat("Iniciando mineração estratégica! ⛏️");
    mineracaoEstrategica();
  }  

  if (inclui(msg, "buscar", "pedras")) {
    bot.chat("Começando a coleta das 744 pedras!");
    coletarPedregulho744();
}

  if (inclui(msg, "status")) {
    const pos = bot.entity.position;
    const tempoOnline = Math.floor((Date.now() - tempoInicial) / 1000);
    const tempo = new Date(tempoOnline * 1000).toISOString().substr(11, 8);
    return bot.chat(`📍 ${pos.toString()} ❤️ ${bot.health}/20 🍗 ${bot.food}/20 🎒 ${bot.inventory.items().length} itens 🕐 ${tempo}`);
  }

  if (inclui(msg, "memorize", "como")) {
    const nome = msg.split("como")[1].trim().toLowerCase();
    locaisSalvos[nome] = bot.entity.position.clone();
    return bot.chat(`✅ Lugar "${nome}" memorizado.`);
  }

  if (inclui(msg, "vá para")) {
    const destino = msg.split("vá para")[1].trim();

    const partes = destino.split(/\s+/);
    if (partes.length === 3 && partes.every(p => !isNaN(parseFloat(p)))) {
      const [x, y, z] = partes.map(Number);
      bot.pathfinder.setGoal(new GoalBlock(x, y, z));
      return bot.chat(`Indo até as coordenadas: X:${x} Y:${y} Z:${z}`);
    }

    const nome = destino.toLowerCase();
    if (!(nome in locaisSalvos)) return bot.chat(`❌ Local "${nome}" não está salvo.`);
    const pos = locaisSalvos[nome];
    bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z));
    return bot.chat(`Indo até "${nome}"...`);
  }

  if (inclui(msg, "lugares", "salvos")) {
    const nomes = Object.keys(locaisSalvos);
    if (!nomes.length) return bot.chat("Nenhum local salvo.");
    return bot.chat(`📍 Locais salvos: ${nomes.join(", ")}`);
  }

  if (inclui(msg, "modo automático")) {
    const tipo = msg.includes("madeira") ? "wood" : msg.includes("pedra") ? "stone" : null;
    if (!tipo) return bot.chat("Tipo inválido. Use: madeira ou pedra.");
    modoLoop = true;
    modoAutomatico = tipo;
    return bot.chat(`🔁 Modo automático de ${tipo} ativado.`);
  }

  if (inclui(msg, "pare", "modo automático")) {
    modoLoop = false;
    return bot.chat("⛔ Modo automático desativado.");
  }

  if (inclui(msg, "me siga")) {
    const player = bot.players[username]?.entity;
    if (!player) return bot.chat("Não consigo te ver!");
    bot.pathfinder.setGoal(new GoalFollow(player, 1), true);
    return bot.chat("Te seguindo!");
  }

  if (inclui(msg, "pare")) {
    bot.pathfinder.setGoal(null);
    return bot.chat("Parando.");
  }

  
  
  if (inclui(msg, "saia do barco")) {
    if (!bot.vehicle) return bot.chat("Não estou em nenhum barco.");
    bot.dismount().then(() => bot.chat("Saí do barco! 🛑")).catch(() => bot.chat("Erro ao sair do barco 😢"));
    return;
  }

  if (inclui(msg, "entre no barco")) {
    
    const barco = bot.nearestEntity(e =>
      e.name.includes("boat") || e.displayName?.toLowerCase().includes("boat")
    );
    
    if (!barco) return bot.chat("Não achei nenhum barco por perto 😢");
    try {
  bot.mount(barco);
  bot.chat("Entrando no barco! 🚤");
} catch (err) {
  bot.chat("Não consegui entrar no barco 😢");
}
    return;
  }


  if (inclui(msg, "pegue", "madeira")) return coletarBloco("wood");
  if (inclui(msg, "pegue", "pedra")) return coletarBloco("stone");

  if (inclui(msg, "craftar", "machado")) return craftarFerramenta("wooden_axe");
  if (inclui(msg, "craftar", "picareta")) return craftarFerramenta("wooden_pickaxe");

  if (inclui(msg, "guardar", "baú")) return guardarNoBau();

  if (inclui(msg, "me dê tudo")) {
    const items = bot.inventory.items();
    if (!items.length) return bot.chat("Não tenho nada.");
    items.forEach(i => bot.toss(i.type, null, i.count));
    return bot.chat("Dropando tudo pra você!");
  }

  if (inclui(msg, "o que", "tem")) {
    const itens = bot.inventory.items().map(i => `${i.count}x ${i.name}`);
    return bot.chat(itens.length ? `Tenho: ${itens.join(", ")}` : "Estou vazio 😶");
  }
});

function coletarBloco(tipo) {
  const nomes = tipo === "wood" ? ["log", "wood"] : ["stone", "cobblestone"];
  const ferramenta = tipo === "wood" ? "axe" : "pickaxe";
  if (!temFerramenta(ferramenta)) craftarFerramenta(`wooden_${ferramenta}`);

  bot.chat(`Procurando ${tipo}...`);
  const blocos = bot.findBlocks({
    matching: block => nomes.some(n => block.name.includes(n)),
    maxDistance: 64,
    count: 5
  });

  if (blocos.length === 0) return bot.chat(`Não achei ${tipo} 😢`);
  const targets = blocos.map(pos => bot.blockAt(pos)).filter(Boolean);

  bot.collectBlock.collect(targets)
    .then(() => bot.chat(`${tipo} coletada ✅`))
    .catch(err => {
      bot.chat(`Erro ao coletar ${tipo}`);
      console.log(err);
    });
}

function craftarFerramenta(nomeItem) {
  const mesa = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!mesa) return bot.chat("Preciso de uma mesa de trabalho!");

  const item = mcData.itemsByName[nomeItem];
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

function temFerramenta(tipo) {
  return bot.inventory.items().some(i => i.name.includes(tipo));
}

function guardarNoBau() {
  const bau = bot.findBlock({
    matching: block => block.name.includes("chest"),
    maxDistance: 32
  });

  if (!bau) return bot.chat("Não achei baú.");
  const baublock = bot.blockAt(bau.position);

  bot.openChest(baublock)
    .then(chest => {
      const items = bot.inventory.items().filter(i => i.name.includes("wood") || i.name.includes("stone") || i.name.includes("log"));
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

function monitorarFome() {
  if (bot.food < 18) {
    const comida = bot.inventory.items().find(i => i.name.includes("beef") || i.name.includes("bread") || i.name.includes("porkchop") || i.name.includes("carrot"));
    if (comida) {
      bot.equip(comida, "hand")
        .then(() => bot.consume())
        .then(() => bot.chat("Comi algo, estava ficando com fome 🍖"))
        .catch(() => {});
    } else {
      bot.chat("Tô com fome e sem comida 😢");
    }
  }
}

function verificarNoiteEDormir() {
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

function verificarInventarioCheio() {
  if (bot.inventory.emptySlotCount() < 2) {
    bot.chat("Inventário cheio! Indo guardar recursos...");
    guardarNoBau();
  }
}


bot.on("physicTick", () => {
  const inimigo = bot.nearestEntity(entity =>
    entity.type === 'mob' &&
    entity.displayName.toLowerCase() !== 'armor stand' &&
    entity.position.distanceTo(bot.entity.position) < 5
  );

  if (inimigo) {
    const espada = bot.inventory.items().find(i => i.name.includes("sword"));
    if (espada) bot.equip(espada, "hand").catch(() => {});
    if (bot.health > 10) {
      bot.attack(inimigo);
      bot.chat("Mob hostil detectado, atacando! ⚔️");
    } else {
      bot.chat("Mob detectado, mas estou fraco... fugindo! 🏃‍♂️");
    }
  }
});


  

async function iniciarMineracaoProfunda() {
  if (!hasMinedCobble744) return coletarPedregulho744();

  if (!baseTemporaria) {
    const pos = bot.entity.position.floored();
    bot.chat(`Base temporária em X:${pos.x} Y:${pos.y} Z:${pos.z} 🧰`);

    const chestItem = bot.inventory.items().find(i => i.name.includes("chest"));
    if (!chestItem) await craftarItem("chest", 1);

    await bot.placeBlock(bot.blockAt(pos.offset(0, -1, 0)), new Vec3(0, 1, 0));
    baseTemporaria = pos;
  }

  minerarMinerios();
}

async function coletarPedregulho744() {
  const quantidade = contarItem("cobblestone");
  if (quantidade >= 744) {
    hasMinedCobble744 = true;
    bot.chat("Já tenho 744 pedregulhos! ✅");
    return iniciarMineracaoProfunda();
  }

  const blocos = bot.findBlocks({
    matching: block => block.name.includes("stone"),
    maxDistance: 64,
    count: 10
  });

  if (!blocos.length) return bot.chat("Não achei pedra 😢");

  const targets = blocos.map(pos => bot.blockAt(pos)).filter(Boolean);
  bot.collectBlock.collect(targets).then(() => coletarPedregulho744());
}

async function minerarMinerios() {
  const minerios = ["coal_ore", "iron_ore", "gold_ore", "diamond_ore"];
  const bloco = bot.findBlock({ matching: b => minerios.includes(b.name), maxDistance: 64 });

  if (!bloco) return bot.chat("Sem minérios próximos 😢");

  if (!temPicareta()) await fazerPicareta();

  bot.pathfinder.setGoal(new GoalBlock(bloco.position.x, bloco.position.y, bloco.position.z));
  setTimeout(async () => {
    await bot.dig(bot.blockAt(bloco.position));
    guardarItensValiosos();
    minerarMinerios();
  }, 3000);
}

async function fazerPicareta() {
  if (!contarItem("log")) await coletarBloco("wood");
  if (!bot.findBlock({ matching: mcData.blocksByName.crafting_table.id })) await craftarItem("crafting_table", 1);
  await craftarItem("wooden_pickaxe", 1);
}

function contarItem(nome) {
  return bot.inventory.items().filter(i => i.name.includes(nome)).reduce((acc, i) => acc + i.count, 0);
}

function temPicareta() {
  return bot.inventory.items().some(i => i.name.includes("pickaxe"));
}

async function craftarItem(nome, qtd) {
  const mesa = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 16 });
  if (!mesa) return;

  const item = mcData.itemsByName[nome];
  const recipe = bot.recipesFor(item.id, null, qtd, mesa)[0];
  await bot.craft(recipe, qtd, mesa);
}

function guardarItensValiosos() {
  const baublock = bot.blockAt(baseTemporaria.offset(0, 1, 0));
  if (!baublock || !baublock.name.includes("chest")) return;

  bot.openChest(baublock).then(chest => {
    const valiosos = bot.inventory.items().filter(i => ["ore", "diamond"].some(v => i.name.includes(v)));
    Promise.all(valiosos.map(i => chest.deposit(i.type, null, i.count))).then(() => chest.close());
  });
}

async function mineracaoEstrategica() {
  try {
    if (minerando) return bot.chat("Já estou minerando!");
    minerando = true;

    let pos = bot.entity.position.floored();
    while (pos.y > -59) {
      const abaixo = bot.blockAt(pos.offset(0, -1, 0));

      if (!abaixo) {
        bot.chat("Não tem bloco abaixo de mim! 😵");
        minerando = false;
        return;
      }

      // Se for pedra e não tiver picareta, cria uma
      if (abaixo.name.includes("stone") && !temPicareta()) {
        bot.chat("Preciso de picareta antes de continuar 🪓");
        await fazerPicareta();
      }

      if (bot.canDigBlock(abaixo)) {
        await bot.dig(abaixo);
        pos = bot.entity.position.floored();
      } else {
        bot.chat(`Não consigo quebrar ${abaixo.name} 😢`);
        minerando = false;
        return;
      }

      // Pequena pausa para evitar sobrecarregar
      await bot.waitForTicks(5);
    }

    bot.chat("Cheguei na camada ideal! Vamos minerar! 💎");
    cavarTunel();
  } catch (e) {
    bot.chat("Erro durante a mineração estratégica ❌");
    console.log(e);
    minerando = false;
  }
}



async function cavarTunel() {
  for (let i = 0; i < 100 && minerando; i++) {
    const frente = bot.entity.position.offset(1, 0, 0).floored();
    const blocoFrente = bot.blockAt(frente);
    if (blocoFrente && bot.canDigBlock(blocoFrente)) {
      await bot.dig(blocoFrente);
    }

    await verificarMineriosProximos();

    if (blocoAtual % 10 === 0) colocarTocha();
    blocoAtual++;

    if (bot.inventory.emptySlotCount() < 2) {
      bot.chat("Inventário cheio! Voltando para guardar. 📦");
      minerando = false;
      guardarItensValiosos();
      return;
    }
  }

  bot.chat("Túnel concluído! Posso continuar se quiser.");
  minerando = false;
}

async function verificarMineriosProximos() {
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

function colocarTocha() {
  const tocha = bot.inventory.items().find(i => i.name.includes("torch"));
  if (!tocha) return;

  const bloco = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  if (!bloco) return;

  bot.equip(tocha, 'hand').then(() => {
    bot.placeBlock(bloco, new Vec3(0, 1, 0)).catch(() => {});
  });
}

async function iniciarMineracaoColaborativa() {
  if (minerando) return bot.chat("Já estou minerando!");
  minerando = true;

  let base = bot.entity.position.floored();
  let direcao = new Vec3(1, 0, 0); // cava pra frente inicialmente
  let blocosCavados = 0;

  while (minerando) {
    const alvo = bot.blockAt(base.offset(direcao.x, direcao.y, direcao.z));
    if (alvo && bot.canDigBlock(alvo)) {
      if (alvo.name.includes("stone") && !temPicareta()) await fazerPicareta();
      await bot.dig(alvo);
    }

    // Procura minérios próximos
    const minerio = bot.findBlock({
      matching: b =>
        ["coal_ore", "iron_ore", "gold_ore", "diamond_ore", "redstone_ore", "lapis_ore"].includes(b.name),
      maxDistance: 8
    });

    if (minerio && bot.canDigBlock(minerio)) {
      bot.chat(`Achei ${minerio.name.replace("_ore", "")}! 💎`);
      await bot.pathfinder.goto(new GoalBlock(minerio.position.x, minerio.position.y, minerio.position.z));
      await bot.dig(bot.blockAt(minerio.position));
    }

    // Coloca tocha a cada 10 blocos
    if (blocosCavados % 10 === 0) colocarTocha();

    blocosCavados++;

    // Atualiza a base pra próxima escavação
    base = base.offset(direcao.x, direcao.y, direcao.z);

    // Verifica inventário cheio
    if (bot.inventory.emptySlotCount() < 2) {
      bot.chat("Inventário cheio! Indo guardar 📦");
      guardarItensValiosos();
      minerando = false;
      return;
    }

    // Verifica vida
    if (bot.health < 8) {
      bot.chat("Estou ferido 😢. Parando a mineração.");
      minerando = false;
      return;
    }

    await bot.waitForTicks(10);
  }
}
