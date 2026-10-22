
const API_URL = "/api/patients";
const MINUTES_PER_PATIENT = 15;

const patientForm = document.getElementById("patientForm");
const patientTableBody = document.getElementById("patientTableBody");
const refreshButton = document.getElementById("refreshButton");
const exportButton = document.getElementById("exportButton");

const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");
const doctorFilter = document.getElementById("doctorFilter");
const statusFilter = document.getElementById("statusFilter");

const formMessage = document.getElementById("formMessage");
const queueMessage = document.getElementById("queueMessage");

let allPatients = [];

const statusPriority = {
    WAITING: 1,
    IN_CONSULTATION: 2,
    COMPLETED: 3
};

function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("error", isError);
}

function calculateWaitingTimes(patients) {
    const waitingTimes = {};
    const groups = {};

    patients
        .filter(patient => patient.status === "WAITING")
        .forEach(patient => {
            const key = `${patient.department}|${patient.doctor}`;

            if (!groups[key]) {
                groups[key] = [];
            }

            groups[key].push(patient);
        });

    Object.values(groups).forEach(group => {
        group.sort((a, b) => {
            const queueA = a.queueNumber ?? Number.MAX_SAFE_INTEGER;
            const queueB = b.queueNumber ?? Number.MAX_SAFE_INTEGER;

            return queueA - queueB || a.id - b.id;
        });

        group.forEach((patient, index) => {
            waitingTimes[patient.id] = index * MINUTES_PER_PATIENT;
        });
    });

    return waitingTimes;
}

function updateDoctorOptions() {
    const selectedDoctor = doctorFilter.value;

    const doctors = [
        ...new Set(
            allPatients
                .map(patient => patient.doctor)
                .filter(doctor => doctor && doctor.trim())
        )
    ].sort((a, b) => a.localeCompare(b));

    doctorFilter.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All Doctors";
    doctorFilter.appendChild(allOption);

    doctors.forEach(doctor => {
        const option = document.createElement("option");
        option.value = doctor;
        option.textContent = doctor;
        doctorFilter.appendChild(option);
    });

    if (doctors.includes(selectedDoctor)) {
        doctorFilter.value = selectedDoctor;
    }
}

function getFilteredPatients() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedDepartment = departmentFilter.value;
    const selectedDoctor = doctorFilter.value;
    const selectedStatus = statusFilter.value;

    return allPatients.filter(patient => {
        const name = (patient.name || "").toLowerCase();
        const phone = String(patient.phone || "").toLowerCase();
        const doctor = (patient.doctor || "").toLowerCase();

        const matchesSearch =
            name.includes(searchTerm) ||
            phone.includes(searchTerm) ||
            doctor.includes(searchTerm);

        const matchesDepartment =
            !selectedDepartment ||
            patient.department === selectedDepartment;

        const matchesDoctor =
            !selectedDoctor ||
            patient.doctor === selectedDoctor;

        const matchesStatus =
            !selectedStatus ||
            patient.status === selectedStatus;

        return (
            matchesSearch &&
            matchesDepartment &&
            matchesDoctor &&
            matchesStatus
        );
    });
}

function sortPatients(patients) {
    return [...patients].sort((a, b) => {
        const priorityDifference =
            (statusPriority[a.status] || 99) -
            (statusPriority[b.status] || 99);

        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        const queueA = a.queueNumber ?? Number.MAX_SAFE_INTEGER;
        const queueB = b.queueNumber ?? Number.MAX_SAFE_INTEGER;

        return queueA - queueB || a.id - b.id;
    });
}

function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
}

function displayPatients() {
    patientTableBody.innerHTML = "";

    const filteredPatients = sortPatients(getFilteredPatients());
    const waitingTimes = calculateWaitingTimes(allPatients);

    if (filteredPatients.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 8;
        cell.textContent = allPatients.length === 0
            ? "No patients registered yet."
            : "No patients match your search or filters.";

        row.appendChild(cell);
        patientTableBody.appendChild(row);
        return;
    }

    filteredPatients.forEach(patient => {
        const row = document.createElement("tr");

        addCell(row, patient.queueNumber ?? "—");
        addCell(row, patient.name || "—");
        addCell(row, patient.age ?? "—");
        addCell(row, patient.department || "—");
        addCell(row, patient.doctor || "—");

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.textContent = (patient.status || "UNKNOWN")
            .replaceAll("_", " ");

        statusBadge.className =
            "status-badge " +
            (patient.status || "unknown").toLowerCase();

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        let waitText;

        if (patient.status === "WAITING") {
            const minutes = waitingTimes[patient.id] ?? 0;

            waitText = minutes === 0
                ? "Next (0 min)"
                : `${minutes} min`;
        } else if (patient.status === "IN_CONSULTATION") {
            waitText = "In consultation";
        } else {
            waitText = "Completed";
        }

        addCell(row, waitText);

        const actionsCell = document.createElement("td");

        if (patient.status === "WAITING") {
            const callButton = document.createElement("button");

            callButton.textContent = "Call Patient";
            callButton.className = "primary-button action-button";
            callButton.type = "button";
            callButton.addEventListener("click", () => {
                updatePatientStatus(patient.id, "call");
            });

            actionsCell.appendChild(callButton);
        } else if (patient.status === "IN_CONSULTATION") {
            const completeButton = document.createElement("button");

            completeButton.textContent = "Complete";
            completeButton.className = "primary-button action-button";
            completeButton.type = "button";
            completeButton.addEventListener("click", () => {
                updatePatientStatus(patient.id, "complete");
            });

            actionsCell.appendChild(completeButton);
        } else {
            actionsCell.textContent = "Finished";
        }

        row.appendChild(actionsCell);
        patientTableBody.appendChild(row);
    });
}

