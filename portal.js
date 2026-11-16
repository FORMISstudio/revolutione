(() => {
  const R = window.REV;
  const { $, esc, icon, toast } = R;
  const sb = () => R.sb;
  const ST = { new: 'Новая', review: 'На рассмотрении', approved: 'Одобрена', rejected: 'Отклонена' };
  const BC = { new: '', review: 'review', approved: 'signed', rejected: 'rejected' };
  const badge = s => `<span class="badge ${BC[s] || ''}">${esc(ST[s] || s)}</span>`;

  async function orgOf(id) {
    const { data } = await sb().from('orgs').select('id,name,slug,share_token,about,portal_on,brand').eq('id', id).maybeSingle();
    return data;
  }
  const audit = (o, action, detail) => sb().from('org_audit').insert({ org_id: o.id, user_id: R.state.user.id, user_name: R.state.name || '', action, detail: String(detail || '').slice(0, 300) }).then(() => {});

  async function portal(slug) {
    const { data } = await sb().rpc('portal_load', { p_slug: slug });
    if (!data) return R.notFound('Портал не найден');
    R.setCrumbs([[data.org.name]]);
    if (data.off) { R.view.innerHTML = `<div class="empty"><h3>${esc(data.org.name)}</h3><p>Портал этой организации пока не открыт.</p></div>`; return; }
    const b = data.org.brand || {};
    R.view.innerHTML = `<div class="portal" style="--brand:${esc(b.color || '#b4f23c')}">
      <section class="p-hero">${b.logo ? `<img class="p-logo" src="${esc(b.logo)}" alt="">` : ''}<h1>${esc(data.org.name)}</h1>${data.org.about ? `<p>${esc(data.org.about).replace(/\n/g, '<br>')}</p>` : ''}</section>
      <div class="group-title">Подать заявку</div>
      ${data.forms.length ? `<div class="gal pf">${data.forms.map(f => `<a class="gcard" href="#/f/${esc(f.slug)}"><b>${esc(f.title)}</b><span class="muted">${esc(f.description || 'Заполнить форму')}</span></a>`).join('')}</div>` : '<div class="empty"><p>Сейчас приём заявок закрыт.</p></div>'}
      ${data.posts.length ? `<div class="group-title">Объявления</div>${data.posts.map(p => `<div class="card" style="margin-bottom:10px"><h2>${esc(p.title)}</h2><small class="muted">${R.fmtDate(p.created_at)}</small><p style="white-space:pre-wrap">${esc(p.body)}</p></div>`).join('')}` : ''}
      ${data.mine.length ? `<div class="group-title">Мои заявки</div><div class="list">${data.mine.map(m => `<div class="row"><span class="row-title">${esc(m.form)}${m.note ? `<br><small class="muted">${esc(m.note)}</small>` : ''}</span>${badge(m.status)}<span class="row-meta">${R.fmtDate(m.created_at)}</span></div>`).join('')}</div>` : ''}
    </div>`;
  }

  async function applications(id) {
    const o = await orgOf(id);
    if (!o) return R.notFound('Нет доступа');
    const [f, a] = await Promise.all([
      sb().from('org_forms').select('id,title,questions').eq('org_id', id),
      sb().from('org_answers').select('id,form_id,user_name,data,created_at,status,note,reviewed_by').eq('org_id', id).order('created_at', { ascending: false }).limit(300)
    ]);
    const forms = Object.fromEntries((f.data || []).map(x => [x.id, x]));
    const rows = a.data || [];
    let st = 'all';
    let fm = '';
    let lastOpen = null;
    R.setCrumbs([['Организации', '#/orgs'], [o.name, '#/org/' + id], ['Заявки']]);
    R.view.classList.remove('wide');
    R.view.innerHTML = `<section class="page-head"><div><h1>Заявки</h1><p>Очередь заявок из форм: откройте заявку, примите решение и оставьте комментарий. Решение и комментарий видит заявитель, а сообщение уходит в Discord-канал формы.</p></div></section>
      <div class="toolbar"><div class="chips" id="apChips"></div><select class="select" id="apForm"><option value="">Все формы</option>${(f.data || []).map(x => `<option value="${x.id}">${esc(x.title)}</option>`).join('')}</select></div>
      <div id="apList"></div>`;
    const paint = () => {
      const cnt = k => rows.filter(r => k === 'all' || r.status === k).length;
      $('#apChips').innerHTML = ['all', ...Object.keys(ST)].map(k => `<button class="chip ${st === k ? 'on' : ''}" data-ast="${k}">${k === 'all' ? 'Все' : ST[k]}<small>${cnt(k)}</small></button>`).join('');
      const shown = rows.filter(r => (st === 'all' || r.status === st) && (!fm || r.form_id === fm));
      $('#apList').innerHTML = shown.length ? shown.map(r => {
        const fo = forms[r.form_id] || { title: 'Форма', questions: [] };
        return `<details class="note" data-id="${r.id}"><summary><b>${esc(r.user_name || 'Без имени')}</b><span class="tags">${esc(fo.title)}</span>${badge(r.status)}${icon('chevron')}</summary><div class="note-body">${fo.questions.map(q => `<p><b>${esc(q.t)}</b><br>${q.type === 'file' && r.data[q.id] ? `<img class="ans-img" src="${esc(r.data[q.id])}" alt="">` : esc(r.data[q.id] || '—')}</p>`).join('')}
          <label class="field"><span>Комментарий заявителю</span><textarea rows="2" data-note="${r.id}">${esc(r.note)}</textarea></label>
          <div class="actions">${['review', 'approved', 'rejected'].map(k => `<button class="btn ${k === 'approved' ? 'primary' : k === 'rejected' ? 'danger' : ''}" data-ap="${r.id}" data-s="${k}">${ST[k]}</button>`).join('')}</div>
          <small class="muted">${R.fmtDate(r.created_at)}${r.reviewed_by ? `, решение: ${esc(r.reviewed_by)}` : ''}</small></div></details>`;
      }).join('') : '<div class="empty"><h3>Заявок нет</h3><p>Здесь появятся ответы из ваших форм.</p></div>';
      if (lastOpen) { const d = $(`details[data-id="${lastOpen}"]`); if (d) d.open = true; }
    };
    $('#apChips').addEventListener('click', e => { const b = e.target.closest('[data-ast]'); if (b) { st = b.dataset.ast; paint(); } });
    $('#apForm').addEventListener('change', e => { fm = e.target.value; paint(); });
    $('#apList').addEventListener('click', async e => {
      const b = e.target.closest('[data-ap]');
      if (!b) return;
      const rid = b.dataset.ap;
      const r = rows.find(x => x.id === rid);
      const upd = { status: b.dataset.s, note: $(`[data-note="${rid}"]`).value.trim(), reviewed_by: R.state.name || '', reviewed_at: new Date().toISOString() };
      b.disabled = true;
      const { error } = await sb().from('org_answers').update(upd).eq('id', rid);
      b.disabled = false;
      if (error) { toast('Не удалось сохранить решение'); return; }
      Object.assign(r, upd);
      audit(o, `Заявка: ${ST[upd.status]}`, `${r.user_name || ''} (${(forms[r.form_id] || {}).title || ''})`);
      sb().functions.invoke('notify-decision', { body: { answer_id: rid } }).then(res => { if (res.error) toast('Решение сохранено, но сообщение в Discord не ушло'); });
      lastOpen = rid;
      paint();
      toast('Решение сохранено');
    });
    paint();
  }

  async function portalAdmin(id) {
    const o = await orgOf(id);
    if (!o) return R.notFound('Нет доступа');
    const { data: posts } = await sb().from('org_posts').select('id,title,body,created_at').eq('org_id', id).order('created_at', { ascending: false });
    const link = `${location.origin}/p/${o.slug || o.share_token}`;
    R.setCrumbs([['Организации', '#/orgs'], [o.name, '#/org/' + id], ['Портал']]);
    R.view.classList.remove('wide');
    R.view.innerHTML = `<section class="page-head"><div><h1>Портал</h1><p>Страница организации для людей: описание, приём заявок и объявления. Заявки смотрите в разделе «Заявки».</p></div></section>
      <div class="set">
        <section class="card"><h2>Страница портала</h2>
          <label class="chk"><input type="checkbox" id="pOn" ${o.portal_on ? 'checked' : ''}> Портал включён (виден по ссылке)</label>
          <label class="field"><span>О нас</span><textarea id="pAbout" rows="5" placeholder="Кто вы, чем занимаетесь, как вступить">${esc(o.about)}</textarea></label>
          <p class="hint">Оформление (логотип и цвет) берётся из настроек организации. В портал попадают только формы, которые принимают ответы.</p>
          <div class="actions"><button class="btn primary" id="pSave">Сохранить</button><button class="btn" id="pCopy">Копировать ссылку</button></div></section>
        <section class="card"><h2>Объявления</h2>
          ${(posts || []).map(p => `<div class="row"><span class="row-title">${esc(p.title)}</span><span class="row-meta">${R.fmtDate(p.created_at)}</span><button class="icon-btn danger" data-pd="${p.id}" aria-label="Удалить">${icon('trash')}</button></div>`).join('') || '<p class="hint">Объявлений пока нет</p>'}
          <label class="field"><span>Заголовок</span><input id="postT" placeholder="Открыт набор"></label>
          <label class="field"><span>Текст</span><textarea id="postB" rows="3"></textarea></label>
          <div class="actions"><button class="btn" id="postAdd">${icon('plus')}Опубликовать</button></div></section>
      </div>`;
    $('#pSave').onclick = async () => {
      const { error } = await sb().from('orgs').update({ about: $('#pAbout').value, portal_on: $('#pOn').checked }).eq('id', id);
      if (error) { toast('Не удалось сохранить'); return; }
      audit(o, $('#pOn').checked ? 'Портал включён' : 'Портал выключен', '');
      toast('Сохранено');
    };
    $('#pCopy').onclick = () => R.copy(link, 'Ссылка скопирована');
    $('#postAdd').onclick = async () => {
      const t = $('#postT').value.trim();
      if (!t) { toast('Введите заголовок'); return; }
      await sb().from('org_posts').insert({ org_id: id, title: t, body: $('#postB').value.trim() });
      audit(o, 'Объявление на портале', t);
      portalAdmin(id);
    };
    R.view.querySelectorAll('[data-pd]').forEach(b => {
      b.onclick = async () => { await sb().from('org_posts').delete().eq('id', b.dataset.pd); portalAdmin(id); };
    });
  }

  window.PORTAL = { portal, applications, portalAdmin };
})();
