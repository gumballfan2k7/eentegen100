const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);

const fileInput = document.getElementById('file');
const uploadBtn = document.getElementById('upload');
const uploadResult = document.getElementById('uploadResult');
const qList = document.getElementById('qList');

uploadBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return alert('Select a .xlsx file');
  const fd = new FormData();
  fd.append('file', file);
  uploadResult.textContent = 'Uploading...';
  const res = await fetch('/upload', { method: 'POST', body: fd });
  const j = await res.json();
  uploadResult.textContent = j.ok ? `Uploaded ${j.count} rows` : `Error: ${j.error}`;
  // request latest questions
  const qs = await fetch('/api/questions').then(r => r.json()).then(r => r.questions || []);
  renderQuestions(qs);
  // notify via ws
  ws.send(JSON.stringify({ type: 'uploaded', count: j.count }));
};

function renderQuestions(qs){
  qList.innerHTML = '';
  qs.slice(0,10).forEach((q,i)=>{
    const li = document.createElement('li');
    li.textContent = q.Question || q.question || q.Q || JSON.stringify(q);
    qList.appendChild(li);
  });
}

// control buttons
document.querySelectorAll('button[data-cmd]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const cmd = btn.getAttribute('data-cmd');
    const msg = { type: 'control', payload: { cmd, ts: Date.now() } };
    ws.send(JSON.stringify(msg));
  });
});

ws.onmessage = (e) => {
  try{
    const msg = JSON.parse(e.data);
    // show simple feedback
    if (msg.type === 'questions') renderQuestions(msg.questions || []);
    console.log('ws msg', msg);
  }catch(e){console.error(e)}
};