function updateStatistics() {
    document.getElementById("totalPatients").textContent =
        allPatients.length;

    document.getElementById("waitingPatients").textContent =
        allPatients.filter(p => p.status === "WAITING").length;

    document.getElementById("consultingPatients").textContent =
        allPatients.filter(p => p.status === "IN_CONSULTATION").length;

    document.getElementById("completedPatients").textContent =
        allPatients.filter(p => p.status === "COMPLETED").length;
}

async function loadPatients() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load patients.");
        }

        allPatients = await response.json();

        updateStatistics();
        updateDoctorOptions();
        displayPatients();

        showMessage(queueMessage, "");
    } catch (error) {
        showMessage(
            queueMessage,
            "Unable to load patients. Check that the backend is running.",
            true
        );
    }
}

patientForm.addEventListener("submit", async event => {
    event.preventDefault();

    const patient = {
        name: document.getElementById("name").value.trim(),
        age: Number(document.getElementById("age").value),
        phone: document.getElementById("phone").value.trim(),
        department: document.getElementById("department").value,
        doctor: document.getElementById("doctor").value.trim()
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(patient)
        });

        if (!response.ok) {
            throw new Error("Registration failed.");
        }

        patientForm.reset();

        showMessage(formMessage, "Patient registered successfully!");

        await loadPatients();
    } catch (error) {
        showMessage(
            formMessage,
            "Could not register patient. Please try again.",
            true
        );
    }
});

async function updatePatientStatus(patientId, action) {
    try {
        const response = await fetch(`${API_URL}/${patientId}/${action}`, {
            method: "PUT"
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Could not update patient status.");
        }

        showMessage(
            queueMessage,
            action === "call"
                ? "Patient called successfully."
                : "Consultation completed successfully."
        );

        await loadPatients();
    } catch (error) {
        showMessage(
            queueMessage,
            error.message || "Could not update patient status.",
            true
        );
    }
}

function csvEscape(value) {
    let text = String(value ?? "");

    // Prevent spreadsheet formula execution for text fields.
    if (/^[\s]*[=+\-@]/.test(text)) {
        text = "'" + text;
    }

    return `"${text.replace(/"/g, '""')}"`;
}

function exportPatientsToCSV() {
    const patients = sortPatients(getFilteredPatients());
    const waitingTimes = calculateWaitingTimes(allPatients);

    if (patients.length === 0) {
        showMessage(
            queueMessage,
            "There are no patients to export.",
            true
        );
        return;
    }

    const headers = [
        "Queue Number",
        "Patient Name",
        "Age",
        "Phone",
        "Department",
        "Doctor",
        "Status",
        "Estimated Wait"
    ];

    const rows = patients.map(patient => {
        let waitText;

        if (patient.status === "WAITING") {
            const minutes = waitingTimes[patient.id] ?? 0;
            waitText = minutes === 0 ? "Next (0 min)" : `${minutes} min`;
        } else if (patient.status === "IN_CONSULTATION") {
            waitText = "In consultation";
        } else {
            waitText = "Completed";
        }

        return [
            patient.queueNumber ?? "",
            patient.name ?? "",
            patient.age ?? "",
            patient.phone ?? "",
            patient.department ?? "",
            patient.doctor ?? "",
            patient.status ?? "",
            waitText
        ];
    });

    const csvContent = [
        headers.map(csvEscape).join(","),
        ...rows.map(row => row.map(csvEscape).join(","))
    ].join("\r\n");

    const blob = new Blob(
        ["\uFEFF", csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "carequeue-patients.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showMessage(
        queueMessage,
        `${patients.length} patient record(s) exported to CSV.`
    );
}

searchInput.addEventListener("input", displayPatients);
departmentFilter.addEventListener("change", displayPatients);
doctorFilter.addEventListener("change", displayPatients);
statusFilter.addEventListener("change", displayPatients);

refreshButton.addEventListener("click", loadPatients);
exportButton.addEventListener("click", exportPatientsToCSV);

loadPatients();
