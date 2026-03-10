// ============================================================
// data.js — All static content: lessons, topics, library, map
// ============================================================

// Utility: escapes a string for safe inline HTML attribute embedding
export const escAttr = (str) =>
  String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ─── DETAILED LESSONS: Days 1–5 ────────────────────────────
export const DETAILED_LESSONS = [
  {
    day: 1,
    title: "I Primi Incontri 👋",
    topic: "Saluti e Alfabeto Base",
    theory: {
      intro: "Ciao! Iniziamo il nostro viaggio. In Corea, salutare bene significa fare una prima impressione perfetta, specialmente se incontri altri cosplayer o se entri nel tuo primo PC Bang (sala gaming)! Inoltre, il coreano usa l'Hangul (한글), un alfabeto a 'blocchi' logici facilissimo inventato nel 1443. Ad esempio, N+A+M = 남 (Nam, come Nam Joo-hyuk!). Iniziamo ad allenare l'orecchio e le buone maniere!",
      concept: "Il coreano ha vari livelli di formalità. Useremo la formalità standard (요 - 'yo' / 니다 - 'nida'), ideale per parlare con persone nuove in palestra, agli eventi cosplay o per strada. Ricorda: fai sempre un leggero inchino con la testa! Celebra ogni sillaba che riconosci, proprio come un 'level up' in League of Legends!",
      builderRule: "Inizia con un sorriso! La combinazione perfetta per rompere il ghiaccio è: Leggero inchino + 안녕하세요 (Ciao/Buongiorno). Usalo anche quando entri in palestra o in fumetteria.",
      examples: [
        { hangul: "안녕하세요", romaji: "Annyeonghaseyo", eng: "Ciao / Buongiorno (Formale)", context: "Da usare sempre. Entrando in fiera, al PC Bang o in palestra. ☀️" },
        { hangul: "감사합니다", romaji: "Gamsahamnida", eng: "Grazie", context: "Molto educato e standard. 🙏" },
        { hangul: "죄송합니다", romaji: "Joesonghamnida", eng: "Mi scusi / Scusa", context: "Per chiedere perdono se si urta qualcuno facendo Cosplay o in palestra. 🙇‍♀️" },
        { hangul: "안녕히 계세요", romaji: "Annyeonghi gyeseyo", eng: "Arrivederci (a chi resta)", context: "Tu te ne vai dalla fumetteria, il negoziante resta. 🚶‍♀️" },
        { hangul: "안녕히 가세요", romaji: "Annyeonghi gaseyo", eng: "Arrivederci (a chi va)", context: "L'altro se ne va e tu resti. 👋" },
        { hangul: "화이팅", romaji: "Hwaiting", eng: "Forza! / Dai!", context: "Il 'Fighting' usato nei K-drama, in palestra o per caricarsi su LoL! 💪" }
      ],
      culture: "Fai attenzione a 'Gyeseyo' vs 'Gaseyo'. 'Gye' significa 'restare (in pace)', 'Ga' significa 'andare (in pace)'. Sbagliarli è il classico errore degli stranieri. Un'altra chicca: l'Hangul si legge da sinistra a destra e dall'alto verso il basso all'interno di un blocco sillabico."
    },
    exercises: [
      { type: 'multiple_choice', question: "Entri in una palestra a Seoul e incroci il personal trainer. Cosa dici per prima cosa?", options: ["Joesonghamnida","Annyeonghaseyo","Gamsahamnida"], optionsHangul: ["죄송합니다","안녕하세요","감사합니다"], answer: 1, conceptTag: "Saluti Palestra", feedback_incorrect: "Quando incontri qualcuno, usa sempre 'Annyeonghaseyo'.", tip: "'Annyeonghaseyo' letteralmente significa 'Sei in pace?' ed è perfetto per la palestra." },
      { type: 'listen', question: "Ascolta l'audio. Cosa significa questa frase usatissima nei drama?", audioHangul: "감사합니다", options: ["Grazie","Ciao","Forza!"], answer: 0, conceptTag: "Ascolto", feedback_incorrect: "La risposta giusta era 'Grazie'.", tip: "Ascolta il suono 'Gamsa'. Gamsahamnida è il grazie universale." },
      { type: 'speak', question: "Tocca il microfono e dì 'Ciao' in coreano (Formale).", expectedRomaji: ["annyeonghaseyo","annyeong"], expectedHangul: ["안녕하세요"], conceptTag: "Pronuncia", feedback_incorrect: "Prova ad articolare bene: An-nyeong-ha-se-yo.", tip: "Sei all'inizio, prenditi il tuo tempo per pronunciare ogni sillaba." },
      { type: 'conversation', context: "Scenario: Stai passeggiando per Seoul e urti per sbaglio una persona. È Nam Joo-hyuk!", question: "Qual è la reazione immediata più educata prima di svenire?", options: ["Annyeonghi gaseyo","Joesonghamnida","Hwaiting"], optionsHangul: ["안녕히 가세요","죄송합니다","화이팅"], answer: 1, conceptTag: "Scuse", feedback_incorrect: "Dovevi chiedere scusa!", tip: "'Joesonghamnida' è perfetto. Un rapido cenno del capo aiuta sempre." },
      { type: 'multiple_choice', question: "Stai uscendo dall'Animate Store. Il commesso resta dentro. Cosa gli dici?", options: ["Annyeonghi gyeseyo","Annyeonghi gaseyo","Joesonghamnida"], optionsHangul: ["안녕히 계세요","안녕히 가세요","죄송합니다"], answer: 0, conceptTag: "Arrivederci (a chi resta)", feedback_incorrect: "Attenzione a chi va e chi resta!", tip: "Tu te ne vai, lui RESTA. Quindi gli auguri di restare in pace: Gye-se-yo." },
      { type: 'listen', question: "La tua amica sta uscendo dalla tua camera d'hotel mentre tu resti a preparare il cosplay.", audioHangul: "안녕히 계세요", options: ["Arrivederci (a te che resti)","Grazie per l'ospitalità","Arrivederci (a te che vai)"], answer: 0, conceptTag: "Ascolto Arrivederci", feedback_incorrect: "Ha usato 'Gyeseyo'.", tip: "Dato che tu resti in camera, lei ti dice 'Annyeonghi gyeseyo'." },
      { type: 'speak', question: "Il tuo Support su LoL ti ha appena curato. Dì 'Grazie' in modo formale.", expectedRomaji: ["gamsahamnida","kamsahamnida"], expectedHangul: ["감사합니다"], conceptTag: "Pronuncia LoL", feedback_incorrect: "Prova: Gam-sa-ham-ni-da.", tip: "Pronuncia: Gam-sa-ham-ni-da." },
      { type: 'conversation', context: "Il tuo compagno d'allenamento in palestra sta per alzare il suo record di peso.", question: "Come lo incoraggi in stile coreano?", options: ["Annyeonghi gaseyo","Hwaiting","Joesonghamnida"], optionsHangul: ["안녕히 가세요","화이팅","죄송합니다"], answer: 1, conceptTag: "Incoraggiamento", feedback_incorrect: "Dovevi fare il tifo per lui!", tip: "Usa 'Hwaiting!' alzando il pugno." },
      { type: 'multiple_choice', question: "Un amico coreano ti dice 'Annyeonghi gaseyo'. Cosa sta succedendo?", options: ["Lui sta entrando in palestra.","Tu te ne stai andando, lui resta.","State per giocare a LoL."], optionsHangul: ["","",""], answer: 1, conceptTag: "Comprensione contesto", feedback_incorrect: "Ti ha detto 'Ga' (vai).", tip: "Se ti dice 'Ga-seyo', significa che tu sei quella che sta andando via!" },
      { type: 'speak', question: "Poni rimedio a un errore. Dì 'Mi scusi / Chiedo perdono'.", expectedRomaji: ["joesonghamnida","choesonghamnida"], expectedHangul: ["죄송합니다"], conceptTag: "Fluidità", feedback_incorrect: "Prova con: Joe-song-ham-ni-da.", tip: "È una parola lunga, ma ti salverà in molte situazioni!" }
    ]
  },
  {
    day: 2,
    title: "Passioni & Palestra 🏋️‍♀️",
    topic: "Presentazioni e Hobby",
    theory: {
      intro: "Oggi impariamo a presentarti in modo unico. I coreani amano sapere chi sei e le tue passioni (palestra, cosplay, gaming). Continua a capire l'Hangul: la vocale va sempre a destra (es. ㅏ) o sotto (es. ㅗ) la consonante. Es: ㄹ+ㅗ+ㄹ = 롤 (LoL)!",
      concept: "La struttura 'Io sono + [nome/nazionalità]' in coreano: 저는 [X]예요/이에요. Nota: se la parola finisce in vocale → 예요. Se in consonante → 이에요. Es: 사라예요 (sono Sara) vs 학생이에요 (sono studente).",
      builderRule: "Usa 저는 사라예요 come incipit. Poi aggiungi 취미는 + [hobby] + 이에요/예요. Ex: 취미는 코스프레예요 = Il mio hobby è il cosplay!",
      examples: [
        { hangul: "저는 사라예요", romaji: "Jeoneun Sara-yeyo", eng: "Io sono Sara", context: "Presentazione classica. Sostituisci 'Sara' col tuo nome." },
        { hangul: "이탈리아 사람이에요", romaji: "Itallia saramieyo", eng: "Sono italiana", context: "Nazionalità → finisce in consonante → 이에요." },
        { hangul: "제 취미는 운동이에요", romaji: "Je chwimineun undong-ieyo", eng: "Il mio hobby è la palestra/allenarmi", context: "운동 (Undong) finisce in consonante → 이에요." },
        { hangul: "제 취미는 코스프레예요", romaji: "Je chwimineun koseupeure-yeyo", eng: "Il mio hobby è il cosplay", context: "코스프레 finisce in vocale → 예요." },
        { hangul: "리그 오브 레전드 좋아해요?", romaji: "Rigeu obeu lejeondeu joahaeyo?", eng: "Ti piace League of Legends?", context: "Ottimo per rompere il ghiaccio al PC Bang." }
      ],
      culture: "In Corea, chiedere età, stato civile e lavoro è normale e non maleducato: è il modo per capire come rivolgersi (tu formale/informale). Non offenderti se ti chiedono quanti anni hai!"
    },
    exercises: [
      { type: 'multiple_choice', question: "Come dici 'Sono italiana' in coreano? (Finisce in consonante!)", options: ["이탈리아 사람예요","이탈리아 사람이에요","이탈리아 사람있어요"], optionsHangul: ["이탈리아 사람예요","이탈리아 사람이에요","이탈리아 사람있어요"], answer: 1, conceptTag: "Struttura -이에요/-예요", feedback_incorrect: "Finisce in consonante → 이에요.", tip: "Consonante finale → 이에요. Vocale finale → 예요." },
      { type: 'listen', question: "Ascolta. Cosa si presenta in questa frase?", audioHangul: "제 취미는 운동이에요", options: ["Il mio hobby è la palestra","Il mio nome è Undong","Mi piace dormire"], answer: 0, conceptTag: "Ascolto Hobby", feedback_incorrect: "운동 = allenamento/palestra.", tip: "취미는 = il mio hobby è." },
      { type: 'speak', question: "Presentati: dì 'Io sono [il tuo nome]' in coreano.", expectedRomaji: ["jeoneun","jeonun"], expectedHangul: ["저는"], conceptTag: "Pronuncia Presentazione", feedback_incorrect: "Inizia con 저는 (Jeoneun).", tip: "저는 = Io (formale). Poi il nome + 예요/이에요." },
      { type: 'conversation', context: "Sei al PC Bang e un ragazzo coreano ti chiede cosa fai nel tempo libero.", question: "Come dici 'Il mio hobby è il cosplay'?", options: ["제 취미는 코스프레예요","저는 코스프레이에요","취미는 좋아해요"], optionsHangul: ["제 취미는 코스프레예요","저는 코스프레이에요","취미는 좋아해요"], answer: 0, conceptTag: "Hobby Cosplay", feedback_incorrect: "제 취미는 + [hobby] + 예요/이에요.", tip: "코스프레 finisce in vocale (레) → 예요." },
      { type: 'multiple_choice', question: "Come chiedi a un coreano se gli piace League of Legends?", options: ["리그 오브 레전드 있어요?","리그 오브 레전드 좋아해요?","리그 오브 레전드 가세요?"], optionsHangul: ["리그 오브 레전드 있어요?","리그 오브 레전드 좋아해요?","리그 오브 레전드 가세요?"], answer: 1, conceptTag: "Domande Hobby", feedback_incorrect: "좋아하다 = piacere/amare.", tip: "좋아해요? = Ti piace?" },
      { type: 'speak', question: "Dì 'Il mio hobby è il cosplay' in coreano.", expectedRomaji: ["koseupeure","koseupeureyeyo"], expectedHangul: ["코스프레예요","제 취미는 코스프레예요"], conceptTag: "Pronuncia Cosplay", feedback_incorrect: "Prova: Je chwimineun koseupeure-yeyo.", tip: "코스프레 = cosplay (prestito fonetico dall'inglese)." }
    ]
  },
  {
    day: 3,
    title: "Al Ristorante Coreano 🍜",
    topic: "Ordinare Cibo e Sopravvivenza",
    theory: {
      intro: "Terzo giorno, andiamo a mangiare! La cucina coreana è favolosa ma può essere piccantissima. Oggi impariamo a ordinare, chiedere aiuto e gestire le emergenze culinarie. Pronto per il tuo primo 삼겹살 (samgyeopsal)?",
      concept: "Nei ristoranti coreani spesso si chiama il cameriere gridando '저기요!' (Jeogiyo! = Scusi!). I menu hanno spesso foto, quindi puoi puntare e dire '이거 주세요' (Igeo juseyo = Questo, per favore). Semplice!",
      builderRule: "La formula magica: [Cosa vuoi] + 주세요 (juseyo = per favore/dammi). Es: 물 주세요 (Mul juseyo) = Acqua per favore. 비빔밥 주세요 = Un Bibimbap per favore.",
      examples: [
        { hangul: "저기요!", romaji: "Jeogiyo!", eng: "Scusi! (chiamare il cameriere)", context: "Alza la mano o premi il campanello. 🔔" },
        { hangul: "이거 주세요", romaji: "Igeo juseyo", eng: "Questo, per favore", context: "Indica la foto nel menu. Funziona sempre!" },
        { hangul: "안 맵게 해주세요", romaji: "An maepge haejuseyo", eng: "Non piccante, per favore", context: "Salva lo stomaco. 🌶️ → ❌" },
        { hangul: "물 좀 주세요", romaji: "Mul jom juseyo", eng: "Acqua, per favore", context: "A volte il distributore d'acqua è self-service." },
        { hangul: "얼마예요?", romaji: "Eolmayeyo?", eng: "Quanto costa?", context: "Universale. Aggiungi un sorriso e funziona ovunque." }
      ],
      culture: "Il cibo coreano tipicamente arriva con molti piattini di contorno gratuiti chiamati 'Banchan' (반찬). Non è maleducato prenderne di più. Ricorda: non conficcate le bacchette verticalmente nel riso, è un gesto funebre."
    },
    exercises: [
      { type: 'multiple_choice', question: "Vuoi chiamare il cameriere. Cosa gridi?", options: ["주세요","저기요!","감사합니다"], optionsHangul: ["주세요","저기요!","감사합니다"], answer: 1, conceptTag: "Ristorante Base", feedback_incorrect: "저기요! è il richiamo universale.", tip: "Alza la mano mentre dici 저기요!" },
      { type: 'listen', question: "Cosa sta ordinando questa persona?", audioHangul: "이거 주세요", options: ["Questo, per favore","L'acqua, per favore","Il conto, per favore"], answer: 0, conceptTag: "Ordinare", feedback_incorrect: "이거 = questo, 주세요 = per favore.", tip: "이거 주세요 + indicare la foto = combo perfetta." },
      { type: 'speak', question: "Dì 'Acqua, per favore'.", expectedRomaji: ["mul juseyo","mul jom juseyo"], expectedHangul: ["물 주세요","물 좀 주세요"], conceptTag: "Pronuncia Ristorante", feedback_incorrect: "Mul (물) = acqua. Juseyo (주세요) = per favore.", tip: "물 좀 주세요 — 좀 rende la richiesta più gentile." },
      { type: 'conversation', context: "Sei in un ristorante e il tuo cibo è MOLTO piccante. Stai già soffrendo.", question: "Come chiedi la prossima volta di non renderlo piccante?", options: ["안 맵게 해주세요","매운 거 주세요","물 주세요"], optionsHangul: ["안 맵게 해주세요","매운 거 주세요","물 주세요"], answer: 0, conceptTag: "Preferenze Cibo", feedback_incorrect: "안 맵게 = non piccante!", tip: "안 (an) = negazione. 맵다 = essere piccante." },
      { type: 'multiple_choice', question: "Come chiedi quanto costa qualcosa?", options: ["이거 있어요?","얼마예요?","이거 뭐예요?"], optionsHangul: ["이거 있어요?","얼마예요?","이거 뭐예요?"], answer: 1, conceptTag: "Prezzi", feedback_incorrect: "얼마예요? = Quanto costa?", tip: "얼마 (eolma) = quanto (di prezzo)." },
      { type: 'speak', question: "Chiama il cameriere ad alta voce!", expectedRomaji: ["jeogiyo"], expectedHangul: ["저기요"], conceptTag: "Pronuncia Chiamata", feedback_incorrect: "Jeo-gi-yo! Con energia!", tip: "In Korea si dice abbastanza forte — non è maleducato!" }
    ]
  },
  {
    day: 4,
    title: "Shopping & Acquisti 🛍️",
    topic: "Negozi e Mercati",
    theory: {
      intro: "Quarto giorno! Oggi sei pronta per Myeongdong, Dongdaemun e tutti i negozi di stoffe per i tuoi cosplay. Impariamo le frasi essenziali per fare shopping come una vera coreana.",
      concept: "Le parole chiave dello shopping: 있어요? (isseoyo? = c'è/avete?), 없어요 (eopseoyo = non c'è), 이거 (igeo = questo), 저거 (jeo-geo = quello lì). Con queste quattro parole puoi già fare shopping.",
      builderRule: "[Oggetto] + 있어요? per chiedere se ce l'hanno. Es: '이 색 있어요?' (I saek isseoyo?) = 'Avete questo colore?' Poi [taglia/colore] + 주세요 per ordinare.",
      examples: [
        { hangul: "이거 있어요?", romaji: "Igeo isseoyo?", eng: "Avete questo? / C'è?", context: "Mostra la foto del prodotto che cerchi." },
        { hangul: "다른 색 있어요?", romaji: "Dareun saek isseoyo?", eng: "Avete un altro colore?", context: "Fondamentale per trovare il tessuto giusto per il cosplay." },
        { hangul: "얼마예요?", romaji: "Eolmayeyo?", eng: "Quanto costa?", context: "Funziona ovunque." },
        { hangul: "조금만 깎아주세요", romaji: "Jogeumman kkakajuseyo", eng: "Fammi un piccolo sconto", context: "Al mercato di Dongdaemun — usa voce dolce! 🥺" },
        { hangul: "이거 입어봐도 돼요?", romaji: "Igeo ibeobwado dwaeyo?", eng: "Posso provarlo?", context: "Per abiti e costumi." }
      ],
      culture: "A Dongdaemun trovi stoffe e materiali cosplay a prezzi ottimi ma bisogna contrattare. Il mercato è aperto di notte! Myeongdong è più turistico ma ottimo per K-beauty. Porta contanti per i mercatini."
    },
    exercises: [
      { type: 'multiple_choice', question: "Sei a Dongdaemun e vuoi sapere se hanno un certo tessuto. Cosa dici?", options: ["주세요","이거 있어요?","저기요"], optionsHangul: ["주세요","이거 있어요?","저기요"], answer: 1, conceptTag: "Shopping Base", feedback_incorrect: "있어요? = c'è/avete?", tip: "있어요? è il modo più diretto per chiedere disponibilità." },
      { type: 'listen', question: "Il negoziante dice una frase. Cosa significa?", audioHangul: "없어요", options: ["Non c'è / Non abbiamo","Sì, c'è","Quanto costa?"], answer: 0, conceptTag: "Risposta Negativa", feedback_incorrect: "없어요 = non c'è.", tip: "없다 (eopda) = non esistere/non avere." },
      { type: 'speak', question: "Chiedi 'Avete un altro colore?'", expectedRomaji: ["dareun saek isseoyo"], expectedHangul: ["다른 색 있어요?"], conceptTag: "Pronuncia Shopping", feedback_incorrect: "Da-reun saek i-sseo-yo?", tip: "다른 (dareun) = diverso/altro. 색 (saek) = colore." },
      { type: 'conversation', context: "Hai trovato la stoffe perfetta per il tuo cosplay ma è un po' cara. Il mercante sembra disponibile.", question: "Come provi a ottenere uno sconto?", options: ["조금만 깎아주세요","이거 있어요?","입어봐도 돼요?"], optionsHangul: ["조금만 깎아주세요","이거 있어요?","입어봐도 돼요?"], answer: 0, conceptTag: "Contrattazione", feedback_incorrect: "깎아주세요 = fai uno sconto!", tip: "Sorridi e usa una voce leggermente supplichevole. Funziona!" },
      { type: 'multiple_choice', question: "Come chiedi di provare un abito?", options: ["이거 입어봐도 돼요?","이거 주세요","다른 색 있어요?"], optionsHangul: ["이거 입어봐도 돼요?","이거 주세요","다른 색 있어요?"], answer: 0, conceptTag: "Provare Abiti", feedback_incorrect: "입어봐도 돼요? = Posso provarlo?", tip: "입다 (ipda) = indossare. 봐도 돼요? = è OK se guardo/provo?" },
      { type: 'speak', question: "Chiedi quanto costa.", expectedRomaji: ["eolmayeyo"], expectedHangul: ["얼마예요?"], conceptTag: "Prezzi Pronuncia", feedback_incorrect: "Eol-ma-ye-yo?", tip: "얼마 (eolma) = quanto? È la parola magica!" }
    ]
  },
  {
    day: 5,
    title: "Emergenze & Direzioni 🗺️",
    topic: "Sopravvivenza Urbana",
    theory: {
      intro: "Giorno finale della base! Oggi impariamo le frasi di emergenza e come orientarsi nella metro di Seoul (una delle più efficienti al mondo!). Dopo questo sei pronta per muoverti da sola.",
      concept: "Per chiedere dove si trova qualcosa: [Luogo] + 어디예요? (eodiyeyo?) = Dov'è [luogo]? Es: 화장실 어디예요? = Dov'è il bagno? La metro di Seoul ha tutto in inglese ma saper leggere l'Hangul aiuta moltissimo.",
      builderRule: "[Destinazione] + 에 가주세요 per i taxi. Es: 명동에 가주세요 = Vada a Myeongdong per favore. Per la metro: [Stazione] + 까지 주세요 = Un biglietto fino a [stazione] per favore.",
      examples: [
        { hangul: "화장실 어디예요?", romaji: "Hwajangsil eodiyeyo?", eng: "Dov'è il bagno?", context: "La più importante in assoluto. Impararla subito! 🚻" },
        { hangul: "도와주세요", romaji: "Dowajuseyo", eng: "Aiuto! / Mi aiuti per favore", context: "Emergenza vera — parla forte e chiaro." },
        { hangul: "한국어 잘 못해요", romaji: "Hangugeo jal mothaeyo", eng: "Non parlo bene il coreano", context: "Chiedi clemenza se parlano a raffica." },
        { hangul: "명동에 가주세요", romaji: "Myeongdong-e gajuseyo", eng: "Vada a Myeongdong, per favore", context: "Per i taxi. Sostituisci la destinazione." },
        { hangul: "괜찮아요", romaji: "Gwaenchanayo", eng: "Va bene / Sto bene", context: "Perfetto per dire 'No grazie' o 'Nessun problema'." }
      ],
      culture: "La T-money card (ricaricabile) funziona su tutta la metro, i bus e anche in molti negozi. Comprala all'aeroporto o in qualsiasi convenienza store (GS25, CU, 7-Eleven). Risparmia tempo e denaro!"
    },
    exercises: [
      { type: 'multiple_choice', question: "Emergenza! Hai bisogno del bagno adesso. Cosa chiedi?", options: ["도와주세요","화장실 어디예요?","괜찮아요"], optionsHangul: ["도와주세요","화장실 어디예요?","괜찮아요"], answer: 1, conceptTag: "Emergenze Base", feedback_incorrect: "화장실 어디예요? = Dov'è il bagno?", tip: "화장실 (hwajangsil) = bagno/toilette." },
      { type: 'listen', question: "Cosa dice questa persona?", audioHangul: "한국어 잘 못해요", options: ["Non parlo bene il coreano","Non sto bene","Non so dove sono"], answer: 0, conceptTag: "Scuse Linguistiche", feedback_incorrect: "한국어 잘 못해요 = Non parlo bene il coreano.", tip: "못하다 (mothada) = non saper fare bene qualcosa." },
      { type: 'speak', question: "Chiedi dove si trova il bagno.", expectedRomaji: ["hwajangsil eodiyeyo"], expectedHangul: ["화장실 어디예요?"], conceptTag: "Pronuncia Direzioni", feedback_incorrect: "Hwa-jang-sil eo-di-ye-yo?", tip: "화장실 = bagno. 어디예요? = dov'è?" },
      { type: 'conversation', context: "Sei in taxi e vuoi andare a Myeongdong per fare shopping.", question: "Come lo dici all'autista?", options: ["명동에 가주세요","명동 어디예요?","명동 주세요"], optionsHangul: ["명동에 가주세요","명동 어디예요?","명동 주세요"], answer: 0, conceptTag: "Taxi", feedback_incorrect: "에 가주세요 = vada a [destinazione] per favore.", tip: "[Destinazione] + 에 가주세요 = la formula taxi universale." },
      { type: 'multiple_choice', question: "Qualcuno ti chiede come stai dopo una caduta. Come dici 'Va bene, sto bene'?", options: ["도와주세요","화이팅","괜찮아요"], optionsHangul: ["도와주세요","화이팅","괜찮아요"], answer: 2, conceptTag: "Rassicurazione", feedback_incorrect: "괜찮아요 = va bene!", tip: "괜찮아요 è anche un modo gentile per rifiutare qualcosa." },
      { type: 'speak', question: "Chiedi aiuto dicendo 'Aiuto! / Mi aiuti per favore'.", expectedRomaji: ["dowajuseyo"], expectedHangul: ["도와주세요"], conceptTag: "Pronuncia Emergenza", feedback_incorrect: "Do-wa-ju-se-yo!", tip: "도와주세요 — ricordatelo bene, speriamo non serva!" }
    ]
  }
];

