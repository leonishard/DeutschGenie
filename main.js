
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) { el.target.classList.add('visible'); observer.unobserve(el.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));


document.querySelectorAll('.demo-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    clearInterval(speedTimer);
    document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.demo-panel').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
  });
});


const sentences = [
  { prompt: 'Translate: "What are you doing this evening?"', answer: ["Ich", "gehe", "heute", "Abend", "ins", "Kino"], extra: ["esse", "mache", "spiele", "trinke", "gern"] },
  { prompt: 'Translate: "How old are you?"', answer: ["Ich", "bin", "zwanzig", "Jahre", "alt"], extra: ["habe", "gehe", "sehr", "heute"] },
  { prompt: 'Translate: "Where do you live?"', answer: ["Ich", "wohne", "in", "Berlin"], extra: ["gehe", "bin", "nach", "Hamburg"] }
];

let sentenceIndex = 0;
let sentenceOrder = [];

function loadSentence() {
  const q = sentences[sentenceIndex % sentences.length];
  sentenceOrder = [];
  document.getElementById('sentence-prompt').textContent = q.prompt;
  document.getElementById('sentence-feedback').textContent = '';
  document.getElementById('sentence-feedback').className = 'demo-feedback';

  const area = document.getElementById('sentence-answer');
  area.innerHTML = '<span class="demo-answer-placeholder">Tap words below to build your answer</span>';
  area.classList.remove('has-tiles');

  const all = [...q.answer, ...q.extra].sort(() => Math.random() - 0.5);
  const tilesEl = document.getElementById('sentence-tiles');
  tilesEl.innerHTML = '';
  all.forEach(word => {
    const t = document.createElement('div');
    t.className = 'tile';
    t.textContent = word;
    t.addEventListener('click', () => addToAnswer(t, word));
    tilesEl.appendChild(t);
  });
}

function addToAnswer(tileEl, word) {
  if (tileEl.classList.contains('used')) return;
  tileEl.classList.add('used');
  sentenceOrder.push(word);

  const area = document.getElementById('sentence-answer');
  area.classList.add('has-tiles');
  const ph = area.querySelector('.demo-answer-placeholder');
  if (ph) ph.remove();

  const at = document.createElement('div');
  at.className = 'answer-tile';
  at.textContent = word;
  at.addEventListener('click', () => {
    sentenceOrder = sentenceOrder.filter((_, i) => i !== sentenceOrder.lastIndexOf(word));
    at.remove();
    tileEl.classList.remove('used');
    if (area.children.length === 0) {
      area.innerHTML = '<span class="demo-answer-placeholder">Tap words below to build your answer</span>';
      area.classList.remove('has-tiles');
    }
  });
  area.appendChild(at);
}

document.getElementById('sentence-submit').addEventListener('click', () => {
  const q = sentences[sentenceIndex % sentences.length];
  const correct = q.answer.join(' ');
  const given = sentenceOrder.join(' ');
  const fb = document.getElementById('sentence-feedback');

  if (given === correct) {
    fb.textContent = 'Correct — well done.';
    fb.className = 'demo-feedback success';
    sentenceIndex++;
    setTimeout(loadSentence, 1400);
  } else {
    fb.textContent = 'Not quite — try rearranging.';
    fb.className = 'demo-feedback error';
    const area = document.getElementById('sentence-answer');
    area.style.borderColor = 'rgba(239,68,68,0.5)';
    setTimeout(() => area.style.borderColor = '', 800);
  }
});

loadSentence();


const compoundPairs = [
  { left: "Kranken", right: "haus",  full: "Krankenhaus"  },
  { left: "Zahn",    right: "arzt",  full: "Zahnarzt"     },
  { left: "Spiel",   right: "platz", full: "Spielplatz"   },
  { left: "Schreib", right: "tisch", full: "Schreibtisch" },
  { left: "Haus",    right: "tür",   full: "Haustür"      }
];

let slotMap = {};
let draggedPiece = null;

