// ── ESTADO GLOBAL ──────────────────────────────────────
const state = {
  phase: 'loading',
  pack: [],
  selectedCards: [],
  playerDeck: [],
  cpuDeck: [],
  spells: [],
  playerSpells: [],
  round: 1,
  scoreP: 0,
  scoreC: 0,
  waiting: false,
}

// ── DRAFT ──────────────────────────────────────────────

function toggleDraftCard(idx) {
  const selectedPosition = state.selectedCards.indexOf(idx)
  if (selectedPosition >= 0) {
    state.selectedCards.splice(selectedPosition, 1)
  } else {
    if (state.selectedCards.length >= 2) return
    state.selectedCards.push(idx)
  }
  renderPack()
}

function confirmDraft() {
  if (state.selectedCards.length < 2) return
  state.playerDeck = [state.pack[state.selectedCards[0]], state.pack[state.selectedCards[1]]]
  startBattle()
}

// ── BATTLE ─────────────────────────────────────────────

function getActiveIdx(deck) {
  for (let i = 0; i < deck.length; i++) {
    if (deck[i].hp > 0) return i
  }
  return -1
}

function startBattle() {
  state.round = 1
  state.scoreP = 0
  state.scoreC = 0
  state.waiting = false

  document.getElementById('scoreP').textContent = '0'
  document.getElementById('scoreC').textContent = '0'
  document.getElementById('roundNum').textContent = '1'
  document.getElementById('battleLog').innerHTML = ''
  document.getElementById('btnNext').style.display = 'none'

  showScreen('screen-battle')
  renderBattleState()
  log('⚔ O duelo começou! Escolha um feitiço para atacar.', 'info')
  setStatus('Escolha um feitiço para atacar!')
}

function castSpell(spellIdx) {
  if (state.waiting) return
  state.waiting = true
  renderSpells(false)

  const spell = state.playerSpells[spellIdx]
  const playerIndex = getActiveIdx(state.playerDeck)
  const cpuIndex = getActiveIdx(state.cpuDeck)
  const playerCharacter = state.playerDeck[playerIndex]
  const cpuCharacter = state.cpuDeck[cpuIndex]

  const playerDamage = Math.floor(spell.damage * (playerCharacter.magic / 100) * (Math.random() * 0.4 + 0.8))

  if (spell.damage < 0) {
    const heal = Math.abs(playerDamage)
    playerCharacter.hp = Math.min(playerCharacter.maxHp, playerCharacter.hp + heal)
    log(`✨ ${spell.name} — você curou ${heal} HP! (${playerCharacter.name}: ${playerCharacter.hp} HP)`, 'heal')
    document.getElementById('battleCardP').classList.add('battling')
    setTimeout(() => { document.getElementById('battleCardP') && document.getElementById('battleCardP').classList.remove('battling') }, 500)
  } else {
    cpuCharacter.hp -= playerDamage
    log(`⚡ ${spell.name} → ${cpuCharacter.name} perdeu ${playerDamage} HP! (${cpuCharacter.name}: ${Math.max(0, cpuCharacter.hp)} HP)`, 'win')
    document.getElementById('battleCardC').classList.add('hit')
    setTimeout(() => { document.getElementById('battleCardC') && document.getElementById('battleCardC').classList.remove('hit') }, 600)
  }

  setTimeout(() => {
    const cpuSpellIndex = Math.floor(Math.random() * state.spells.length)
    const cpuSpell = state.spells[cpuSpellIndex]
    const cpuDamage = Math.floor(cpuSpell.damage * (cpuCharacter.magic / 100) * (Math.random() * 0.4 + 0.8))

    if (cpuSpell.damage < 0) {
      const cpuHeal = Math.abs(cpuDamage)
      cpuCharacter.hp = Math.min(cpuCharacter.maxHp, cpuCharacter.hp + cpuHeal)
      log(`🧙 CPU: ${cpuSpell.name} — CPU curou ${cpuHeal} HP! (${cpuCharacter.name}: ${cpuCharacter.hp} HP)`, 'heal')
      document.getElementById('battleCardC') && document.getElementById('battleCardC').classList.add('battling')
      setTimeout(() => { document.getElementById('battleCardC') && document.getElementById('battleCardC').classList.remove('battling') }, 500)
    } else {
      playerCharacter.hp -= cpuDamage
      log(`💀 CPU: ${cpuSpell.name} → ${playerCharacter.name} perdeu ${cpuDamage} HP! (${playerCharacter.name}: ${Math.max(0, playerCharacter.hp)} HP)`, 'lose')
      document.getElementById('battleCardP') && document.getElementById('battleCardP').classList.add('hit')
      setTimeout(() => { document.getElementById('battleCardP') && document.getElementById('battleCardP').classList.remove('hit') }, 600)
    }

    setTimeout(() => {
      let roundOver = false

      if (playerIndex >= 0 && state.playerDeck[playerIndex].hp <= 0) {
        log(`💀 ${state.playerDeck[playerIndex].name} foi derrotado!`, 'lose')
        state.scoreC++
        document.getElementById('scoreC').textContent = state.scoreC
        roundOver = true
      }
      if (cpuIndex >= 0 && state.cpuDeck[cpuIndex].hp <= 0) {
        log(`🏆 ${state.cpuDeck[cpuIndex].name} foi derrotado!`, 'win')
        state.scoreP++
        document.getElementById('scoreP').textContent = state.scoreP
        roundOver = true
      }

      renderBattleState()

      const playerAlive = getActiveIdx(state.playerDeck)
      const cpuAlive = getActiveIdx(state.cpuDeck)

      if (playerAlive < 0 || cpuAlive < 0) {
        setTimeout(endGame, 800)
        return
      }

      state.waiting = false

      if (roundOver) {
        state.round++
        document.getElementById('roundNum').textContent = state.round
        log(`— Rodada ${state.round} —`, 'info')
      }

      setStatus('Escolha um feitiço para atacar!')
      renderSpells(true)
    }, 700)
  }, 800)
}

function nextRound() {
  document.getElementById('btnNext').style.display = 'none'
  state.round++
  document.getElementById('roundNum').textContent = state.round
  log(`— Rodada ${state.round} —`, 'info')
  state.waiting = false
  renderBattleState()
  setStatus('Escolha um feitiço para atacar!')
}

// ── END ────────────────────────────────────────────────

function endGame() {
  const overScreen = document.getElementById('screen-over')
  const glyph = document.getElementById('overGlyph')
  const title = document.getElementById('overTitle')
  const sub = document.getElementById('overSub')
  const score = document.getElementById('overScore')

  if (state.scoreP > state.scoreC) {
    glyph.textContent = '🏆'
    title.textContent = 'Vitória!'
    sub.textContent = 'Você dominou o duelo!'
  } else if (state.scoreC > state.scoreP) {
    glyph.textContent = '💀'
    title.textContent = 'Derrota'
    sub.textContent = 'O CPU foi mais poderoso desta vez.'
  } else {
    glyph.textContent = '✦'
    title.textContent = 'Empate'
    sub.textContent = 'Bruxos igualmente poderosos.'
  }
  score.textContent = `Você ${state.scoreP}  ×  ${state.scoreC} CPU`
  overScreen.classList.add('active')
}

function restartGame() {
  document.getElementById('screen-over').classList.remove('active')
  state.selectedCards = []
  state.pack = []
  state.playerDeck = []

  const loadEl = document.getElementById('screen-loading')
  loadEl.style.display = 'flex'
  loadEl.classList.remove('fade-out')
  document.getElementById('loadBar').style.width = '0%'
  showScreen('')
  loadGame()
}