// ─── ADVANCED TOPICS: Days 6–45 ────────────────────────────
export const ADVANCED_TOPICS = [
  { name: "Start-Up Quotes", hangul: "지도 없는 항해를 떠나는 거예요", romaji: "Jido eomneun hanghaereul tteonaneun geoyeyo", eng: "Partiamo per un viaggio senza mappa", scenario: "Vuoi citare la famosa frase di Start-Up per incoraggiare un amico.", clue: "항해 (hanghae) = viaggio/navigazione" },
  { name: "Gym Rat: Workout", hangul: "몇 세트 남았어요?", romaji: "Myeot sete namasseoyo?", eng: "Quante serie ti mancano?", scenario: "Vuoi usare un macchinario occupato in palestra.", clue: "세트 (sete) = set/serie in palestra" },
  { name: "Even If This Love Disappears", hangul: "내일의 너를 잊는다 해도", romaji: "Naeirui neoreul inneunda haedo", eng: "Anche se dovessi dimenticarti domani", scenario: "Parli del film super triste con le tue amiche.", clue: "잊다 (itda) = dimenticare" },
  { name: "LoL: Gankkami!", hangul: "갱 와주세요!", romaji: "Gaeng wajuseyo!", eng: "Vieni a gankarmi per favore!", scenario: "Sei sotto torre in Mid e chiedi aiuto al Jungler.", clue: "갱 (gaeng) = gank (arrivo a sorpresa)" },
  { name: "Cosplay: Parrucca", hangul: "이 가발 어디서 샀어요?", romaji: "I gabal eodiseo sasseoyo?", eng: "Dove hai comprato questa parrucca?", scenario: "Sei in fiera e ammiri l'acconciatura di un'altra cosplayer.", clue: "가발 (gabal) = parrucca" },
  { name: "Fangirl di Nam Joo-hyuk", hangul: "남주혁 진짜 멋있어", romaji: "Nam Ju-hyeok jinjja meosisseo", eng: "Nam Joo-hyuk è davvero bellissimo/figo", scenario: "Stai guardando il suo ultimo Drama e commenti con entusiasmo.", clue: "멋있어 (meosisseo) = essere figo/bello (informale)" },
  { name: "Proteine e Macro", hangul: "단백질 보충제 추천해 주세요", romaji: "Danbaekjil bochungje chucheonhae juseyo", eng: "Mi consigli un integratore proteico?", scenario: "Sei in farmacia sportiva e cerchi nuove proteine.", clue: "보충제 (bochungje) = integratore" },
  { name: "Passione LoL: Mid Lane", hangul: "미드 차이", romaji: "Mideu chai", eng: "Mid diff (Differenza in mid lane)", scenario: "Stai flammando (scherzosamente) in chat perché il mid nemico è scarso.", clue: "차이 (chai) = differenza (usato come 'diff' su LoL)" },
  { name: "Parlar di 2521! 📺", hangul: "스물다섯 스물하나 봤어요?", romaji: "Seumuldaseot seumulhana bwasseoyo?", eng: "Hai visto 2521?", scenario: "Vuoi parlare della tua serie preferita.", clue: "봤어요? (bwasseoyo) = Hai visto/guardato?" },
  { name: "Natura e Relax", hangul: "산책 갈까요?", romaji: "Sanchaek galkkayo?", eng: "Andiamo a fare una passeggiata?", scenario: "Vuoi esplorare il parco del fiume Han come nei Drama.", clue: "산책 (sanchaek) = passeggiata" },
  { name: "Cosplay Shopping", hangul: "이거 입어봐도 돼요?", romaji: "Igeo ibeobwado dwaeyo?", eng: "Posso provarlo?", scenario: "Sei da Animate o in un negozio di costumi.", clue: "입어보다 (ibeoboda) = provare un vestito" },
  { name: "Foto Ricordo Cosplay", hangul: "사진 같이 찍을까요?", romaji: "Sajin gachi jjigeulkkayo?", eng: "Facciamo una foto insieme?", scenario: "Incontri un cosplayer pazzesco e vuoi un ricordo.", clue: "사진 (sajin) = foto, 같이 (gachi) = insieme" },
  { name: "Barbecue Proteico (K-BBQ)", hangul: "삼겹살 이 인분 주세요", romaji: "Samgyeopsal i inbun juseyo", eng: "Due porzioni di pancetta, per favore", scenario: "Giorno di sgarro dietetico e carico proteico post fiera.", clue: "인분 (inbun) = porzione a persona" },
  { name: "Stanchezza post-Leg Day", hangul: "너무 피곤해요", romaji: "Neomu pigonhaeyo", eng: "Sono troppo stanca", scenario: "Hai fatto troppi squat in palestra e non senti più le gambe.", clue: "피곤하다 (pigonhada) = essere stanco" },
  { name: "Sconti Stoffe Cosplay", hangul: "조금만 깎아주세요~", romaji: "Jogeumman kkakajuseyo~", eng: "Fammi un piccolo sconto~", scenario: "Al mercato di Dongdaemun stai comprando stoffe costose.", clue: "깎다 (kkakta) = tagliare il prezzo. Si usa con voce dolce!" },
  { name: "Gamer Terminology: Support", hangul: "힐 좀 주세요", romaji: "Hil jom juseyo", eng: "Dammi un po' di cure (heal) per favore", scenario: "Sei in team fight e stai per morire su LoL.", clue: "힐 (Hil) = Heal/Cure" },
  { name: "Richiesta Foto Personale", hangul: "사진 좀 찍어주시겠어요?", romaji: "Sajin jom jjigeojusigesseoyo?", eng: "Potrebbe scattarmi una foto?", scenario: "Vuoi la foto perfetta in posa Cosplay.", clue: "사진 (sajin) = foto" },
  { name: "Complimenti Estremi", hangul: "대박!", romaji: "Daebak!", eng: "Incredibile! / Wow!", scenario: "Vedi una pentakill assurda durante un match di LoL.", clue: "대박 (daebak) = grande successo/wow" },
  { name: "In Metropolitana", hangul: "다음 역은 어디예요?", romaji: "Daeum yeogeun eodiyeyo?", eng: "Qual è la prossima stazione?", scenario: "Devi andare all'evento e hai perso l'annuncio vocale.", clue: "다음 (daeum) = prossimo" },
  { name: "Taxi per il PC Bang", hangul: "PC방으로 가주세요", romaji: "PC-bang-euro gajuseyo", eng: "Al PC Bang, per favore", scenario: "Piove a dirotto ma l'addestramento rankato chiama.", clue: "으로 가주세요 (euro gajuseyo) = vada verso..." },
  { name: "Complimento in Game", hangul: "게임 정말 잘하시네요!", romaji: "Geim jeongmal jalhasineyo!", eng: "Sei davvero brava ai giochi!", scenario: "Il tuo compagno è impressionato dai tuoi riflessi.", clue: "잘하다 (jalhada) = essere bravi a fare qualcosa" },
  { name: "Modestia Coreana (Gym)", hangul: "아니에요, 아직 멀었어요", romaji: "Anieyo, ajik meoreosseoyo", eng: "No, ho ancora molto da migliorare", scenario: "Ti dicono che hai un fisico perfetto, metti in atto la modestia coreana!", clue: "아직 (ajik) = ancora" },
  { name: "Gamer: Non Trollare", hangul: "트롤 하지마", romaji: "Teurol hajima", eng: "Non trollare", scenario: "Il tuo compagno sta suicidandosi di proposito in bot lane.", clue: "트롤 (teurol) = troll" },
  { name: "Gym Rat: Sudore", hangul: "땀이 많이 났어요", romaji: "Ttami mani nasseoyo", eng: "Ho sudato molto", scenario: "Hai appena concluso 40 minuti di cardio intenso.", clue: "땀 (ttam) = sudore" },
  { name: "Emergenza Bagno", hangul: "여기에 휴지 있어요?", romaji: "Yeogie hyuji isseoyo?", eng: "C'è della carta igienica qui?", scenario: "I bagni della metropolitana ti colgono di sprovvista.", clue: "휴지 (hyuji) = carta igienica / fazzoletti" },
  { name: "Inviti Informali", hangul: "언제 밥 한번 먹자!", romaji: "Eonje bap hanbeon meokja!", eng: "Mangiamo insieme qualche volta! (Informale)", scenario: "Un cosplayer si congeda. È un modo di salutare comune!", clue: "밥 (bap) = riso / pasto" },
  { name: "Brindisi al Pub post-LoL", hangul: "건배!", romaji: "Geonbae!", eng: "Salute! / Brindisi!", scenario: "I tuoi nuovi amici versano il Soju per festeggiare la Promozione a Gold.", clue: "건배 (geonbae) = brindisi (vuotare il bicchiere)" },
  { name: "In Farmacia (Yakguk)", hangul: "근육통 약 있어요?", romaji: "Geunyuktong yak isseoyo?", eng: "Avete medicine per dolori muscolari?", scenario: "La leg day ti ha distrutto i quadricipiti.", clue: "근육통 (geunyuktong) = dolori muscolari (DOMS)" },
  { name: "Saluti tra Amici Gamers", hangul: "나중에 봐요!", romaji: "Najunge bwayo!", eng: "Ci vediamo dopo!", scenario: "Fai log-out dal client di League of Legends.", clue: "나중에 (najunge) = più tardi" },
  { name: "Quote da 2521 (Iconica)", hangul: "널 가져야겠어", romaji: "Neol gajyeoyagesseo", eng: "Devo averti (Ti farò mio/a)", scenario: "La famosissima frase che Na Hee-do dice. Usala scherzosamente!", clue: "가지다 (gajida) = avere/possedere" },
  { name: "Dal Parrucchiere (Cosplay)", hangul: "머리 다듬어 주세요", romaji: "Meori dadeumeo juseyo", eng: "Mi spunti i capelli, per favore", scenario: "Sei in un parrucchiere a Gangnam prima di un photoset cosplay.", clue: "머리 (meori) = testa/capelli" },
  { name: "In Farmacia (Digestione)", hangul: "소화제 있어요?", romaji: "Sohwaje isseoyo?", eng: "Avete qualcosa per la digestione?", scenario: "Troppe proteine e pollo ti hanno bloccato.", clue: "소화제 (sohwaje) = digestivo" },
  { name: "Al Noraebang (Karaoke)", hangul: "애니 노래 부를까요?", romaji: "Aeni norae bureulkkayo?", eng: "Cantiamo canzoni anime?", scenario: "Siete al karaoke e l'atmosfera è al top.", clue: "부르다 (bureuda) = cantare" },
  { name: "Sentimenti & Amicizia", hangul: "보고 싶어요", romaji: "Bogo sipeoyo", eng: "Mi manchi / Voglio vederti", scenario: "Guardi un poster di Nam Joo-hyuk o pensi alle tue amiche.", clue: "보고 싶다 (bogo sipda) = mancare/voler vedere" },
  { name: "Incontri Nerd/Gym", hangul: "주말에 시간 있어요?", romaji: "Jumare sigan isseoyo?", eng: "Hai tempo questo fine settimana?", scenario: "Vuoi invitare qualcuno al PC Bang o in palestra.", clue: "주말 (jumal) = fine settimana" },
  { name: "Cosplay Crafting", hangul: "밤새서 만들었어요", romaji: "Bamsaeseo mandeureosseoyo", eng: "L'ho fatto restando sveglia tutta la notte", scenario: "Qualcuno loda l'armatura del tuo Cosplay.", clue: "밤새다 (bamsaeda) = fare le ore piccole" },
  { name: "Dichiarazione (Start-Up Style)", hangul: "좋아해요", romaji: "Joahaeyo", eng: "Mi piaci / Ti amo", scenario: "La confessione classica e dolcissima dei Kdrama.", clue: "좋아하다 (joahada) = piacere/amare" },
  { name: "Frustrazione in Ranked", hangul: "진짜 짜증나요", romaji: "Jinjja jjajeungnayo", eng: "È davvero snervante", scenario: "Il tuo team in ranked sta perdendo miseramente.", clue: "짜증나다 (jjajeungnada) = essere irritato" },
  { name: "Incoraggiamento (Gym/Life)", hangul: "포기하지 마세요", romaji: "Pogihaji maseyo", eng: "Non arrenderti", scenario: "Incoraggi un'amica a fare l'ultima ripetizione sotto il bilanciere.", clue: "포기하다 (pogihada) = arrendersi" },
  { name: "Fame Nera post-fiera", hangul: "배고파 죽겠어요", romaji: "Baegopa jukgesseoyo", eng: "Muoio di fame", scenario: "Hai saltato il pranzo in fiera per farti fare foto.", clue: "죽겠다 (jukgetda) = morire (usato come esagerazione)" }
];

