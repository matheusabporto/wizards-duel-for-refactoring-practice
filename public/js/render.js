// ── UTILS DE EXIBIÇÃO ──────────────────────────────────

function getHouseColor(house) {
  if (house === 'Gryffindor') return '#6b1010'
  if (house === 'Slytherin') return '#0a3018'
  if (house === 'Hufflepuff') return '#3a2800'
  if (house === 'Ravenclaw') return '#0a1a3a'
  return '#1e1040'
}

function getHouseEmoji(house) {
  if (house === 'Gryffindor') return '🦁'
  if (house === 'Slytherin') return '🐍'
  if (house === 'Hufflepuff') return '🦡'
  if (house === 'Ravenclaw') return '🦅'
  return '✦'
}

function hpColor(hpRatio) {
  if (hpRatio > 0.6) return 'linear-gradient(90deg,#0a4a2a,#22cc77)'
  if (hpRatio > 0.3) return 'linear-gradient(90deg,#4a3a00,#ccaa22)'
  return 'linear-gradient(90deg,#4a0a0a,#cc2222)'
}

function log(msg, type = 'info') {
  const logContainer = document.getElementById('battleLog')
  const entry = document.createElement('span')
  entry.className = `log-entry ${type}`
  entry.textContent = msg
  logContainer.appendChild(entry)
  logContainer.scrollTop = logContainer.scrollHeight
}

function setStatus(msg) {
  document.getElementById('battleStatus').textContent = msg
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((screen) => { screen.classList.remove('active') })
  const targetScreen = document.getElementById(id)
  if (targetScreen) targetScreen.classList.add('active')
}

// ── RENDER CARTA ───────────────────────────────────────

function renderCard(char) {
  const hpRatio = char.hp / char.maxHp
  const houseColor = getHouseColor(char.house)
  const houseEmoji = getHouseEmoji(char.house)
  const noImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png'

  return `
    <div class="card-img">
      <img src="${char.image}" alt="${char.name}" onerror="this.src='${noImage}'">
      <div class="house-badge" style="background:${houseColor}">${houseEmoji}</div>
    </div>
    <div class="card-body">
      <div class="card-name">${char.name}</div>
      <div class="card-meta">${char.species} · ${char.house}</div>
      <div class="hp-bar-wrap">
        <span class="hp-label">HP</span>
        <div class="hp-track"><div class="hp-fill" style="width:${Math.max(0, hpRatio * 100)}%;background:${hpColor(hpRatio)}"></div></div>
        <span class="hp-val">${Math.max(0, char.hp)}/${char.maxHp}</span>
      </div>
      <div class="mini-stats">
        <div class="mini-stat"><span class="mini-stat-icon">⚡</span><span class="mini-stat-val">${char.power}</span><span class="mini-stat-lbl">Poder</span></div>
        <div class="mini-stat"><span class="mini-stat-icon">🔮</span><span class="mini-stat-val">${char.magic}</span><span class="mini-stat-lbl">Magia</span></div>
        <div class="mini-stat"><span class="mini-stat-icon">🛡</span><span class="mini-stat-val">${char.defense}</span><span class="mini-stat-lbl">Defesa</span></div>
      </div>
    </div>
  `
}

// ── DECK BADGES ────────────────────────────────────────

function renderDeckBadges(deck, activeIdx, elId) {
  const container = document.getElementById(elId)
  const noImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png'
  let badgesHtml = ''
  for (let i = 0; i < deck.length; i++) {
    const thumbClass = deck[i].hp <= 0 ? 'deck-thumb dead' : (i === activeIdx ? 'deck-thumb active' : 'deck-thumb')
    badgesHtml += `<div class="${thumbClass}"><img src="${deck[i].image}" onerror="this.src='${noImage}'"></div>`
  }
  container.innerHTML = badgesHtml
}

// ── SPELL LIST ─────────────────────────────────────────

function renderSpells(enabled) {
  const container = document.getElementById('spellList')
  let spellsHtml = ''
  for (let i = 0; i < state.playerSpells.length; i++) {
    const spell = state.playerSpells[i]
    const isHeal = spell.damage < 0
    const damageLabel = isHeal ? `💚 +${Math.abs(spell.damage)} HP` : `💀 ${spell.damage} dmg`
    const damageClass = isHeal ? 'spell-dmg heal' : 'spell-dmg attack'
    const disabledAttr = enabled ? '' : 'disabled'
    spellsHtml += `
      <button class="spell-btn" ${disabledAttr} onclick="castSpell(${i})">
        <div><span class="spell-name">${spell.name}</span><span class="spell-effect">${spell.effect}</span></div>
        <span class="${damageClass}">${damageLabel}</span>
      </button>
    `
  }
  container.innerHTML = spellsHtml
}

// ── PACK ───────────────────────────────────────────────

function renderPack() {
  const grid = document.getElementById('packGrid')
  grid.innerHTML = ''
  for (let i = 0; i < state.pack.length; i++) {
    const char = state.pack[i]
    const isSelected = state.selectedCards.indexOf(i) >= 0
    const div = document.createElement('div')
    div.className = `card${isSelected ? ' selected' : ''}`
    div.innerHTML = renderCard(char)
    div.setAttribute('data-idx', i)
    div.onclick = (function(idx) { return function() { toggleDraftCard(idx) } })(i)
    grid.appendChild(div)
  }
  document.getElementById('draftCount').textContent = state.selectedCards.length
  document.getElementById('btnConfirmDraft').disabled = state.selectedCards.length < 2
}

// ── BATTLE STATE ───────────────────────────────────────

function renderBattleState() {
  const playerIndex = getActiveIdx(state.playerDeck)
  const cpuIndex = getActiveIdx(state.cpuDeck)

  if (playerIndex < 0 || cpuIndex < 0) { endGame(); return }

  const playerCharacter = state.playerDeck[playerIndex]
  const cpuCharacter = state.cpuDeck[cpuIndex]

  document.getElementById('playerActiveName').textContent = playerCharacter.name
  document.getElementById('cpuActiveName').textContent = cpuCharacter.name

  const playerSlot = document.getElementById('playerCardSlot')
  const cpuSlot = document.getElementById('cpuCardSlot')

  const playerCardDiv = document.createElement('div')
  playerCardDiv.className = 'card battle-card'
  playerCardDiv.id = 'battleCardP'
  playerCardDiv.innerHTML = renderCard(playerCharacter)
  playerSlot.innerHTML = ''
  playerSlot.appendChild(playerCardDiv)

  const cpuCardDiv = document.createElement('div')
  cpuCardDiv.className = 'card battle-card'
  cpuCardDiv.id = 'battleCardC'
  cpuCardDiv.innerHTML = renderCard(cpuCharacter)
  cpuSlot.innerHTML = ''
  cpuSlot.appendChild(cpuCardDiv)

  renderDeckBadges(state.playerDeck, playerIndex, 'playerDeckBadges')
  renderDeckBadges(state.cpuDeck, cpuIndex, 'cpuDeckBadges')
  renderSpells(!state.waiting)
}
