const WA = '41797862408';
const MAIL = 'ssprestigecars.ch@gmail.com';
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Tarife: [Bezeichnung, inkl. km, unter der Woche, Wochenende]
const TARIFE = [
  ['2 Stunden', 100, 109, 129],
  ['3 Stunden', 150, 139, 159],
  ['4 Stunden', 180, 159, 189],
  ['5 Stunden', 220, 179, 209],
  ['6 Stunden', 250, 199, 229],
  ['12 Stunden', 350, 269, 299],
  ['24 Stunden', 450, 399, 449],
  ['48 Stunden', 750, 699, 799],
  ['Wochenend-Paket', 1000, null, 899],
  ['7 Tage', 1500, 1999, 1999],
];
const chf = n => "CHF " + n.toLocaleString('de-CH').replace(/[’,]/g, "'");
const km = n => n.toLocaleString('de-CH').replace(/[’,]/g, "'") + ' km';

// Nav
const nav = $('#nav'), burger = $('#burger'), links = $('#links');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
$$('#links a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

// Reveal
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });

// Preisrechner
let cat = 'wd', idx = 0;
const durs = $('#durs');
function renderDurs() {
  durs.innerHTML = TARIFE.map(([name, k, wd, we], i) => {
    const p = cat === 'wd' ? wd : we;
    const tag = i === 6 ? '<span class="tag">Beliebt</span>' : (i === 8 && cat === 'we' ? '<span class="tag">Best Value</span>' : '');
    return `<button class="opt${i === idx ? ' active' : ''}${p == null ? ' hidden' : ''}" data-i="${i}">${tag}<b>${name}</b><span>${km(k)} inkl.</span><span class="p">${p == null ? 'nur Wochenende' : chf(p) + '.-'}</span></button>`;
  }).join('');
}
function update() {
  const [name, k, wd, we] = TARIFE[idx];
  const p = cat === 'wd' ? wd : we;
  const catName = cat === 'wd' ? 'Unter der Woche' : 'Wochenende';
  $('#tot').textContent = chf(p);
  $('#totSub').textContent = `${name} · ${km(k)} inklusive · ${catName}`;
  const text = `Hallo SS Prestige Cars, ich interessiere mich für den BMW M4 Competition.\n\nKategorie: ${catName}\nTarif: ${name} (${km(k)})\nPreis: ${chf(p)}.-\n\nDatum: \nUhrzeit: `;
  $('#calcWa').href = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  renderDurs();
}
$$('#cat .opt').forEach(b => b.addEventListener('click', () => {
  cat = b.dataset.cat;
  $$('#cat .opt').forEach(x => x.classList.toggle('active', x === b));
  if (cat === 'wd' && TARIFE[idx][2] == null) idx = 6;
  update();
}));
durs.addEventListener('click', e => { const b = e.target.closest('.opt'); if (!b) return; idx = +b.dataset.i; update(); });
$('#calcForm').addEventListener('click', () => { $('#fTarif').value = tarifLabel(idx, cat); });
update();

// Formular
const tarifLabel = (i, c) => {
  const [name, k, wd, we] = TARIFE[i];
  return `${name} · ${km(k)} · ${c === 'wd' ? 'Unter der Woche' : 'Wochenende'} · ${chf(c === 'wd' ? wd : we)}`;
};
$('#fTarif').innerHTML = '<option value="">Bitte wählen</option>' + ['wd', 'we'].flatMap(c =>
  TARIFE.map((t, i) => (c === 'wd' ? t[2] : t[3]) == null ? '' : `<option>${tarifLabel(i, c)}</option>`)).join('');

