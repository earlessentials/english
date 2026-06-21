let cleanups = [];

const $ = (selector, root) => root.querySelector(selector);
const $$ = (selector, root) => [...root.querySelectorAll(selector)];
const shuffle = items => [...items].sort(() => Math.random() - 0.5);
const normalize = value => value.toLowerCase().replace(/[^a-z ]/g, '').trim();

function addCleanup(fn) { cleanups.push(fn); }
export function stopActiveGame() { cleanups.forEach(fn => fn()); cleanups = []; }

export const supportedAlgorithms = ['match','memory','hangman','wordsearch','crossword','typing','sentence-race','shooter','bingo','unscramble','wordpuzzle','verb','adventure','treasure','escape','boss'];
export function validateGameRecords(records) { return records.filter(record => !supportedAlgorithms.includes(record.algorithm)); }

export function runGame(game, context) {
  stopActiveGame();
  const { mount } = context;
  mount.dataset.finished = '';
  const finish = (score, message) => {
    if (mount.dataset.finished) return;
    mount.dataset.finished = 'true';
    context.onComplete(game, score, message);
  };
  const algorithms = {
    match: mountMatch,
    memory: mountMemory,
    hangman: mountHangman,
    wordsearch: mountWordSearch,
    crossword: mountCrossword,
    typing: mountTyping,
    'sentence-race': mountArrange,
    shooter: mountShooter,
    bingo: mountBingo,
    unscramble: mountArrange,
    wordpuzzle: mountWordPuzzle,
    verb: mountVerb,
    adventure: mountAdventure,
    treasure: mountTreasure,
    escape: mountEscape,
    boss: mountBoss,
  };
  algorithms[game.algorithm]?.(game, context, finish);
}

function status(mount, text) { $('.game-status', mount).innerHTML = text; }

function mountMatch(game, { mount }, finish) {
  const pairs = game.config.pairs;
  const cards = shuffle(pairs.flatMap(([en,id], index) => [{ label:en, pair:index, side:'en' }, { label:id, pair:index, side:'id' }]));
  mount.innerHTML = `<div class="word-match-grid">${cards.map(card => `<button data-pair="${card.pair}" data-side="${card.side}">${card.label}</button>`).join('')}</div><div class="result-panel game-status">Pilih satu kata dari tiap bahasa.</div>`;
  let selected = null;
  let matches = 0;
  $$('.word-match-grid button', mount).forEach(button => button.addEventListener('click', () => {
    if (button.classList.contains('matched')) return;
    if (!selected) { selected = button; button.classList.add('selected'); status(mount, 'Sekarang pilih pasangannya.'); return; }
    if (selected === button) { button.classList.remove('selected'); selected = null; return; }
    if (selected.dataset.pair === button.dataset.pair && selected.dataset.side !== button.dataset.side) {
      selected.classList.add('matched'); button.classList.add('matched'); selected.classList.remove('selected'); selected = null; matches++;
      status(mount, `<strong>Benar.</strong> ${matches} dari ${pairs.length} pasangan.`);
      if (matches === pairs.length) finish(300, 'Semua pasangan ditemukan');
    } else {
      selected.classList.remove('selected'); selected = null; button.classList.add('wrong'); setTimeout(() => button.classList.remove('wrong'), 400);
      status(mount, '<strong>Belum cocok.</strong> Coba pasangan lain.');
    }
  }));
}

