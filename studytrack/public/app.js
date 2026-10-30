const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const problems = [
 ['two-sum','Two Sum','Arrays','Easy','two-sum'],
 ['best-time','Best Time to Buy and Sell Stock','Arrays','Easy','best-time-to-buy-and-sell-stock'],
 ['product-array','Product of Array Except Self','Arrays','Medium','product-of-array-except-self'],
 ['valid-anagram','Valid Anagram','Strings','Easy','valid-anagram'],
 ['valid-palindrome','Valid Palindrome','Strings','Easy','valid-palindrome'],
 ['longest-substring','Longest Substring Without Repeating Characters','Strings','Medium','longest-substring-without-repeating-characters'],
 ['reverse-list','Reverse Linked List','Linked lists','Easy','reverse-linked-list'],
 ['merge-lists','Merge Two Sorted Lists','Linked lists','Easy','merge-two-sorted-lists'],
 ['list-cycle','Linked List Cycle','Linked lists','Easy','linked-list-cycle'],
 ['invert-tree','Invert Binary Tree','Trees','Easy','invert-binary-tree'],
 ['maximum-depth','Maximum Depth of Binary Tree','Trees','Easy','maximum-depth-of-binary-tree'],
 ['level-order','Binary Tree Level Order Traversal','Trees','Medium','binary-tree-level-order-traversal']
];
let records = [], ready = false, busy = false, loading = true;
const STORAGE_KEY = 'studytrack-records-v1';
// Direct-file previews and GitHub Pages use browser storage because they do not run Netlify Functions.
const localStorageMode = location.protocol === 'file:' || location.hostname.endsWith('github.io') ||
 (['localhost', '127.0.0.1'].includes(location.hostname) && location.port !== '8889');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notice(message) { $('#notice').textContent=message; $('#notice').hidden=!message; }
