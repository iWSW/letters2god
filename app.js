window.__L2G_BUILD="v3.21_REQUEST_SUBMITTED_CONFIRM";

const L2G = window.L2G || (window.L2G = {});
const $ = (id)=> document.getElementById(id);

L2G._isMobile = ()=> window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function formatWhen(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
  }catch{
    return "";
  }
}

// Mobile-only 2-letter country codes (fallback makes 2 letters)
L2G.abbrevCountry = (country)=>{
  if (!country) return country;
  const c = String(country).trim();
  if (/^[A-Za-z]{2}$/.test(c)) return c.toUpperCase();

  const map = {
    "United States":"US",
    "United States of America":"US",
    "USA":"US",
    "Canada":"CA",
    "United Kingdom":"UK",
    "Australia":"AU"
  };
  if (map[c]) return map[c];

  const parts = c.split(/\s+/).filter(Boolean);
  let code = "";
  if (parts.length >= 2){
    code = (parts[0][0] || "") + (parts[1][0] || "");
  } else {
    code = c.slice(0,2);
  }
  return code.toUpperCase();
};

const CATS = ["Blessing","Fellowship","Financial","Health","Intercession","Spiritual","Supplication","Worship","Other"];

const SAMPLE = [
  {id:"p1", category:"Health", city:"Boston", country:"United States", created_at:"2025-12-21", count:12,
   body:"My mother is 84 years old and just found out she has Stage 3 ovarian cancer. She begins chemotherapy soon and we are scared."},
  {id:"p2", category:"Financial", city:"Toronto", country:"Canada", created_at:"2025-12-20", count:7,
   body:"Please pray for my son who is looking for work to provide for his family."},
  {id:"p3", category:"Fellowship", city:"London", country:"United Kingdom", created_at:"2025-12-19", count:5,
   body:"We’re moving to a new city and need community and friends—please pray for open doors and good relationships."},
  {id:"p4", category:"Supplication", city:"Sydney", country:"Australia", created_at:"2025-12-18", count:9,
   body:"Asking for peace and guidance as I decide on a major life change."},
];

// Prototype archived requests for the Archive picker (year/month filtering).
// In production this would come from the archive store/service.
const ARCHIVE_SAMPLE = [
  {id:"a1", category:"Health", city:"Springfield", country:"United States", created_at:"2026-01-03", count:4,
   body:"Please pray for healing and peace as I start a new treatment this month."},
  {id:"a2", category:"Financial", city:"Dallas", country:"United States", created_at:"2026-02-12", count:8,
   body:"Asking for provision and wisdom as we work through unexpected bills."},
  {id:"a3", category:"Intercession", city:"Miami", country:"United States", created_at:"2026-03-21", count:6,
   body:"Please pray for my sister to return to faith and find the right community."},
  {id:"a4", category:"Supplication", city:"Seattle", country:"United States", created_at:"2026-04-09", count:3,
   body:"Seeking guidance for a major decision and peace in the waiting."},
  {id:"a5", category:"Fellowship", city:"Boston", country:"United States", created_at:"2026-05-27", count:5,
   body:"Pray for new friendships and a supportive church as we relocate."},
  {id:"a6", category:"Spiritual", city:"Phoenix", country:"United States", created_at:"2026-06-15", count:7,
   body:"Please pray for strength to resist temptation and grow in discipline."},
  {id:"a7", category:"Worship", city:"Nashville", country:"United States", created_at:"2026-07-04", count:2,
   body:"Thanksgiving for answered prayers—please join me in praising God."},
  {id:"a8", category:"Other", city:"Denver", country:"United States", created_at:"2026-08-19", count:1,
   body:"Please pray for clarity and calm as I navigate a difficult season."},
  {id:"a9", category:"Blessing", city:"Chicago", country:"United States", created_at:"2026-09-11", count:9,
   body:"Pray for blessing and protection over our family as we begin school."},
  {id:"a10", category:"Health", city:"Portland", country:"United States", created_at:"2026-10-02", count:10,
   body:"Please pray for my father’s recovery after surgery and for comfort."},
  {id:"a11", category:"Financial", city:"Tampa", country:"United States", created_at:"2026-11-23", count:4,
   body:"Asking for help finding stable work and peace during the search."},
  {id:"a12", category:"Intercession", city:"San Diego", country:"United States", created_at:"2026-12-08", count:12,
   body:"Please pray for reconciliation and healing in a strained relationship."},
];

