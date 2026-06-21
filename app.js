import {
  initializeDatabase,
  getContent,
  getContentById,
  getLearner,
  saveLearner,
  recordLearning,
  reviewVocabulary,
  saveGameResult,
  getDatabaseStats,
  dateKey,
} from './database.js?v=6';
import { runGame, stopActiveGame, validateGameRecords } from './games.js?v=2';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const shuffle = items => [...items].sort(() => Math.random() - 0.5);

const state = {
  theme: localStorage.getItem('ep-theme') || 'light',
  lang: localStorage.getItem('ep-lang') || 'ID',
  learner: null,
  database: null,
  searchIndex: [],
  challengeRounds: [],
  challengeIndex: 0,
  challengeScore: 0,
  challengeSeconds: 300,
  challengeTimer: null,
  challengeStarted: false,
  quiz: null,
  quizTimer: null,
};

const modal = $('#modal');
const modalContent = $('#modalContent');
const toast = $('#toast');

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  $('#themeToggle span').textContent = state.theme === 'dark' ? '☀' : '☾';
  $('#themeToggle').setAttribute('aria-label', state.theme === 'dark' ? 'Gunakan mode terang' : 'Gunakan mode gelap');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function confetti() {
  const colors = ['#6c4cff', '#ffca58', '#ff796e', '#72d6b2', '#6c9fff'];
  for (let i = 0; i < 48; i++) {
    const bit = document.createElement('i');
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[i % colors.length];
    bit.style.animationDelay = `${Math.random() * .45}s`;
    $('#confetti').append(bit);
    setTimeout(() => bit.remove(), 2000);
  }
}

function openModal(html) {
  stopActiveGame();
  stopTimedQuiz();
  modalContent.innerHTML = html;
  if (!modal.open) modal.showModal();
  $('.modal-close').focus();
}

function stopTimedQuiz() {
  if (state.quizTimer) clearInterval(state.quizTimer);
  state.quizTimer = null;
}

function speak(text, rate = .82) {
  if (!('speechSynthesis' in window)) { showToast('Audio belum didukung di browser ini'); return; }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
  showToast('Memutar audio 🔊');
}

async function addXP(points, activity, message = `+${points} XP`) {
  state.learner = await recordLearning(points, activity);
  renderProgress();
  renderStreak();
  confetti();
  showToast(`${message} ✨`);
}

function renderProgress() {
  const xp = state.learner?.xp || 0;
  const level = Math.floor(xp / 500) + 1;
  const target = level * 500;
  const progress = ((xp - (level - 1) * 500) / 500) * 100;
  $('#levelNumber').textContent = level;
  $('#levelLabel').textContent = level === 1 ? 'Starter Level 1' : `Explorer Level ${level}`;
  $('#xpValue').textContent = xp.toLocaleString('id-ID');
  $('#xpTarget').textContent = target.toLocaleString('id-ID');
  $('#xpProgress').style.width = `${progress}%`;
  $('.level-ring').style.background = `conic-gradient(var(--purple) ${progress}%, var(--purple-soft) 0)`;
}

function renderStreak() {
  const learner = state.learner;
  const activeDates = new Set(learner.studyDates || []);
  const labels = ['M','S','S','R','K','J','S'];
  const days = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = dateKey(date);
    days.push({ key, label:labels[date.getDay()], active:activeDates.has(key), today:offset === 0 });
  }
  $('#weekRow').innerHTML = days.map(day => `<span class="${day.today ? 'today' : ''}"><i class="${day.active ? 'studied' : ''}">${day.active ? '✓' : '·'}</i><small>${day.label}</small></span>`).join('');
  const streak = learner.currentStreak || 0;
  $('.big-flame').textContent = streak ? '🔥' : '🌱';
  $('#streakTitle').textContent = streak ? `${streak} hari` : 'Mulai streak-mu';
  $('#streakDetail').textContent = streak ? `terakhir belajar ${learner.lastStudyDate}` : 'hari pertama dimulai setelah satu latihan';
  $('#bestStreak').textContent = `TERBAIK ${learner.bestStreak || 0}`;
  $('#streakMessage').innerHTML = activeDates.has(dateKey()) ? 'Latihan hari ini <strong>sudah tercatat di database.</strong>' : 'Selesaikan <strong>satu latihan</strong> untuk menandai hari ini.';
}

function renderQuests() {
  const quests = state.learner.quests || [false,false,false];
  quests.forEach((done, index) => {
    const item = $(`.quest-item[data-quest="${index}"]`);
    item.classList.toggle('done', done);
    $('.quest-action', item).textContent = done ? '✓ Selesai' : 'Mulai';
  });
  const count = quests.filter(Boolean).length;
  $('#questProgress').style.width = `${count / 3 * 100}%`;
  $('#questCount').textContent = `${count} / 3 selesai`;
}

async function completeQuest(index) {
  if (index == null || state.learner.quests[index]) return;
  state.learner.quests[index] = true;
  await saveLearner(state.learner);
  await addXP(20, `quest-${index}`, 'Misi selesai: +20 XP');
  renderQuests();
}