function buildCompound() {
  slotMap = {};
  draggedPiece = null;
  document.getElementById('compound-feedback').textContent = '';
  document.getElementById('compound-feedback').className = 'demo-feedback';

  const shuffled = [...compoundPairs].sort(() => Math.random() - 0.5);

  const rows = document.getElementById('compound-rows');
  rows.innerHTML = '';
  compoundPairs.forEach(pair => {
    const row = document.createElement('div');
    row.className = 'compound-row';

    const slot = document.createElement('div');
    slot.className = 'compound-slot';
    slot.dataset.right = pair.right;
    slot.innerHTML = '<span class="compound-slot-placeholder">drop here</span>';

    slot.addEventListener('click', () => {
      if (slotMap[pair.right]) {
        returnToBank(slotMap[pair.right]);
        slotMap[pair.right] = null;
        slot.innerHTML = '<span class="compound-slot-placeholder">drop here</span>';
        slot.classList.remove('filled', 'correct', 'incorrect');
      }
    });

    slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('drag-over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      if (!draggedPiece) return;
      const leftVal = draggedPiece.dataset.left;

      if (slotMap[pair.right]) returnToBank(slotMap[pair.right]);

      draggedPiece.classList.add('used');
      slotMap[pair.right] = leftVal;
      slot.classList.add('filled');
      slot.classList.remove('correct', 'incorrect');
      slot.innerHTML = `<div class="compound-slot-inner">${leftVal}</div>`;

      slot.addEventListener('click', () => {
        if (slotMap[pair.right]) {
          returnToBank(slotMap[pair.right]);
          slotMap[pair.right] = null;
          slot.innerHTML = '<span class="compound-slot-placeholder">drop here</span>';
          slot.classList.remove('filled', 'correct', 'incorrect');
        }
      });

      draggedPiece = null;
    });

    const join = document.createElement('div');
    join.className = 'compound-join';
    join.innerHTML = '<div class="compound-join-line"></div>';

    const fixed = document.createElement('div');
    fixed.className = 'compound-fixed';
    fixed.textContent = pair.right;

    row.appendChild(slot);
    row.appendChild(join);
    row.appendChild(fixed);
    rows.appendChild(row);
  });

  const bank = document.getElementById('compound-bank');
  bank.innerHTML = '';
  shuffled.forEach(pair => {
    const piece = document.createElement('div');
    piece.className = 'compound-piece';
    piece.textContent = pair.left;
    piece.draggable = true;
    piece.dataset.left = pair.left;

    piece.addEventListener('dragstart', () => {
      draggedPiece = piece;
      setTimeout(() => piece.classList.add('dragging'), 0);
    });
    piece.addEventListener('dragend', () => piece.classList.remove('dragging'));
    piece.addEventListener('touchstart', () => { draggedPiece = piece; }, { passive: true });

    bank.appendChild(piece);
  });
}

function returnToBank(leftVal) {
  const piece = document.querySelector(`.compound-piece[data-left="${leftVal}"]`);
  if (piece) piece.classList.remove('used');
}

document.getElementById('compound-submit').addEventListener('click', () => {
  const fb = document.getElementById('compound-feedback');
  let correct = 0;

  compoundPairs.forEach(pair => {
    const slot = document.querySelector(`.compound-slot[data-right="${pair.right}"]`);
    const given = slotMap[pair.right];
    if (!slot) return;
    if (given === pair.left) {
      slot.classList.add('correct');
      slot.classList.remove('incorrect');
      correct++;
    } else if (given) {
      slot.classList.add('incorrect');
      slot.classList.remove('correct');
    }
  });

  if (correct === compoundPairs.length) {
    fb.textContent = 'All correct — well done.';
    fb.className = 'demo-feedback success';
    setTimeout(buildCompound, 1600);
  } else {
    fb.textContent = `${correct} of ${compoundPairs.length} correct — keep going.`;
    fb.className = 'demo-feedback error';
  }
});

document.getElementById('compound-reset').addEventListener('click', buildCompound);

buildCompound();


const pronounWords = [
  { word: "Kuh",     answer: "Die", choices: ["Der","Die","Das","Dem"]  },
  { word: "Hund",    answer: "Der", choices: ["Der","Die","Das","Ein"]  },
  { word: "Kind",    answer: "Das", choices: ["Der","Die","Das","Den"]  },
  { word: "Mann",    answer: "Der", choices: ["Der","Die","Das","Dem"]  },
  { word: "Frau",    answer: "Die", choices: ["Der","Die","Das","Eine"] },
  { word: "Haus",    answer: "Das", choices: ["Der","Die","Das","Den"]  },
  { word: "Auto",    answer: "Das", choices: ["Der","Die","Das","Dem"]  },
  { word: "Tisch",   answer: "Der", choices: ["Der","Die","Das","Die"]  },
  { word: "Katze",   answer: "Die", choices: ["Der","Die","Das","Den"]  },
  { word: "Buch",    answer: "Das", choices: ["Der","Die","Das","Dem"]  },
  { word: "Schule",  answer: "Die", choices: ["Der","Die","Das","Ein"]  },
  { word: "Baum",    answer: "Der", choices: ["Der","Die","Das","Dem"]  },
  { word: "Fenster", answer: "Das", choices: ["Der","Die","Das","Den"]  },
  { word: "Stadt",   answer: "Die", choices: ["Der","Die","Das","Dem"]  },
  { word: "Stuhl",   answer: "Der", choices: ["Der","Die","Das","Eine"] },
  { word: "Mädchen", answer: "Das", choices: ["Der","Die","Das","Den"]  },
  { word: "Straße",  answer: "Die", choices: ["Der","Die","Das","Dem"]  },
  { word: "Zug",     answer: "Der", choices: ["Der","Die","Das","Die"]  },
  { word: "Lampe",   answer: "Die", choices: ["Der","Die","Das","Den"]  },
  { word: "Glas",    answer: "Das", choices: ["Der","Die","Das","Dem"]  },
].sort(() => Math.random() - 0.5);