async function request(method='GET', body) {
 if(localStorageMode) {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { throw new Error('Browser storage is unavailable. Enable site storage and reload.'); }
  if(!Array.isArray(saved)) saved = [];
  if(method === 'GET') return saved;
  if(method === 'DELETE') {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.filter(item => item.id !== body.id)));
   return {ok:true};
  }
  if(method === 'POST') {
   const previous = saved.find(item => item.id === body.id);
   const next = {...body, createdAt:previous?.createdAt || new Date().toISOString()};
   localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved.filter(item => item.id !== body.id), next]));
   return {ok:true};
  }
  throw new Error('Unsupported local operation.');
 }
 const response = await fetch('/api/study',{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 const data = await response.json();
 if(!response.ok) throw new Error(data.error || 'Unable to load your progress. Please refresh to try again.');
 return data;
}
async function mutate(method,record) {
 if(busy || !ready) return false;
 busy=true; render(); notice('');
 try {
  await request(method, record);
  if(method==='DELETE') records=records.filter(r=>r.id!==record.id);
  else { const old=records.find(r=>r.id===record.id); records=records.filter(r=>r.id!==record.id);records.push({...record,createdAt:old?.createdAt || new Date().toISOString()}); }
  return true;
 } catch(error) { notice(error.message); return false; }
 finally { busy=false;render(); }
}
function view(name) {
 if(!['dashboard','dsa','planner','focus'].includes(name)) name='dashboard';
 $$('.view').forEach(el=>el.hidden=el.id!==name);
 $$('nav button').forEach(el=>{el.classList.toggle('on',el.dataset.view===name);el.setAttribute('aria-current',el.dataset.view===name?'page':'false');});
 if(location.hash!==`#${name}`) history.replaceState(null,'',`#${name}`);
}
$$('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
$$('[data-go]').forEach(b=>b.onclick=()=>view(b.dataset.go));
$('.logo').onclick=()=>view('dashboard');
window.addEventListener('hashchange',()=>view(location.hash.slice(1)));
view(location.hash.slice(1));
$('#theme').onclick=()=>{
 const light=document.documentElement.dataset.theme!=='light';
 document.documentElement.dataset.theme=light?'light':'dark';
 $('#theme').setAttribute('aria-label',`Switch to ${light?'dark':'light'} theme`);
};
$('#date').textContent=new Intl.DateTimeFormat('en',{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(new Date());
$('#task-date').value=today();
function empty(title,detail) { return `<div class="empty"><b>${title}</b>${detail}</div>`; }
function taskMarkup(task) {
 const late=task.due && task.due<today() && task.status!=='done';
 return `<div class="item ${task.status==='done'?'done':''}"><div class="item-main"><input type="checkbox" data-task="${escape(task.id)}" aria-label="Mark ${escape(task.title)} ${task.status==='done'?'incomplete':'complete'}" ${task.status==='done'?'checked':''} ${busy||!ready?'disabled':''}><div><span class="item-title">${escape(task.title)}</span><small>${late?'Overdue · ':''}${task.due===today()?'Today':escape(task.due || 'No date')}</small></div></div><button class="delete" data-delete="${escape(task.id)}" aria-label="Delete ${escape(task.title)}" ${busy?'disabled':''}>×</button></div>`;
}
function render() {
 const solved=problems.filter(p=>records.some(r=>r.id===p[0]&&r.kind==='problem'&&r.status==='done')).length;
 const tasks=records.filter(r=>r.kind==='task').sort((a,b)=>a.status===b.status?a.due.localeCompare(b.due):a.status==='done'?1:-1);
 const sessions=records.filter(r=>r.kind==='session');
 $('#solved').textContent=ready?solved:'—';
 $('#tasks-done').textContent=ready?tasks.filter(t=>t.status==='done').length:'—';
 const minutes=sessions.reduce((sum,s)=>sum+s.minutes,0);
 $('#focus-total').textContent=ready?(minutes>=60?`${Math.floor(minutes/60)}h ${minutes%60}m`:`${minutes}m`):'—';
 const percent=Math.round(solved/problems.length*100);
 $('#progress-percent').innerHTML=`${percent}<span>%</span>`;
 $('#overall-bar').style.width=`${percent}%`;
 $('#topic-progress').innerHTML=['Arrays','Strings','Linked lists','Trees'].map(topic=>{
 const count=problems.filter(p=>p[2]===topic && records.some(r=>r.id===p[0]&&r.status==='done')).length;
 return `<div class="topic-row"><span>${topic}</span><div class="bar"><i style="width:${count/3*100}%"></i></div><small>${count} / 3</small></div>`;
 }).join('');
 const upcoming=tasks.filter(t=>t.status!=='done').slice(0,3);
 $('#today-tasks').classList.remove('loading');
 $('#today-tasks').innerHTML=!ready?empty(loading?'Loading your study list…':'Your study list is unavailable',loading?'Getting your saved progress.':'Refresh the page to reconnect.'):(upcoming.length?upcoming.map(taskMarkup).join(''):empty('A fresh page for your next goal','Add your first task in the study planner.'));
 const shown=tasks.filter(t=>!$('#hide-done').checked||t.status!=='done');
 $('#task-list').innerHTML=shown.length?shown.map(taskMarkup).join(''):empty('Your next step starts here','Add a study task above to make a plan.');
 renderProblems();
 $('#session-list').innerHTML=sessions.length?sessions.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,20).map(s=>`<div class="item"><div><span class="item-title">Focused study</span><small>${escape(new Date(s.createdAt).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}))}</small></div><span class="tag">${s.minutes} MIN</span></div>`).join(''):empty('Make time for your first session','Completed focus sessions appear here.');
 $$('#task-form input, #task-form button').forEach(el=>el.disabled=busy||!ready);
}
function renderProblems() {
 const search=$('#search').value.toLowerCase();
 const filtered=problems.filter(p=>p[1].toLowerCase().includes(search)&&($('#topic-filter').value==='all'||p[2]===$('#topic-filter').value)&&($('#status-filter').value==='all'||(records.find(r=>r.id===p[0])?.status||'todo')===$('#status-filter').value));
 $('#problem-list').innerHTML=filtered.length?filtered.map((p)=>{
 const status=records.find(r=>r.id===p[0])?.status||'todo';
 return `<div class="item"><div class="item-main"><span class="muted">${String(problems.indexOf(p)+1).padStart(2,'0')}</span><div><a class="item-title" href="https://leetcode.com/problems/${p[4]}/" target="_blank" rel="noopener noreferrer">${p[1]} ↗</a><small>${p[2]}</small></div></div><div class="item-actions"><span class="difficulty ${p[3].toLowerCase()}">${p[3]}</span><select data-problem="${p[0]}" aria-label="Status for ${p[1]}" ${busy||!ready?'disabled':''}>${[['todo','Not started'],['progress','In progress'],['done','Solved']].map(([v,l])=>`<option value="${v}" ${v===status?'selected':''}>${l}</option>`).join('')}</select></div></div>`;
 }).join(''):empty('No matching problems','Try another search or filter.');
}
['search','topic-filter','status-filter'].forEach(id=>$('#'+id).addEventListener('input',renderProblems));
$('#hide-done').onchange=render;
$('#task-form').onsubmit=async e=>{
 e.preventDefault();const title=$('#task-title').value.trim();if(!title)return;
 if(await mutate('POST',{id:crypto.randomUUID(),kind:'task',title,status:'todo',due:$('#task-date').value,minutes:0})) $('#task-title').value='';
};
document.addEventListener('change',async e=>{
 const target=e.target;
 if(target.dataset.problem){const p=problems.find(p=>p[0]===target.dataset.problem);await mutate('POST',{id:p[0],kind:'problem',title:p[1],status:target.value,due:'',minutes:0});}
 if(target.dataset.task){const task=records.find(r=>r.id===target.dataset.task);await mutate('POST',{...task,status:target.checked?'done':'todo'});}
});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-delete]');if(b)await mutate('DELETE',{id:b.dataset.delete});});
// The timer uses a deadline so background tabs do not slow the countdown.
let mode=25,remaining=1500,deadline=0,running=false,pendingSession=null,savingSession=false;
function drawTimer(){
 $('#timer').textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
 $('#start-timer').textContent=running?'Ⅱ Pause session':remaining===mode*60?'▷ Start session':'▷ Resume session';
 $('#start-timer').disabled=!!pendingSession;
 $('#save-session').hidden=!pendingSession;
 $('#save-session').disabled=savingSession||!ready;
 $('#reset-timer').disabled=!!pendingSession;
 $$('[data-mode]').forEach(b=>b.disabled=!!pendingSession);
}
async function saveSession(){
 if(!pendingSession||savingSession)return;
 savingSession=true;drawTimer();
 const saved=await mutate('POST',pendingSession);
 if(saved){pendingSession=null;$('#timer-message').textContent='Session saved. Take a breath — you earned a break.';remaining=mode*60;}
 if(!saved) $('#timer-message').textContent='Your session is complete. Use the save button to retry.';
 savingSession=false;drawTimer();
}
function tick(){
 if(!running)return;
 remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));
 if(!remaining){running=false;$('#timer-label').textContent=mode===25?'NICE WORK. SESSION COMPLETE.':'BREAK COMPLETE';$('#timer-message').textContent=mode===25?'Saving your focus session…':'Ready for another focused session?';if(mode===25){pendingSession={id:crypto.randomUUID(),kind:'session',title:'Focused study',status:'done',due:today(),minutes:25};saveSession();}else remaining=mode*60;}
 drawTimer();
}
$('#start-timer').onclick=()=>{if(running){tick();running=false;}else{deadline=Date.now()+remaining*1000;running=true;$('#timer-label').textContent=mode===25?'ONE TASK. YOUR FULL ATTENTION.':'STEP AWAY AND RECHARGE';}drawTimer();};
$('#reset-timer').onclick=()=>{running=false;remaining=mode*60;$('#timer-label').textContent='READY WHEN YOU ARE';drawTimer();};
$$('[data-mode]').forEach(b=>b.onclick=()=>{running=false;mode=Number(b.dataset.mode);remaining=mode*60;$$('[data-mode]').forEach(el=>el.classList.toggle('on',el===b));$('#timer-label').textContent=mode===25?'LET’S MAKE SOME PROGRESS':'TIME TO RECHARGE';$('#timer-message').textContent=mode===25?'A small commitment to your next big idea.':'Stretch, get some water, and rest your eyes.';drawTimer();});
$('#save-session').onclick=saveSession;
setInterval(tick,250);drawTimer();
async function load(){
 try {
  records=await request();
  ready=true;
  if(localStorageMode) notice('Preview mode: progress is saved in this browser only.');
 } catch(error) {
  notice(error.message || 'Your saved progress is unavailable. Refresh to reconnect. Changes are paused until then.');
 } finally { loading=false;render(); }
}
render();load();