async function lessonModal(idOrCategory = 'vocab-travel', questIndex = null) {
  const all = await getContent('vocabulary');
  const lesson = all.find(item => item.id === idOrCategory || item.category === idOrCategory) || all[0];
  openModal(`
    <div class="modal-hero"><span class="lesson-icon">${lesson.emoji}</span><div><span class="tag purple-bg">VOCABULARY • ${lesson.difficulty}</span><h2>${lesson.category}</h2><p>Dengar, lihat konteks, lalu jadwalkan review.</p></div></div>
    <div class="vocab-focus"><div class="emoji">${lesson.emoji}</div><h3>${lesson.word}</h3><div class="ipa">${lesson.ipa} <button class="sound-button modal-word-audio" aria-label="Dengarkan ${lesson.word}">♪</button></div><p class="meaning">${lesson.meaning}</p></div>
    <p class="example-box"><strong>${lesson.example}</strong><br/>${lesson.translation}</p>
    <div class="modal-actions"><button class="secondary-button example-audio">🔊 Dengar contoh</button><button class="secondary-button review-word" data-quality="2">Masih sulit</button><button class="primary-button review-word" data-quality="4">Sudah paham</button></div>
    <div class="result-panel review-status">Jawabanmu akan menentukan jadwal review berikutnya.</div>
  `);
  $('.modal-word-audio').addEventListener('click', () => speak(lesson.word, .7));
  $('.example-audio').addEventListener('click', () => speak(lesson.example));
  $$('.review-word').forEach(button => button.addEventListener('click', async () => {
    if (button.dataset.done) return;
    $$('.review-word').forEach(control => control.dataset.done = 'true');
    const review = await reviewVocabulary(lesson.id, Number(button.dataset.quality));
    $('.review-status').innerHTML = `<strong>Tersimpan.</strong> Review berikutnya dalam ${review.interval} hari (algoritma spaced repetition).`;
    await addXP(Number(button.dataset.quality) >= 3 ? 10 : 5, `vocabulary:${lesson.id}`, 'Vocabulary tersimpan');
    await completeQuest(questIndex);
  }));
}

async function grammarModal(idOrTopic = 'grammar-present-simple') {
  const all = await getContent('grammar');
  const lesson = all.find(item => item.id === idOrTopic || item.topic === idOrTopic) || all[0];
  openModal(`
    <div class="modal-hero"><span class="lesson-icon">🧩</span><div><span class="tag blue-bg">GRAMMAR</span><h2>${lesson.topic}</h2><p>Aturan dan soal ini berasal dari database lesson.</p></div></div>
    <div class="grammar-rule"><small>POLA DASAR</small><strong>${lesson.formula}</strong><p>${lesson.explanation}</p></div>
    <p class="example-box"><strong>${lesson.example}</strong></p>
    <div class="practice-line"><strong>Pilih jawaban yang benar:</strong><span>${lesson.prompt}</span></div>
    <div class="choice-grid">${lesson.choices.map(choice => `<button>${choice}</button>`).join('')}</div>
    <div class="result-panel grammar-result" aria-live="polite">Pilih satu jawaban.</div>
  `);
  $$('.choice-grid button').forEach(button => button.addEventListener('click', async () => {
    if (button.textContent === lesson.answer) {
      button.classList.add('correct');
      $('.grammar-result').innerHTML = `<strong>Benar.</strong> ${lesson.feedback}`;
      if (!button.dataset.done) { button.dataset.done='true'; await addXP(15, `grammar:${lesson.id}`, 'Grammar benar: +15 XP'); }
    } else {
      button.classList.add('wrong');
      $('.grammar-result').innerHTML = `<strong>Belum tepat.</strong> ${lesson.explanation}`;
    }
  }));
}

async function listeningModal(id = 'listening-cafe', questIndex = null) {
  const all = await getContent('listening');
  const lesson = all.find(item => item.id === id || item.topic === id) || all[0];
  openModal(`
    <div class="modal-hero"><span class="lesson-icon">🎧</span><div><span class="tag yellow-bg">LISTENING</span><h2>${lesson.topic}</h2><p>Dengarkan dengan kecepatan normal atau pelan.</p></div></div>
    <div class="listen-panel"><div class="waveform compact-wave"><i></i><i></i><i></i><i></i><i></i></div><button class="primary-button play-listening">▶ Putar</button><button class="secondary-button slow-listening">0.7× Pelan</button></div>
    <div class="practice-line"><strong>${lesson.question}</strong><span>Pilih setelah mendengarkan.</span></div>
    <div class="choice-grid">${lesson.choices.map(choice => `<button>${choice}</button>`).join('')}</div>
    <div class="result-panel listening-result">Audio bisa diputar berkali-kali.</div>
  `);
  $('.play-listening').addEventListener('click', () => speak(lesson.sentence));
  $('.slow-listening').addEventListener('click', () => speak(lesson.sentence, .6));
  $$('.choice-grid button').forEach(button => button.addEventListener('click', async () => {
    if (button.textContent === lesson.answer) {
      button.classList.add('correct');
      $('.listening-result').innerHTML = `<strong>Benar.</strong> “${lesson.sentence}”`;
      if (!button.dataset.done) { button.dataset.done='true'; await addXP(15, `listening:${lesson.id}`, 'Listening benar: +15 XP'); await completeQuest(questIndex); }
    } else {
      button.classList.add('wrong'); $('.listening-result').innerHTML = '<strong>Coba lagi.</strong> Putar versi pelan dan dengarkan kata kuncinya.';
    }
  }));
}

