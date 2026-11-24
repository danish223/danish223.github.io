// Shared helpers for every page. Each page calls Site.load(render).
const Site = (() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const has = (a) => Array.isArray(a) && a.length > 0;
  const ext = 'target="_blank" rel="noopener"';
  const icon = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    gh: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    in: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.79-1.7-2.79-1.7 0-1.96 1.33-1.96 2.7V21h-4V9.5Z"/></svg>',
    cv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M19 12H5m6-6-6 6 6 6"/></svg>',
  };
  const tags = (t) => has(t) ? `<div class="tags">${t.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</div>` : "";
  const pts = (p) => has(p) ? `<ul class="pts">${p.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
  const backdrop = () => '<div class="backdrop"><div class="grid-bg"></div><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div>';
  const typeClass = (t) => /company/i.test(t || "") ? "company" : /personal/i.test(t || "") ? "personal" : "";

  function buttons(c) {
    return [
      c.email && `<a class="btn primary" href="mailto:${esc(c.email)}">${icon.mail}Get in touch</a>`,
      c.github && `<a class="btn" href="${esc(c.github)}" ${ext}>${icon.gh}GitHub</a>`,
      c.linkedin && `<a class="btn" href="${esc(c.linkedin)}" ${ext}>${icon.in}LinkedIn</a>`,
      c.cv && `<a class="btn" href="${esc(c.cv)}" ${ext}>${icon.cv}Download CV</a>`,
    ].filter(Boolean).join("");
  }

  function nav(c, items) {
    const initials = (c.name || "").split(" ").map((w) => w[0]).join("");
    return `<nav id="nav"><div class="wrap">
      <a href="index.html" class="logo">${esc(initials)}<span>.</span></a>
      <div class="nav-links">${items.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}</div>
      ${c.email ? `<a class="nav-cta" href="mailto:${esc(c.email)}">Say hello</a>` : ""}
    </div></nav>`;
  }

  const footer = (c) => `<footer><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(c.name)}</span><span class="mono">Built with plain HTML, CSS & JS</span></div></footer>`;

  function countUp(el) {
    const end = Number(el.dataset.count), suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1600;
    (function f(now) {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e).toLocaleString() + suf;
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  const stats = (list) => has(list) ? `<div class="stats">${list.map((s) => `
    <div class="stat"><b class="grad-text" data-count="${Number(s.value) || 0}" data-suffix="${esc(s.suffix)}">0</b><span>${esc(s.label)}</span></div>`).join("")}</div>` : "";

  function effects() {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      en.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(en.target);
    }), { threshold: .12 });
    document.querySelectorAll(".reveal, .cs-shot").forEach((el) => io.observe(el));

    const navEl = document.getElementById("nav"), bar = document.getElementById("progress");
    const onScroll = () => {
      navEl?.classList.toggle("scrolled", scrollY > 20);
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    document.querySelectorAll(".card").forEach((card) => card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    }));

    // Fade out before moving to another page of this site.
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || a.target === "_blank") return;
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        document.body.classList.add("leaving");
        setTimeout(() => { location.href = href; }, 260);
      });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("leaving"); });
  }

  function load(render) {
    fetch("content.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((c) => { render(c); effects(); })
      .catch(() => { document.getElementById("app").innerHTML = '<p class="error">Could not load content.json. Check it for a missing comma or quote.</p>'; });
  }

  return { esc, has, ext, icon, tags, pts, backdrop, typeClass, buttons, nav, footer, stats, load };
})();