// ─── LIBRARY DATA ────────────────────────────────────────────
export const LIBRARY_DATA = [
  {
    category: "Alfabeto Coreano (Hangul) 🔠",
    icon: "type", iconColor: "text-indigo-500",
    items: [
      { hangul: "ㅏ, ㅓ, ㅗ, ㅜ, ㅡ, ㅣ", romaji: "a, eo, o, u, eu, i", eng: "Vocali Base", context: "Le vocali stanno a destra (ㅏ) o sotto (ㅗ) la consonante." },
      { hangul: "ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ, ㅇ, ㅈ", romaji: "g/k, n, d/t, r/l, m, b/p, s, ng, j", eng: "Consonanti Base", context: "Combinate con le vocali formano i blocchi. Es: ㄱ+ㅏ = 가 (Ga)." },
      { hangul: "운동", romaji: "Undong", eng: "Palestra / Allenamento", context: "Costruito con: ㅇ+ㅜ+ㄴ (un) e ㄷ+ㅗ+ㅇ (dong). Lo userai tanto per i tuoi workout!" },
      { hangul: "남주혁", romaji: "Nam Ju-hyeok", eng: "Nam Joo-hyuk", context: "Il tuo attore preferito di 2521! ㄴ+ㅏ+ㅁ = 남 (Nam)." }
    ]
  },
  {
    category: "Passioni: Gym, LoL & Cosplay 🎮🏋️‍♀️",
    icon: "dumbbell", iconColor: "text-blue-500",
    items: [
      { hangul: "제 취미는 운동이에요", romaji: "Je chwimineun undong-ieyo", eng: "Il mio hobby è allenarmi.", context: "Per i veri gym rat che non saltano il Leg Day." },
      { hangul: "제 취미는 코스프레예요", romaji: "Je chwimineun koseupeure-yeyo", eng: "Il mio hobby è il cosplay.", context: "Fondamentale per rompere il ghiaccio in fiera." },
      { hangul: "리그 오브 레전드 좋아해요?", romaji: "Rigeu obeu lejeondeu joahaeyo?", eng: "Ti piace League of Legends?", context: "Domanda base al PC Bang." },
      { hangul: "단백질 많은 거 주세요", romaji: "Danbaekjil maneun geo juseyo", eng: "Mi dia qualcosa di ricco di proteine.", context: "Massimizza i macro dopo l'allenamento." },
      { hangul: "사진 같이 찍을까요?", romaji: "Sajin gachi jjigeulkkayo?", eng: "Facciamo una foto insieme?", context: "Utile per i photoshoot in fiera." }
    ]
  },
  {
    category: "K-Drama Vibes: 2521 & Start-Up 📺",
    icon: "tv", iconColor: "text-purple-500",
    items: [
      { hangul: "스물다섯 스물하나 봤어요?", romaji: "Seumuldaseot seumulhana bwasseoyo?", eng: "Hai visto 2521?", context: "La serie iconica! Usalo per rompere il ghiaccio." },
      { hangul: "스타트업 봤어요?", romaji: "Seutateueop bwasseoyo?", eng: "Hai visto Start-Up?", context: "Cerca altri fan di Nam Joo-hyuk." },
      { hangul: "이 영화 너무 슬퍼요", romaji: "I yeonghwa neomu seulpeoyo", eng: "Questo film è troppo triste.", context: "Da usare dopo 'Even if this love disappears'." },
      { hangul: "남주혁 진짜 멋있어", romaji: "Nam Ju-hyeok jinjja meosisseo", eng: "Nam Joo-hyuk è bellissimo/figo", context: "Esclamazione da fangirl pura." },
      { hangul: "화이팅!", romaji: "Hwaiting!", eng: "Forza! / Buona fortuna!", context: "Il classico incitamento coreano per dare supporto morale." }
    ]
  },
  {
    category: "Emergenze & Sopravvivenza 🆘",
    icon: "alert-circle", iconColor: "text-red-500",
    items: [
      { hangul: "몰라요", romaji: "Mollayo", eng: "Non lo so / Non capisco", context: "Molto informale, ma utile per tirarsi fuori d'impiccio." },
      { hangul: "괜찮아요", romaji: "Gwaenchanayo", eng: "Va bene / Sto bene", context: "Perfetto per dire 'No grazie' o 'Nessun problema'." },
      { hangul: "한국어 잘 못해요", romaji: "Hangugeo jal mothaeyo", eng: "Non parlo bene il coreano", context: "Usalo per chiedere clemenza se i locali parlano a raffica." },
      { hangul: "도와주세요", romaji: "Dowajuseyo", eng: "Aiutatemi / Per favore aiutami", context: "Se ti sei persa o hai un'emergenza vera e propria." },
      { hangul: "아파요", romaji: "Apayo", eng: "Mi fa male / Sono malata", context: "Punta la parte del corpo e dì 'Apayo'." }
    ]
  },
  {
    category: "Ristorante & Cibo 🥘",
    icon: "utensils", iconColor: "text-orange-500",
    items: [
      { hangul: "저기요!", romaji: "Jeogiyo!", eng: "Scusi! (Per chiamare il cameriere)", context: "Alza la mano o premi il campanello al tavolo." },
      { hangul: "이거 주세요", romaji: "Igeo juseyo", eng: "Questo, per favore.", context: "Indica la foto nel menu." },
      { hangul: "안 맵게 해주세요", romaji: "An maepge haejuseyo", eng: "Non piccante, per favore", context: "Per salvarti lo stomaco." },
      { hangul: "물 좀 주세요", romaji: "Mul jom juseyo", eng: "Acqua, per favore", context: "A volte il distributore d'acqua è self-service." },
      { hangul: "맥주 / 소주", romaji: "Maekju / Soju", eng: "Birra / Soju", context: "Le due bevande alcoliche più consumate in Corea." }
    ]
  }
];

