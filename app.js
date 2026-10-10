// ===== ARBA PWA - Xizmat daftari =====
// Admin: ARBA170 | Klient: arba

const PASSWORD_ADMIN = 'ARBA170';
const PASSWORD_CLIENT = 'arba';

const STORAGE_KEY = 'arba_data_v1';
const AUTH_KEY = 'arba_auth_v1';

const CATEGORIES = [
  { id: 'moy', title: "Moy almashtrish", icon: 'drop' },
  { id: 'balon', title: "Balon almashtrish", icon: 'circle' },
  { id: 'mator', title: "Mator harjatlari", icon: 'cog' },
  { id: 'hadavoy', title: "Hadavoy harjatlari", icon: 'steering' },
  { id: 'elektrik', title: "Elektrik harajatlari", icon: 'bolt' },
  { id: 'boshqa', title: "Boshqa", icon: 'tag' }
];

const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentyabr","Oktyabr","Noyabr","Dekabr"];

const ICONS = {
  cog: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.15.68.4.93.7"/></svg>',
  drop: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 8 5 11 5 15a7 7 0 0 0 14 0c0-4-3-7-7-13z"/></svg>',
  circle: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>',
  bolt: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>',
  tag: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  steering: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 14.5L8.5 18M12 14.5L15.5 18M12 9.5V5"/></svg>'
};

// ===== STATE =====
let state = {
  drivers: [],
  auth: null
};

// ===== STORAGE =====
const VALID_CATEGORY_IDS = ['moy','balon','mator','hadavoy','elektrik','boshqa'];

function migrateLog(log) {
  if (!log.category || !VALID_CATEGORY_IDS.includes(log.category)) log.category = 'boshqa';
  if (!log.date) log.date = todayISO();
  if (typeof log.cost !== 'number' || isNaN(log.cost)) log.cost = 0;
  return log;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state.drivers = JSON.parse(raw);
      state.drivers.forEach(d => {
        if (!Array.isArray(d.logs)) d.logs = [];
        d.logs.forEach(migrateLog);
      });
    } else {
      state.drivers = [
        {
          id: 1,
          name: "Aziz Karimov",
          car: "Chevrolet Cobalt",
          plate: "01 A 123 BC",
          inventory: "Havo filtri, moy filtri, domkrat",
          imageUrl: null,
          logs: [
            { id: 1, description: "Moy almashtirildi", cost: 2273500, category: 'moy', date: '2026-10-15' }
          ]
        },
        {
          id: 2,
          name: "Sardor Yusupov",
          car: "Chevrolet Malibu 2",
          plate: "01 B 456 DE",
          inventory: "Aptekacha, o't o'chirgich",
          imageUrl: null,
          logs: [
            { id: 2, description: "Balon almashtirildi", cost: 550000, category: 'balon', date: '2026-10-10' }
          ]
        }
      ];
      saveData();
    }
    const authRaw = sessionStorage.getItem(AUTH_KEY);
    if (authRaw) state.auth = JSON.parse(authRaw);
  } catch (e) {
    console.error(e);
    state.drivers = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.drivers));
}

function saveAuth() {
  if (state.auth) sessionStorage.setItem(AUTH_KEY, JSON.stringify(state.auth));
  else sessionStorage.removeItem(AUTH_KEY);
}

function isAdmin() { return state.auth === 'admin'; }

// ===== HELPERS =====
function formatMoney(amount) {
  const s = Math.round(amount).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
}

function uid() { return Date.now() + Math.floor(Math.random() * 1000); }

function getInitial(name) {
  return name && name.length ? name[0].toUpperCase() : 'H';
}

function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatDate(d) {
  const [y, m, day] = d.split('-');
  return `${parseInt(day)}.${parseInt(m)}.${y}`;
}

// ===== ROUTING =====
const routes = { '#/login': renderLogin, '#/': renderList, '#/driver': renderDetail };

function navigate(hash) { window.location.hash = hash; }