async function speakingModal(idOrTopic = 'speaking-greetings') {
  const all = await getContent('speaking');
  const lesson = all.find(item => item.id === idOrTopic || item.topic === idOrTopic) || all[0];
  openModal(`
    <div class="modal-hero"><span class="lesson-icon">🎙️</span><div><span class="tag coral-bg">SPEAKING • ${lesson.difficulty}</span><h2>${lesson.topic}</h2><p>Dengar, ulangi, lalu bandingkan hasil transkripsi.</p></div></div>
    <div class="speak-prompt"><small>UCAPKAN</small><strong>${lesson.phrase}</strong><span>${lesson.tip}</span><button class="secondary-button hear-speaking">🔊 Dengar contoh</button></div>
    <button class="primary-button record-speaking">🎙 Mulai bicara</button>
    <div class="result-panel speaking-result">Mikrofon hanya aktif setelah tombol ditekan.</div>
  `);
  $('.hear-speaking').addEventListener('click', () => speak(lesson.phrase, .75));
  $('.record-speaking').addEventListener('click', () => startSpeechRecognition(lesson));
}

function startSpeechRecognition(lesson) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const result = $('.speaking-result');
  if (!Recognition) { result.innerHTML = '<strong>Speech recognition tidak tersedia.</strong> Audio tetap bisa dipakai untuk shadowing.'; return; }
  const recognition = new Recognition();
  recognition.lang='en-US'; recognition.interimResults=false; recognition.maxAlternatives=1;
  result.textContent='Mendengarkan…';
  recognition.onresult = async event => {
    const transcript = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence || .7;
    const clean = value => value.toLowerCase().replace(/[^a-z ]/g,'').split(/\s+/).filter(Boolean);
    const expected = clean(lesson.phrase);
    const spoken = clean(transcript);
    const matched = expected.filter((word,index) => spoken[index] === word).length;
    const accuracy = Math.round(matched / expected.length * 100);
    const pronunciation = Math.round(confidence * 100);
    const fluency = Math.round(Math.min(100, spoken.length / expected.length * 100));
    result.innerHTML = `<strong>Hasil browser</strong><br/>Terdengar: “${transcript}”<div class="score-row"><span>Akurasi ${accuracy}%</span><span>Pelafalan ${pronunciation}%</span><span>Kelancaran ${fluency}%</span></div>`;
    if (accuracy >= 70) await addXP(20, `speaking:${lesson.id}`, 'Speaking selesai: +20 XP');
  };
  recognition.onerror = event => { result.innerHTML = `<strong>Mikrofon belum bisa digunakan.</strong><br/>${event.error === 'not-allowed' ? 'Berikan izin mikrofon untuk memakai penilaian suara.' : 'Coba lagi atau gunakan audio untuk latihan mandiri.'}`; };
  recognition.start();
}

async function gameModal(gameId = 'game-word-match') {
  const game = await getContentById(gameId) || (await getContent('game'))[0];
  openModal(`<div class="modal-hero"><span class="lesson-icon">${game.icon}</span><div><span class="tag yellow-bg">${game.algorithm.toUpperCase()} ENGINE</span><h2>${game.title}</h2><p>Game ini memakai aturan, skor, dan data sendiri.</p></div></div><div id="gameMount"></div>`);
  runGame(game, {
    mount:$('#gameMount'),
    speak,
    showToast,
    onComplete: async (record, score, message) => {
      await saveGameResult(record.id, score, { algorithm:record.algorithm });
      const reward = Math.max(15, Math.min(50, Math.round(score / 20)));
      const status = $('.game-status');
      if (status) status.innerHTML = `<strong>${message}.</strong> Skor ${score}. Hasil tersimpan di database.`;
      await addXP(reward, `game:${record.id}`, `Game selesai: +${reward} XP`);
    },
  });
}

async function moduleModal(name) {
  const type = { Vocabulary:'vocabulary', Grammar:'grammar', Speaking:'speaking', Games:'game' }[name];
  const items = await getContent(type);
  const icons = { Vocabulary:'🔤', Grammar:'🧩', Speaking:'🎙️', Games:'🎮' };
  const label = item => item.category || item.topic || item.title;
  openModal(`<div class="modal-hero"><span class="lesson-icon">${icons[name]}</span><div><span class="tag purple-bg">DATABASE • ${items.length} ITEM</span><h2>${name}</h2><p>Setiap pilihan membuka konten dan algoritmanya sendiri.</p></div></div><div class="module-list ${name === 'Games' ? 'game-catalog' : ''}">${items.map(item => `<button data-id="${item.id}">${item.icon || item.emoji || '→'} ${label(item)}<br/><small>${item.algorithm ? `${item.algorithm} engine` : 'Buka latihan'} →</small></button>`).join('')}</div>`);
  $$('.module-list button').forEach(button => button.addEventListener('click', () => {
    if (name === 'Vocabulary') lessonModal(button.dataset.id);
    if (name === 'Grammar') grammarModal(button.dataset.id);
    if (name === 'Speaking') speakingModal(button.dataset.id);
    if (name === 'Games') gameModal(button.dataset.id);
  }));
}

async function renderPathProgress() {
  const lessons = await getContent('pathLesson');
  const completed = new Set(state.learner.completedPathLessons || []);
  const worlds = ['Basic Greetings', 'Family', 'Food'];
  const greetingLessons = lessons.filter(item => item.world === 'Basic Greetings');
  const familyLessons = lessons.filter(item => item.world === 'Family');
  const greetingsComplete = greetingLessons.length > 0 && greetingLessons.every(item => completed.has(item.id));
  const familyComplete = familyLessons.length > 0 && familyLessons.every(item => completed.has(item.id));
  const currentWorld = !greetingsComplete ? 'Basic Greetings' : !familyComplete ? 'Family' : 'Food';

  worlds.forEach((world, index) => {
    const node = $(`.path-node[data-world="${world}"]`);
    if (!node) return;
    const worldLessons = lessons.filter(item => item.world === world);
    const done = worldLessons.filter(item => completed.has(item.id)).length;
    const locked = world === 'Food' && !familyComplete;
    node.classList.toggle('locked', locked);
    node.classList.toggle('complete', done === worldLessons.length && worldLessons.length > 0);
    node.classList.toggle('current', !locked && done < worldLessons.length && world === currentWorld);
    node.setAttribute('aria-label', `${world}: ${done} dari ${worldLessons.length} lesson${locked ? ', terkunci' : ''}`);
    $('.node-badge', node).textContent = locked ? '🔒' : done === worldLessons.length && done > 0 ? '✓' : String(index + 1);
    $('small', node).textContent = `${done}/${worldLessons.length} lessons${locked ? ' • terkunci' : ''}`;
  });
}

