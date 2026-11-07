(() => {
  const SERVERS = ['Memphis', 'New York', 'Detroit', 'Chicago', 'San Francisco', 'Atlanta', 'San Diego', 'Los Angeles', 'Miami', 'Phoenix', 'Dallas', 'Boston', 'Seattle', 'Denver', 'Portland', 'Houston', 'Las Vegas'];

  const SEED_BASE = 1777959;
  const SEED = [
    'Конституция',
    'Уголовный Кодекс',
    'Административный кодекс',
    'Процессуальный кодекс',
    'Этический кодекс',
    'Дорожный кодекс',
    'Гражданский кодекс',
    'Трудовой кодекс',
    'Приложение №1 к Уголовному кодексу О закрытых, охраняемых и особо охраняемых территориях',
    'Закон Об обеспечении неприкосновенности государственных служащих',
    'Закон О деятельности офиса Генерального прокурора',
    'Закон Об адвокатской деятельности и адвокатуре',
    'Закон О деятельности региональных правоохранительных органах',
    'Закон О Федеральном Расследовательском Бюро',
    'Закон О Национальной Гвардии',
    'Закон О деятельности Секретной Службы',
    'Конституционный закон О Сенате',
    'Конституционный закон О политических партиях',
    'Конституционный закон О судебной системе',
    'Конституционный закон О нормативных правовых актах',
    'Конституционный закон О Правительстве',
    'Закон О системе ордеров',
    'Закон О средствах массовой информации',
    'Закон О Государственном оборонном заказе и специальных логистических операциях',
    'Закон О собраниях, митингах и публичных мероприятиях',
    'Закон Об оперативно-розыскной деятельности',
    'Закон О противодействии терроризму',
    'Закон О предпринимательской деятельности',
    'Закон О государственной тайне',
    'Закон О чрезвычайном и военном положении',
    'Закон О регулировании оборота оружия, боеприпасов и спецсредств',
    'Закон Об охоте и рыбалке',
    'Закон Об Экстренной Медицинской Службе',
    'Устав | Weazel News',
    'San-Andreas National Guard | Устав внутренней службы',
    'Устав Офиса Генерального Прокурора',
    'EMS | Устав Emergency Medical Service',
    'Устав Federal Investigation Bureau',
    'Положение о Главе судебного секретариата',
    'Кодекс судейской этики',
    'Положение о порядке назначения судебных экспертиз',
    'Устав военной полиции Вооружённых Сил',
    'Устав Правительства',
    'Устав Los Santos County Sheriff Department',
    'Устав Департамента полиции Лос-Сантос'
  ];

  const GROUPS = { k: 'Кодексы', z: 'Законы', u: 'Уставы и положения' };
  const STATUS = { draft: 'Черновик', review: 'На подписи', signed: 'Подписан', rejected: 'Отклонён' };

  const DEMO = {
    [SEED_BASE]: {
      demo: true,
      items: [
        { n: '1', title: 'Общие положения', text: 'Демонстрационный текст. После загрузки документа с Majestic здесь появятся настоящие статьи.' },
        { n: '2', title: 'Права и обязанности', text: 'Демонстрационный текст для проверки поиска: гражданин обязан соблюдать закон и уважать права других людей.' },
        { n: '3', title: 'Порядок применения', text: 'Демонстрационный текст. Статьи можно искать по номеру, названию и содержанию.' }
      ]
    },
    [SEED_BASE + 1]: {
      demo: true,
      items: [
        { n: '1.1', title: 'Нарушение общественного порядка', text: 'Демонстрационный текст. Нарушение общественного порядка влечёт ответственность, предусмотренную настоящим документом.' },
        { n: '1.2', title: 'Неповиновение сотруднику', text: 'Демонстрационный текст. Отказ выполнить законное требование сотрудника при исполнении служебных обязанностей.' },
        { n: '2.1', title: 'Управление транспортом', text: 'Демонстрационный текст. Управление транспортным средством с нарушением установленных правил.' },
        { n: '2.2', title: 'Оборот оружия', text: 'Демонстрационный текст. Хранение и ношение оружия без соответствующей лицензии.' }
      ]
    }
  };

  const TEMPLATES = [
    {
      id: 'report',
      title: 'Рапорт',
      desc: 'Служебный рапорт руководству',
      fields: [
        { k: 'to', l: 'Кому', ph: 'Шеф департамента' },
        { k: 'from', l: 'От кого', def: 'me' },
        { k: 'date', l: 'Дата', def: 'today' },
        { k: 'subject', l: 'Тема', ph: 'О проведённом патрулировании' },
        { k: 'body', l: 'Суть рапорта', t: 'area' },
        { k: 'attach', l: 'Приложения', ph: 'Скриншоты, видеозаписи' }
      ],
      body: '[CENTER][B]РАПОРТ[/B][/CENTER]\n\n[B]Кому:[/B] {{to}}\n[B]От:[/B] {{from}}\n[B]Дата:[/B] {{date}}\n[B]Тема:[/B] {{subject}}\n\n{{body}}\n\n[B]Приложения:[/B] {{attach}}\n\nПодпись: {{from}}'
    },
    {
      id: 'arrest',
      title: 'Протокол задержания',
      desc: 'Фиксация задержания и изъятого',
      fields: [
        { k: 'date', l: 'Дата', def: 'today' },
        { k: 'time', l: 'Время', ph: '21:40' },
        { k: 'place', l: 'Место задержания', ph: 'Vinewood Blvd, у банка' },
        { k: 'suspect', l: 'Задержанный', ph: 'Имя Фамилия' },
        { k: 'from', l: 'Задержал', def: 'me' },
        { k: 'article', l: 'Статья', ph: 'УК, ст. 1.1' },
        { k: 'body', l: 'Обстоятельства', t: 'area' },
        { k: 'seized', l: 'Изъято', ph: 'Нет' }
      ],
      body: '[CENTER][B]ПРОТОКОЛ ЗАДЕРЖАНИЯ[/B][/CENTER]\n\n[B]Дата и время:[/B] {{date}} {{time}}\n[B]Место:[/B] {{place}}\n[B]Задержанный:[/B] {{suspect}}\n[B]Задержал:[/B] {{from}}\n[B]Статья:[/B] {{article}}\n\n[B]Обстоятельства:[/B]\n{{body}}\n\n[B]Изъято:[/B] {{seized}}\n\nПодпись: {{from}}'
    },
    {
      id: 'warrant',
      title: 'Ордер на обыск',
      desc: 'Основание, объект и срок действия',
      fields: [
        { k: 'date', l: 'Дата', def: 'today' },
        { k: 'object', l: 'Объект обыска', ph: 'Адрес или транспортное средство' },
        { k: 'person', l: 'Владелец', ph: 'Имя Фамилия' },
        { k: 'basis', l: 'Основание', t: 'area' },
        { k: 'article', l: 'Статья', ph: 'УК, ст. 2.2' },
        { k: 'term', l: 'Срок действия', ph: '24 часа' },
        { k: 'from', l: 'Санкционировал', def: 'me' }
      ],
      body: '[CENTER][B]ОРДЕР НА ОБЫСК[/B][/CENTER]\n\n[B]Дата:[/B] {{date}}\n[B]Объект:[/B] {{object}}\n[B]Владелец:[/B] {{person}}\n[B]Статья:[/B] {{article}}\n\n[B]Основание:[/B]\n{{basis}}\n\n[B]Срок действия:[/B] {{term}}\n\nСанкционировал: {{from}}'
    },
    {
      id: 'claim',
      title: 'Заявление в суд',
      desc: 'Иск или жалоба с требованиями',
      fields: [
        { k: 'to', l: 'Суд', ph: 'Окружной суд' },
        { k: 'from', l: 'Заявитель', def: 'me' },
        { k: 'against', l: 'Ответчик', ph: 'Имя Фамилия или организация' },
        { k: 'date', l: 'Дата', def: 'today' },
        { k: 'body', l: 'Обстоятельства дела', t: 'area' },
        { k: 'demands', l: 'Требования', t: 'area' },
        { k: 'evidence', l: 'Доказательства', ph: 'Ссылки на скриншоты и видео' }
      ],
      body: '[CENTER][B]ЗАЯВЛЕНИЕ[/B][/CENTER]\n\n[B]В:[/B] {{to}}\n[B]Заявитель:[/B] {{from}}\n[B]Ответчик:[/B] {{against}}\n[B]Дата:[/B] {{date}}\n\n[B]Обстоятельства дела:[/B]\n{{body}}\n\n[B]Требования:[/B]\n{{demands}}\n\n[B]Доказательства:[/B] {{evidence}}\n\nПодпись: {{from}}'
    },
    {
      id: 'explain',
      title: 'Объяснительная',
      desc: 'Объяснение по произошедшему случаю',
      fields: [
        { k: 'to', l: 'Кому', ph: 'Руководство организации' },
        { k: 'from', l: 'От кого', def: 'me' },
        { k: 'date', l: 'Дата', def: 'today' },
        { k: 'body', l: 'Объяснение', t: 'area' }
      ],
      body: '[CENTER][B]ОБЪЯСНИТЕЛЬНАЯ[/B][/CENTER]\n\n[B]Кому:[/B] {{to}}\n[B]От:[/B] {{from}}\n[B]Дата:[/B] {{date}}\n\n{{body}}\n\nПодпись: {{from}}'
    }
  ];

  const ICONS = {
    scale: '<path d="M12 3v18M7 21h10M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    book: '<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13"/><path d="M9 8h6"/>',
    sliders: '<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.2"/><circle cx="8" cy="17" r="2.2"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>',
    out: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9"/>'
  };

  const NAV = [
    {
      id: 'legal', label: 'Законы', icon: 'scale', items: [
        { label: 'Все документы', href: '#/legal' },
        { label: 'Кодексы', href: '#/legal/k' },
        { label: 'Законы', href: '#/legal/z' },
        { label: 'Уставы и положения', href: '#/legal/u' },
        { label: 'Добавить документ', action: 'addDoc' },
        { label: 'Импорт списком ссылок', action: 'bulkImport' },
        { label: 'Обновить с Majestic', action: 'syncAll' }
      ]
    },
    {
      id: 'paperwork', label: 'Документы', icon: 'file', items: [
        { label: 'Мои документы', href: '#/paperwork' },
        { label: 'Создать документ', href: '#/paperwork/new' },
        { label: 'Доска документов', href: '#/board' }
      ]
    },
    {
      id: 'assistant', label: 'Ассистент', icon: 'spark', items: [
        { label: 'Подбор статей', href: '#/assistant' }
      ]
    },
    {
      id: 'handbook', label: 'Памятки', icon: 'book', items: [
        { label: 'Все памятки', href: '#/handbook' },
        { label: 'Новая памятка', action: 'newNote' }
      ]
    },
    {
      id: 'settings', label: 'Настройки', icon: 'sliders', items: [
        { label: 'Профиль', href: '#/settings' },
        { label: 'Данные и источник', href: '#/settings/data' }
      ]
    }
  ];

  const ADMIN = { id: 'admin', label: 'Админ', icon: 'sliders', items: [{ label: 'Импорт документов', href: '#/admin' }] };
  const ORGS = { id: 'orgs', label: 'Организации', icon: 'spark', items: [{ label: 'Мои организации', href: '#/orgs' }] };
  const LAWACT = ['addDoc', 'bulkImport', 'syncAll'];
  const canEdit = () => !sb || state.role === 'admin';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lower = s => String(s).toLowerCase().replace(/ё/g, 'е');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const today = () => new Date().toLocaleDateString('ru-RU');
  const fmtDate = t => new Date(t).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const icon = n => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
  const hl = (html, q) => q ? html.replace(new RegExp(reEsc(esc(q)), 'gi'), m => `<mark>${m}</mark>`) : html;

  let sb = null;

  const store = {
    remote: false,
    dirty: new Set(),
    removed: new Set(),
    get(k, d) {
      try {
        const v = localStorage.getItem('rev.' + k);
        return v === null ? d : JSON.parse(v);
      } catch { return d; }
    },
    set(k, v) { store.setRaw(k, JSON.stringify(v)); },
    setRaw(k, raw) {
      try { localStorage.setItem('rev.' + k, raw); } catch { toast('Не удалось сохранить: хранилище браузера переполнено'); }
      store.removed.delete(k);
      store.dirty.add(k);
      store.queue();
    },
    del(k) {
      localStorage.removeItem('rev.' + k);
      store.dirty.delete(k);
      store.removed.add(k);
      store.queue();
    },
    keys() { return Object.keys(localStorage).filter(k => k.startsWith('rev.')).map(k => k.slice(4)); },
    queue: debounce(() => store.push(), 300),
    async push() {
      if (!store.remote || !sb) return;
      const law = k => /\.(docs|art\..+)$/.test(k);
      const rows = [];
      const del = [...store.removed].filter(k => !law(k));
      store.dirty.forEach(k => { const v = localStorage.getItem('rev.' + k); if (v !== null && !law(k)) rows.push({ user_id: state.user.id, key: k, value: v }); });
      store.dirty.clear();
      store.removed.clear();
      try {
        if (rows.length) { const r = await sb.from('kv').upsert(rows); if (r.error) throw r.error; }
        if (del.length) await sb.from('kv').delete().eq('user_id', state.user.id).in('key', del);
      } catch { toast('Не удалось сохранить в облако'); }
    },
    async clear() {
      store.keys().forEach(k => store.del(k));
      await store.push();
    }
  };

  const state = {
    server: SERVERS.includes(store.get('server', 'Memphis')) ? store.get('server', 'Memphis') : 'Memphis',
    collapsed: store.get('collapsed', false),
    open: store.get('open', { legal: true }),
    path: '',
    params: new URLSearchParams(),
    docId: null,
    cur: null,
    user: null,
    role: 'user',
    name: '',
    avatar: ''
  };

  const app = $('#app');
  const view = $('#view');
  const dlg = $('#dialog');
  const pal = $('#palette');
  const skey = k => `${state.server}.${k}`;

  const docs = () => {
    let d = store.get(skey('docs'), null);
    if (!d) {
      d = state.server === 'Memphis' && !sb
        ? SEED.map((title, i) => ({ id: String(SEED_BASE + i), title, group: i < 9 ? 'k' : i < 33 ? 'z' : 'u' }))
        : [];
      store.set(skey('docs'), d);
    }
    return d;
  };
  const saveDocs = d => store.set(skey('docs'), d);
  const articlesOf = id => store.get(skey('art.' + id), null) || (!sb && DEMO[id]) || null;
  const myDocs = () => store.get(skey('mydocs'), []);
  const saveMyDocs = d => store.set(skey('mydocs'), d);
  const notes = () => store.get(skey('notes'), [{ id: 'welcome', title: 'Как пользоваться revolutione', tags: 'старт', text: 'Законы: загрузите документы с форума Majestic по ссылке или вставьте текст, затем ищите по статьям.\nДокументы: выберите шаблон, заполните поля и скопируйте готовый BB-код для форума.\nАссистент: опишите ситуацию, и он подберёт статьи из загруженных документов.\nCtrl K открывает поиск по всему сайту.' }]);
  const saveNotes = n => store.set(skey('notes'), n);
  const profile = () => store.get('profile', { name: '', rank: '', org: '' });
  const meName = () => { const p = profile(); return [[p.rank, p.name].filter(Boolean).join(' '), p.org].filter(Boolean).join(', '); };

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    $('#toasts').append(el);
    setTimeout(() => el.remove(), 2800);
  }

  async function copy(text, msg = 'Скопировано') {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement('textarea');
      t.value = text;
      document.body.append(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    toast(msg);
  }

  function openDialog(html, mount) {
    dlg.returnValue = '';
    dlg.innerHTML = html;
    dlg.showModal();
    if (mount) mount(dlg);
  }

  const showErr = (title, text) => openDialog(`<div class="dlg-body"><h2>${esc(title)}</h2><p class="muted" style="overflow-wrap:anywhere;white-space:pre-wrap">${esc(text)}</p><div class="dlg-actions"><button class="btn" data-close>Закрыть</button></div></div>`);
  const fnErr = async e => {
    try { const r = e.context; const b = await r.json(); return `HTTP ${r.status}: ${b.error || JSON.stringify(b)}`; } catch { return e.message; }
  };

  const ask = (title, text, ok = 'Удалить') => new Promise(res => {
    openDialog(`<form method="dialog" class="dlg-body"><h2>${esc(title)}</h2><p class="muted">${esc(text)}</p><div class="dlg-actions"><button class="btn" value="no">Отмена</button><button class="btn danger" value="yes">${esc(ok)}</button></div></form>`);
    dlg.addEventListener('close', () => res(dlg.returnValue === 'yes'), { once: true });
  });

  dlg.addEventListener('click', e => {
    if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
  });

  function setCrumbs(list) {
    $('#crumbs').innerHTML = list.map(([l, h]) => h ? `<a href="${h}">${esc(l)}</a>` : `<span>${esc(l)}</span>`).join('<i>/</i>');
  }

  function notFound(msg = 'Страница не найдена') {
    setCrumbs([['revolutione', '#/legal'], ['Ошибка']]);
    view.innerHTML = `<div class="empty"><h3>${esc(msg)}</h3><p>Проверьте ссылку или вернитесь к списку документов.</p><a class="btn primary" href="#/legal">К законам</a></div>`;
  }

  const isActive = href => {
    const p = href.slice(1);
    return state.path === p
      || (p === '/legal' && state.path.startsWith('/legal/doc'))
      || (p === '/paperwork' && state.path.startsWith('/paperwork/edit'))
      || (p === '/orgs' && /^\/(org|v)\//.test(state.path));
  };

  function renderNav() {
    $('#nav').innerHTML = NAV.concat(sb ? [ORGS] : [], state.role === 'admin' ? [ADMIN] : []).map(s => {
      const active = s.items.some(i => i.href && isActive(i.href));
      const open = !!state.open[s.id];
      const items = s.items.filter(i => !sb || state.role === 'admin' || !LAWACT.includes(i.action)).map(i => i.href
        ? `<a class="item ${isActive(i.href) ? 'on' : ''}" href="${i.href}">${i.label}</a>`
        : `<button class="item" data-act="${i.action}">${i.label}</button>`).join('');
      return `<div class="sec ${open ? 'open' : ''} ${active ? 'active' : ''}"><button class="sec-btn" data-act="toggleSec" data-id="${s.id}" title="${s.label}" aria-expanded="${open}">${icon(s.icon)}<span class="lbl">${s.label}</span><span class="chev">${icon('chevron')}</span></button><div class="sec-items"><div>${items}</div></div></div>`;
    }).join('');
  }

  function renderFoot() {
    const p = profile();
    const name = p.name || state.name || 'Профиль не заполнен';
    const sub = sb ? (state.role === 'admin' ? 'Админ' : 'Обычный') : p.name ? [p.rank, p.org].filter(Boolean).join(', ') || state.server : 'Заполните для шаблонов';
    $('#sideFoot').innerHTML = `<a class="profile-chip" href="#/settings"><span class="avatar ${p.name ? '' : 'empty'}">${esc(p.name ? p.name[0].toUpperCase() : '?')}</span><span class="pc-text"><b>${esc(name)}</b><span>${esc(sub)}</span></span></a>${sb ? `<button class="icon-btn" data-act="logout" title="Выйти" aria-label="Выйти">${icon('out')}</button>` : ''}`;
  }

  function parseArticles(raw) {
    const t = raw.replace(/\r/g, '').replace(/\u00a0/g, ' ');
    const re = /^[ \t]*(?:\[b\])?\s*Статья\s+(\d+(?:\.\d+)*)[.\s:–—-]*([^\n]*)$/gim;
    const marks = [];
    let m;
    while ((m = re.exec(t))) marks.push({ at: m.index, end: re.lastIndex, n: m[1], title: m[2].replace(/\[\/?b\]/gi, '').trim() });
    if (!marks.length) return t.trim() ? [{ n: '—', title: 'Полный текст', text: t.trim() }] : [];
    return marks.map((s, i) => ({ n: s.n, title: s.title, text: t.slice(s.end, i + 1 < marks.length ? marks[i + 1].at : t.length).trim() }));
  }

  async function fetchRemote(url) {
    const proxy = store.get('proxy', 'https://corsproxy.io/?url=');
    const gdoc = url.match(/^https:\/\/docs\.google\.com\/document\/d\/([\w-]+)/);
    const direct = gdoc ? `https://docs.google.com/document/d/${gdoc[1]}/export?format=txt` : url;
    const target = proxy ? proxy + encodeURIComponent(direct) : direct;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      if (store.remote) {
        const res = await fetch('/api/fetch?url=' + encodeURIComponent(url), { signal: ctrl.signal });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Сервер ответил ' + res.status);
        return data;
      }
      const res = await fetch(target, { signal: ctrl.signal });
      if (!res.ok) throw new Error('Сервер ответил ' + res.status);
      const html = await res.text();
      const dom = new DOMParser().parseFromString(html, 'text/html');
      const node = dom.querySelector('.bbWrapper, .message-body, .post-content, article') || dom.body;
      node.querySelectorAll('br').forEach(b => b.replaceWith('\n'));
      node.querySelectorAll('p, div, li, h1, h2, h3, h4, tr').forEach(e => e.append('\n'));
      return { title: dom.title || '', text: node.textContent };
    } finally { clearTimeout(timer); }
  }

  async function syncDoc(d, url, pasted) {
    const text = pasted || (await fetchRemote(url)).text;
    const items = parseArticles(text);
    if (!items.length) throw new Error('В загруженном тексте нет статей');
    store.set(skey('art.' + d.id), { items, src: url || 'вручную', at: Date.now() });
    if (url && d.url !== url) saveDocs(docs().map(x => x.id === d.id ? { ...x, url } : x));
    return items.length;
  }

  const stems = q => [...new Set(lower(q).split(/[^а-яa-z0-9]+/).filter(w => w.length > 2).map(w => w.length > 5 ? w.slice(0, -2) : w))];

  function rank(q, limit = 10) {
    const st = stems(q);
    if (!st.length) return [];
    const out = [];
    docs().forEach(d => {
      const a = articlesOf(d.id);
      if (!a) return;
      a.items.forEach(it => {
        const t = lower(it.title);
        const x = lower(it.text);
        let s = 0;
        st.forEach(w => {
          if (t.includes(w)) s += 4;
          s += Math.min(x.split(w).length - 1, 5);
        });
        if (s > 0) out.push({ d, it, s });
      });
    });
    return out.sort((a, b) => b.s - a.s).slice(0, limit);
  }

  function viewLogin() {
    app.classList.add('guest');
    setCrumbs([['revolutione']]);
    view.innerHTML = `<div class="login"><div class="login-logo">revolutione<b>”</b></div><p>Законы и документооборот для RP-серверов. Войдите, чтобы продолжить.</p>${state.authError ? `<div class="notice err">${esc(state.authError)}</div>` : ''}<button class="btn primary big" data-act="login">Войти через Discord</button></div>`;
  }

  async function viewAdmin() {
    if (state.role !== 'admin') return notFound('Нет доступа');
    setCrumbs([['Админ'], ['Импорт документов']]);
    const [l, u] = await Promise.all([sb.from('laws').select('id,title,server,updated_at').order('server'), sb.from('profiles').select('name,role').order('created_at', { ascending: false })]);
    const laws = l.data || [];
    const users = u.data || [];
    view.innerHTML = `
      <section class="page-head"><div><h1>Админ-панель</h1><p>Импорт документов по ссылкам. Дальше они обновляются сами.</p></div><div class="actions"><button class="btn" data-act="syncAll">${icon('refresh')}Обновить все сейчас</button></div></section>
      <div class="panel">
        <label class="field"><span>Сервер</span><select id="admServer">${SERVERS.map(s => `<option ${s === state.server ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
        <label class="field"><span>Одна ссылка на сервер, например https://docossum.com/legal/memphis, и все его документы подтянутся сами. Можно и Google Документы.</span><textarea id="admLinks" rows="8" placeholder="https://docossum.com/legal/memphis"></textarea></label>
        <div class="actions"><button class="btn primary" id="admGo" data-act="adminImport">Импортировать</button></div>
      </div>
      <div class="group-title">Документов в базе: ${laws.length}</div>
      <div class="list">${laws.map(x => `<div class="row"><span class="row-title">${esc(x.title)}</span><span class="row-meta">${esc(x.server)}, ${fmtDate(x.updated_at)}</span><button class="icon-btn danger" data-act="delDocRef" data-id="${x.id}" aria-label="Удалить">${icon('trash')}</button></div>`).join('') || '<div class="row"><span class="row-title">Пока пусто</span></div>'}</div>
      <div class="group-title">Аккаунтов: ${users.length}</div>
      <div class="list">${users.map(x => `<div class="row"><span class="row-title">${esc(x.name || 'Без имени')}</span><span class="badge ${x.role === 'admin' ? 'signed' : ''}">${x.role === 'admin' ? 'Админ' : 'Обычный'}</span></div>`).join('')}</div>`;
  }

  function viewBoard() {
    setCrumbs([['Документы', '#/paperwork'], ['Доска']]);
    view.classList.add('wide');
    const groups = [['Судебные', ['claim']], ['Следственные', ['arrest', 'warrant']], ['Служебные', ['report', 'explain']]];
    const own = store.get(skey('tpls'), []).map(t => t.id);
    if (own.length) groups.push(['Свои', own]);
    const my = myDocs();
    const nodes = [];
    const edges = [];
    const gy = [];
    let y = 0;
    groups.forEach(([name, ids]) => {
      const g = { id: 'g' + name, x: 250, l: name, k: 'grp', tag: 'Раздел' };
      const ys = [];
      ids.forEach(tid => {
        const t = allTpls().find(z => z.id === tid);
        const mine = my.filter(d => d.tpl === tid);
        nodes.push({ id: 't' + tid, x: 500, y, l: t.title, k: 'tpl', tag: 'Шаблон', tpl: tid });
        edges.push([g.id, 't' + tid]);
        mine.forEach((d, i) => {
          nodes.push({ id: 'd' + d.id, x: 750, y: y + i * 58, l: d.title, k: 'doc ' + d.status, tag: STATUS[d.status], href: '#/paperwork/edit/' + d.id });
          edges.push(['t' + tid, 'd' + d.id]);
        });
        ys.push(y);
        y += Math.max(1, mine.length) * 58 + 22;
      });
      g.y = (ys[0] + ys[ys.length - 1]) / 2;
      gy.push(g.y);
      nodes.push(g);
      edges.push(['root', g.id]);
    });
    nodes.push({ id: 'root', x: 0, y: (gy[0] + gy[gy.length - 1]) / 2, l: 'Документооборот', k: 'root', tag: state.server });
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
    const pos = store.get(skey('boardpos'), {});
    nodes.forEach(n => { if (pos[n.id]) { n.x = pos[n.id][0]; n.y = pos[n.id][1]; } });
    const link = ([a, b]) => {
      const p = byId[a];
      const q = byId[b];
      const x1 = p.x + 190;
      const y1 = p.y + 20;
      const m = (x1 + q.x) / 2;
      return `<path d="M${x1} ${y1}C${m} ${y1} ${m} ${q.y + 20} ${q.x} ${q.y + 20}"/>`;
    };
    view.innerHTML = `<div class="board" id="board"><div class="board-inner" id="boardInner"><svg class="threads" width="1000" height="${y + 80}">${edges.map(link).join('')}</svg>${nodes.map((n, i) => `<button class="node ${n.k}" style="left:${n.x}px;top:${n.y}px;animation-delay:${i * 45}ms" data-id="${n.id}"><small>${esc(n.tag)}</small>${esc(n.l)}</button>`).join('')}</div><div class="board-bar"><div class="bar-group"><button class="bar-btn" data-z="fit" aria-label="По центру">${icon('search')}</button><button class="bar-btn" data-z="in" aria-label="Приблизить">${icon('plus')}</button><button class="bar-btn" data-z="out" aria-label="Отдалить">−</button></div><div class="bar-group"><a class="bar-btn" href="#/paperwork/new" aria-label="Новый документ">${icon('file')}</a></div></div></div>`;
    const box = $('#board');
    const inner = $('#boardInner');
    const v = { x: 40, y: 60, k: 1 };
    const apply = () => { inner.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.k})`; };
    const zoom = f => { v.k = Math.min(2, Math.max(0.4, v.k * f)); apply(); };
    let drag = null;
    let moved = 0;
    apply();
    let dn = null;
    const paint = () => { $('.threads', box).innerHTML = edges.map(link).join(''); };
    box.addEventListener('pointerdown', e => {
      if (e.target.closest('.board-bar')) return;
      moved = 0;
      const el = e.target.closest('.node');
      if (el) { const n = byId[el.dataset.id]; dn = { el, n, sx: e.clientX, sy: e.clientY, ox: n.x, oy: n.y }; return; }
      drag = { x: e.clientX - v.x, y: e.clientY - v.y };
    });
    window.addEventListener('pointermove', e => {
      if (!box.isConnected) return;
      if (dn) {
        moved++;
        dn.n.x = Math.round(dn.ox + (e.clientX - dn.sx) / v.k);
        dn.n.y = Math.round(dn.oy + (e.clientY - dn.sy) / v.k);
        dn.el.style.left = dn.n.x + 'px';
        dn.el.style.top = dn.n.y + 'px';
        paint();
        return;
      }
      if (!drag) return;
      moved++;
      v.x = e.clientX - drag.x;
      v.y = e.clientY - drag.y;
      apply();
    });
    window.addEventListener('pointerup', () => {
      if (dn && moved > 4) { const p = store.get(skey('boardpos'), {}); p[dn.n.id] = [dn.n.x, dn.n.y]; store.set(skey('boardpos'), p); }
      dn = null;
      drag = null;
    });
    box.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.1 : 0.9); }, { passive: false });
    box.addEventListener('click', e => {
      const z = e.target.closest('[data-z]');
      if (z) { if (z.dataset.z === 'fit') { v.x = 40; v.y = 60; v.k = 1; apply(); } else zoom(z.dataset.z === 'in' ? 1.2 : 0.83); return; }
      const n = e.target.closest('.node');
      if (!n || moved > 4) return;
      const node = byId[n.dataset.id];
      if (node.tpl) createDoc(node.tpl); else if (node.href) location.hash = node.href;
    });
  }

  function viewLegal(group) {
    setCrumbs([['Законы', '#/legal'], ...(group ? [[GROUPS[group]]] : [])]);
    const list = docs();
    const loaded = list.filter(d => articlesOf(d.id) && !articlesOf(d.id).demo).length;
    const chip = (g, label) => `<a class="chip ${(group || '') === g ? 'on' : ''}" href="#/legal${g ? '/' + g : ''}">${label}<small>${g ? list.filter(d => d.group === g).length : list.length}</small></a>`;
    view.innerHTML = `
      <section class="page-head">
        <div><h1>Законы ${esc(state.server)}</h1><p>Документов: ${list.length}, загружено с Majestic: ${loaded}</p></div>
        <div class="actions" ${canEdit() ? '' : 'hidden'}>
          <button class="btn" data-act="addDoc">${icon('plus')}Добавить</button>
          <button class="btn" data-act="bulkImport">Импорт списком</button>
          <button class="btn primary" data-act="syncAll">${icon('refresh')}Обновить с Majestic</button>
        </div>
      </section>
      <div class="toolbar">
        <div class="chips">${chip('', 'Все')}${chip('k', 'Кодексы')}${chip('z', 'Законы')}${chip('u', 'Уставы')}</div>
        <input class="input" id="legalFilter" placeholder="Фильтр по названию" autocomplete="off">
      </div>
      <div id="legalList"></div>`;
    const box = $('#legalList');
    const row = d => {
      const a = articlesOf(d.id);
      const real = a && !a.demo;
      return `<a class="row" href="#/legal/doc/${d.id}"><span class="dot ${real ? 'on' : ''}"></span><span class="row-title">${esc(d.title)}</span><span class="row-meta">${a ? a.items.length + ' ст.' + (a.demo ? ', демо' : '') : 'не загружен'}</span>${icon('chevron')}</a>`;
    };
    const paint = () => {
      const q = lower($('#legalFilter').value.trim());
      const shown = list.filter(d => (!group || d.group === group) && (!q || lower(d.title).includes(q)));
      if (!list.length) {
        box.innerHTML = `<div class="empty"><h3>Документов пока нет</h3><p>Добавьте первый документ сервера ${esc(state.server)} и укажите ссылку на Majestic.</p><button class="btn primary" data-act="addDoc">${icon('plus')}Добавить документ</button></div>`;
        return;
      }
      if (!shown.length) { box.innerHTML = '<div class="empty"><h3>Ничего не найдено</h3><p>Измените запрос или группу.</p></div>'; return; }
      const keys = group ? [group] : Object.keys(GROUPS);
      box.innerHTML = keys.map(g => {
        const part = shown.filter(d => (d.group || 'z') === g);
        return part.length ? `<div class="group-title">${GROUPS[g]}</div><div class="list">${part.map(row).join('')}</div>` : '';
      }).join('');
    };
    $('#legalFilter').addEventListener('input', paint);
    paint();
  }

  function viewDoc(id) {
    const d = docs().find(x => x.id === id);
    if (!d) return notFound('Документ не найден');
    state.docId = id;
    const art = articlesOf(id);
    setCrumbs([['Законы', '#/legal'], [d.title]]);
    const meta = art ? `Статей: ${art.items.length}${art.at ? ', обновлено ' + fmtDate(art.at) : ''}` : 'Документ ещё не загружен';
    view.innerHTML = `
      <section class="page-head">
        <div class="grow"><h1 class="h-doc">${esc(d.title)}</h1><p>${meta}</p></div>
        <div class="actions" ${canEdit() ? '' : 'hidden'}>
          <button class="icon-btn danger" data-act="delDocRef" data-id="${id}" title="Удалить документ" aria-label="Удалить документ">${icon('trash')}</button>
          <button class="btn primary" data-act="importDoc" data-id="${id}">${icon('refresh')}Загрузить с Majestic</button>
        </div>
      </section>
      ${art ? `
        ${art.demo ? '<div class="notice">Это демонстрационный текст. Загрузите настоящий документ по ссылке с Majestic или вставьте текст вручную.</div>' : ''}
        <div class="search-field">${icon('search')}<input class="input" id="docSearch" placeholder="Поиск по тексту или номеру статьи, например 2.1" autocomplete="off"></div>
        <div class="count" id="docCount"></div>
        <div id="artList"></div>`
        : `<div class="empty"><h3>Текста пока нет</h3><p>Вставьте ссылку на тему форума Majestic или текст документа целиком.</p><button class="btn primary" data-act="importDoc" data-id="${id}">Загрузить документ</button></div>`}`;
    if (!art) return;
    const input = $('#docSearch');
    const list = $('#artList');
    let limit = 120;
    const paint = () => {
      const q = input.value.trim();
      const nq = lower(q);
      const numeric = /^\d+(\.\d+)*$/.test(q);
      const found = art.items.filter(it => !q || (numeric ? it.n === q || it.n.startsWith(q + '.') : lower(it.title + ' ' + it.text).includes(nq)));
      $('#docCount').textContent = q ? `Найдено: ${found.length}` : '';
      const html = found.slice(0, limit).map((it, i, arr) => `${it.chapter && (i === 0 || arr[i - 1].chapter !== it.chapter) ? `<h2 class="chap">${esc(it.chapter)}</h2>` : ''}
        <article class="art" id="a-${esc(it.n)}">
          <header><span class="art-n">Статья ${esc(it.n)}</span>${it.stars ? `<span class="stars" title="Уровень розыска">${'★'.repeat(it.stars)}</span>` : ''}${it.tags ? `<span class="tag">${esc(it.tags)}</span>` : ''}${it.title ? `<h3>${hl(esc(it.title), q)}</h3>` : '<span></span>'}<div class="art-actions"><button class="icon-btn" data-act="copyArt" data-n="${esc(it.n)}" title="Копировать статью" aria-label="Копировать статью">${icon('copy')}</button></div></header>
          <div class="art-body">${hl(esc(it.text).replace(/\n/g, '<br>'), q)}</div>
        </article>`).join('');
      list.innerHTML = (html + (found.length > limit ? '<button class="btn more">Показать ещё</button>' : '')) || '<div class="empty"><h3>Ничего не найдено</h3><p>Попробуйте другое слово или номер статьи.</p></div>';
    };
    input.addEventListener('input', debounce(paint, 120));
    list.addEventListener('click', e => { if (e.target.closest('.more')) { limit += 120; paint(); } });
    paint();
    const target = state.params.get('a');
    if (target) {
      const el = document.getElementById('a-' + target);
      if (el) { el.scrollIntoView({ block: 'start' }); el.classList.add('flash'); }
    }
  }

  function viewPaperwork() {
    setCrumbs([['Документы']]);
    const all = myDocs().sort((a, b) => b.updated - a.updated);
    let st = 'all';
    view.innerHTML = `
      <section class="page-head">
        <div><h1>Документы</h1><p>Рабочие документы от черновика до подписи. Всё хранится в вашем браузере.</p></div>
        <div class="actions"><a class="btn primary" href="#/paperwork/new">${icon('plus')}Создать документ</a></div>
      </section>
      <div class="toolbar">
        <div class="chips" id="stChips"></div>
        <input class="input" id="docFilter" placeholder="Поиск по документам" autocomplete="off">
      </div>
      <div id="docTable"></div>`;
    const paint = () => {
      const q = lower($('#docFilter').value.trim());
      $('#stChips').innerHTML = ['all', ...Object.keys(STATUS)].map(k => `<button class="chip ${st === k ? 'on' : ''}" data-st="${k}">${k === 'all' ? 'Все' : STATUS[k]}<small>${k === 'all' ? all.length : all.filter(d => d.status === k).length}</small></button>`).join('');
      const shown = all.filter(d => (st === 'all' || d.status === st) && (!q || lower(d.title).includes(q)));
      if (!shown.length) {
        $('#docTable').innerHTML = `<div class="empty"><h3>${all.length ? 'Ничего не найдено' : 'Документов пока нет'}</h3><p>${all.length ? 'Измените фильтр или запрос.' : 'Выберите шаблон и заполните поля, остальное сделает сайт.'}</p>${all.length ? '' : '<a class="btn primary" href="#/paperwork/new">Создать документ</a>'}</div>`;
        return;
      }
      $('#docTable').innerHTML = `<div class="table">${shown.map(d => {
        const tpl = allTpls().find(t => t.id === d.tpl);
        return `<div class="trow">
          <a class="tcell-main" href="#/paperwork/edit/${d.id}"><b>${esc(d.title)}</b><span>${esc(tpl ? tpl.title : 'Документ')}</span></a>
          <select class="select sm status-sel" data-id="${d.id}" aria-label="Статус">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${d.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
          <time>${fmtDate(d.updated)}</time>
          <div class="row-actions"><button class="icon-btn" data-act="dupDoc" data-id="${d.id}" title="Дублировать" aria-label="Дублировать">${icon('copy')}</button><button class="icon-btn danger" data-act="delMyDoc" data-id="${d.id}" title="Удалить" aria-label="Удалить">${icon('trash')}</button></div>
        </div>`;
      }).join('')}</div>`;
    };
    $('#stChips').addEventListener('click', e => { const b = e.target.closest('[data-st]'); if (b) { st = b.dataset.st; paint(); } });
    $('#docFilter').addEventListener('input', paint);
    $('#docTable').addEventListener('change', e => {
      const s = e.target.closest('.status-sel');
      if (!s) return;
      const list = myDocs();
      const d = list.find(x => x.id === s.dataset.id);
      if (d) { d.status = s.value; d.updated = Date.now(); saveMyDocs(list); const m = all.find(x => x.id === d.id); if (m) m.status = d.status; paint(); toast('Статус: ' + STATUS[d.status]); }
    });
    paint();
  }

  function viewNew() {
    setCrumbs([['Документы', '#/paperwork'], ['Новый документ']]);
    view.innerHTML = `
      <section class="page-head"><div><h1>Новый документ</h1><p>Выберите шаблон. Ваши данные из профиля подставятся сами.</p></div><div class="actions"><button class="btn" data-act="newTpl">${icon('plus')}Свой шаблон</button></div></section>
      <div class="tpl-grid">${allTpls().map(t => `<button class="tpl" data-act="newFrom" data-id="${t.id}"><b>${esc(t.title)}</b><span>${esc(t.desc)}</span></button>`).join('')}</div>`;
  }

  function createDoc(tplId) {
    const tpl = allTpls().find(t => t.id === tplId);
    if (!tpl) return;
    const values = {};
    tpl.fields.forEach(f => { values[f.k] = f.def === 'me' ? meName() : f.def === 'today' ? today() : ''; });
    const doc = { id: uid(), tpl: tplId, title: `${tpl.title} от ${today()}`, values, status: 'draft', created: Date.now(), updated: Date.now() };
    saveMyDocs([...myDocs(), doc]);
    location.hash = '#/paperwork/edit/' + doc.id;
  }

  const ALLOW = ['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'BR', 'DIV', 'P'];
  const allTpls = () => TEMPLATES.concat(store.get(skey('tpls'), []));

  function sanitize(html) {
    const t = document.createElement('template');
    t.innerHTML = html;
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) return;
      if (c.nodeType !== 1 || !ALLOW.includes(c.tagName)) { walk(c); c.replaceWith(...c.childNodes); return; }
      const al = /text-align:\s*(left|center|right|justify)/.exec(c.getAttribute('style') || '');
      [...c.attributes].forEach(a => c.removeAttribute(a.name));
      if (al) c.style.textAlign = al[1];
      walk(c);
    });
    walk(t.content);
    return t.innerHTML;
  }

  const rich = x => /<\w/.test(x || '') ? sanitize(x) : esc(x || '').replace(/\n/g, '<br>');
  const render = (tpl, v) => tpl.body.replace(/\{\{([^{}]+)\}\}/g, (_, k) => (v[k] || '').trim() || '—');
  const stripBB = s => s.replace(/\[\/?[A-Za-z]+(=[^\]]*)?\]/g, '');
  const bbToHtml = s => esc(s)
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<b>$1</b>')
    .replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div class="ctr">$1</div>')
    .replace(/\n/g, '<br>');

  function viewEdit(id) {
    const doc = myDocs().find(x => x.id === id);
    if (!doc) return notFound('Документ не найден');
    const tpl = allTpls().find(t => t.id === doc.tpl);
    if (!tpl) return notFound('Шаблон не найден');
    state.cur = { doc, tpl };
    setCrumbs([['Документы', '#/paperwork'], [doc.title]]);
    view.innerHTML = `
      <section class="page-head">
        <div class="grow"><input class="title-input" id="docTitle" value="${esc(doc.title)}" aria-label="Название документа"><p class="save-state" id="saveState">Сохранено</p></div>
        <div class="actions">
          <select class="select" id="docStatus" aria-label="Статус">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${doc.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
          <button class="btn" data-act="copyText">${icon('copy')}Текст</button>
          <button class="btn" data-act="exportPng">PNG</button>
          <button class="btn primary" data-act="copyBB">${icon('copy')}BB-код</button>
        </div>
      </section>
      <div class="editor">
        <form class="form" id="docForm" autocomplete="off">${tpl.fields.map(f => `
          <label class="field"><span>${esc(f.l)}</span>${f.t === 'area'
            ? `<textarea name="${f.k}" rows="6" placeholder="${esc(f.ph || '')}">${esc(doc.values[f.k])}</textarea>`
            : `<input name="${f.k}" value="${esc(doc.values[f.k])}" placeholder="${esc(f.ph || '')}">`}</label>`).join('')}
          <div class="thread" id="thread"></div>
          <button type="button" class="btn" data-act="addSec">${icon('plus')}Добавить секцию</button>
        </form>
        <div class="preview"><div class="preview-head">Предпросмотр</div>
          <div class="sheet" id="sheet">
            <div class="sheet-logo">revolutione<b>”</b></div>
            <div class="sheet-kind">ИНФОРМАЦИОННЫЙ ДОКУМЕНТ</div>
            <div class="sheet-title" id="sheetTitle"></div>
            <div class="sheet-id">ID ${esc(doc.id.slice(-5).toUpperCase())}</div>
            <div class="sheet-meta"><span id="sheetTpl"></span><span>${esc(new Date(doc.created).toLocaleDateString('ru-RU'))}</span></div>
            <div class="paper" id="paper"></div>
            <div class="sheet-foot">
              <svg class="stamp" viewBox="0 0 100 100"><defs><path id="sp" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="50" cy="50" r="29" fill="none" stroke="currentColor"/><text font-size="8" letter-spacing="2" fill="currentColor"><textPath href="#sp">DIGITAL PROOF · TIMESTAMP · VERIFIED ·</textPath></text><path d="M40 58l8-16 8 12 6-8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
              <div class="sign"><span>${esc(meName() || 'Подписант')}</span><i>${esc((profile().name || state.name || 'Sign').split(' ')[0])}</i></div>
            </div>
            <div class="sheet-code"><span>Код документа: ID ${esc(doc.id.slice(-5).toUpperCase())}</span><span>Стр. 1</span></div>
          </div>
        </div>
      </div>`;
    const paper = $('#paper');
    const stateEl = $('#saveState');
    const persist = debounce(() => {
      const list = myDocs();
      const i = list.findIndex(x => x.id === doc.id);
      doc.updated = Date.now();
      if (i >= 0) list[i] = doc; else list.push(doc);
      saveMyDocs(list);
      stateEl.textContent = 'Сохранено';
    }, 400);
    const draw = () => {
      $('#sheetTitle').textContent = '«' + doc.title + '»';
      $('#sheetTpl').textContent = tpl.title;
      paper.innerHTML = bbToHtml(render(tpl, doc.values)) + (doc.sections || []).map(x => `<br><br>${x.t ? `<b>${esc(x.t)}</b><br>` : ''}${rich(x.x)}`).join('');
      const sh = $('#sheet');
      sh.classList.add('tick');
      setTimeout(() => sh.classList.remove('tick'), 350);
    };
    const drawThread = () => {
      doc.sections = doc.sections || [];
      $('#thread').innerHTML = doc.sections.map((x, i) => `<div class="tsec"><span class="tnum">${i + 1}</span><input data-i="${i}" data-f="t" value="${esc(x.t)}" placeholder="Без заголовка"><div class="rtb">${[['bold', 'B'], ['italic', 'I'], ['underline', 'U'], ['insertUnorderedList', '•'], ['insertOrderedList', '1.'], ['justifyLeft', '⇤'], ['justifyCenter', '↔'], ['justifyRight', '⇥']].map(([c, l]) => `<button type="button" data-cmd="${c}" aria-label="${c}">${l}</button>`).join('')}</div><div class="rt" contenteditable="true" data-i="${i}" data-f="x" data-ph="Текст секции">${rich(x.x)}</div><button type="button" class="link-btn" data-act="delSec" data-i="${i}">Убрать</button></div>`).join('');
    };
    const update = () => { draw(); stateEl.textContent = 'Сохранение'; persist(); };
    state.cur.redraw = () => { drawThread(); update(); };
    $('#thread').addEventListener('mousedown', e => {
      const b = e.target.closest('[data-cmd]');
      if (!b) return;
      e.preventDefault();
      document.execCommand(b.dataset.cmd);
      b.closest('.tsec').querySelector('.rt').dispatchEvent(new Event('input', { bubbles: true }));
    });
    $('#docForm').addEventListener('input', e => { if (e.target.name) { doc.values[e.target.name] = e.target.value; update(); } else if (e.target.dataset.i !== undefined) { doc.sections[+e.target.dataset.i][e.target.dataset.f] = e.target.isContentEditable ? e.target.innerHTML : e.target.value; update(); } });
    $('#docTitle').addEventListener('input', e => { doc.title = e.target.value || tpl.title; draw(); stateEl.textContent = 'Сохранение'; persist(); });
    $('#docStatus').addEventListener('change', e => { doc.status = e.target.value; update(); toast('Статус: ' + STATUS[doc.status]); });
    draw();
    drawThread();
  }

  function viewAssistant() {
    setCrumbs([['Ассистент']]);
    const loaded = docs().filter(d => articlesOf(d.id)).length;
    view.innerHTML = `
      <section class="page-head"><div><h1>Ассистент</h1><p>Опишите ситуацию своими словами, и он подберёт подходящие статьи из загруженных документов.</p></div></section>
      <div class="ask">
        <textarea class="input" id="askText" rows="4" placeholder="Например: водитель отказался выйти из машины при остановке"></textarea>
        <div class="actions"><button class="btn primary" data-act="ask">${icon('spark')}Подобрать статьи</button></div>
      </div>
      <div id="askOut">${loaded ? '' : '<div class="empty"><h3>Нет загруженных документов</h3><p>Загрузите законы с Majestic, чтобы ассистенту было из чего выбирать.</p><a class="btn primary" href="#/legal">К законам</a></div>'}</div>`;
    $('#askText').addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') ACT.ask(); });
  }

  function viewHandbook() {
    setCrumbs([['Памятки']]);
    const init = state.params.get('q') || '';
    view.innerHTML = `
      <section class="page-head">
        <div><h1>Памятки</h1><p>Ваши заметки и инструкции под рукой. Ищите по названию, тегам и тексту.</p></div>
        <div class="actions"><button class="btn primary" data-act="newNote">${icon('plus')}Новая памятка</button></div>
      </section>
      <div class="search-field">${icon('search')}<input class="input" id="noteFilter" value="${esc(init)}" placeholder="Поиск по памяткам" autocomplete="off"></div>
      <div class="count"></div>
      <div id="noteList"></div>`;
    const paint = () => {
      const q = lower($('#noteFilter').value.trim());
      const list = notes().filter(n => !q || lower(n.title + ' ' + n.tags + ' ' + n.text).includes(q));
      $('#noteList').innerHTML = list.length ? list.map(n => `
        <details class="note" ${q || list.length === 1 ? 'open' : ''}>
          <summary><b>${esc(n.title)}</b><span class="tags">${esc(n.tags)}</span>${icon('chevron')}</summary>
          <div class="note-body">${esc(n.text).replace(/\n/g, '<br>')}</div>
          <div class="note-actions">
            <button class="icon-btn" data-act="copyNote" data-id="${n.id}" title="Копировать" aria-label="Копировать">${icon('copy')}</button>
            <button class="icon-btn" data-act="editNote" data-id="${n.id}" title="Изменить" aria-label="Изменить">${icon('edit')}</button>
            <button class="icon-btn danger" data-act="delNote" data-id="${n.id}" title="Удалить" aria-label="Удалить">${icon('trash')}</button>
          </div>
        </details>`).join('') : '<div class="empty"><h3>Памяток не найдено</h3><p>Создайте первую или измените запрос.</p></div>';
    };
    $('#noteFilter').addEventListener('input', debounce(paint, 120));
    paint();
  }

  function viewSettings(tab) {
    setCrumbs([['Настройки', '#/settings'], [tab === 'data' ? 'Данные и источник' : 'Профиль']]);
    const tabs = `<div class="tabs"><a class="${tab === 'profile' ? 'on' : ''}" href="#/settings">Профиль</a><a class="${tab === 'data' ? 'on' : ''}" href="#/settings/data">Данные и источник</a></div>`;
    if (tab === 'profile') {
      const p = profile();
      view.innerHTML = `<section class="page-head"><div><h1>Профиль</h1><p>Эти данные подставляются в поля «От кого», «Задержал» и «Санкционировал».</p></div></section>${tabs}
        <form class="panel" id="profileForm" autocomplete="off">
          <label class="field"><span>Имя и фамилия персонажа</span><input name="name" value="${esc(p.name)}" placeholder="Имя Фамилия"></label>
          <label class="field"><span>Звание или должность</span><input name="rank" value="${esc(p.rank)}" placeholder="Офицер"></label>
          <label class="field"><span>Организация</span><input name="org" value="${esc(p.org)}" placeholder="LSPD"></label>
        </form>`;
      $('#profileForm').addEventListener('input', debounce(e => {
        store.set('profile', Object.fromEntries(new FormData($('#profileForm'))));
        renderFoot();
      }, 250));
      return;
    }
    view.innerHTML = `<section class="page-head"><div><h1>Данные и источник</h1><p>Настройки загрузки с Majestic и резервная копия.</p></div></section>${tabs}
      <div class="panel">
        <h2>Хранилище</h2>
        <p class="hint" id="storageInfo">Проверка</p>
        <div class="divider"></div>
        <h2>Загрузка по ссылкам</h2>
        <label class="field"><span>CORS-прокси</span><input id="proxyInput" value="${esc(store.get('proxy', 'https://corsproxy.io/?url='))}" placeholder="https://corsproxy.io/?url="></label>
        <p class="hint">Нужен только если сайт открыт без server.js. Через server.js ссылки скачиваются на сервере и прокси не используется.</p>
        <div class="divider"></div>
        <h2>Резервная копия</h2>
        <div class="actions">
          <button class="btn" data-act="exportData">Скачать JSON</button>
          <label class="btn" tabindex="0">Загрузить JSON<input type="file" id="importFile" accept="application/json" hidden></label>
          <button class="btn danger" data-act="wipe">Очистить всё</button>
        </div>
      </div>`;
    $('#proxyInput').addEventListener('input', e => store.set('proxy', e.target.value.trim()));
    storageInfo();
    $('#importFile').addEventListener('change', async e => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        Object.entries(data).forEach(([k, v]) => { if (k.startsWith('rev.')) store.setRaw(k.slice(4), v); });
        await store.push();
        toast('Данные загружены');
        location.reload();
      } catch { toast('Файл не удалось прочитать'); }
    });
    $('.btn[tabindex]')?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#importFile').click(); } });
  }

  function tplDialog() {
    openDialog(`<form class="dlg-body" id="tplForm" autocomplete="off"><h2>Свой шаблон</h2>
      <label class="field"><span>Название</span><input name="title" required></label>
      <label class="field"><span>Текст. Поля пишите так: {{Имя}}, {{Дата}}. Ваши данные: {{me}}, {{today}}. Жирный: [B]текст[/B]</span><textarea name="body" rows="9" required placeholder="[CENTER][B]ЗАЯВЛЕНИЕ[/B][/CENTER]&#10;От: {{me}}&#10;Дата: {{today}}&#10;{{Текст}}"></textarea></label>
      <div class="dlg-actions"><button type="button" class="btn" data-close>Отмена</button><button class="btn primary">Сохранить</button></div></form>`, d => {
      $('#tplForm', d).addEventListener('submit', e => {
        e.preventDefault();
        const v = Object.fromEntries(new FormData(e.target));
        const body = v.body.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, '{{$1}}');
        const keys = [...new Set([...body.matchAll(/\{\{([^{}]+)\}\}/g)].map(m => m[1]))];
        const list = store.get(skey('tpls'), []);
        list.push({ id: uid(), title: v.title.trim(), desc: 'Свой шаблон', body, fields: keys.map(k => ({ k, l: k, t: /текст|суть|описан|body/i.test(k) ? 'area' : undefined, def: k === 'me' ? 'me' : k === 'today' ? 'today' : undefined })) });
        store.set(skey('tpls'), list);
        dlg.close();
        route();
        toast('Шаблон сохранён');
      });
    });
  }

  function noteDialog(n) {
    openDialog(`<form class="dlg-body" id="noteForm" autocomplete="off">
      <h2>${n ? 'Изменить памятку' : 'Новая памятка'}</h2>
      <label class="field"><span>Название</span><input name="title" required value="${esc(n?.title)}"></label>
      <label class="field"><span>Теги</span><input name="tags" value="${esc(n?.tags)}" placeholder="через запятую"></label>
      <label class="field"><span>Текст</span><textarea name="text" rows="8" required>${esc(n?.text)}</textarea></label>
      <div class="dlg-actions"><button type="button" class="btn" data-close>Отмена</button><button class="btn primary">Сохранить</button></div>
    </form>`, d => {
      $('#noteForm', d).addEventListener('submit', e => {
        e.preventDefault();
        const v = Object.fromEntries(new FormData(e.target));
        const list = notes();
        if (n) { const i = list.findIndex(x => x.id === n.id); list[i] = { ...n, ...v }; } else list.unshift({ id: uid(), ...v });
        saveNotes(list);
        dlg.close();
        if (state.path === '/handbook') route();
        else location.hash = '#/handbook';
      });
    });
  }

  function addDocDialog() {
    openDialog(`<form class="dlg-body" id="addForm" autocomplete="off">
      <h2>Новый документ</h2>
      <label class="field"><span>Название</span><input name="title" required placeholder="Уголовный кодекс"></label>
      <label class="field"><span>Группа</span><select name="group">${Object.entries(GROUPS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
      <label class="field"><span>Ссылка на форум Majestic или Google Документ</span><input name="url" type="url" placeholder="https://forum.majestic-rp.ru/threads/..."></label>
      <div class="dlg-actions"><button type="button" class="btn" data-close>Отмена</button><button class="btn primary">Добавить</button></div>
    </form>`, d => {
      $('#addForm', d).addEventListener('submit', e => {
        e.preventDefault();
        const v = Object.fromEntries(new FormData(e.target));
        const doc = { id: uid(), title: v.title.trim(), group: v.group, url: v.url.trim() };
        saveDocs([...docs(), doc]);
        dlg.close();
        location.hash = '#/legal/doc/' + doc.id;
        toast('Документ добавлен');
      });
    });
  }

  function importDialog(id) {
    const d = docs().find(x => x.id === id);
    if (!d) return;
    openDialog(`<form class="dlg-body" id="impForm" autocomplete="off">
      <h2>Загрузка документа</h2>
      <label class="field"><span>Ссылка на форум Majestic или Google Документ</span><input name="url" type="url" value="${esc(d.url || '')}" placeholder="https://forum.majestic-rp.ru/threads/..."></label>
      <label class="field"><span>Или вставьте текст документа</span><textarea name="text" rows="6" placeholder="Статья 1.1. Название&#10;Текст статьи"></textarea></label>
      <div class="dlg-status" id="impStatus"></div>
      <div class="dlg-actions"><button type="button" class="btn" data-close>Отмена</button><button class="btn primary" id="impGo">Загрузить</button></div>
    </form>`, w => {
      $('#impForm', w).addEventListener('submit', async e => {
        e.preventDefault();
        const v = Object.fromEntries(new FormData(e.target));
        const status = $('#impStatus', w);
        const go = $('#impGo', w);
        if (!v.url.trim() && !v.text.trim()) { status.className = 'dlg-status err'; status.textContent = 'Укажите ссылку или вставьте текст'; return; }
        go.disabled = true;
        status.className = 'dlg-status';
        status.textContent = 'Загрузка';
        try {
          const n = await syncDoc(d, v.url.trim(), v.text.trim());
          dlg.close();
          toast(`Загружено статей: ${n}`);
          route();
        } catch (err) {
          go.disabled = false;
          status.className = 'dlg-status err';
          status.textContent = `${err.name === 'AbortError' ? 'Время ожидания вышло' : err.message}. ${store.remote ? 'Проверьте, что страница открывается без входа в аккаунт, или вставьте текст вручную' : 'Запустите server.js для автоматической загрузки или вставьте текст вручную'}.`;
        }
      });
    });
  }

  const guessGroup = t => /устав|положени/i.test(t) ? 'u' : /кодекс|^конституция/i.test(t) ? 'k' : 'z';
  const cleanTitle = t => String(t || '').split(/\s[|–—-]\s/)[0].trim();
  const firstLine = t => (String(t).split('\n').find(l => l.trim()) || '').trim().slice(0, 90);

  async function pullLaws() {
    const { data } = await sb.from('laws').select('*');
    Object.keys(localStorage).filter(k => /^rev\..+\.(docs|art\..+)$/.test(k)).forEach(k => localStorage.removeItem(k));
    const by = {};
    (data || []).forEach(r => (by[r.server] = by[r.server] || []).push(r));
    Object.entries(by).forEach(([srv, rows]) => {
      localStorage.setItem(`rev.${srv}.docs`, JSON.stringify(rows.map(r => ({ id: r.id, title: r.title, group: r.grp, url: r.url }))));
      rows.forEach(r => localStorage.setItem(`rev.${srv}.art.${r.id}`, JSON.stringify({ items: r.items, src: r.url, at: Date.parse(r.updated_at) })));
    });
  }

  async function pullStore() { await pullLaws(); }

  async function bootstrap() {
    const q = new URLSearchParams(location.search + '&' + location.hash.replace(/^#/, ''));
    state.authError = q.get('error_description') || q.get('error') || '';
    try { await bootstrapInner(); } catch (e) { state.authError = state.authError || String(e.message || e); }
  }

  async function bootstrapInner() {
    const c = window.REV_CONFIG;
    if (!c || !c.url || !window.supabase) return;
    sb = window.supabase.createClient(c.url, c.key, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true } });
    const { data: { session }, error: se } = await sb.auth.getSession();
    if (se) state.authError = se.message;
    state.user = session ? session.user : null;
    const nx = sessionStorage.getItem('rev.next');
    if (state.user && nx) { sessionStorage.removeItem('rev.next'); history.replaceState(null, '', location.pathname + location.search + nx); }
    sb.auth.onAuthStateChange((ev, s) => { if ((s ? s.user.id : null) !== (state.user ? state.user.id : null)) location.reload(); });
    if (!state.user) return;
    const { data: p } = await sb.from('profiles').select('role,name,avatar').eq('id', state.user.id).single();
    if (!p) toast('Профиль не создан: проверьте триггер в schema.sql');
    state.role = (p && p.role) || 'user';
    state.name = (p && p.name) || '';
    state.avatar = (p && p.avatar) || '';
    await pullLaws();
    const { data: kv } = await sb.from('kv').select('key,value');
    store.keys().filter(k => !/\.(docs|art\..+)$/.test(k)).forEach(k => localStorage.removeItem('rev.' + k));
    (kv || []).forEach(r => localStorage.setItem('rev.' + r.key, r.value));
    store.remote = true;
    const toAdmin = () => { location.hash = '#/admin'; };
    ACT.addDoc = ACT.bulkImport = ACT.importDoc = toAdmin;
    ACT.syncAll = async () => {
      toast('Обновление');
      const { data, error } = await sb.functions.invoke('sync-docs', { body: { all: true } });
      if (error) { showErr('Ошибка обновления', await fnErr(error)); return; }
      await pullLaws();
      toast(`Обновлено: ${data.ok}`);
      route();
    };
    ACT.delDocRef = async b => {
      if (!await ask('Удалить документ?', 'Он исчезнет у всех пользователей.')) return;
      await sb.from('laws').delete().eq('id', b.dataset.id);
      await pullLaws();
      location.hash = '#/legal';
      route();
    };
    ACT.adminImport = async () => {
      const srv = $('#admServer').value;
      const items = $('#admLinks').value.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const q = l.split('|').map(x => x.trim()); return { server: srv, url: q[q.length - 1], title: q.length > 1 ? q[0] : '' }; });
      if (!items.length) { toast('Вставьте ссылки'); return; }
      const b = $('#admGo');
      b.disabled = true;
      toast(`Импорт: ${items.length}`);
      const { data, error } = await sb.functions.invoke('sync-docs', { body: { items } });
      b.disabled = false;
      if (error) { showErr('Ошибка импорта', await fnErr(error)); return; }
      await pullLaws();
      toast(`Готово: ${data.ok}, ошибок: ${data.fail.length}`);
      if (data.fail.length) showErr('Не загрузилось', data.fail.join('\n\n'));
      route();
    };
  }

  function hydrate() {
    const s = store.get('server', 'Memphis');
    state.server = SERVERS.includes(s) ? s : 'Memphis';
    state.collapsed = store.get('collapsed', false);
    state.open = store.get('open', { legal: true });
  }

  async function storageInfo() {
    const el = $('#storageInfo');
    if (el) el.textContent = sb ? 'Данные хранятся в Supabase, законы обновляются автоматически.' : 'Supabase не настроен: данные хранятся только в этом браузере.';
  }

  function bulkDialog() {
    openDialog(`<form class="dlg-body" id="bulkForm" autocomplete="off">
      <h2>Импорт списком ссылок</h2>
      <label class="field"><span>По одной ссылке в строке. Можно указать название: Название | ссылка</span><textarea name="list" rows="8" required placeholder="https://forum.majestic-rp.ru/threads/...&#10;Уголовный кодекс | https://docs.google.com/document/d/..."></textarea></label>
      <div class="dlg-status" id="bulkStatus"></div>
      <div class="dlg-actions"><button type="button" class="btn" data-close>Отмена</button><button class="btn primary" id="bulkGo">Импортировать</button></div>
    </form>`, w => {
      $('#bulkForm', w).addEventListener('submit', async e => {
        e.preventDefault();
        const lines = new FormData(e.target).get('list').split('\n').map(l => l.trim()).filter(Boolean);
        const status = $('#bulkStatus', w);
        const go = $('#bulkGo', w);
        go.disabled = true;
        status.className = 'dlg-status';
        const list = docs();
        const failed = [];
        let ok = 0;
        for (const [i, line] of lines.entries()) {
          status.textContent = `Загрузка ${i + 1} из ${lines.length}`;
          const parts = line.split('|').map(x => x.trim());
          const url = parts.length > 1 ? parts[parts.length - 1] : parts[0];
          const name = parts.length > 1 ? parts.slice(0, -1).join(' | ') : '';
          try {
            if (!/^https?:\/\//i.test(url)) throw new Error('bad url');
            const r = await fetchRemote(url);
            const items = parseArticles(r.text);
            if (!items.length) throw new Error('empty');
            let d = list.find(x => x.url === url);
            if (!d) {
              const title = name || cleanTitle(r.title) || firstLine(r.text) || 'Документ';
              d = { id: uid(), title, group: guessGroup(title), url };
              list.push(d);
            }
            store.set(skey('art.' + d.id), { items, src: url, at: Date.now() });
            ok++;
          } catch { failed.push(url); }
        }
        saveDocs(list);
        if (!failed.length) { dlg.close(); toast(`Импортировано: ${ok}`); route(); return; }
        go.disabled = false;
        status.className = 'dlg-status err';
        status.textContent = `Импортировано: ${ok}. Не удалось загрузить: ${failed.join(', ')}`;
        route();
      });
    });
  }

  function paletteItems(q) {
    const nq = lower(q.trim());
    if (!nq) return [
      { label: 'Законы', hint: 'Раздел', href: '#/legal' },
      { label: 'Мои документы', hint: 'Раздел', href: '#/paperwork' },
      { label: 'Создать документ', hint: 'Действие', href: '#/paperwork/new' },
      { label: 'Ассистент', hint: 'Раздел', href: '#/assistant' },
      { label: 'Памятки', hint: 'Раздел', href: '#/handbook' },
      { label: 'Настройки', hint: 'Раздел', href: '#/settings' }
    ];
    const out = [];
    docs().filter(d => lower(d.title).includes(nq)).slice(0, 6).forEach(d => out.push({ label: d.title, hint: 'Закон', href: '#/legal/doc/' + d.id }));
    allTpls().filter(t => lower(t.title).includes(nq)).forEach(t => out.push({ label: 'Создать: ' + t.title, hint: 'Шаблон', run: () => createDoc(t.id) }));
    myDocs().filter(d => lower(d.title).includes(nq)).slice(0, 4).forEach(d => out.push({ label: d.title, hint: 'Мой документ', href: '#/paperwork/edit/' + d.id }));
    notes().filter(n => lower(n.title + ' ' + n.tags).includes(nq)).slice(0, 4).forEach(n => out.push({ label: n.title, hint: 'Памятка', href: '#/handbook?q=' + encodeURIComponent(q.trim()) }));
    let found = 0;
    docs().forEach(d => {
      const a = articlesOf(d.id);
      if (!a || found >= 8) return;
      a.items.forEach(it => {
        if (found < 8 && lower(it.title + ' ' + it.text).includes(nq)) { found++; out.push({ label: `Статья ${it.n}. ${it.title}`, hint: d.title, href: `#/legal/doc/${d.id}?a=${encodeURIComponent(it.n)}` }); }
      });
    });
    return out;
  }

  let palItems = [];
  let palSel = 0;

  function paintPalette() {
    palItems = paletteItems($('#palInput').value);
    palSel = 0;
    $('#palList').innerHTML = palItems.length
      ? palItems.map((it, i) => `<button class="pal-item ${i === 0 ? 'sel' : ''}" data-i="${i}"><span class="pi-label">${esc(it.label)}</span><span class="pi-hint">${esc(it.hint)}</span></button>`).join('')
      : '<div class="pal-empty">Ничего не найдено</div>';
  }

  function palChoose(i) {
    const it = palItems[i];
    if (!it) return;
    pal.close();
    if (it.href) location.hash = it.href; else it.run();
  }

  function palMove(d) {
    if (!palItems.length) return;
    palSel = (palSel + d + palItems.length) % palItems.length;
    $$('.pal-item').forEach((el, i) => el.classList.toggle('sel', i === palSel));
    $$('.pal-item')[palSel].scrollIntoView({ block: 'nearest' });
  }

  function openPalette() {
    $('#palInput').value = '';
    pal.showModal();
    paintPalette();
    $('#palInput').focus();
  }

  const ACT = {
    collapse() {
      state.collapsed = !state.collapsed;
      app.classList.toggle('collapsed', state.collapsed);
      store.set('collapsed', state.collapsed);
    },
    openDrawer() { app.classList.add('drawer'); },
    newTpl() { tplDialog(); },
    login() { sessionStorage.setItem('rev.next', location.hash); if (sb) sb.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: location.origin + location.pathname } }); },
    logout() { if (sb) sb.auth.signOut(); },
    addSec() { state.cur.doc.sections = (state.cur.doc.sections || []).concat({ t: '', x: '' }); state.cur.redraw(); },
    delSec(b) { state.cur.doc.sections.splice(+b.dataset.i, 1); state.cur.redraw(); },
    exportPng() {
      if (!window.html2canvas) { toast('Не удалось загрузить экспорт'); return; }
      window.html2canvas($('#sheet'), { backgroundColor: '#000', scale: 2 }).then(c => {
        const a = document.createElement('a');
        a.href = c.toDataURL('image/png');
        a.download = (state.cur.doc.title || 'document') + '.png';
        a.click();
      });
    },
    closeDrawer() { app.classList.remove('drawer'); },
    palette: openPalette,
    toggleSec(b) {
      const id = b.dataset.id;
      if (state.collapsed && !matchMedia('(max-width: 760px)').matches) {
        state.collapsed = false;
        app.classList.remove('collapsed');
        store.set('collapsed', false);
        state.open[id] = true;
      } else state.open[id] = !state.open[id];
      store.set('open', state.open);
      renderNav();
    },
    addDoc: addDocDialog,
    bulkImport: bulkDialog,
    importDoc(b) { importDialog(b.dataset.id); },
    async syncAll() {
      const list = docs().filter(d => d.url);
      if (!list.length) { toast('Добавьте ссылки на Majestic в карточках документов'); return; }
      if (store.remote) {
        toast(`Загрузка документов: ${list.length}`);
        try {
          const r = await (await fetch('/api/sync?server=' + encodeURIComponent(state.server), { method: 'POST' })).json();
          await pullStore();
          toast(r.busy ? 'Обновление уже идёт' : `Обновлено: ${r.ok} из ${r.ok + r.fail}`);
        } catch { toast('Сервер не ответил'); }
        route();
        return;
      }
      let ok = 0;
      for (const [i, d] of list.entries()) {
        toast(`Загрузка ${i + 1} из ${list.length}`);
        try { await syncDoc(d, d.url); ok++; } catch { }
      }
      toast(`Обновлено: ${ok} из ${list.length}`);
      route();
    },
    async delDocRef(b) {
      if (!await ask('Удалить документ?', 'Документ и загруженный текст исчезнут из списка.')) return;
      saveDocs(docs().filter(d => d.id !== b.dataset.id));
      store.del(skey('art.' + b.dataset.id));
      location.hash = '#/legal';
    },
    copyArt(b) {
      const a = articlesOf(state.docId);
      const it = a && a.items.find(x => x.n === b.dataset.n);
      if (it) copy(`Статья ${it.n}. ${it.title}\n${it.text}`, 'Статья скопирована');
    },
    newFrom(b) { createDoc(b.dataset.id); },
    dupDoc(b) {
      const list = myDocs();
      const d = list.find(x => x.id === b.dataset.id);
      if (!d) return;
      list.push({ ...d, id: uid(), title: d.title + ' (копия)', status: 'draft', values: { ...d.values }, created: Date.now(), updated: Date.now() });
      saveMyDocs(list);
      route();
      toast('Копия создана');
    },
    async delMyDoc(b) {
      if (!await ask('Удалить документ?', 'Это действие нельзя отменить.')) return;
      saveMyDocs(myDocs().filter(d => d.id !== b.dataset.id));
      route();
    },
    copyBB() { const { doc, tpl } = state.cur; copy(render(tpl, doc.values), 'BB-код скопирован'); },
    copyText() { const { doc, tpl } = state.cur; copy(stripBB(render(tpl, doc.values)), 'Текст скопирован'); },
    ask() {
      const q = $('#askText').value.trim();
      const out = $('#askOut');
      if (!q) { toast('Опишите ситуацию'); return; }
      const res = rank(q);
      out.innerHTML = res.length
        ? res.map(r => `<a class="result" href="#/legal/doc/${r.d.id}?a=${encodeURIComponent(r.it.n)}"><div class="r-top"><span class="r-n">Статья ${esc(r.it.n)}</span><b>${esc(r.it.title)}</b><span class="r-doc">${esc(r.d.title)}</span></div><p>${esc(r.it.text.slice(0, 220))}${r.it.text.length > 220 ? '…' : ''}</p></a>`).join('')
        : '<div class="empty"><h3>Подходящих статей нет</h3><p>Переформулируйте ситуацию или загрузите больше документов.</p></div>';
    },
    newNote() { noteDialog(null); },
    editNote(b) { noteDialog(notes().find(n => n.id === b.dataset.id)); },
    copyNote(b) { const n = notes().find(x => x.id === b.dataset.id); if (n) copy(`${n.title}\n\n${n.text}`); },
    async delNote(b) {
      if (!await ask('Удалить памятку?', 'Это действие нельзя отменить.')) return;
      saveNotes(notes().filter(n => n.id !== b.dataset.id));
      route();
    },
    exportData() {
      const data = {};
      Object.keys(localStorage).filter(k => k.startsWith('rev.')).forEach(k => { data[k] = localStorage.getItem(k); });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
      a.download = 'revolutione-backup.json';
      a.click();
      URL.revokeObjectURL(a.href);
    },
    async wipe() {
      if (!await ask('Очистить все данные?', 'Документы, памятки, профиль и загруженные законы будут удалены из этого браузера.', 'Очистить')) return;
      await store.clear();
      location.hash = '#/legal';
      location.reload();
    }
  };

  const orgR = (f, a) => (window.ORG && sb ? window.ORG[f](a) : setTimeout(route, 80));
  const ROUTES = [
    [/^\/orgs$/, () => orgR('list')],
    [/^\/org\/([\w-]+)$/, m => orgR('board', { id: m[1] })],
    [/^\/org\/([\w-]+)\/templates$/, m => orgR('templates', m[1])],
    [/^\/v\/([\w-]+)$/, m => orgR('board', { token: m[1] })],
    [/^\/org\/([\w-]+)\/settings$/, m => orgR('settings', m[1])],
    [/^\/legal(?:\/(k|z|u))?$/, m => viewLegal(m[1])],
    [/^\/legal\/doc\/([\w-]+)$/, m => viewDoc(m[1])],
    [/^\/paperwork$/, viewPaperwork],
    [/^\/paperwork\/new$/, viewNew],
    [/^\/paperwork\/edit\/([\w-]+)$/, m => viewEdit(m[1])],
    [/^\/admin$/, viewAdmin],
    [/^\/board$/, viewBoard],
    [/^\/assistant$/, viewAssistant],
    [/^\/handbook$/, viewHandbook],
    [/^\/settings(?:\/(data))?$/, m => viewSettings(m[1] || 'profile')]
  ];

  function route() {
    const [path, qs] = (location.hash.slice(1) || '/legal').split('?');
    state.path = path;
    state.params = new URLSearchParams(qs || '');
    view.classList.remove('wide');
    app.classList.toggle('guest', !!(sb && !state.user));
    if (sb && !state.user) { viewLogin(); return; }
    const hit = ROUTES.find(r => r[0].test(path));
    if (!state.params.get('a')) window.scrollTo(0, 0);
    if (hit) hit[1](path.match(hit[0])); else notFound();
    NAV.forEach(s => { if (s.items.some(i => i.href && isActive(i.href))) state.open[s.id] = true; });
    renderNav();
    renderFoot();
    app.classList.remove('drawer');
    document.title = 'revolutione';
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (b && ACT[b.dataset.act]) ACT[b.dataset.act](b, e);
  });

  pal.addEventListener('click', e => {
    if (e.target === pal) pal.close();
    const it = e.target.closest('.pal-item');
    if (it) palChoose(+it.dataset.i);
  });
  $('#palInput').addEventListener('input', debounce(paintPalette, 80));
  $('#palInput').addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); palMove(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); palMove(-1); }
    if (e.key === 'Enter') { e.preventDefault(); palChoose(palSel); }
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.open ? pal.close() : openPalette(); return; }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !dlg.open && !pal.open) { e.preventDefault(); openPalette(); }
  });

  window.REV = { $, esc, icon, view, state, toast, copy, openDialog, dlg, ask, setCrumbs, notFound, fmtDate, uid, sanitize, rich, route, get sb() { return sb; } };

  const select = $('#serverSelect');
  select.addEventListener('change', () => {
    state.server = select.value;
    store.set('server', state.server);
    location.hash = '#/legal';
    route();
  });

  $('#collapseBtn').innerHTML = icon('panel');
  $('#menuBtn').innerHTML = icon('menu');
  $('#searchIcon').innerHTML = icon('search');

  window.addEventListener('hashchange', route);
  bootstrap().then(() => {
    hydrate();
    select.innerHTML = SERVERS.map(s => `<option ${s === state.server ? 'selected' : ''}>${s}</option>`).join('');
    app.classList.toggle('collapsed', state.collapsed);
    route();
  });
})();
