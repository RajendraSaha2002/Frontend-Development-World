/**
 * app.js — Digital Armory
 * Central application controller.
 * Manages state, event wiring, search/filter pipeline, compare mode.
 * Depends on: data.js  (ARMORY_DATA, ARMORY_HELPERS)
 *             ui.js    (UI rendering functions)
 */

'use strict';

const App = (() => {

    /* ══════════════════════════════════════════════════════════
       1. APPLICATION STATE
    ══════════════════════════════════════════════════════════ */
    const state = {
        // Filters
        category    : 'all',
        search      : '',
        era         : null,
        origin      : null,
        sort        : 'name',      // 'name' | 'speed' | 'range' | 'year'

        // Compare mode
        compareMode : false,
        compareIds  : new Set(),   // max 2 IDs

        // Theme
        theme       : 'dark',
    };

    // DOM element cache — populated in init()
    const $ = {};

    /* ══════════════════════════════════════════════════════════
       2. DATA PIPELINE
       category → era → origin → search → sort → render
    ══════════════════════════════════════════════════════════ */
    function _filter() {
        let items = window.ARMORY_DATA;

        // Category
        if (state.category !== 'all')
            items = items.filter(d => d.category === state.category);

        // Era
        if (state.era)
            items = items.filter(d => d.era === state.era);

        // Origin
        if (state.origin)
            items = items.filter(d => d.origin === state.origin);

        // Search — multi-field fuzzy
        if (state.search.trim()) {
            const q = state.search.toLowerCase().trim();
            items = items.filter(d =>
                d.name.toLowerCase().includes(q)        ||
                d.designation.toLowerCase().includes(q) ||
                d.origin.toLowerCase().includes(q)      ||
                d.era.toLowerCase().includes(q)         ||
                d.description.toLowerCase().includes(q) ||
                (d.tags || []).some(t => t.toLowerCase().includes(q))
            );
        }

        // Sort
        items = [...items].sort((a, b) => {
            switch (state.sort) {
                case 'speed'  : return (b.stats.speed  || 0) - (a.stats.speed  || 0);
                case 'range'  : return (b.stats.range  || 0) - (a.stats.range  || 0);
                case 'year'   : return a.year - b.year;
                default       : return a.name.localeCompare(b.name);
            }
        });

        return items;
    }

    function _render() {
        const items = _filter();
        UI.renderGrid(
            items,
            state.compareMode,
            state.compareIds,
            $.grid, $.empty, $.resultCount,
        );
        UI.renderFilterBar(
            { era: state.era, origin: state.origin, search: state.search },
            $.filterBar, $.filterChips,
        );
        _updateCounts();

        // Re-attach card click listeners
        _bindCardEvents();
    }

    /* ══════════════════════════════════════════════════════════
       3. SIDEBAR COUNTS + FILTERS
    ══════════════════════════════════════════════════════════ */
    function _updateCounts() {
        const all  = window.ARMORY_DATA;
        const land = all.filter(d => d.category === 'land').length;
        const air  = all.filter(d => d.category === 'air').length;
        const sea  = all.filter(d => d.category === 'sea').length;

        if ($.cntAll)  $.cntAll.textContent  = all.length;
        if ($.cntLand) $.cntLand.textContent = land;
        if ($.cntAir)  $.cntAir.textContent  = air;
        if ($.cntSea)  $.cntSea.textContent  = sea;

        if ($.sfTotal)   $.sfTotal.textContent   = _filter().length;
        if ($.sfCompare) $.sfCompare.textContent = state.compareIds.size;
    }

    function _buildSidebarFilters() {
        const H = window.ARMORY_HELPERS;
        UI.buildEraFilters(H.unique('era'), state.era, $.eraFilters);
        UI.buildOriginFilters(H.unique('origin'), state.origin, $.originFilters);
    }

    /* ══════════════════════════════════════════════════════════
       4. COMPARE MODE
    ══════════════════════════════════════════════════════════ */
    function _toggleCompareMode() {
        state.compareMode = !state.compareMode;
        $.btnCompare.classList.toggle('active', state.compareMode);
        $.comparePanel.classList.toggle('hidden', !state.compareMode);

        if (!state.compareMode) {
            state.compareIds.clear();
            _updateComparePanel();
        }
        _render();
    }

    function _toggleCompareItem(id) {
        if (state.compareIds.has(id)) {
            state.compareIds.delete(id);
        } else {
            if (state.compareIds.size >= 2) {
                // Replace oldest (first)
                const first = [...state.compareIds][0];
                state.compareIds.delete(first);
            }
            state.compareIds.add(id);
        }
        _updateComparePanel();
        _updateCompareBadge();
        _render();
    }

    function _updateComparePanel() {
        const ids    = [...state.compareIds];
        const items  = ids.map(id => window.ARMORY_DATA.find(d => d.id === id)).filter(Boolean);

        UI.updateCompareSlot($.slot0, items[0] || null);
        UI.updateCompareSlot($.slot1, items[1] || null);

        // Enable run button only if 2 selected
        $.btnRunCompare.disabled = items.length < 2;

        // Hint text
        if ($.compareHint) {
            $.compareHint.textContent = items.length === 0
                ? 'Select up to 2 items from the grid'
                : items.length === 1
                    ? 'Select 1 more item to compare'
                    : 'Ready — click Run Comparison';
        }
    }

    function _updateCompareBadge() {
        $.compareBadge.textContent = state.compareIds.size;
        $.compareBadge.classList.toggle('hidden', state.compareIds.size === 0);
    }

    function _runComparison() {
        const ids   = [...state.compareIds];
        if (ids.length < 2) return;
        const a = window.ARMORY_DATA.find(d => d.id === ids[0]);
        const b = window.ARMORY_DATA.find(d => d.id === ids[1]);
        if (!a || !b) return;

        $.compareModalContent.innerHTML = UI.buildCompareTable(a, b);
        $.compareOverlay.classList.remove('hidden');
        UI.animateModalBars($.compareModalContent);
        document.body.style.overflow = 'hidden';
    }

    /* ══════════════════════════════════════════════════════════
       5. DETAIL MODAL
    ══════════════════════════════════════════════════════════ */
    function _openDetail(id) {
        const item = window.ARMORY_DATA.find(d => d.id === id);
        if (!item) return;
        $.modalContent.innerHTML = UI.buildDetailModal(item);
        $.modalOverlay.classList.remove('hidden');
        UI.animateModalBars($.modalContent);
        document.body.style.overflow = 'hidden';
    }

    function _closeModal() {
        $.modalOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function _closeCompareModal() {
        $.compareOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    /* ══════════════════════════════════════════════════════════
       6. SIDEBAR MOBILE DRAWER
    ══════════════════════════════════════════════════════════ */
    function _openSidebar() {
        $.sidebar.classList.add('open');
        $.sidebarOverlay.classList.remove('hidden');
    }
    function _closeSidebar() {
        $.sidebar.classList.remove('open');
        $.sidebarOverlay.classList.add('hidden');
    }

    /* ══════════════════════════════════════════════════════════
       7. EVENT BINDING
    ══════════════════════════════════════════════════════════ */

    /** Called after each render to re-bind card events */
    function _bindCardEvents() {
        $.grid.querySelectorAll('.eq-card').forEach(card => {
            const id = card.dataset.id;

            // Card body → open detail modal
            const cardBody   = card.querySelector('.card-body');
            const cardFooter = card.querySelector('.card-footer');
            const cardVisual = card.querySelector('.card-visual');

            [cardBody, cardFooter, cardVisual].forEach(el => {
                if (!el) return;
                el.addEventListener('click', e => {
                    if (e.target.closest('.card-compare-btn')) return;
                    if (state.compareMode) { _toggleCompareItem(id); return; }
                    _openDetail(id);
                });
            });

            // Compare button on card
            const cmpBtn = card.querySelector('.card-compare-btn');
            if (cmpBtn) {
                cmpBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    _toggleCompareItem(cmpBtn.dataset.id);
                });
            }
        });
    }

    function _bindStaticEvents() {

        // ── SEARCH ──────────────────────────────────────────────
        $.searchInput.addEventListener('input', e => {
            state.search = e.target.value;
            $.searchClear.classList.toggle('hidden', !state.search);
            _render();
        });

        $.searchClear.addEventListener('click', () => {
            state.search = '';
            $.searchInput.value = '';
            $.searchClear.classList.add('hidden');
            $.searchInput.focus();
            _render();
        });

        // ── CATEGORY NAV ────────────────────────────────────────
        $.catNav.addEventListener('click', e => {
            const btn = e.target.closest('.cat-item');
            if (!btn) return;
            state.category = btn.dataset.cat;
            state.era      = null;
            state.origin   = null;
            $.catNav.querySelectorAll('.cat-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.body.dataset.category = state.category;
            _buildSidebarFilters();
            _render();
        });

        // ── ERA FILTER ───────────────────────────────────────────
        $.eraFilters.addEventListener('click', e => {
            const btn = e.target.closest('.filter-chip-btn');
            if (!btn) return;
            state.era = state.era === btn.dataset.era ? null : btn.dataset.era;
            _buildSidebarFilters();
            _render();
        });

        // ── ORIGIN FILTER ────────────────────────────────────────
        $.originFilters.addEventListener('click', e => {
            const btn = e.target.closest('.filter-chip-btn');
            if (!btn) return;
            state.origin = state.origin === btn.dataset.origin ? null : btn.dataset.origin;
            _buildSidebarFilters();
            _render();
        });

        // ── SORT ────────────────────────────────────────────────
        $.sortOptions.addEventListener('click', e => {
            const btn = e.target.closest('.sort-btn');
            if (!btn) return;
            state.sort = btn.dataset.sort;
            $.sortOptions.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _render();
        });

        // ── FILTER BAR — remove chip ─────────────────────────────
        $.filterChips.addEventListener('click', e => {
            const btn = e.target.closest('[data-remove]');
            if (!btn) return;
            const key = btn.dataset.remove;
            if (key === 'search') { state.search = ''; $.searchInput.value = ''; $.searchClear.classList.add('hidden'); }
            if (key === 'era')    state.era    = null;
            if (key === 'origin') state.origin = null;
            _buildSidebarFilters();
            _render();
        });

        $.btnClearAll.addEventListener('click', () => {
            state.search = ''; state.era = null; state.origin = null;
            $.searchInput.value = '';
            $.searchClear.classList.add('hidden');
            _buildSidebarFilters();
            _render();
        });

        // ── RESET (empty state) ──────────────────────────────────
        document.getElementById('btn-reset-search').addEventListener('click', () => {
            state.search = ''; state.era = null; state.origin = null; state.category = 'all';
            $.searchInput.value = '';
            $.catNav.querySelectorAll('.cat-item').forEach(b => b.classList.remove('active'));
            $.catNav.querySelector('[data-cat="all"]').classList.add('active');
            _buildSidebarFilters();
            _render();
        });

        // ── COMPARE TOGGLE ───────────────────────────────────────
        $.btnCompare.addEventListener('click', _toggleCompareMode);

        // ── COMPARE PANEL ACTIONS ────────────────────────────────
        $.btnRunCompare.addEventListener('click', _runComparison);

        $.btnClearCompare.addEventListener('click', () => {
            state.compareIds.clear();
            _updateComparePanel();
            _updateCompareBadge();
            _render();
        });

        $.btnCloseCompare.addEventListener('click', () => {
            state.compareMode = false;
            state.compareIds.clear();
            $.btnCompare.classList.remove('active');
            $.comparePanel.classList.add('hidden');
            _updateCompareBadge();
            _render();
        });

        // Slot remove buttons (delegated)
        $.comparePanel.addEventListener('click', e => {
            const btn = e.target.closest('.slot-remove');
            if (!btn) return;
            _toggleCompareItem(btn.dataset.id);
        });

        // ── MODALS ───────────────────────────────────────────────
        $.modalClose.addEventListener('click', _closeModal);
        $.modalOverlay.addEventListener('click', e => {
            if (e.target === $.modalOverlay) _closeModal();
        });

        $.compareModalClose.addEventListener('click', _closeCompareModal);
        $.compareOverlay.addEventListener('click', e => {
            if (e.target === $.compareOverlay) _closeCompareModal();
        });

        // ── KEYBOARD ────────────────────────────────────────────
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                if (!$.compareOverlay.classList.contains('hidden')) { _closeCompareModal(); return; }
                if (!$.modalOverlay.classList.contains('hidden'))   { _closeModal(); return; }
                if (state.compareMode) { _toggleCompareMode(); }
            }
            // Global search shortcut: / key
            if (e.key === '/' && document.activeElement !== $.searchInput) {
                e.preventDefault();
                $.searchInput.focus();
            }
        });

        // ── SIDEBAR TOGGLE ───────────────────────────────────────
        document.getElementById('btn-sidebar-toggle').addEventListener('click', () => {
            if ($.sidebar.classList.contains('open')) {
                _closeSidebar();
            } else {
                _openSidebar();
            }
        });

        $.sidebarOverlay.addEventListener('click', _closeSidebar);

        // ── THEME ────────────────────────────────────────────────
        $.btnTheme.addEventListener('click', () => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', state.theme);
        });
    }

    /* ══════════════════════════════════════════════════════════
       8. SPLASH & INIT
    ══════════════════════════════════════════════════════════ */
    function _cacheDom() {
        const q = id => document.getElementById(id);
        $.grid         = q('equipment-grid');
        $.empty        = q('empty-state');
        $.resultCount  = q('result-count');
        $.searchInput  = q('search-input');
        $.searchClear  = q('search-clear');
        $.catNav       = q('cat-nav');
        $.eraFilters   = q('era-filters');
        $.originFilters= q('origin-filters');
        $.sortOptions  = q('sort-options');
        $.filterBar    = q('filter-bar');
        $.filterChips  = q('filter-chips');
        $.btnClearAll  = q('btn-clear-all');
        $.cntAll       = q('cnt-all');
        $.cntLand      = q('cnt-land');
        $.cntAir       = q('cnt-air');
        $.cntSea       = q('cnt-sea');
        $.sfTotal      = q('sf-total');
        $.sfCompare    = q('sf-compare');
        $.sidebar      = q('sidebar');
        $.sidebarOverlay = q('sidebar-overlay');
        $.btnCompare   = q('btn-compare-mode');
        $.compareBadge = q('compare-count');
        $.comparePanel = q('compare-panel');
        $.compareHint  = q('compare-hint');
        $.slot0        = q('slot-0');
        $.slot1        = q('slot-1');
        $.btnRunCompare  = q('btn-run-compare');
        $.btnClearCompare= q('btn-clear-compare');
        $.btnCloseCompare= q('btn-close-compare');
        $.modalOverlay   = q('modal-overlay');
        $.modal          = q('modal');
        $.modalClose     = q('modal-close');
        $.modalContent   = q('modal-content');
        $.compareOverlay = q('compare-overlay');
        $.compareModalClose = q('compare-modal-close');
        $.compareModalContent = q('compare-modal-content');
        $.btnTheme       = q('btn-theme');
        $.appShell       = q('app');
    }

    function _splash() {
        return new Promise(resolve => {
            const bar     = document.getElementById('splash-bar');
            const status  = document.getElementById('splash-status');
            const splash  = document.getElementById('splash');

            const steps = [
                'Loading weapons database…',
                'Indexing land systems…',
                'Indexing air platforms…',
                'Indexing naval vessels…',
                'Building search index…',
                'Rendering interface…',
            ];

            let i = 0;
            const tick = () => {
                i++;
                const pct = Math.min((i / steps.length) * 100, 100);
                if (bar)    bar.style.width  = pct + '%';
                if (status) status.textContent = steps[i - 1] || 'Ready.';

                if (i < steps.length) {
                    setTimeout(tick, 280 + Math.random() * 120);
                } else {
                    setTimeout(() => {
                        splash.style.opacity = '0';
                        splash.style.transition = 'opacity 0.5s ease';
                        setTimeout(() => {
                            splash.style.display = 'none';
                            resolve();
                        }, 500);
                    }, 400);
                }
            };
            setTimeout(tick, 180);
        });
    }

    /* ══════════════════════════════════════════════════════════
       9. PUBLIC INIT
    ══════════════════════════════════════════════════════════ */
    async function init() {
        await _splash();

        _cacheDom();

        // Show app
        $.appShell.classList.add('visible');

        // Build sidebar filters
        _buildSidebarFilters();

        // Bind all static events
        _bindStaticEvents();

        // Initial render
        _render();

        console.info(`[Digital Armory] Loaded ${window.ARMORY_DATA.length} entries.`);
    }

    return { init };

})();

/* ── Auto-start ─────────────────────────────────────────────── */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}