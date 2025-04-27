// combate/index.js

const { GoalBlock } = require('mineflayer-pathfinder').goals;

// Função para detectar mobs e agir
function detectarECombater(bot) {
  const inimigo = bot.nearestEntity(entity =>
    entity.type === 'mob' &&
    entity.displayName.toLowerCase() !== 'armor stand' &&
    entity.position.distanceTo(bot.entity.position) < 5
  );

  if (inimigo) {
    const espada = bot.inventory.items().find(i => i.name.includes("sword"));

    if (espada) {
      bot.equip(espada, "hand").catch(() => {});
    }

    if (bot.health > 10) {
      bot.attack(inimigo);
      bot.chat("Mob hostil detectado, atacando! ⚔️");
    } else {
      fugir(bot);
    }
  }
}

// Função para fugir caso esteja fraco
function fugir(bot) {
  bot.chat("Mob detectado, mas estou fraco... fugindo! 🏃‍♂️");

  // Gera uma posição aleatória próxima para fugir
  const posAtual = bot.entity.position;
  const destino = posAtual.offset(
    Math.random() * 10 - 5,
    0,
    Math.random() * 10 - 5
  ).floored();

  bot.pathfinder.setGoal(new GoalBlock(destino.x, destino.y, destino.z));
}

module.exports = {
  detectarECombater
};
