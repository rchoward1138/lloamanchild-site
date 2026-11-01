(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const {store, track} = window.Clubhouse;
  const game = window.MixtapeGame;
  const key = 'lost-found-v2';
  let state = game.restore(store.get(key, null));
  let selected = !state.drawerOpen ? 'note' : state.turns < 4 ? 'tape' : 'player';
  let hintCount = 0;
  const audio = $('#mixtape-audio');
  const cassette = () => `<div class="tape-repair ${state.turns === 4 ? 'tape-ready' : ''}" style="--rewind:${state.turns}" aria-hidden="true"><div class="mixtape-cassette"><p>ROAD TRIP / SIDE A</p><div class="tape-spools"><span class="spool">•</span><span class="spool">•</span></div></div>${state.hasPencil && state.turns < 4 ? '<div class="pencil-tool"></div>' : ''}<div class="tape-loop"></div></div>`;
  const go = (object, label) => `<button class="text-button" data-go="${object}">${label} →</button>`;
  function persist() {
    if (!store.set(key, state)) $('#mix-saving').textContent = 'Saving is unavailable here. You can still finish this game.';
  }
  function feedback(message) { $('#mix-feedback').textContent = message; }
  function focusPanel() { $('#mix-title').focus({preventScroll:true}); $('#mix-title').scrollIntoView({block:'nearest', behavior:'instant'}); }
  function choose(object, focus = true) {
    selected = object;
    renderObject();
    feedback('');
    if (focus) focusPanel();
  }
  function progress() {
    $('#mix-start').hidden = state.started;
    $('#mix-board').hidden = !state.started;
    $('#mix-reset').hidden = !state.started;
    $('#mix-ending').hidden = !state.won;
    $$('[data-step]').forEach(li => {
      const step = Number(li.dataset.step);
      const done = state.won || step < game.stage(state);
      li.classList.toggle('complete', done);
      li.querySelector('span').textContent = done ? '✓' : String(step);
      if (state.started && !state.won && step === game.stage(state)) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    $('#drawer-label').textContent = state.drawerOpen ? 'Unlocked · cassette found' : 'Locked · needs three digits';
    $('#pencil-label').textContent = state.hasPencil ? 'Pencil collected' : 'The repair kit of 1985';
    $('#player-label').textContent = state.won ? 'Mission complete' : state.loaded ? 'Cassette loaded · ready to play' : 'Waiting for a good tape';
    $('#mix-pocket').innerHTML = `${state.hasPencil ? '<div class="pocket-item">✎ Pencil<small>Fits a cassette spool. Perfect.</small></div>' : ''}${state.drawerOpen ? `<div class="pocket-item">▰ Road-trip cassette<small>${state.loaded ? 'Loaded in the player' : state.turns === 4 ? 'Rewound and ready' : 'Loose tape · needs rewinding'}</small>${go(state.loaded ? 'player' : 'tape', state.loaded ? 'Inspect player' : 'Inspect cassette')}</div>` : ''}${!state.hasPencil && !state.drawerOpen ? '<p class="fine">Nothing yet. Time to look around.</p>' : ''}`;
    $('#mix-goal').textContent = state.won ? 'You did it. Enjoy the track or head back to the arcade.' : !state.drawerOpen ? 'Find the three-digit code and open the desk drawer. Start with the desk note.' : state.turns < 4 ? state.hasPencil ? 'Inspect your cassette and turn the pencil to rewind the loose tape.' : 'Get a pencil from the pencil cup. You will use it to rewind the loose tape.' : state.loaded ? 'The cassette is loaded. Press Play—or finish without sound.' : 'Take the repaired cassette to the player and load it.';
    $('#mix-hint').hidden = state.won;
    if (state.won) $('#mix-hint-text').textContent = '';
  }
  function renderObject() {
    $$('[data-object]').forEach(b => {
      const active = b.dataset.object === selected || (selected === 'tape' && b.dataset.object === 'drawer');
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    let title, description, panel;
    if (selected === 'note') {
      title = 'You left yourself a clue.';
      description = 'A note is taped to the desk. Good thinking, past you.';
      panel = `<div class="desk-note"><small>NOTE TO SELF</small>Mixtape is in the drawer.<br><br>Drawer code = the <strong>last three digits</strong> of my <strong>BEST arcade score</strong>.</div><div class="actions">${go('tv', 'Check the TV & arcade score')}</div>`;
    } else if (selected === 'tv') {
      title = 'That high score finally comes in handy.';
      description = 'The game is still on the TV. Two scores are showing. Which one did your note mention?';
      panel = `<div class="arcade-screen"><p class="screen-title">★ STAR PATROL ★</p><div class="score-row"><span>LAST RUN</span><strong>004580</strong></div><div class="score-row best"><span>BEST</span><strong>${game.BEST_SCORE}</strong></div><p class="screen-foot">GAME OVER<br>YOUR HIGH SCORE IS SAFE</p></div><div class="actions">${go('drawer', 'Try the desk drawer')}${go('note', 'Read the note again')}</div>`;
    } else if (selected === 'drawer' && !state.drawerOpen) {
      title = 'The drawer has a three-digit lock.';
      description = 'You made the code something you could remember. That was optimistic.';
      panel = `<form id="drawer-form" class="drawer"><div class="drawer-handle" aria-hidden="true"></div><label for="drawer-code">Three-digit drawer code</label><div class="code-entry"><input id="drawer-code" name="code" type="text" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" autocomplete="off" required aria-describedby="code-help"><button class="button" type="submit">Unlock</button></div><p class="fine" id="code-help">The desk note tells you where to find the code. Wrong guesses cost nothing.</p></form><div class="actions">${go('note', 'Read the desk note')}${go('tv', 'Look at the scores')}</div>`;
    } else if (selected === 'drawer' || selected === 'tape') {
      title = state.turns === 4 ? 'Good as 1985 again.' : 'Found it. The tape has come loose.';
      description = state.turns === 4 ? 'The loose loop is back inside the cassette. Time to hear what all this fuss was about.' : 'Do not put it in the player yet. A pencil fits the spool and winds the loose ribbon safely back inside.';
      panel = cassette();
      if (state.turns === 4) panel += `<div class="actions">${go('player', state.loaded ? 'Go to the cassette player' : 'Take it to the cassette player')}</div>`;
      else if (!state.hasPencil) panel += `<div class="actions">${go('pencil', 'Get a pencil from the pencil cup')}</div>`;
      else panel += `<label class="fine" for="repair-meter">Tape rewound</label><progress class="repair-progress" id="repair-meter" value="${state.turns}" max="4">${state.turns * 25}%</progress><p class="mix-repair-percent">${state.turns * 25}% · ${4-state.turns} pencil turn${state.turns === 3 ? '' : 's'} to go</p><div class="repair-actions"><button class="button" data-action="rewind">Turn pencil ↻</button><button class="text-button" data-action="rewind-all">Rewind in one step</button></div>`;
    } else if (selected === 'pencil') {
      title = state.hasPencil ? 'One pencil. Several job titles.' : 'The high-tech repair department.';
      description = state.hasPencil ? 'You have the pencil. In this room, it is also a cassette repair tool.' : 'A yellow pencil. No app, no subscription. It happens to fit a cassette spool perfectly.';
      panel = `<div class="desk-note" aria-hidden="true"><small>ESSENTIAL EQUIPMENT</small>✎ One slightly chewed pencil.<br>Still fully operational.</div><div class="actions">${!state.hasPencil ? '<button class="button" data-action="pencil">Take the pencil</button>' : state.drawerOpen ? go('tape', 'Inspect your cassette') : go('note', 'Find out where the tape is')}</div>`;
    } else {
      title = state.won ? 'Rescued and ready to roll.' : state.loaded ? 'All that is missing is Play.' : 'The cassette player is ready.';
      description = state.loaded ? 'The cassette clicks into place. You have earned this soundtrack.' : state.turns === 4 ? 'Your cassette is repaired. Load it, then press Play.' : 'An empty player. Find the cassette and rewind any loose tape before loading it.';
      panel = `<div class="cassette-player"><p class="player-label">PORTABLE STEREO / 1985</p><div class="player-slot ${state.loaded ? 'loaded' : ''}">${state.loaded ? 'ROAD TRIP / SIDE A' : 'NO CASSETTE LOADED'}</div><div class="player-controls">${state.loaded ? `<button class="button" data-action="play">${state.won ? 'Play the track' : '▶ Play the tape'}</button>${!state.won ? '<button class="text-button" data-action="silent">Finish without sound</button>' : ''}` : state.turns === 4 ? '<button class="button" data-action="load">Load cassette</button>' : ''}</div><p class="player-credit">Soundtrack: “80’s Love” by Helkimer.<br>Audio starts only when you press Play.</p></div>${state.turns < 4 ? `<div class="actions">${go(state.drawerOpen ? 'tape' : 'note', state.drawerOpen ? 'Repair your cassette first' : 'Start with the desk note')}</div>` : ''}`;
    }
    $('#mix-title').textContent = title;
    $('#mix-description').textContent = description;
    $('#mix-panel').innerHTML = panel;
  }
  function act(action, value) {
    const previousStage = game.stage(state);
    const alreadyWon = state.won;
    const result = game.act(state, action === 'silent' ? 'play' : action, value);
    state = result.state;
    if (!result.ok) { feedback(result.message); return; }
    persist();
    if (game.stage(state) !== previousStage) {hintCount = 0; $('#mix-hint-text').textContent = '';}
    progress();
    if (action === 'start') selected = 'note';
    if (action === 'unlock') selected = 'tape';
    renderObject();
    feedback(result.message);
    if (action === 'rewind' && state.turns < 4) $('#mix-panel [data-action="rewind"]').focus({preventScroll:true});
    else focusPanel();
    if ((action === 'play' || action === 'silent') && state.won) {
      if (!alreadyWon) track('game_complete', 'lost-found-v2');
      $('#mix-ending').focus({preventScroll:true});
      $('#mix-ending').scrollIntoView({behavior:'instant', block:'nearest'});
      if (action === 'play') {
        audio.play().then(() => {$('#audio-status').textContent = 'Now playing. Pause or change the volume using the controls above.';}).catch(() => {$('#audio-status').textContent = 'Rescue complete. If the music did not start, use the audio controls above.';});
      } else $('#audio-status').textContent = 'You finished without sound. The track is here if you want it later.';
    }
  }
  $('#mix-begin').addEventListener('click', () => act('start'));
  $('.mixtape-game').addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.object || target.dataset.go) choose(target.dataset.object || target.dataset.go);
    else if (target.dataset.action) act(target.dataset.action);
  });
  $('#mix-panel').addEventListener('submit', event => {
    if (event.target.id !== 'drawer-form') return;
    event.preventDefault();
    act('unlock', $('#drawer-code').value);
  });
  $('#mix-hint').addEventListener('click', () => {
    const hints = !state.drawerOpen ? ['Read the desk note. It tells you which score matters.', 'On the TV, use BEST—not LAST RUN. You need its last three digits.', 'The BEST score is 027640. The drawer code is 640.'] : state.turns < 4 ? state.hasPencil ? ['Select “Inspect cassette” in your pocket.', 'Press “Turn pencil” until the tape is fully rewound.', 'You can also choose “Rewind in one step.” It counts exactly the same.'] : ['Choose Pencil cup, then “Take the pencil.”', 'Next, choose “Inspect your cassette.”', 'Turn the pencil to wind the loose ribbon back inside.'] : ['Choose Cassette player.', 'Load the repaired cassette, then press Play.', 'Prefer quiet? “Finish without sound” completes the game too.'];
    $('#mix-hint-text').textContent = hints[Math.min(hintCount++, hints.length - 1)];
  });
  function reset() {
    if (!confirm('Start this cassette rescue over? Only this game’s progress will be cleared.')) return;
    audio.pause(); audio.currentTime = 0;
    state = game.fresh(); selected = 'note'; hintCount = 0;
    $('#mix-hint-text').textContent = ''; feedback('');
    persist(); progress(); renderObject();
    $('#mix-begin').focus();
  }
  $('#mix-reset').addEventListener('click', reset);
  $('#mix-replay').addEventListener('click', reset);
  audio.addEventListener('error', () => {$('#audio-status').textContent = 'The music could not load. Your cassette rescue is still complete.';});
  progress(); renderObject();
})();
