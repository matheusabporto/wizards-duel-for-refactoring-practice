const {
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
} = require('../constants')

function buildCard(character, attributes) {
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

  return card
}

module.exports = { buildCard }