function setCatDot(el){
  const cat = (el.getAttribute("data-cat") || "").trim();
  const initial = cat ? cat.slice(0,1).toUpperCase() : "?";
  el.textContent = initial;
  el.title = cat;
}

function renderList(items){
  const list = $("list");
  if (!list) return;
  list.innerHTML = "";

  for (const p of items){
    const el = document.createElement("div");
    el.className = "item";
    el.setAttribute("data-id", p.id);

    const src = (p.body || "").trim();
    const letter = src.length > 97 ? (src.slice(0,97) + " -") : src;

    const countryDisplay = L2G._isMobile() ? L2G.abbrevCountry(p.country) : p.country;

    el.innerHTML = `
      <div class="itemTop">
        <p class="letterLine">${escapeHtml(letter)}</p>
      </div>

      <hr class="sepLine"/>

      <div class="metaRow">
        <span class="metaLeft">🙏 <span class="metaCount">${escapeHtml(p.count ?? 0)}</span></span>

        <div class="metaMid">
          <span class="metaCity">${escapeHtml(p.city)}</span>
          <span class="metaCountry">${L2G.abbrevCountry(L2G._isMobile() ? L2G.abbrevCountry(escapeHtml(countryDisplay)) : (escapeHtml(countryDisplay)))}</span>
        </div>

        <span class="dateMid">${escapeHtml(formatWhen(p.created_at))}</span>

        <span class="catDot" data-cat="${escapeHtml(p.category)}"></span>
      </div>
    `;

    const dot = el.querySelector(".catDot");
    if (dot) setCatDot(dot);

    el.addEventListener("click", ()=> openDetail(p));
    list.appendChild(el);
  }
}

function renderArchiveList(items){
  const list = $("archiveList");
  if (!list) return;
  list.innerHTML = "";

  for (const p of items){
    const el = document.createElement("div");
    el.className = "item";
    el.setAttribute("data-id", p.id);

    const src = (p.body || "").trim();
    const letter = src.length > 97 ? (src.slice(0,97) + " -") : src;
    const countryDisplay = L2G._isMobile() ? L2G.abbrevCountry(p.country) : p.country;

    el.innerHTML = `
      <div class="itemTop">
        <p class="letterLine">${escapeHtml(letter)}</p>
      </div>

      <hr class="sepLine"/>

      <div class="metaRow">
        <span class="metaLeft">🙏 <span class="metaCount">${escapeHtml(p.count ?? 0)}</span></span>

        <div class="metaMid">
          <span class="metaCity">${escapeHtml(p.city)}</span>
          <span class="metaCountry">${L2G.abbrevCountry(L2G._isMobile() ? L2G.abbrevCountry(escapeHtml(countryDisplay)) : (escapeHtml(countryDisplay)))}</span>
        </div>

        <span class="dateMid">${escapeHtml(formatWhen(p.created_at))}</span>

        <span class="catDot" data-cat="${escapeHtml(p.category)}"></span>
      </div>
    `;

    const dot = el.querySelector(".catDot");
    if (dot) setCatDot(dot);

    // Reuse the same Prayer Detail card if present on the page.
    el.addEventListener("click", ()=> openDetail(p));
    list.appendChild(el);
  }
}

let active = null;
function openDetail(p){
  active = p;
  const detail = $("detail");
  const backdrop = $("backdrop");
  if (!detail || !backdrop) return;

  // Locked wording + format (v3):
  // Name: First + last initial
  // Meta: City, Country · Date
  // Counter: "X prayers sent"
  const first = p.first_name ? String(p.first_name).trim() : "Sarah";
  let li = p.last_initial ? String(p.last_initial).trim() : "M";
  if (li.length === 1) li = li.toUpperCase() + ".";
  const city = p.city ? String(p.city).trim() : "Springfield";
  const country = L2G.abbrevCountry(p.country) || "US";

  const nameEl = $("dName");
  if (nameEl) nameEl.textContent = `${first} ${li}`;

  const metaEl = $("dMeta");
  if (metaEl) metaEl.textContent = `${city}, ${country} · ${formatWhen(p.created_at)}`;

  const count = (p.count ?? 0);
  const countEl = $("dCountTop");
  if (countEl) countEl.textContent = `${count} prayers sent`;

  const catEl = $("dCategory");
  if (catEl) catEl.textContent = p.category;

  const dot = $("dCatDot");
  if (dot){
    dot.setAttribute("data-cat", p.category);
    setCatDot(dot);
  }

  const bodyEl = $("dBody");
  if (bodyEl) bodyEl.textContent = p.body;

  // Reset button state when opening
  const pray = $("prayBtn");
  if (pray){
    pray.disabled = false;
    pray.textContent = "🙏 I prayed for this";
  }

  backdrop.hidden = false;

  // <dialog> elements won't render unless "open"/showModal() is used.
  detail.hidden = false;
  if (detail.tagName === "DIALOG"){
    try {
      if (typeof detail.showModal === "function") detail.showModal();
      else detail.setAttribute("open", "");
    } catch {
      // Fallback for browsers that disallow showModal without user gesture
      detail.setAttribute("open", "");
    }
  } else {
    detail.style.display = "block";
  }
}

