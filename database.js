import { TENSES, TENSE_QUIZ, PROFESSIONAL, PROFESSIONAL_QUIZ } from './centers-data.js?v=2';
import { PATH_LESSONS } from './path-data.js?v=1';

const DB_NAME = 'english-playground';
const DB_VERSION = 1;
const SEED_VERSION = 6;
const DATA_VERSION = 1;

const vocabulary = [
  ['animals', 'Animals', 'turtle', '/ˈtɜː.təl/', 'kura-kura', 'The turtle moves slowly.', 'Kura-kura itu bergerak perlahan.', '🐢'],
  ['food', 'Food', 'delicious', '/dɪˈlɪʃ.əs/', 'lezat', 'This soup is delicious.', 'Sup ini lezat.', '🍜'],
  ['travel', 'Travel', 'departure', '/dɪˈpɑː.tʃər/', 'keberangkatan', 'Our departure is at nine.', 'Keberangkatan kami pukul sembilan.', '✈️'],
  ['technology', 'Technology', 'device', '/dɪˈvaɪs/', 'perangkat', 'This device is easy to use.', 'Perangkat ini mudah digunakan.', '💻'],
  ['emotions', 'Emotions', 'excited', '/ɪkˈsaɪ.tɪd/', 'bersemangat', 'I am excited about the trip.', 'Aku bersemangat tentang perjalanan ini.', '✨'],
  ['business', 'Business', 'meeting', '/ˈmiː.tɪŋ/', 'rapat', 'The meeting starts at ten.', 'Rapat dimulai pukul sepuluh.', '💼'],
  ['weather', 'Weather', 'cloudy', '/ˈklaʊ.di/', 'berawan', 'It is cloudy today.', 'Hari ini berawan.', '☁️'],
  ['jobs', 'Jobs', 'designer', '/dɪˈzaɪ.nər/', 'desainer', 'She works as a designer.', 'Dia bekerja sebagai desainer.', '🎨'],
].map(([slug, category, word, ipa, meaning, example, translation, emoji]) => ({ id: `vocab-${slug}`, type: 'vocabulary', category, word, ipa, meaning, example, translation, emoji, difficulty: 'A1' }));

const grammar = [
  { id:'grammar-present-simple', type:'grammar', topic:'Present Simple', formula:'Subject + Verb 1', explanation:'Untuk kebiasaan dan fakta. Tambahkan -s untuk he, she, atau it.', example:'I drink coffee every morning.', prompt:'She ___ English every day.', choices:['study','studies','studying'], answer:'studies', feedback:'“She” memakai verb + s.' },
  { id:'grammar-past-simple', type:'grammar', topic:'Past Simple', formula:'Subject + Verb 2', explanation:'Untuk kejadian yang selesai di masa lalu.', example:'We visited Bandung yesterday.', prompt:'They ___ dinner last night.', choices:['cook','cooked','cooking'], answer:'cooked', feedback:'Keterangan “last night” membutuhkan past simple.' },
  { id:'grammar-articles', type:'grammar', topic:'Articles', formula:'a / an / the + noun', explanation:'Gunakan a/an untuk benda yang belum spesifik; the untuk yang sudah jelas.', example:'I saw a cat. The cat was sleeping.', prompt:'She ate ___ apple.', choices:['a','an','the'], answer:'an', feedback:'“Apple” diawali bunyi vokal, jadi gunakan “an”.' },
  { id:'grammar-prepositions', type:'grammar', topic:'Prepositions', formula:'in / on / at + time or place', explanation:'At untuk waktu spesifik, on untuk hari/tanggal, in untuk periode lebih luas.', example:'The class starts at nine.', prompt:'We have a meeting ___ Monday.', choices:['in','on','at'], answer:'on', feedback:'Gunakan “on” sebelum nama hari.' },
  { id:'grammar-conditionals', type:'grammar', topic:'Conditionals', formula:'If + present, will + verb', explanation:'First conditional membicarakan kemungkinan nyata di masa depan.', example:'If it rains, I will stay home.', prompt:'If you study, you ___ improve.', choices:['will','would','did'], answer:'will', feedback:'First conditional memakai “will” pada hasilnya.' },
  { id:'grammar-passive', type:'grammar', topic:'Passive Voice', formula:'Subject + be + Verb 3', explanation:'Gunakan passive saat tindakan lebih penting daripada pelakunya.', example:'The email was sent this morning.', prompt:'The cake ___ made yesterday.', choices:['was','is','has'], answer:'was', feedback:'“Yesterday” membutuhkan bentuk lampau “was made”.' },
];

