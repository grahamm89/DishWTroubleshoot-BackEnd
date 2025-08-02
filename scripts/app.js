document.addEventListener('DOMContentLoaded', () => {
  const $ = sel => document.querySelector(sel);
  const ls = {
    get: key => JSON.parse(localStorage.getItem(key) || 'null'),
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val))
  };

  // --- Global state ---
  let DATA = {};

  // --- UI Elements ---
  const symptomSel = $('#symptom');
  const symptomResult = $('#symptomResult');
  const checklistHolder = $('#toggleHolder');
  const checklistResult = $('#checklistResult');
  const chemTestsList = $('#chemTestsList');
  const copyBtn = $('#copyBtn');

  // --- Functions ---
  const fetchData = async () => {
    try {
      const response = await fetch('app_data.json');
      if (!response.ok) throw new Error('Network response was not ok.');
      DATA = await response.json();
      return true;
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      symptomSel.innerHTML = '<option value="">Error loading data</option>';
      checklistHolder.innerHTML = '<p style="color:var(--danger)">Could not load checklist questions.</p>';
      chemTestsList.innerHTML = '<li><em style="color:var(--danger)">Could not load chemical tests.</em></li>';
      return false;
    }
  };

  const buildSymptomDropdown = () => {
    symptomSel.innerHTML = '<option value="">— choose symptom —</option>';
    for (const key in DATA.symptoms) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = key;
      symptomSel.appendChild(option);
    }
  };

  const renderSymptomResult = (key) => {
    if (!key) {
      symptomResult.classList.remove('show');
      return;
    }
    const d = DATA.symptoms[key];
    symptomResult.innerHTML = `
      <p><strong>Likely causes:</strong> ${d.causes}</p>
      <p><strong>Suggested actions:</strong> ${d.actions}</p>`;
    symptomResult.classList.add('show');
    symptomResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    ls.set('lastSymptom', key);
  };

  const buildChecklist = () => {
    checklistHolder.innerHTML = '';
    const tpl = $('#toggleTemplate').content;
    DATA.questions.forEach((q, i) => {
      const node = document.importNode(tpl, true);
      const [p, noteDiv] = [node.querySelector('p'), node.querySelector('.note')];
      const [yIn, nIn] = node.querySelectorAll('input');
      const [yLbl, nLbl] = [node.querySelector('.yes'), node.querySelector('.no')];
      
      p.textContent = `${i + 1}. ${q.text}`;
      yIn.id = `${q.key}Y`; nIn.id = `${q.key}N`;
      yIn.name = nIn.name = q.key;
      yIn.value = 'Yes'; nIn.value = 'No';
      yLbl.setAttribute('for', yIn.id); nLbl.setAttribute('for', nIn.id);
      
      if (q.note) {
        noteDiv.textContent = q.note;
        noteDiv.hidden = false;
      }
      
      const saved = ls.get('toggle_' + q.key) || 'Yes';
      if (saved === 'No') nIn.checked = true; else yIn.checked = true;
      
      checklistHolder.appendChild(node);
    });
  };
  
  const buildChemicalTests = () => {
    chemTestsList.innerHTML = '';
    DATA.chemicalTests.forEach(test => {
      const li = document.createElement('li');
      let content = `<strong>${test.title}</strong><br>${test.description}`;
      if (test.check) {
        content += `<br><em>${test.check}</em>`;
      }
      li.innerHTML = content;
      chemTestsList.appendChild(li);
    });
  };

  const getToggleValue = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value || '';

  const compileAdvice = () => {
    const messages = [];
    DATA.questions.forEach(q => {
        if (getToggleValue(q.key) === 'No') {
            switch(q.key) {
                case 'dosingOn': messages.push('Switch on dosing unit.'); break;
                case 'dosingWorking': messages.push('Repair or calibrate dosing equipment.'); break;
                case 'temps': messages.push('Verify and adjust wash & rinse temperatures.'); break;
                case 'jets': messages.push('Clear wash and rinse jets.'); break;
                case 'practice': messages.push('Improve pre-scraping and racking practices.'); break;
                case 'detergent': messages.push('Connect correct detergent containers & tubing.'); break;
                case 'titration': messages.push('Perform detergent titration test.'); break;
            }
        }
    });

    checklistResult.innerHTML = messages.length ?
      `<h3>Checklist findings</h3><ul><li>${messages.join('</li><li>')}</li></ul>` :
      `<p>No obvious issues from the checklist.</p>`;
    checklistResult.classList.add('show');
  };

  const setupEventListeners = () => {
    symptomSel.addEventListener('change', e => renderSymptomResult(e.target.value));
    checklistHolder.addEventListener('change', e => {
      if (e.target.matches('input[type="radio"]')) {
        ls.set('toggle_' + e.target.name, e.target.value);
        compileAdvice();
      }
    });
    copyBtn.addEventListener('click', () => {
      let txt = `Machine Make: ${$('#mMake').value || '-'}\n`;
      txt += `Machine Model: ${$('#mModel').value || '-'}\n\n`;
      DATA.questions.forEach((q, i) => {
        txt += `${i + 1}. ${q.text} - ${getToggleValue(q.key)}\n`;
      });
      txt += '\n--- Symptom ---\n';
      txt += symptomSel.value ? `${symptomSel.value}\n` : 'None selected\n';
      txt += symptomResult.textContent.trim() ? '\n' + symptomResult.textContent.trim() : '';
      navigator.clipboard.writeText(txt).then(() => alert('Summary copied!'));
    });
    ['mMake', 'mModel'].forEach(id => {
      const el = $('#' + id);
      el.value = ls.get(id) || '';
      el.addEventListener('input', () => ls.set(id, el.value.trim()));
    });
  };

  const initializeApp = async () => {
    const success = await fetchData();
    if (!success) return;

    buildSymptomDropdown();
    buildChecklist();
    buildChemicalTests();
    setupEventListeners();

    // Restore last state
    const lastSym = ls.get('lastSymptom');
    if (lastSym && DATA.symptoms[lastSym]) {
      symptomSel.value = lastSym;
      renderSymptomResult(lastSym);
    }
    compileAdvice();
    setupPWA();
  };

  const setupPWA = () => {
    if ('serviceWorker' in navigator) {
      const manifest = {
        name: 'Dishwasher Helper', short_name: 'DW Helper', start_url: '.', display: 'standalone',
        background_color: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
        theme_color: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
        icons: []
      };
      const mURL = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/json' }));
      $('link[rel="manifest"]').href = mURL;

      const swCode = `const CACHE='dw-helper-v3'; const ASSETS=['${location.href}','app_data.json','styles/main.css','scripts/app.js']; self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))); self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const cRes=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cRes));return res;}))));`;
      const swURL = URL.createObjectURL(new Blob([swCode], { type: 'application/javascript' }));
      navigator.serviceWorker.register(swURL);
    }
  };

  // --- Run application ---
  initializeApp();
});
