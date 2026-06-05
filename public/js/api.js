// ── LOADING ────────────────────────────────────────────

async function loadGame() {
  var loadBar = document.getElementById('loadBar')
  var loadMsg = document.getElementById('loadMsg')

  loadMsg.textContent = 'Invocando personagens...'
  loadBar.style.width = '20%'

  var packResponse = await fetch('/api/pack')
  var packData = await packResponse.json()
  state.pack = packData.cards

  loadBar.style.width = '55%'
  loadMsg.textContent = 'Consultando o livro de feitiços...'

  var spellResponse = await fetch('/api/spells')
  var spellData = await spellResponse.json()
  state.spells = spellData.spells

  loadBar.style.width = '85%'
  loadMsg.textContent = 'Preparando o adversário...'

  var cpuResponse = await fetch('/api/cpu-deck', { method: 'POST' })
  var cpuData = await cpuResponse.json()
  state.cpuDeck = cpuData.deck

  // atribui feitiços aleatorios ao jogador
  var shuffled = state.spells.slice()
  for (var currentIndex = shuffled.length - 1; currentIndex > 0; currentIndex--) {
    var randomIndex = Math.floor(Math.random() * (currentIndex + 1))
    var temp = shuffled[currentIndex]; shuffled[currentIndex] = shuffled[randomIndex]; shuffled[randomIndex] = temp
  }
  state.playerSpells = shuffled.slice(0, 5)

  loadBar.style.width = '100%'
  loadMsg.textContent = 'Pronto!'

  setTimeout(function() {
    document.getElementById('screen-loading').classList.add('fade-out')
    setTimeout(function() {
      document.getElementById('screen-loading').style.display = 'none'
      showScreen('screen-draft')
      renderPack()
    }, 600)
  }, 400)
}

// ── REROLL ─────────────────────────────────────────────

async function rerollPack() {
  state.selectedCards = []
  document.getElementById('packGrid').innerHTML = '<div style="text-align:center;padding:40px;font-family:Cinzel,serif;font-size:0.7rem;letter-spacing:2px;color:var(--parchment-dark);grid-column:1/-1">Invocando novos bruxos...</div>'
  var res = await fetch('/api/pack')
  var data = await res.json()
  state.pack = data.cards
  renderPack()
}

// ── INIT ───────────────────────────────────────────────
loadGame()