function mountMemory(game, { mount }, finish) {
  const cards = shuffle(game.config.pairs.flatMap(([en,id], index) => [{ label:en, pair:index }, { label:id, pair:index }]));
  mount.innerHTML = `<div class="memory-grid">${cards.map((card, index) => `<button data-index="${index}" data-pair="${card.pair}" data-label="${card.label}" aria-label="Kartu tertutup">?</button>`).join('')}</div><div class="result-panel game-status">Buka dua kartu untuk mencari pasangan.</div>`;
  let open = [];
  let locked = false;
  let matched = 0;
  $$('.memory-grid button', mount).forEach(button => button.addEventListener('click', () => {
    if (locked || button.classList.contains('matched') || open.includes(button)) return;
    button.textContent = button.dataset.label; button.classList.add('selected'); open.push(button);
    if (open.length < 2) return;
    if (open[0].dataset.pair === open[1].dataset.pair) {
      open.forEach(card => { card.classList.add('matched'); card.classList.remove('selected'); }); open = []; matched++;
      status(mount, `<strong>Pasangan ditemukan.</strong> ${matched}/${game.config.pairs.length}`);
      if (matched === game.config.pairs.length) finish(350, 'Semua kartu diingat');
    } else {
      locked = true;
      const timer = setTimeout(() => { open.forEach(card => { card.textContent='?'; card.classList.remove('selected'); }); open=[]; locked=false; }, 650);
      addCleanup(() => clearTimeout(timer));
    }
  }));
}

function mountHangman(game, { mount }, finish) {
  const word = game.config.word.toUpperCase();
  let guessed = new Set();
  let misses = 0;
  mount.innerHTML = `<div class="hangman-word"></div><p class="game-hint">Petunjuk: ${game.config.hint} • Kesalahan <b class="misses">0</b>/6</p><div class="alphabet-grid">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `<button>${letter}</button>`).join('')}</div><div class="result-panel game-status">Pilih huruf untuk menebak kata.</div>`;
  const render = () => { $('.hangman-word', mount).textContent = word.split('').map(letter => guessed.has(letter) ? letter : '_').join(' '); $('.misses', mount).textContent = misses; };
  render();
  $$('.alphabet-grid button', mount).forEach(button => button.addEventListener('click', () => {
    const letter = button.textContent; button.disabled = true; guessed.add(letter);
    if (!word.includes(letter)) { misses++; button.classList.add('wrong'); }
    render();
    if (word.split('').every(letter => guessed.has(letter))) finish(Math.max(100, 500 - misses * 50), `Kata ditemukan: ${word}`);
    else if (misses >= 6) status(mount, `<strong>Kesempatan habis.</strong> Jawabannya ${word}. Tutup lalu buka game untuk mencoba lagi.`);
  }));
}

function mountWordSearch(game, { mount }, finish) {
  const size = game.config.size;
  const grid = Array.from({length:size}, () => Array.from({length:size}, () => String.fromCharCode(65 + Math.floor(Math.random()*26))));
  const targets = {};
  game.config.words.forEach((word, index) => {
    const row = index * 2;
    targets[word] = [];
    word.split('').forEach((letter, col) => { grid[row][col] = letter; targets[word].push(`${row}-${col}`); });
  });
  mount.innerHTML = `<div class="word-list">Cari: ${game.config.words.map(word => `<span data-word="${word}">${word}</span>`).join(' ')}</div><div class="letter-grid" style="--grid:${size}">${grid.flatMap((row, r) => row.map((letter,c) => `<button data-cell="${r}-${c}">${letter}</button>`)).join('')}</div><div class="result-panel game-status">Klik huruf-huruf yang membentuk setiap kata.</div>`;
  const selected = new Set();
  const found = new Set();
  $$('.letter-grid button', mount).forEach(button => button.addEventListener('click', () => {
    button.classList.toggle('selected'); button.classList.contains('selected') ? selected.add(button.dataset.cell) : selected.delete(button.dataset.cell);
    for (const [word,cells] of Object.entries(targets)) {
      if (!found.has(word) && cells.every(cell => selected.has(cell))) {
        found.add(word); $(`[data-word="${word}"]`, mount).classList.add('found');
        cells.forEach(cell => $(`[data-cell="${cell}"]`, mount).classList.add('matched'));
        status(mount, `<strong>${word} ditemukan.</strong> ${found.size}/${game.config.words.length}`);
      }
    }
    if (found.size === game.config.words.length) finish(450, 'Semua kata ditemukan');
  }));
}

