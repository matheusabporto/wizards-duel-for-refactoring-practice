const fetch = require('node-fetch')
const { API_PAGE_SIZE, API_TOTAL_PAGES } = require('../constants')
const { buildCard } = require('./statsCalculator')

async function fetchCharacters() {
  var pageNumber = Math.floor(Math.random() * API_TOTAL_PAGES) + 1
  var response = await fetch('https://api.potterdb.com/v1/characters?page[size]=' + API_PAGE_SIZE + '&page[number]=' + pageNumber)
  var responseData = await response.json()

  var characters = []
  for (var i = 0; i < responseData.data.length; i++) {
    var character = responseData.data[i]
    var attributes = character.attributes
    if (!attributes.name || attributes.name == '' || !attributes.image) continue
    characters.push(buildCard(character, attributes))
  }

  return characters
}

async function fetchSpells() {
  var response = await fetch('https://api.potterdb.com/v1/spells?page[size]=' + API_PAGE_SIZE)
  var responseData = await response.json()
  return responseData.data
}

module.exports = { fetchCharacters, fetchSpells }
