
// Hospital Management System JavaScript
class HospitalManagementSystem {
    constructor() {
        this.beds = [];
        this.appointments = [];
        this.patients = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateSampleData();
        this.renderDashboard();
        this.renderBeds();
        this.renderAppointments();
        this.renderPatients();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    generateSampleData() {
        // Generate sample beds
        const departments = ['Emergency', 'ICU', 'General Ward', 'Pediatrics', 'Maternity'];
        const statuses = ['Available', 'Occupied', 'Maintenance'];
        
        for (let i = 1; i <= 150; i++) {
            const dept = departments[Math.floor(Math.random() * departments.length)];
            let status;
            
            // Create realistic distribution
            const rand = Math.random();
            if (rand < 0.3) status = 'Available';
            else if (rand < 0.9) status = 'Occupied';
            else status = 'Maintenance';

            this.beds.push({
                id: i,
                number: `${dept.substr(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
                department: dept,
                status: status,
                patient: status === 'Occupied' ? `Patient ${i}` : null,
                assignedDate: status === 'Occupied' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null
            });
        }

        // Generate sample appointments
        const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'];
        const appointmentTypes = ['Consultation', 'Follow-up', 'Surgery', 'Emergency', 'Routine Check'];
        
        for (let i = 1; i <= 50; i++) {
            const baseTime = new Date();
            baseTime.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
            
            this.appointments.push({
                id: i,
                patientName: `Patient ${i}`,
                doctor: doctors[Math.floor(Math.random() * doctors.length)],
                time: baseTime,
                type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
                status: Math.random() > 0.3 ? 'Scheduled' : 'Completed',
                urgent: Math.random() > 0.8
            });
        }

        // Generate sample patients
        const conditions = ['Hypertension', 'Diabetes', 'Pneumonia', 'Fracture', 'Post-Surgery', 'Cardiac Issue'];
        
        for (let i = 1; i <= 100; i++) {
            this.patients.push({
                id: i,
                name: `Patient ${i}`,
                age: 20 + Math.floor(Math.random() * 60),
                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                condition: conditions[Math.floor(Math.random() * conditions.length)],
                admissionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                room: this.beds.find(bed => bed.status === 'Occupied' && bed.patient === `Patient ${i}`)?.number || 'N/A'
            });
        }
    }

    renderDashboard() {
        const totalBeds = this.beds.length;
        const availableBeds = this.beds.filter(bed => bed.status === 'Available').length;
        const occupiedBeds = this.beds.filter(bed => bed.status === 'Occupied').length;
        const todayAppointments = this.appointments.filter(app => 
            app.time.toDateString() === new Date().toDateString()
        ).length;

        document.getElementById('totalBeds').textContent = totalBeds;
        document.getElementById('availableBeds').textContent = availableBeds;
        document.getElementById('occupiedBeds').textContent = occupiedBeds;
        document.getElementById('todayAppointments').textContent = todayAppointments;
    }

    renderBeds() {
        const bedGrid = document.getElementById('bedGrid');
        const departmentFilter = document.getElementById('departmentFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        let filteredBeds = this.beds;
        
        if (departmentFilter) {
            filteredBeds = filteredBeds.filter(bed => bed.department === departmentFilter);
        }
        
        if (statusFilter) {
            filteredBeds = filteredBeds.filter(bed => bed.status === statusFilter);
        }

        bedGrid.innerHTML = filteredBeds.map(bed => `
            <div class="bed-card ${bed.status.toLowerCase()}">
                <div class="bed-header">
                    <span class="bed-number">${bed.number}</span>
                    <span class="bed-status ${bed.status.toLowerCase()}">${bed.status}</span>
                </div>
                <div class="bed-info">
                    <div><strong>Department:</strong> ${bed.department}</div>
                    ${bed.patient ? `<div><strong>Patient:</strong> ${bed.patient}</div>` : ''}
                    ${bed.assignedDate ? `<div><strong>Assigned:</strong> ${bed.assignedDate.toLocaleDateString()}</div>` : ''}
                </div>
                <div class="bed-actions">
                    ${bed.status === 'Available' ? 
                        `<button class="btn btn-success" onclick="hms.assignBed(${bed.id})">Assign Bed</button>` :
                        bed.status === 'Occupied' ?
                        `<button class="btn btn-warning" onclick="hms.dischargeBed(${bed.id})">Discharge</button>` :
                        `<button class="btn btn-primary" onclick="hms.completeMaintenance(${bed.id})">Complete Maintenance</button>`
                    }
                    <button class="btn btn-primary" onclick="hms.editBed(${bed.id})">Edit</button>
                </div>
            </div>
        `).join('');
    }

    renderAppointments() {
        const appointmentQueue = document.getElementById('appointmentQueue');
        const todayAppointments = this.appointments.filter(app => 
            app.time.toDateString() === new Date().toDateString() && app.status === 'Scheduled'
        ).sort((a, b) => a.time - b.time);

        appointmentQueue.innerHTML = todayAppointments.map(appointment => `
            <div class="appointment-item ${appointment.urgent ? 'urgent' : ''}">
                <div class="appointment-info">
                    <div class="appointment-time">${appointment.time.toLocaleTimeString()}</div>
                    <div class="appointment-patient">${appointment.patientName}</div>
                    <div class="appointment-doctor">${appointment.doctor} - ${appointment.type}</div>
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-success" onclick="hms.completeAppointment(${appointment.id})">Complete</button>
                    <button class="btn btn-warning" onclick="hms.rescheduleAppointment(${appointment.id})">Reschedule</button>
                    <button class="btn btn-danger" onclick="hms.cancelAppointment(${appointment.id})">Cancel</button>
                </div>
            </div>
        `).join('');
    }

    renderPatients() {
        const patientList = document.getElementById('patientList');
        const searchTerm = document.getElementById('patientSearch').value.toLowerCase();
        
        let filteredPatients = this.patients;
        if (searchTerm) {
            filteredPatients = filteredPatients.filter(patient => 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.condition.toLowerCase().includes(searchTerm)
            );
        }

        patientList.innerHTML = filteredPatients.map(patient => `
            <div class="patient-item">
                <div class="patient-info">
                    <div class="patient-name">${patient.name}</div>
                    <div class="patient-details">
                        Age: ${patient.age} | Gender: ${patient.gender} | 
                        Condition: ${patient.condition} | 
                        Room: ${patient.room} | 
                        Admitted: ${patient.admissionDate.toLocaleDateString()}
                    </div>
                </div>
                <div class="patient-actions">
                    <button class="btn btn-primary" onclick="hms.viewPatient(${patient.id})">View</button>
                    <button class="btn btn-warning" onclick="hms.editPatient(${patient.id})">Edit</button>
                    <button class="btn btn-danger" onclick="hms.dischargePatient(${patient.id})">Discharge</button>
                </div>
            </div>
        `).join('');
    }

    // Bed Management Methods
    assignBed(bedId) {
        const bed = this.beds.find(b => b.id === bedId);
        if (bed) {
            bed.status = 'Occupied';
            bed.patient = `Patient ${Date.now()}`;
            bed.assignedDate = new Date();
            this.renderBeds();
            this.renderDashboard();
            this.showNotification('Bed assigned successfully!', 'success');
        }
    }

    dischargeBed(bedId) {
        const bed = this.beds.find(b => b.id === bedId);
        if (bed) {
            bed.status = 'Available';
            bed.patient = null;
            bed.assignedDate = null;
            this.renderBeds();
            this.renderDashboard();
            this.showNotification('Patient discharged successfully!', 'success');
        }
    }

    completeMaintenance(bedId) {
        const bed = this.beds.find(b => b.id === bedId);
        if (bed) {
            bed.status = 'Available';
            this.renderBeds();
            this.renderDashboard();
            this.showNotification('Maintenance completed!', 'success');
        }
    }

    editBed(bedId) {
        const bed = this.beds.find(b => b.id === bedId);
        if (bed) {
            this.showModal('Edit Bed', this.getBedForm(bed));
        }
    }

    // Appointment Management Methods
    completeAppointment(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (appointment) {
            appointment.status = 'Completed';
            this.renderAppointments();
            this.showNotification('Appointment completed!', 'success');
        }
    }

    rescheduleAppointment(appointmentId) {
        // In a real application, this would open a date/time picker
        this.showNotification('Reschedule functionality would open date/time picker', 'info');
    }

    cancelAppointment(appointmentId) {
        const appointmentIndex = this.appointments.findIndex(a => a.id === appointmentId);
        if (appointmentIndex > -1) {
            this.appointments.splice(appointmentIndex, 1);
            this.renderAppointments();
            this.renderDashboard();
            this.showNotification('Appointment cancelled!', 'warning');
        }
    }

    // Patient Management Methods
    viewPatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (patient) {
            this.showModal('Patient Details', this.getPatientDetails(patient));
        }
    }

    editPatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (patient) {
            this.showModal('Edit Patient', this.getPatientForm(patient));
        }
    }

    dischargePatient(patientId) {
        const patientIndex = this.patients.findIndex(p => p.id === patientId);
        if (patientIndex > -1) {
            const patient = this.patients[patientIndex];
            // Free up the bed
            const bed = this.beds.find(b => b.patient === patient.name);
            if (bed) {
                bed.status = 'Available';
                bed.patient = null;
                bed.assignedDate = null;
            }
            this.patients.splice(patientIndex, 1);
            this.renderPatients();
            this.renderBeds();
            this.renderDashboard();
            this.showNotification('Patient discharged successfully!', 'success');
        }
    }

    // Form Generation Methods
    getBedForm(bed = null) {
        const isEdit = bed !== null;
        return `
            <h3>${isEdit ? 'Edit' : 'Add'} Bed</h3>
            <form onsubmit="hms.${isEdit ? 'updateBed' : 'addBed'}(event)">
                ${isEdit ? `<input type="hidden" name="id" value="${bed.id}">` : ''}
                <div class="form-group">
                    <label>Bed Number:</label>
                    <input type="text" name="number" value="${isEdit ? bed.number : ''}" required>
                </div>
                <div class="form-group">
                    <label>Department:</label>
                    <select name="department" required>
                        <option value="">Select Department</option>
                        <option value="Emergency" ${isEdit && bed.department === 'Emergency' ? 'selected' : ''}>Emergency</option>
                        <option value="ICU" ${isEdit && bed.department === 'ICU' ? 'selected' : ''}>ICU</option>
                        <option value="General Ward" ${isEdit && bed.department === 'General Ward' ? 'selected' : ''}>General Ward</option>
                        <option value="Pediatrics" ${isEdit && bed.department === 'Pediatrics' ? 'selected' : ''}>Pediatrics</option>
                        <option value="Maternity" ${isEdit && bed.department === 'Maternity' ? 'selected' : ''}>Maternity</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status:</label>
                    <select name="status" required>
                        <option value="Available" ${isEdit && bed.status === 'Available' ? 'selected' : ''}>Available</option>
                        <option value="Occupied" ${isEdit && bed.status === 'Occupied' ? 'selected' : ''}>Occupied</option>
                        <option value="Maintenance" ${isEdit && bed.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Bed</button>
                </div>
            </form>
        `;
    }

    getPatientForm(patient = null) {
        const isEdit = patient !== null;
        return `
            <h3>${isEdit ? 'Edit' : 'Add'} Patient</h3>
            <form onsubmit="hms.${isEdit ? 'updatePatient' : 'addPatient'}(event)">
                ${isEdit ? `<input type="hidden" name="id" value="${patient.id}">` : ''}
                <div class="form-group">
                    <label>Name:</label>
                    <input type="text" name="name" value="${isEdit ? patient.name : ''}" required>
                </div>
                <div class="form-group">
                    <label>Age:</label>
                    <input type="number" name="age" value="${isEdit ? patient.age : ''}" required>
                </div>
                <div class="form-group">
                    <label>Gender:</label>
                    <select name="gender" required>
                        <option value="">Select Gender</option>
                        <option value="Male" ${isEdit && patient.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${isEdit && patient.gender === 'Female' ? 'selected' : ''}>Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Condition:</label>
                    <input type="text" name="condition" value="${isEdit ? patient.condition : ''}" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Patient</button>
                </div>
            </form>
        `;
    }

    getPatientDetails(patient) {
        return `
            <h3>Patient Details</h3>
            <div class="patient-details-view">
                <p><strong>Name:</strong> ${patient.name}</p>
                <p><strong>Age:</strong> ${patient.age}</p>
                <p><strong>Gender:</strong> ${patient.gender}</p>
                <p><strong>Condition:</strong> ${patient.condition}</p>
                <p><strong>Room:</strong> ${patient.room}</p>
                <p><strong>Admission Date:</strong> ${patient.admissionDate.toLocaleDateString()}</p>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-primary" onclick="closeModal()">Close</button>
            </div>
        `;
    }

    // Utility Methods
    showModal(title, content) {
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').style.display = 'block';
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 5px;
            z-index: 1001;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for HTML event handlers
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function filterBeds() {
    hms.renderBeds();
}

function searchPatients() {
    hms.renderPatients();
}

function showAddBedForm() {
    hms.showModal('Add New Bed', hms.getBedForm());
}

function showAddPatientForm() {
    hms.showModal('Add New Patient', hms.getPatientForm());
}

function showAddAppointmentForm() {
    hms.showNotification('Appointment scheduling form would be implemented here', 'info');
}

// Initialize the system when the page loads
let hms;
document.addEventListener('DOMContentLoaded', () => {
    hms = new HospitalManagementSystem();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
