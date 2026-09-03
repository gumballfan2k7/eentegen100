const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
const roundState = document.getElementById('roundState');
const questionText = document.getElementById('questionText');
const answerText = document.getElementById('answerText');
const debug = document.getElementById('debug');
let questions = [];
let currentIndex = 0;

ws.onmessage = (e) => {
  try{
    const msg = JSON.parse(e.data);
    debug.textContent = JSON.stringify(msg);
    if (msg.type === 'questions') {
      questions = msg.questions || [];
      renderQuestion(currentIndex);
    }
    if (msg.type === 'control') {
      const cmd = msg.payload && msg.payload.cmd;
      if (cmd === 'start-round') {
        roundState.textContent = 'Round started';
      } else if (cmd === 'show-question') {
        renderQuestion(currentIndex);
      } else if (cmd === 'reveal-answer') {
        revealAnswer(currentIndex);
      } else if (cmd === 'end-round') {
        roundState.textContent = 'Round ended';
      }
    }
  }catch(e){console.error(e)}
};

function renderQuestion(i){
  if (!questions || questions.length === 0) {
    questionText.textContent = 'No questions uploaded';
    answerText.textContent = '';
    return;
  }
  const q = questions[i % questions.length];
  questionText.textContent = q.Question || q.question || q.Q || JSON.stringify(q);
  answerText.textContent = '';
}

function revealAnswer(i){
  const q = questions[i % questions.length];
  answerText.textContent = q.Answer || q.answer || q.A || '';
}