async function pathLessonModal(id) {
  const lesson = await getContentById(id);
  const completed = new Set(state.learner.completedPathLessons || []);
  const alreadyDone = completed.has(id);
  openModal(`
    <div class="modal-hero"><span class="lesson-icon">${lesson.emoji}</span><div><span class="tag purple-bg">${lesson.world.toUpperCase()} • LESSON ${lesson.order}</span><h2>${lesson.word}</h2><p>Dengar kata dan kalimatnya, lalu tandai saat sudah paham.</p></div></div>
    <div class="vocab-focus path-focus"><div class="emoji">${lesson.emoji}</div><h3>${lesson.word}</h3><div class="ipa">${lesson.pronunciation} <button class="sound-button path-word-audio" aria-label="Dengarkan ${lesson.word}">♪</button></div><p class="meaning">${lesson.meaning}</p></div>
    <p class="example-box"><strong>${lesson.example}</strong><br/>${lesson.translation}</p>
    <div class="modal-actions"><button class="secondary-button path-example-audio">🔊 Dengar contoh</button><button class="primary-button path-complete" ${alreadyDone ? 'disabled' : ''}>${alreadyDone ? 'Sudah selesai ✓' : 'Selesai • +10 XP'}</button></div>
    <div class="result-panel path-status">${alreadyDone ? 'Progress lesson ini sudah tersimpan di database lokal.' : 'Lesson ini akan masuk ke progress dunia belajarmu.'}</div>
  `);
  $('.path-word-audio').addEventListener('click', () => speak(lesson.word, .72));
  $('.path-example-audio').addEventListener('click', () => speak(lesson.example, .8));
  $('.path-complete').addEventListener('click', async event => {
    if (completed.has(id)) return;
    completed.add(id);
    state.learner.completedPathLessons = [...completed];
    await saveLearner(state.learner);
    await addXP(10, `path:${id}`, 'Lesson selesai: +10 XP');
    await renderPathProgress();
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = 'Sudah selesai ✓';
    $('.path-status').innerHTML = '<strong>Tersimpan.</strong> Progress dunia dan streak sudah diperbarui.';
  });
}

async function worldModal(world) {
  const lessons = (await getContent('pathLesson')).filter(item => item.world === world).sort((a, b) => a.order - b.order);
  const completed = new Set(state.learner.completedPathLessons || []);
  const done = lessons.filter(item => completed.has(item.id)).length;
  openModal(`
    <div class="modal-hero"><span class="lesson-icon">${world === 'Basic Greetings' ? '👋' : world === 'Family' ? '🏡' : '🍜'}</span><div><span class="tag purple-bg">PILIH DUNIAMU</span><h2>${world}</h2><p>${done}/${lessons.length} lesson selesai. Semua lesson di bawah berasal dari database.</p></div></div>
    <div class="progress-track world-progress"><i style="width:${lessons.length ? done / lessons.length * 100 : 0}%"></i></div>
    <div class="path-lesson-list">${lessons.map(item => `<button class="path-lesson-card ${completed.has(item.id) ? 'done' : ''}" data-path-id="${item.id}"><span>${item.emoji}</span><i>${String(item.order).padStart(2, '0')}</i><strong>${item.word}</strong><small>${item.meaning}</small><b>${completed.has(item.id) ? '✓' : '→'}</b></button>`).join('')}</div>
  `);
  $$('.path-lesson-card').forEach(button => button.addEventListener('click', () => pathLessonModal(button.dataset.pathId)));
}

async function fullPathModal() {
  const lessons = await getContent('pathLesson');
  const completed = new Set(state.learner.completedPathLessons || []);
  const familyLessons = lessons.filter(item => item.world === 'Family');
  const familyComplete = familyLessons.length > 0 && familyLessons.every(item => completed.has(item.id));
  const worlds = [
    { name:'Basic Greetings', icon:'👋', unlocked:true },
    { name:'Family', icon:'🏡', unlocked:true },
    { name:'Food', icon:'🍜', unlocked:familyComplete },
    { name:'Travel', icon:'✈️', unlocked:false, comingSoon:true },
    { name:'Work & Business', icon:'💼', unlocked:false, comingSoon:true },
  ];
  openModal(`<div class="modal-hero"><span class="lesson-icon">🗺️</span><div><span class="tag purple-bg">LEARNING PATH</span><h2>Pilih duniamu</h2><p>34 lesson aktif dengan progress yang benar-benar tersimpan.</p></div></div><div class="world-grid">${worlds.map(world => {
    const worldLessons = lessons.filter(item => item.world === world.name);
    const done = worldLessons.filter(item => completed.has(item.id)).length;
    const detail = world.comingSoon ? 'Segera hadir' : `${done}/${worldLessons.length} lessons`;
    return `<button class="world-card ${world.unlocked ? '' : 'locked'}" data-world-name="${world.name}" ${world.unlocked ? '' : 'disabled'}><span>${world.icon}</span><strong>${world.name}</strong><small>${detail}</small><b>${world.unlocked ? 'Buka →' : '🔒'}</b></button>`;
  }).join('')}</div>`);
  $$('.world-card:not([disabled])').forEach(button => button.addEventListener('click', () => worldModal(button.dataset.worldName)));
}