function onRoute() {
  const hash = window.location.hash || '#/';
  if (!state.auth && hash !== '#/login') {
    navigate('#/login');
    return;
  }
  const render = routes[hash.split('?')[0]] || renderList;
  render();
}
window.addEventListener('hashchange', onRoute);

// ===== TOAST =====
let toastTimer = null;
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2500);
}

// ===== RENDERERS =====
function render() {
  const app = document.getElementById('app');
  if (!state.auth) {
    app.innerHTML = getLoginHTML();
    bindLogin();
  } else if (window.location.hash.startsWith('#/driver')) {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const id = parseInt(params.get('id'));
    const driver = state.drivers.find(d => d.id === id);
    if (!driver) { navigate('#/'); return; }
    app.innerHTML = getDetailHTML(driver);
    bindDetail(driver);
  } else {
    app.innerHTML = getListHTML();
    bindList();
  }
}

function getLogoSVG(size = 100) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}">
    <rect width="200" height="200" fill="#900C3F"/>
    <circle cx="100" cy="78" r="48" fill="#FFFFFF"/>
    <path fill="#900C3F" d="M65 60 c3-2 7-3 11-1 c-1-5 3-10 8-9 c3 1 5 3 5 6 c4-1 9 0 10 4 c1 4-1 8-5 9 c2 2 2 6 0 8 c-2 2-7 1-9-1 c0 6-5 11-11 11 c-3 0-5-1-7-3 c0 4-2 7-5 7 c-3 0-5-2-5-5 c-2 1-5-1-5-4 c0-3 3-5 6-4 c1-5 5-10 8-16 z M70 78 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0"/>
    <text x="100" y="172" font-family="Arial Black, Helvetica, sans-serif" font-size="36" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="3">ARBA</text>
  </svg>`;
}

function getLogoURL() { return generateLogoDataURL(); }

function generateLogoDataURL() {
  return `data:image/svg+xml;utf8,${encodeURIComponent(getLogoSVG(200))}`;
}

// ===== LOGIN =====
function getLoginHTML() {
  return `
  <div class="login-screen">
    <div class="login-card">
      ${getLogoSVG(140)}
      <div class="login-title">ARBA</div>
      <div class="login-subtitle">Xizmat daftari - Haydovchilar va xarajatlar</div>
      <form class="login-form" id="login-form">
        <div>
          <label>Parol</label>
          <input type="password" id="password" placeholder="Parolni kiriting" autofocus>
        </div>
        <button type="submit" class="login-btn" id="login-btn">Kirish</button>
        <div id="login-error" style="display:none" class="login-error"></div>
        <div class="login-hint">
          <strong>Admin:</strong> ARBA170 (to'liq ruxsat)<br>
          <strong>Klient:</strong> arba (faqat ko'rish)
        </div>
      </form>
    </div>
  </div>`;
}

function bindLogin() {
  const form = document.getElementById('login-form');
  const pwd = document.getElementById('password');
  const err = document.getElementById('login-error');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = pwd.value.trim();
    if (val === PASSWORD_ADMIN) {
      state.auth = 'admin';
      saveAuth();
      toast('Admin sifatida kirdingiz', 'success');
      navigate('#/');
    } else if (val === PASSWORD_CLIENT) {
      state.auth = 'client';
      saveAuth();
      toast('Klient sifatida kirdingiz', 'success');
      navigate('#/');
    } else {
      err.style.display = 'block';
      err.textContent = "Noto'g'ri parol! Qaytadan urinib ko'ring.";
      pwd.value = '';
      pwd.focus();
    }
  });
}

// ===== LIST =====
function getListHTML() {
  const now = new Date();
  const totalMonth = state.drivers.reduce((sum, d) => {
    return sum + (d.logs || []).filter(l => {
      const dt = new Date(l.date);
      return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
    }).reduce((s, l) => s + l.cost, 0);
  }, 0);

  const admin = isAdmin();
  const roleLabel = admin ? 'Admin' : 'Klient';

  return `
  <div class="app-header">
    <div class="header-left">
      <div class="header-logo">${getLogoSVG(28)}</div>
      <div>
        <div class="header-title">Xizmat daftari</div>
      </div>
    </div>
    <div class="header-right">
      <span class="role-badge">${roleLabel}</span>
      <button class="btn-icon" id="logout-btn" title="Chiqish">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>
  </div>
  <div class="main-content">
    ${!admin ? `<div class="readonly-banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Siz klient sifatida kirdingiz. Faqat ko'rish mumkin.
    </div>` : ''}

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Haydovchilar</div>
        <div class="stat-value">${state.drivers.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Jami xarajat (joriy oy)</div>
        <div class="stat-value accent">${formatMoney(totalMonth)}</div>
      </div>
    </div>

    <div class="search-box">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="search" placeholder="Ism, avtomobil yoki nomer bo'yicha...">
    </div>

    <div id="driver-list"></div>

    ${admin ? `<button class="btn-outline add-driver-btn" id="add-driver">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Yangi haydovchi qo'shish
    </button>` : ''}
  </div>`;
}

function renderDriverCards(filter = '') {
  const now = new Date();
  const q = filter.toLowerCase();
  const list = state.drivers.filter(d =>
    d.name.toLowerCase().includes(q) || d.car.toLowerCase().includes(q) || d.plate.toLowerCase().includes(q)
  );
  const admin = isAdmin();

  if (list.length === 0) {
    return `<div class="empty-state">${filter ? 'Hech narsa topilmadi' : "Haydovchilar yo'q. Qo'shish uchun yuqoridagi tugmani bosing."}</div>`;
  }

  return list.map(d => {
    const monthLogs = (d.logs || []).filter(l => {
      const dt = new Date(l.date);
      return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
    });
    const monthTotal = monthLogs.reduce((s, l) => s + l.cost, 0);
    const avatarContent = d.imageUrl
      ? `<img src="${d.imageUrl}" onerror="this.replaceWith(document.createTextNode('${getInitial(d.name)}'))" alt="">`
      : getInitial(d.name);

    return `
    <div class="driver-card" data-id="${d.id}">
      <div class="driver-avatar">${avatarContent}</div>
      <div class="driver-info">
        <div class="driver-name">${escapeHTML(d.name)}</div>
        <div class="driver-car">${escapeHTML(d.car)}</div>
        <span class="driver-plate-tag">${escapeHTML(d.plate)}</span>
      </div>
      <div class="driver-stats">
        <div class="amount">${formatMoney(monthTotal)}</div>
      </div>
      ${admin ? `<div class="driver-actions">
        <button class="action-btn edit" data-action="edit" data-id="${d.id}" title="Tahrirlash">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="action-btn delete" data-action="delete" data-id="${d.id}" title="O'chirish">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>` : ''}
    </div>`;
  }).join('');
}

function bindList() {
  const search = document.getElementById('search');
  const listEl = document.getElementById('driver-list');
  listEl.innerHTML = renderDriverCards('');

  if (search) {
    search.addEventListener('input', e => {
      listEl.innerHTML = renderDriverCards(e.target.value);
    });
  }

  document.getElementById('logout-btn').addEventListener('click', () => {
    state.auth = null;
    saveAuth();
    navigate('#/login');
  });

  if (isAdmin()) {
    const addBtn = document.getElementById('add-driver');
    if (addBtn) addBtn.addEventListener('click', () => openDriverDialog());

    listEl.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const drv = state.drivers.find(d => d.id === id);
        if (!drv) return;
        if (btn.dataset.action === 'edit') openDriverDialog(drv);
        if (btn.dataset.action === 'delete') confirmDeleteDriver(drv);
        return;
      }
      const card = e.target.closest('.driver-card');
      if (card) navigate(`#/driver?id=${card.dataset.id}`);
    });
  } else {
    listEl.addEventListener('click', e => {
      const card = e.target.closest('.driver-card');
      if (card) navigate(`#/driver?id=${card.dataset.id}`);
    });
  }
}