function mountCrossword(game, { mount }, finish) {
  mount.innerHTML = `<div class="clue-list">${game.config.clues.map(([clue],i) => `<label>${i+1}. ${clue}<input data-index="${i}" autocomplete="off" /></label>`).join('')}</div><button class="primary-button check-crossword">Cek jawaban</button><div class="result-panel game-status">Isi semua jawaban dalam bahasa Inggris.</div>`;
  $('.check-crossword', mount).addEventListener('click', () => {
    const correct = game.config.clues.filter(([,answer],i) => normalize($(`[data-index="${i}"]`, mount).value) === answer).length;
    status(mount, `<strong>${correct}/${game.config.clues.length} benar.</strong> ${correct === game.config.clues.length ? 'Crossword selesai!' : 'Periksa petunjuk yang belum tepat.'}`);
    if (correct === game.config.clues.length) finish(400, 'Crossword selesai');
  });
}

function mountTyping(game, { mount }, finish) {
  let started = null;
  const phrase = game.config.phrase;
  mount.innerHTML = `<div class="typing-target">${phrase}</div><input class="game-input typing-input" placeholder="Ketik kalimat di atas…" autocomplete="off" /><button class="primary-button check-typing">Selesai mengetik</button><div class="result-panel game-status">Waktu dimulai saat kamu mengetik.</div>`;
  $('.typing-input', mount).addEventListener('input', () => { if (!started) started = Date.now(); });
  $('.check-typing', mount).addEventListener('click', () => {
    const value = $('.typing-input', mount).value.trim();
    if (value !== phrase) { status(mount, '<strong>Belum sama.</strong> Perhatikan huruf kapital dan tanda baca.'); return; }
    const minutes = Math.max((Date.now() - started) / 60000, .02);
    const wpm = Math.round(phrase.split(' ').length / minutes);
    finish(Math.min(600, 250 + wpm), `Akurat dengan ${wpm} WPM`);
  });
}

function mountArrange(game, { mount }, finish) {
  const sentence = game.config.sentence;
  const words = shuffle(sentence.split(' '));
  mount.innerHTML = `<div class="mini-answer" aria-label="Jawaban"></div><div class="mini-word-bank">${words.map(word => `<button>${word}</button>`).join('')}</div><button class="primary-button check-arrange">Cek susunan</button><div class="result-panel game-status">Klik kata sesuai urutan kalimat.</div>`;
  const answer = $('.mini-answer', mount);
  const bank = $('.mini-word-bank', mount);
  bank.addEventListener('click', event => { const button=event.target.closest('button'); if(button) answer.append(button); });
  answer.addEventListener('click', event => { const button=event.target.closest('button'); if(button) bank.append(button); });
  $('.check-arrange', mount).addEventListener('click', () => {
    const value = $$('.mini-answer button', mount).map(button => button.textContent).join(' ');
    if (value === sentence) finish(game.title === 'Sentence Race' ? 500 : 400, 'Kalimat tersusun benar');
    else status(mount, '<strong>Belum tepat.</strong> Coba perhatikan subject dan verb.');
  });
}

function mountShooter(game, { mount }, finish) {
  let seconds = game.config.seconds;
  mount.innerHTML = `<div class="shooter-prompt"><span>⏱ <b>${seconds}</b>s</span><strong>${game.config.prompt}</strong></div><div class="choice-grid">${game.config.choices.map(choice => `<button>${choice}</button>`).join('')}</div><div class="result-panel game-status">Tembak jawaban sebelum waktu habis.</div>`;
  const timer = setInterval(() => {
    seconds--; $('.shooter-prompt b', mount).textContent = seconds;
    if (seconds <= 0) { clearInterval(timer); status(mount, '<strong>Waktu habis.</strong> Buka game lagi untuk mencoba ulang.'); $$('.choice-grid button',mount).forEach(b=>b.disabled=true); }
  },1000);
  addCleanup(() => clearInterval(timer));
  $$('.choice-grid button', mount).forEach(button => button.addEventListener('click', () => {
    clearInterval(timer);
    if (button.textContent === game.config.answer) finish(300 + seconds * 20, 'Target grammar tepat');
    else status(mount, `<strong>Meleset.</strong> Jawaban yang tepat: ${game.config.answer}.`);
  }));
}