const speaking = [
  ['greetings','Greetings','Hello, nice to meet you.','Beri jeda kecil setelah “Hello”.'],
  ['cafe','At a café','Could I have a cup of coffee, please?','Tekankan kata “coffee” dengan jelas.'],
  ['interview','Job interview','I have three years of experience in design.','Ucapkan “experience” perlahan: ex-pe-ri-ence.'],
  ['directions','Giving directions','Turn left at the traffic light.','Bedakan bunyi “left” dan “light”.'],
  ['small-talk','Small talk','What do you usually do on weekends?','Naikkan intonasi di akhir pertanyaan.'],
  ['presentation','Presentation practice','Today, I would like to share three ideas.','Ambil napas setelah kata “Today”.'],
].map(([slug, topic, phrase, tip]) => ({ id:`speaking-${slug}`, type:'speaking', topic, phrase, tip, difficulty:'A1–B1' }));

const listening = [
  { id:'listening-cafe', type:'listening', topic:'At a coffee shop', sentence:'Could I have a cup of coffee, please?', question:'Apa yang dipesan pembicara?', choices:['A glass of water','A cup of coffee','A bowl of soup'], answer:'A cup of coffee' },
  { id:'listening-station', type:'listening', topic:'At the station', sentence:'The next train leaves from platform four.', question:'Kereta berangkat dari peron berapa?', choices:['Platform two','Platform four','Platform five'], answer:'Platform four' },
  { id:'listening-office', type:'listening', topic:'At the office', sentence:'The meeting has moved to Friday morning.', question:'Kapan rapatnya?', choices:['Thursday morning','Friday morning','Friday afternoon'], answer:'Friday morning' },
];

const challenges = [
  ['challenge-1',1,'I drink water','Saya minum air'],
  ['challenge-2',2,'She reads every night','Dia membaca setiap malam'],
  ['challenge-3',3,'We are learning English together','Kami sedang belajar bahasa Inggris bersama'],
  ['challenge-4',4,'My brother takes the bus to work','Kakak laki-lakiku naik bus ke tempat kerja'],
  ['challenge-5',5,'They have been waiting at the station since morning','Mereka sudah menunggu di stasiun sejak pagi'],
].map(([id, order, sentence, translation]) => ({ id, type:'challenge', order, sentence, translation }));

