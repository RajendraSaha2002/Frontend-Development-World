/**
 * Master Employee Directory (Computerized Electronic Service Book)
 */
const EmployeeModule = (() => {
    const tbody = document.getElementById('employeeTableBody');
    const searchInput = document.getElementById('employeeSearchInput');
    const cadreFilter = document.getElementById('empCadreFilter');

    function init() {
        renderTable();
        bindEvents();
    }

    function renderTable() {
        if (!tbody) return;
        const employees = AppState.get('employees');
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCadre = cadreFilter ? cadreFilter.value : 'ALL';

        const filtered = employees.filter(emp => {
            const matchSearch = emp.name.toLowerCase().includes(query) ||
                emp.pin.toLowerCase().includes(query) ||
                emp.dept.toLowerCase().includes(query);
            const matchCadre = (selectedCadre === 'ALL') || (emp.cadre === selectedCadre);
            return matchSearch && matchCadre;
        });

        tbody.innerHTML = filtered.map(emp => `
      <tr>
        <td>
          <div class="emp-cell">
            <div class="emp-cell-avatar">${emp.name.split(' ').map(n => n[0]).join('')}</div>
            <strong>${emp.pin}</strong>
          </div>
        </td>
        <td><strong>${emp.name}</strong><br><small class="text-muted">${emp.gender === 'M' ? 'Male' : 'Female'}</small></td>
        <td>${emp.designation}</td>
        <td>${emp.dept}</td>
        <td><span class="badge badge-success">${emp.status}</span></td>
        <td><span class="badge ${emp.cadre === 'Permanent' ? 'badge-info' : 'badge-warning'}">${emp.cadre}</span></td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="EmployeeModule.viewProfile('${emp.pin}')">View Dossier</button>
        </td>
      </tr>
    `).join('');
    }

    function bindEvents() {
        searchInput?.addEventListener('input', renderTable);
        cadreFilter?.addEventListener('change', renderTable);

        document.getElementById('addNewEmployeeBtn')?.addEventListener('click', () => {
            openAddEmployeeModal();
        });
    }

    function openAddEmployeeModal() {
        const modalBody = `
      <form id="newEmpForm" style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label>Full Officer Name</label>
          <input type="text" class="form-control" id="m_empName" required placeholder="Dr. / Er. / Smt.">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label>Gender</label>
            <select class="form-control" id="m_empGender">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div>
            <label>Cadre Status</label>
            <select class="form-control" id="m_empCadre">
              <option value="Permanent">Permanent</option>
              <option value="Contractual">Contractual</option>
              <option value="Deputation">Deputation</option>
            </select>
          </div>
        </div>
        <div>
          <label>Department / Cell</label>
          <input type="text" class="form-control" id="m_empDept" required placeholder="e.g. Artificial Intelligence Group">
        </div>
        <div>
          <label>Basic Pay Scale (₹)</label>
          <input type="number" class="form-control" id="m_empBasic" required value="67700">
        </div>
        <button type="submit" class="btn btn-primary" style="margin-top:10px;">Save to Master Register</button>
      </form>
    `;
        MainApp.openModal('Register New Officer (e-Service Book Entry)', modalBody);

        document.getElementById('newEmpForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newPin = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
            const newEmp = {
                pin: newPin,
                name: document.getElementById('m_empName').value,
                gender: document.getElementById('m_empGender').value,
                cadre: document.getElementById('m_empCadre').value,
                designation: 'Officer Candidate',
                dept: document.getElementById('m_empDept').value,
                status: 'Active',
                basic: parseFloat(document.getElementById('m_empBasic').value)
            };

            AppState.addEmployee(newEmp);
            renderTable();
            MainApp.closeModal();
            NotificationsModule.dispatchAlert('SMS', `New cadre accession registered: ${newEmp.name} (PIN: ${newPin})`);
        });
    }

    function viewProfile(pin) {
        const emp = AppState.get('employees').find(e => e.pin === pin);
        if (!emp) return;

        const body = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="text-align:center;">
          <div class="emp-cell-avatar" style="width:54px; height:54px; font-size:18px; margin:0 auto 8px;">${emp.name[0]}</div>
          <h3>${emp.name}</h3>
          <p class="text-muted">${emp.designation} - ${emp.dept}</p>
        </div>
        <hr style="border:none; border-top:1px solid #e2e8f0;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px;">
          <div><strong>PIN:</strong> ${emp.pin}</div>
          <div><strong>Gender:</strong> ${emp.gender === 'M' ? 'Male' : 'Female'}</div>
          <div><strong>Tenure Cadre:</strong> ${emp.cadre}</div>
          <div><strong>Basic Scale:</strong> ₹${emp.basic.toLocaleString()}</div>
          <div><strong>PF / PRAN:</strong> PRAN-9921008432</div>
          <div><strong>Security Clearance:</strong> Level-III Confirmed</div>
        </div>
      </div>
    `;
        MainApp.openModal(`Service Record Dossier: ${pin}`, body);
    }

    return { init, viewProfile };
})();