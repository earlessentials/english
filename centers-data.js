const tense = (id, title, group, formula, use, positive, negative, question, timeline, mistake, questions) => ({
  id:`tense-${id}`, type:'tense', title, group, formula, use, positive, negative, question, timeline, mistake, questions,
});

export const TENSES = [
  tense('present-simple','Present Simple','Present','S + V1(s/es)','Kebiasaan, fakta, dan jadwal tetap.','She works from home.','She does not work on Sunday.','Does she work from home?','NOW ↻ REPEATS','Jangan tambahkan “be” sebelum verb utama.',[
    ['She ___ every day.',['work','works','worked'],'works'],['Water ___ at 100°C.',['boil','boils','is boiling'],'boils'],['They ___ not like spicy food.',['do','does','did'],'do']]),
  tense('present-continuous','Present Continuous','Present','S + am/is/are + V-ing','Aksi yang sedang terjadi atau situasi sementara.','They are studying now.','They are not studying now.','Are they studying now?','PAST — [NOW…] — FUTURE','Gunakan bentuk -ing setelah am/is/are.',[
    ['Rina ___ right now.',['studies','is studying','studied'],'is studying'],['We ___ for the bus.',['wait','are waiting','waited'],'are waiting'],['I ___ today.',['am not working','do not working','not work'],'am not working']]),
  tense('present-perfect','Present Perfect','Present','S + have/has + V3','Pengalaman atau hasil masa lalu yang relevan sekarang.','I have finished the report.','I have not finished the report.','Have you finished the report?','PAST ●────► NOW','Jangan gunakan waktu lampau spesifik seperti “yesterday”.',[
    ['She ___ the email.',['has sent','sent yesterday','is sending'],'has sent'],['We ___ Bali twice.',['visited','have visited','are visiting'],'have visited'],['I ___ that movie yet.',['did not see','have not seen','am not seeing'],'have not seen']]),
  tense('present-perfect-continuous','Present Perfect Continuous','Present','S + have/has been + V-ing','Aksi yang dimulai di masa lalu dan masih berlangsung.','He has been working since eight.','He has not been working long.','Has he been working since eight?','PAST [──────── NOW]','Gunakan for untuk durasi dan since untuk titik awal.',[
    ['She ___ for two hours.',['has studied','has been studying','studied'],'has been studying'],['They ___ since noon.',['have been waiting','are waited','waited'],'have been waiting'],['We ___ English for a year.',['have been learning','learned','are learn'],'have been learning']]),
  tense('past-simple','Past Simple','Past','S + V2','Aksi yang selesai pada waktu lampau.','We visited Bandung yesterday.','We did not visit Bandung.','Did you visit Bandung?','PAST ●─── NOW','Setelah did/did not, gunakan V1.',[
    ['I ___ there last week.',['go','went','gone'],'went'],['She ___ me yesterday.',['did not call','does not call','not called'],'did not call'],['___ you see him?',['Did','Do','Have'],'Did']]),
  tense('past-continuous','Past Continuous','Past','S + was/were + V-ing','Aksi yang sedang berlangsung pada titik waktu lampau.','I was cooking at seven.','I was not cooking at seven.','Were you cooking at seven?','PAST [●…]── NOW','Was untuk I/he/she/it; were untuk you/we/they.',[
    ['I ___ when you called.',['cooked','was cooking','am cooking'],'was cooking'],['They ___ at eight.',['were playing','played','are playing'],'were playing'],['He ___ when I arrived.',['was not sleeping','did not sleeping','not slept'],'was not sleeping']]),
  tense('past-perfect','Past Perfect','Past','S + had + V3','Aksi yang selesai sebelum aksi lampau lainnya.','The train had left before we arrived.','The train had not left.','Had the train left?','PAST ●1──●2── NOW','Gunakan had hanya untuk aksi yang lebih dulu.',[
    ['She ___ before I came.',['left','had left','has left'],'had left'],['We ___ the work by noon.',['had finished','finished now','have finish'],'had finished'],['I ___ him before then.',['had not met','did not met','have not meet'],'had not met']]),
  tense('past-perfect-continuous','Past Perfect Continuous','Past','S + had been + V-ing','Durasi aksi sebelum titik atau aksi lampau.','They had been waiting for an hour.','They had not been waiting long.','Had they been waiting long?','PAST [────]●── NOW','Fokus pada durasi sebelum kejadian lampau.',[
    ['We ___ for an hour before it came.',['had been waiting','were wait','have waited'],'had been waiting'],['She ___ there for years.',['had been working','was worked','has working'],'had been working'],['It ___ all night.',['had been raining','was rain','has rained'],'had been raining']]),
  tense('future-simple','Future Simple','Future','S + will + V1','Prediksi, keputusan spontan, dan janji.','I will call you tonight.','I will not call tonight.','Will you call tonight?','NOW ───► FUTURE ●','Setelah will selalu gunakan V1.',[
    ['I ___ you later.',['will call','will called','am call'],'will call'],['It ___ fine.',['will be','will is','is be'],'will be'],['She ___ your birthday.',['will not forget','does not forgot','will not forgot'],'will not forget']]),
  tense('future-continuous','Future Continuous','Future','S + will be + V-ing','Aksi yang akan sedang berlangsung pada waktu mendatang.','I will be working at ten.','I will not be working at ten.','Will you be working at ten?','NOW ─── [FUTURE…]','Gunakan “will be”, bukan “will being”.',[
    ['At nine, I ___ .',['will work','will be working','worked'],'will be working'],['Tomorrow, we ___ to Bali.',['will be flying','fly yesterday','will flown'],'will be flying'],['She ___ the office then.',['will not be using','will not using','is not use'],'will not be using']]),
  tense('future-perfect','Future Perfect','Future','S + will have + V3','Aksi yang akan selesai sebelum batas waktu mendatang.','We will have finished by Friday.','We will not have finished by Friday.','Will you have finished by Friday?','NOW ───● DONE by FUTURE','Gunakan by untuk batas waktu.',[
    ['By five, we ___ .',['will finish','will have finished','have finished yesterday'],'will have finished'],['She ___ by noon.',['will have arrived','will arrived','has arrive'],'will have arrived'],['They ___ it by Monday.',['will not have completed','will not completed','do not complete'],'will not have completed']]),
  tense('future-perfect-continuous','Future Perfect Continuous','Future','S + will have been + V-ing','Durasi aksi hingga titik waktu mendatang.','By June, I will have been working here for a year.','I will not have been working here long.','Will you have been working here for a year?','NOW [──────► FUTURE]','Gunakan durasi setelah for.',[
    ['By May, she ___ here for a year.',['will have been working','will be worked','has been work'],'will have been working'],['At noon, they ___ for three hours.',['will have been studying','will studied','are study'],'will have been studying'],['By 2030, we ___ here for a decade.',['will have been living','will living','have lived yesterday'],'will have been living']]),
  tense('future-in-past','Future in the Past','Future in the Past','S + would + V1','Masa depan dilihat dari titik waktu lampau.','She said she would call.','She said she would not call.','Would she call later?','PAST ●──► later','Gunakan would, bukan will, setelah reported past.',[
    ['She said she ___ later.',['will call','would call','called now'],'would call'],['I knew it ___ .',['would rain','will raining','rained tomorrow'],'would rain'],['He promised he ___ .',['would help','will helped','helps yesterday'],'would help']]),
  tense('future-continuous-in-past','Future Continuous in the Past','Future in the Past','S + would be + V-ing','Aksi yang diperkirakan sedang berlangsung setelah titik lampau.','He said he would be working at eight.','He said he would not be working.','Would he be working at eight?','PAST ●──► [later…]','Jangan hilangkan “be” sebelum V-ing.',[
    ['He said he ___ at nine.',['would be working','would working','will worked'],'would be working'],['We knew they ___ all day.',['would be traveling','would traveled','are travel'],'would be traveling'],['She told me she ___ outside.',['would be waiting','would waiting','waited tomorrow'],'would be waiting']]),
  tense('future-perfect-in-past','Future Perfect in the Past','Future in the Past','S + would have + V3','Aksi yang diperkirakan selesai setelah titik lampau.','They expected they would have finished by Friday.','They would not have finished by Friday.','Would they have finished by Friday?','PAST ●──► later DONE','Gunakan V3 setelah would have.',[
    ['She believed she ___ by noon.',['would have finished','would finished','will have finish'],'would have finished'],['We expected they ___ .',['would have arrived','would arrived','had arrive'],'would have arrived'],['I thought he ___ already.',['would have left','would left','has leaving'],'would have left']]),
  tense('future-perfect-continuous-in-past','Future Perfect Continuous in the Past','Future in the Past','S + would have been + V-ing','Durasi yang diperkirakan berlangsung hingga titik setelah masa lampau.','He knew he would have been working there for a year.','He would not have been working long.','Would he have been working for a year?','PAST [────► later]','Urutannya selalu would + have + been + V-ing.',[
    ['He knew he ___ there for a year.',['would have been working','would been working','will have worked'],'would have been working'],['She said she ___ there for a decade.',['would have been living','would have living','had been live'],'would have been living'],['They expected we ___ all semester.',['would have been studying','would be studied','will study'],'would have been studying']]),
  tense('be-going-to','Be Going To Future','Future','S + am/is/are going to + V1','Rencana dan prediksi berdasarkan bukti saat ini.','We are going to launch next month.','We are not going to launch yet.','Are you going to launch next month?','NOW plan ───► FUTURE','Gunakan bentuk be yang sesuai sebelum going to.',[
    ['Look at the clouds! It ___ .',['is going to rain','will raining','goes to rain'],'is going to rain'],['We ___ a new product.',['are going to launch','going launch','are launch'],'are going to launch'],['I ___ for the role.',['am going to apply','going to applied','am apply'],'am going to apply']]),
].map((record,index)=>({ ...record, order:index+1 }));