// ─── MAP REGIONS ─────────────────────────────────────────────
export const MAP_REGIONS = [
  { name: "Palazzo Gyeongbokgung (Seoul)", image: "https://images.unsplash.com/photo-1546874177-9e664107314e?w=600&q=80", icon: "🏯", emoji: "🤴", desc: "Il palazzo reale più iconico della Corea. Indossa l'Hanbok per entrare gratis!", keywords: ["Storia","Hanbok","Seoul"], lat: 37.5796, lng: 126.9770, unlocksOnDay: 1 },
  { name: "N Seoul Tower (Namsan)", image: "https://www.agoda.com/wp-content/uploads/2024/08/Namsan-Tower-during-autumn-in-Seoul-South-Korea.jpg", icon: "🗼", emoji: "🌇", desc: "Il punto panoramico più alto di Seoul, famoso per la funivia e i lucchetti dell'amore.", keywords: ["Seoul","Panorama","Romance"], lat: 37.5512, lng: 126.9882, unlocksOnDay: 5 },
  { name: "Bukchon Hanok Village", image: "https://southkoreahallyu.com/wp-content/uploads/2025/08/bukchon-3.jpg", icon: "🏘️", emoji: "🏮", desc: "Un villaggio tradizionale nel cuore della città moderna, perfetto per foto tra case storiche.", keywords: ["Tradizione","Foto","Hanok"], lat: 37.5826, lng: 126.9836, unlocksOnDay: 10 },
  { name: "Spiaggia di Haeundae (Busan)", image: "https://guidacorea.it/wp-content/uploads/2023/06/Guida-Completa-Spiagge-Busan-1.jpg", icon: "🏖️", emoji: "🏄‍♀️", desc: "La spiaggia più famosa della Corea, nota per l'atmosfera estiva e i grattacieli sul mare.", keywords: ["Busan","Mare","Relax"], lat: 35.1587, lng: 129.1604, unlocksOnDay: 15 },
  { name: "Gamcheon Culture Village", image: "https://res.klook.com/images/fl_lossy.progressive,q_65/c_fill,w_1295,h_728/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/xbxsizde9f8qchwmbnnh/BusanHighlightCityTourwithSkyCapsule,Gamcheon,Yachtmore.webp", icon: "🎨", emoji: "🖌️", desc: "Conosciuto come il 'Machu Picchu di Busan', un labirinto coloratissimo di case e street art.", keywords: ["Busan","Arte","Colori"], lat: 35.0975, lng: 129.0106, unlocksOnDay: 20 },
  { name: "Tempio di Bulguksa", image: "https://guidacorea.it/wp-content/uploads/2023/04/Tempio-Bulguksa-Grotta-Seokguram.jpg", icon: "🛕", emoji: "🙏", desc: "Patrimonio UNESCO. Un capolavoro assoluto dell'arte buddista.", keywords: ["Gyeongju","Storia","Tempio"], lat: 35.7900, lng: 129.3320, unlocksOnDay: 25 },
  { name: "Isola di Jeju", image: "https://www.viaggioincorea.it/wp-content/uploads/2021/04/%E1%84%89%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A1%E1%86%AB%E1%84%8B%E1%85%B5%E1%86%AF%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%87%E1%85%A9%E1%86%BC-from-news.chosun.gif", icon: "🌋", emoji: "🍊", desc: "Le Hawaii della Corea. Un'isola vulcanica famosa per la natura, le cascate e i mandarini.", keywords: ["Jeju","Natura","Vacanze"], lat: 33.3617, lng: 126.5292, unlocksOnDay: 30 },
  { name: "Daehak-ro Park (2521)", image: "https://seeanyplaces.com/wp-content/uploads/2021/05/DaeHak-ro-8.jpg", icon: "🏙️", emoji: "🎭", desc: "Al Marronnier Park hanno girato la scena in cui Yi-jin e Hee-do passeggiano nel caos cittadino.", keywords: ["Seoul","2521","Arte"], lat: 37.5821, lng: 127.0021, unlocksOnDay: 1 },
  { name: "Casa di Na Hee-do (2521)", image: "https://english.visitkorea.or.kr/public/images/2024/08/02/a8510d8630ea4007847cda5144a5933e.png", icon: "🏠", emoji: "🤺", desc: "La famosa casa in salita (Jeonju) dove Yi-jin le lasciava il giornale e la rosa rossa.", keywords: ["2521","Nostalgia","Jeonju"], lat: 35.8145, lng: 127.1522, unlocksOnDay: 9 },
  { name: "Tunnel Hanbyeokgul (2521)", image: "https://i0.wp.com/wanderwithjin.com/wp-content/uploads/2022/02/2521_tunnel.jpg?resize=800%2C800&ssl=1", icon: "🚇", emoji: "🏃‍♀️", desc: "L'iconico tunnel in mattoni dove Hee-do e Yi-jin scappano correndo nella notte.", keywords: ["2521","Fuga","Romance"], lat: 35.8105, lng: 127.1585, unlocksOnDay: 9 },
  { name: "Fumetteria Myeongjin (2521)", image: "https://lynntop.com/wp-content/uploads/2024/05/Image-5-4-24-at-10.55%E2%80%AFPM-1-1024x689.jpeg.webp", icon: "📚", emoji: "📖", desc: "L'esterno della fumetteria dove Yi-jin lavorava part-time in 2521.", keywords: ["2521","Yi-jin","Nostalgia"], lat: 35.8115, lng: 127.1485, unlocksOnDay: 9 },
  { name: "Spiaggia di Geumjin (2521)", image: "https://i0.wp.com/wanderwithjin.com/wp-content/uploads/2022/02/2521_SB2.jpg?resize=840%2C536&ssl=1", icon: "🌊", emoji: "📸", desc: "Il luogo dello stupendo viaggio estivo della squadra di 2521. 'Questa estate è nostra!'", keywords: ["2521","Amici","Estate"], lat: 37.6450, lng: 129.0436, unlocksOnDay: 9 }
];
