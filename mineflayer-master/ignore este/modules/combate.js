module.exports = function(bot) {
    bot.on("physicTick", () => {
      const mob = bot.nearestEntity(entity =>
        entity.type === 'mob' &&
        entity.displayName?.toLowerCase() !== 'armor stand' &&
        entity.position.distanceTo(bot.entity.position) < 5
      );
  
      if (mob) {
        const espada = bot.inventory.items().find(i => i.name.includes("sword"));
        if (espada) bot.equip(espada, "hand").catch(() => {});
        if (bot.health > 10) {
          bot.attack(mob);
          bot.chat("Mob hostil detectado, atacando! ⚔️");
        } else {
          bot.chat("Mob detectado, mas estou fraco... fugindo! 🏃‍♂️");
        }
      }
    });
  };
  