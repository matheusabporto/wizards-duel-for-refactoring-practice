const express = require('express')
const fetch = require('node-fetch')

const app = express()
app.use(express.static('public'))
app.use(express.json())

// pega pack de cartas aleatorias
app.get('/api/pack', async (req, res) => {
  try {
    var pageNumber = Math.floor(Math.random() * 8) + 1
    var response = await fetch('https://api.potterdb.com/v1/characters?page[size]=100&page[number]=' + pageNumber)
    var responseData = await response.json()

    var characters = []
    for (var i = 0; i < responseData.data.length; i++) {
      var character = responseData.data[i]
      var attributes = character.attributes
      if (!attributes.name || attributes.name == '' || !attributes.image) continue

      var power = 50
      if (attributes.house == 'Gryffindor') power = 90
      if (attributes.house == 'Slytherin') power = 85
      if (attributes.house == 'Hufflepuff') power = 75
      if (attributes.house == 'Ravenclaw') power = 80

      var magic = 50
      if (attributes.species == 'human') magic = 70
      if (attributes.species == 'half-giant') magic = 88
      if (attributes.species == 'giant') magic = 95
      if (attributes.species == 'house elf') magic = 82
      if (attributes.species == 'ghost') magic = 60
      if (attributes.species == 'werewolf') magic = 91
      if (attributes.species == 'vampire') magic = 87
      if (attributes.species == 'centaur') magic = 78

      var defense = 50
      if (attributes.ancestry == 'pure-blood') defense = 90
      if (attributes.ancestry == 'half-blood') defense = 75
      if (attributes.ancestry == 'muggle-born') defense = 70
      if (attributes.ancestry == 'muggle') defense = 40
      if (attributes.ancestry == 'squib') defense = 35

      var hp = defense + Math.floor(Math.random() * 20) + 80

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
    res.json({ cards: characters.slice(0, 4) })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'erro ao buscar personagens' })
  }
})

// pega feiticos disponiveis
app.get('/api/spells', async (req, res) => {
  try {
    var response = await fetch('https://api.potterdb.com/v1/spells?page[size]=100')
    var responseData = await response.json()

    var spells = []
    for (var i = 0; i < responseData.data.length; i++) {
      var spell = responseData.data[i]
      var attributes = spell.attributes
      if (!attributes.name || attributes.name == '') continue

      var damage = 30
      if (attributes.category == 'Charm') damage = 45
      if (attributes.category == 'Curse') damage = 90
      if (attributes.category == 'Hex') damage = 65
      if (attributes.category == 'Jinx') damage = 55
      if (attributes.category == 'Spell') damage = 50
      if (attributes.category == 'Transfiguration') damage = 40
      if (attributes.category == 'Counter-spell') damage = 35
      if (attributes.category == 'Healing spell') damage = -40

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

    res.json({ spells: spells.slice(0, 20) })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'erro ao buscar feiticos' })
  }
})

// monta deck cpu com personagens aleatorios
app.post('/api/cpu-deck', async (req, res) => {
  try {
    var pageNumber = Math.floor(Math.random() * 8) + 1
    var response = await fetch('https://api.potterdb.com/v1/characters?page[size]=100&page[number]=' + pageNumber)
    var responseData = await response.json()

    var characters = []
    for (var i = 0; i < responseData.data.length; i++) {
      var character = responseData.data[i]
      var attributes = character.attributes
      if (!attributes.name || attributes.name == '' || !attributes.image) continue

      var power = 50
      if (attributes.house == 'Gryffindor') power = 90
      if (attributes.house == 'Slytherin') power = 85
      if (attributes.house == 'Hufflepuff') power = 75
      if (attributes.house == 'Ravenclaw') power = 80

      var magic = 50
      if (attributes.species == 'human') magic = 70
      if (attributes.species == 'half-giant') magic = 88
      if (attributes.species == 'giant') magic = 95
      if (attributes.species == 'house elf') magic = 82
      if (attributes.species == 'ghost') magic = 60
      if (attributes.species == 'werewolf') magic = 91
      if (attributes.species == 'vampire') magic = 87
      if (attributes.species == 'centaur') magic = 78

      var defense = 50
      if (attributes.ancestry == 'pure-blood') defense = 90
      if (attributes.ancestry == 'half-blood') defense = 75
      if (attributes.ancestry == 'muggle-born') defense = 70
      if (attributes.ancestry == 'muggle') defense = 40
      if (attributes.ancestry == 'squib') defense = 35

      var hp = defense + Math.floor(Math.random() * 20) + 80

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

    res.json({ deck: characters.slice(0, 2) })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'erro ao montar deck cpu' })
  }
})

app.listen(3000, () => {
  console.log('rodando na porta 3000')
})
