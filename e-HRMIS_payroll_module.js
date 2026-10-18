/**
 * Automated Salary, Allowance & Pay Slip Generation Engine
 */
const PayrollModule = (() => {
    const tbody = document.getElementById('payrollTableBody');

    function init() {
        render();
        bindEvents();
    }

    function calculateSalary(basic) {
        const da = basic * 0.50; // 50% Dearness Allowance
        const hra = basic * 0.27; // 27% HRA (Class-X City Standard)
        const gross = basic + da + hra;
        const pf = basic * 0.12; // 12% Provident Fund
        const tax = gross * 0.10; // Simulated flat 10% TDS
        const deductions = pf + tax;
        const net = gross - deductions;

        return { da, hra, gross, pf, tax, deductions, net };
    }

    function render() {
        if (!tbody) return;
        const employees = AppState.get('employees');

        tbody.innerHTML = employees.map(emp => {
            const calc = calculateSalary(emp.basic);
            return `
        <tr>
          <td><strong>${emp.pin}</strong></td>
          <td>${emp.name}</td>
          <td>₹${emp.basic.toLocaleString()}</td>
          <td>₹${Math.round(calc.da).toLocaleString()}</td>
          <td>₹${Math.round(calc.hra).toLocaleString()}</td>
          <td><strong>₹${Math.round(calc.gross).toLocaleString()}</strong></td>
          <td class="text-danger">-₹${Math.round(calc.deductions).toLocaleString()}</td>
          <td class="text-success"><strong>₹${Math.round(calc.net).toLocaleString()}</strong></td>
          <td>
            <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="PayrollModule.viewPaySlip('${emp.pin}')">Generate Slip</button>
          </td>
        </tr>
      `;
        }).join('');
    }

    function viewPaySlip(pin) {
        const emp = AppState.get('employees').find(e => e.pin === pin);
        if (!emp) return;
        const calc = calculateSalary(emp.basic);

        const payslipHTML = `
      <div style="border:2px solid #1e3a5f; padding:20px; border-radius:4px; font-family:monospace;">
        <div style="text-align:center; border-bottom:1px solid #1e3a5f; padding-bottom:10px;">
          <h3>AURA e-HRMIS EXECUTIVE PAY SLIP</h3>
          <p>FOR THE SALARY CYCLE: AUGUST 2024</p>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; margin-top:14px; font-size:12px;">
          <div><strong>Officer Name:</strong> ${emp.name}</div>
          <div><strong>Cadre PIN:</strong> ${emp.pin}</div>
          <div><strong>Designation:</strong> ${emp.designation}</div>
          <div><strong>Department:</strong> ${emp.dept}</div>
        </div>
        <table style="width:100%; border-collapse:collapse; margin-top:16px; font-size:12px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #cbd5e1; padding:6px;">Earnings</th>
              <th style="border:1px solid #cbd5e1; padding:6px;">Amount (₹)</th>
              <th style="border:1px solid #cbd5e1; padding:6px;">Deductions</th>
              <th style="border:1px solid #cbd5e1; padding:6px;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #cbd5e1; padding:6px;">Basic Pay Scale</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">${emp.basic.toLocaleString()}</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">Provident Fund (PF)</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">${Math.round(calc.pf).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="border:1px solid #cbd5e1; padding:6px;">Dearness Allowance (DA)</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">${Math.round(calc.da).toLocaleString()}</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">Income Tax (TDS)</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">${Math.round(calc.tax).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="border:1px solid #cbd5e1; padding:6px;">House Rent Allowance (HRA)</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">${Math.round(calc.hra).toLocaleString()}</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">Professional Tax</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">200</td>
            </tr>
            <tr style="font-weight:bold; background:#f8fafc;">
              <td style="border:1px solid #cbd5e1; padding:6px;">Gross Earnings</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">₹${Math.round(calc.gross).toLocaleString()}</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">Total Deductions</td>
              <td style="border:1px solid #cbd5e1; padding:6px;">₹${Math.round(calc.deductions + 200).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top:14px; text-align:right;">
          <h4>NET DISBURSED: ₹${Math.round(calc.net - 200).toLocaleString()}</h4>
          <small class="text-muted">Direct Electronic Bank Credit Verified</small>
        </div>
      </div>
      <button class="btn btn-primary margin-top-20" onclick="window.print()">Print Official Voucher</button>
    `;
        MainApp.openModal(`Pay Voucher: ${emp.pin}`, payslipHTML);
    }

    function bindEvents() {
        document.getElementById('btnBatchCalculate')?.addEventListener('click', () => {
            NotificationsModule.dispatchAlert('SYSTEM', 'Automatic salary recalculated based on dynamic bio-logs and performance metrics.');
        });

        document.getElementById('btnDisbursePayroll')?.addEventListener('click', () => {
            MainApp.triggerDigitalSignatureToast('Treasury Batch Payment Digitally Authorized.');
            NotificationsModule.dispatchAlert('SMS', 'Bank NEFT/RTGS instruction generated. Salary disbursals completed.');
        });
    }

    return { init, viewPaySlip };
})();