const f = { name: '#fName', phone: '#fPhone', mail: '#fMail', tarif: '#fTarif', from: '#fFrom', to: '#fTo' };
const status = $('#status');
const fmt = v => v ? new Date(v).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' }) : '';
function check() {
  const missing = Object.values(f).some(s => !$(s).value.trim());
  if (missing) return 'Bitte Name, Telefon, E-Mail, Tarif sowie Von/Bis ausfüllen.';
  if (!$(f.mail).checkValidity()) return 'Bitte eine gültige E-Mail-Adresse eingeben.';
  if ($(f.to).value <= $(f.from).value) return '"Bis" muss nach "Von" liegen.';
  if (!$$('.legal').every(c => c.checked)) return 'Bitte alle Pflichtbestätigungen setzen.';
  return '';
}
const body = () => `Hallo SS Prestige Cars,\n\nich möchte eine Mietanfrage für den BMW M4 Competition G82 senden.\n\nName: ${$(f.name).value}\nTelefon: ${$(f.phone).value}\nE-Mail: ${$(f.mail).value}\nTarif: ${$(f.tarif).value}\nVon: ${fmt($(f.from).value)}\nBis: ${fmt($(f.to).value)}\nNachricht: ${$('#fMsg').value || '-'}\n\nIch bestätige, dass ich AGB, Mietbedingungen sowie Reservierungs- und Stornierungsbedingungen gelesen und akzeptiert und Datenschutzerklärung sowie Impressum zur Kenntnis genommen habe.`;
function send(via) {
  const err = check();
  status.textContent = err || (via === 'wa' ? 'WhatsApp wird geöffnet …' : 'E-Mail-Programm wird geöffnet …');
  status.className = 'status ' + (err ? 'err' : 'ok');
  if (err) return;
  track('generate_lead', { form: 'mietanfrage', method: via === 'wa' ? 'whatsapp' : 'email' });
  if (via === 'wa') window.open(`https://wa.me/${WA}?text=${encodeURIComponent(body())}`, '_blank', 'noopener');
  else location.href = `mailto:${MAIL}?subject=${encodeURIComponent('Mietanfrage BMW M4 Competition G82 – SS Prestige Cars')}&body=${encodeURIComponent(body())}`;
}
$('#sendWa').addEventListener('click', () => send('wa'));
$('#sendMail').addEventListener('click', () => send('mail'));

// Galerie-Lightbox
const lb = $('#lightbox');
$$('.g-item').forEach(b => b.addEventListener('click', () => { $('#lbImg').src = b.dataset.src; $('#lbImg').alt = b.querySelector('img').alt; lb.showModal(); }));

// Sound Check
const sm = $('#soundModal'), sv = $('#soundVideo'), sa = $('#soundAudio');
$('#soundBtn').addEventListener('click', () => {
  sm.showModal(); sv.currentTime = 0; sv.muted = false;
  sv.play().catch(() => sa.play().catch(() => {}));
});
sv.addEventListener('error', () => { sm.close(); sa.play().catch(() => {}); });
const closeModal = d => { d.close(); };
$$('dialog').forEach(d => {
  d.addEventListener('click', e => { if (e.target === d || e.target.hasAttribute('data-close')) closeModal(d); });
  d.addEventListener('close', () => { sv.pause(); sa.pause(); });
});

// iPhone: Video, das einmal im Vollbild lief, nicht mehr automatisch starten –
// sonst springt es beim Scrollen jedes Mal wieder in den Vollbildmodus
// In-App-Browser (TikTok, Instagram, Facebook, Snapchat): Videos laufen stumm automatisch,
// sind aber nicht antippbar und ohne Ton-Knopf – ein Tipp/Ton-Start öffnet dort sonst Vollbild
const inApp = /musical_ly|BytedanceWebview|TikTok|trill|Instagram|FBAN|FBAV|Snapchat/i.test(navigator.userAgent);
if (inApp) document.documentElement.classList.add('in-app');
const autoplay = v => { if (!v.dataset.noAuto) { if (inApp) v.muted = true; v.play().catch(() => {}); } };
$$('video').forEach(v => {
  v.setAttribute('webkit-playsinline', '');
  v.addEventListener('webkitbeginfullscreen', () => { if (inApp && v.id !== 'soundVideo') { try { v.webkitExitFullscreen(); } catch (e) {} v.pause(); } v.dataset.noAuto = 1; });
  v.addEventListener('webkitendfullscreen', () => { v.dataset.noAuto = 1; v.pause(); });
});
document.addEventListener('fullscreenchange', () => { const f = document.fullscreenElement; if (f && f.tagName === 'VIDEO') f.dataset.noAuto = 1; });

