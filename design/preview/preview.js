(function () {
  var root = document.documentElement;
  var cs = function (n) {
    return getComputedStyle(root).getPropertyValue(n).trim();
  };
  var el = function (tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  };

  // Theme toggle: system -> light -> dark
  var modes = ["system", "light", "dark"],
    mode = 0;
  try {
    var saved = localStorage.getItem("morrow-theme");
    if (saved) mode = Math.max(0, modes.indexOf(saved));
  } catch {}
  var btn = document.getElementById("theme-toggle");
  function applyTheme() {
    if (mode === 0) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", modes[mode]);
    btn.textContent = "Theme: " + modes[mode];
    try {
      localStorage.setItem("morrow-theme", modes[mode]);
    } catch {}
  }
  btn.addEventListener("click", function () {
    mode = (mode + 1) % 3;
    applyTheme();
  });
  applyTheme();

  // Ramps
  var ramps = [
    ["Gray", "gray", [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950]],
    ["Blue (accent, also info)", "blue", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]],
    ["Green", "green", [100, 300, 500, 700, 900]],
    ["Amber", "amber", [100, 300, 500, 700, 900]],
    ["Red", "red", [100, 300, 500, 700, 900]],
  ];
  var rampsEl = document.getElementById("ramps");
  ramps.forEach(function (r) {
    var wrap = el("div", { class: "stack", style: "--gap: var(--space-2)" });
    wrap.appendChild(
      el(
        "span",
        { class: "pv-ramp-label" },
        r[0] + ' <span class="pv-code">--' + r[1] + "-*</span>",
      ),
    );
    var row = el("div", { class: "pv-ramp" });
    r[2].forEach(function (s) {
      var light = s <= (r[1] === "amber" ? 500 : 400);
      row.appendChild(
        el(
          "div",
          {
            style:
              "background: var(--" +
              r[1] +
              "-" +
              s +
              "); color: " +
              (light ? "var(--gray-900)" : "var(--gray-25)"),
            title: "--" + r[1] + "-" + s,
          },
          String(s),
        ),
      );
    });
    wrap.appendChild(row);
    rampsEl.appendChild(wrap);
  });

  // Roles
  var roles = [
    ["--background", "Page background"],
    ["--card", "Cards, panels"],
    ["--popover", "Popovers, dialogs"],
    ["--muted", "Wells, code"],
    ["--foreground", "Primary text"],
    ["--muted-foreground", "Secondary text"],
    ["--text-subtle", "Placeholders, captions"],
    ["--border", "Default borders"],
    ["--input", "Inputs, emphasis"],
    ["--primary", "Primary actions (brand blue)"],
    ["--accent", "Hover, selected wash"],
    ["--ring", "Keyboard focus"],
  ];
  var rolesEl = document.getElementById("roles");
  roles.forEach(function (r) {
    rolesEl.appendChild(
      el(
        "div",
        { class: "pv-role" },
        '<span class="pv-chip" style="background: var(' +
          r[0] +
          ')"></span><span class="stack" style="--gap: 0; min-width: 0"><span style="font-size: var(--text-sm); font-weight: var(--weight-medium)">' +
          r[1] +
          '</span><span class="pv-code">' +
          r[0] +
          "</span></span>",
      ),
    );
  });

  // Type
  var sizes = [
    ["5xl", "Personal and work"],
    ["4xl", "Side projects"],
    ["3xl", "Launch checklist"],
    ["2xl", "Ideas backlog"],
    ["xl", "Three cards in Building"],
    ["lg", "A lead paragraph sets up what follows on the page."],
    ["md", "Body text for most reading, set at 16px with 1.5 leading."],
    ["sm", "Secondary UI text: labels, metadata, table cells."],
    ["xs", "Labels, dates, badges"],
  ];
  var typeEl = document.getElementById("type-rows");
  sizes.forEach(function (s) {
    var big = ["5xl", "4xl", "3xl"].indexOf(s[0]) > -1;
    typeEl.appendChild(
      el(
        "div",
        { class: "pv-type-row" },
        '<span class="pv-code">--text-' +
          s[0] +
          '</span><span style="font-size: var(--text-' +
          s[0] +
          "); line-height: " +
          (big ? "var(--leading-tight)" : "var(--leading-snug)") +
          "; " +
          (big
            ? "letter-spacing: var(--tracking-tight); font-weight: var(--weight-semibold)"
            : "") +
          '">' +
          s[1] +
          "</span>",
      ),
    );
  });

  // Spacing
  var steps = ["0-5", "1", "1-5", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32"];
  var spEl = document.getElementById("space-rows");
  steps.forEach(function (s) {
    var px = parseFloat(s.replace("-", ".")) * 4;
    spEl.appendChild(
      el(
        "div",
        { class: "pv-space" },
        '<span class="pv-code">--space-' +
          s +
          "</span><span>" +
          px +
          'px</span><div class="pv-bar" style="inline-size: var(--space-' +
          s +
          ')"></div>',
      ),
    );
  });

  // Radius
  var rEl = document.getElementById("radius-tiles");
  [
    ["4", "4px"],
    ["8", "8px control, card"],
    ["12", "12px panel"],
    ["20", "20px dialog"],
    ["full", "pill"],
  ].forEach(function (r) {
    rEl.appendChild(
      el(
        "div",
        {
          class: "pv-tile",
          style:
            "border-radius: var(--radius-" +
            r[0] +
            ")" +
            (r[0] === "full" ? "; block-size: 3rem; align-self: center" : ""),
        },
        "--radius-" + r[0] + "<br>" + r[1],
      ),
    );
  });

  // Shadow
  var shEl = document.getElementById("shadow-tiles");
  ["xs", "sm", "md", "lg", "xl"].forEach(function (s) {
    shEl.appendChild(
      el(
        "div",
        { class: "pv-tile pv-tile--shadow", style: "box-shadow: var(--shadow-" + s + ")" },
        "--shadow-" + s,
      ),
    );
  });

  // Motion
  var mEl = document.getElementById("motion-rows");
  var motions = [
    ["press", "standard", "Button press"],
    ["in", "standard", "Hover in, focus"],
    ["out", "standard", "Hover out"],
    ["slide", "travel", "Card settling after a drop"],
    ["sheet", "standard", "Sheets, drawer, inspector"],
  ];
  motions.forEach(function (m) {
    mEl.appendChild(
      el(
        "div",
        {
          class: "pv-motion stack",
          style:
            "--gap: var(--space-1); --d: var(--duration-" +
            m[0] +
            "); --e: var(--ease-" +
            m[1] +
            ")",
        },
        '<div class="spread" style="--gap: var(--space-2)"><span style="font-size: var(--text-sm); font-weight: var(--weight-medium)">' +
          m[2] +
          '</span><span class="pv-code">--duration-' +
          m[0] +
          " (" +
          cs("--duration-" + m[0]) +
          ") · --ease-" +
          m[1] +
          '</span></div><div class="pv-track"><div class="pv-puck"></div></div>',
      ),
    );
  });
  document.getElementById("play-motion").addEventListener("click", function () {
    mEl.querySelectorAll(".pv-motion").forEach(function (m) {
      if (m.hasAttribute("data-run")) m.removeAttribute("data-run");
      else m.setAttribute("data-run", "");
    });
  });

  // Breakpoints
  var bps = [
    ["base", 0, "Phones. Sidebar is a drawer; board columns snap one at a time."],
    ["sm", 40, "Large phones, landscape."],
    ["md", 48, "Tablets. .grid-12 spans apply."],
    ["lg", 64, "Laptops. Sidebar docks beside the board."],
    ["xl", 80, "Desktops. Card inspector docks beside the board."],
    ["2xl", 96, "Wide screens. Use --container-2xl for dense data."],
  ];
  var bpEl = document.getElementById("bp-rows");
  function drawBps() {
    var em = parseFloat(getComputedStyle(root).fontSize) || 16,
      w = window.innerWidth,
      cur = "base";
    bps.forEach(function (b) {
      if (w >= b[1] * em) cur = b[0];
    });
    bpEl.innerHTML = "";
    bps.forEach(function (b) {
      bpEl.appendChild(
        el(
          "div",
          { class: "pv-bp" + (b[0] === cur ? " pv-bp-now" : "") },
          '<span class="pv-code"' +
            (b[0] === cur ? ' style="color:inherit"' : "") +
            ">" +
            b[0] +
            "</span><span>" +
            (b[1] ? b[1] + "rem / " + b[1] * 16 + "px" : "0") +
            "</span><span>" +
            b[2] +
            (b[0] === cur ? " (you are here)" : "") +
            "</span>",
        ),
      );
    });
  }
  window.addEventListener("resize", drawBps);
  drawBps();

  // Containers
  var cEl = document.getElementById("container-rows");
  [
    ["xs", 28, "Sign-in forms, dialogs"],
    ["sm", 40, "Single-column reading"],
    ["md", 48, "Articles with media"],
    ["lg", 64, "Default app content"],
    ["xl", 80, "Marketing, dashboards"],
    ["2xl", 96, "Dense tables"],
  ].forEach(function (c) {
    cEl.appendChild(
      el(
        "div",
        { class: "stack", style: "--gap: var(--space-1)" },
        '<div class="spread" style="--gap: var(--space-2)"><span style="font-size: var(--text-sm)"><code>.container--' +
          c[0] +
          "</code> " +
          c[2] +
          '</span><span class="pv-code">' +
          c[1] * 16 +
          'px</span></div><div class="pv-bar" style="inline-size: min(100%, ' +
          (c[1] / 96) * 100 +
          "%); opacity: " +
          (0.35 + (c[1] / 96) * 0.6) +
          '"></div>',
      ),
    );
  });
})();
