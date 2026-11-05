(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var ICON = {
    note: '<svg class="icon" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg>',
    tasks: '<svg class="icon" viewBox="0 0 24 24"><path d="m4 7 2 2 3-3M4 16l2 2 3-3M12 8h8M12 17h8"/></svg>',
    plus: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    grip: '<svg class="icon" viewBox="0 0 24 24" style="stroke-width:2.5"><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"/></svg>',
    close: '<svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    board: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/></svg>',
    todo: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>'
  };

  // ---- Example data (prototype only) ----
  var uid = 100;
  function note(title, excerpt, tags, blocks) { return { id: ++uid, kind: "note", title: title, excerpt: excerpt, tags: tags || [], blocks: blocks || [{ t: "p", x: excerpt }] }; }
  function tasks(title, items, tags) { return { id: ++uid, kind: "tasks", title: title, tags: tags || [], items: items.map(function (i) { return { t: i[0], done: !!i[1] }; }) }; }
  var data = {
    personal: {
      sections: [
        { id: "home", name: "Home projects", columns: [
          { name: "Ideas", cards: [note("Standing desk upgrade", "Compare the two frames from the forum thread. Max height matters more than motor speed.", ["Desk"]), tasks("Balcony herbs", [["Buy planters", 1], ["Soil and seeds"], ["Drip tray"]])] },
          { name: "Doing", cards: [tasks("Home lab rack", [["Patch panel", 1], ["Label cables", 1], ["Move NAS", 1], ["Set up backups"], ["UPS"]], ["Hardware"]), note("Kitchen shelf measurements", "Left wall 182cm, right alcove 64cm. Brackets need 30cm depth.")] },
          { name: "Done", cards: [tasks("Bike service", [["Chain", 1], ["Brake pads", 1]])] }
        ] },
        { id: "reading", name: "Reading", columns: [
          { name: "To read", cards: [note("Designing Data-Intensive Applications", "Second edition. Start with the chapter on stream processing.", ["Book"]), note("Local-first software essay", "Revisit the seven ideals; compare to how Morrow should sync.", ["Article"])] },
          { name: "Reading", cards: [note("A Philosophy of Software Design", "Notes on deep modules so far. Chapter 9 next.", ["Book"])] },
          { name: "Finished", cards: [] }
        ] }
      ],
      todos: { groups: [
        { name: "Today", items: [["Renew domain for the blog", 0, "Today", 1], ["Reply to Sam about Saturday", 1], ["Pick up dry cleaning", 0]] },
        { name: "This week", items: [["Book dentist", 0, "Thu"], ["Move savings to the new account", 0, "Fri"], ["Back up photos", 0]] },
        { name: "Later", items: [["Plan October trip", 0], ["Sell the old monitor", 0]] }
      ] }
    },
    work: {
      sections: [
        { id: "morrow", name: "Morrow", columns: [
          { name: "Ideas", cards: [note("Quick capture from the menu bar", "A global shortcut that drops a note into the right section without opening the app.", ["Feature"]), note("Card templates", "Weekly review, bug report and meeting note as starting points.")] },
          { name: "Building", cards: [tasks("Design system foundation", [["Tokens", 1], ["Layout primitives", 1], ["App shells", 1], ["Pick a stack"], ["Components"]], ["Design"]), note("Block editor research", "Compare Tiptap, Lexical and BlockNote for a Notion-style editor in TanStack Start.", ["Research"], [{ t: "p", x: "Need a Notion-style block editor that works with TanStack Start and stores JSON." }, { t: "h3", x: "Candidates" }, { t: "ul", x: ["Tiptap: ProseMirror based, mature, lots of extensions", "Lexical: fast, framework-agnostic, younger plugin ecosystem", "BlockNote: Notion-style blocks out of the box, built on Tiptap"] }, { t: "callout", x: "Leaning BlockNote for the first version, since drag handles and slash menu come built in." }, { t: "code", x: "pnpm add @blocknote/core @blocknote/react" }])] },
          { name: "Review", cards: [] },
          { name: "Shipped", cards: [note("Project kickoff", "Agent docs, issue tracker and triage labels set up.")] }
        ] },
        { id: "client", name: "Client: Fernhill", columns: [
          { name: "Backlog", cards: [tasks("Invoice export", [["CSV"], ["PDF"]], ["Billing"]), note("Call notes, Oct 30", "They want weekly reports by email. Ask about the staging budget.")] },
          { name: "In progress", cards: [tasks("Auth migration", [["Audit sessions", 1], ["Swap provider", 1], ["Remove old tables"]], ["Backend"])] },
          { name: "Shipped", cards: [tasks("Dashboard v2", [["Charts", 1], ["Filters", 1], ["Empty states", 1]])] }
        ] },
        { id: "learning", name: "Learning", columns: [
          { name: "Queue", cards: [note("TanStack Router loaders", "Read the data loading guide before starting Morrow routes.", ["TanStack"])] },
          { name: "Now", cards: [note("TanStack Query v5 patterns", "Optimistic updates for moving cards between columns.", ["TanStack"])] },
          { name: "Done", cards: [] }
        ] }
      ]
    }
  };

  var state = { space: "personal", view: "home", selected: null };
  try { var s = JSON.parse(sessionStorage.getItem("morrow-proto-view") || "null"); if (s && data[s.space]) { state.space = s.space; state.view = s.view; } } catch (e) {}
  function save() { try { sessionStorage.setItem("morrow-proto-view", JSON.stringify({ space: state.space, view: state.view })); } catch (e) {} }

  // ---- Theme ----
  var modes = ["system", "light", "dark"], mode = 0;
  try { var t = localStorage.getItem("morrow-theme"); if (t) mode = Math.max(0, modes.indexOf(t)); } catch (e) {}
  function applyTheme() { if (mode) root.setAttribute("data-theme", modes[mode]); else root.removeAttribute("data-theme"); $("#theme-toggle span").textContent = "Theme: " + modes[mode]; try { localStorage.setItem("morrow-theme", modes[mode]); } catch (e) {} }
  $("#theme-toggle").addEventListener("click", function () { mode = (mode + 1) % 3; applyTheme(); });
  applyTheme();

  // ---- Sidebar ----
  var shell = $("#shell");
  function closeNav() { shell.removeAttribute("data-nav-open"); }
  $("#nav-toggle").addEventListener("click", function () { shell.setAttribute("data-nav-open", ""); });
  $("#scrim").addEventListener("click", closeNav);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeNav(); if (state.selected) { state.selected = null; render(); } } });

  $("#space-switch").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || b.dataset.space === state.space) return;
    state.space = b.dataset.space; state.view = data[state.space].sections[0].id; state.selected = null; render();
  });

  function countCards(sec) { return sec.columns.reduce(function (n, c) { return n + c.cards.length; }, 0); }
  function renderNav() {
    var sp = data[state.space];
    var sw = $("#space-switch"); sw.dataset.active = state.space;
    sw.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.space === state.space); });
    var h = '<div class="nav-label"><span>Sections</span></div>';
    sp.sections.forEach(function (s) { h += '<button class="nav-item" type="button" data-view="' + s.id + '"' + (state.view === s.id ? ' aria-current="page"' : "") + ">" + ICON.board + "<span>" + esc(s.name) + '</span><span class="count">' + countCards(s) + "</span></button>"; });
    h += '<button class="nav-item" type="button" data-add-section>' + ICON.plus + "<span>New section</span></button>";
    if (sp.todos) {
      var open = sp.todos.groups.reduce(function (n, g) { return n + g.items.filter(function (i) { return !i[1]; }).length; }, 0);
      h += '<div class="nav-label" style="margin-block-start: var(--space-4)"><span>Lists</span></div><button class="nav-item" type="button" data-view="todos"' + (state.view === "todos" ? ' aria-current="page"' : "") + ">" + ICON.todo + '<span>Todos</span><span class="count">' + open + "</span></button>";
    }
    $("#nav").innerHTML = h;
  }
  $("#nav").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.hasAttribute("data-add-section")) {
      var id = "s" + (++uid); data[state.space].sections.push({ id: id, name: "Untitled section", columns: [{ name: "To do", cards: [] }, { name: "Doing", cards: [] }, { name: "Done", cards: [] }] });
      state.view = id;
    } else state.view = b.dataset.view;
    state.selected = null; closeNav(); render();
  });

  // ---- Board ----
  function findSection() { return data[state.space].sections.filter(function (s) { return s.id === state.view; })[0]; }
  function cardHTML(c) {
    var h = '<button type="button" class="card" draggable="true" data-card="' + c.id + '"' + (state.selected === c.id ? ' aria-selected="true"' : "") + ">";
    h += '<span class="card__kind">' + ICON[c.kind] + (c.kind === "note" ? "Note" : "Task list") + "</span>";
    h += '<span class="card__title">' + esc(c.title || "Untitled") + "</span>";
    if (c.kind === "note" && c.excerpt) h += '<span class="card__excerpt">' + esc(c.excerpt) + "</span>";
    if (c.kind === "tasks") { var d = c.items.filter(function (i) { return i.done; }).length; h += '<span class="card__meta"><span class="progress"><i style="inline-size:' + (c.items.length ? d / c.items.length * 100 : 0) + '%"></i></span>' + d + " of " + c.items.length + "</span>"; }
    if (c.tags.length) h += '<span class="cluster" style="--gap: var(--space-1)">' + c.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</span>";
    return h + "</button>";
  }
  function renderBoard(sec) {
    var h = '<div class="with-inspector"' + (state.selected ? " data-open" : "") + '><div class="board" id="board" style="padding-block-start: var(--space-1)">';
    sec.columns.forEach(function (col, ci) {
      h += '<section class="board__column" aria-label="' + esc(col.name) + '"><div class="board__column-header"><span class="title">' + esc(col.name) + '</span><span class="count">' + col.cards.length + '</span><button class="btn btn--ghost btn--icon" type="button" data-add-card="' + ci + '" aria-label="Add card to ' + esc(col.name) + '">' + ICON.plus + "</button></div>";
      h += '<div class="board__cards" data-col="' + ci + '">' + col.cards.map(cardHTML).join("") + "</div></section>";
    });
    h += '<button type="button" class="board__column board__column--new" id="add-column">' + '<span class="cluster" style="--gap: var(--space-2)">' + ICON.plus + "Add column</span></button></div>";
    h += '<aside class="with-inspector__panel" id="inspector" aria-label="Card detail">' + (state.selected ? inspectorHTML(sec) : "") + "</aside></div>";
    return h;
  }
  function getCard(sec, id) { for (var i = 0; i < sec.columns.length; i++) for (var j = 0; j < sec.columns[i].cards.length; j++) if (sec.columns[i].cards[j].id === id) return { col: i, idx: j, card: sec.columns[i].cards[j] }; return null; }
  function inspectorHTML(sec) {
    var f = getCard(sec, state.selected); if (!f) return ""; var c = f.card;
    var h = '<div class="inspector-bar">' + ICON[c.kind] + '<span class="grow">' + esc(sec.name) + " / " + esc(sec.columns[f.col].name) + '</span><button class="btn btn--ghost btn--icon" type="button" id="close-inspector" aria-label="Close">' + ICON.close + "</button></div>";
    h += '<div class="editor"><h2 class="editor__title placeholder" contenteditable="true" data-placeholder="Untitled" id="card-title">' + esc(c.title) + "</h2>";
    var handle = '<span class="editor__handle"><button type="button" tabindex="-1" aria-label="Add block">' + ICON.plus + '</button><button type="button" tabindex="-1" aria-label="Drag block">' + ICON.grip + "</button></span>";
    if (c.kind === "note") {
      c.blocks.forEach(function (b) {
        var inner;
        if (b.t === "ul") inner = "<ul>" + b.x.map(function (li) { return "<li>" + esc(li) + "</li>"; }).join("") + "</ul>";
        else if (b.t === "callout") inner = '<div class="callout">' + esc(b.x) + "</div>";
        else if (b.t === "code") inner = "<pre><code>" + esc(b.x) + "</code></pre>";
        else if (b.t === "h3") inner = "<h3>" + esc(b.x) + "</h3>";
        else inner = "<p>" + esc(b.x) + "</p>";
        h += '<div class="editor__block" contenteditable="true">' + handle.replace('class="editor__handle"', 'class="editor__handle" contenteditable="false"') + inner + "</div>";
      });
      h += '<div class="editor__block">' + handle + '<p class="placeholder" contenteditable="true" data-placeholder="Type / for blocks"></p></div>';
    } else {
      h += '<div class="editor__block">' + c.items.map(function (it, i) { return '<label class="check"><input type="checkbox" data-item="' + i + '"' + (it.done ? " checked" : "") + "><span>" + esc(it.t) + "</span></label>"; }).join("") + '<form class="add-row" id="add-item">' + ICON.plus + '<input id="new-item" placeholder="Add a task" autocomplete="off"></form></div>';
    }
    return h + "</div>";
  }

  // ---- Todos ----
  function renderTodos() {
    var g = data.personal.todos.groups, h = '<div class="list-view">';
    g.forEach(function (grp, gi) {
      h += '<section class="list-view__group" aria-label="' + grp.name + '"><div class="list-view__heading"><span>' + grp.name + "</span><span>" + grp.items.filter(function (i) { return !i[1]; }).length + " open</span></div>";
      grp.items.forEach(function (it, ii) { h += '<label class="check"><input type="checkbox" data-todo="' + gi + "," + ii + '"' + (it[1] ? " checked" : "") + "><span>" + esc(it[0]) + "</span>" + (it[2] ? '<span class="due' + (it[3] ? " is-soon" : "") + '">' + it[2] + "</span>" : "") + "</label>"; });
      if (gi === 0) h += '<form class="add-row" data-add-todo="0">' + ICON.plus + '<input id="new-todo" placeholder="Add a todo for today" autocomplete="off"></form>';
      h += "</section>";
    });
    return h + "</div>";
  }

  // ---- Render ----
  function render() {
    renderNav(); save();
    var sp = data[state.space], main = $("#main"), actions = $("#header-actions");
    $("#crumb").textContent = state.space === "personal" ? "Personal" : "Work";
    if (state.view === "todos") {
      $("#title").textContent = "Todos"; actions.innerHTML = "";
      main.innerHTML = renderTodos();
    } else {
      var sec = findSection() || sp.sections[0]; state.view = sec.id;
      $("#title").textContent = sec.name;
      actions.innerHTML = '<button class="btn hide-sm" type="button" data-new="tasks">' + ICON.tasks + 'Task list</button><button class="btn btn--primary" type="button" data-new="note">' + ICON.plus + "New note</button>";
      main.innerHTML = renderBoard(sec);
    }
  }

  function addCard(kind, colIdx) {
    var sec = findSection(); if (!sec) return;
    var c = kind === "tasks" ? tasks("", []) : note("", "", [], []);
    sec.columns[colIdx || 0].cards.unshift(c); state.selected = c.id; render();
    var t = $("#card-title"); if (t) t.focus();
  }
  $("#header-actions").addEventListener("click", function (e) { var b = e.target.closest("[data-new]"); if (b) addCard(b.dataset.new, 0); });

  var main = $("#main");
  main.addEventListener("click", function (e) {
    var sec = findSection();
    var card = e.target.closest("[data-card]");
    if (card) { var id = +card.dataset.card; state.selected = state.selected === id ? null : id; render(); return; }
    if (e.target.closest("#close-inspector")) { state.selected = null; render(); return; }
    var add = e.target.closest("[data-add-card]"); if (add) { addCard("note", +add.dataset.addCard); return; }
    if (e.target.closest("#add-column") && sec) { sec.columns.push({ name: "New column", cards: [] }); render(); $("#board").scrollTo({ left: 1e5, behavior: "smooth" }); }
  });
  main.addEventListener("change", function (e) {
    var sec = findSection(), el = e.target;
    if (el.dataset.item != null && sec) { var f = getCard(sec, state.selected); f.card.items[+el.dataset.item].done = el.checked; refreshCard(f.card); }
    if (el.dataset.todo) { var p = el.dataset.todo.split(","); data.personal.todos.groups[+p[0]].items[+p[1]][1] = el.checked ? 1 : 0; renderNav(); var head = el.closest(".list-view__group").querySelector(".list-view__heading span:last-child"); var grp = data.personal.todos.groups[+p[0]]; head.textContent = grp.items.filter(function (i) { return !i[1]; }).length + " open"; }
  });
  main.addEventListener("input", function (e) {
    if (e.target.id === "card-title") { var sec = findSection(), f = getCard(sec, state.selected); f.card.title = e.target.textContent; refreshCard(f.card); }
  });
  main.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.id === "add-item") { var v = $("#new-item").value.trim(); if (!v) return; var f = getCard(findSection(), state.selected); f.card.items.push({ t: v, done: false }); render(); $("#new-item").focus(); }
    if (e.target.dataset.addTodo != null) { var v2 = $("#new-todo").value.trim(); if (!v2) return; data.personal.todos.groups[0].items.push([v2, 0]); render(); $("#new-todo").focus(); }
  });
  function refreshCard(c) { var el = main.querySelector('[data-card="' + c.id + '"]'); if (!el) return; var tmp = document.createElement("div"); tmp.innerHTML = cardHTML(c); el.replaceWith(tmp.firstChild); renderNav(); }

  // ---- Drag and drop ----
  var dragId = null;
  main.addEventListener("dragstart", function (e) { var c = e.target.closest("[data-card]"); if (!c) return; dragId = +c.dataset.card; c.classList.add("is-dragging"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", String(dragId)); } catch (x) {} });
  main.addEventListener("dragend", function () { dragId = null; main.querySelectorAll(".is-dragging, .is-over").forEach(function (n) { n.classList.remove("is-dragging", "is-over"); }); });
  main.addEventListener("dragover", function (e) { var z = e.target.closest(".board__cards"); if (!z || dragId == null) return; e.preventDefault(); main.querySelectorAll(".is-over").forEach(function (n) { if (n !== z) n.classList.remove("is-over"); }); z.classList.add("is-over"); });
  main.addEventListener("drop", function (e) {
    var z = e.target.closest(".board__cards"); if (!z || dragId == null) return; e.preventDefault();
    var sec = findSection(), f = getCard(sec, dragId), to = +z.dataset.col;
    var cards = Array.prototype.slice.call(z.querySelectorAll("[data-card]")).filter(function (n) { return +n.dataset.card !== dragId; });
    var at = cards.length; for (var i = 0; i < cards.length; i++) { var r = cards[i].getBoundingClientRect(); if (e.clientY < r.top + r.height / 2) { at = i; break; } }
    sec.columns[f.col].cards.splice(f.idx, 1); sec.columns[to].cards.splice(at, 0, f.card);
    var id = dragId; dragId = null; render();
    var moved = main.querySelector('[data-card="' + id + '"]'); if (moved) moved.classList.add("is-dropped");
  });

  if (!data[state.space].sections.some(function (s) { return s.id === state.view; }) && state.view !== "todos") state.view = data[state.space].sections[0].id;
  render();
})();
