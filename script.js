const attendanceClass = document.getElementById("attendanceClass");
const studentClass = document.getElementById("studentClass");
const attendanceDate = document.getElementById("attendanceDate");
const attendanceTable = document.getElementById("attendanceTable");
const studentsTable = document.getElementById("studentsTable");
const classesTable = document.getElementById("classesTable");
const logsTable = document.getElementById("logsTable");

let classes = [];
let students = [];
let attendanceStudents = [];

async function loadClasses() {
    const response = await fetch("/api/classes");

    if (!response.ok) {
        alert("Failed to load classes.");
        return;
    }

    classes = await response.json();

    attendanceClass.innerHTML =
        '<option value="">Select Class</option>';

    studentClass.innerHTML =
        '<option value="">Select Class</option>';

    classes.forEach(item => {
        const classText =
            `${item.class_name} - ${item.section}`;

        const attendanceOption =
            document.createElement("option");

        attendanceOption.value = item.id;
        attendanceOption.textContent = classText;

        attendanceClass.appendChild(attendanceOption);

        const studentOption =
            document.createElement("option");

        studentOption.value = item.id;
        studentOption.textContent = classText;

        studentClass.appendChild(studentOption);
    });

    displayClasses();
}

function displayClasses() {
    classesTable.innerHTML = "";

    classes.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.class_name}</td>
            <td>${item.section}</td>
            <td>${item.teacher_name}</td>
            <td>${item.room_number || ""}</td>
        `;

        classesTable.appendChild(row);
    });
}

async function loadStudents() {
    const response = await fetch("/api/students");

    if (!response.ok) {
        alert("Failed to load students.");
        return;
    }

    students = await response.json();

    displayStudents();
    updateDashboard();
}

function displayStudents() {
    studentsTable.innerHTML = "";

    students.forEach(student => {
        const classInfo = classes.find(
            item => item.id === student.class_id
        );

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.roll_number}</td>
            <td>${student.student_name}</td>
            <td>
                ${classInfo
                    ? classInfo.class_name + " - " + classInfo.section
                    : ""}
            </td>
            <td>${student.parent_name}</td>
            <td>${student.parent_phone}</td>
        `;

        studentsTable.appendChild(row);
    });
}

async function loadAttendance() {
    const classId = Number(attendanceClass.value);

    if (!classId) {
        alert("Please select a class.");
        return;
    }

    attendanceStudents =
        students.filter(student => student.class_id === classId);

    attendanceTable.innerHTML = "";

    attendanceStudents.forEach(student => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.roll_number}</td>

            <td>${student.student_name}</td>

            <td>${student.parent_name}</td>

            <td>${student.parent_phone}</td>

            <td>
                <select
                    class="attendance-status"
                    data-id="${student.id}"
                >
                    <option value="Present">
                        Present
                    </option>

                    <option value="Absent">
                        Absent
                    </option>
                </select>
            </td>

            <td>
                <input
                    type="text"
                    class="attendance-remarks"
                    data-id="${student.id}"
                    placeholder="Optional"
                >
            </td>
        `;

        attendanceTable.appendChild(row);
    });

    updateDashboard();
}

function markAllPresent() {
    document
        .querySelectorAll(".attendance-status")
        .forEach(select => {
            select.value = "Present";
        });

    updateDashboard();
}

function resetAttendance() {
    document
        .querySelectorAll(".attendance-status")
        .forEach(select => {
            select.value = "Present";
        });

    document
        .querySelectorAll(".attendance-remarks")
        .forEach(input => {
            input.value = "";
        });

    updateDashboard();
}

async function saveAttendance() {
    const date = attendanceDate.value;

    if (!date) {
        alert("Please select a date.");
        return;
    }

    if (attendanceStudents.length === 0) {
        alert("Please load students first.");
        return;
    }

    const statusInputs =
        document.querySelectorAll(".attendance-status");

    const remarkInputs =
        document.querySelectorAll(".attendance-remarks");

    for (let i = 0; i < statusInputs.length; i++) {
        const studentId =
            Number(statusInputs[i].dataset.id);

        const status =
            statusInputs[i].value;

        const remarks =
            remarkInputs[i].value.trim();

        const response = await fetch("/api/attendance", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                studentId: studentId,
                attendanceDate: date,
                status: status,
                remarks: remarks
            })
        });

        if (!response.ok) {
            alert("Failed to save attendance.");
            return;
        }
    }

    alert("Attendance saved successfully.");

    updateDashboard();
    loadLogs();
}

async function loadLogs() {
    const response = await fetch("/api/alerts");

    if (!response.ok) {
        return;
    }

    const logs = await response.json();

    logsTable.innerHTML = "";

    logs.forEach(log => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${log.created_at}</td>
            <td>${getStudentName(log.student_id)}</td>
            <td>${log.parent_phone}</td>
            <td>${log.alert_type}</td>
            <td>${log.status}</td>
            <td>${log.message}</td>
        `;

        logsTable.appendChild(row);
    });

    document.getElementById("totalAlerts").textContent =
        logs.length;
}