function closeDetail(){
  const detail = $("detail");
  const backdrop = $("backdrop");
  if (detail){
    if (detail.tagName === "DIALOG"){
      try { if (typeof detail.close === "function") detail.close(); } catch {}
      detail.removeAttribute("open");
    } else {
      detail.style.display = "none";
    }
    detail.hidden = true;
  }
  if (backdrop) backdrop.hidden = true;
  active = null;
}

function wireDetail(){
  const backdrop = $("backdrop");
  if (backdrop) backdrop.addEventListener("click", closeDetail);

  const home = $("homeBtn");
  if (home) home.addEventListener("click", (e)=>{ e.preventDefault(); closeDetail(); });

  const pray = $("prayBtn");
  if (pray){
    pray.addEventListener("click", (e)=>{
      e.preventDefault();
      if (!active) return closeDetail();

      // Increment count and reflect immediately in the open card.
      active.count = (active.count ?? 0) + 1;
      const countEl = $("dCountTop");
      if (countEl) countEl.textContent = `${active.count} prayers sent`;

      // Disable and swap to the locked confirmation label
      pray.disabled = true;
      pray.textContent = "✔ Prayer sent";

      // Also update the list behind the modal so counts stay consistent.
      renderList(applyFilters());
    });
  }
}

let selectedCountry = "All";
let selectedCategory = "All";

function populateFilters(){
  const cSel = $("countrySelect");
  const catSel = $("categorySelect"); // hidden storage
  const catBtn = $("categoryBtn");
  const catMenu = $("categoryMenu");
  if (!cSel || !catSel || !catBtn || !catMenu) return;

  const countries = Array.from(new Set(SAMPLE.map(p=>p.country))).sort((a,b)=>a.localeCompare(b));
  cSel.innerHTML = `<option value="All">Country</option>` + countries.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

  const categories = Array.from(new Set(SAMPLE.map(p=>p.category))).sort((a,b)=>a.localeCompare(b));
  catSel.innerHTML = `<option value="All">Categories</option>` + categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

  const slug = (s)=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const buildMenu = ()=>{
    catMenu.innerHTML = `
      <button type="button" data-value="All"><span class="catSwatch cat-other"></span>Categories</button>
      ${categories.map(c=>{
        const cls = "cat-" + slug(c);
        return `<button type="button" data-value="${escapeHtml(c)}"><span class="catSwatch ${cls}"></span>${escapeHtml(c)}</button>`;
      }).join("")}
    `;
  };
  buildMenu();

  const positionMenu = ()=>{
    const r = catBtn.getBoundingClientRect();
    catMenu.style.left = (r.left + window.scrollX) + "px";
    catMenu.style.top = (r.bottom + window.scrollY + 6) + "px";
  };
  const openMenu = ()=>{
    positionMenu();
    catMenu.hidden = false;
    catBtn.setAttribute("aria-expanded","true");
  };
  const closeMenu = ()=>{
    catMenu.hidden = true;
    catBtn.setAttribute("aria-expanded","false");
  };

  catBtn.addEventListener("click", (e)=>{
    e.stopPropagation();
    if (catMenu.hidden) openMenu();
    else closeMenu();
  });

  catMenu.addEventListener("click", (e)=>{
    const b = e.target.closest("button[data-value]");
    if (!b) return;
    const v = b.getAttribute("data-value") || "All";
    selectedCategory = v;
    catSel.value = v;
    catBtn.textContent = (v==="All") ? "Categories" : v;
    renderList(applyFilters());
    closeMenu();
  });

  document.addEventListener("click", closeMenu);
  window.addEventListener("resize", ()=>{ if(!catMenu.hidden) positionMenu(); });

  cSel.addEventListener("change", ()=>{
    selectedCountry = cSel.value || "All";
    renderList(applyFilters());
  });
}

