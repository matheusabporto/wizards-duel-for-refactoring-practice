// ── LOADING ────────────────────────────────────────────

async function loadGame() {
  const loadBar = document.getElementById('loadBar')
  const loadMsg = document.getElementById('loadMsg')

  loadMsg.textContent = 'Invocando personagens...'
  loadBar.style.width = '20%'

  const packResponse = await fetch('/api/pack')
  const packData = await packResponse.json()
  state.pack = packData.cards

  loadBar.style.width = '55%'
  loadMsg.textContent = 'Consultando o livro de feitiços...'

  const spellResponse = await fetch('/api/spells')
  const spellData = await spellResponse.json()
  state.spells = spellData.spells

  loadBar.style.width = '85%'
  loadMsg.textContent = 'Preparando o adversário...'

  const cpuResponse = await fetch('/api/cpu-deck', { method: 'POST' })
  const cpuData = await cpuResponse.json()
  state.cpuDeck = cpuData.deck

  const shuffled = state.spells.slice()
  for (let currentIndex = shuffled.length - 1; currentIndex > 0; currentIndex--) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1))
    const temp = shuffled[currentIndex]; shuffled[currentIndex] = shuffled[randomIndex]; shuffled[randomIndex] = temp
  }
  state.playerSpells = shuffled.slice(0, 5)

  loadBar.style.width = '100%'
  loadMsg.textContent = 'Pronto!'

  setTimeout(() => {
    document.getElementById('screen-loading').classList.add('fade-out')
    setTimeout(() => {
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
  const res = await fetch('/api/pack')
  const data = await res.json()
  state.pack = data.cards
  renderPack()
}

// ── INIT ───────────────────────────────────────────────
loadGame()