let speedIndex = 0;
let speedScore = 0;
let speedTimer = null;
let speedSecondsLeft = 5;
const SPEED_DURATION = 5;

function showSpeedQuestion() {
  if (speedIndex >= pronounWords.length) { endSpeedRound(); return; }
  const q = pronounWords[speedIndex];

  document.getElementById('speed-word').innerHTML = `<em>___</em> ${q.word}`;
  document.getElementById('speed-score').innerHTML = `${speedScore}<span>/${pronounWords.length}</span>`;

  const shuffled = [...q.choices].sort(() => Math.random() - 0.5);
  const choicesEl = document.getElementById('speed-choices');
  choicesEl.innerHTML = '';
  shuffled.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'speed-choice';
    btn.textContent = c;
    btn.addEventListener('click', () => answerSpeed(c, q.answer));
    choicesEl.appendChild(btn);
  });

  speedSecondsLeft = SPEED_DURATION;
  updateTimerBar();
  clearInterval(speedTimer);
  speedTimer = setInterval(() => {
    speedSecondsLeft -= 0.1;
    updateTimerBar();
    if (speedSecondsLeft <= 0) {
      clearInterval(speedTimer);
      document.querySelectorAll('.speed-choice').forEach(b => {
        b.disabled = true;
        if (b.textContent === q.answer) b.classList.add('correct');
      });
      setTimeout(() => { speedIndex++; showSpeedQuestion(); }, 700);
    }
  }, 100);
}

function updateTimerBar() {
  const pct = Math.max(0, (speedSecondsLeft / SPEED_DURATION) * 100);
  const bar = document.getElementById('speed-bar');
  bar.style.width = pct + '%';
  bar.classList.toggle('urgent', speedSecondsLeft < 2);
  document.getElementById('speed-time').textContent = Math.ceil(speedSecondsLeft) + 's';
}

function answerSpeed(chosen, correct) {
  clearInterval(speedTimer);
  document.querySelectorAll('.speed-choice').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add('correct');
    else if (b.textContent === chosen) b.classList.add('wrong');
  });
  if (chosen === correct) speedScore++;
  speedIndex++;
  setTimeout(() => showSpeedQuestion(), 600);
}

function endSpeedRound() {
  clearInterval(speedTimer);
  document.getElementById('speed-game-screen').style.display = 'none';
  document.getElementById('speed-end-screen').style.display = '';
  document.getElementById('speed-final-score').textContent = speedScore;
}

document.getElementById('speed-start-btn').addEventListener('click', () => {
  speedIndex = 0; speedScore = 0;
  pronounWords.sort(() => Math.random() - 0.5);
  document.getElementById('speed-start-screen').style.display = 'none';
  document.getElementById('speed-end-screen').style.display = 'none';
  document.getElementById('speed-game-screen').style.display = '';
  showSpeedQuestion();
});

document.getElementById('speed-restart-btn').addEventListener('click', () => {
  speedIndex = 0; speedScore = 0;
  pronounWords.sort(() => Math.random() - 0.5);
  document.getElementById('speed-end-screen').style.display = 'none';
  document.getElementById('speed-game-screen').style.display = '';
  showSpeedQuestion();
});


document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');

  
    document.querySelectorAll('.faq-item').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

  
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });


const heroImages = [
  'assets/app-screen-2.png',
  'assets/app-screen-1.png',
  'assets/app-screen-3.png'
];

let heroIndex = 0;
const heroImg = document.getElementById('hero-phone-img');

if (heroImg) {
  setInterval(() => {
    heroImg.style.opacity = '0';
    setTimeout(() => {
      heroIndex = (heroIndex + 1) % heroImages.length;
      heroImg.src = heroImages[heroIndex];
      heroImg.style.opacity = '1';
    }, 400);
  }, 3000);
}
});