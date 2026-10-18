/**
 * Dynamic Report Extraction & Export Engine
 */
const ReportsModule = (() => {
    function init() {
        document.getElementById('btnExecuteReport')?.addEventListener('click', executeReport);
    }

    function executeReport() {
        const domain = document.getElementById('reportDomain').value;
        const format = document.getElementById('reportFormat').value;
        const previewArea = document.getElementById('reportPreviewArea');

        let records = [];

        if (domain === 'attendance') {
            records = [
                { PIN: 'EMP-1001', Date: '2024-08-25', In: '09:00', Out: '17:34', Status: 'Present' },
                { PIN: 'EMP-1002', Date: '2024-08-25', In: '09:02', Out: '18:10', Status: 'Present' },
                { PIN: 'EMP-1004', Date: '2024-08-25', In: '--:--', Out: '--:--', Status: 'Casual Leave' }
            ];
        } else if (domain === 'payroll') {
            records = AppState.get('employees').map(e => ({
                PIN: e.pin,
                Name: e.name,
                Scale: e.basic,
                Disbursed: Math.round(e.basic * 1.5)
            }));
        } else {
            records = AppState.get('employees');
        }

        if (format === 'csv') {
            exportCSV(records, `${domain}_Report.csv`);
            previewArea.innerHTML = `<span class="text-success">✔ Data extract parsed and downloaded as CSV (${records.length} records).</span>`;
        } else {
            previewArea.innerHTML = `
        <pre style="background:#f8fafc; padding:12px; border:1px solid #cbd5e1; border-radius:4px; max-height:220px; overflow:auto;">
          ${JSON.stringify(records, null, 2)}
        </pre>
      `;
        }
    }

    function exportCSV(dataArray, fileName) {
        if (!dataArray || !dataArray.length) return;
        const headers = Object.keys(dataArray[0]).join(',');
        const rows = dataArray.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return { init, exportCSV };
})();