function openDriverDialog(driver = null) {
  const isEdit = !!driver;
  let currentImageUrl = driver?.imageUrl || null;
  const initial = driver ? getInitial(driver.name) : '+';
  const hasImg = !!(driver && driver.imageUrl);

  showModal({
    title: isEdit ? 'Haydovchini tahrirlash' : "Yangi haydovchi qo'shish",
    bodyHTML: `
      <div class="form-group"><label>F.I.O</label><input id="f-name" value="${escapeHTML(driver?.name || '')}" placeholder="Masalan: Aziz Karimov"></div>
      <div class="form-group"><label>Avtomobil</label><input id="f-car" value="${escapeHTML(driver?.car || '')}" placeholder="Masalan: Chevrolet Cobalt"></div>
      <div class="form-group"><label>Davlat raqami</label><input id="f-plate" value="${escapeHTML(driver?.plate || '')}" placeholder="Masalan: 01 A 777 AA"></div>
      <div class="form-group"><label>Jihozlar</label><input id="f-inv" value="${escapeHTML(driver?.inventory || '')}" placeholder="Domkrat, aptekacha..."></div>
      <div class="form-group"><label>Haydovchi rasmi</label>
        <div class="avatar-upload">
          <div class="avatar-preview" id="f-preview">${hasImg ? `<img src="${driver.imageUrl}">` : `<span>${initial}</span>`}</div>
          <div class="upload-controls">
            <label class="file-label" for="f-photo">📷 Rasm tanlash</label>
            <input type="file" id="f-photo" accept="image/*" style="display:none">
            <button type="button" class="btn-secondary" id="f-photo-clear" style="${hasImg ? '' : 'display:none'}">O'chirish</button>
          </div>
        </div>
      </div>
    `,
    confirmText: isEdit ? 'Saqlash' : "Qo'shish",
    onMount: () => {
      const fileInput = document.getElementById('f-photo');
      const previewEl = document.getElementById('f-preview');
      const clearBtn = document.getElementById('f-photo-clear');

      fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast("Rasm 5 MB dan kichik bo'lishi kerak", 'error'); fileInput.value = ''; return; }
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 400;
            let w = img.width, h = img.height;
            if (w > h) {
              if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
            } else {
              if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
            }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            currentImageUrl = canvas.toDataURL('image/jpeg', 0.7);
            previewEl.innerHTML = `<img src="${currentImageUrl}">`;
            clearBtn.style.display = '';
          };
          img.onerror = () => toast("Rasmni o'qib bo'lmadi", 'error');
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });

      clearBtn.addEventListener('click', () => {
        currentImageUrl = null;
        previewEl.innerHTML = `<span>${initial}</span>`;
        clearBtn.style.display = 'none';
        fileInput.value = '';
      });
    },
    onConfirm: () => {
      const name = document.getElementById('f-name').value.trim();
      const car = document.getElementById('f-car').value.trim();
      const plate = document.getElementById('f-plate').value.trim();
      const inventory = document.getElementById('f-inv').value.trim();

      if (!name || !car) { toast("Ism va avtomobil kiritilishi shart", 'error'); return false; }

      if (isEdit) {
        Object.assign(driver, { name, car, plate, inventory, imageUrl: currentImageUrl });
        toast("Saqlandi", 'success');
      } else {
        state.drivers.push({
          id: uid(), name, car, plate, inventory, imageUrl: currentImageUrl, logs: []
        });
        toast("Haydovchi qo'shildi", 'success');
      }
      saveData();
      render();
      return true;
    }
  });
}

