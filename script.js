// Helpers
const el = id => document.getElementById(id);
const fmtNum = (n) => {
  if (!isFinite(n)) return n;
  const abs = Math.abs(n);
  const decimals = (Math.round((abs - Math.floor(abs)) * 100) === 0) ? 0 : 2;
  return n.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: 2});
};

// Generic copy helper
async function copyText(targetOutputEl) {
  const text = targetOutputEl.textContent.trim();
  if (!text) {
    return 'Nothing to copy.';
  }
  await navigator.clipboard.writeText(text);
  return 'copied';
}

// Handlers for each calculator block
function handlePctOf(e) {
  if (e) e.preventDefault();
  const out = el('output-pct-of');
  const err = el('error-pct-of');
  const meta = el('meta-pct-of');
  out.textContent = ''; err.textContent = ''; meta.textContent = '';
  try {
    const pct = parseFloat(el('pct_of_pct').value);
    const val = parseFloat(el('pct_of_value').value);
    if (!isFinite(pct) || !isFinite(val)) throw 'Please enter valid numbers.';
    const result = (val * pct) / 100;
    out.textContent = `${fmtNum(pct)}% of ${fmtNum(val)} = ${fmtNum(result)}`;
    meta.textContent = `Computed: value × percentage ÷ 100`;
  } catch (errMsg) { err.textContent = errMsg; }
}

function handleWhatPercent(e) {
  if (e) e.preventDefault();
  const out = el('output-what-percent');
  const err = el('error-what-percent');
  const meta = el('meta-what-percent');
  out.textContent = ''; err.textContent = ''; meta.textContent = '';
  try {
    const part = parseFloat(el('wp_part').value);
    const whole = parseFloat(el('wp_whole').value);
    if (!isFinite(part) || !isFinite(whole)) throw 'Please enter valid numbers.';
    if (whole === 0) throw 'Whole (B) cannot be zero.';
    const pct = (part / whole) * 100;
    out.textContent = `${fmtNum(part)} is ${fmtNum(pct)}% of ${fmtNum(whole)}`;
    meta.textContent = `Computed: (A ÷ B) × 100`;
  } catch (errMsg) { err.textContent = errMsg; }
}

function handleApplyPct(e) {
  if (e) e.preventDefault();
  const out = el('output-apply-pct');
  const err = el('error-apply-pct');
  const meta = el('meta-apply-pct');
  out.textContent = ''; err.textContent = ''; meta.textContent = '';
  try {
    const baseEl = el('ap_base');
    const pctEl = el('ap_pct');
    if (!baseEl || !pctEl) throw 'Internal error: missing inputs.';
    const base = parseFloat(baseEl.value);
    const pct = parseFloat(pctEl.value);
    if (!isFinite(base) || !isFinite(pct)) throw 'Please enter valid numbers.';
    const dirEl = document.querySelector('input[name="ap_dir"]:checked');
    const dir = dirEl ? dirEl.value : 'increase';
    const change = (base * pct) / 100;
    const newVal = dir === 'increase' ? base + change : base - change;
    const sign = dir === 'increase' ? '+' : '-';
    out.textContent = `${fmtNum(base)} ${dir} ${fmtNum(pct)}% = ${fmtNum(newVal)} (${sign}${fmtNum(change)})`;
    meta.textContent = `Computed: base ${dir} by (base × percentage ÷ 100)`;
  } catch (errMsg) { err.textContent = errMsg; }
}

function handlePctChange(e) {
  if (e) e.preventDefault();
  const out = el('output-pct-change');
  const err = el('error-pct-change');
  const meta = el('meta-pct-change');
  out.textContent = ''; err.textContent = ''; meta.textContent = '';
  try {
    const from = parseFloat(el('pc_from').value);
    const to = parseFloat(el('pc_to').value);
    if (!isFinite(from) || !isFinite(to)) throw 'Please enter valid numbers.';
    if (from === 0) {
      if (to === 0) {
        out.textContent = `No change (both values are 0).`;
        return;
      } else {
        out.textContent = `Change from 0 to ${fmtNum(to)} — percent change is undefined (infinite).`;
        return;
      }
    }
    const diff = to - from;
    const pct = (diff / Math.abs(from)) * 100;
    const type = pct > 0 ? 'increase' : (pct < 0 ? 'decrease' : 'no change');
    out.textContent = `${fmtNum(from)} → ${fmtNum(to)} = ${fmtNum(Math.abs(pct))}% ${type}`;
    meta.textContent = `Computed: ((to - from) ÷ |from|) × 100`;
  } catch (errMsg) { err.textContent = errMsg; }
}

// Clear helpers
function clearForm(formId, outId, errId, metaId) {
  const f = el(formId);
  if (f) f.reset();
  el(outId).textContent = '';
  el(errId).textContent = '';
  el(metaId).textContent = '';
}

// Wire up events
document.getElementById('form-pct-of').addEventListener('submit', handlePctOf);
document.getElementById('clear-pct-of').addEventListener('click', ()=> clearForm('form-pct-of','output-pct-of','error-pct-of','meta-pct-of'));
document.getElementById('copy-pct-of').addEventListener('click', async ()=>{
  try { const res = await copyText(el('output-pct-of')); if(res==='copied'){ el('meta-pct-of').textContent='Result copied to clipboard'; setTimeout(()=>el('meta-pct-of').textContent='',1500);} else el('error-pct-of').textContent=res;} catch { el('error-pct-of').textContent='Copy failed — your browser may block clipboard access.' }
});

document.getElementById('form-what-percent').addEventListener('submit', handleWhatPercent);
document.getElementById('clear-what-percent').addEventListener('click', ()=> clearForm('form-what-percent','output-what-percent','error-what-percent','meta-what-percent'));
document.getElementById('copy-what-percent').addEventListener('click', async ()=>{
  try { const res = await copyText(el('output-what-percent')); if(res==='copied'){ el('meta-what-percent').textContent='Result copied to clipboard'; setTimeout(()=>el('meta-what-percent').textContent='',1500);} else el('error-what-percent').textContent=res;} catch { el('error-what-percent').textContent='Copy failed — your browser may block clipboard access.' }
});

document.getElementById('form-apply-pct').addEventListener('submit', handleApplyPct);
document.getElementById('clear-apply-pct').addEventListener('click', ()=> clearForm('form-apply-pct','output-apply-pct','error-apply-pct','meta-apply-pct'));
document.getElementById('copy-apply-pct').addEventListener('click', async ()=>{
  try { const res = await copyText(el('output-apply-pct')); if(res==='copied'){ el('meta-apply-pct').textContent='Result copied to clipboard'; setTimeout(()=>el('meta-apply-pct').textContent='',1500);} else el('error-apply-pct').textContent=res;} catch { el('error-apply-pct').textContent='Copy failed — your browser may block clipboard access.' }
});

document.getElementById('form-pct-change').addEventListener('submit', handlePctChange);
document.getElementById('clear-pct-change').addEventListener('click', ()=> clearForm('form-pct-change','output-pct-change','error-pct-change','meta-pct-change'));
document.getElementById('copy-pct-change').addEventListener('click', async ()=>{
  try { const res = await copyText(el('output-pct-change')); if(res==='copied'){ el('meta-pct-change').textContent='Result copied to clipboard'; setTimeout(()=>el('meta-pct-change').textContent='',1500);} else el('error-pct-change').textContent=res;} catch { el('error-pct-change').textContent='Copy failed — your browser may block clipboard access.' }
});