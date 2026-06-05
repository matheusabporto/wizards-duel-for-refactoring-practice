const fetch = require('node-fetch');
const { API_PAGE_SIZE, API_TOTAL_PAGES } = require('../constants');
const { buildCard } = require('./statsCalculator');

async function fetchCharacters() {
  const pageNumber = Math.floor(Math.random() * API_TOTAL_PAGES) + 1;
  const response = await fetch(`https://api.potterdb.com/v1/characters?page[size]=${API_PAGE_SIZE}&page[number]=${pageNumber}`);
  const responseData = await response.json();

  const characters = [];
  for (let i = 0; i < responseData.data.length; i += 1) {
    const character = responseData.data[i];
    const { attributes } = character;
    if (attributes.name && attributes.name !== '' && attributes.image) {
      characters.push(buildCard(character, attributes));
    }
  }

  return characters;
}

async function fetchSpells() {
  const response = await fetch(`https://api.potterdb.com/v1/spells?page[size]=${API_PAGE_SIZE}`);
  const responseData = await response.json();
  return responseData.data;
}

module.exports = { fetchCharacters, fetchSpells };
