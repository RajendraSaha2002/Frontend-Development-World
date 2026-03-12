/**
 * router.js — PROTOCOL RBAC
 *
 * The Permission-Aware Client Router.
 *
 * HOW IT WORKS:
 *   1. On init(), fetch ALL permissions for this token from Python.
 *   2. Build the sidebar — locked items show 🔒, are not clickable.
 *   3. On navigate(page):
 *        a. Guard: if user lacks the required permission → renderAccessDenied()
 *        b. Render the page HTML (which may contain data-require-perm attrs)
 *        c. _enforceDOM(): scan every [data-require-perm] element.
 *           If the user lacks that permission → el.remove()  ← PHYSICAL REMOVAL
 *           The element is gone from the DOM, not just hidden.
 *        d. _enforceDOM(): disable [data-disable-without-perm] inputs/buttons.
 *
 * HTML attribute contract:
 *   data-require-perm="perm_name"         → remove element if NOT granted
 *   data-disable-without-perm="perm_name" → disable element if NOT granted
 *
 * The server ALSO enforces permissions on every API call, so the
 * DOM enforcement is a defence-in-depth UX layer, not the only guard.
 */

'use strict';

const Router = (() => {

  /* ── State ─────────────────────────────────────────────────── */
  let _perms   = new Set();   // flat Set of permission name strings
  let _detailed = [];          // [{permission_name, module, via_role, depth}]
  let _roles   = [];
  let _user    = null;

  /* ── Page → required permission map ────────────────────────── */
  const PAGE_PERM = {
    overview : 'dashboard_view',
    users    : 'users_view',
    roles    : 'roles_view',
    reports  : 'reports_view',
    settings : 'settings_view',
    audit    : 'audit_view',
    system   : 'system_monitor',
  };

  /* ── Sidebar nav definition ─────────────────────────────────── */
  const NAV_ITEMS = [
    { page:'overview', label:'Overview',       perm:'dashboard_view', icon:'◈' },
    { page:'users',    label:'Users',          perm:'users_view',     icon:'◉' },
    { page:'roles',    label:'Roles & Perms',  perm:'roles_view',     icon:'⊕' },
    { page:'reports',  label:'Reports',        perm:'reports_view',   icon:'⊞' },
    { page:'settings', label:'Settings',       perm:'settings_view',  icon:'⚙' },
    { page:'audit',    label:'Audit Log',      perm:'audit_view',     icon:'≡' },
    { page:'system',   label:'System Monitor', perm:'system_monitor', icon:'⬡' },
  ];

  /* ══════════════════════════════════════════════════════════════
     INIT — called once on DOMContentLoaded
  ═══════════════════════════════════════════════════════════════ */
  async function init() {
    if (!Auth.isLoggedIn()) {
      window.location.href = '/';
      return;
    }

    // Parallel fetch: user info + full permission set
    const [meRes, permRes] = await Promise.all([
      Auth.apiGet('/api/me'),
      Auth.apiGet('/api/permissions'),
    ]);

    // Token invalid / expired → back to login
    if (!meRes.ok || meRes.status === 401 || permRes.status === 401) {
      window.location.href = '/';
      return;
    }

    _user     = meRes.data.user   || {};
    _roles    = meRes.data.roles  || [];
    _detailed = permRes.data.detailed || [];
    _perms    = new Set(permRes.data.permissions || []);

    // Populate topbar user info
    _setUserBar();

    // Build the sidebar (locked items for pages user can't access)
    _buildSidebar();

    // Navigate to hash page or first accessible page
    const startPage = (window.location.hash || '#overview').replace('#', '');
    navigate(startPage);

    // Handle browser back/forward navigation
    window.addEventListener('hashchange', () => {
      navigate(window.location.hash.replace('#', '') || 'overview');
    });
  }

  /* ══════════════════════════════════════════════════════════════
     PERMISSION HELPERS
  ═══════════════════════════════════════════════════════════════ */
  /** True if user has this permission (from in-memory Set) */
  function can(perm) { return _perms.has(perm); }

  /** True if user has ANY of the listed permissions */
  function canAny(...perms) { return perms.some(p => can(p)); }

  /* ══════════════════════════════════════════════════════════════
     NAVIGATE
  ═══════════════════════════════════════════════════════════════ */
  async function navigate(pageId) {
    const required = PAGE_PERM[pageId];

    // ── Guard ─────────────────────────────────────────────────
    if (required && !can(required)) {
      _renderAccessDenied(pageId, required);
      _highlightNav(null);
      return;
    }

    window.location.hash = pageId;
    _highlightNav(pageId);

    // Update breadcrumb
    const bc = document.getElementById('breadcrumb');
    if (bc) {
      const item = NAV_ITEMS.find(n => n.page === pageId);
      bc.textContent = item ? item.label : pageId;
    }

    // Render the page
    const content = document.getElementById('page-content');
    if (!content) return;
    content.innerHTML = '<div class="loading"><span class="spinner"></span> Loading…</div>';

    const renderers = {
      overview : renderOverview,
      users    : renderUsers,
      roles    : renderRoles,
      reports  : renderReports,
      settings : renderSettings,
      audit    : renderAudit,
      system   : renderSystem,
    };

    const fn = renderers[pageId];
    if (fn) {
      await fn(content);
    } else {
      content.innerHTML = '<p class="text-muted" style="padding:20px">Page not found.</p>';
    }

    // !! DOM ENFORCEMENT — remove/disable elements based on permissions
    _enforceDOM(content);
  }

  /* ══════════════════════════════════════════════════════════════
     _enforceDOM  — THE CORE SECURITY LAYER
     Called after EVERY page render.
     Physically removes elements the user has no permission for.
  ═══════════════════════════════════════════════════════════════ */
  function _enforceDOM(root = document) {

    // ── 1. REMOVE elements user lacks permission for ───────────
    root.querySelectorAll('[data-require-perm]').forEach(el => {
      const perm = el.dataset.requirePerm;
      if (!can(perm)) {
        // Physical removal — cannot be revealed via DevTools toggle
        el.remove();
      }
    });

    // ── 2. DISABLE inputs/buttons without removing them ───────
    //    (used for read-only fields that give context to the user)
    root.querySelectorAll('[data-disable-without-perm]').forEach(el => {
      const perm = el.dataset.disableWithoutPerm;
      if (!can(perm)) {
        el.disabled = true;
        el.classList.add('perm-disabled');
        el.title = `Requires permission: ${perm}`;
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SIDEBAR BUILDER
  ═══════════════════════════════════════════════════════════════ */
  function _buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    nav.innerHTML = NAV_ITEMS.map(item => {
      const accessible = !item.perm || can(item.perm);
      return `
        <div class="nav-item ${accessible ? '' : 'nav-locked'}"
             data-page="${item.page}"
             title="${accessible ? item.label : 'Requires: ' + item.perm}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
          ${!accessible ? '<span class="nav-lock">🔒</span>' : ''}
        </div>`;
    }).join('');

    // Only attach click to accessible nav items
    nav.querySelectorAll('.nav-item:not(.nav-locked)').forEach(el => {
      el.addEventListener('click', () => navigate(el.dataset.page));
    });
  }

  function _highlightNav(pageId) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageId);
    });
  }

  function _setUserBar() {
    const nameEl = document.getElementById('user-fullname');
    const roleEl = document.getElementById('user-roles');
    const avEl   = document.querySelector('.user-avatar');
    if (nameEl) nameEl.textContent = _user.full_name || _user.username || '?';
    if (roleEl) roleEl.textContent = _roles.map(r => r.name).join(', ') || '—';
    if (avEl)   avEl.textContent   = (_user.username || '?')[0].toUpperCase();
  }

  function _renderAccessDenied(pageId, perm) {
    const content = document.getElementById('page-content');
    if (!content) return;
    content.innerHTML = `
      <div class="access-denied">
        <div class="ad-icon">⛔</div>
        <h2>Access Denied</h2>
        <p>Page <code>${pageId}</code> requires permission <code>${perm}</code>.</p>
        <p class="ad-hint">Contact your administrator to request access.</p>
      </div>`;
  }

  /* ══════════════════════════════════════════════════════════════
     PAGE: OVERVIEW
  ═══════════════════════════════════════════════════════════════ */
  async function renderOverview(c) {
    const permList = [..._perms].sort().map(p =>
      `<span class="perm-tag">${p}</span>`
    ).join('');

    c.innerHTML = `
      <div class="page-header">
        <h2>Overview</h2>
        <span class="page-sub">Logged in as ${_user.username} · ${_roles.map(r=>r.name).join(', ')}</span>
      </div>

      <!-- Stats — cards removed from DOM if permission missing -->
      <div class="stats-grid">
        <div class="stat-card" data-require-perm="users_view">
          <div class="stat-icon">👥</div>
          <div class="stat-body">
            <div class="stat-val" id="kpi-users">—</div>
            <div class="stat-lbl">Total Users</div>
          </div>
        </div>
        <div class="stat-card" data-require-perm="roles_view">
          <div class="stat-icon">🔑</div>
          <div class="stat-body">
            <div class="stat-val" id="kpi-roles">—</div>
            <div class="stat-lbl">Defined Roles</div>
          </div>
        </div>
        <div class="stat-card" data-require-perm="audit_view">
          <div class="stat-icon">📋</div>
          <div class="stat-body">
            <div class="stat-val" id="kpi-audit">—</div>
            <div class="stat-lbl">Audit Events</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🛡</div>
          <div class="stat-body">
            <div class="stat-val">${_perms.size}</div>
            <div class="stat-lbl">Your Permissions</div>
          </div>
        </div>
      </div>

      <!-- Super-admin panel — physically removed for everyone else -->
      <div class="card" data-require-perm="system_admin">
        <div class="card-header">⚡ Super Admin Panel</div>
        <div class="card-body" style="display:flex;gap:8px;align-items:center">
          <span style="font-size:.78rem;color:var(--c-text-dim)">Full system control.</span>
          <button class="btn btn-danger"   data-require-perm="system_admin">Purge Sessions</button>
          <button class="btn btn-warning"  data-require-perm="settings_edit">Reset Config</button>
        </div>
      </div>

      <!-- Permission map (always visible to self) -->
      <div class="card">
        <div class="card-header">
          🔒 Your Permission Map
          <span class="badge">${_perms.size} granted</span>
        </div>
        <div class="card-body">
          <div class="perm-grid">
            ${permList || '<span class="text-muted">No permissions assigned</span>'}
          </div>
        </div>
      </div>

      <!-- Role inheritance chain (only if roles_view) -->
      <div class="card" data-require-perm="roles_view">
        <div class="card-header">🧬 Recursive Inheritance Chain
          <span style="font-size:.65rem;color:var(--c-text-dim)">
            via WITH RECURSIVE CTE in PostgreSQL
          </span>
        </div>
        <div id="inherit-body" class="card-body">Loading…</div>
      </div>`;

    // Parallel data loads
    const tasks = [];
    if (can('users_view')) tasks.push(
      Auth.apiGet('/api/users').then(r => {
        const el = document.getElementById('kpi-users');
        if (el) el.textContent = r.data.users?.length ?? '—';
      })
    );
    if (can('roles_view')) tasks.push(
      Auth.apiGet('/api/roles').then(r => {
        const el = document.getElementById('kpi-roles');
        if (el) el.textContent = r.data.roles?.length ?? '—';
      }),
      // Render inheritance table
      (async () => {
        const tableEl = document.getElementById('inherit-body');
        if (!tableEl) return;
        if (!_detailed.length) { tableEl.textContent = 'No inherited permissions.'; return; }
        tableEl.innerHTML = `
          <table class="data-table">
            <thead><tr>
              <th>Permission</th><th>Module</th><th>Via Role</th>
              <th>Depth (0 = direct)</th>
            </tr></thead>
            <tbody>
              ${_detailed.map(p => `
                <tr>
                  <td><code>${p.permission_name}</code></td>
                  <td><span class="role-tag" style="background:rgba(0,212,255,.1);color:var(--c-cyan);border-color:rgba(0,212,255,.2)">${p.module}</span></td>
                  <td><span class="role-tag">${p.via_role}</span></td>
                  <td><span class="depth-badge">depth ${p.depth}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>`;
      })()
    );
    if (can('audit_view')) tasks.push(
      Auth.apiGet('/api/audit').then(r => {
        const el = document.getElementById('kpi-audit');
        if (el) el.textContent = r.data.audit?.length ?? '—';
      })
    );
    await Promise.all(tasks);
  }

  /* ══════════════════════════════════════════════════════════════
     PAGE: USERS
  ═══════════════════════════════════════════════════════════════ */
  async function renderUsers(c) {
    c.innerHTML = `
      <div class="page-header">
        <h2>User Management</h2>
        <!-- Physically removed if no users_create -->
        <button class="btn btn-primary" id="btn-new-user"
                data-require-perm="users_create">+ New User</button>
      </div>
      <div class="card">
        <div class="card-header">All Accounts</div>
        <div id="users-wrap" class="card-body">Loading…</div>
      </div>`;

    const res  = await Auth.apiGet('/api/users');
    const wrap = document.getElementById('users-wrap');
    if (!wrap) return;
    if (!res.ok) { wrap.innerHTML = `<p class="text-muted">${res.data.error}</p>`; return; }

    const users = res.data.users || [];
    wrap.innerHTML = users.length ? `
      <table class="data-table">
        <thead><tr>
          <th>Username</th><th>Full Name</th><th>Email</th>
          <th>Roles</th><th>Last Login</th><th>Status</th>
          <!-- Entire column removed if no users_edit -->
          <th data-require-perm="users_edit">Actions</th>
        </tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td><code>${u.username}</code></td>
              <td>${u.full_name || '—'}</td>
              <td>${u.email || '—'}</td>
              <td>${(u.roles||[]).map(r=>`<span class="role-tag">${r}</span>`).join(' ')}</td>
              <td style="font-size:.7rem;color:var(--c-text-dim)">${u.last_login ? u.last_login.slice(0,16).replace('T',' ') : 'Never'}</td>
              <td><span class="status-pill ${u.is_active?'active':'inactive'}">${u.is_active?'Active':'Inactive'}</span></td>
              <td data-require-perm="users_edit">
                <button class="btn-tiny" data-require-perm="users_edit">Edit</button>
                <button class="btn-tiny danger" data-require-perm="users_delete">Delete</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>` : '<p class="text-muted">No users found.</p>';
  }

  /* ══════════════════════════════════════════════════════════════
     PAGE: ROLES
  ═══════════════════════════════════════════════════════════════ */
  async function renderRoles(c) {
    c.innerHTML = `
      <div class="page-header">
        <h2>Roles &amp; Permissions</h2>
        <button class="btn btn-primary" data-require-perm="roles_create">+ New Role</button>
      </div>
      <div class="card">
        <div class="card-header">Role Hierarchy
          <span style="font-size:.65rem;color:var(--c-text-dim)">Child inherits parent permissions via recursive CTE</span>
        </div>
        <div id="roles-wrap" class="card-body">Loading…</div>
      </div>`;

    const res  = await Auth.apiGet('/api/roles');
    const wrap = document.getElementById('roles-wrap');
    if (!wrap || !res.ok) return;

    const roles = res.data.roles || [];
    wrap.innerHTML = `
      <table class="data-table">
        <thead><tr>
          <th>Role</th><th>Description</th><th>Inherits From</th>
          <th>Own Perms</th>
          <th data-require-perm="roles_edit">Actions</th>
        </tr></thead>
        <tbody>
          ${roles.map(r => `
            <tr>
              <td><span class="role-tag role-tag-lg">${r.name}</span></td>
              <td style="font-size:.72rem;color:var(--c-text-dim)">${r.description || '—'}</td>
              <td>${r.parent_name
                    ? `<span class="role-tag">${r.parent_name}</span> <span class="depth-badge">↑</span>`
                    : '<span class="text-muted">— root —</span>'}</td>
              <td><span class="badge">${r.permission_count}</span></td>
              <td data-require-perm="roles_edit">
                <button class="btn-tiny" data-require-perm="roles_edit">Edit</button>
                <button class="btn-tiny danger" data-require-perm="roles_delete">Delete</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  /* ══════════════════════════════════════════════════════════════
     PAGE: REPORTS
  ═══════════════════════════════════════════════════════════════ */
  async function renderReports(c) {
    c.innerHTML = `
      <div class="page-header">
        <h2>Reports</h2>
        <button class="btn btn-primary" data-require-perm="reports_create">+ Build Report</button>
      </div>
      <div class="reports-grid">
        <div class="report-card">
          <div class="rc-title">User Activity</div>
          <div class="rc-desc">Login history, session counts, last-seen per user.</div>
          <div class="rc-actions">
            <button class="btn btn-outline">View</button>
            <button class="btn btn-primary" data-require-perm="reports_export">Export CSV</button>
          </div>
        </div>
        <div class="report-card">
          <div class="rc-title">Permission Audit</div>
          <div class="rc-desc">All role assignments and permission changes in 30 days.</div>
          <div class="rc-actions">
            <button class="btn btn-outline">View</button>
            <button class="btn btn-primary" data-require-perm="reports_export">Export CSV</button>
          </div>
        </div>
        <div class="report-card">
          <div class="rc-title">Security Incidents</div>
          <div class="rc-desc">Failed logins, permission denials, anomalies.</div>
          <div class="rc-actions">
            <button class="btn btn-outline">View</button>
            <button class="btn btn-primary" data-require-perm="reports_export">Export CSV</button>
          </div>
        </div>
        <!-- Entire card removed from DOM if no reports_create -->
        <div class="report-card" data-require-perm="reports_create">
          <div class="rc-title">Custom Builder</div>
          <div class="rc-desc">Build reports with custom filters and output formats.</div>
          <div class="rc-actions">
            <button class="btn btn-primary" data-require-perm="reports_create">Open Builder</button>
          </div>
        </div>
      </div>`;
  }

  /* ══════════════════════════════════════════════════════════════
     PAGE: SETTINGS
  ═══════════════════════════════════════════════════════════════ */
  async function renderSettings(c) {
    c.innerHTML = `
      <div class="page-header"><h2>System Settings</h2></div>
      <div class="card">
        <div class="card-header">Session Configuration</div>
        <div class="card-body settings-grid">
          <div class="setting-row">
            <label>Session Timeout (hours)</label>
            <input type="number" value="8" class="input-sm"
                   data-disable-without-perm="settings_edit" />
          </div>
          <div class="setting-row">
            <label>Max Concurrent Sessions per User</label>
            <input type="number" value="5" class="input-sm"
                   data-disable-without-perm="settings_edit" />
          </div>
          <div class="setting-row">
            <label>Password Min Length</label>
            <input type="number" value="12" class="input-sm"
                   data-disable-without-perm="settings_edit" />
          </div>
          <div class="setting-row">
            <label>PBKDF2 Iterations</label>
            <input type="number" value="100000" class="input-sm"
                   data-disable-without-perm="settings_edit" />
          </div>
        </div>
      </div>
      <!-- Danger Zone: removed from DOM unless system_admin -->
      <div class="card" data-require-perm="system_admin">
        <div class="card-header" style="color:var(--c-red)">⚡ Danger Zone</div>
        <div class="card-body danger-zone">
          <div class="dz-row">
            <div>
              <strong>Purge All Active Sessions</strong>
              <p>Force-logout every user immediately. They must re-authenticate.</p>
            </div>
            <button class="btn btn-danger" data-require-perm="system_admin">Purge</button>
          </div>
          <div class="dz-row">
            <div>
              <strong>Reset Role Permissions</strong>
              <p>Revert all roles to factory default permission assignments.</p>
            </div>
            <button class="btn btn-danger" data-require-perm="settings_edit">Reset</button>
          </div>
        </div>
      </div>
      <div class="card-footer-actions" data-require-perm="settings_edit">
        <button class="btn btn-primary">Save Changes</button>
        <button class="btn btn-outline">Discard</button>
      </div>`;
  }

  /* ══════════════════════════════════════════════════════════════
     PAGE: AUDIT LOG
  ═══════════════════════════════════════════════════════════════ */
  async function renderAudit(c) {
    c.innerHTML = `
      <div class="page-header">
        <h2>Audit Log</h2>
        <button class="btn btn-outline" data-require-perm="audit_export">↑ Export CSV</button>
      </div>
      <div class="card">
        <div class="card-header">All Events (latest 300)</div>
        <div id="audit-wrap" class="card-body">Loading…</div>
      </div>`;

    const res  = await Auth.apiGet('/api/audit');
    const wrap = document.getElementById('audit-wrap');
    if (!wrap || !res.ok) return;

    const events = res.data.audit || [];
    wrap.innerHTML = events.length ? `
      <table class="data-table">
        <thead><tr>
          <th>Timestamp</th><th>User</th><th>Action</th><th>Resource</th><th>IP</th>
        </tr></thead>
        <tbody>
          ${events.map(e => `
            <tr class="audit-row ${e.action.includes('FAIL')||e.action.includes('DENIED') ? 'row-warn' : ''}">
              <td class="mono" style="font-size:.68rem">${(e.created_at||'').replace('T',' ').slice(0,19)}</td>
              <td><code>${e.username || '(system)'}</code></td>
              <td><span class="action-tag action-${_cls(e.action)}">${e.action}</span></td>
              <td style="font-size:.72rem;color:var(--c-text-dim)">${e.resource||'—'}</td>
              <td class="mono" style="font-size:.68rem;color:var(--c-text-dim)">${e.ip_address||'—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>` : '<p class="text-muted">No audit events recorded yet.</p>';
  }

  function _cls(a) {
    if (a.includes('FAIL') || a.includes('DELETE') || a.includes('DENIED')) return 'danger';
    if (a.includes('SUCCESS') || a.includes('CREATE')) return 'success';
    return 'info';
  }

  /* ══════════════════════════════════════════════════════════════
     PAGE: SYSTEM MONITOR
  ═══════════════════════════════════════════════════════════════ */
  async function renderSystem(c) {
    const token = Auth.getToken() || '';
    c.innerHTML = `
      <div class="page-header">
        <h2>System Monitor</h2>
        <span class="badge badge-live">LIVE</span>
      </div>
      <div class="sys-grid">
        <div class="sys-card">
          <div class="sys-title">Python Server</div>
          <div class="sys-status online">● Online</div>
          <div class="sys-detail">stdlib HTTPServer · Port ${window.location.port||8000}</div>
        </div>
        <div class="sys-card">
          <div class="sys-title">PostgreSQL</div>
          <div class="sys-status online">● Connected</div>
          <div class="sys-detail">psycopg2 · recursive CTE active</div>
        </div>
        <div class="sys-card">
          <div class="sys-title">RBAC Engine</div>
          <div class="sys-status online">● Running</div>
          <div class="sys-detail">${_perms.size} perms loaded · ${_roles.map(r=>r.name).join(', ')}</div>
        </div>
        <div class="sys-card">
          <div class="sys-title">Session Token</div>
          <div class="sys-status online">● Valid</div>
          <div class="sys-detail" style="word-break:break-all;font-size:.62rem">${token.slice(0,12)}…${token.slice(-8)}</div>
        </div>
      </div>

      <!-- Active sessions table — only for system_admin -->
      <div class="card" data-require-perm="system_admin">
        <div class="card-header">Active Sessions
          <button class="btn btn-outline" style="font-size:.68rem" id="btn-load-sessions">Load</button>
        </div>
        <div id="sessions-wrap" class="card-body">
          <span class="text-muted" style="font-size:.75rem">Click Load to fetch active sessions.</span>
        </div>
      </div>

      <!-- System controls — only for system_admin -->
      <div class="card" data-require-perm="system_admin">
        <div class="card-header" style="color:var(--c-red)">⚡ System Controls</div>
        <div class="card-body" style="display:flex;gap:10px">
          <button class="btn btn-warning" data-require-perm="system_admin">Restart Server</button>
          <button class="btn btn-danger"  data-require-perm="system_admin">Emergency Stop</button>
        </div>
      </div>`;

    // Bind session loader (only present if system_admin, else already removed by _enforceDOM)
    const loadBtn = document.getElementById('btn-load-sessions');
    if (loadBtn) {
      loadBtn.addEventListener('click', async () => {
        const wrap = document.getElementById('sessions-wrap');
        if (!wrap) return;
        wrap.innerHTML = '<div class="loading"><span class="spinner"></span></div>';
        const r = await Auth.apiGet('/api/sessions');
        if (!r.ok) { wrap.innerHTML = `<p class="text-muted">${r.data.error}</p>`; return; }
        const rows = r.data.sessions || [];
        wrap.innerHTML = `
          <table class="data-table">
            <thead><tr><th>User</th><th>Token (partial)</th><th>IP</th><th>Created</th><th>Expires</th></tr></thead>
            <tbody>
              ${rows.map(s=>`
                <tr>
                  <td><code>${s.username}</code></td>
                  <td class="mono" style="font-size:.65rem">${s.token_preview}</td>
                  <td class="mono" style="font-size:.7rem">${s.ip_address||'—'}</td>
                  <td style="font-size:.68rem">${(s.created_at||'').slice(0,16).replace('T',' ')}</td>
                  <td style="font-size:.68rem">${(s.expires_at||'').slice(0,16).replace('T',' ')}</td>
                </tr>`).join('')}
            </tbody>
          </table>`;
      });
    }
  }

  /* ── Public API ─────────────────────────────────────────────── */
  return { init, navigate, can, canAny };

})();

window.Router = Router;