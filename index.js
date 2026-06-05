const express = require('express')
const fetch = require('node-fetch')
const {
  API_PAGE_SIZE,
  API_TOTAL_PAGES,
  PACK_SIZE,
  CPU_DECK_SIZE,
  SPELLS_COUNT,
  HP_BASE,
  HP_RANDOM_RANGE,
  POWER_DEFAULT,
  POWER_GRYFFINDOR,
  POWER_SLYTHERIN,
  POWER_HUFFLEPUFF,
  POWER_RAVENCLAW,
  MAGIC_DEFAULT,
  MAGIC_HUMAN,
  MAGIC_HALF_GIANT,
  MAGIC_GIANT,
  MAGIC_HOUSE_ELF,
  MAGIC_GHOST,
  MAGIC_WEREWOLF,
  MAGIC_VAMPIRE,
  MAGIC_CENTAUR,
  DEFENSE_DEFAULT,
  DEFENSE_PURE_BLOOD,
  DEFENSE_HALF_BLOOD,
  DEFENSE_MUGGLE_BORN,
  DEFENSE_MUGGLE,
  DEFENSE_SQUIB,
  DAMAGE_DEFAULT,
  DAMAGE_CHARM,
  DAMAGE_CURSE,
  DAMAGE_HEX,
  DAMAGE_JINX,
  DAMAGE_SPELL,
  DAMAGE_TRANSFIGURATION,
  DAMAGE_COUNTER_SPELL,
  DAMAGE_HEALING,
} = require('./constants')

const app = express()
app.use(express.static('public'))
app.use(express.json())

// pega pack de cartas aleatorias
app.get('/api/pack', async (req, res) => {
  try {
    var pageNumber = Math.floor(Math.random() * API_TOTAL_PAGES) + 1
    var response = await fetch('https://api.potterdb.com/v1/characters?page[size]=' + API_PAGE_SIZE + '&page[number]=' + pageNumber)
    var responseData = await response.json()

    var characters = []
    for (var i = 0; i < responseData.data.length; i++) {
      var character = responseData.data[i]
      var attributes = character.attributes
      if (!attributes.name || attributes.name == '' || !attributes.image) continue

      var power = POWER_DEFAULT
      if (attributes.house == 'Gryffindor') power = POWER_GRYFFINDOR
      if (attributes.house == 'Slytherin') power = POWER_SLYTHERIN
      if (attributes.house == 'Hufflepuff') power = POWER_HUFFLEPUFF
      if (attributes.house == 'Ravenclaw') power = POWER_RAVENCLAW

      var magic = MAGIC_DEFAULT
      if (attributes.species == 'human') magic = MAGIC_HUMAN
      if (attributes.species == 'half-giant') magic = MAGIC_HALF_GIANT
      if (attributes.species == 'giant') magic = MAGIC_GIANT
      if (attributes.species == 'house elf') magic = MAGIC_HOUSE_ELF
      if (attributes.species == 'ghost') magic = MAGIC_GHOST
      if (attributes.species == 'werewolf') magic = MAGIC_WEREWOLF
      if (attributes.species == 'vampire') magic = MAGIC_VAMPIRE
      if (attributes.species == 'centaur') magic = MAGIC_CENTAUR

      var defense = DEFENSE_DEFAULT
      if (attributes.ancestry == 'pure-blood') defense = DEFENSE_PURE_BLOOD
      if (attributes.ancestry == 'half-blood') defense = DEFENSE_HALF_BLOOD
      if (attributes.ancestry == 'muggle-born') defense = DEFENSE_MUGGLE_BORN
      if (attributes.ancestry == 'muggle') defense = DEFENSE_MUGGLE
      if (attributes.ancestry == 'squib') defense = DEFENSE_SQUIB

      var hp = defense + Math.floor(Math.random() * HP_RANDOM_RANGE) + HP_BASE

      var card = {}
      card.id = character.id
      card.name = attributes.name
      card.house = attributes.house || 'Unknown'
      card.species = attributes.species || 'Unknown'
      card.ancestry = attributes.ancestry || 'Unknown'
      card.image = attributes.image
      card.power = power
      card.magic = magic
      card.defense = defense
      card.hp = hp
      card.maxHp = hp

      characters.push(card)
    }

    // embaralha
    for (var currentIndex = characters.length - 1; currentIndex > 0; currentIndex--) {
      var randomIndex = Math.floor(Math.random() * (currentIndex + 1))
      var temp = characters[currentIndex]; characters[currentIndex] = characters[randomIndex]; characters[randomIndex] = temp
    }

    // retorna 4 cartas
    res.json({ cards: characters.slice(0, PACK_SIZE) })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'erro ao buscar personagens' })
  }
})