function applyFilters(){
  let items = [...SAMPLE];
  if (selectedCountry !== "All") items = items.filter(p=>p.country===selectedCountry);
  if (selectedCategory !== "All") items = items.filter(p=>p.category===selectedCategory);
  // newest to oldest
  items.sort((a,b)=> String(b.created_at).localeCompare(String(a.created_at)));
  return items;
}

// Mobile menu

// Header menu (native select) — used on pages without the Home filter row
L2G.wireHeaderMenuSelect = ()=>{
  const sel = document.getElementById("headerMenuSelect");
  if (!sel) return;
  sel.addEventListener("change", ()=>{
    const v = sel.value;
    if (v) window.location.href = v;
    sel.value = "";
  });
};

L2G.wireKebab = ()=>{
  const btn = $("kebabBtn");
  const menu = $("kebabMenu");
  if (!btn || !menu) return;

  menu.innerHTML = `
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="request.html">Request</a>
    <a href="archive.html">Archive</a>
    <a href="account.html">Account</a>
    <a href="contact.html">Contact</a>
  `;

  const close = ()=>{ menu.hidden = true; };
  btn.addEventListener("click", (e)=>{
    e.stopPropagation();
    const r = btn.getBoundingClientRect();
    menu.style.left = (r.left + window.scrollX) + "px";
    menu.style.top = (r.bottom + window.scrollY + 6) + "px";
    menu.hidden = !menu.hidden;
  });
  document.addEventListener("click", close);
};

// Home filter-row menu (mobile-only)
L2G.wireMenuSelect = ()=>{
  const sel = document.getElementById("menuSelect");
  if (!sel) return;
  sel.addEventListener("change", ()=>{
    const v = sel.value;
    if (v) window.location.href = v;
    sel.value = "";
  });
};

