// recursos/index.js

const { coletarBloco } = require('./coleta');
const { craftarItem, craftarFerramenta, colocarMesaDeTrabalho } = require('./crafting');
const { guardarNoBau, monitorarFome, verificarInventarioCheio, verificarNoiteEDormir } = require('./inventario');

module.exports = {
  coletarBloco,
  craftarItem,
  craftarFerramenta,
  colocarMesaDeTrabalho,
  guardarNoBau,
  monitorarFome,
  verificarInventarioCheio,
  verificarNoiteEDormir
};