function confirmDeleteDriver(driver) {
  showModal({
    title: "Haydovchini o'chirish",
    bodyHTML: `<p><strong>${escapeHTML(driver.name)}</strong> va uning barcha ma'lumotlarini o'chirmoqchimisiz?</p>`,
    confirmText: "O'chirish",
    danger: true,
    onConfirm: () => {
      state.drivers = state.drivers.filter(d => d.id !== driver.id);
      saveData();
      toast("O'chirildi", 'success');
      render();
      return true;
    }
  });
}

// ===== DETAIL =====
function getDetailHTML(driver) {
  const admin = isAdmin();
  const urlHash = window.location.hash;
  const qp = new URLSearchParams(urlHash.split('?')[1] || '');
  const y = parseInt(qp.get('y')) || new Date().getFullYear();
  const m = parseInt(qp.get('m')) || new Date().getMonth() + 1;

  const logs = (driver.logs || []).filter(l => {
    const dt = new Date(l.date);
    return dt.getFullYear() === y && dt.getMonth() === m - 1;
  });
  const monthTotal = logs.reduce((s, l) => s + l.cost, 0);
  const avatarContent = driver.imageUrl
    ? `<img src="${driver.imageUrl}" onerror="this.replaceWith(document.createTextNode('${getInitial(driver.name)}'))" alt="">`
    : getInitial(driver.name);

  const monthName = `${MONTHS[m - 1]} ${y}`;

  return `
  <div class="app-header">
    <button class="back-btn" id="back-btn">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    </button>
    <div class="header-title" style="flex:1;text-align:center;font-size:15px;">${escapeHTML(driver.name)}</div>
    <button class="btn-icon" id="logout-btn" title="Chiqish">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    </button>
  </div>
  <div class="detail-screen">
    ${!admin ? `<div class="readonly-banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Klient rejimi - o'zgartirish mumkin emas
    </div>` : ''}

    <div class="detail-profile">
      <div class="profile-avatar">${avatarContent}</div>
      <div class="profile-info">
        <div class="profile-name">${escapeHTML(driver.name)}</div>
        <div class="profile-line"><span class="label">Avtomobil:</span> <span class="value">${escapeHTML(driver.car)}</span></div>
        <div class="profile-line"><span class="label">Nomeri:</span> <span class="plate-tag">${escapeHTML(driver.plate)}</span></div>
        <div class="profile-line"><span class="label">Jihozlar:</span> <span class="value">${escapeHTML(driver.inventory) || '—'}</span></div>
      </div>
    </div>

    <div class="month-picker">
      <div class="label">Oy</div>
      <div class="month-nav">
        <button id="prev-month">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="month-name">${monthName}</div>
        <button id="next-month">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <div class="month-total">
      <div class="label">Bu oyda hisoblanayotgan jami:</div>
      <div class="amount">${formatMoney(monthTotal)}</div>
    </div>

    <div class="section-title">
      <span>Bo'limlar bo'yicha — ${monthName}</span>
    </div>
    <div id="cat-list">
      ${CATEGORIES.map(c => {
        const total = logs.filter(l => l.category === c.id).reduce((s, l) => s + l.cost, 0);
        return `
          <div class="category-card">
            <div class="left">
              <div class="category-icon">${ICONS[c.icon]}</div>
              <div class="category-name">${c.title}</div>
            </div>
            <div class="category-amount">${formatMoney(total)}</div>
          </div>`;
      }).join('')}
    </div>

    <div class="section-title" style="margin-top:24px;">
      <span>Xizmat yozuvlari — ${monthName}</span>
    </div>
    <div id="log-list">
      ${logs.length === 0
        ? `<div class="empty-state">Bu oy uchun xarajatlar kiritilmagan</div>`
        : logs.map(l => `
          <div class="log-card">
            <div class="log-content">
              <div class="log-desc">${escapeHTML(l.description)}</div>
              <div class="log-meta">Sana: ${formatDate(l.date)} · ${getCategoryById(l.category).title}</div>
            </div>
            <div class="log-amount">${formatMoney(l.cost)}</div>
            ${admin ? `<button class="log-delete" data-id="${l.id}" title="O'chirish">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>` : ''}
          </div>`).join('')}
    </div>

    ${admin ? `<button class="btn-outline" id="add-log" style="margin-top:14px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Yangi xarajat qo'shish
    </button>` : ''}
  </div>`;
}