export const TENSE_QUIZ = TENSES.flatMap(tenseRecord => tenseRecord.questions.map((question, index) => ({
  id:`quiz-${tenseRecord.id}-${index+1}`,
  type:'tenseQuiz',
  tenseId:tenseRecord.id,
  tense:tenseRecord.title,
  prompt:question[0],
  choices:question[1],
  answer:question[2],
}))).slice(0,50);

export const PROFESSIONAL = [
  {
    id:'pro-email', type:'professional', title:'Clear Business Email', icon:'✉️', level:'Advanced', focus:'tone, structure, concise requests',
    scenario:'Ask a client to confirm the revised deadline.',
    model:'Could you please confirm whether the revised Friday deadline works for your team?',
    phrases:['Could you please confirm…','For clarity, …','Please let me know by…'],
    playbook:['State the purpose in the first sentence.','Give one clear action with a specific deadline.','Close by making the next step easy to answer.'],
    examples:[
      { label:'Deadline', text:'Could you please confirm the revised delivery date by Wednesday?', translation:'Bisakah Anda mengonfirmasi tanggal pengiriman yang direvisi paling lambat hari Rabu?' },
      { label:'Follow-up', text:'A quick reminder that we are waiting for the signed agreement.', translation:'Pengingat singkat bahwa kami masih menunggu perjanjian yang telah ditandatangani.' },
      { label:'Clarification', text:'For clarity, the quoted price includes installation and training.', translation:'Untuk memperjelas, harga yang ditawarkan sudah termasuk instalasi dan pelatihan.' },
      { label:'Decision', text:'Please let me know which option you prefer so we can proceed today.', translation:'Mohon beri tahu opsi yang Anda pilih agar kami dapat melanjutkan hari ini.' },
    ],
  },
  {
    id:'pro-meeting', type:'professional', title:'Running Meetings', icon:'🗓️', level:'Advanced', focus:'facilitation and alignment',
    scenario:'Bring a discussion back to the agenda.',
    model:'That is useful context. May I bring us back to the decision we need to make today?',
    phrases:['Let us return to…','Can we align on…','To summarize the decision…'],
    playbook:['Open with the outcome the meeting must produce.','Use neutral language to manage time and interruptions.','End with an owner and deadline for every action.'],
    examples:[
      { label:'Opening', text:'By the end of this meeting, we need to agree on the launch date.', translation:'Pada akhir rapat ini, kita perlu menyepakati tanggal peluncuran.' },
      { label:'Refocus', text:'That is useful context; let us return to the budget decision.', translation:'Itu konteks yang berguna; mari kembali ke keputusan anggaran.' },
      { label:'Alignment', text:'Can we align on the three priorities before we discuss resources?', translation:'Bisakah kita menyepakati tiga prioritas sebelum membahas sumber daya?' },
      { label:'Action item', text:'To confirm, Maya will send the revised forecast by Tuesday.', translation:'Untuk memastikan, Maya akan mengirim proyeksi yang direvisi paling lambat Selasa.' },
    ],
  },
  {
    id:'pro-negotiation', type:'professional', title:'Negotiation Language', icon:'🤝', level:'Advanced', focus:'trade-offs and diplomatic disagreement',
    scenario:'Reject a price without closing the conversation.',
    model:'That figure is beyond our current range, but we are open to discussing scope and payment terms.',
    phrases:['We would need to revisit…','What flexibility do you have on…','We could agree if…'],
    playbook:['Acknowledge the other position before disagreeing.','Explain the constraint without sounding personal.','Offer a conditional trade instead of a flat rejection.'],
    examples:[
      { label:'Price', text:'That figure is beyond our range, but we could discuss a smaller initial scope.', translation:'Angka tersebut di luar kisaran kami, tetapi kita dapat membahas cakupan awal yang lebih kecil.' },
      { label:'Timeline', text:'We could meet that date if the approval process is shortened.', translation:'Kami dapat memenuhi tanggal tersebut jika proses persetujuan dipersingkat.' },
      { label:'Trade-off', text:'If you can extend the contract term, we can reduce the monthly fee.', translation:'Jika Anda dapat memperpanjang masa kontrak, kami dapat mengurangi biaya bulanan.' },
      { label:'Clarify', text:'What flexibility do you have on the payment schedule?', translation:'Seberapa fleksibel jadwal pembayarannya?' },
    ],
  },
  {
    id:'pro-presentation', type:'professional', title:'Executive Presentations', icon:'📊', level:'Advanced', focus:'signposting and concise impact',
    scenario:'Introduce three recommendations to senior leaders.',
    model:'I will focus on three recommendations, their expected impact, and the decision required today.',
    phrases:['The key takeaway is…','This matters because…','My recommendation is…'],
    playbook:['Lead with the conclusion instead of the background.','Connect every number to a business implication.','Finish with one explicit decision or request.'],
    examples:[
      { label:'Opening', text:'The key takeaway is that retention improved while acquisition costs fell.', translation:'Inti utamanya adalah retensi meningkat sementara biaya akuisisi menurun.' },
      { label:'Evidence', text:'Customer complaints fell by eighteen percent after the process change.', translation:'Keluhan pelanggan turun delapan belas persen setelah perubahan proses.' },
      { label:'Implication', text:'This matters because it gives us capacity to serve two new markets.', translation:'Ini penting karena memberi kita kapasitas untuk melayani dua pasar baru.' },
      { label:'Ask', text:'I am asking for approval to begin phase one next Monday.', translation:'Saya meminta persetujuan untuk memulai fase satu Senin depan.' },
    ],
  },
  {
    id:'pro-interview', type:'professional', title:'Professional Interviews', icon:'💼', level:'Advanced', focus:'evidence-based answers',
    scenario:'Explain a project challenge using STAR.',
    model:'The deadline moved forward by two weeks, so I reprioritized the scope and coordinated daily risk checks.',
    phrases:['The situation was…','My responsibility was…','The measurable result was…'],
    playbook:['Set the situation in one or two sentences.','Spend most of the answer on your own actions.','Close with a measurable result and what you learned.'],
    examples:[
      { label:'Situation', text:'Our largest client requested delivery two weeks earlier than planned.', translation:'Klien terbesar kami meminta pengiriman dua minggu lebih awal dari rencana.' },
      { label:'Action', text:'I reprioritized the scope and introduced a daily risk review.', translation:'Saya memprioritaskan ulang cakupan dan memperkenalkan tinjauan risiko harian.' },
      { label:'Result', text:'We delivered on time and reduced defects by twelve percent.', translation:'Kami mengirim tepat waktu dan mengurangi cacat sebesar dua belas persen.' },
      { label:'Weakness', text:'I used to overcommit, so I now confirm priorities before accepting new work.', translation:'Dulu saya terlalu banyak berkomitmen, jadi sekarang saya memastikan prioritas sebelum menerima pekerjaan baru.' },
    ],
  },
  {
    id:'pro-networking', type:'professional', title:'Strategic Networking', icon:'🌐', level:'Advanced', focus:'introductions and follow-up',
    scenario:'Introduce yourself at an industry event.',
    model:'I lead product operations for an education platform, with a focus on sustainable growth and learner retention.',
    phrases:['I specialize in…','What brings you to…','I would enjoy continuing this conversation.'],
    playbook:['Introduce your role, field, and current focus in one breath.','Ask an open question connected to the event.','Follow up with a specific reason to continue talking.'],
    examples:[
      { label:'Introduction', text:'I work in product operations, focusing on learner retention.', translation:'Saya bekerja di operasional produk, dengan fokus pada retensi pelajar.' },
      { label:'Question', text:'What challenge is your team most interested in solving this year?', translation:'Tantangan apa yang paling ingin diselesaikan tim Anda tahun ini?' },
      { label:'Connection', text:'Your point about onboarding connects closely with a project I am leading.', translation:'Poin Anda tentang orientasi pengguna sangat berkaitan dengan proyek yang sedang saya pimpin.' },
      { label:'Follow-up', text:'I enjoyed our conversation; may I send you the research I mentioned?', translation:'Saya menikmati percakapan kita; bolehkah saya mengirim riset yang tadi saya sebutkan?' },
    ],
  },
];

