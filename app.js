(() => {
const C = window.CONFIG, KEY = "community_club_proto_v1";
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().slice(0, 10);
let S; try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!S) S = structuredClone(window.SEED);
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const member = () => !!S.user;
const NAV = [["home", "Home"], ["directory", "Directory"], ["deals", "Deals"], ["qa", "Q&A"], ["events", "Events"], ["market", "Classifieds"], ["rentals", "Rentals"], ["rides", "Rides"]];

function route() {
  const p = location.hash.replace(/^#\/?/, "").split("/");
  const c = C.communities.some(x => x.slug === p[0]) ? p[0] : C.communities[0].slug;
  return { c, v: p[1] || "home" };
}
const comm = () => C.communities.find(x => x.slug === route().c);
const fmtDate = s => s ? new Date(s + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "";
const stars = n => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
const avg = k => { const r = S.reviews.filter(x => x.key === k); return r.length ? { a: r.reduce((s, x) => s + x.rating, 0) / r.length, n: r.length } : null; };
const ratingHtml = k => { const a = avg(k); return a ? `<span class="stars">${stars(a.a)}</span> ${a.a.toFixed(1)} (${a.n})` : `<span class="muted">No reviews yet</span>`; };
const inComm = arr => arr.filter(x => x.c === route().c);
const biz = id => S.businesses.find(b => b.id === id);
const lockHtml = msg => `<div class="lock"><h3>Members only</h3><p>${esc(msg)}</p><button class="btn" data-act="join">Join the club</button></div>`;

/* ---------- generic modal form ---------- */
function form(title, fields, onOk, okLabel = "Save") {
  const dlg = $("#dlg");
  const inp = f => {
    if (f.type === "select") return `<select name="${f.name}">${f.options.map(o => `<option value="${esc(o.v ?? o)}">${esc(o.l ?? o)}</option>`).join("")}</select>`;
    if (f.type === "textarea") return `<textarea name="${f.name}" rows="3" ${f.req ? "required" : ""}></textarea>`;
    if (f.type === "checkbox") return `<input type="checkbox" name="${f.name}">`;
    return `<input name="${f.name}" type="${f.type || "text"}" ${f.req ? "required" : ""} placeholder="${esc(f.ph || "")}" value="${esc(f.val || "")}">`;
  };
  dlg.innerHTML = `<form class="f"><h3>${esc(title)}</h3>${fields.map(f => `<label>${esc(f.label)}${inp(f)}</label>`).join("")}<div class="row"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn">${okLabel}</button></div></form>`;
  dlg.showModal();
  $("form", dlg).onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target), o = {};
    fields.forEach(f => o[f.name] = f.type === "checkbox" ? fd.get(f.name) === "on" : fd.get(f.name));
    const keepOpen = onOk(o) === false;
    if (!keepOpen) { dlg.close(); save(); render(); }
  };
}
function info(html) { const d = $("#dlg"); d.innerHTML = `<div>${html}<div class="row"><button class="btn ghost" data-close>Close</button></div></div>`; d.showModal(); }

function reviewForm(key, label, needsVerify) {
  if (!member()) return join();
  const fields = [{ name: "rating", label: "Rating (5 = best)", type: "select", options: [5, 4, 3, 2, 1] }, { name: "comment", label: "Your review", type: "textarea", req: true }];
  if (needsVerify) fields.push({ name: "ok", label: "I confirm I have a real landlord/tenant relationship (live version verifies this with a tenancy handshake)", type: "checkbox" });
  form("Review " + label, fields, o => {
    if (needsVerify && !o.ok) { alert("Please confirm the relationship first."); return false; }
    S.reviews.push({ id: uid(), key, rating: +o.rating, comment: o.comment, by: S.user.name, date: today() });
  }, "Post review");
}

/* ---------- join / gate ---------- */
function join() {
  form("Join " + C.brand, [
    { name: "name", label: "Your name", req: true },
    { name: "role", label: "I am a...", type: "select", options: C.roles.map(r => ({ v: r.v, l: r.l })) },
    { name: "code", label: "Invite code (demo codes: " + C.inviteCodes.join(", ") + ")", req: true },
    { name: "vouch", label: "Vouched by (neighbor's name, optional)" }
  ], o => {
    if (!C.inviteCodes.includes(o.code.trim().toUpperCase())) { alert("That invite code is not valid."); return false; }
    S.user = { name: o.name.trim(), role: o.role, vouch: o.vouch };
  }, "Join");
}

/* ---------- views ---------- */
function dealCard(p) {
  const b = biz(p.biz);
  return `<div class="card"><span class="tag deal">Deal</span><h3>${esc(p.title)}</h3><div class="muted">${esc(b ? b.name : p.by)} · expires ${fmtDate(p.expires)}</div><p>${esc(p.body)}</p>${p.code ? `<div class="tag">Code: ${esc(p.code)}</div>` : ""}</div>`;
}
function eventCard(p) {
  return `<div class="card"><span class="tag">Event</span><h3>${esc(p.title)}</h3><div class="muted">${fmtDate(p.when)} · ${esc(p.where)}</div><p>${esc(p.body)}</p><div class="muted">Posted by ${esc(p.by)}</div></div>`;
}
function itemCard(p) {
  const mine = member() && S.user.name === p.by;
  return `<div class="card"><span class="tag">${p.type === "garage_sale" ? "Garage sale" : "Classified"}</span>${p.sold ? '<span class="tag">SOLD</span>' : ""}<h3>${esc(p.title)}</h3><div class="muted">${esc(p.price || "")} ${p.where ? "· " + esc(p.where) : ""}</div><p>${esc(p.body)}</p><div class="muted">Posted by ${esc(p.by)}</div>${mine ? `<div class="row"><button class="btn sm ghost" data-act="sold" data-id="${p.id}">Toggle sold</button></div>` : ""}</div>`;
}
function rideCard(r) {
  const mine = member() && S.user.name === r.by;
  const resp = (r.responses || []).map(x => `<div class="rev">${esc(x.by)}: ${esc(x.msg)} <span class="tag">${x.status}</span>${mine && x.status === "pending" ? ` <button class="btn sm" data-act="racc" data-id="${r.id}" data-rid="${x.id}">Accept</button> <button class="btn sm ghost" data-act="rdec" data-id="${r.id}" data-rid="${x.id}">Decline</button>` : ""}${x.status === "accepted" && (mine || S.user.name === x.by) ? `<div class="muted">Contact details shared (live version reveals phone/pickup address only after mutual acceptance).</div><button class="btn sm ghost" data-act="rev-driver" data-name="${esc(r.mode === "offer" ? r.by : x.by)}">Review driver</button>` : ""}</div>`).join("");
  return `<div class="card"><span class="tag ${r.mode}">${r.mode === "offer" ? "Offering ride" : "Needs ride"}</span><h3>${esc(r.from)} → ${esc(r.to)}</h3><div class="muted">${fmtDate(r.when)} · ${r.seats} seat(s) · ${esc(r.by)} ${ratingHtml("driver:" + r.by)}</div><p>${esc(r.notes)}</p>${mine ? "" : `<button class="btn sm" data-act="rreply" data-id="${r.id}">${r.mode === "offer" ? "Ask for a seat" : "Offer to help"}</button>`}${resp}</div>`;
}

function home() {
  const cm = comm(), c = cm.slug;
  let h = `<section class="hero"><h1>${esc(cm.name)}</h1><p>${esc(C.tagline)}</p>${member() ? `<p class="muted">Welcome, ${esc(S.user.name)} (${esc(S.user.role)}).</p>` : `<button class="btn" data-act="join">Join the club</button> <span class="muted">${esc(C.trialText)}</span>`}</section>`;
  const events = inComm(S.posts).filter(p => p.type === "event").sort((a, b) => a.when.localeCompare(b.when)).slice(0, 3);
  h += `<h2>Coming up</h2><div class="grid">${events.map(eventCard).join("") || '<p class="muted">No events yet.</p>'}</div>`;
  if (!member()) {
    h += `<h2>Local directory (preview)</h2><div class="grid">${inComm(S.businesses).slice(0, 4).map(b => `<div class="card"><h3>${esc(b.name)}</h3><div class="muted">${esc(b.cat)}</div></div>`).join("")}</div>`;
    return h;
  }
  const deals = inComm(S.posts).filter(p => p.type === "deal");
  const fol = deals.filter(p => S.follows.includes(p.biz));
  h += `<h2>From businesses you follow</h2><div class="grid">${fol.map(dealCard).join("") || '<p class="muted">Follow businesses in the Directory to see their deals here.</p>'}</div>`;
  const items = inComm(S.posts).filter(p => p.type === "classified" || p.type === "garage_sale").slice(0, 3);
  h += `<h2>Newest classifieds</h2><div class="grid">${items.map(itemCard).join("") || '<p class="muted">Nothing yet.</p>'}</div>`;
  h += `<h2>Ride board</h2><div class="grid">${inComm(S.rides).slice(0, 2).map(rideCard).join("")}</div>`;
  return h;
}

let F = { cat: "All", q: "" };
function dirList() {
  const list = inComm(S.businesses).filter(b => (F.cat === "All" || b.cat === F.cat) && (b.name + b.desc).toLowerCase().includes(F.q.toLowerCase()));
  return list.map(b => `<div class="card"><h3>${esc(b.name)}</h3><div class="muted">${esc(b.cat)} · ${esc(b.addr)}</div><p>${esc(b.desc)}</p>${member() ? `<div>${ratingHtml("biz:" + b.id)}</div><div class="row"><button class="btn sm" data-act="follow" data-id="${b.id}">${S.follows.includes(b.id) ? "Following ✓" : "Follow"}</button><button class="btn sm ghost" data-act="bizrev" data-id="${b.id}">Reviews</button></div>` : `<div class="muted">Join to see reviews and deals.</div>`}</div>`).join("") || '<p class="muted">No matches.</p>';
}
function directory() {
  return `<div class="bar"><input id="q" placeholder="Search..." value="${esc(F.q)}"><select id="cat"><option>All</option>${C.categories.map(c => `<option ${F.cat === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>${member() ? '<button class="btn" data-act="addbiz">+ Add a business</button>' : ""}</div><div class="grid" id="dirlist">${dirList()}</div>`;
}
function deals() {
  if (!member()) return lockHtml("Business deals are for members.");
  const l = inComm(S.posts).filter(p => p.type === "deal");
  const canPost = S.user.role === "business_owner";
  return `<div class="bar">${canPost ? '<button class="btn" data-act="adddeal">+ Post a deal</button>' : '<span class="muted">Business owners can post deals (choose the business-owner role when joining).</span>'}</div><div class="grid">${l.map(dealCard).join("") || "<p>No deals yet.</p>"}</div>`;
}
function qa() {
  if (!member()) return lockHtml("Ask and answer local questions.");
  const l = inComm(S.posts).filter(p => p.type === "qa");
  return `<div class="bar"><button class="btn" data-act="ask">+ Ask a question</button></div>${l.map(p => `<div class="card"><h3>${esc(p.title)}</h3><div class="muted">${esc(p.by)} · ${fmtDate(p.date)}</div><p>${esc(p.body)}</p>${p.answers.map(a => `<div class="rev"><b>${esc(a.by)}:</b> ${esc(a.text)}</div>`).join("")}<div class="row"><button class="btn sm ghost" data-act="answer" data-id="${p.id}">Answer</button></div></div>`).join("") || "<p>No questions yet.</p>"}`;
}
function events() {
  const l = inComm(S.posts).filter(p => p.type === "event").sort((a, b) => a.when.localeCompare(b.when));
  return `<div class="bar">${member() ? '<button class="btn" data-act="addevent">+ Add an event</button>' : '<span class="muted">Join to post events.</span>'}</div><div class="grid">${l.map(eventCard).join("") || "<p>No events yet.</p>"}</div>`;
}
function market() {
  if (!member()) return lockHtml("Browse and post classifieds and garage sales.");
  const l = inComm(S.posts).filter(p => p.type === "classified" || p.type === "garage_sale");
  return `<div class="bar"><button class="btn" data-act="additem" data-t="classified">+ Classified</button><button class="btn ghost" data-act="additem" data-t="garage_sale">+ Garage sale</button></div><div class="grid">${l.map(itemCard).join("") || "<p>Nothing yet.</p>"}</div>`;
}
function rentals() {
  if (!member()) return lockHtml("Rental listings and landlord/tenant reviews are for members.");
  const l = inComm(S.rentals);
  const owns = S.rentals.filter(r => r.landlord === S.user.name);
  const tenants = [...new Set(S.rentals.flatMap(r => r.tenants))];
  return `<div class="bar"><button class="btn" data-act="addrental">+ List a home for rent</button>${owns.length ? '<button class="btn ghost" data-act="revtenant">Review a tenant</button>' : ""}</div><div class="grid">${l.map(r => `<div class="card"><h3>${esc(r.title)}</h3><div class="muted">${esc(r.addr)} · $${esc(r.rent)}/mo · ${esc(r.beds)} BR</div><p>${esc(r.desc)}</p><div>Landlord: ${esc(r.landlord)} ${ratingHtml("landlord:" + r.landlord)}</div><div class="row"><button class="btn sm ghost" data-act="revland" data-name="${esc(r.landlord)}">Reviews / review landlord</button></div></div>`).join("") || "<p>No rentals yet.</p>"}</div>${tenants.length ? `<h2>Tenant reputations</h2><div class="grid">${tenants.map(t => `<div class="card"><b>${esc(t)}</b><div>${ratingHtml("tenant:" + t)}</div></div>`).join("")}</div>` : ""}`;
}
function rides() {
  if (!member()) return lockHtml("The ride board is for members.");
  const dr = inComm(S.drivers);
  return `<div class="bar"><button class="btn" data-act="addride" data-m="request">I need a ride</button><button class="btn ghost" data-act="addride" data-m="offer">I'm offering a ride</button><button class="btn ghost" data-act="area">I'm willing to give rides in my area</button></div><div class="grid">${inComm(S.rides).map(rideCard).join("") || "<p>No rides yet.</p>"}</div><h2>Members open to giving rides</h2><div class="grid">${dr.map(x => `<div class="card"><b>${esc(x.name)}</b><div class="muted">${esc(x.area)}</div><p>${esc(x.note)}</p></div>`).join("") || "<p class='muted'>No one yet.</p>"}</div>`;
}
const VIEWS = { home, directory, deals, qa, events, market, rentals, rides };

/* ---------- render ---------- */
function render() {
  const r = route();
  $("#top").innerHTML = `<a class="brand" href="#/${r.c}/home">${esc(C.brand)}</a><select id="comm">${C.communities.map(c => `<option value="${c.slug}" ${c.slug === r.c ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select><nav>${NAV.map(([k, l]) => `<a href="#/${r.c}/${k}" class="${r.v === k ? "on" : ""}">${l}</a>`).join("")}</nav><span class="who">${member() ? `${esc(S.user.name)} · <a style="color:#fff" href="#" data-act="out">Sign out</a>` : '<button class="btn sm" data-act="join">Join / Sign in</button>'}</span>`;
  $("#main").innerHTML = (VIEWS[r.v] || home)();
}

/* ---------- actions ---------- */
const A = {
  join, out() { S.user = null; },
  reset() { if (confirm("Reset all demo data?")) { localStorage.removeItem(KEY); S = structuredClone(window.SEED); } },
  follow(el) { const id = el.dataset.id; S.follows = S.follows.includes(id) ? S.follows.filter(x => x !== id) : [...S.follows, id]; },
  bizrev(el) {
    const b = biz(el.dataset.id), rs = S.reviews.filter(x => x.key === "biz:" + b.id);
    info(`<h3>${esc(b.name)}</h3><div>${ratingHtml("biz:" + b.id)}</div>${rs.map(x => `<div class="rev"><span class="stars">${stars(x.rating)}</span> ${esc(x.comment)}<div class="muted">${esc(x.by)} · ${fmtDate(x.date)}</div></div>`).join("")}<div class="row"><button class="btn" data-act="newbizrev" data-id="${b.id}">Write a review</button></div>`);
    return "noRender";
  },
  newbizrev(el) { $("#dlg").close(); reviewForm("biz:" + el.dataset.id, biz(el.dataset.id).name); return "noRender"; },
  addbiz() {
    form("Add a business", [{ name: "name", label: "Name", req: true }, { name: "cat", label: "Category", type: "select", options: C.categories }, { name: "addr", label: "Address / service area" }, { name: "desc", label: "Description", type: "textarea" }],
      o => S.businesses.push({ id: uid(), c: route().c, name: o.name, cat: o.cat, addr: o.addr, desc: o.desc }));
    return "noRender";
  },
  adddeal() {
    form("Post a deal", [{ name: "biz", label: "Business", type: "select", options: inComm(S.businesses).map(b => ({ v: b.id, l: b.name })) }, { name: "title", label: "Deal title", req: true }, { name: "body", label: "Details", type: "textarea" }, { name: "code", label: "Promo code (optional)" }, { name: "expires", label: "Expires", type: "date", req: true }],
      o => S.posts.push({ id: uid(), c: route().c, type: "deal", biz: o.biz, title: o.title, body: o.body, code: o.code, expires: o.expires, by: S.user.name, date: today() }));
    return "noRender";
  },
  ask() { form("Ask the community", [{ name: "title", label: "Question", req: true }, { name: "body", label: "Details", type: "textarea" }], o => S.posts.push({ id: uid(), c: route().c, type: "qa", title: o.title, body: o.body, by: S.user.name, date: today(), answers: [] })); return "noRender"; },
  answer(el) { const p = S.posts.find(x => x.id === el.dataset.id); form("Answer", [{ name: "text", label: "Your answer", type: "textarea", req: true }], o => p.answers.push({ by: S.user.name, text: o.text })); return "noRender"; },
  addevent() { form("Add an event", [{ name: "title", label: "Title", req: true }, { name: "when", label: "Date", type: "date", req: true }, { name: "where", label: "Where" }, { name: "body", label: "Details", type: "textarea" }], o => S.posts.push({ id: uid(), c: route().c, type: "event", title: o.title, when: o.when, where: o.where, body: o.body, by: S.user.name, date: today() })); return "noRender"; },
  additem(el) { const t = el.dataset.t; form(t === "garage_sale" ? "Garage sale" : "Classified", [{ name: "title", label: "Title", req: true }, { name: "price", label: "Price (optional)" }, { name: "where", label: "Location / address" }, { name: "body", label: "Details", type: "textarea" }], o => S.posts.push({ id: uid(), c: route().c, type: t, title: o.title, price: o.price, where: o.where, body: o.body, by: S.user.name, date: today(), sold: false })); return "noRender"; },
  sold(el) { const p = S.posts.find(x => x.id === el.dataset.id); p.sold = !p.sold; },
  addrental() { form("List a home for rent", [{ name: "title", label: "Title", req: true }, { name: "addr", label: "General location" }, { name: "rent", label: "Monthly rent ($)", type: "number", req: true }, { name: "beds", label: "Bedrooms", type: "number" }, { name: "desc", label: "Description", type: "textarea" }], o => S.rentals.push({ id: uid(), c: route().c, landlord: S.user.name, title: o.title, addr: o.addr, rent: o.rent, beds: o.beds, desc: o.desc, tenants: [] })); return "noRender"; },
  revland(el) {
    const n = el.dataset.name, rs = S.reviews.filter(x => x.key === "landlord:" + n);
    info(`<h3>Landlord: ${esc(n)}</h3><div>${ratingHtml("landlord:" + n)}</div>${rs.map(x => `<div class="rev"><span class="stars">${stars(x.rating)}</span> ${esc(x.comment)}<div class="muted">${esc(x.by)}</div></div>`).join("")}<div class="row"><button class="btn" data-act="newland" data-name="${esc(n)}">Review this landlord</button></div>`);
    return "noRender";
  },
  newland(el) { $("#dlg").close(); reviewForm("landlord:" + el.dataset.name, "landlord " + el.dataset.name, true); return "noRender"; },
  revtenant() {
    form("Review a tenant", [{ name: "name", label: "Tenant name", req: true }, { name: "rating", label: "Rating", type: "select", options: [5, 4, 3, 2, 1] }, { name: "comment", label: "Review", type: "textarea", req: true }],
      o => { S.reviews.push({ id: uid(), key: "tenant:" + o.name.trim(), rating: +o.rating, comment: o.comment, by: S.user.name, date: today() }); const r = S.rentals.find(x => x.landlord === S.user.name); if (r && !r.tenants.includes(o.name.trim())) r.tenants.push(o.name.trim()); });
    return "noRender";
  },
  addride(el) { const m = el.dataset.m; form(m === "offer" ? "Offer a ride" : "Request a ride", [{ name: "from", label: "From (general area)", req: true }, { name: "to", label: "To", req: true }, { name: "when", label: "Date", type: "date", req: true }, { name: "seats", label: "Seats", type: "number", val: "1" }, { name: "notes", label: "Notes", type: "textarea" }], o => S.rides.push({ id: uid(), c: route().c, mode: m, from: o.from, to: o.to, when: o.when, seats: o.seats, notes: o.notes, by: S.user.name, date: today(), responses: [] })); return "noRender"; },
  rreply(el) { const r = S.rides.find(x => x.id === el.dataset.id); form("Respond", [{ name: "msg", label: "Message", type: "textarea", req: true }], o => r.responses.push({ id: uid(), by: S.user.name, msg: o.msg, status: "pending" })); return "noRender"; },
  racc(el) { S.rides.find(x => x.id === el.dataset.id).responses.find(x => x.id === el.dataset.rid).status = "accepted"; },
  rdec(el) { S.rides.find(x => x.id === el.dataset.id).responses.find(x => x.id === el.dataset.rid).status = "declined"; },
  "rev-driver"(el) { reviewForm("driver:" + el.dataset.name, "driver " + el.dataset.name); return "noRender"; },
  area() { form("Willing to give rides", [{ name: "area", label: "General area", req: true }, { name: "note", label: "Note" }], o => { S.drivers = S.drivers.filter(x => !(x.c === route().c && x.name === S.user.name)); S.drivers.push({ c: route().c, name: S.user.name, area: o.area, note: o.note }); }); return "noRender"; }
};

document.addEventListener("click", e => {
  if (e.target.closest("[data-close]")) { $("#dlg").close(); return; }
  const el = e.target.closest("[data-act]"); if (!el) return;
  e.preventDefault();
  const needsMember = !["join", "reset", "out"].includes(el.dataset.act);
  if (needsMember && !member()) return join();
  const res = A[el.dataset.act](el);
  if (res !== "noRender") { save(); render(); }
});
document.addEventListener("input", e => { if (e.target.id === "q") { F.q = e.target.value; $("#dirlist").innerHTML = dirList(); } });
document.addEventListener("change", e => {
  if (e.target.id === "cat") { F.cat = e.target.value; $("#dirlist").innerHTML = dirList(); }
  if (e.target.id === "comm") location.hash = `#/${e.target.value}/${route().v}`;
});
window.addEventListener("hashchange", render);
render();
})();