// Archive — Month/Year picker + filtered list
L2G.wireArchive = ()=>{
  const openBtn = $("openArchivePicker");
  const picker = $("archivePicker");
  const backdrop = $("backdrop");
  const yearsEl = $("pickerYears");
  const monthsWrap = $("pickerMonthsWrap");
  const monthsEl = $("pickerMonths");
  const backBtn = $("pickerBack");
  const closeBtn = $("pickerClose");
  const hint = $("aHint");
  const list = $("archiveList");
  const empty = $("archiveEmpty");

  if (!openBtn || !picker || !yearsEl || !monthsWrap || !monthsEl) return;

  // Build available years from archive data (prototype uses ARCHIVE_SAMPLE)
  const years = Array.from(new Set(ARCHIVE_SAMPLE.map(p=> String(p.created_at).slice(0,4))))
    .filter(Boolean)
    .sort((a,b)=> b.localeCompare(a));

  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  let selectedYear = null;

  const openDialog = ()=>{
    if (backdrop) backdrop.hidden = false;
    picker.hidden = false;
    if (picker.tagName === "DIALOG"){
      try {
        if (typeof picker.showModal === "function") picker.showModal();
        else picker.setAttribute("open", "");
      } catch {
        picker.setAttribute("open", "");
      }
    } else {
      picker.style.display = "block";
    }
  };

  const closeDialog = ()=>{
    if (picker.tagName === "DIALOG"){
      try { if (typeof picker.close === "function") picker.close(); } catch {}
      picker.removeAttribute("open");
    } else {
      picker.style.display = "none";
    }
    picker.hidden = true;
    if (backdrop) backdrop.hidden = true;
    // Reset to year view next time
    monthsWrap.hidden = true;
    backBtn && (backBtn.hidden = true);
    selectedYear = null;
  };

  const showYears = ()=>{
    yearsEl.innerHTML = years.map(y=>`<button type="button" class="btn" data-year="${escapeHtml(y)}">${escapeHtml(y)}</button>`).join("");
    monthsWrap.hidden = true;
    if (backBtn) backBtn.hidden = true;
  };

  const showMonths = (year)=>{
    selectedYear = year;
    monthsEl.innerHTML = MONTHS.map((m, idx)=>{
      const mm = String(idx+1).padStart(2,"0");
      return `<button type="button" class="btn" data-month="${mm}">${escapeHtml(m)}</button>`;
    }).join("");
    monthsWrap.hidden = false;
    if (backBtn) backBtn.hidden = false;
  };

  const applyArchiveFilter = (year, month)=>{
    const safeYear = (year == null) ? "" : String(year);
    const mmNum = Number(month);
    const monthName = (MONTHS[mmNum-1] || "").trim();
    const hintText = `${monthName} ${safeYear}`.trim();

    const ym = `${safeYear}-${String(month).padStart(2,'0')}`;
    const items = ARCHIVE_SAMPLE
      .filter(p=> String(p.created_at).startsWith(ym))
      .sort((a,b)=> String(b.created_at).localeCompare(String(a.created_at)));

    if (list) list.hidden = false;
    if (hint) hint.textContent = hintText || "Choose a month and year.";

    if (items.length){
      if (empty) empty.hidden = true;
      renderArchiveList(items);
    } else {
      if (list) list.innerHTML = "";
      if (empty) empty.hidden = false;
      empty.textContent = hintText ? `No requests for ${hintText}.` : "No requests for this month.";
    }
  };

  // Wire events
  openBtn.addEventListener("click", ()=>{ showYears(); openDialog(); });
  yearsEl.addEventListener("click", (e)=>{
    const b = e.target.closest("button[data-year]");
    if (!b) return;
    showMonths(b.getAttribute("data-year"));
  });
  monthsEl.addEventListener("click", (e)=>{
    const b = e.target.closest("button[data-month]");
    if (!b || !selectedYear) return;
    const month = b.getAttribute("data-month");
    closeDialog();
    applyArchiveFilter(selectedYear, month);
  });
  if (backBtn) backBtn.addEventListener("click", ()=>{ showYears(); selectedYear=null; });
  if (closeBtn) closeBtn.addEventListener("click", closeDialog);
  if (backdrop) backdrop.addEventListener("click", ()=>{
    // If picker is open, close it; otherwise detail modal handler will run.
    if (!picker.hidden) closeDialog();
  });

  // Default state: no month chosen yet
  if (hint) hint.textContent = "Choose a month and year.";
  if (empty) empty.hidden = true;
  if (list) list.hidden = true;
};
L2G.wireContact = ()=>{};
L2G.wirePlan = ()=>{};
L2G.wireRequest = ()=>{};
L2G.wireMyRequests = ()=>{};
L2G.wireLogin = ()=>{};
L2G.wireCreateAccount = ()=>{};
L2G.wireAccount = ()=>{};

document.addEventListener("DOMContentLoaded", ()=>{
  L2G.wireHeaderMenuSelect();
  L2G.wireMenuSelect();

  // Home feed
  if ($("list")){
    populateFilters();
    renderList(applyFilters());
    wireDetail();
  }

  // Archive
  if ($("archiveList")){
    L2G.wireArchive();
    wireDetail();
  }
});