async function tenseLessonModal(id) {
  const lesson = await getContentById(id);
  openModal(`
    <div class="modal-hero"><span class="lesson-icon">⏳</span><div><span class="tag purple-bg">${lesson.group.toUpperCase()}</span><h2>${lesson.title}</h2><p>${lesson.use}</p></div></div>
    <div class="tense-timeline"><small>TIMELINE</small><strong>${lesson.timeline}</strong></div>
    <div class="grammar-rule"><small>FORMULA</small><strong>${lesson.formula}</strong><p>${lesson.use}</p></div>
    <div class="example-stack"><div class="positive"><span>＋</span><p><strong>Positive</strong>${lesson.positive}</p><button data-say="${lesson.positive}">🔊</button></div><div class="negative"><span>−</span><p><strong>Negative</strong>${lesson.negative}</p><button data-say="${lesson.negative}">🔊</button></div><div class="question"><span>?</span><p><strong>Question</strong>${lesson.question}</p><button data-say="${lesson.question}">🔊</button></div></div>
    <div class="mistake-note"><strong>Common mistake</strong><p>${lesson.mistake}</p></div>
    <div class="modal-actions"><button class="secondary-button tense-practice" data-id="${lesson.id}">Coba 3 soal topik ini</button><button class="primary-button tense-done">Tandai dipelajari +15 XP</button></div>
  `);
  $$('[data-say]', modal).forEach(button => button.addEventListener('click', () => speak(button.dataset.say)));
  $('.tense-practice').addEventListener('click', () => startTimedQuiz('tenseQuiz', lesson.id));
  $('.tense-done').addEventListener('click', async event => { if(event.currentTarget.dataset.done)return;event.currentTarget.dataset.done='true';await addXP(15,`tense:${lesson.id}`,'Tense dipelajari: +15 XP');event.currentTarget.textContent='Tersimpan ✓'; });
}

async function professionalLessonModal(id) {
  const lesson = await getContentById(id);
  openModal(`
    <div class="modal-hero"><span class="lesson-icon">${lesson.icon}</span><div><span class="tag coral-bg">${lesson.level.toUpperCase()}</span><h2>${lesson.title}</h2><p>Focus: ${lesson.focus}</p></div></div>
    <div class="pro-scenario"><small>WORKPLACE SCENARIO</small><strong>${lesson.scenario}</strong></div>
    <div class="model-answer"><small>MODEL LANGUAGE</small><p>${lesson.model}</p><button class="secondary-button pro-audio">🔊 Dengar model</button></div>
    <div class="phrase-bank"><strong>Useful phrases</strong>${lesson.phrases.map(phrase=>`<button>${phrase}</button>`).join('')}</div>
    <div class="modal-actions"><button class="primary-button pro-done">Simpan lesson +20 XP</button></div>
  `);
  $('.pro-audio').addEventListener('click',()=>speak(lesson.model,.78));
  $$('.phrase-bank button').forEach(button=>button.addEventListener('click',()=>speak(button.textContent,.75)));
  $('.pro-done').addEventListener('click',async event=>{if(event.currentTarget.dataset.done)return;event.currentTarget.dataset.done='true';await addXP(20,`professional:${lesson.id}`,'Professional lesson: +20 XP');event.currentTarget.textContent='Tersimpan ✓';});
}

async function renderLearningCenters() {
  const tenses = (await getContent('tense')).sort((a,b)=>a.order-b.order);
  const professionals = await getContent('professional');
  $('#tenseGrid').innerHTML = tenses.map((lesson,index)=>`<button class="tense-card" data-tense-id="${lesson.id}" data-group="${lesson.group}"><span class="tense-number">${String(index+1).padStart(2,'0')}</span><small>${lesson.group}</small><strong>${lesson.title}</strong><p>${lesson.formula}</p><i>Open lesson →</i></button>`).join('');
  $('#professionalGrid').innerHTML = professionals.map(lesson=>`<button class="professional-card" data-professional-id="${lesson.id}"><span>${lesson.icon}</span><small>${lesson.level}</small><strong>${lesson.title}</strong><p>${lesson.focus}</p><i>Practice scenario →</i></button>`).join('');
  $$('.tense-card').forEach(button=>button.addEventListener('click',()=>tenseLessonModal(button.dataset.tenseId)));
  $$('.professional-card').forEach(button=>button.addEventListener('click',()=>professionalLessonModal(button.dataset.professionalId)));
  $$('.tense-filter button').forEach(button=>button.addEventListener('click',()=>{
    $$('.tense-filter button').forEach(item=>item.classList.remove('active'));button.classList.add('active');
    $$('.tense-card').forEach(card=>card.hidden=button.dataset.tenseFilter!=='all'&&card.dataset.group!==button.dataset.tenseFilter);
  }));
  $('#startTenseQuiz').addEventListener('click',()=>startTimedQuiz('tenseQuiz'));
  $('#startProfessionalQuiz').addEventListener('click',()=>startTimedQuiz('professionalQuiz'));
}