const proQuestion = (id, moduleId, prompt, choices, answer) => ({ id:`pro-quiz-${id}`, type:'professionalQuiz', moduleId, prompt, choices, answer });
export const PROFESSIONAL_QUIZ = [
  proQuestion(1,'pro-email','Which request is most professional?',['Send it today.','Could you please send the revised file by 3 p.m.?','I need this now.'],'Could you please send the revised file by 3 p.m.?'),
  proQuestion(2,'pro-email','Best concise email opening?',['I hope this email finds you in good health and happiness forever.','I am writing to confirm Friday’s delivery date.','Hey, about that thing.'],'I am writing to confirm Friday’s delivery date.'),
  proQuestion(3,'pro-email','Best diplomatic reminder?',['You forgot again.','A quick reminder that the report is due tomorrow.','Why is this late?'],'A quick reminder that the report is due tomorrow.'),
  proQuestion(4,'pro-meeting','How do you interrupt politely?',['Stop talking.','May I add one point before we move on?','You are wrong.'],'May I add one point before we move on?'),
  proQuestion(5,'pro-meeting','Best way to confirm a decision?',['So, we have agreed to launch on Monday.','Whatever.','Maybe we did something.'],'So, we have agreed to launch on Monday.'),
  proQuestion(6,'pro-meeting','Best agenda transition?',['Next, let us look at the budget.','Forget that.','New topic now.'],'Next, let us look at the budget.'),
  proQuestion(7,'pro-negotiation','Most constructive disagreement?',['That will never work.','I see the rationale, but the current timeline creates a quality risk.','No.'],'I see the rationale, but the current timeline creates a quality risk.'),
  proQuestion(8,'pro-negotiation','Best conditional offer?',['We could reduce the price if the contract term is extended.','Pay more.','Take it or leave it.'],'We could reduce the price if the contract term is extended.'),
  proQuestion(9,'pro-negotiation','Ask for flexibility professionally:',['Can you move?','What flexibility do you have on the implementation date?','Change it.'],'What flexibility do you have on the implementation date?'),
  proQuestion(10,'pro-presentation','Best executive signpost?',['There are three points to consider.','I have lots to say.','This slide is busy.'],'There are three points to consider.'),
  proQuestion(11,'pro-presentation','Best recommendation language?',['Maybe do this, I guess.','Based on the evidence, I recommend option B.','Option B is cool.'],'Based on the evidence, I recommend option B.'),
  proQuestion(12,'pro-presentation','Best closing request?',['That is all.','I am asking for approval to begin phase one on Monday.','Thanks, bye.'],'I am asking for approval to begin phase one on Monday.'),
  proQuestion(13,'pro-interview','Strongest achievement statement?',['I worked hard.','I reduced processing time by 25% in six months.','I did many things.'],'I reduced processing time by 25% in six months.'),
  proQuestion(14,'pro-interview','STAR stands for:',['Situation, Task, Action, Result','Skill, Time, Aim, Review','Story, Talk, Answer, Response'],'Situation, Task, Action, Result'),
  proQuestion(15,'pro-interview','Best way to discuss a weakness?',['I have none.','I used to overcommit, so I now confirm priorities before accepting new work.','I work too hard.'],'I used to overcommit, so I now confirm priorities before accepting new work.'),
  proQuestion(16,'pro-networking','Best professional introduction?',['I need a job.','I work in product operations, focusing on learner retention.','Hello, remember me.'],'I work in product operations, focusing on learner retention.'),
  proQuestion(17,'pro-networking','Best follow-up?',['Let us connect sometime.','I enjoyed our discussion about retention; may I send you the research I mentioned?','Please help me.'],'I enjoyed our discussion about retention; may I send you the research I mentioned?'),
  proQuestion(18,'pro-networking','Best question at an event?',['What are you working on this quarter?','How much do you earn?','Can you hire me?'],'What are you working on this quarter?'),
  proQuestion(19,'pro-email','Best subject line?',['Hello','Decision needed: Q3 campaign budget by Friday','Important stuff'],'Decision needed: Q3 campaign budget by Friday'),
  proQuestion(20,'pro-meeting','Best action-item wording?',['Someone should do it.','Maya will send the revised forecast by Tuesday.','We will see.'],'Maya will send the revised forecast by Tuesday.'),
];
