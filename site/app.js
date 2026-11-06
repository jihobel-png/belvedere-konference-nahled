'use strict';
const rooms = {
  belvedere: { name: 'Sál Belvedere', kicker: 'HISTORIE, KTERÁ DÁ AKCI ATMOSFÉRU', image: 'assets/hall-balcony.jpg', caption: 'Sál Belvedere · pohled z galerie', description: 'Velkorysý sál s galerií, pódiem a tanečním parketem. Vlastní vstup z ulice, šatna a dva bary tvoří zázemí pro konference i společenské večery.', area: '240 m²', areaNote: 'plocha bez galerie', max: 300, maxNote: 'hostů při plese', layouts: [['Divadlo',200],['Školení',120],['Ples',300]] },
  memphis: { name: 'Memphis', kicker: 'MODERNÍ ZÁZEMÍ PRO VAŠE NÁPADY', image: 'assets/memphis.jpg', caption: 'Memphis · prostor s projekcí', description: 'Multifunkční klimatizovaný prostor pro školení, prezentace i oslavy. Projekce, ozvučení a nastavitelné LED osvětlení pomohou dotvořit podobu vaší akce.', area: '180 m²', areaNote: 'plocha prostoru', max: 100, maxNote: 'hostů dle uspořádání', layouts: [['Kapacita',100],['Projekční plátno','3 × 1,7 m'],['LED TV',2]] },
  letna: { name: 'Salonek Letná', kicker: 'KOMORNÍ SETKÁNÍ S DENNÍM SVĚTLEM', image: 'assets/letna.jpg', caption: 'Salonek Letná · uspořádání do U', description: 'Světlý klimatizovaný salonek na exekutivním patře s odděleným vstupem. Pro menší školení a jednání, s pohovkovým koutem a lobby pro chvíle mezi programem.', area: '50 m²', areaNote: 'plocha salonku', max: 25, maxNote: 'hostů v divadle', layouts: [['Divadlo',25],['Školení',20],['Do U',16]] }
};
const $ = selector => document.querySelector(selector);
const tabs = [...document.querySelectorAll('[role="tab"]')];
let activeRoom = 'belvedere';
function showRoom(key, focus = false) {
  const room = rooms[key]; if (!room) return;
  activeRoom = key;
  tabs.forEach(tab => { const selected = tab.dataset.room === key; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; if (selected && focus) tab.focus(); });
  $('#room-panel').setAttribute('aria-labelledby', 'tab-' + key);
  $('#room-image').src = room.image; $('#room-image').alt = room.caption;
  $('#room-image-caption').textContent = room.caption; $('#room-zoom').setAttribute('aria-label', 'Zvětšit fotografii: ' + room.name);
  $('#room-kicker').textContent = room.kicker; const roomHeading = $('#room-name'); const headingText = document.createElement('span'); headingText.className='sr-only'; headingText.textContent=room.name; const headingImage=document.createElement('img'); headingImage.className='brand-heading'; headingImage.src='assets/headings/room-'+key+'.svg'; headingImage.alt=''; headingImage.setAttribute('aria-hidden','true'); roomHeading.replaceChildren(headingText,headingImage); $('#room-description').textContent = room.description;
  const area=$('#room-area');area.replaceChildren(document.createTextNode(room.area.replace('²','')));const squared=document.createElement('sup');squared.textContent='2';area.append(squared); $('#room-area-note').textContent = room.areaNote;
  $('#room-max').textContent = 'až ' + room.max; $('#room-max-note').textContent = room.maxNote;
  $('#room-layouts').replaceChildren(...room.layouts.map(([label, value]) => { const span = document.createElement('span'); span.append(label + ' '); const b = document.createElement('b'); b.textContent = value; span.append(b); return span; }));
  $('.room-select').dataset.selectRoom = key;
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showRoom(tab.dataset.room));
  tab.addEventListener('keydown', event => { let next; if(event.key === 'ArrowRight') next = (index+1)%tabs.length; else if(event.key === 'ArrowLeft') next = (index+tabs.length-1)%tabs.length; else if(event.key === 'Home') next = 0; else if(event.key === 'End') next = tabs.length-1; else return; event.preventDefault(); showRoom(tabs[next].dataset.room, true); });
});
const form = $('#lead-form');
$('.room-select').addEventListener('click', () => { form.elements.room.value = activeRoom; checkCapacity(); });
function checkCapacity(){ const key = form.elements.room.value, guests = Number(form.elements.guests.value); $('#capacity-hint').textContent = rooms[key] && guests > rooms[key].max ? 'Počet hostů přesahuje maximální kapacitu tohoto prostoru. Vyberte jiný prostor nebo si nechte doporučit vhodné řešení.' : ''; form.elements.guests.setCustomValidity(rooms[key] && guests > rooms[key].max ? 'Upravte počet hostů nebo zvolte jiný prostor.' : ''); }
form.elements.room.addEventListener('change', checkCapacity); form.elements.guests.addEventListener('input',checkCapacity);
const pragueToday = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Prague',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); const tomorrow = new Date(pragueToday+'T12:00:00Z'); tomorrow.setUTCDate(tomorrow.getUTCDate()+1); form.elements.date.min = tomorrow.toISOString().slice(0,10);
const menuButton = $('.menu-toggle');
const mobileMenu = window.matchMedia('(max-width:1100px)');
function syncMenu(){ $('#sidebar').inert = mobileMenu.matches && menuButton.getAttribute('aria-expanded') !== 'true'; }
function closeMenu(){ $('#sidebar').classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); syncMenu(); }
mobileMenu.addEventListener('change', closeMenu); syncMenu();
menuButton.addEventListener('click',()=>{const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded',String(open)); $('#sidebar').classList.toggle('open',open);syncMenu();});
$('#sidebar').querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{ if(event.key === 'Escape') closeMenu(); });
document.addEventListener('click',event=>{if(!$('#sidebar').contains(event.target) && !menuButton.contains(event.target)) closeMenu();});
const dialog = $('#media-dialog'); let previousFocus;
function openMedia(src,caption,isVideo=false){previousFocus=document.activeElement;const media=document.createElement(isVideo?'video':'img');media.src=src;if(isVideo){media.controls=true;media.playsInline=true;media.preload='metadata';media.poster='assets/belvedere-hall.jpg';}else media.alt=caption;$('#media-content').replaceChildren(media);$('#media-caption').textContent=caption;dialog.showModal();$('.dialog-close').focus();}
function closeMedia(){ const video=dialog.querySelector('video');if(video)video.pause();dialog.close();$('#media-content').replaceChildren();if(previousFocus)previousFocus.focus(); }
$('.dialog-close').addEventListener('click',closeMedia);dialog.addEventListener('cancel',event=>{event.preventDefault();closeMedia();});dialog.addEventListener('click',event=>{if(event.target===dialog)closeMedia();});
$('#open-film').addEventListener('click',()=>openMedia('assets/belvedere-film.mp4','Sál Belvedere · krátká prohlídka prostoru',true));
$('#room-zoom').addEventListener('click',()=>openMedia(rooms[activeRoom].image,rooms[activeRoom].caption));
document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>openMedia(button.dataset.gallery,button.dataset.caption)));
const config = window.BELVEDERE_CONFIG || {mode:'preview'};
const live = config.mode === 'production';
if(live){$('#demo-note').hidden=true;$('#submit-lead span:first-child').textContent='Odeslat nezávaznou poptávku';$('#form-footnote').textContent='Nezávazná poptávka · Dostupnost a cenu potvrdí hotel';document.querySelectorAll('.preview-label').forEach(el=>el.hidden=true);const faqDemo=$('.faq details:last-child p');faqDemo.textContent='Poptávka je nezávazná. Termín, cenu, vybavení a podmínky potvrdíme individuálně.';$('.footer-bottom span:nth-child(2)').textContent='Konference & eventy';}
let requestId = null;
function newId(){ if(window.crypto && window.crypto.randomUUID)return window.crypto.randomUUID(); const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const h=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`; }
function result(title,text,error=false){const box=$('#form-result');box.replaceChildren();const h=document.createElement('h4');h.textContent=title;const p=document.createElement('p');p.textContent=text;box.append(h,p);box.classList.toggle('error',error);box.hidden=false;box.focus();}
form.addEventListener('input',()=>{requestId=null;});
form.addEventListener('submit',async event=>{
 event.preventDefault();checkCapacity();if(!form.reportValidity())return;
 const data=new FormData(form);
 if(!live){const key=data.get('room');result('Ukázka poptávky je připravena.',`${rooms[key]?.name || 'Prostor dle doporučení'} · ${data.get('guests')} hostů · ${new Intl.DateTimeFormat('cs-CZ').format(new Date(data.get('date')+'T12:00:00'))}. V prezentačním náhledu se údaje neukládají ani neodesílají hotelu.`);return;}
 if(!requestId)requestId=newId();
 const payload={requestId,name:data.get('name').trim(),company:data.get('company').trim(),email:data.get('email').trim(),phone:data.get('phone').trim(),eventType:data.get('eventType'),room:data.get('room'),date:data.get('date'),guests:Number(data.get('guests')),services:data.getAll('services'),message:data.get('message').trim(),privacy:data.get('privacy')==='on',website:data.get('website')};
 const submit=$('#submit-lead');submit.disabled=true;submit.querySelector('span').textContent='Ukládáme poptávku…';
 try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);let response;try{response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal,credentials:'same-origin'});}finally{clearTimeout(timeout);}const body=await response.json();if(!response.ok||body.ok!==true)throw new Error(body.error||'network');result('Vaše poptávka byla přijata.',`Evidujeme ji pod číslem ${body.id}. Dostupnost termínu a nabídku potvrdí hotel. Pokud potřebujete cokoli doplnit, zavolejte na +420 220 106 111.`);form.reset();requestId=null;checkCapacity();}
 catch(error){result('Přijetí poptávky se nepodařilo potvrdit.',error.message==='validation'?'Zkontrolujte údaje a termín akce. Případně nám zavolejte na +420 220 106 111.':'Zkuste odeslání znovu nebo nám zavolejte na +420 220 106 111. Při opakovaném odeslání stejných údajů nevznikne duplicitní poptávka.',true);}
 finally{submit.disabled=false;submit.querySelector('span').textContent='Odeslat nezávaznou poptávku';}
});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{const visible=entries[0].isIntersecting;$('.mobile-cta').classList.toggle('hidden',visible);},{threshold:0});observer.observe($('#poptavka'));}

// Enable only after submit interception is installed, keeping the preview offline.
$('#submit-lead').disabled=false;
