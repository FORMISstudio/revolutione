(() => {
  const R = window.REV;
  const { $, esc, icon, toast } = R;
  const sb = () => R.sb;
  const HOOK = /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//;
  const CMDS = [['bold', 'B'], ['italic', 'I'], ['underline', 'U'], ['insertUnorderedList', '•'], ['insertOrderedList', '1.'], ['justifyLeft', '⇤'], ['justifyCenter', '↔'], ['justifyRight', '⇥']];
  const STAMP = '<svg class="stamp" viewBox="0 0 100 100"><defs><path id="op" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="1.5"/><text font-size="8" letter-spacing="2" fill="currentColor"><textPath href="#op">DIGITAL PROOF · VERIFIED ·</textPath></text><path d="M40 58l8-16 8 12 6-8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
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
  const sheet = (title, html, code) => `<div class="sheet" id="sheet"><div class="sheet-logo">revolutione<b>”</b></div><div class="sheet-kind">ИНФОРМАЦИОННЫЙ ДОКУМЕНТ</div><div class="sheet-title">«${esc(title)}»</div><div class="sheet-id">${esc(D.org.name)}</div><div class="paper">${html}</div><div class="sheet-foot">${STAMP}<div class="sign"><span>${esc(R.state.name || '')}</span><i>${esc((R.state.name || '').split(' ')[0])}</i></div></div><div class="sheet-code"><span>Код документа: ${esc(code)}</span><span>${new Date().toLocaleDateString('ru-RU')}</span></div></div>`;
  const wide = () => { R.dlg.classList.add('dlg-wide'); R.dlg.addEventListener('close', () => R.dlg.classList.remove('dlg-wide'), { once: true }); };

  async function load(arg) {
    const { data } = await sb().rpc('org_load', { p_org: arg.id || null, p_token: arg.token || null });
    D = data || null;
    return D;
  }

  async function list() {
    R.setCrumbs([['Организации']]);
    const { data } = await sb().from('org_members').select('role, orgs(id,name)');
    const rows = (data || []).filter(r => r.orgs);
    R.view.innerHTML = `<section class="page-head"><div><h1>Организации</h1><p>Создайте организацию, соберите документооборот на доске и поделитесь ссылкой.</p></div><div class="actions"><button class="btn primary" data-o="newOrg">${icon('plus')}Создать организацию</button></div></section>${rows.length ? `<div class="list">${rows.map(r => `<a class="row" href="#/org/${r.orgs.id}"><span class="row-title">${esc(r.orgs.name)}</span><span class="row-meta">${r.role === 'admin' ? 'Админ' : 'Участник'}</span>${icon('chevron')}</a>`).join('')}</div>` : '<div class="empty"><h3>Организаций пока нет</h3><p>Создайте первую, чтобы начать.</p></div>'}`;
  }

  async function board(arg) {
    if (!await load(arg)) return R.notFound('Организация не найдена или нет доступа');
    edit = !!arg.id && D.org.admin;
    R.setCrumbs([['Организации', '#/orgs'], [D.org.name]]);
    R.view.classList.add('wide');
    const link = `${location.origin}${location.pathname}#/v/${D.org.token}`;
    const bar = edit
      ? `<button class="btn" data-o="addNote">+ Заметка</button><button class="btn" data-o="addDoc">+ Документ</button><button class="btn" id="connBtn" data-o="connect">Соединить</button><a class="btn" href="#/org/${D.org.id}/templates">Шаблоны</a><button class="btn" data-o="hooks">Вебхуки</button><button class="btn primary" data-o="copyLink" data-link="${esc(link)}">Ссылка для зрителей</button>`
      : `<span class="bar-note">${esc(D.org.name)}: нажмите на документ, чтобы заполнить</span>`;
    R.view.innerHTML = `<div class="board" id="board"><div class="board-inner" id="boardInner"></div><div class="board-bar"><div class="bar-group wrap">${bar}</div></div></div>`;
    const box = $('#board');
    const inner = $('#boardInner');
    const dim = n => (n.kind === 'note' ? [220, 84] : [190, 40]);
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
      inner.innerHTML = `<svg class="threads" width="1" height="1"></svg>${D.nodes.map((n, i) => `<button class="node ${n.kind}" style="left:${n.x}px;top:${n.y}px;animation-delay:${i * 30}ms" data-id="${n.id}"><small>${n.kind === 'note' ? 'Заметка' : 'Документ'}</small>${esc(n.kind === 'note' ? (n.body || n.title) : n.title)}</button>`).join('')}`;
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
      if (edit) return n.kind === 'note' ? noteDlg(n) : docDlg(n);
      if (n.kind === 'doc') fillDlg(n); else R.openDialog(`<div class="dlg-body"><h2>${esc(n.title || 'Заметка')}</h2><p class="muted" style="white-space:pre-wrap">${esc(n.body)}</p><div class="dlg-actions"><button class="btn" data-close>Закрыть</button></div></div>`);
    });
    box.addEventListener('mousedown', () => {});
    H.connect = b => { conn = !conn; first = null; b.classList.toggle('primary', conn); redraw(); toast(conn ? 'Нажмите на две карточки, чтобы соединить' : 'Режим соединения выключен'); };
    H.addNote = () => addNode('note');
    H.addDoc = () => addNode('doc');
    H.copyLink = b => R.copy(b.dataset.link, 'Ссылка скопирована');
    H.hooks = hooksDlg;
  }

  async function addNode(kind) {
    const k = D.nodes.length * 22;
    const { data, error } = await sb().from('org_nodes').insert({ org_id: D.org.id, kind, x: 60 + k, y: 60 + k, title: kind === 'doc' ? 'Новый документ' : '', body: kind === 'note' ? 'Новая заметка' : '' }).select().single();
    if (error) return toast('Не удалось добавить');
    D.nodes.push(data);
    redraw();
    kind === 'note' ? noteDlg(data) : docDlg(data);
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

  function docDlg(n) {
    const pre = { ...(n.prefill || {}) };
    let tid = n.template_id || '';
    const wh = new Set(n.webhook_ids || []);
    R.openDialog(`<form class="dlg-body" id="df"><h2>Документ</h2>
      <label class="field"><span>Название</span><input name="title" value="${esc(n.title)}" required></label>
      <label class="field"><span>Шаблон</span><select id="dTpl"><option value="">Не выбран</option>${D.templates.map(t => `<option value="${t.id}" ${t.id === tid ? 'selected' : ''}>${esc(t.title)}</option>`).join('')}</select></label>
      <div id="dPre" class="panel"></div>
      <div class="field"><span>Разрешить отправку в Discord</span>${D.webhooks.length ? D.webhooks.map(w => `<label class="chk"><input type="checkbox" data-w="${w.id}" ${wh.has(w.id) ? 'checked' : ''}> ${esc(w.name)}</label>`).join('') : '<small class="muted">Сначала добавьте вебхук на доске</small>'}</div>
      <div class="dlg-actions"><button type="button" class="btn danger" data-o="delNode">Удалить</button><button class="btn primary">Сохранить</button></div></form>`, d => {
      H.delNode = () => delNode(n);
      const pf = () => {
        const f = fieldsOf(D.templates.find(t => t.id === tid));
        $('#dPre', d).innerHTML = f.length ? `<span class="muted">Заполненное здесь подставится зрителю по умолчанию</span>${f.map(k => `<label class="field"><span>${esc(k)}</span><input data-k="${esc(k)}" value="${esc(pre[k] || '')}"></label>`).join('')}` : '';
      };
      pf();
      $('#dTpl', d).addEventListener('change', e => { tid = e.target.value; pf(); });
      $('#dPre', d).addEventListener('input', e => { if (e.target.dataset.k) pre[e.target.dataset.k] = e.target.value; });
      $('#df', d).addEventListener('submit', async e => {
        e.preventDefault();
        const upd = { title: new FormData(e.target).get('title').trim(), template_id: tid || null, prefill: pre, webhook_ids: $$w(d) };
        await sb().from('org_nodes').update(upd).eq('id', n.id);
        Object.assign(n, upd);
        R.dlg.close();
        redraw();
      });
    });
  }
  const $$w = d => [...d.querySelectorAll('[data-w]')].filter(c => c.checked).map(c => c.dataset.w);

  function fillDlg(n) {
    const tp = D.templates.find(t => t.id === n.template_id);
    if (!tp) return toast('Администратор ещё не выбрал шаблон для этого документа');
    const v = { ...(n.prefill || {}) };
    const hooks = D.webhooks.filter(w => (n.webhook_ids || []).includes(w.id));
    const code = 'ID ' + n.id.slice(-5).toUpperCase();
    R.openDialog(`<div class="dlg-body"><h2>${esc(n.title)}</h2><div class="fill"><div class="form" id="fForm">${fieldsOf(tp).map(k => `<label class="field"><span>${esc(k)}</span><input data-k="${esc(k)}" value="${esc(v[k] || '')}"></label>`).join('') || '<p class="muted">В шаблоне нет полей</p>'}
      <div class="actions"><button class="btn" data-o="fCopy">${icon('copy')}Текст</button><button class="btn" data-o="fPng">PNG</button></div>
      ${hooks.length ? `<div class="field"><span>Отправить в Discord</span><select id="fHook">${hooks.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}</select></div><button class="btn primary" id="fSend" data-o="fSend">Отправить</button>` : ''}</div>
      <div id="fSheet"></div></div><div class="dlg-actions"><button class="btn" data-close>Закрыть</button></div></div>`, d => {
      wide();
      const paint = () => { $('#fSheet', d).innerHTML = sheet(n.title.replace(/\{\{([^{}]+)\}\}/g, (_, k) => v[k.trim()] || '—'), bodyOf(tp, v), code); };
      paint();
      $('#fForm', d).addEventListener('input', e => { if (e.target.dataset.k) { v[e.target.dataset.k] = e.target.value; paint(); } });
      const text = () => toText($('#sheet .paper', d).innerHTML);
      H.fCopy = () => R.copy(text(), 'Текст скопирован');
      H.fPng = () => window.html2canvas && window.html2canvas($('#sheet', d), { backgroundColor: '#000', scale: 2 }).then(c => { const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = n.title + '.png'; a.click(); });
      H.fSend = async b => {
        b.disabled = true;
        const { error } = await sb().functions.invoke('send-webhook', { body: { token: D.org.token, node_id: n.id, webhook_id: $('#fHook', d).value, title: n.title, text: text() } });
        b.disabled = false;
        toast(error ? 'Не удалось отправить' : 'Отправлено в Discord');
      };
    });
  }

  async function hooksDlg() {
    const { data } = await sb().from('org_webhooks').select('id,name,url').eq('org_id', D.org.id);
    R.openDialog(`<div class="dlg-body"><h2>Вебхуки Discord</h2>
      ${(data || []).map(w => `<div class="row"><span class="row-title">${esc(w.name)}</span><span class="row-meta">${esc(w.url.slice(0, 38))}…</span><button class="icon-btn danger" data-o="delHook" data-id="${w.id}" aria-label="Удалить">${icon('trash')}</button></div>`).join('') || '<p class="muted">Пока нет вебхуков</p>'}
      <form id="hf" class="panel" autocomplete="off"><label class="field"><span>Название канала</span><input name="name" required placeholder="Рапорты"></label><label class="field"><span>URL вебхука</span><input name="url" type="url" required placeholder="https://discord.com/api/webhooks/..."></label><div class="dlg-actions"><button type="button" class="btn" data-close>Закрыть</button><button class="btn primary">Добавить</button></div></form></div>`, d => {
      H.delHook = async b => { await sb().from('org_webhooks').delete().eq('id', b.dataset.id); R.dlg.close(); await load({ id: D.org.id }); hooksDlg(); };
      $('#hf', d).addEventListener('submit', async e => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.target));
        if (!HOOK.test(f.url.trim())) return toast('Нужна ссылка вебхука Discord');
        await sb().from('org_webhooks').insert({ org_id: D.org.id, name: f.name.trim(), url: f.url.trim() });
        R.dlg.close();
        await load({ id: D.org.id });
        hooksDlg();
      });
    });
  }

  async function templates(id) {
    if (!await load({ id }) || !D.org.admin) return R.notFound('Нет доступа');
    R.setCrumbs([['Организации', '#/orgs'], [D.org.name, '#/org/' + id], ['Шаблоны']]);
    let T = null;
    const draw = () => {
      if (!T) {
        R.view.innerHTML = `<section class="page-head"><div><h1>Шаблоны</h1><p>Соберите документ из секций. Кнопка «Поле» вставляет значение, которое заполняет автор документа.</p></div><div class="actions"><button class="btn primary" data-o="newTpl2">${icon('plus')}Новый шаблон</button></div></section>${D.templates.length ? `<div class="tpl-grid">${D.templates.map(t => `<button class="tpl" data-o="editTpl" data-id="${t.id}"><b>${esc(t.title)}</b><span>Полей: ${fieldsOf(t).length}</span></button>`).join('')}</div>` : '<div class="empty"><h3>Шаблонов пока нет</h3><p>Создайте первый.</p></div>'}`;
        return;
      }
      R.view.innerHTML = `<section class="page-head"><div class="grow"><input class="title-input" id="tTitle" value="${esc(T.title)}" placeholder="Название шаблона"></div><div class="actions">${T.id ? '<button class="btn danger" data-o="delTpl">Удалить</button>' : ''}<button class="btn" data-o="tplBack">Отмена</button><button class="btn primary" data-o="saveTpl">Сохранить</button></div></section><div class="thread" id="tThread"></div><button class="btn" data-o="addSection" style="margin-top:14px">${icon('plus')}Добавить секцию</button>`;
      thread();
      $('#tTitle').addEventListener('input', e => { T.title = e.target.value; });
    };
    const thread = () => {
      $('#tThread').innerHTML = T.sections.map((s, i) => `<div class="tsec"><span class="tnum">${i + 1}</span><input data-i="${i}" data-f="t" value="${esc(s.t)}" placeholder="Заголовок секции"><div class="rtb">${CMDS.map(([c, l]) => `<button type="button" data-cmd="${c}">${l}</button>`).join('')}<button type="button" data-fld="1">Поле</button></div><div class="rt" contenteditable="true" data-i="${i}" data-f="x" data-ph="Текст секции">${R.rich(s.x)}</div><button type="button" class="link-btn" data-o="delSection" data-i="${i}">Убрать</button></div>`).join('');
    };
    R.view.addEventListener('input', e => { if (T && e.target.dataset.i !== undefined) T.sections[+e.target.dataset.i][e.target.dataset.f] = e.target.isContentEditable ? e.target.innerHTML : e.target.value; });
    R.view.addEventListener('mousedown', e => {
      const b = e.target.closest('[data-cmd],[data-fld]');
      if (!b) return;
      e.preventDefault();
      const ed = b.closest('.tsec').querySelector('.rt');
      if (b.dataset.cmd) document.execCommand(b.dataset.cmd);
      else { const k = prompt('Название поля, например Имя гражданина'); if (k && k.trim()) document.execCommand('insertText', false, `{{${k.trim()}}}`); }
      ed.dispatchEvent(new Event('input', { bubbles: true }));
    });
    H.newTpl2 = () => { T = { title: '', sections: [{ t: '', x: '' }] }; draw(); };
    H.editTpl = b => { const t = D.templates.find(x => x.id === b.dataset.id); T = { id: t.id, title: t.title, sections: JSON.parse(JSON.stringify(t.sections || [])) }; draw(); };
    H.tplBack = () => { T = null; draw(); };
    H.addSection = () => { T.sections.push({ t: '', x: '' }); thread(); };
    H.delSection = b => { T.sections.splice(+b.dataset.i, 1); thread(); };
    H.saveTpl = async () => {
      if (!T.title.trim()) return toast('Укажите название');
      const row = { org_id: D.org.id, title: T.title.trim(), sections: T.sections.map(s => ({ t: s.t, x: R.sanitize(s.x) })) };
      const { error } = T.id ? await sb().from('org_templates').update(row).eq('id', T.id) : await sb().from('org_templates').insert(row);
      if (error) return toast('Не удалось сохранить');
      await load({ id });
      T = null;
      draw();
      toast('Шаблон сохранён');
    };
    H.delTpl = async () => { if (!await R.ask('Удалить шаблон?', 'Документы на доске потеряют шаблон.')) return; await sb().from('org_templates').delete().eq('id', T.id); await load({ id }); T = null; draw(); };
    draw();
  }

  const H = {
    async newOrg() {
      R.openDialog('<form class="dlg-body" id="of"><h2>Новая организация</h2><label class="field"><span>Название</span><input name="name" required placeholder="Министерство юстиции"></label><div class="dlg-actions"><button type="button" class="btn" data-close>Отмена</button><button class="btn primary">Создать</button></div></form>', d => {
        $('#of', d).addEventListener('submit', async e => {
          e.preventDefault();
          const { data, error } = await sb().from('orgs').insert({ name: new FormData(e.target).get('name').trim(), owner: R.state.user.id }).select().single();
          if (error) return toast('Не удалось создать');
          R.dlg.close();
          location.hash = '#/org/' + data.id;
        });
      });
    }
  };
  document.addEventListener('click', e => { const b = e.target.closest('[data-o]'); if (b && H[b.dataset.o]) H[b.dataset.o](b); });

  window.ORG = { list, board, templates };
})();
