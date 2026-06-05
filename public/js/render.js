// ── UTILS DE EXIBIÇÃO ──────────────────────────────────

function getHouseColor(house) {
  if (house == 'Gryffindor') return '#6b1010'
  if (house == 'Slytherin')  return '#0a3018'
  if (house == 'Hufflepuff') return '#3a2800'
  if (house == 'Ravenclaw')  return '#0a1a3a'
  return '#1e1040'
}

function getHouseEmoji(house) {
  if (house == 'Gryffindor') return '🦁'
  if (house == 'Slytherin')  return '🐍'
  if (house == 'Hufflepuff') return '🦡'
  if (house == 'Ravenclaw')  return '🦅'
  return '✦'
}

function hpColor(hpRatio) {
  if (hpRatio > 0.6) return 'linear-gradient(90deg,#0a4a2a,#22cc77)'
  if (hpRatio > 0.3) return 'linear-gradient(90deg,#4a3a00,#ccaa22)'
  return 'linear-gradient(90deg,#4a0a0a,#cc2222)'
}

function log(msg, type) {
  type = type || 'info'
  var logContainer = document.getElementById('battleLog')
  var entry = document.createElement('span')
  entry.className = 'log-entry ' + type
  entry.textContent = msg
  logContainer.appendChild(entry)
  logContainer.scrollTop = logContainer.scrollHeight
}

function setStatus(msg) {
  document.getElementById('battleStatus').textContent = msg
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(screen){ screen.classList.remove('active') })
  var targetScreen = document.getElementById(id)
  if (targetScreen) targetScreen.classList.add('active')
}

// ── RENDER CARTA ───────────────────────────────────────

function renderCard(char, isDraft) {
  var hpRatio = char.hp / char.maxHp
  var houseColor = getHouseColor(char.house)
  var houseEmoji = getHouseEmoji(char.house)

  var cardHtml = '<div class="card-img">'
  cardHtml += '<img src="'+char.image+'" alt="'+char.name+'" onerror="this.src=\'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png\'">'
  cardHtml += '<div class="house-badge" style="background:'+houseColor+'">'+houseEmoji+'</div>'
  cardHtml += '</div>'
  cardHtml += '<div class="card-body">'
  cardHtml += '<div class="card-name">'+char.name+'</div>'
  cardHtml += '<div class="card-meta">'+char.species+' · '+char.house+'</div>'
  cardHtml += '<div class="hp-bar-wrap">'
  cardHtml += '<span class="hp-label">HP</span>'
  cardHtml += '<div class="hp-track"><div class="hp-fill" style="width:'+Math.max(0,hpRatio*100)+'%;background:'+hpColor(hpRatio)+'"></div></div>'
  cardHtml += '<span class="hp-val">'+Math.max(0,char.hp)+'/'+char.maxHp+'</span>'
  cardHtml += '</div>'
  cardHtml += '<div class="mini-stats">'
  cardHtml += '<div class="mini-stat"><span class="mini-stat-icon">⚡</span><span class="mini-stat-val">'+char.power+'</span><span class="mini-stat-lbl">Poder</span></div>'
  cardHtml += '<div class="mini-stat"><span class="mini-stat-icon">🔮</span><span class="mini-stat-val">'+char.magic+'</span><span class="mini-stat-lbl">Magia</span></div>'
  cardHtml += '<div class="mini-stat"><span class="mini-stat-icon">🛡</span><span class="mini-stat-val">'+char.defense+'</span><span class="mini-stat-lbl">Defesa</span></div>'
  cardHtml += '</div></div>'
  return cardHtml
}

// ── DECK BADGES ────────────────────────────────────────

function renderDeckBadges(deck, activeIdx, elId) {
  var container = document.getElementById(elId)
  var badgesHtml = ''
  for (var i = 0; i < deck.length; i++) {
    var thumbClass = deck[i].hp <= 0 ? 'deck-thumb dead' : (i == activeIdx ? 'deck-thumb active' : 'deck-thumb')
    badgesHtml += '<div class="'+thumbClass+'"><img src="'+deck[i].image+'" onerror="this.src=\'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png\'"></div>'
  }
  container.innerHTML = badgesHtml
}

// ── SPELL LIST ─────────────────────────────────────────

function renderSpells(enabled) {
  var container = document.getElementById('spellList')
  var spellsHtml = ''
  for (var i = 0; i < state.playerSpells.length; i++) {
    var spell = state.playerSpells[i]
    var isHeal = spell.damage < 0
    var damageLabel = isHeal ? '💚 +'+Math.abs(spell.damage)+' HP' : '💀 '+spell.damage+' dmg'
    var damageClass = isHeal ? 'spell-dmg heal' : 'spell-dmg attack'
    var disabledAttr = enabled ? '' : 'disabled'
    spellsHtml += '<button class="spell-btn" '+disabledAttr+' onclick="castSpell('+i+')">'
    spellsHtml += '<div><span class="spell-name">'+spell.name+'</span><span class="spell-effect">'+spell.effect+'</span></div>'
    spellsHtml += '<span class="'+damageClass+'">'+damageLabel+'</span>'
    spellsHtml += '</button>'
  }
  container.innerHTML = spellsHtml
}

// ── PACK ───────────────────────────────────────────────

function renderPack() {
  var grid = document.getElementById('packGrid')
  grid.innerHTML = ''
  for (var i = 0; i < state.pack.length; i++) {
    var char = state.pack[i]
    var isSelected = state.selectedCards.indexOf(i) >= 0
    var div = document.createElement('div')
    div.className = 'card' + (isSelected ? ' selected' : '')
    div.innerHTML = renderCard(char, true)
    div.setAttribute('data-idx', i)
    div.onclick = (function(idx){ return function(){ toggleDraftCard(idx) } })(i)
    grid.appendChild(div)
  }
  document.getElementById('draftCount').textContent = state.selectedCards.length
  document.getElementById('btnConfirmDraft').disabled = state.selectedCards.length < 2
}

// ── BATTLE STATE ───────────────────────────────────────

function renderBattleState() {
  var playerIndex = getActiveIdx(state.playerDeck)
  var cpuIndex = getActiveIdx(state.cpuDeck)

  if (playerIndex < 0 || cpuIndex < 0) { endGame(); return }

  var playerCharacter = state.playerDeck[playerIndex]
  var cpuCharacter = state.cpuDeck[cpuIndex]

  document.getElementById('playerActiveName').textContent = playerCharacter.name
  document.getElementById('cpuActiveName').textContent = cpuCharacter.name

  var playerSlot = document.getElementById('playerCardSlot')
  var cpuSlot = document.getElementById('cpuCardSlot')

  var playerCardDiv = document.createElement('div')
  playerCardDiv.className = 'card battle-card'
  playerCardDiv.id = 'battleCardP'
  playerCardDiv.innerHTML = renderCard(playerCharacter, false)
  playerSlot.innerHTML = ''
  playerSlot.appendChild(playerCardDiv)

  var cpuCardDiv = document.createElement('div')
  cpuCardDiv.className = 'card battle-card'
  cpuCardDiv.id = 'battleCardC'
  cpuCardDiv.innerHTML = renderCard(cpuCharacter, false)
  cpuSlot.innerHTML = ''
  cpuSlot.appendChild(cpuCardDiv)

  renderDeckBadges(state.playerDeck, playerIndex, 'playerDeckBadges')
  renderDeckBadges(state.cpuDeck, cpuIndex, 'cpuDeckBadges')
  renderSpells(!state.waiting)
}
