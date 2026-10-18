/**
 * Statistical Analysis & Reports Engine (Feature #8)
 */
const ReportsAnalytics = (() => {
    function init() {
        document.getElementById('btnRunExport')?.addEventListener('click', handleExport);
        renderMonitoringTable();
    }

    function handleExport() {
        const dataset = document.getElementById('reportDataset').value;
        const format = document.getElementById('reportExportType').value;
        const preview = document.getElementById('reportLivePreview');

        const data = AppState.get('proposals');

        if (format === 'csv') {
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
            const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
            const uri = encodeURI(csv);
            const link = document.createElement("a");
            link.setAttribute("href", uri);
            link.setAttribute("download", `ePPMS_${dataset}_Audit_Report.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            preview.innerHTML = `<span class="text-success">✔ Dynamic report extract downloaded successfully (${data.length} records).</span>`;
        } else {
            preview.innerHTML = `<pre style="font-size:11px; background:#f8fafc; padding:10px; max-height:200px; overflow:auto;">${JSON.stringify(data, null, 2)}</pre>`;
        }
    }

    function renderMonitoringTable() {
        const tbody = document.getElementById('monitoringTableBody');
        if (!tbody) return;

        const list = AppState.get('proposals');
        tbody.innerHTML = list.map(p => `
      <tr>
        <td><strong>${p.id}</strong></td>
        <td>${p.title}</td>
        <td>36 Months</td>
        <td><span class="badge badge-success">Milestone 2 / 4 Passed</span></td>
        <td><span class="badge badge-info">UC / SE Certified</span></td>
        <td><strong>${p.domain.includes('Bio') || p.domain.includes('Ocean') ? '1 Patent Filed' : 'Pending'}</strong></td>
        <td>
          <button class="btn btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="MainApp.triggerToast('Verification memo ready for ${p.id}');">Review APR</button>
        </td>
      </tr>
    `).join('');
    }

    return { init };
})();