// ================================
// v3.22 — Local beta accounts (no backend)
// ================================
(() => {
  const AUTH_KEY = 'l2g_auth_user';
  const USERS_KEY = 'l2g_users';

  const read = (k, fallback)=>{
    try{ return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback)); }
    catch{ return fallback; }
  };
  const write = (k, v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} };

  const normEmail = (e)=> String(e||'').trim().toLowerCase();

  const getUsers = ()=> read(USERS_KEY, []);
  const setUsers = (arr)=> write(USERS_KEY, arr);

  const setAuth = (user)=> write(AUTH_KEY, user);
  const getAuth = ()=> read(AUTH_KEY, null);
  const clearAuth = ()=>{ try{ localStorage.removeItem(AUTH_KEY); }catch{} };

  const findByEmail = (email)=>{
    const e = normEmail(email);
    return getUsers().find(u=> normEmail(u.email) === e) || null;
  };

  // Expose tiny auth API
  L2G.auth = {
    isAuthed: ()=> !!getAuth(),
    getUser: ()=> getAuth(),
    signOut: ()=>{ clearAuth(); },
    findByEmail
  };

  // Gate page: if authed, go straight to request form
  L2G.wireGate = ()=>{
    if (L2G.auth.isAuthed()) window.location.href = 'request.html';
  };

  // Create Account page
  L2G.wireCreateAccount = ()=>{
    const first = $('caFirst');
    const last = $('caLast');
    const email = $('caEmail');
    const city = $('caCity');
    const countrySel = $('caCountrySelect');
    const ccPill = $('caCountryCodePill');
    const dialPill = $('caDialPill');
    const phone = $('caPhone');
    const pass = $('caPass');
    const pass2 = $('caPass2');
    const savePay = $('caSavePay');
    const btn = $('createBtn');
    const note = $('createNote');

    const show = (msg)=>{ if (!note) return; note.hidden = !msg; note.textContent = msg||''; };

    const syncCountry = ()=>{
      if (!countrySel) return;
      const opt = countrySel.options[countrySel.selectedIndex];
      const code = (countrySel.value||'').toUpperCase();
      const dial = opt?.getAttribute('data-dial') || '';
      if (ccPill) ccPill.textContent = code || '';
      if (dialPill) dialPill.textContent = dial || '';
    };

    if (countrySel){
      countrySel.addEventListener('change', syncCountry);
      syncCountry();
    }

    if (btn){
      btn.addEventListener('click', ()=>{
        show('');
        const f = String(first?.value||'').trim();
        const l = String(last?.value||'').trim();
        const e = normEmail(email?.value);
        const cty = String(city?.value||'').trim();
        const cCode = String(countrySel?.value||'US').toUpperCase();
        const cName = countrySel?.options?.[countrySel.selectedIndex]?.textContent?.trim() || '';
        const dial = String(dialPill?.textContent||'').trim();
        const ph = String(phone?.value||'').trim();
        const p1 = String(pass?.value||'');
        const p2 = String(pass2?.value||'');

        if (!f) return show('Please enter your first name.');
        if (!l) return show('Please enter your last name.');
        if (!e) return show('Email address is required.');
        if (!p1) return show('Password is required.');
        if (p1 !== p2) return show('Passwords do not match.');
        if (findByEmail(e)) return show('That email address is already in use.');

        const user = {
          first: f,
          last: l,
          email: e,
          city: cty,
          country_code: cCode,
          country_name: cName,
          dial_code: dial,
          phone: ph,
          // NOTE: beta only. Do not store plaintext in production.
          password: p1,
          subscribed: false,
          has_payment_method: !!(savePay && savePay.checked)
        };

        const users = getUsers();
        users.push(user);
        setUsers(users);
        setAuth({ email: user.email });

        // If they opted to save a payment method, send them to the payment placeholder.
        if (user.has_payment_method){
          window.location.href = 'payment.html?next=request.html';
        } else {
          window.location.href = 'request.html';
        }
      });
    }
  };

  // Login page
  L2G.wireLogin = ()=>{
    const email = $('loginEmail');
    const pass = $('loginPass');
    const btn = $('loginBtn');
    const note = $('loginNote');
    const forgot = $('forgotLink');

    const show = (msg)=>{ if (!note) return; note.hidden = !msg; note.textContent = msg||''; };

    if (forgot){
      forgot.addEventListener('click', (e)=>{
        e.preventDefault();
        show('Password recovery is not available in this beta build.');
      });
    }

    if (btn){
      btn.addEventListener('click', ()=>{
        show('');
        const e = normEmail(email?.value);
        const p = String(pass?.value||'');
        if (!e) return show('Please enter your email address.');
        if (!p) return show('Please enter your password.');

        const user = findByEmail(e);
        if (!user || String(user.password||'') !== p){
          return show('That email or password is incorrect.');
        }
        setAuth({ email: user.email });
        window.location.href = 'request.html';
      });
    }
  };

  // Request form page
  L2G.wireRequest = ()=>{
    if (!L2G.auth.isAuthed()) { window.location.href = 'gate.html'; return; }

    const auth = L2G.auth.getUser();
    const user = findByEmail(auth?.email) || null;
    if (!user){ clearAuth(); window.location.href = 'gate.html'; return; }

    const nameEl = $('reqDisplayName');
    const locEl = $('reqDisplayLocation');
    const hide = $('hideLocation');

    const lastInitial = String(user.last||'').trim() ? (String(user.last).trim()[0].toUpperCase() + '.') : '';
    if (nameEl) nameEl.textContent = `${user.first||''} ${lastInitial}`.trim() || '—';

    const renderLoc = ()=>{
      if (!locEl) return;
      if (hide && hide.checked){ locEl.textContent = '—'; return; }
      const city = String(user.city||'').trim();
      const cc = String(user.country_code||'').trim();
      locEl.textContent = `${city}${city && cc ? ', ' : ''}${cc}`.trim() || '—';
    };
    renderLoc();
    if (hide) hide.addEventListener('change', renderLoc);

    // Populate categories
    const sel = $('requestCategorySelect');
    const dot = $('requestCatDot');
    if (sel && !sel.options.length){
      sel.innerHTML = '<option value="" selected disabled>Select a category</option>' +
        CATS.map(c=> `<option value="${c}">${c}</option>`).join('');
    }

    const syncCatDot = ()=>{
      if (!dot) return;
      const c = String(sel?.value||'Other');
      dot.setAttribute('data-cat', c);
      dot.textContent = (c && c!=='Select a category') ? c[0].toUpperCase() : 'O';
    };
    if (sel){
      sel.addEventListener('change', syncCatDot);
      // initialize
      if (!sel.value) { sel.value = ''; }
      syncCatDot();
    }

    // Character counter
    const ta = $('requestText');
    const counter = $('charCounter');
    const upd = ()=>{ if (ta && counter) counter.textContent = `${(ta.value||'').length} / 500`; };
    if (ta){ ta.addEventListener('input', upd); upd(); }

    // Button text based on payment/subscription
    const submit = $('submitBtn');
    const note = $('submitNote');
    const paySaved = $('paySaved');

    const paidOk = ()=> !!(user.subscribed || user.has_payment_method);
    const refreshPay = ()=>{
      if (!submit) return;
      if (paidOk()){
        submit.textContent = 'Submit Prayer Request';
        if (paySaved){ paySaved.hidden = false; paySaved.textContent = user.subscribed ? 'Your subscription covers this request.' : 'Payment method on file.'; }
      } else {
        submit.textContent = 'Add payment method & submit';
        if (paySaved){ paySaved.hidden = true; paySaved.textContent = ''; }
      }
    };
    refreshPay();

    const show = (msg)=>{ if (!note) return; note.hidden = !msg; note.textContent = msg||''; };

    if (submit){
      submit.addEventListener('click', ()=>{
        show('');
        const cat = String(sel?.value||'');
        const body = String(ta?.value||'').trim();
        if (!cat) return show('Please select a category.');
        if (!body) return show('Your prayer request is required.');
        if (body.length > 500) return show('Your request must be 500 characters or fewer.');

        if (!paidOk()){
          window.location.href = 'payment.html?next=request.html';
          return;
        }

        // Store locally for beta
        const req = {
          id: 'r' + Math.random().toString(16).slice(2),
          category: cat,
          body,
          created_at: new Date().toISOString().slice(0,10),
          count: 0,
          city: user.city||'',
          country: user.country_code||'US',
          first_name: user.first||'',
          last_initial: String(user.last||'').trim() ? String(user.last).trim()[0].toUpperCase() : ''
        };
        try{
          const arr = read('l2g_requests', []);
          arr.unshift(req);
          write('l2g_requests', arr);
        }catch{}

        window.location.href = 'request_submitted.html';
      });
    }
  };

  // Payment placeholder (beta)
  L2G.wirePayment = ()=>{
    if (!L2G.auth.isAuthed()) { window.location.href = 'gate.html'; return; }
    const auth = L2G.auth.getUser();
    const user = findByEmail(auth?.email) || null;
    if (!user){ clearAuth(); window.location.href = 'gate.html'; return; }

    const btn = $('savePaymentBtn');
    const note = $('payNote');
    const show = (msg)=>{ if (!note) return; note.hidden = !msg; note.textContent = msg||''; };

    const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || 'request.html';

    if (btn){
      btn.addEventListener('click', ()=>{
        // Minimal validation
        const card = String($('cardNumber')?.value||'').replace(/\s+/g,'');
        if (card.length < 12) return show('Please enter a valid card number.');
        user.has_payment_method = true;
        const users = getUsers().map(u=> normEmail(u.email)===normEmail(user.email) ? user : u);
        setUsers(users);
        window.location.href = next;
      });
    }
  };
})();