const games = [
  { id:'game-word-match', type:'game', title:'Word Match', algorithm:'match', icon:'🔗', config:{ pairs:[['apple','apel'],['book','buku'],['rain','hujan']] } },
  { id:'game-memory', type:'game', title:'Memory Cards', algorithm:'memory', icon:'🧠', config:{ pairs:[['cat','kucing'],['sun','matahari'],['milk','susu']] } },
  { id:'game-hangman', type:'game', title:'Hangman', algorithm:'hangman', icon:'🪢', config:{ word:'journey', hint:'perjalanan' } },
  { id:'game-word-search', type:'game', title:'Word Search', algorithm:'wordsearch', icon:'🔎', config:{ words:['BOOK','RAIN','APPLE'], size:7 } },
  { id:'game-crossword', type:'game', title:'Crossword', algorithm:'crossword', icon:'✚', config:{ clues:[['Opposite of hot','cold'],['A place to study','school'],['You read this','book']] } },
  { id:'game-typing-race', type:'game', title:'Typing Race', algorithm:'typing', icon:'⌨️', config:{ phrase:'Practice makes progress.' } },
  { id:'game-sentence-race', type:'game', title:'Sentence Race', algorithm:'sentence-race', icon:'🏁', config:{ sentence:'We study English every day', seconds:30 } },
  { id:'game-grammar-shooter', type:'game', title:'Grammar Shooter', algorithm:'shooter', icon:'🎯', config:{ prompt:'He ___ to work every day.', choices:['go','goes','going'], answer:'goes', seconds:8 } },
  { id:'game-bingo', type:'game', title:'Vocabulary Bingo', algorithm:'bingo', icon:'▦', config:{ words:['apple','book','rain','chair','coffee','train','house','music','phone'] } },
  { id:'game-unscramble', type:'game', title:'Unscramble Sentence', algorithm:'unscramble', icon:'🔀', config:{ sentence:'My sister cooks dinner on Sundays', seconds:45 } },
  { id:'game-word-puzzle', type:'game', title:'Word Puzzle', algorithm:'wordpuzzle', icon:'🧩', config:{ word:'language', hint:'bahasa' } },
  { id:'game-verb-battle', type:'game', title:'Verb Battle', algorithm:'verb', icon:'⚔️', config:{ rounds:[['go','went'],['eat','ate'],['write','wrote']] } },
  { id:'game-grammar-adventure', type:'game', title:'Grammar Adventure', algorithm:'adventure', icon:'🗺️', config:{ rounds:[['I ___ happy.',['am','is','are'],'am'],['She ___ a book.',['read','reads','reading'],'reads'],['We ___ yesterday.',['play','played','plays'],'played']] } },
  { id:'game-treasure-hunt', type:'game', title:'Treasure Hunt', algorithm:'treasure', icon:'💎', config:{ clues:[['I have pages but I am not a tree.','book'],['I fall from clouds.','rain'],['You sit on me.','chair']] } },
  { id:'game-escape-room', type:'game', title:'Escape Room', algorithm:'escape', icon:'🔐', config:{ questions:[['Past tense of “go”','went'],['Plural of “child”','children'],['Opposite of “easy”','difficult']], code:'WCD' } },
  { id:'game-boss-quiz', type:'game', title:'Boss Quiz', algorithm:'boss', icon:'👾', config:{ rounds:[['Meaning of “careful”?',['ceroboh','berhati-hati','berisik'],'berhati-hati'],['She ___ coffee.',['drink','drinks','drinking'],'drinks'],['Past of “see”?',['saw','seen','seed'],'saw'],['A place with airplanes?',['station','airport','harbor'],'airport'],['They ___ studying now.',['is','are','was'],'are']] } },
];

const seedContent = [...vocabulary, ...grammar, ...speaking, ...listening, ...challenges, ...games, ...TENSES, ...TENSE_QUIZ, ...PROFESSIONAL, ...PROFESSIONAL_QUIZ, ...PATH_LESSONS];

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return dateKey(date);
}

export async function openDatabase() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    const db = request.result;
    const content = db.createObjectStore('content', { keyPath:'id' });
    content.createIndex('type', 'type');
    db.createObjectStore('progress', { keyPath:'key' });
    const reviews = db.createObjectStore('reviews', { keyPath:'wordId' });
    reviews.createIndex('dueAt', 'dueAt');
    const results = db.createObjectStore('results', { keyPath:'id', autoIncrement:true });
    results.createIndex('gameId', 'gameId');
    db.createObjectStore('meta', { keyPath:'key' });
  };
  return requestResult(request);
}

