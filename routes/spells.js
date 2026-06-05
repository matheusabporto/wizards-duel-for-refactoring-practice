const express = require('express')
const { fetchSpells } = require('../services/potterApi')
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
} = require('../constants')

const router = express.Router()

function shuffleArray(array) {
  for (var currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
    var randomIndex = Math.floor(Math.random() * (currentIndex + 1))
    var temp = array[currentIndex]; array[currentIndex] = array[randomIndex]; array[randomIndex] = temp
  }
  return array
}

router.get('/spells', async (req, res) => {
  try {
    var data = await fetchSpells()

    var spells = []
    for (var i = 0; i < data.length; i++) {
      var spell = data[i]
      var attributes = spell.attributes
      if (!attributes.name || attributes.name == '') continue

      var damage = DAMAGE_DEFAULT
      if (attributes.category == 'Charm') damage = DAMAGE_CHARM
      if (attributes.category == 'Curse') damage = DAMAGE_CURSE
      if (attributes.category == 'Hex') damage = DAMAGE_HEX
      if (attributes.category == 'Jinx') damage = DAMAGE_JINX
      if (attributes.category == 'Spell') damage = DAMAGE_SPELL
      if (attributes.category == 'Transfiguration') damage = DAMAGE_TRANSFIGURATION
      if (attributes.category == 'Counter-spell') damage = DAMAGE_COUNTER_SPELL
      if (attributes.category == 'Healing spell') damage = DAMAGE_HEALING

      var card = {}
      card.id = spell.id
      card.name = attributes.name
      card.effect = attributes.effect || 'Efeito desconhecido'
      card.category = attributes.category || 'Spell'
      card.light = attributes.light || 'Unknown'
      card.damage = damage

      spells.push(card)
    }

    var shuffled = shuffleArray(spells)
    res.json({ spells: shuffled.slice(0, SPELLS_COUNT) })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'erro ao buscar feiticos' })
  }
})

module.exports = router
