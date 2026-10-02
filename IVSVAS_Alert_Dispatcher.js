// Simulates the automated Email and SMS reporting pipeline
class AlertDispatcher {
    constructor() {
        this.logContainer = document.getElementById('alert-log');
    }

    dispatch(type, location, status) {
        const time = new Date().toLocaleTimeString();
        let logClass = 'log-item';

        if (status === 'FIRE' || status === 'ABNORMAL') logClass += ' critical';
        else if (status === 'smoke') logClass += ' warning';

        const message = this._generateMessage(type, location, status);

        const logHtml = `
            <div class="${logClass}">
                <span class="log-time">[${time}] - SYSTEM DISPATCH</span>
                <strong>[${status}]</strong> detected at ${location}.<br>
                ${message}
            </div>
        `;

        this.logContainer.insertAdjacentHTML('afterbegin', logHtml);

        // Keep log clean
        if(this.logContainer.children.length > 20) {
            this.logContainer.lastElementChild.remove();
        }
    }

    _generateMessage(type, location, status) {
        if (status === 'CLEAR' || status === 'NORMAL') return "Status nominal. No action required.";
        return `Automated Email & SMS dispatched to Law Enforcement / Facility Managers regarding ${type} alert.`;
    }
}
const Dispatcher = new AlertDispatcher();