async function startTimedQuiz(type, tenseId = null) {
  const isTense = type === 'tenseQuiz';
  let questions = await getContent(type);
  if (tenseId) questions = questions.filter(question=>question.tenseId===tenseId);
  const maximum = tenseId ? questions.length : isTense ? 50 : 20;
  questions = shuffle(questions).slice(0,maximum);
  openModal(`<div class="quiz-shell"><div class="quiz-top"><span class="tag ${isTense?'purple-bg':'coral-bg'}">${isTense?'TENSE CAPABILITY TEST':'PROFESSIONAL ENGLISH TEST'}</span><strong class="quiz-clock">${isTense?'30:00':'15:00'}</strong></div><div id="quizMount"></div></div>`);
  state.quiz={type,questions,index:0,score:0,points:isTense?2:5,seconds:isTense?1800:900,answers:[],finished:false};
  state.quizTimer=setInterval(()=>{if(!state.quiz||state.quiz.finished)return;state.quiz.seconds--;updateQuizClock();if(state.quiz.seconds<=0)finishTimedQuiz(true);},1000);
  renderQuizQuestion();
}

function updateQuizClock() {
  if(!state.quiz)return;
  const min=Math.floor(state.quiz.seconds/60),sec=state.quiz.seconds%60;
  $('.quiz-clock').textContent=`${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function renderQuizQuestion() {
  const quiz=state.quiz;
  const question=quiz.questions[quiz.index];
  const maximum=quiz.questions.length*quiz.points;
  $('#quizMount').innerHTML=`<div class="quiz-progress"><span>Soal ${quiz.index+1} / ${quiz.questions.length}</span><span>Skor ${quiz.score} / ${maximum}</span></div><div class="progress-track"><i style="width:${(quiz.index)/quiz.questions.length*100}%"></i></div><div class="quiz-question"><small>${question.tense||'WORKPLACE ENGLISH'}</small><h3>${question.prompt}</h3></div><div class="quiz-choices">${question.choices.map(choice=>`<button>${choice}</button>`).join('')}</div><div class="result-panel quiz-feedback">Pilih jawaban terbaik.</div>`;
  $$('.quiz-choices button').forEach(button=>button.addEventListener('click',()=>answerQuizQuestion(button,question)));
}

function answerQuizQuestion(button,question) {
  if(state.quiz.answers[state.quiz.index])return;
  const correct=button.textContent===question.answer;
  if(correct){state.quiz.score+=state.quiz.points;button.classList.add('correct');}else{button.classList.add('wrong');$$('.quiz-choices button').find(item=>item.textContent===question.answer)?.classList.add('correct');}
  state.quiz.answers[state.quiz.index]={questionId:question.id,answer:button.textContent,correct};
  $$('.quiz-choices button').forEach(item=>item.disabled=true);
  $('.quiz-feedback').innerHTML=`<strong>${correct?'Benar.':'Belum tepat.'}</strong> Jawaban: ${question.answer}. <button class="quiz-next">${state.quiz.index===state.quiz.questions.length-1?'Lihat hasil':'Soal berikutnya'} →</button>`;
  $('.quiz-next').addEventListener('click',()=>{state.quiz.index++;if(state.quiz.index>=state.quiz.questions.length)finishTimedQuiz(false);else renderQuizQuestion();});
}

async function finishTimedQuiz(timedOut) {
  const quiz=state.quiz;if(!quiz||quiz.finished)return;quiz.finished=true;stopTimedQuiz();
  const max=quiz.questions.length*quiz.points;
  const score=Math.round(quiz.score/max*100);
  const isTense=quiz.type==='tenseQuiz';
  const band=isTense?(score>=85?'Advanced':score>=70?'Strong':score>=40?'Developing':'Beginner'):(score>=90?'Executive-ready':score>=75?'Professional':score>=50?'Operational':'Foundation');
  await saveGameResult(quiz.type,score,{answers:quiz.answers,duration:(isTense?1800:900)-quiz.seconds,timedOut});
  $('#quizMount').innerHTML=`<div class="quiz-result"><span>${score>=70?'🏆':'🌱'}</span><small>${timedOut?'WAKTU HABIS':'TEST COMPLETE'}</small><strong>${score}<i>/100</i></strong><h3>${band}</h3><p>${isTense?'Gunakan hasil ini untuk memilih tense yang perlu dipelajari lagi.':'Gunakan hasil ini untuk memilih skill profesional yang perlu dilatih.'}</p><button class="primary-button quiz-restart">Coba lagi</button></div>`;
  $('.quiz-restart').addEventListener('click',()=>startTimedQuiz(quiz.type));
  await addXP(isTense?100:80,`assessment:${quiz.type}`,`${isTense?'Tense':'Professional'} test selesai`);
}

function updateChallengeTimer() {
  const minutes = Math.floor(state.challengeSeconds / 60);
  const seconds = state.challengeSeconds % 60;
  $('#timer').textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function startChallengeTimer() {
  if (state.challengeStarted || state.challengeSeconds <= 0) return;
  state.challengeStarted = true;
  state.challengeTimer = setInterval(() => {
    state.challengeSeconds--;
    updateChallengeTimer();
    if (state.challengeSeconds <= 0) {
      clearInterval(state.challengeTimer);
      $('#checkSentence').disabled = true;
      $('#challengePrompt').textContent = 'Waktu habis. Muat ulang halaman untuk mencoba lagi.';
    }
  },1000);
}

function loadChallengeRound() {
  const round = state.challengeRounds[state.challengeIndex];
  const words = shuffle(round.sentence.split(' '));
  $('#challengeStep').textContent = round.order;
  $('#challengeLength').textContent = `${words.length} KATA`;
  $('#challengePrompt').textContent = `${round.translation} — susun versi Inggrisnya:`;
  $('#answerZone').innerHTML = '<span class="hint">Klik kata untuk menyusun kalimat…</span>';
  $('#wordBank').innerHTML = words.map(word => `<button draggable="true">${word}</button>`).join('');
  $$('#wordBank button').forEach(button => button.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', button.textContent)));
  $('#checkSentence').disabled = false;
  $('#checkSentence').dataset.action = 'check';
  $('#checkSentence').innerHTML = 'Cek Jawaban <span>↵</span>';
}

function updateChallengeHint() {
  const hint = $('.hint', $('#answerZone'));
  if (hint) hint.remove();
  if (!$('#answerZone').children.length) $('#answerZone').innerHTML = '<span class="hint">Klik kata untuk menyusun kalimat…</span>';
}

async function handleChallengeCheck() {
  if ($('#checkSentence').dataset.action === 'next') {
    state.challengeIndex++;
    loadChallengeRound();
    return;
  }
  if ($('#checkSentence').dataset.action === 'restart') {
    state.challengeIndex=0; state.challengeScore=0; state.challengeSeconds=300; state.challengeStarted=false; updateChallengeTimer(); loadChallengeRound(); return;
  }
  startChallengeTimer();
  const round = state.challengeRounds[state.challengeIndex];
  const answer = $$('#answerZone button').map(button => button.textContent).join(' ');
  if (!answer) { showToast('Susun dulu kata-katanya'); return; }
  if (answer !== round.sentence) {
    showToast(`Belum tepat. Kalimat dimulai dengan “${round.sentence.split(' ')[0]}”`);
    $('#answerZone').animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:260});
    return;
  }
  const roundScore = round.order * 200;
  state.challengeScore += roundScore;
  $('#currentScore').textContent = `${state.challengeScore} pts`;
  if (state.challengeIndex < state.challengeRounds.length - 1) {
    $('#challengePrompt').textContent = `Benar! +${roundScore} poin. Ronde berikutnya lebih panjang.`;
    $('#checkSentence').dataset.action='next';
    $('#checkSentence').textContent='Kalimat berikutnya →';
    return;
  }
  clearInterval(state.challengeTimer);
  $('#challengePrompt').textContent='Lima kalimat selesai. Hasil tersimpan di database.';
  $('#checkSentence').dataset.action='restart';
  $('#checkSentence').textContent='Main lagi ↻';
  await saveGameResult('five-minute-challenge', state.challengeScore, { rounds:5, secondsLeft:state.challengeSeconds });
  state.learner.challengeBest = Math.max(state.learner.challengeBest || 0, state.challengeScore);
  await saveLearner(state.learner);
  await addXP(100, 'challenge:five-sentences', 'Challenge selesai: +100 XP');
  await completeQuest(2);
}

async function buildSearchIndex() {
  const types = ['vocabulary','grammar','speaking','listening','game','tense','professional','pathLesson'];
  const records = (await Promise.all(types.map(getContent))).flat();
  state.searchIndex = records.map(item => ({ id:item.id, type:item.type, title:item.category || item.topic || item.title || item.word, detail:item.word || item.algorithm || item.formula || item.focus || item.type }));
  renderSearchResults('');
}

function renderSearchResults(query) {
  const matches = (query ? state.searchIndex.filter(item => `${item.title} ${item.detail}`.toLowerCase().includes(query.toLowerCase())) : state.searchIndex.slice(0,6)).slice(0,8);
  $('#searchResults').innerHTML = `<p>${query ? `${matches.length} HASIL` : 'JELAJAHI DATABASE'}</p>${matches.map(item => `<button type="button" data-id="${item.id}" data-type="${item.type}"><span>${item.type === 'game' ? '🎮' : item.type === 'speaking' ? '🎙️' : item.type === 'grammar' ? '🧩' : '🔤'}</span><span><strong>${item.title}</strong><small>${item.detail}</small></span></button>`).join('') || '<p>Nggak ketemu. Coba kata lain.</p>'}`;
}

function attachEvents() {
  $('#themeToggle').addEventListener('click', () => { state.theme=state.theme==='dark'?'light':'dark';localStorage.setItem('ep-theme',state.theme);applyTheme(); });
  $('#langToggle').addEventListener('click', () => { state.lang=state.lang==='ID'?'EN':'ID';localStorage.setItem('ep-lang',state.lang);$('#langToggle').textContent=state.lang;showToast(state.lang==='EN'?'English labels enabled':'Panduan dalam Bahasa Indonesia'); });
  $('#menuButton').addEventListener('click', () => { const open=$('#navLinks').classList.toggle('open');$('#menuButton').setAttribute('aria-expanded',String(open)); });
  $$('.nav-links a').forEach(link => link.addEventListener('click',()=>{$$('.nav-links a').forEach(a=>a.classList.remove('active'));link.classList.add('active');$('#navLinks').classList.remove('open');}));
  $$('.start-button').forEach(button => button.addEventListener('click', () => lessonModal('vocab-travel')));
  $('.demo-button').addEventListener('click', () => openModal(`<div class="modal-hero"><span class="lesson-icon">✨</span><div><span class="tag purple-bg">CARA MAIN</span><h2>Dengar, jawab, ulangi.</h2><p>Semua hasil tersimpan lokal di IndexedDB.</p></div></div><div class="module-list info-list"><div class="info-tile"><strong>1. Pilih konten</strong><small>Vocabulary, grammar, speaking, atau game.</small></div><div class="info-tile"><strong>2. Kerjakan</strong><small>Setiap aktivitas memakai aturan sendiri.</small></div><div class="info-tile"><strong>3. Kembali lagi</strong><small>Streak dan review tersimpan berdasarkan tanggal asli.</small></div></div>`));
  $('.modal-close').addEventListener('click',()=>{stopActiveGame();stopTimedQuiz();modal.close();});
  modal.addEventListener('click',event=>{if(event.target===modal){stopActiveGame();stopTimedQuiz();modal.close();}});
  $$('.feature-card').forEach(card=>card.addEventListener('click',()=>moduleModal(card.dataset.module)));
  $('.all-games').addEventListener('click',()=>moduleModal('Games'));
  $$('.quest-item').forEach(item=>item.addEventListener('click',()=>{const index=Number(item.dataset.quest);if(index===0)lessonModal('vocab-travel',0);if(index===1)listeningModal('listening-cafe',1);if(index===2){$('#progress').scrollIntoView({behavior:'smooth'});startChallengeTimer();}}));
  $('#fullPath').addEventListener('click', fullPathModal);
  $$('.path-node').forEach(node=>node.addEventListener('click',()=>node.classList.contains('locked')?showToast(node.dataset.world === 'Food' ? 'Selesaikan 12 lesson Family untuk membuka Food' : 'Area ini segera hadir'):worldModal(node.dataset.world)));
  $$('.hero-visual .sound-button').forEach(button=>button.addEventListener('click',()=>speak('adventure',.7)));
  $$('.search-open').forEach(button=>button.addEventListener('click',()=>{$('#searchModal').showModal();setTimeout(()=>$('#globalSearch').focus(),50);}));
  $('#globalSearch').addEventListener('input',event=>renderSearchResults(event.target.value.trim()));
  $('#searchResults').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;$('#searchModal').close();const {id,type}=button.dataset;if(type==='vocabulary')lessonModal(id);if(type==='grammar')grammarModal(id);if(type==='speaking')speakingModal(id);if(type==='listening')listeningModal(id);if(type==='game')gameModal(id);if(type==='tense')tenseLessonModal(id);if(type==='professional')professionalLessonModal(id);if(type==='pathLesson')pathLessonModal(id);});
  $$('.footer [data-module-link]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();moduleModal(link.dataset.moduleLink);}));
  $$('.footer [data-activity]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();link.dataset.activity==='listening'?listeningModal():speakingModal();}));
  $('[data-info="privacy"]').addEventListener('click',event=>{event.preventDefault();openDatabaseModal();});
  $('.avatar-button').addEventListener('click',openDatabaseModal);
  $('#wordBank').addEventListener('click',event=>{const button=event.target.closest('button');if(button){startChallengeTimer();$('#answerZone').append(button);updateChallengeHint();}});
  $('#answerZone').addEventListener('click',event=>{const button=event.target.closest('button');if(button){$('#wordBank').append(button);updateChallengeHint();}});
  $('#answerZone').addEventListener('dragover',event=>event.preventDefault());
  $('#answerZone').addEventListener('drop',event=>{event.preventDefault();const word=event.dataTransfer.getData('text/plain');const button=$$('#wordBank button').find(item=>item.textContent===word);if(button){$('#answerZone').append(button);updateChallengeHint();startChallengeTimer();}});
  $('#checkSentence').addEventListener('click',handleChallengeCheck);
}

async function openDatabaseModal(event) {
  event?.preventDefault?.();
  state.database = await getDatabaseStats();
  const counts = state.database.counts;
  openModal(`<div class="modal-hero"><span class="lesson-icon">💾</span><div><span class="tag purple-bg">INDEXEDDB AKTIF</span><h2>Database lokal</h2><p>Data nyata, persisten, dan hanya tersimpan di browser ini.</p></div></div><div class="mini-stats"><div><strong>${counts.pathLesson}</strong><small>World lessons</small></div><div><strong>${counts.vocabulary}</strong><small>Vocabulary</small></div><div><strong>${counts.grammar}</strong><small>Grammar</small></div><div><strong>${counts.tense}</strong><small>Tense lessons</small></div><div><strong>${counts.tenseQuiz}</strong><small>Tense questions</small></div><div><strong>${counts.professional}</strong><small>Professional skills</small></div><div><strong>${counts.professionalQuiz}</strong><small>Pro questions</small></div><div><strong>${counts.game}</strong><small>Game engines</small></div><div><strong>${state.database.results}</strong><small>Saved results</small></div></div><p class="example-box">Database: <strong>${state.database.name}</strong><br/>XP ${state.learner.xp} • streak ${state.learner.currentStreak} hari • terbaik ${state.learner.bestStreak} hari</p>`);
}

async function bootstrap() {
  applyTheme();
  $('#langToggle').textContent=state.lang;
  try {
    await initializeDatabase();
    state.learner = await getLearner();
    state.learner.completedPathLessons ||= [];
    state.database = await getDatabaseStats();
    const invalidGames = validateGameRecords(await getContent('game'));
    if (invalidGames.length) throw new Error(`Game engine missing: ${invalidGames.map(game => game.id).join(', ')}`);
    state.challengeRounds = (await getContent('challenge')).sort((a,b)=>a.order-b.order);
    $('#dbStatus').textContent = `${state.database.counts.game} game engines ✓`;
    renderProgress(); renderStreak(); renderQuests(); loadChallengeRound(); updateChallengeTimer();
    await renderPathProgress();
    await renderLearningCenters();
    await buildSearchIndex();
    attachEvents();
  } catch (error) {
    console.error(error);
    $('#dbStatus').textContent='Database gagal dibuka';
    showToast('Database lokal tidak dapat dibuka di browser ini');
  }
}

bootstrap();

if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
