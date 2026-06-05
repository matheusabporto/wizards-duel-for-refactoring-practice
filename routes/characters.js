const express = require('express');
const { fetchCharacters } = require('../services/potterApi');
const { PACK_SIZE } = require('../constants');

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

router.get('/pack', async (req, res) => {
  try {
    const characters = await fetchCharacters();
    const shuffled = shuffleArray(characters);
    res.json({ cards: shuffled.slice(0, PACK_SIZE) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'erro ao buscar personagens' });
  }
});

module.exports = router;