// pega feiticos disponiveis
app.get('/api/spells', async (req, res) => {
  try {
    var response = await fetch('https://api.potterdb.com/v1/spells?page[size]=' + API_PAGE_SIZE)
    var responseData = await response.json()

    var spells = []
    for (var i = 0; i < responseData.data.length; i++) {
      var spell = responseData.data[i]
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

    // embaralha e retorna 20
    for (var currentIndex = spells.length - 1; currentIndex > 0; currentIndex--) {
      var randomIndex = Math.floor(Math.random() * (currentIndex + 1))
      var temp = spells[currentIndex]; spells[currentIndex] = spells[randomIndex]; spells[randomIndex] = temp
    }

    res.json({ spells: spells.slice(0, SPELLS_COUNT) })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'erro ao buscar feiticos' })
  }
})

// monta deck cpu com personagens aleatorios
app.post('/api/cpu-deck', async (req, res) => {
  try {
    var pageNumber = Math.floor(Math.random() * API_TOTAL_PAGES) + 1
    var response = await fetch('https://api.potterdb.com/v1/characters?page[size]=' + API_PAGE_SIZE + '&page[number]=' + pageNumber)
    var responseData = await response.json()

    var characters = []
    for (var i = 0; i < responseData.data.length; i++) {
      var character = responseData.data[i]
      var attributes = character.attributes
      if (!attributes.name || attributes.name == '' || !attributes.image) continue

      var power = POWER_DEFAULT
      if (attributes.house == 'Gryffindor') power = POWER_GRYFFINDOR
      if (attributes.house == 'Slytherin') power = POWER_SLYTHERIN
      if (attributes.house == 'Hufflepuff') power = POWER_HUFFLEPUFF
      if (attributes.house == 'Ravenclaw') power = POWER_RAVENCLAW

      var magic = MAGIC_DEFAULT
      if (attributes.species == 'human') magic = MAGIC_HUMAN
      if (attributes.species == 'half-giant') magic = MAGIC_HALF_GIANT
      if (attributes.species == 'giant') magic = MAGIC_GIANT
      if (attributes.species == 'house elf') magic = MAGIC_HOUSE_ELF
      if (attributes.species == 'ghost') magic = MAGIC_GHOST
      if (attributes.species == 'werewolf') magic = MAGIC_WEREWOLF
      if (attributes.species == 'vampire') magic = MAGIC_VAMPIRE
      if (attributes.species == 'centaur') magic = MAGIC_CENTAUR

      var defense = DEFENSE_DEFAULT
      if (attributes.ancestry == 'pure-blood') defense = DEFENSE_PURE_BLOOD
      if (attributes.ancestry == 'half-blood') defense = DEFENSE_HALF_BLOOD
      if (attributes.ancestry == 'muggle-born') defense = DEFENSE_MUGGLE_BORN
      if (attributes.ancestry == 'muggle') defense = DEFENSE_MUGGLE
      if (attributes.ancestry == 'squib') defense = DEFENSE_SQUIB

      var hp = defense + Math.floor(Math.random() * HP_RANDOM_RANGE) + HP_BASE

      var card = {}
      card.id = character.id
      card.name = attributes.name
      card.house = attributes.house || 'Unknown'
      card.species = attributes.species || 'Unknown'
      card.ancestry = attributes.ancestry || 'Unknown'
      card.image = attributes.image
      card.power = power
      card.magic = magic
      card.defense = defense
      card.hp = hp
      card.maxHp = hp

      characters.push(card)
    }

    for (var currentIndex = characters.length - 1; currentIndex > 0; currentIndex--) {
      var randomIndex = Math.floor(Math.random() * (currentIndex + 1))
      var temp = characters[currentIndex]; characters[currentIndex] = characters[randomIndex]; characters[randomIndex] = temp
    }

    res.json({ deck: characters.slice(0, CPU_DECK_SIZE) })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'erro ao montar deck cpu' })
  }
})

app.listen(3000, () => {
  console.log('rodando na porta 3000')
})
