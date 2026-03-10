/**
 * ui.js — Digital Armory
 * Pure rendering functions. No state management here — only DOM production.
 * Called by app.js with filtered/sorted data.
 */

'use strict';

const UI = (() => {

    /* ── Category labels ──────────────────────────────────────── */
    const CAT_LABEL = { land:'LAND', air:'AIR', sea:'NAVAL' };

    const STATUS_COLOR = { active:'active', retired:'retired', limited:'limited' };

    /* ── Stat bar color map ───────────────────────────────────── */
    const STAT_BARS = [
        { key:'armor',     label:'Armor',     cls:'armor' },
        { key:'speed',     label:'Speed',     cls:'speed' },
        { key:'range',     label:'Range',     cls:'range' },
        { key:'firepower', label:'Fire',      cls:'firepower' },
    ];

    const MODAL_STAT_BARS = [
        { key:'armor',     label:'Armor',     cls:'armor' },
        { key:'speed',     label:'Speed',     cls:'speed' },
        { key:'range',     label:'Range',     cls:'range' },
        { key:'firepower', label:'Firepower', cls:'firepower' },
    ];

    /* ══════════════════════════════════════════════════════════
       CARD BUILDER
    ══════════════════════════════════════════════════════════ */
    function buildCard(item, compareMode, selected) {
        const card = document.createElement('div');
        card.className = 'eq-card card-enter';
        card.dataset.id  = item.id;
        card.dataset.cat = item.category;

        const rawS = item.rawStats || {};

        // Stat bars HTML
        const statBars = STAT_BARS.map(s => {
            const val = item.stats[s.key] || 0;
            return `
        <div class="stat-row">
          <span class="stat-label">${s.label}</span>
          <div class="stat-bar-wrap">
            <div class="stat-bar ${s.cls}" style="width:0%" data-target="${val}%"></div>
          </div>
          <span class="stat-val">${val}</span>
        </div>`;
        }).join('');

        card.innerHTML = `
      <!-- Visual / silhouette -->
      <div class="card-visual">
        <span class="card-silhouette">${item.emoji}</span>
        <span class="card-cat-badge">${CAT_LABEL[item.category] || item.category}</span>
        ${compareMode ? `
          <button class="card-compare-btn" data-id="${item.id}" title="Add to compare">
            ${selected ? '✓' : '+'}
          </button>` : ''}
      </div>

      <!-- Body -->
      <div class="card-body">
        <div class="card-header-row">
          <span class="card-name">${item.name}</span>
          <span class="card-designation">${item.designation}</span>
        </div>

        <div class="card-meta">
          <span class="meta-item"><span class="meta-icon">🌍</span>${item.origin}</span>
          <span class="meta-item"><span class="meta-icon">📅</span>${item.year}</span>
          <span class="meta-item"><span class="meta-icon">⚙</span>${item.era}</span>
        </div>

        <div class="card-stats">${statBars}</div>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <div class="card-status">
          <span class="status-dot ${STATUS_COLOR[item.status] || 'active'}"></span>
          <span>${item.status.toUpperCase()}</span>
        </div>
        <div class="card-origin">
          ${item.tags.slice(0,2).map(t => `<span style="font-size:.6rem;padding:1px 5px;border-radius:3px;background:var(--bg-elevated);color:var(--txt-muted)">${t}</span>`).join('')}
        </div>
      </div>`;

        if (selected) card.classList.add('selected');

        // Animate stat bars after render (requestAnimationFrame)
        requestAnimationFrame(() => {
            card.querySelectorAll('.stat-bar[data-target]').forEach(bar => {
                bar.style.width = bar.dataset.target;
            });
        });

        return card;
    }

    /* ══════════════════════════════════════════════════════════
       GRID RENDERER
    ══════════════════════════════════════════════════════════ */
    function renderGrid(items, compareMode, compareIds, gridEl, emptyEl, countEl) {
        gridEl.innerHTML = '';

        if (items.length === 0) {
            emptyEl.classList.remove('hidden');
            if (countEl) countEl.textContent = '0 items';
            return;
        }

        emptyEl.classList.add('hidden');
        if (countEl) countEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

        const frag = document.createDocumentFragment();
        items.forEach((item, idx) => {
            const card = buildCard(item, compareMode, compareIds.has(item.id));
            // Stagger animation
            card.style.animationDelay = `${Math.min(idx * 30, 300)}ms`;
            frag.appendChild(card);
        });
        gridEl.appendChild(frag);
    }

    /* ══════════════════════════════════════════════════════════
       DETAIL MODAL
    ══════════════════════════════════════════════════════════ */
    function buildDetailModal(item) {
        const rawS = item.rawStats || {};
        const catLabel = CAT_LABEL[item.category] || item.category;

        const specItems = Object.entries(item.specs || {}).map(([k, v]) => `
      <div class="spec-item">
        <span class="spec-label">${k.toUpperCase()}</span>
        <span class="spec-value">${v}</span>
      </div>`).join('');

        const statRows = MODAL_STAT_BARS.map(s => {
            const val    = item.stats[s.key] || 0;
            const rawVal = rawS[s.key] || `${val}`;
            return `
        <div class="modal-stat-row">
          <span class="modal-stat-label">${s.label}</span>
          <div class="modal-bar-wrap">
            <div class="modal-bar stat-bar ${s.cls}" style="width:0%" data-target="${val}%"></div>
          </div>
          <span class="modal-stat-num">${rawVal}</span>
        </div>`;
        }).join('');

        const tagsHtml = (item.tags || []).map(t =>
            `<span style="display:inline-block;font-size:.65rem;padding:2px 7px;border-radius:99px;
       background:var(--bg-elevated);border:1px solid var(--border);color:var(--txt-muted);margin:2px">${t}</span>`
        ).join('');

        return `
      <!-- Hero -->
      <div class="modal-hero" data-cat="${item.category}">
        <div class="modal-hero-cat-bar"></div>
        <span class="modal-hero-silhouette">${item.emoji}</span>
      </div>

      <div class="modal-body">
        <div class="modal-title-row">
          <h2 class="modal-title">${item.name}</h2>
          <span class="modal-desg">${item.designation}</span>
        </div>

        <p class="modal-description">${item.description}</p>

        <!-- Specs grid -->
        <div class="modal-stats-title">TECHNICAL SPECIFICATIONS</div>
        <div class="modal-specs-grid" style="margin-bottom:16px">${specItems}</div>

        <!-- Stat bars -->
        <div class="modal-stats-section">
          <div class="modal-stats-title">COMBAT RATINGS</div>
          ${statRows}
        </div>

        <!-- Meta -->
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px;padding-top:14px;border-top:1px solid var(--border)">
          <div class="spec-item" style="flex:1;min-width:120px">
            <span class="spec-label">ORIGIN</span>
            <span class="spec-value">${item.origin}</span>
          </div>
          <div class="spec-item" style="flex:1;min-width:120px">
            <span class="spec-label">SERVICE YEAR</span>
            <span class="spec-value">${item.year}</span>
          </div>
          <div class="spec-item" style="flex:1;min-width:120px">
            <span class="spec-label">ERA</span>
            <span class="spec-value">${item.era}</span>
          </div>
          <div class="spec-item" style="flex:1;min-width:120px">
            <span class="spec-label">STATUS</span>
            <span class="spec-value" style="text-transform:capitalize">${item.status}</span>
          </div>
        </div>

        <!-- Tags -->
        <div style="margin-bottom:8px">
          <div class="modal-stats-title" style="margin-bottom:8px">TAGS</div>
          ${tagsHtml}
        </div>
      </div>`;
    }

    /* ══════════════════════════════════════════════════════════
       COMPARE RESULT TABLE
    ══════════════════════════════════════════════════════════ */
    function buildCompareTable(a, b) {
        const ALL_STATS = [
            { key:'armor',     label:'ARMOR' },
            { key:'speed',     label:'SPEED' },
            { key:'range',     label:'RANGE' },
            { key:'firepower', label:'FIREPOWER' },
        ];

        // Determine overall winner by sum of stats
        const sumA = ALL_STATS.reduce((s,st) => s + (a.stats[st.key]||0), 0);
        const sumB = ALL_STATS.reduce((s,st) => s + (b.stats[st.key]||0), 0);
        const winner = sumA > sumB ? a : (sumB > sumA ? b : null);

        const rows = ALL_STATS.map(st => {
            const vA    = a.stats[st.key] || 0;
            const vB    = b.stats[st.key] || 0;
            const rawA  = (a.rawStats || {})[st.key] || `${vA}`;
            const rawB  = (b.rawStats || {})[st.key] || `${vB}`;
            const aWins = vA > vB;
            const bWins = vB > vA;

            return `
        <div class="cmp-row">
          <span class="cmp-stat-label">${st.label}</span>
          <div class="cmp-bar-cell">
            <div class="cmp-bar-wrap"><div class="cmp-bar bar-a" style="width:0%" data-target="${vA}%"></div></div>
            <span class="cmp-bar-val ${aWins ? 'cmp-winner' : ''}">${rawA}</span>
          </div>
          <div class="cmp-center-val">${aWins ? '◄' : (bWins ? '►' : '=')}  </div>
          <div class="cmp-bar-cell">
            <div class="cmp-bar-wrap"><div class="cmp-bar bar-b" style="width:0%" data-target="${vB}%"></div></div>
            <span class="cmp-bar-val ${bWins ? 'cmp-winner' : ''}">${rawB}</span>
          </div>
        </div>`;
        }).join('');

        // Spec comparison rows
        const specKeys = [...new Set([...Object.keys(a.specs||{}), ...Object.keys(b.specs||{})])];
        const specRows = specKeys.map(k => `
      <div class="cmp-row" style="grid-template-columns:160px 1fr 1fr">
        <span class="cmp-stat-label">${k.toUpperCase()}</span>
        <div class="cmp-bar-cell"><span class="cmp-bar-val">${(a.specs||{})[k] || '—'}</span></div>
        <div class="cmp-bar-cell"><span class="cmp-bar-val">${(b.specs||{})[k] || '—'}</span></div>
      </div>`).join('');

        const winnerHtml = winner
            ? `<div class="compare-winner-banner">★ OVERALL ADVANTAGE: ${winner.name} (${winner.designation}) — Total Score ${winner === a ? sumA : sumB}/400</div>`
            : `<div class="compare-winner-banner">★ EQUAL OVERALL MATCH — Both score ${sumA}/400</div>`;

        return `
      <!-- Header -->
      <div class="compare-result-header">
        <span class="compare-result-title">⇌ SIDE-BY-SIDE COMPARISON</span>
      </div>

      <!-- Item headers -->
      <div class="compare-items-header">
        <div style="font-size:.6rem;font-family:var(--font-mono);color:var(--txt-muted);letter-spacing:1px">SPECIFICATION</div>
        <div class="cmp-item-cell">
          <div class="cmp-item-sil">${a.emoji}</div>
          <div class="cmp-item-name">${a.name}</div>
          <div class="cmp-item-desg">${a.designation} · ${a.origin}</div>
        </div>
        <div class="cmp-middle-col">VS</div>
        <div class="cmp-item-cell">
          <div class="cmp-item-sil">${b.emoji}</div>
          <div class="cmp-item-name">${b.name}</div>
          <div class="cmp-item-desg">${b.designation} · ${b.origin}</div>
        </div>
      </div>

      <!-- Stat rows -->
      <div class="compare-table-body">
        <div style="font-size:.58rem;font-family:var(--font-mono);color:var(--clr-gold);
             letter-spacing:2px;padding:10px 0 6px">COMBAT RATINGS (0-100)</div>
        ${rows}

        <div style="font-size:.58rem;font-family:var(--font-mono);color:var(--clr-gold);
             letter-spacing:2px;padding:14px 0 6px;border-top:1px solid var(--border)">SPECIFICATIONS</div>
        <div style="display:grid;grid-template-columns:160px 1fr 1fr;gap:0">
          ${specRows}
        </div>
      </div>

      ${winnerHtml}`;
    }

    /* ══════════════════════════════════════════════════════════
       COMPARE PANEL SLOTS
    ══════════════════════════════════════════════════════════ */
    function updateCompareSlot(slotEl, item) {
        if (!item) {
            slotEl.className = 'compare-slot empty';
            slotEl.innerHTML = `<span>Select Item ${parseInt(slotEl.id.replace('slot-',''))+1}</span>`;
            return;
        }
        slotEl.className = 'compare-slot';
        slotEl.innerHTML = `
      <span class="slot-silhouette">${item.emoji}</span>
      <div style="flex:1;min-width:0">
        <div class="slot-name">${item.name}</div>
        <div class="slot-desg">${item.designation} · ${item.origin}</div>
      </div>
      <button class="slot-remove" data-id="${item.id}" title="Remove">✕</button>`;
    }

    /* ══════════════════════════════════════════════════════════
       SIDEBAR FILTER BUILDERS
    ══════════════════════════════════════════════════════════ */
    function buildEraFilters(eras, active, containerEl) {
        containerEl.innerHTML = eras.map(era => `
      <button class="filter-chip-btn ${active === era ? 'active' : ''}"
              data-era="${era}">
        <span>${era}</span>
        <span class="fchip-count">${window.ARMORY_HELPERS.countBy('era', era)}</span>
      </button>`).join('');
    }

    function buildOriginFilters(origins, active, containerEl) {
        containerEl.innerHTML = origins.map(o => `
      <button class="filter-chip-btn ${active === o ? 'active' : ''}"
              data-origin="${o}">
        <span>${o}</span>
        <span class="fchip-count">${window.ARMORY_HELPERS.countBy('origin', o)}</span>
      </button>`).join('');
    }

    /* ══════════════════════════════════════════════════════════
       ACTIVE FILTER CHIPS (filter bar)
    ══════════════════════════════════════════════════════════ */
    function renderFilterBar(filters, barEl, chipsEl) {
        const chips = [];
        if (filters.era)    chips.push({ key:'era',    val:filters.era });
        if (filters.origin) chips.push({ key:'origin', val:filters.origin });
        if (filters.search) chips.push({ key:'search', val:`"${filters.search}"` });

        if (chips.length === 0) {
            barEl.classList.add('hidden');
            return;
        }
        barEl.classList.remove('hidden');
        chipsEl.innerHTML = chips.map(c => `
      <span class="active-chip">
        ${c.val}
        <button data-remove="${c.key}" title="Remove filter">✕</button>
      </span>`).join('');
    }

    /* ── Animate modal stat bars after insert ─────────────────── */
    function animateModalBars(container) {
        requestAnimationFrame(() => {
            container.querySelectorAll('[data-target]').forEach(el => {
                el.style.width = el.dataset.target;
            });
        });
    }

    /* ── Public ───────────────────────────────────────────────── */
    return {
        renderGrid,
        buildCard,
        buildDetailModal,
        buildCompareTable,
        updateCompareSlot,
        buildEraFilters,
        buildOriginFilters,
        renderFilterBar,
        animateModalBars,
    };

})();

window.UI = UI;