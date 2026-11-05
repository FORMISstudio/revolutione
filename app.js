const initialDocs = [
 {id:"042",name:"Приказ о назначении на должность",type:"Приказ",author:"Alex Karter",date:"05.11.2026",status:"На согласовании",description:"Назначение сотрудника на должность."},
 {id:"041",name:"Рапорт о проведении проверки",type:"Рапорт",author:"James Miller",date:"04.11.2026",status:"Подписан",description:"Проведение внутренней проверки."},
 {id:"040",name:"Заявление на отпуск",type:"Заявление",author:"Sarah Connor",date:"04.11.2026",status:"Подписан",description:"Заявление о предоставлении отпуска."},
 {id:"039",name:"Постановление №018",type:"Постановление",author:"Robert King",date:"03.11.2026",status:"На согласовании",description:"Постановление по материалам дела."},
 {id:"038",name:"Протокол заседания",type:"Протокол",author:"Alex Karter",date:"02.11.2026",status:"Черновик",description:"Итоги рабочего заседания."},
 {id:"037",name:"Рапорт о переводе",type:"Рапорт",author:"Emma Morgan",date:"01.11.2026",status:"Подписан",description:"Перевод сотрудника в другое подразделение."},
 {id:"036",name:"Приказ №036",type:"Приказ",author:"James Miller",date:"31.10.2026",status:"Черновик",description:"Организационный приказ."},
 {id:"035",name:"Служебная записка",type:"Другое",author:"Sarah Connor",date:"30.10.2026",status:"Подписан",description:"Служебная записка для руководства."}
];
let docs = JSON.parse(localStorage.getItem("revolutione_docs") || "null") || initialDocs;
let activeFilter = "Все";
let sortNewest = true;
let activity = JSON.parse(localStorage.getItem("revolutione_activity") || "null") || [
 {name:"Alex Karter",initials:"AK",color:"av-green",action:"создал документ",detail:"Приказ №042",time:"12 минут назад"},
 {name:"James Miller",initials:"JM",color:"av-purple",action:"согласовал документ",detail:"Рапорт о назначении",time:"38 минут назад"},
 {name:"Sarah Connor",initials:"SC",color:"av-blue",action:"обновила шаблон",detail:"Заявление",time:"1 час назад"},
 {name:"Robert King",initials:"RK",color:"av-orange",action:"добавил комментарий",detail:"Постановление №018",time:"2 часа назад"}
];
const templates = [
 ["▤","Приказ","Оформление распоряжений и кадровых решений.","12 полей","Популярный"],
 ["▧","Рапорт","Служебные обращения и доклады сотрудников.","9 полей","Обновлён"],
 ["▣","Заявление","Универсальная форма для обращений граждан и сотрудников.","7 полей","Базовый"],
 ["§","Постановление","Фиксация решений уполномоченных лиц.","14 полей","Юридический"],
 ["▥","Протокол","Повестка, участники и результаты заседания.","11 полей","Базовый"],
 ["⌑","Служебная записка","Внутренняя коммуникация между подразделениями.","6 полей","Базовый"]
];
const laws = [
 ["Конституция штата San Andreas","Основной закон штата. Права, свободы и основы государственного устройства.","КОНСТИТУЦИЯ · 12 ГЛАВ"],
 ["Уголовный кодекс","Составы правонарушений, классификация преступлений и ответственность.","КОДЕКС · 48 СТАТЕЙ"],
 ["Административный кодекс","Правила общественного порядка и административные взыскания.","КОДЕКС · 32 СТАТЬИ"],
 ["Устав LSPD","Внутренний регламент департамента полиции Los Santos.","ВНУТРЕННИЙ ДОКУМЕНТ"],
 ["Закон о государственной службе","Порядок поступления, прохождения и прекращения службы.","ЗАКОН · 18 СТАТЕЙ"],
 ["Дисциплинарный устав","Основания, порядок и меры дисциплинарной ответственности.","УСТАВ · 9 РАЗДЕЛОВ"]
];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function save(){localStorage.setItem("revolutione_docs",JSON.stringify(docs));localStorage.setItem("revolutione_activity",JSON.stringify(activity));}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function statusClass(s){return s==="Подписан"?"signed":s==="На согласовании"?"pending":s==="Отклонён"?"rejected":"draft";}
function docRow(d,full=false){return `<tr><td><div class="doc-cell"><div class="doc-icon">▤</div><div><strong>${escapeHTML(d.name)}</strong><small>№ ${d.id} · ${escapeHTML(d.type)}</small></div></div></td>${full?`<td>${escapeHTML(d.type)}</td>`:""}<td>${d.date}</td>${full?`<td>${escapeHTML(d.author)}</td>`:`<td>${escapeHTML(d.author)}</td>`}<td><span class="status ${statusClass(d.status)}">${d.status}</span></td><td><button class="row-action" data-doc="${d.id}" title="Действия">···</button></td></tr>`;}
function renderDocs(){
 const q=($("#documentSearch")?.value||"").toLowerCase();
 let filtered=docs.filter(d=>(activeFilter==="Все"||d.status===activeFilter)&&`${d.name} ${d.id} ${d.type} ${d.author}`.toLowerCase().includes(q));
 if(!sortNewest) filtered.reverse();
 $("#documentsTable").innerHTML=filtered.map(d=>docRow(d,true)).join("")||`<tr><td colspan="6" style="text-align:center;padding:35px;color:#718075">Ничего не найдено</td></tr>`;
 $("#recentTable").innerHTML=docs.slice(0,5).map(d=>docRow(d,false)).join("");
 $("#documentsCount").textContent=String(docs.length).padStart(2,"0");
 $("#docNavCount").textContent=docs.length;
 $("#allCount").textContent=docs.length;
 $("#tableInfo").textContent=`Показано ${filtered.length} из ${docs.length} документов`;
 $("#totalDocs").textContent=128+docs.length-initialDocs.length;
 $("#pendingDocs").textContent=String(docs.filter(d=>d.status==="На согласовании").length+4).padStart(2,"0");
}
function renderTemplates(){$("#templateGrid").innerHTML=templates.map((t,i)=>`<article class="template-card"><div class="template-icon">${t[0]}</div><h3>${t[1]}</h3><p>${t[2]}</p><div class="template-meta"><span>${t[3]} · ${t[4]}</span><button data-template="${i}">Использовать ↗</button></div></article>`).join("");}
function renderLaws(q=""){$("#lawResults").innerHTML=laws.filter(l=>l.join(" ").toLowerCase().includes(q.toLowerCase())).map(l=>`<article class="law-card"><div class="law-file">§</div><div class="law-card-main"><h3>${l[0]}</h3><p>${l[1]}</p><small>${l[2]}</small></div><button data-law="${l[0]}">Открыть ↗</button></article>`).join("")||`<div class="empty-state"><h3>Ничего не найдено</h3><p>Попробуйте изменить поисковый запрос.</p></div>`;}
function renderActivity(){$("#fullActivity").innerHTML=activity.map(a=>`<div class="activity-item"><div class="activity-avatar ${a.color}">${a.initials}</div><div><p><strong>${escapeHTML(a.name)}</strong> ${escapeHTML(a.action)}</p><span>${escapeHTML(a.detail)} · ${a.time}</span></div></div>`).join("");}
function showToast(message){const t=$("#toast");t.querySelector("p").textContent=message;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2600);}
function navigate(page){$$(".page").forEach(p=>p.classList.remove("active-page"));$("#page-"+page)?.classList.add("active-page");$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));const labels={overview:"Обзор",documents:"Документы",templates:"Шаблоны",laws:"Законодательство",archive:"Архив",members:"Сотрудники",activity:"Журнал действий",assistant:"AI Assistant"};$("#crumb").textContent=labels[page]||"Обзор";$("#sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});}
function openModal(name=""){ $("#modalTitle").textContent=name||"Новый документ";$("#documentForm").reset();$("#docAuthor").value="Alex Karter";$("#modalBackdrop").classList.add("open");setTimeout(()=>$("#docName").focus(),80);}
function closeModal(){$("#modalBackdrop").classList.remove("open");}
function logAction(action,detail){activity.unshift({name:"Alex Karter",initials:"AK",color:"av-green",action,detail,time:"только что"});activity=activity.slice(0,30);save();renderActivity();}
$$("[data-page]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
$("#createDocument").addEventListener("click",()=>openModal());
$("#bannerCreate").addEventListener("click",()=>openModal());
$("#closeModal").addEventListener("click",closeModal);
$("#cancelModal").addEventListener("click",closeModal);
$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal();});
$("#documentForm").addEventListener("submit",e=>{
 e.preventDefault();
 const id=String(Math.max(42,...docs.map(d=>Number(d.id)||0))+1).padStart(3,"0");
 const doc={id,name:$("#docName").value.trim(),type:$("#docType").value,author:$("#docAuthor").value.trim(),date:new Intl.DateTimeFormat("ru-RU").format(new Date()),status:"Черновик",description:$("#docDescription").value.trim()};
 docs.unshift(doc);save();renderDocs();logAction("создал документ",`${doc.type} №${id}`);closeModal();navigate("documents");showToast("Документ создан");
});
$("#documentSearch").addEventListener("input",renderDocs);
$("#docFilters").addEventListener("click",e=>{const b=e.target.closest("button[data-filter]");if(!b)return;activeFilter=b.dataset.filter;$$("[data-filter]").forEach(x=>x.classList.toggle("selected",x===b));renderDocs();});
$("#sortDocuments").addEventListener("click",()=>{sortNewest=!sortNewest;renderDocs();showToast(sortNewest?"Сначала новые":"Сначала старые");});
$("#templateGrid").addEventListener("click",e=>{const b=e.target.closest("[data-template]");if(!b)return;const t=templates[Number(b.dataset.template)];$("#docType").value=t[1];$("#docName").value=t[1]==="Другое"?"Новый документ":`${t[1]} — `;openModal(`Новый документ · ${t[1]}`);$("#docType").value=t[1];$("#docName").value=`${t[1]} — `;});
$("#newTemplate").addEventListener("click",()=>showToast("Конструктор шаблонов появится в следующей версии"));
$("#lawSearch").addEventListener("input",e=>renderLaws(e.target.value));
$("#lawResults").addEventListener("click",e=>{const b=e.target.closest("[data-law]");if(b)showToast(`Открытие: ${b.dataset.law}`);});
$("#addLaw").addEventListener("click",()=>showToast("Добавление источников будет доступно администратору"));
$("#inviteMember").addEventListener("click",()=>showToast("Приглашения по Discord ID — скоро"));
$("#addMemberCard").addEventListener("click",()=>showToast("Приглашения по Discord ID — скоро"));
$("#exportLog").addEventListener("click",()=>{const blob=new Blob([activity.map(a=>`${a.time} — ${a.name} ${a.action}: ${a.detail}`).join("\n")],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="revolutione-activity.txt";a.click();URL.revokeObjectURL(a.href);showToast("Журнал экспортирован");});
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#helpButton").addEventListener("click",()=>showToast("Центр помощи будет добавлен позже"));
$("#notificationButton").addEventListener("click",()=>showToast("Новых уведомлений нет"));
$("#profileButton").addEventListener("click",()=>showToast("Профиль Alex Karter"));
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();sendChat($("#chatInput").value);});
function sendChat(text){const value=text.trim();if(!value)return;const area=$("#chatMessages");area.insertAdjacentHTML("beforeend",`<div class="chat-bubble user">${escapeHTML(value)}</div>`);$("#chatInput").value="";const low=value.toLowerCase();let answer="Я могу помочь подготовить структуру документа, найти нужный раздел базы или подсказать последовательность действий. Уточните организацию, ситуацию и желаемый результат.";if(low.includes("рапорт"))answer="Для рапорта обычно нужны: адресат, данные заявителя, заголовок, суть обращения, дата и подпись. Нажмите «Документы» → «Новый документ» и выберите тип «Рапорт».";else if(low.includes("закон")||low.includes("стать"))answer="Откройте раздел «Законодательство» и воспользуйтесь поиском по названию или ключевым словам. В демонстрационной базе доступны примеры нормативных документов.";else if(low.includes("соглас"))answer="Рекомендуемый маршрут: автор документа → непосредственный руководитель → уполномоченное лицо. Фиксируйте каждый этап и комментарии в карточке документа.";setTimeout(()=>{area.insertAdjacentHTML("beforeend",`<div class="chat-bubble bot">${answer}</div>`);area.scrollTop=area.scrollHeight;},350);}
$$(".suggestion-chips button").forEach(b=>b.addEventListener("click",()=>sendChat(b.textContent)));
$$(".law-category").forEach(b=>b.addEventListener("click",()=>{$$(".law-category").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderLaws($("#lawSearch").value);}));
$("#documentsTable").addEventListener("click",e=>{const b=e.target.closest("[data-doc]");if(!b)return;const d=docs.find(x=>x.id===b.dataset.doc);if(!d)return;const action=prompt(`Документ: ${d.name}\nВведите действие: подписать / согласовать / отклонить / удалить`);if(!action)return;const a=action.toLowerCase();if(a.includes("удал")){docs=docs.filter(x=>x.id!==d.id);logAction("удалил документ",`${d.type} №${d.id}`);}else if(a.includes("подпис")||a.includes("соглас")){d.status="Подписан";logAction("подписал документ",`${d.type} №${d.id}`);}else if(a.includes("откл")){d.status="Отклонён";logAction("отклонил документ",`${d.type} №${d.id}`);}else{showToast("Действие не распознано");return;}save();renderDocs();showToast("Изменения сохранены");});
$("#recentTable").addEventListener("click",e=>{const b=e.target.closest("[data-doc]");if(b){navigate("documents");showToast(`Документ №${b.dataset.doc}`);}});
const now=new Date();$("#currentDate").textContent=new Intl.DateTimeFormat("ru-RU",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(now).toUpperCase();
renderDocs();renderTemplates();renderLaws();renderActivity();