function mountBingo(game, { mount, speak }, finish) {
  const words = shuffle(game.config.words);
  const remaining = shuffle(game.config.words);
  let called = null;
  const marked = new Set();
  mount.innerHTML = `<button class="primary-button call-bingo">🔊 Dengar kata berikutnya</button><div class="bingo-call">Tekan tombol untuk mulai.</div><div class="bingo-grid">${words.map(word => `<button data-word="${word}">${word}</button>`).join('')}</div><div class="result-panel game-status">Tandai kata yang kamu dengar. Dapatkan satu garis penuh.</div>`;
  $('.call-bingo', mount).addEventListener('click', () => {
    if (!remaining.length) return;
    called = remaining.pop(); speak(called, .7); $('.bingo-call', mount).textContent = `Kata diputar (${remaining.length} tersisa)`;
  });
  $$('.bingo-grid button', mount).forEach((button,index) => button.addEventListener('click', () => {
    if (button.dataset.word !== called) { button.classList.add('wrong'); setTimeout(()=>button.classList.remove('wrong'),350); return; }
    button.classList.add('matched'); marked.add(index); called = null;
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8]];
    if (lines.some(line => line.every(cell => marked.has(cell)))) finish(500, 'Bingo! Satu garis lengkap');
    else status(mount, `<strong>Benar.</strong> ${marked.size} kata ditandai.`);
  }));
}

function mountWordPuzzle(game, { mount }, finish) {
  const scrambled = shuffle(game.config.word.toUpperCase().split('')).join(' ');
  mount.innerHTML = `<div class="scrambled-word">${scrambled}</div><p class="game-hint">Petunjuk: ${game.config.hint}</p><input class="game-input puzzle-input" placeholder="Ketik katanya…" /><button class="primary-button check-puzzle">Cek kata</button><div class="result-panel game-status">Susun ulang semua huruf.</div>`;
  $('.check-puzzle', mount).addEventListener('click', () => normalize($('.puzzle-input',mount).value) === game.config.word ? finish(350,'Kata berhasil dipecahkan') : status(mount,'<strong>Belum tepat.</strong> Gunakan semua huruf sekali.'));
}

function mountVerb(game, { mount }, finish) {
  let round = 0;
  let score = 0;
  const render = () => {
    const [verb,answer] = game.config.rounds[round];
    const choices = shuffle([...new Set([answer, verb, `${verb}ed`, `${verb}s`])]).slice(0,3);
    if (!choices.includes(answer)) choices[0] = answer;
    mount.innerHTML = `<div class="battle-meter">RONDE ${round+1}/${game.config.rounds.length}</div><div class="practice-line"><strong>Past tense dari “${verb}”?</strong></div><div class="choice-grid">${shuffle(choices).map(choice=>`<button>${choice}</button>`).join('')}</div><div class="result-panel game-status">Pilih bentuk verb 2.</div>`;
    $$('.choice-grid button',mount).forEach(button=>button.addEventListener('click',()=>{
      if(button.textContent===answer){score+=150;round++; if(round===game.config.rounds.length)finish(score,'Verb battle dimenangkan');else render();}
      else status(mount,`<strong>Serangan tertahan.</strong> Jawabannya ${answer}.`);
    }));
  };
  render();
}

