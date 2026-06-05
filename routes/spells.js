const express = require('express');
const { fetchSpells } = require('../services/potterApi');
const {
  SPELLS_COUNT,
  DAMAGE_DEFAULT,
  DAMAGE_CHARM,
  DAMAGE_CURSE,
  DAMAGE_HEX,
  DAMAGE_JINX,
  DAMAGE_SPELL,
  DAMAGE_TRANSFIGURATION,
  DAMAGE_COUNTER_SPELL,
  DAMAGE_HEALING,
} = require('../constants');

const router = express.Router();

function shuffleArray(array) {
  const arr = [...array];
  for (let currentIndex = arr.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
    const temp = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temp;
  }
  return arr;
}

router.get('/spells', async (req, res) => {
  try {
    const data = await fetchSpells();

    const spells = [];
    for (let i = 0; i < data.length; i += 1) {
      const spell = data[i];
      const { attributes } = spell;
      if (attributes.name && attributes.name !== '') {
        let damage = DAMAGE_DEFAULT;
        if (attributes.category === 'Charm') damage = DAMAGE_CHARM;
        if (attributes.category === 'Curse') damage = DAMAGE_CURSE;
        if (attributes.category === 'Hex') damage = DAMAGE_HEX;
        if (attributes.category === 'Jinx') damage = DAMAGE_JINX;
        if (attributes.category === 'Spell') damage = DAMAGE_SPELL;
        if (attributes.category === 'Transfiguration') damage = DAMAGE_TRANSFIGURATION;
        if (attributes.category === 'Counter-spell') damage = DAMAGE_COUNTER_SPELL;
        if (attributes.category === 'Healing spell') damage = DAMAGE_HEALING;

        const card = {};
        card.id = spell.id;
        card.name = attributes.name;
        card.effect = attributes.effect || 'Efeito desconhecido';
        card.category = attributes.category || 'Spell';
        card.light = attributes.light || 'Unknown';
        card.damage = damage;

        spells.push(card);
      }
    }

    const shuffled = shuffleArray(spells);
    res.json({ spells: shuffled.slice(0, SPELLS_COUNT) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'erro ao buscar feiticos' });
  }
});

module.exports = router;