export async function initializeDatabase() {
  const db = await openDatabase();
  const read = db.transaction('meta', 'readonly');
  const metaStore = read.objectStore('meta');
  const [currentSeed, currentData] = await Promise.all([
    requestResult(metaStore.get('seedVersion')),
    requestResult(metaStore.get('dataVersion')),
  ]);
  if (currentSeed?.value !== SEED_VERSION) {
    const seedTx = db.transaction(['content','meta'], 'readwrite');
    seedTx.objectStore('content').clear();
    seedContent.forEach(record => seedTx.objectStore('content').put(record));
    seedTx.objectStore('meta').put({ key:'seedVersion', value:SEED_VERSION, seededAt:new Date().toISOString() });
    await transactionDone(seedTx);
  }
  if (currentData?.value !== DATA_VERSION) {
    const dataTx = db.transaction(['progress','reviews','results','meta'], 'readwrite');
    dataTx.objectStore('progress').clear();
    dataTx.objectStore('reviews').clear();
    dataTx.objectStore('results').clear();
    dataTx.objectStore('meta').put({ key:'dataVersion', value:DATA_VERSION, resetAt:new Date().toISOString() });
    await transactionDone(dataTx);
  }
  return db;
}

export async function getContent(type) {
  const db = await openDatabase();
  return requestResult(db.transaction('content').objectStore('content').index('type').getAll(type));
}

export async function getContentById(id) {
  const db = await openDatabase();
  return requestResult(db.transaction('content').objectStore('content').get(id));
}

export async function getLearner() {
  const db = await openDatabase();
  const existing = await requestResult(db.transaction('progress').objectStore('progress').get('learner'));
  return existing || { key:'learner', xp:0, quests:[false,false,false], studyDates:[], currentStreak:0, bestStreak:0, lessonsCompleted:0, challengeBest:0, completedPathLessons:[] };
}

export async function saveLearner(learner) {
  const db = await openDatabase();
  const tx = db.transaction('progress', 'readwrite');
  tx.objectStore('progress').put({ ...learner, key:'learner', updatedAt:new Date().toISOString() });
  await transactionDone(tx);
  return learner;
}

export async function recordLearning(points, activity) {
  const learner = await getLearner();
  const today = dateKey();
  if (!learner.studyDates.includes(today)) {
    learner.studyDates.push(today);
    learner.studyDates = learner.studyDates.slice(-366);
    learner.currentStreak = learner.lastStudyDate === yesterdayKey() ? learner.currentStreak + 1 : 1;
    learner.bestStreak = Math.max(learner.bestStreak, learner.currentStreak);
    learner.lastStudyDate = today;
  }
  learner.xp += points;
  learner.lessonsCompleted += 1;
  learner.lastActivity = activity;
  await saveLearner(learner);
  return learner;
}

export async function reviewVocabulary(wordId, quality = 4) {
  const db = await openDatabase();
  const store = db.transaction('reviews').objectStore('reviews');
  const previous = await requestResult(store.get(wordId)) || { wordId, repetitions:0, interval:0, ease:2.5 };
  if (quality < 3) {
    previous.repetitions = 0;
    previous.interval = 1;
  } else {
    previous.repetitions += 1;
    previous.interval = previous.repetitions === 1 ? 1 : previous.repetitions === 2 ? 6 : Math.round(previous.interval * previous.ease);
    previous.ease = Math.max(1.3, previous.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }
  const due = new Date();
  due.setDate(due.getDate() + previous.interval);
  previous.dueAt = due.toISOString();
  previous.lastReviewedAt = new Date().toISOString();
  const tx = db.transaction('reviews', 'readwrite');
  tx.objectStore('reviews').put(previous);
  await transactionDone(tx);
  return previous;
}

export async function saveGameResult(gameId, score, details = {}) {
  const db = await openDatabase();
  const tx = db.transaction('results', 'readwrite');
  tx.objectStore('results').add({ gameId, score, details, completedAt:new Date().toISOString() });
  await transactionDone(tx);
}

export async function getDatabaseStats() {
  const db = await openDatabase();
  const types = ['vocabulary','grammar','speaking','listening','challenge','game','tense','tenseQuiz','professional','professionalQuiz','pathLesson'];
  const counts = {};
  for (const type of types) counts[type] = await requestResult(db.transaction('content').objectStore('content').index('type').count(type));
  const reviews = await requestResult(db.transaction('reviews').objectStore('reviews').count());
  const results = await requestResult(db.transaction('results').objectStore('results').count());
  return { name:DB_NAME, version:DB_VERSION, counts, reviews, results };
}

export { dateKey };
