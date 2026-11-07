(() => {
  const R = window.REV;
  const { $, esc, icon, toast } = R;
  const sb = () => R.sb;
  const HOOK = /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//;
  const CMDS = [['bold', 'B'], ['italic', 'I'], ['underline', 'U'], ['insertUnorderedList', '•'], ['insertOrderedList', '1.'], ['justifyLeft', '⇤'], ['justifyCenter', '↔'], ['justifyRight', '⇥']];
  const STAMP = '<img class="stamp" src="stamp.png" alt="">';
  let D = null;
  let edit = false;
  let redraw = () => {};

  const toText = h => {
    const t = document.createElement('template');
    t.innerHTML = h.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(div|p|li)>/gi, '\n');
    return t.content.textContent.replace(/\n{3,}/g, '\n\n').trim();
  };
  const keys = s => [...new Set([...s.matchAll(/\{\{([^{}]+)\}\}/g)].map(m => m[1].trim()))];
  const fieldsOf = tp => (tp ? keys((tp.sections || []).map(s => s.t + ' ' + s.x).join(' ')) : []);
  const sub = (s, v, b) => s.replace(/\{\{([^{}]+)\}\}/g, (_, k) => { const x = esc((v[k.trim()] || '').trim()) || '—'; return b ? `<b>${x}</b>` : x; });
  const bodyOf = (tp, v) => (tp.sections || []).map(s => (s.t ? `<b>${sub(esc(s.t), v)}</b><br>` : '') + sub(R.rich(s.x), v, true)).join('<br><br>');
  const wide = () => { R.dlg.classList.add('dlg-wide'); R.dlg.addEventListener('close', () => R.dlg.classList.remove('dlg-wide'), { once: true }); };

  async function load(arg) {
    const { data } = await sb().rpc('org_load', { p_org: arg.id || null, p_token: arg.token || null });
    D = data || null;
    return D;
  }

  async function list() {
    R.setCrumbs([['Организации']]);
    const { data } = await sb().from('org_members').select('role, orgs(id,name,slug,share_token)');
    const rows = (data || []).filter(r => r.orgs);
    R.view.innerHTML = `<section class="page-head"><div><h1>Организации</h1><p>Создайте организацию, соберите документооборот на доске и поделитесь ссылкой.</p></div><div class="actions"><button class="btn primary" data-o="newOrg">${icon('plus')}Создать организацию</button></div></section>${rows.length ? `<div class="list">${rows.map(r => `<a class="row" href="${r.role === 'admin' ? '#/org/' + r.orgs.id : '#/v/' + (r.orgs.slug || r.orgs.share_token)}"><span class="row-title">${esc(r.orgs.name)}</span><span class="row-meta">${r.role === 'admin' ? 'Админ' : 'Участник'}</span>${icon('chevron')}</a>`).join('')}</div>` : '<div class="empty"><h3>Организаций пока нет</h3><p>Создайте первую, чтобы начать.</p></div>'}`;
  }

  async function board(arg) {
    if (!await load(arg)) return R.notFound('Организация не найдена или нет доступа');
    edit = !!arg.id && D.org.admin;
    R.setCrumbs([['Организации', '#/orgs'], [D.org.name]]);
    R.view.classList.add('wide');
    const link = `${location.origin}${location.pathname}#/v/${D.org.slug || D.org.token}`;
    const bar = edit
      ? `<button class="btn" data-o="addNote">+ Заметка</button><button class="btn" data-o="addDoc">+ Документ</button><button class="btn" data-o="addGroup">+ Группа</button><button class="btn" id="connBtn" data-o="connect">Соединить</button><a class="btn" href="#/org/${D.org.id}/templates">Шаблоны</a><a class="btn" href="#/org/${D.org.id}/settings">Настройки</a><button class="btn primary" data-o="copyLink" data-link="${esc(link)}">Ссылка для зрителей</button>`
      : `<span class="bar-note">${esc(D.org.name)}: нажмите на документ, чтобы заполнить</span>${D.org.admin ? `<a class="btn" href="#/org/${D.org.id}">Управлять</a>` : ''}`;
    R.view.innerHTML = `<div class="board" id="board"><div class="board-inner" id="boardInner"></div><div class="board-bar"><div class="bar-group wrap">${bar}</div></div></div>`;
    const box = $('#board');
    const inner = $('#boardInner');
    const dim = n => (n.kind === 'note' ? [220, 84] : n.kind === 'group' ? [220, 44] : [190, 40]);
    const get = id => D.nodes.find(n => n.id === id);
    const path = e => {
      const a = get(e.a);
      const b = get(e.b);
      if (!a || !b) return '';
      const x1 = a.x + dim(a)[0];
      const y1 = a.y + dim(a)[1] / 2;
      const y2 = b.y + dim(b)[1] / 2;
      const m = (x1 + b.x) / 2;
      const d = `M${x1} ${y1}C${m} ${y1} ${m} ${y2} ${b.x} ${y2}`;
      return `<path class="hit" data-e="${e.id}" d="${d}"/><path d="${d}"/>`;
    };
    const paintEdges = () => { $('.threads', box).innerHTML = D.edges.map(path).join(''); };
    redraw = () => {
      inner.innerHTML = `<svg class="threads" width="1" height="1"></svg>${D.nodes.map((n, i) => `<button class="node ${n.kind}" style="left:${n.x}px;top:${n.y}px;animation-delay:${i * 30}ms" data-id="${n.id}"><small>${{ note: 'Заметка', doc: 'Документ', group: 'Группа' }[n.kind]}</small>${esc(n.kind === 'note' ? (n.body || n.title) : n.title)}</button>`).join('')}`;
      paintEdges();
    };
    redraw();
    const v = { x: 40, y: 60, k: 1 };
    const apply = () => { inner.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.k})`; };
    apply();
    let drag = null;
    let dn = null;
    let moved = 0;
    let conn = false;
    let first = null;
    box.addEventListener('pointerdown', e => {
      if (e.target.closest('.board-bar')) return;
      moved = 0;
      const el = e.target.closest('.node');
      if (el && edit && !conn) { const n = get(el.dataset.id); dn = { el, n, sx: e.clientX, sy: e.clientY, ox: n.x, oy: n.y }; return; }
      if (!el) drag = { x: e.clientX - v.x, y: e.clientY - v.y };
    });
    const mv = e => {
      if (!box.isConnected) return;
      if (dn) {
        moved++;
        dn.n.x = Math.round(dn.ox + (e.clientX - dn.sx) / v.k);
        dn.n.y = Math.round(dn.oy + (e.clientY - dn.sy) / v.k);
        dn.el.style.left = dn.n.x + 'px';
        dn.el.style.top = dn.n.y + 'px';
        paintEdges();
      } else if (drag) { moved++; v.x = e.clientX - drag.x; v.y = e.clientY - drag.y; apply(); }
    };
    const up = () => {
      if (dn && moved > 4) sb().from('org_nodes').update({ x: dn.n.x, y: dn.n.y }).eq('id', dn.n.id).then(() => {});
      dn = null;
      drag = null;
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
    box.addEventListener('wheel', e => { e.preventDefault(); v.k = Math.min(2, Math.max(0.4, v.k * (e.deltaY < 0 ? 1.1 : 0.9))); apply(); }, { passive: false });
    box.addEventListener('click', async e => {
      if (e.target.closest('.board-bar') || moved > 4) return;
      const ed = e.target.closest('[data-e]');
      if (ed && edit) {
        if (await R.ask('Удалить связь?', 'Карточки останутся на доске.')) { await sb().from('org_edges').delete().eq('id', ed.dataset.e); D.edges = D.edges.filter(x => x.id !== ed.dataset.e); paintEdges(); }
        return;
      }
      const el = e.target.closest('.node');
      if (!el) return;
      const n = get(el.dataset.id);
      if (conn) {
        if (!first) { first = n.id; el.classList.add('pick'); return; }
        if (first !== n.id && !D.edges.some(x => (x.a === first && x.b === n.id) || (x.a === n.id && x.b === first))) {
          const { data } = await sb().from('org_edges').insert({ org_id: D.org.id, a: first, b: n.id }).select().single();
          if (data) D.edges.push(data);
        }
        first = null;
        redraw();
        return;
      }
      if (edit) { if (n.kind === 'note') return noteDlg(n); if (n.kind === 'group') return groupDlg(n); location.hash = '#/org/' + D.org.id + '/doc/' + n.id; return; }
      if (n.kind === 'doc') location.hash = '#/d/' + (D.org.slug || D.org.token) + '/' + n.id; else R.openDialog(`<div class="dlg-body"><h2>${esc(n.title || 'Заметка')}</h2><p class="muted" style="white-space:pre-wrap">${esc(n.body)}</p><div class="dlg-actions"><button class="btn" data-close>Закрыть</button></div></div>`);
    });
    box.addEventListener('mousedown', () => {});
    H.connect = b => { conn = !conn; first = null; b.classList.toggle('primary', conn); redraw(); toast(conn ? 'Нажмите на две карточки, чтобы соединить' : 'Режим соединения выключен'); };
    H.addNote = () => addNode('note');
    H.addDoc = () => addNode('doc');
    H.addGroup = () => addNode('group');
    H.copyLink = b => R.copy(b.dataset.link, 'Ссылка скопирована');
  }

  async function addNode(kind) {
    const k = D.nodes.length * 22;
    const { data, error } = await sb().from('org_nodes').insert({ org_id: D.org.id, kind, x: 60 + k, y: 60 + k, title: kind === 'doc' ? 'Новый документ' : kind === 'group' ? 'Группа' : '', body: kind === 'note' ? 'Новая заметка' : '' }).select().single();
    if (error) return toast('Не удалось добавить');
    D.nodes.push(data);
    redraw();
    if (kind === 'note') noteDlg(data); else if (kind === 'group') groupDlg(data); else location.hash = '#/org/' + D.org.id + '/doc/' + data.id;
  }

  function noteDlg(n) {
    R.openDialog(`<form class="dlg-body" id="nf"><h2>Заметка</h2><label class="field"><span>Текст</span><textarea name="body" rows="6">${esc(n.body)}</textarea></label><div class="dlg-actions"><button type="button" class="btn danger" data-o="delNode">Удалить</button><button class="btn primary">Сохранить</button></div></form>`, d => {
      H.delNode = () => delNode(n);
      $('#nf', d).addEventListener('submit', async e => {
        e.preventDefault();
        n.body = new FormData(e.target).get('body');
        await sb().from('org_nodes').update({ body: n.body }).eq('id', n.id);
        R.dlg.close();
        redraw();
      });
    });
  }

  async function delNode(n) {
    await sb().from('org_nodes').delete().eq('id', n.id);
    D.nodes = D.nodes.filter(x => x.id !== n.id);
    D.edges = D.edges.filter(x => x.a !== n.id && x.b !== n.id);
    R.dlg.close();
    redraw();
  }


  function groupDlg(n) {
    R.openDialog(`<form class="dlg-body" id="gf"><h2>Группа</h2><label class="field"><span>Название</span><input name="title" value="${esc(n.title)}" required></label><div class="dlg-actions"><button type="button" class="btn danger" data-o="delNode">Удалить</button><button class="btn primary">Сохранить</button></div></form>`, d => {
      H.delNode = () => delNode(n);
      $('#gf', d).addEventListener('submit', async e => {
        e.preventDefault();
        n.title = new FormData(e.target).get('title').trim();
        await sb().from('org_nodes').update({ title: n.title }).eq('id', n.id);
        R.dlg.close();
        redraw();
      });
    });
  }

  async function settings(id) {
    if (!await load({ id }) || !D.org.admin) return R.notFound('Нет доступа');
    R.setCrumbs([['Организации', '#/orgs'], [D.org.name, '#/org/' + id], ['Настройки']]);
    const [h, m] = await Promise.all([sb().from('org_webhooks').select('id,name,message').eq('org_id', id), sb().from('org_members').select('user_id,name,role').eq('org_id', id)]);
    const b = D.org.brand || {};
    const br = { ...b };
    const upw = (lbl, k) => `<div class="field"><span>${lbl}</span><div class="up"><div class="up-prev">${br[k] ? `<img src="${esc(br[k])}" alt="">` : '<span>Нет</span>'}</div><div class="actions"><label class="btn">Загрузить<input type="file" accept="image/*" data-bup="${k}" hidden></label>${br[k] ? `<button class="btn" data-o="bClear" data-k="${k}">Убрать</button>` : ''}</div></div></div>`;
    const link = `${location.origin}${location.pathname}#/v/${D.org.slug || D.org.token}`;
    R.view.innerHTML = `<section class="page-head"><div><h1>Настройки</h1><p>Адрес, оформление документов, состав и каналы публикации.</p></div><div class="actions"><a class="btn" href="#/org/${id}">К доске</a></div></section><div class="set">
      <section class="card"><h2>Основное</h2>
        <label class="field"><span>Название</span><input id="sName" value="${esc(D.org.name)}"></label>
        <label class="field"><span>Адрес (латиница, цифры, дефис)</span><input id="sSlug" value="${esc(D.org.slug || '')}" placeholder="my-org"></label>
        <p class="hint">Ссылка для состава: ${esc(link)}</p>
        <div class="actions"><button class="btn primary" data-o="saveMain">Сохранить</button><button class="btn" data-o="copyLink" data-link="${esc(link)}">Копировать ссылку</button><button class="btn danger" data-o="delOrg">Удалить организацию</button></div></section>
      <section class="card"><h2>Оформление листа</h2>
        <label class="field"><span>Цвет</span><input id="bColor" type="color" value="${esc(b.color || '#b4f23c')}"></label>
        <label class="field"><span>Строка в шапке</span><input id="bTitle" value="${esc(b.title || '')}" placeholder="Информационный документ"></label>
        ${upw('Логотип', 'logo')}${upw('Штамп (по умолчанию stamp.png)', 'stamp')}
        <div class="actions"><button class="btn primary" data-o="saveBrand">Сохранить</button></div></section>
      <section class="card"><h2>Состав</h2><p class="hint">Участники состава могут публиковать документы в Discord. Человек должен хотя бы раз войти на сайт.</p>
        ${(m.data || []).map(x => `<div class="row"><span class="row-title">${esc(x.name || 'Без имени')}</span><span class="row-meta">${x.role === 'admin' ? 'Лидер' : 'Состав'}</span>${x.role === 'admin' ? '' : `<button class="icon-btn danger" data-o="delMember" data-id="${x.user_id}" aria-label="Убрать">${icon('trash')}</button>`}</div>`).join('')}
        <div class="actions"><input class="input" id="mName" placeholder="Ник в Discord" style="max-width:240px"><button class="btn" data-o="addMember">Добавить</button></div></section>
      <section class="card"><h2>Каналы публикации</h2><p class="hint">Вебхук и текст сообщения. Пинг роли пишется как &lt;@&amp;ID_РОЛИ&gt;. Затем отметьте канал на нужных документах на доске.</p>
        ${(h.data || []).map(w => `<div class="row"><span class="row-title">${esc(w.name)}</span><span class="row-meta">${esc((w.message || '').slice(0, 30))}</span><button class="icon-btn danger" data-o="delHook" data-id="${w.id}" aria-label="Удалить">${icon('trash')}</button></div>`).join('')}
        <label class="field"><span>Название</span><input id="wName" placeholder="Контрактация"></label>
        <label class="field"><span>URL вебхука</span><input id="wUrl" placeholder="https://discord.com/api/webhooks/..."></label>
        <label class="field"><span>Текст сообщения</span><textarea id="wMsg" rows="2" placeholder="&lt;@&amp;ID_РОЛИ&gt; новый документ"></textarea></label>
        <div class="actions"><button class="btn primary" data-o="addHook">Добавить канал</button></div></section></div>`;
    const val = q => $(q).value.trim();
    R.view.querySelectorAll('[data-bup]').forEach(i => {
      i.onchange = async e => {
        try { toast('Загрузка'); br[i.dataset.bup] = await uploadImage(e.target.files[0]); await H.saveBrand(); settings(id); } catch (er) { toast('Не удалось загрузить картинку'); }
      };
    });
    H.bClear = async b => { br[b.dataset.k] = ''; await H.saveBrand(); settings(id); };
    H.copyLink = b => R.copy(b.dataset.link, 'Ссылка скопирована');
    H.saveMain = async () => {
      const slug = val('#sSlug').toLowerCase();
      if (slug && !/^[a-z0-9-]{3,40}$/.test(slug)) return toast('Адрес: 3-40 символов, латиница, цифры, дефис');
      const { error } = await sb().from('orgs').update({ name: val('#sName'), slug: slug || null }).eq('id', id);
      if (error) return toast(error.code === '23505' ? 'Адрес уже занят' : 'Не удалось сохранить');
      toast('Сохранено');
      settings(id);
    };
    H.saveBrand = async () => {
      const { error } = await sb().from('orgs').update({ brand: { color: val('#bColor'), title: val('#bTitle'), logo: br.logo || '', stamp: br.stamp || '' } }).eq('id', id);
      toast(error ? 'Не удалось сохранить' : 'Оформление сохранено');
    };
    H.addMember = async () => { const { data } = await sb().rpc('org_add_member', { p_org: id, p_name: val('#mName') }); if (data !== 'ok') return toast(data || 'Ошибка'); settings(id); };
    H.delMember = async b => { await sb().rpc('org_remove_member', { p_org: id, p_user: b.dataset.id }); settings(id); };
    H.addHook = async () => {
      if (!val('#wName') || !HOOK.test(val('#wUrl'))) return toast('Нужны название и ссылка вебхука Discord');
      await sb().from('org_webhooks').insert({ org_id: id, name: val('#wName'), url: val('#wUrl'), message: val('#wMsg') });
      settings(id);
    };
    H.delHook = async b => { await sb().from('org_webhooks').delete().eq('id', b.dataset.id); settings(id); };
    H.delOrg = async () => { if (!await R.ask('Удалить организацию?', 'Доска, шаблоны и состав пропадут навсегда.')) return; await sb().from('orgs').delete().eq('id', id); location.hash = '#/orgs'; };
  }

  async function uploadImage(file) {
    if (!file || !/^image\//.test(file.type)) throw new Error('Нужна картинка');
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, (sb() ? 900 : 500) / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    if (!sb() || !R.state.user) return new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    const path = `${R.state.user.id}/${R.uid()}.png`;
    const { error } = await sb().storage.from('images').upload(path, blob, { contentType: 'image/png', cacheControl: '31536000' });
    if (error) throw error;
    return sb().storage.from('images').getPublicUrl(path).data.publicUrl;
  }

  const AL = { left: 'flex-start', center: 'center', right: 'flex-end', between: 'space-between' };
  const TL = { block: 'Блок', spacer: 'Отступ', text: 'Текст', line: 'Линия', image: 'Изображение', content: 'Содержимое документа', signers: 'Блок подписей' };
  const DEF = {
    block: { name: 'Блок', dir: 'column', align: 'center', gap: 6, pad: 0, children: [] },
    spacer: { h: 16 },
    text: { text: 'Текст', size: 14, weight: 400, align: 'left', upper: false, color: '' },
    line: { thick: 2, w: 100, color: '' },
    image: { url: '', w: 120 },
    content: { size: 14, align: 'left' },
    signers: {}
  };
  const SEL3 = ['left:Слева', 'center:По центру', 'right:Справа'];
  const FIELDS = {
    block: [['name', 'Название'], ['dir', 'Направление', ['column:Столбец', 'row:Строка']], ['align', 'Выравнивание', ['left:Слева', 'center:По центру', 'right:Справа', 'between:По краям']], ['gap', 'Расстояние', 'n'], ['pad', 'Внутренний отступ', 'n']],
    spacer: [['h', 'Высота', 'n']],
    text: [['text', 'Текст (поля: {{title}}, {{code}}, {{date}}, {{org}}, {{author}})', 'a'], ['size', 'Размер', 'n'], ['weight', 'Жирность', ['400:Обычный', '500:Средний', '600:Жирный', '700:Очень жирный']], ['align', 'Выравнивание', SEL3], ['upper', 'Заглавные', 'c'], ['color', 'Цвет', 'col']],
    line: [['thick', 'Толщина', 'n'], ['w', 'Ширина, %', 'n'], ['color', 'Цвет', 'col']],
    image: [['url', 'Картинка', 'img'], ['w', 'Ширина', 'n']],
    content: [['size', 'Размер текста', 'n'], ['align', 'Выравнивание', SEL3]],
    signers: []
  };
  const PAGEF = [['bg', 'Фон страницы', 'col'], ['color', 'Цвет текста', 'col'], ['pad', 'Поля страницы', 'n']];
  const deb = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const tx = (text, o = {}) => ({ id: R.uid(), type: 'text', text, size: 14, weight: 400, align: 'center', upper: false, color: '', ...o });
  const bl = (name, children) => ({ id: R.uid(), type: 'block', name, dir: 'column', align: 'center', gap: 6, pad: 0, children });
  const ln = o => ({ id: R.uid(), type: 'line', thick: 2, w: 100, color: '', ...o });

  const preset = k => {
    const logo = { id: R.uid(), type: 'image', url: ((D && D.org && D.org.brand) || {}).logo || '', w: 110 };
    const content = { id: R.uid(), type: 'content', size: 14, align: 'left' };
    const sg = { id: R.uid(), type: 'signers' };
    if (k === 'dark') return { page: { bg: '#0a0a0b', color: '#ffffff', pad: 36 }, blocks: [bl('Шапка', [logo, tx('{{org}}', { size: 22, weight: 600 }), tx('{{title}}', { size: 13, weight: 600, upper: true }), tx('№ {{code}}', { size: 11, color: '#888888' })]), ln({ thick: 1, color: '#333333' }), content, sg] };
    if (k === 'light') return { page: { bg: '#ffffff', color: '#111111', pad: 36 }, blocks: [bl('Шапка', [logo, tx('{{org}}', { size: 18, weight: 600, upper: true }), tx('{{title}}', { size: 13, weight: 500 }), tx('№ {{code}} от {{date}}', { size: 11, color: '#666666' })]), ln({ thick: 2, color: '#111111' }), content, ln({ thick: 1, color: '#cccccc' }), sg] };
    return { page: { bg: '#ffffff', color: '#111111', pad: 36 }, blocks: [tx('{{title}}', { size: 20, weight: 600, align: 'left' }), content, sg] };
  };
  const layoutOf = t => t.layout || preset('dark');
  const SAMPLE = () => ({ title: 'Название документа', code: 'DOC-0000', date: new Date().toLocaleDateString('ru-RU'), author: 'Имя Фамилия', content: '<div class="sec-t">Название секции:</div>Пример содержимого документа.', signers: [{ name: 'Имя Фамилия', pos: 'Должность' }], edit: true });
  const tok = (t, c) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => esc({ title: c.title, code: c.code, date: c.date, org: D.org.name, author: c.author, page: '1' }[k] || ''));

  function rb(b, c, sel) {
    const cls = sel && sel === b.id ? ' sel' : '';
    const a = `data-bid="${b.id}"`;
    if (b.type === 'block') {
      const row = b.dir === 'row';
      return `<div class="lb${cls}" ${a} style="flex-direction:${row ? 'row' : 'column'};gap:${+b.gap || 0}px;padding:${+b.pad || 0}px;${row ? `justify-content:${AL[b.align] || 'space-between'};align-items:center` : `align-items:${AL[b.align] || 'center'}`}">${(b.children || []).map(x => rb(x, c, sel)).join('') || (c.edit ? '<div class="ph">Пустой блок</div>' : '')}</div>`;
    }
    if (b.type === 'spacer') return `<div class="lsp${cls}" ${a} style="height:${+b.h || 0}px"></div>`;
    if (b.type === 'text') return `<div class="lt${cls}" ${a} style="font-size:${+b.size || 14}px;font-weight:${b.weight || 400};text-align:${b.align || 'left'};${b.upper ? 'text-transform:uppercase;' : ''}${b.color ? `color:${esc(b.color)}` : ''}">${tok(esc(b.text || ''), c).replace(/\n/g, '<br>')}</div>`;
    if (b.type === 'line') return `<div class="ll${cls}" ${a}><i style="height:${+b.thick || 1}px;width:${+b.w || 100}%;background:${esc(b.color || 'currentColor')}"></i></div>`;
    if (b.type === 'image') return b.url ? `<img class="li${cls}" ${a} src="${esc(b.url)}" crossorigin="anonymous" alt="" style="width:${+b.w || 120}px">` : (c.edit ? `<div class="ph${cls}" ${a}>Изображение</div>` : '');
    if (b.type === 'content') return `<div class="lc${cls}" ${a} style="font-size:${+b.size || 14}px;text-align:${b.align || 'left'}">${c.content || (c.edit ? '<span class="ph">Содержимое документа</span>' : '')}</div>`;
    return `<div class="ls${cls}" ${a}><img class="stamp" src="${esc((D.org.brand || {}).stamp || 'stamp.png')}" alt=""><div class="signs">${c.signers.filter(x => x.name).map(x => `<div class="sign"><span>${esc(x.pos)}${x.pos ? ', ' : ''}${esc(x.name)}</span><i>${esc(x.name)}</i></div>`).join('')}</div></div>`;
  }
  const pageHtml = (L, c, sel) => `<div class="lpage${c.edit ? ' edit' : ''}" style="background:${esc(L.page.bg)};color:${esc(L.page.color)};padding:${+L.page.pad || 0}px;--brand:${esc((D.org.brand || {}).color || '#b4f23c')}">${L.blocks.map(b => rb(b, c, sel)).join('')}</div>`;

  function gallery(items, pick) {
    R.openDialog(`<div class="dlg-body"><h2>Выбор шаблона</h2><div class="gal">${items.map((it, i) => `<button class="gcard" data-g="${i}"><div class="thumb"><div class="thumb-in">${pageHtml(it.layout, SAMPLE())}</div></div><span>${esc(it.name)}</span></button>`).join('')}</div><div class="dlg-actions"><button class="btn" data-close>Отмена</button></div></div>`, d => {
      wide();
      d.querySelector('.gal').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) { R.dlg.close(); pick(items[+b.dataset.g]); } });
    });
  }

  const field = ([k, l, t], o) => {
    const v = o[k] ?? '';
    const a = `data-p="${k}"`;
    const inp = Array.isArray(t) ? `<select ${a}>${t.map(x => { const [val, lab] = x.split(':'); return `<option value="${val}" ${String(v) === val ? 'selected' : ''}>${lab}</option>`; }).join('')}</select>`
      : t === 'a' ? `<textarea ${a} rows="3">${esc(v)}</textarea>`
      : t === 'img' ? `<div class="up"><div class="up-prev">${v ? `<img src="${esc(v)}" alt="">` : '<span>Нет</span>'}</div><div class="actions"><label class="btn">Загрузить<input type="file" accept="image/*" data-up="${k}" hidden></label>${v ? `<button type="button" class="btn" data-o="upClear" data-k="${k}">Убрать</button>` : ''}</div></div>`
      : t === 'c' ? `<input ${a} type="checkbox" ${v ? 'checked' : ''}>`
      : t === 'col' ? `<input ${a} type="color" value="${esc(v || '#ffffff')}">`
      : `<input ${a} ${t === 'n' ? 'type="number"' : ''} value="${esc(v)}">`;
    const tg = t === 'img' ? 'div' : 'label';
    return `<${tg} class="field"><span>${l}</span>${inp}</${tg}>`;
  };

  async function templates(id) {
    if (!await load({ id }) || !D.org.admin) return R.notFound('Нет доступа');
    R.setCrumbs([['Организации', '#/orgs'], [D.org.name, '#/org/' + id], ['Шаблоны']]);
    designer({
      items: () => D.templates,
      reload: () => load({ id }),
      save: (row, tid) => { row.org_id = D.org.id; return tid ? sb().from('org_templates').update(row).eq('id', tid) : sb().from('org_templates').insert(row); },
      del: tid => sb().from('org_templates').delete().eq('id', tid)
    });
  }

  function designer(cfg) {
    let T = null;
    let sel = null;
    let hist = [];
    let hi = -1;
    const find = (list, sid) => { for (let i = 0; i < list.length; i++) { if (list[i].id === sid) return { n: list[i], list, i }; const r = list[i].children && find(list[i].children, sid); if (r) return r; } return null; };
    const cur = () => (sel && find(T.layout.blocks, sel)) || null;
    const snap = () => { hist = hist.slice(0, hi + 1); hist.push(JSON.stringify(T.layout)); hi = hist.length - 1; };
    const snapD = deb(snap, 500);
    const layers = (list, d = 0) => list.map(b => `<button class="lyr${b.id === sel ? ' on' : ''}" style="padding-left:${10 + d * 14}px" data-o="pick" data-id="${b.id}">${esc(b.name || TL[b.type])}</button>${b.children ? layers(b.children, d + 1) : ''}`).join('');
    const light = () => { $('#tCanvas').innerHTML = pageHtml(T.layout, SAMPLE(), sel); $('#tLayers').innerHTML = layers(T.layout.blocks); };
    const params = () => {
      const s = cur();
      $('#tParams').innerHTML = s
        ? `<h3>${esc(s.n.name || TL[s.n.type])}</h3><div class="actions"><button class="btn" data-o="mvUp">↑</button><button class="btn" data-o="mvDn">↓</button><button class="btn" data-o="cpy">Копия</button><button class="btn danger" data-o="rm">Удалить</button></div>${FIELDS[s.n.type].map(f => field(f, s.n)).join('')}${s.n.type === 'signers' ? '<p class="hint">Здесь выводятся штамп и подписанты документа.</p>' : ''}${s.n.type === 'content' ? '<p class="hint">Сюда попадает текст секций документа.</p>' : ''}`
        : `<h3>Страница</h3><p class="hint">Нажмите на компонент на листе или в слоях. Двойной клик по слою переименовывает его.</p>${PAGEF.map(f => field(f, T.layout.page)).join('')}`;
    };
    const refresh = () => { light(); params(); };
    const listView = () => {
      T = null;
      R.view.classList.remove('wide');
      R.view.innerHTML = `<section class="page-head"><div><h1>Шаблоны</h1><p>Конструктор листа: шапка, текст, линии, изображения и подписи. Текст самого документа пишется потом на доске.</p></div><div class="actions"><button class="btn primary" data-o="newTpl2">${icon('plus')}Новый шаблон</button></div></section>${cfg.items().length ? `<div class="gal">${cfg.items().map(t => `<button class="gcard" data-o="editTpl" data-id="${t.id}"><div class="thumb"><div class="thumb-in">${pageHtml(layoutOf(t), SAMPLE())}</div></div><span>${esc(t.title)}</span></button>`).join('')}</div>` : '<div class="empty"><h3>Шаблонов пока нет</h3><p>Создайте первый, можно начать с готового макета.</p></div>'}`;
    };
    const draw = () => {
      R.view.classList.add('wide');
      R.view.innerHTML = `<div class="ted"><div class="ted-bar"><button class="btn" data-o="tplBack">Назад</button><button class="icon-btn" data-o="undo" aria-label="Отменить">↶</button><button class="icon-btn" data-o="redo" aria-label="Повторить">↷</button><input class="input" data-t="title" style="max-width:240px" value="${esc(T.title)}" placeholder="Название шаблона"><input class="input" data-t="code" style="max-width:100px" value="${esc(T.code)}" placeholder="Код"><span class="grow"></span>${T.id ? '<button class="btn danger" data-o="delTpl">Удалить</button>' : ''}<button class="btn" data-o="tplPrev">Предпросмотр</button><button class="btn primary" data-o="saveTpl">Сохранить</button></div><aside class="ted-l"><h3>Слои</h3><div id="tLayers" class="lyrs"></div><h3>Компоненты</h3>${Object.keys(TL).map(k => `<button class="cmp" data-o="addCmp" data-t="${k}">${TL[k]}</button>`).join('')}</aside><main class="ted-c"><div id="tCanvas"></div></main><aside class="ted-r" id="tParams"></aside></div>`;
      $('#tCanvas').onclick = e => { const b = e.target.closest('[data-bid]'); sel = b ? b.dataset.bid : null; refresh(); };
      refresh();
    };
    const begin = t => { T = t; sel = null; hist = [JSON.stringify(t.layout)]; hi = 0; draw(); };
    const clone = x => JSON.parse(JSON.stringify(x));
    R.view.oninput = R.view.onchange = e => {
      const t = e.target;
      if (t.dataset.t) { if (T) T[t.dataset.t] = t.value; return; }
      if (t.dataset.up) {
        const s = cur();
        toast('Загрузка');
        uploadImage(t.files[0]).then(u => { (s ? s.n : T.layout.page)[t.dataset.up] = u; snap(); refresh(); }).catch(() => toast('Не удалось загрузить картинку'));
        return;
      }
      if (!t.dataset.p || !T) return;
      const s = cur();
      (s ? s.n : T.layout.page)[t.dataset.p] = t.type === 'checkbox' ? t.checked : t.type === 'number' ? +t.value : t.value;
      light();
      snapD();
    };
    R.view.ondblclick = e => {
      const b = e.target.closest('.lyr');
      if (!b || !T) return;
      const s = find(T.layout.blocks, b.dataset.id);
      const nm = s && prompt('Название слоя', s.n.name || TL[s.n.type]);
      if (nm) { s.n.name = nm; refresh(); snap(); }
    };
    H.pick = b => { sel = b.dataset.id; refresh(); };
    H.upClear = b => { const s = cur(); if (s) { s.n[b.dataset.k] = ''; snap(); refresh(); } };
    H.addCmp = b => {
      const n = { id: R.uid(), type: b.dataset.t, ...clone(DEF[b.dataset.t]) };
      const s = cur();
      if (s && s.n.type === 'block') s.n.children.push(n); else if (s) s.list.splice(s.i + 1, 0, n); else T.layout.blocks.push(n);
      sel = n.id; snap(); refresh();
    };
    H.mvUp = () => { const s = cur(); if (s && s.i > 0) { [s.list[s.i - 1], s.list[s.i]] = [s.list[s.i], s.list[s.i - 1]]; snap(); refresh(); } };
    H.mvDn = () => { const s = cur(); if (s && s.i < s.list.length - 1) { [s.list[s.i + 1], s.list[s.i]] = [s.list[s.i], s.list[s.i + 1]]; snap(); refresh(); } };
    H.cpy = () => { const s = cur(); if (!s) return; const reid = x => { x.id = R.uid(); (x.children || []).forEach(reid); return x; }; const c = reid(clone(s.n)); s.list.splice(s.i + 1, 0, c); sel = c.id; snap(); refresh(); };
    H.rm = () => { const s = cur(); if (s) { s.list.splice(s.i, 1); sel = null; snap(); refresh(); } };
    H.undo = () => { if (hi > 0) { hi--; T.layout = JSON.parse(hist[hi]); sel = null; refresh(); } };
    H.redo = () => { if (hi < hist.length - 1) { hi++; T.layout = JSON.parse(hist[hi]); sel = null; refresh(); } };
    H.tplPrev = () => $('.ted').classList.toggle('nosel');
    H.tplBack = listView;
    H.newTpl2 = () => gallery([{ name: 'Тёмный', layout: preset('dark') }, { name: 'Светлый', layout: preset('light') }, { name: 'Простой', layout: preset('plain') }, ...cfg.items().map(t => ({ name: 'Копия: ' + t.title, layout: layoutOf(t) }))], it => begin({ title: '', code: 'DOC', layout: clone(it.layout) }));
    H.editTpl = b => { const t = cfg.items().find(x => x.id === b.dataset.id); begin({ id: t.id, title: t.title, code: t.code || 'DOC', layout: clone(layoutOf(t)) }); };
    H.saveTpl = async () => {
      const row = { title: (T.title || '').trim() || 'Шаблон', code: (T.code || 'DOC').trim().toUpperCase(), layout: T.layout };
      const { error } = await cfg.save(row, T.id);
      if (error) return toast('Не удалось сохранить');
      await cfg.reload();
      listView();
      toast('Шаблон сохранён');
    };
    H.delTpl = async () => { if (!await R.ask('Удалить шаблон?', 'Документы на доске потеряют шаблон.')) return; await cfg.del(T.id); await cfg.reload(); listView(); };
    listView();
  }

  async function doc(arg) {
    if (!arg.local && !await load(arg)) return R.notFound('Организация не найдена или нет доступа');
    const n = arg.local ? arg.n : D.nodes.find(x => x.id === arg.node && x.kind === 'doc');
    if (!n) return R.notFound('Документ не найден');
    const adm = arg.local || (!!arg.id && D.org.admin);
    const back = adm ? '#/org/' + D.org.id : '#/v/' + (D.org.slug || D.org.token);
    R.setCrumbs(arg.local ? [['Документы', '#/paperwork'], [n.title]] : [['Организации', '#/orgs'], [D.org.name, back], [n.title]]);
    R.view.classList.add('wide');
    const st = { title: n.title, code: n.code || '', tid: n.template_id || '', sections: JSON.parse(JSON.stringify(n.sections || [])), hooks: [...(n.webhook_ids || [])], status: n.status || 'draft', name: R.state.name || '', pos: '', date: new Date().toLocaleDateString('ru-RU'), signers: [] };
    if (!st.sections.length && adm) st.sections.push({ t: '', x: '' });
    const tpl = () => D.templates.find(t => t.id === st.tid);
    const code = () => st.code || `${(tpl() || {}).code || 'DOC'}-${n.id.slice(-4).toUpperCase()}`;
    const ctx = () => ({ title: st.title, code: code(), date: st.date, author: st.name, signers: [{ name: st.name, pos: st.pos }, ...st.signers], content: st.sections.map(s => (s.t ? `<div class="sec-t">${esc(s.t)}:</div>` : '') + R.sanitize(s.x)).join('') });
    const hooks = D.org.member ? D.webhooks.filter(w => st.hooks.includes(w.id)) : [];
    R.view.innerHTML = `<div class="docwrap"><div class="docgrid"><div class="docform">
      ${adm ? `<div class="grid2"><label class="field"><span>Название</span><input data-m="title" value="${esc(st.title)}"></label><label class="field"><span>Код документа</span><input data-m="code" value="${esc(st.code)}" placeholder="Авто"></label></div><div class="field"><span>Шаблон</span><button class="btn" data-o="dTpl" id="dTplBtn"></button></div>${arg.local ? `<label class="field"><span>Статус</span><select data-m="status">${Object.entries(SL).map(([k, v]) => `<option value="${k}" ${st.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>` : ''}` : `<h1 class="dtitle">${esc(n.title)}</h1>`}
      <div class="thread" id="dThread"></div>
      <button class="btn" data-o="addSec2">${icon('plus')}Добавить секцию</button>
      <div class="grid3"><label class="field"><span>Автор</span><input data-m="name" value="${esc(st.name)}"></label><label class="field"><span>Должность</span><input data-m="pos" placeholder="Attorney"></label><label class="field"><span>Дата</span><input data-m="date" value="${esc(st.date)}"></label></div>
      <div id="dSign" class="form"></div><button class="link-btn" data-o="addSgn" style="align-self:flex-start">Добавить подписанта</button>
      ${adm && !arg.local ? `<div class="field"><span>Каналы для публикации</span>${D.webhooks.map(w => `<label class="chk"><input type="checkbox" data-hook="${w.id}" ${st.hooks.includes(w.id) ? 'checked' : ''}> ${esc(w.name)}</label>`).join('') || '<small class="muted">Каналы добавляются в настройках организации</small>'}</div><p class="save-state" id="dState">Сохранено</p>` : ''}
      <div class="actions"><button class="btn" data-o="dPng">Скачать</button>${hooks.length ? `<select class="select" id="dHook">${hooks.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}</select><button class="btn primary" data-o="dSend">Опубликовать</button>` : ''}</div>
      ${!arg.local && !D.org.member ? '<small class="muted">Публиковать в Discord могут только участники состава</small>' : ''}
    </div><div class="docprev"><div id="dPage"></div></div></div></div>`;
    const paint = () => { $('#dPage').innerHTML = pageHtml(tpl() ? layoutOf(tpl()) : preset('dark'), ctx()); if (adm) $('#dTplBtn').textContent = 'Шаблон: ' + (tpl() ? tpl().title : 'не выбран'); };
    const thread = () => { $('#dThread').innerHTML = st.sections.map((s, i) => `<div class="tsec"><span class="tnum">${i + 1}</span><input data-si="${i}" data-sf="t" value="${esc(s.t)}" placeholder="Без заголовка"><div class="rtb">${CMDS.map(([c, l]) => `<button type="button" data-cmd="${c}">${l}</button>`).join('')}<button type="button" data-mark="1">Маркер</button></div><div class="rt" contenteditable="true" data-si="${i}" data-sf="x" data-ph="Текст секции">${R.rich(s.x)}</div><button type="button" class="link-btn" data-o="delSec2" data-i="${i}">Убрать</button></div>`).join(''); };
    const signs = () => { $('#dSign').innerHTML = st.signers.map((x, i) => `<div class="sgn"><input data-sg="${i}" data-sf2="name" placeholder="Имя" value="${esc(x.name)}"><input data-sg="${i}" data-sf2="pos" placeholder="Должность" value="${esc(x.pos)}"></div>`).join(''); };
    const save = deb(async () => {
      const el = $('#dState');
      if (el) el.textContent = 'Сохранение';
      const upd = { title: st.title, code: st.code, template_id: st.tid || null, sections: st.sections.map(x => ({ t: x.t, x: R.sanitize(x.x) })) };
      if (arg.local) { upd.status = st.status; await arg.save(upd); } else await sb().from('org_nodes').update({ ...upd, webhook_ids: st.hooks }).eq('id', n.id);
      Object.assign(n, { title: st.title, code: st.code, template_id: st.tid || null });
      if (el) el.textContent = 'Сохранено';
    }, 600);
    R.view.oninput = R.view.onchange = e => {
      const t = e.target;
      if (t.dataset.si !== undefined) st.sections[+t.dataset.si][t.dataset.sf] = t.isContentEditable ? t.innerHTML : t.value;
      else if (t.dataset.m) st[t.dataset.m] = t.value;
      else if (t.dataset.sg !== undefined) st.signers[+t.dataset.sg][t.dataset.sf2] = t.value;
      else if (t.dataset.hook) { const q = new Set(st.hooks); if (t.checked) q.add(t.dataset.hook); else q.delete(t.dataset.hook); st.hooks = [...q]; }
      else return;
      paint();
      if (adm) save();
    };
    R.view.onmousedown = e => {
      const b = e.target.closest('[data-cmd],[data-mark]');
      if (!b) return;
      e.preventDefault();
      if (b.dataset.cmd) document.execCommand(b.dataset.cmd);
      else { const t = String(getSelection()); if (t) document.execCommand('insertHTML', false, `<mark>${esc(t)}</mark>`); }
      const ed = b.closest('.tsec').querySelector('.rt');
      ed.dispatchEvent(new Event('input', { bubbles: true }));
    };
    H.addSec2 = () => { st.sections.push({ t: '', x: '' }); thread(); paint(); if (adm) save(); };
    H.delSec2 = b => { st.sections.splice(+b.dataset.i, 1); thread(); paint(); if (adm) save(); };
    H.addSgn = () => { st.signers.push({ name: '', pos: '' }); signs(); };
    H.dTpl = () => {
      if (!D.templates.length) return toast('Сначала создайте шаблон в разделе «Шаблоны»');
      gallery(D.templates.map(t => ({ id: t.id, name: t.title, layout: layoutOf(t) })), it => { st.tid = it.id; paint(); save(); });
    };
    const shot = async () => {
      const el = $('#dPage .lpage');
      const z = el.style.zoom;
      el.style.zoom = '1';
      const c = await window.html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true });
      el.style.zoom = z;
      return c;
    };
    H.dPng = async () => { if (!window.html2canvas) return toast('Экспорт недоступен'); const c = await shot(); const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = st.title + '.png'; a.click(); };
    H.dSend = async b => {
      if (!window.html2canvas) return toast('Экспорт недоступен');
      b.disabled = true;
      const c = await shot();
      const { error } = await sb().functions.invoke('send-webhook', { body: { token: D.org.token, node_id: n.id, webhook_id: $('#dHook').value, title: st.title, code: code(), fields: [['Шаблон', (tpl() || {}).title || ''], ['Автор', st.name], ['Должность', st.pos]], image: c.toDataURL('image/png').split(',')[1] } });
      b.disabled = false;
      toast(error ? 'Не удалось опубликовать' : 'Опубликовано в Discord');
    };
    thread();
    signs();
    paint();
  }

  const SL = { draft: 'Черновик', review: 'На подписи', signed: 'Подписан', rejected: 'Отклонён' };
  const localD = () => {
    D = { org: { name: R.store.get('profile', {}).org || 'revolutione', brand: {}, member: false, token: '', admin: true }, templates: [], webhooks: [], nodes: [], edges: [] };
    D.templates = ['dark:Тёмный', 'light:Светлый', 'plain:Простой'].map(x => { const [k, nm] = x.split(':'); return { id: 'p:' + k, title: nm, code: 'DOC', layout: preset(k) }; }).concat(R.store.get(R.skey('ltpl'), []));
    return D;
  };

  function ptemplates() {
    localD();
    R.setCrumbs([['Документы', '#/paperwork'], ['Мои шаблоны']]);
    const all = () => R.store.get(R.skey('ltpl'), []);
    designer({
      items: all,
      reload: async () => { localD(); },
      save: async (row, tid) => { const l = all(); if (tid) { const i = l.findIndex(x => x.id === tid); l[i] = { ...l[i], ...row }; } else l.push({ id: R.uid(), ...row }); R.store.set(R.skey('ltpl'), l); return {}; },
      del: async tid => { R.store.set(R.skey('ltpl'), all().filter(x => x.id !== tid)); }
    });
  }

  function pnew() {
    localD();
    R.setCrumbs([['Документы', '#/paperwork'], ['Новый документ']]);
    R.view.classList.remove('wide');
    R.view.innerHTML = `<section class="page-head"><div><h1>Новый документ</h1><p>Выберите оформление листа или соберите своё в конструкторе.</p></div><div class="actions"><a class="btn" href="#/paperwork/templates">${icon('plus')}Свой шаблон</a></div></section><div class="gal">${D.templates.map(t => `<button class="gcard" data-o="pcreate" data-id="${esc(t.id)}"><div class="thumb"><div class="thumb-in">${pageHtml(layoutOf(t), SAMPLE())}</div></div><span>${esc(t.title)}</span></button>`).join('')}</div>`;
    H.pcreate = b => R.createDoc(b.dataset.id);
  }

  function pdoc(id) {
    localD();
    const d = R.myDocs().find(x => x.id === id);
    if (!d) return R.notFound('Документ не найден');
    const legacy = !d.sections && d.values ? [{ t: '', x: Object.entries(d.values).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n') }] : null;
    const n = { id: d.id, title: d.title, code: d.code || '', template_id: d.tpl, sections: d.sections || legacy || [], webhook_ids: [], status: d.status };
    return doc({
      local: true,
      n,
      save: async upd => {
        const l = R.myDocs();
        const i = l.findIndex(x => x.id === id);
        if (i >= 0) { l[i] = { ...l[i], title: upd.title, code: upd.code, tpl: upd.template_id, sections: upd.sections, status: upd.status || l[i].status, updated: Date.now() }; R.saveMyDocs(l); }
      }
    });
  }

  const H = {
    async newOrg() {
      R.openDialog('<form class="dlg-body" id="of"><h2>Новая организация</h2><label class="field"><span>Название</span><input name="name" required placeholder="Министерство юстиции"></label><label class="field"><span>Адрес (необязательно, латиница)</span><input name="slug" placeholder="my-org"></label><div class="dlg-actions"><button type="button" class="btn" data-close>Отмена</button><button class="btn primary">Создать</button></div></form>', d => {
        $('#of', d).addEventListener('submit', async e => {
          e.preventDefault();
          const f = new FormData(e.target);
          const slug = (f.get('slug') || '').trim().toLowerCase();
          if (slug && !/^[a-z0-9-]{3,40}$/.test(slug)) return toast('Адрес: 3-40 символов, латиница, цифры, дефис');
          const { data, error } = await sb().from('orgs').insert({ name: f.get('name').trim(), owner: R.state.user.id, slug: slug || null }).select().single();
          if (error) return toast('Не удалось создать');
          R.dlg.close();
          location.hash = '#/org/' + data.id;
        });
      });
    }
  };
  document.addEventListener('click', e => { const b = e.target.closest('[data-o]'); if (b && H[b.dataset.o]) H[b.dataset.o](b); });

  window.ORG = { list, board, templates, settings, doc, ptemplates, pnew, pdoc };
})();
