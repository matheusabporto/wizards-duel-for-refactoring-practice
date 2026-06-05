const express = require('express')
const { fetchCharacters } = require('../services/potterApi')
const { CPU_DECK_SIZE } = require('../constants')

const router = express.Router()

function shuffleArray(array) {
  for (var currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
    var randomIndex = Math.floor(Math.random() * (currentIndex + 1))
    var temp = array[currentIndex]; array[currentIndex] = array[randomIndex]; array[randomIndex] = temp
  }
  return array
}

router.post('/cpu-deck', async (req, res) => {
  try {
    var characters = await fetchCharacters()
    var shuffled = shuffleArray(characters)
    res.json({ deck: shuffled.slice(0, CPU_DECK_SIZE) })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'erro ao montar deck cpu' })
  }
})

module.exports = router