// Reel: abspielen wenn sichtbar, Ton per Knopf
const reel = $('#reel'), rs = $('#reelSound');
new IntersectionObserver(([e]) => { if (e.isIntersecting) autoplay(reel); else reel.pause(); }, { threshold: .4 }).observe(reel);
rs.addEventListener('click', () => { reel.muted = !reel.muted; rs.textContent = reel.muted ? 'Ton an' : 'Ton aus'; if (!reel.muted) reel.play(); });

// Videos: play muted while visible, button toggles sound (only one with sound at a time)
const vCards = $$('.v-card');
const vObs = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) autoplay(v); else v.pause(); }), { threshold: .5 });
vCards.forEach(c => {
  const v = $('video', c), b = $('.v-sound', c);
  vObs.observe(v);
  b.addEventListener('click', () => {
    const on = v.muted;
    vCards.forEach(o => { $('video', o).muted = true; $('.v-sound', o).textContent = 'Ton an'; });
    if (!reel.muted) { reel.muted = true; rs.textContent = 'Ton an'; }
    v.muted = !on; b.textContent = on ? 'Ton aus' : 'Ton an';
    if (on) v.play().catch(() => {});
  });
});

// Hero: Zahlen zählen hoch, sobald das Auto eingefahren ist
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) $$('.h2-specs b').forEach(el => {
  const m = el.textContent.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m || parseFloat(m[2]) === 0) return;
  const target = parseFloat(m[2]), dec = (m[2].split('.')[1] || '').length;
  el.textContent = m[1] + (0).toFixed(dec) + m[3];
  setTimeout(() => {
    let t0 = null;
    const step = t => { t0 ??= t; const p = Math.min((t - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + (target * e).toFixed(dec) + m[3]; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, 1100);
  // Sicherheitsnetz: falls Animationen gedrosselt werden, Endwert trotzdem anzeigen
  setTimeout(() => { el.textContent = m[1] + target.toFixed(dec) + m[3]; }, 3200);
});

// Handy: Buchen-Button erscheint nach dem Hero, verschwindet beim Anfrageformular
const mBook = $('#mBook');
if (mBook) {
  let pastHero = false, atForm = false;
  const upd = () => mBook.classList.toggle('show', pastHero && !atForm);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; upd(); }).observe($('.h2-cta'));
  const form = $('#anfrage');
  if (form) new IntersectionObserver(([e]) => { atForm = e.isIntersecting; upd(); }, { threshold: .15 }).observe(form);
}

// Google Analytics 4 – lädt NUR nach Zustimmung im Cookie-Banner.
// Events: generate_lead (Mietanfrage-Formular abgeschickt), whatsapp_click / phone_click / email_click (Kontaktaktionen)
function track(name, params) { if (window.gtag) gtag('event', name, params || {}); }
(() => {
  const GA_ID = 'G-QB4J5HY3B6', KEY = 'ssp_cookie_consent';
  const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const load = () => {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', GA_ID);
    const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  };
  if (get() === 'accepted') load();
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const h = a.getAttribute('href'), where = { link_location: a.closest('section, footer, header')?.id || a.closest('footer') && 'footer' || 'seite' };
    if (h.startsWith('https://wa.me/')) track('whatsapp_click', where);
    else if (h.startsWith('tel:')) track('phone_click', where);
    else if (h.startsWith('mailto:')) track('email_click', where);
    else if (h.includes('g.page/r/')) track('review_click', where);
  });
  const rv = $('#bewertungen');
  if (rv && rv.querySelector('.rv-card')) rv.hidden = false;
  const cb = $('#cookieBanner');
  if (cb && !get()) setTimeout(() => cb.classList.add('show'), 1200);
  const set = v => { try { localStorage.setItem(KEY, v); } catch (e) {} cb.classList.remove('show'); if (v === 'accepted') load(); };
  cb?.querySelector('[data-cookie="accept"]').addEventListener('click', () => set('accepted'));
  cb?.querySelector('[data-cookie="decline"]').addEventListener('click', () => set('declined'));
})();