function bindDetail(driver) {
  document.getElementById('back-btn').addEventListener('click', () => navigate('#/'));
  document.getElementById('logout-btn').addEventListener('click', () => {
    state.auth = null; saveAuth(); navigate('#/login');
  });

  const urlHash = window.location.hash;
  const qp = new URLSearchParams(urlHash.split('?')[1] || '');
  const y = parseInt(qp.get('y')) || new Date().getFullYear();
  const m = parseInt(qp.get('m')) || new Date().getMonth() + 1;

  document.getElementById('prev-month').addEventListener('click', () => {
    let ny = y, nm = m - 1;
    if (nm < 1) { nm = 12; ny--; }
    navigate(`#/driver?id=${driver.id}&y=${ny}&m=${nm}`);
  });
  document.getElementById('next-month').addEventListener('click', () => {
    let ny = y, nm = m + 1;
    if (nm > 12) { nm = 1; ny++; }
    navigate(`#/driver?id=${driver.id}&y=${ny}&m=${nm}`);
  });

  if (isAdmin()) {
    document.getElementById('add-log').addEventListener('click', () => openLogDialog(driver, y, m));
    document.getElementById('log-list').addEventListener('click', e => {
      const btn = e.target.closest('[data-id]');
      if (btn && btn.classList.contains('log-delete')) {
        const lid = parseInt(btn.dataset.id);
        driver.logs = driver.logs.filter(l => l.id !== lid);
        saveData();
        toast("O'chirildi", 'success');
        navigate(`#/driver?id=${driver.id}&y=${y}&m=${m}`);
      }
    });
  }
}