function getStudentName(studentId) {
    const student = students.find(
        item => item.id === studentId
    );

    return student ? student.student_name : "";
}

async function updateDashboard() {
    document.getElementById("totalStudents").textContent =
        students.length;

    let present = 0;
    let absent = 0;

    document
        .querySelectorAll(".attendance-status")
        .forEach(select => {
            if (select.value === "Present") {
                present++;
            }

            if (select.value === "Absent") {
                absent++;
            }
        });

    document.getElementById("presentStudents").textContent =
        present;

    document.getElementById("absentStudents").textContent =
        absent;
}

document
    .querySelectorAll(".nav-button")
    .forEach(button => {
        button.addEventListener("click", function () {

            document
                .querySelectorAll(".nav-button")
                .forEach(item => {
                    item.classList.remove("active");
                });

            document
                .querySelectorAll(".section")
                .forEach(section => {
                    section.classList.remove("active");
                });

            this.classList.add("active");

            const sectionId =
                this.dataset.section;

            document
                .getElementById(sectionId)
                .classList.add("active");
        });
    });

document
    .getElementById("loadAttendance")
    .addEventListener(
        "click",
        loadAttendance
    );

document
    .getElementById("markAllPresent")
    .addEventListener(
        "click",
        markAllPresent
    );

document
    .getElementById("resetAttendance")
    .addEventListener(
        "click",
        resetAttendance
    );

document
    .getElementById("saveAttendance")
    .addEventListener(
        "click",
        saveAttendance
    );

document
    .getElementById("studentForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const classId =
                Number(studentClass.value);

            const rollNumber =
                document
                    .getElementById("rollNumber")
                    .value
                    .trim();

            const name =
                document
                    .getElementById("studentName")
                    .value
                    .trim();

            const gender =
                document
                    .getElementById("studentGender")
                    .value;

            const parentName =
                document
                    .getElementById("parentName")
                    .value
                    .trim();

            const parentPhone =
                document
                    .getElementById("parentPhone")
                    .value
                    .trim();

            const parentEmail =
                document
                    .getElementById("parentEmail")
                    .value
                    .trim();

            if (
                !classId ||
                !rollNumber ||
                !name ||
                !parentName ||
                !parentPhone
            ) {
                alert("Please fill all required fields.");
                return;
            }

            const response = await fetch(
                "/api/students",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        classId: classId,
                        rollNumber: rollNumber,
                        name: name,
                        gender: gender,
                        parentName: parentName,
                        parentPhone: parentPhone,
                        parentEmail: parentEmail
                    })
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "Failed to add student."
                );

                return;
            }

            this.reset();

            await loadStudents();

            alert("Student added successfully.");
        }
    );

document
    .getElementById("classForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const className =
                document
                    .getElementById("gradeLevel")
                    .value;

            const section =
                document
                    .getElementById("sectionName")
                    .value
                    .trim();

            const teacherName =
                document
                    .getElementById("teacherName")
                    .value
                    .trim();

            const roomNumber =
                document
                    .getElementById("roomNumber")
                    .value
                    .trim();

            if (
                !className ||
                !section ||
                !teacherName
            ) {
                alert("Please fill all required fields.");
                return;
            }

            const response = await fetch(
                "/api/classes",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        className: className,
                        section: section,
                        teacherName: teacherName,
                        roomNumber: roomNumber
                    })
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "Failed to add class."
                );

                return;
            }

            this.reset();

            await loadClasses();

            alert("Class added successfully.");
        }
    );

attendanceDate.value =
    new Date().toISOString().split("T")[0];

async function startApplication() {
    await loadClasses();
    await loadStudents();
    await loadLogs();
}

startApplication();