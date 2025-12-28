// Helpers
const el = id => document.getElementById(id);
const fmtNum = (n) => {
  if (!isFinite(n)) return n;
  const abs = Math.abs(n);
  const decimals = (Math.round((abs - Math.floor(abs)) * 100) === 0) ? 0 : 2;
  return n.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: 2});
};

// Elements
const mode = el('mode');
const fields = el('fields');
const form = el('calc-form');
const calcBtn = el('calc-btn');
const clearBtn = el('clear-btn');
const copyBtn = el('copy-btn');
const output = el('output');
const error = el('error');
const meta = el('meta');

// Render fields per mode
function renderFields() {
  const m = mode.value;
  meta.textContent = '';
  error.textContent = '';
  output.textContent = '';

  if (m === 'pct-of') {
    fields.innerHTML = `
      <label for="pct">Percentage (%)</label>
      <input id="pct" name="pct" type="number" inputmode="decimal" step="any" placeholder="e.g. 15" />
      <label for="value">Value</label>
      <input id="value" name="value" type="number" inputmode="decimal" step="any" placeholder="e.g. 200" />
    `;
    el('pct').focus();
  } else if (m === 'what-percent') {
    fields.innerHTML = `
      <label for="part">Part (A)</label>
      <input id="part" name="part" type="number" inputmode="decimal" step="any" placeholder="e.g. 30" />
      <label for="whole">Whole (B)</label>
      <input id="whole" name="whole" type="number" inputmode="decimal" step="any" placeholder="e.g. 200" />
    `;
    el('part').focus();
  } else if (m === 'apply-pct') {
    fields.innerHTML = `
      <label for="base">Base value</label>
      <input id="base" name="base" type="number" inputmode="decimal" step="any" placeholder="e.g. 100" />
      <label for="pct2">Percentage (%)</label>
      <input id="pct2" name="pct2" type="number" inputmode="decimal" step="any" placeholder="e.g. 15" />
      <div class="controls-inline" role="radiogroup" aria-label="Increase or Decrease">
        <label><input type="radio" name="dir" value="increase" checked /> Increase</label>
        <label><input type="radio" name="dir" value="decrease" /> Decrease</label>
      </div>
    `;
    el('base').focus();
  } else if (m === 'pct-change') {
    fields.innerHTML = `
      <label for="from">From (old value)</label>
      <input id="from" name="from" type="number" inputmode="decimal" step="any" placeholder="e.g. 80" />
      <label for="to">To (new value)</label>
      <input id="to" name="to" type="number" inputmode="decimal" step="any" placeholder="e.g. 100" />
    `;
    el('from').focus();
  }
}

// Calculation logic
function calculate(e) {
  if (e) e.preventDefault();
  error.textContent = '';
  output.textContent = '';
  meta.textContent = '';
  const m = mode.value;

  try {
    if (m === 'pct-of') {
      const pct = parseFloat(el('pct').value);
      const val = parseFloat(el('value').value);
      if (!isFinite(pct) || !isFinite(val)) throw 'Please enter valid numbers.';
      const result = (val * pct) / 100;
      output.textContent = `${fmtNum(pct)}% of ${fmtNum(val)} = ${fmtNum(result)}`;
      meta.textContent = `Computed: value × percentage ÷ 100`;
    } else if (m === 'what-percent') {
      const part = parseFloat(el('part').value);
      const whole = parseFloat(el('whole').value);
      if (!isFinite(part) || !isFinite(whole)) throw 'Please enter valid numbers.';
      if (whole === 0) throw 'Whole (B) cannot be zero.';
      const pct = (part / whole) * 100;
      output.textContent = `${fmtNum(part)} is ${fmtNum(pct)}% of ${fmtNum(whole)}`;
      meta.textContent = `Computed: (A ÷ B) × 100`;
    } else if (m === 'apply-pct') {
      const base = parseFloat(el('base').value);
      const pct = parseFloat(el('pct2').value);
      if (!isFinite(base) || !isFinite(pct)) throw 'Please enter valid numbers.';
      const dir = document.querySelector('input[name="dir"]:checked').value;
      const change = (base * pct) / 100;
      const newVal = dir === 'increase' ? base + change : base - change;
      const sign = dir === 'increase' ? '+' : '-';
      output.textContent = `${fmtNum(base)} ${dir} ${fmtNum(pct)}% = ${fmtNum(newVal)} (${sign}${fmtNum(change)})`;
      meta.textContent = `Computed: base ${dir} by (base × percentage ÷ 100)`;
    } else if (m === 'pct-change') {
      const from = parseFloat(el('from').value);
      const to = parseFloat(el('to').value);
      if (!isFinite(from) || !isFinite(to)) throw 'Please enter valid numbers.';
      if (from === 0) {
        if (to === 0) {
          output.textContent = `No change (both values are 0).`;
          return;
        } else {
          output.textContent = `Change from 0 to ${fmtNum(to)} — percent change is undefined (infinite).`;
          return;
        }
      }
      const diff = to - from;
      const pct = (diff / Math.abs(from)) * 100;
      const type = pct > 0 ? 'increase' : (pct < 0 ? 'decrease' : 'no change');
      output.textContent = `${fmtNum(from)} → ${fmtNum(to)} = ${fmtNum(Math.abs(pct))}% ${type}`;
      meta.textContent = `Computed: ((to - from) ÷ |from|) × 100`;
    }
  } catch (err) {
    error.textContent = err;
  }
}

// Copy result to clipboard
async function copyResult() {
  const text = output.textContent.trim();
  if (!text) {
    error.textContent = 'Nothing to copy.';
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    meta.textContent = 'Result copied to clipboard';
    setTimeout(()=>{ meta.textContent = '' }, 1500);
  } catch {
    error.textContent = 'Copy failed — your browser may block clipboard access.';
  }
}

// Clear
function clearAll() {
  form.reset();
  renderFields();
  output.textContent = '';
  error.textContent = '';
  meta.textContent = '';
  el('pct')?.focus();
}

// Init
mode.addEventListener('change', renderFields);
form.addEventListener('submit', calculate);
clearBtn.addEventListener('click', clearAll);
copyBtn.addEventListener('click', copyResult);

// Initial render
renderFields();