function openLogDialog(driver, y, m) {
  showModal({
    title: "Yangi xarajat qo'shish",
    bodyHTML: `
      <div class="form-group">
        <label>Xarajat bo'limi</label>
        <select id="f-cat" required>${CATEGORIES.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}</select>
      </div>
      <div class="form-group">
        <label>Xizmat tavsifi / Izoh</label>
        <textarea id="f-desc" placeholder="Izoh kiriting..."></textarea>
      </div>
      <div class="form-group">
        <label>Summa (so'm)</label>
        <input id="f-cost" type="number" inputmode="decimal" placeholder="0">
      </div>
      <div class="form-group">
        <label>Sana</label>
        <div class="date-input"><input type="date" id="f-date" value="${todayISO()}"></div>
      </div>
    `,
    confirmText: 'Saqlash',
    onConfirm: () => {
      const category = document.getElementById('f-cat').value;
      const description = document.getElementById('f-desc').value.trim();
      const cost = parseFloat(document.getElementById('f-cost').value) || 0;
      const date = document.getElementById('f-date').value || todayISO();

      if (!VALID_CATEGORY_IDS.includes(category)) { toast("Bo'limni tanlash shart", 'error'); return false; }
      if (!description || cost <= 0) { toast("Izoh va summa kiritilishi shart", 'error'); return false; }

      driver.logs.push({ id: uid(), description, cost, category, date });
      saveData();
      toast("Xarajat qo'shildi", 'success');
      navigate(`#/driver?id=${driver.id}&y=${y}&m=${m}`);
      return true;
    }
  });
}

// ===== MODAL =====
function showModal({ title, bodyHTML, confirmText = 'OK', cancelText = 'Bekor', danger = false, onConfirm, onMount }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" id="m-close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      <div class="modal-footer">
        <button class="btn-secondary" id="m-cancel">${cancelText}</button>
        <button class="${danger ? 'btn-danger' : 'btn-primary'}" id="m-confirm">${confirmText}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('m-close').addEventListener('click', close);
  document.getElementById('m-cancel').addEventListener('click', close);
  document.getElementById('m-confirm').addEventListener('click', () => {
    const ok = onConfirm && onConfirm();
    if (ok !== false) close();
  });
  if (typeof onMount === 'function') onMount();
}

function escapeHTML(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

// ===== PWA INSTALL =====
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-banner').style.display = 'flex';
});

document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('install-banner');
  document.getElementById('install-btn').addEventListener('click', async () => {
    banner.style.display = 'none';
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    } else {
      // iOS / Safari
      toast("Chrome brauzerida 'Qo'shish' tugmasini bosing yoki menyudan 'Bosh ekranga qo'shish' ni tanlang", 'success');
    }
  });
  document.getElementById('install-cancel').addEventListener('click', () => {
    banner.style.display = 'none';
  });
});

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.error('SW register failed', err));
  });
}

// ===== INIT =====
loadData();
onRoute();
