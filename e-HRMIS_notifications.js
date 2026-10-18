/**
 * Real-Time Messaging, SMS & Email Dispatch Simulator
 */
const NotificationsModule = (() => {
    const drawer = document.getElementById('notificationDrawer');
    const feed = document.getElementById('notificationFeed');
    const badge = document.getElementById('unreadBadge');

    function init() {
        render();
        bindEvents();
    }

    function render() {
        if (!feed) return;
        const list = AppState.get('notifications');
        feed.innerHTML = list.map(item => `
      <div class="notif-item">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong style="color:var(--primary-color)">[${item.type}] to ${item.to}</strong>
          <small class="text-muted">${item.time}</small>
        </div>
        <div>${item.text}</div>
      </div>
    `).join('');
    }

    function bindEvents() {
        document.getElementById('notifTrayBtn')?.addEventListener('click', toggleDrawer);
        document.getElementById('closeNotifDrawer')?.addEventListener('click', toggleDrawer);
    }

    function toggleDrawer() {
        if (!drawer) return;
        drawer.classList.toggle('open');
        if (badge) badge.style.display = 'none';
    }

    function dispatchAlert(channel, message) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        AppState.addNotification({
            id: Date.now(),
            type: channel,
            to: 'Active Cadre Staff',
            text: message,
            time: time
        });
        render();
        if (badge) badge.style.display = 'block';
        dispatchToast(`[${channel}] Notification Dispatched`);
    }

    function dispatchToast(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #0f172a;
      color: #fff;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 150;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-left: 4px solid #38bdf8;
    `;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3500);
    }

    return { init, dispatchAlert, dispatchToast };
})();