function mountAdventure(game, { mount }, finish) {
  let round=0, hearts=3;
  const render=()=>{
    if(round===game.config.rounds.length){finish(hearts*200,'Petualangan grammar selesai');return;}
    const [prompt,choices,answer]=game.config.rounds[round];
    mount.innerHTML=`<div class="adventure-top"><span>AREA ${round+1}/${game.config.rounds.length}</span><span>${'♥'.repeat(hearts)}</span></div><div class="practice-line"><strong>${prompt}</strong></div><div class="choice-grid">${choices.map(c=>`<button>${c}</button>`).join('')}</div><div class="result-panel game-status">Pilih jalan dengan grammar yang benar.</div>`;
    $$('.choice-grid button',mount).forEach(button=>button.addEventListener('click',()=>{if(button.textContent===answer){round++;render();}else{hearts--;status(mount,'<strong>Jalan buntu.</strong> Coba pilihan lain.');if(!hearts){$$('.choice-grid button',mount).forEach(b=>b.disabled=true);status(mount,`Jawaban area ini: <strong>${answer}</strong>. Buka game untuk mencoba ulang.`);}}}));
  };
  render();
}

function mountTreasure(game, { mount }, finish) {
  let clue=0;
  const render=()=>{
    const [question] = game.config.clues[clue];
    mount.innerHTML=`<div class="treasure-map">${game.config.clues.map((_,i)=>`<span class="${i<clue?'found':''}">${i<clue?'◆':'?'}</span>`).join('')}</div><div class="practice-line"><strong>${question}</strong></div><input class="game-input treasure-input" placeholder="Jawaban Inggris…"/><button class="primary-button check-treasure">Cari</button><div class="result-panel game-status">Pecahkan petunjuk untuk maju.</div>`;
    $('.check-treasure',mount).addEventListener('click',()=>{const answer=game.config.clues[clue][1];if(normalize($('.treasure-input',mount).value)===answer){clue++;if(clue===game.config.clues.length)finish(600,'Harta karun ditemukan');else render();}else status(mount,'<strong>Belum.</strong> Baca petunjuk sekali lagi.');});
  };
  render();
}

function mountEscape(game, { mount }, finish) {
  mount.innerHTML=`<div class="escape-lock">🔒 <span>_ _ _</span></div><div class="clue-list">${game.config.questions.map(([q],i)=>`<label>${i+1}. ${q}<input data-escape="${i}" autocomplete="off" /></label>`).join('')}</div><button class="primary-button unlock-room">Buka pintu</button><div class="result-panel game-status">Huruf pertama setiap jawaban membentuk kode.</div>`;
  $('.unlock-room',mount).addEventListener('click',()=>{const answers=game.config.questions.map(([,a],i)=>normalize($(`[data-escape="${i}"]`,mount).value)===a);if(answers.every(Boolean)){$('.escape-lock span',mount).textContent=game.config.code;finish(700,'Escape room terbuka');}else status(mount,`<strong>${answers.filter(Boolean).length}/3 kunci benar.</strong> Periksa jawaban lain.`);});
}

function mountBoss(game, { mount }, finish) {
  let round=0,bossHp=100,playerHp=3;
  const render=()=>{
    if(round===game.config.rounds.length){finish(800+playerHp*100,'Boss dikalahkan');return;}
    const [prompt,choices,answer]=game.config.rounds[round];
    mount.innerHTML=`<div class="boss-bars"><span>YOU ${'♥'.repeat(playerHp)}</span><span>BOSS ${bossHp} HP</span></div><div class="progress-track"><i style="width:${bossHp}%"></i></div><div class="practice-line"><strong>${prompt}</strong></div><div class="choice-grid">${choices.map(c=>`<button>${c}</button>`).join('')}</div><div class="result-panel game-status">Jawab benar untuk menyerang boss.</div>`;
    $$('.choice-grid button',mount).forEach(button=>button.addEventListener('click',()=>{if(button.textContent===answer){bossHp-=20;round++;render();}else{playerHp--;status(mount,`<strong>Kena serang.</strong> Jawabannya ${answer}.`);if(!playerHp){$$('.choice-grid button',mount).forEach(b=>b.disabled=true);status(mount,'Boss menang ronde ini. Buka ulang untuk rematch.');}}}));
  };
  render();
}
