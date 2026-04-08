const STORAGE_KEY = "college_department_portal_v1";

const state = {
  students: [],
  applications: [],
  courses: [],
  registrations: [],
  fees: []
};

const el = (id) => document.getElementById(id);

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  Object.assign(state, JSON.parse(saved));
}

function formatDate(d = new Date()) {
  return new Date(d).toLocaleDateString();
}

function tabSystem() {
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      el(btn.dataset.tab).classList.add("active");
    });
  });
}

function renderStats() {
  const paid = state.fees
    .filter((f) => f.status === "Paid")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const stats = [
    ["Students", state.students.length],
    ["Applications", state.applications.length],
    ["Courses", state.courses.length],
    ["Registrations", state.registrations.length],
    ["Fees Collected", `$${paid.toLocaleString()}`]
  ];

  el("stats").innerHTML = stats
    .map(([name, value]) => `<div class="stat"><small>${name}</small><strong>${value}</strong></div>`)
    .join("");
}

function populateStudentOptions() {
  const opts = ['<option value="">Select student</option>']
    .concat(state.students.map((s) => `<option value="${s.id}">${s.name}</option>`))
    .join("");
  ["appStudent", "regStudent", "feeStudent"].forEach((id) => {
    el(id).innerHTML = opts;
  });
}

function populateCourseOptions() {
  const opts = ['<option value="">Select course</option>']
    .concat(state.courses.map((c) => `<option value="${c.id}">${c.code} - ${c.title}</option>`))
    .join("");
  el("regCourse").innerHTML = opts;
}

function renderStudents() {
  el("studentRows").innerHTML = state.students
    .map(
      (s) => `<tr>
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${s.program}</td>
        <td>${s.phone}</td>
        <td>
          <button onclick="editStudent('${s.id}')" class="secondary">Edit</button>
          <button onclick="deleteStudent('${s.id}')">Delete</button>
        </td>
      </tr>`
    )
    .join("");
}

function renderApplications() {
  el("applicationRows").innerHTML = state.applications
    .map((a) => {
      const student = state.students.find((s) => s.id === a.studentId);
      return `<tr>
        <td>${student?.name || "Unknown"}</td>
        <td>${a.program}</td>
        <td>${a.score}</td>
        <td>${a.status}</td>
        <td>${a.remarks || "-"}</td>
      </tr>`;
    })
    .join("");
}

function renderCourses() {
  el("courseRows").innerHTML = state.courses
    .map((c) => {
      const enrolled = state.registrations.filter((r) => r.courseId === c.id).length;
      return `<tr>
        <td>${c.code}</td>
        <td>${c.title}</td>
        <td>${c.department}</td>
        <td>${c.credits}</td>
        <td>${c.seats}</td>
        <td>${enrolled}</td>
      </tr>`;
    })
    .join("");
}

function renderRegistrations() {
  el("registrationRows").innerHTML = state.registrations
    .map((r) => {
      const student = state.students.find((s) => s.id === r.studentId);
      const course = state.courses.find((c) => c.id === r.courseId);
      return `<tr>
        <td>${student?.name || "Unknown"}</td>
        <td>${course ? `${course.code} - ${course.title}` : "Unknown"}</td>
        <td>${r.semester}</td>
        <td>${r.date}</td>
      </tr>`;
    })
    .join("");
}

function renderFees() {
  el("feeRows").innerHTML = state.fees
    .map((f) => {
      const student = state.students.find((s) => s.id === f.studentId);
      return `<tr>
        <td>${student?.name || "Unknown"}</td>
        <td>$${Number(f.amount).toLocaleString()}</td>
        <td>${f.mode}</td>
        <td>${f.status}</td>
        <td>${f.date}</td>
      </tr>`;
    })
    .join("");
}

function renderReports() {
  const summary = [
    `Total Students: ${state.students.length}`,
    `Approved Applications: ${state.applications.filter((a) => a.status === "Approved").length}`,
    `Pending Applications: ${state.applications.filter((a) => a.status === "Pending").length}`,
    `Total Courses: ${state.courses.length}`,
    `Total Registrations: ${state.registrations.length}`,
    `Pending Fees: ${state.fees.filter((f) => f.status !== "Paid").length}`
  ];
  el("reportSummary").innerHTML = summary.map((item) => `<li>${item}</li>`).join("");
}

function rerender() {
  renderStats();
  populateStudentOptions();
  populateCourseOptions();
  renderStudents();
  renderApplications();
  renderCourses();
  renderRegistrations();
  renderFees();
  renderReports();
  saveState();
}

function editStudent(id) {
  const s = state.students.find((st) => st.id === id);
  if (!s) return;
  el("studentId").value = s.id;
  el("name").value = s.name;
  el("email").value = s.email;
  el("phone").value = s.phone;
  el("dob").value = s.dob;
  el("program").value = s.program;
  el("address").value = s.address;
}

function deleteStudent(id) {
  state.students = state.students.filter((s) => s.id !== id);
  state.applications = state.applications.filter((a) => a.studentId !== id);
  state.registrations = state.registrations.filter((r) => r.studentId !== id);
  state.fees = state.fees.filter((f) => f.studentId !== id);
  rerender();
}

window.editStudent = editStudent;
window.deleteStudent = deleteStudent;

function bindForms() {
  el("studentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = el("studentId").value || uid("stu");
    const payload = {
      id,
      name: el("name").value.trim(),
      email: el("email").value.trim(),
      phone: el("phone").value.trim(),
      dob: el("dob").value,
      program: el("program").value.trim(),
      address: el("address").value.trim()
    };

    const idx = state.students.findIndex((s) => s.id === id);
    if (idx >= 0) state.students[idx] = payload;
    else state.students.push(payload);

    e.target.reset();
    el("studentId").value = "";
    rerender();
  });

  el("resetStudent").addEventListener("click", () => {
    el("studentForm").reset();
    el("studentId").value = "";
  });

  el("applicationForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.applications.push({
      id: uid("app"),
      studentId: el("appStudent").value,
      program: el("appProgram").value.trim(),
      score: Number(el("appScore").value),
      status: el("appStatus").value,
      remarks: el("appRemarks").value.trim()
    });
    e.target.reset();
    rerender();
  });

  el("courseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.courses.push({
      id: uid("crs"),
      code: el("courseCode").value.trim().toUpperCase(),
      title: el("courseTitle").value.trim(),
      department: el("courseDept").value.trim(),
      credits: Number(el("courseCredits").value),
      seats: Number(el("courseSeats").value)
    });
    e.target.reset();
    rerender();
  });

  el("registrationForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const courseId = el("regCourse").value;
    const course = state.courses.find((c) => c.id === courseId);
    const current = state.registrations.filter((r) => r.courseId === courseId).length;
    if (course && current >= course.seats) {
      alert("No seats available for this course.");
      return;
    }

    state.registrations.push({
      id: uid("reg"),
      studentId: el("regStudent").value,
      courseId,
      semester: el("regSemester").value.trim(),
      date: formatDate()
    });
    e.target.reset();
    rerender();
  });

  el("feeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.fees.push({
      id: uid("fee"),
      studentId: el("feeStudent").value,
      amount: Number(el("feeAmount").value),
      mode: el("feeMode").value,
      status: el("feeStatus").value,
      date: formatDate()
    });
    e.target.reset();
    rerender();
  });

  el("seedDataBtn").addEventListener("click", seedDemoData);

  el("exportBtn").addEventListener("click", () => {
    const json = JSON.stringify(state, null, 2);
    el("exportPreview").textContent = json;

    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "college-department-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

function seedDemoData() {
  state.students = [
    { id: "stu_1", name: "Ava Johnson", email: "ava@example.com", phone: "555-1111", dob: "2007-05-14", program: "BSc Computer Science", address: "12 Oak Street" },
    { id: "stu_2", name: "Liam Brown", email: "liam@example.com", phone: "555-2222", dob: "2006-10-03", program: "BBA", address: "43 Lake View" }
  ];
  state.applications = [
    { id: "app_1", studentId: "stu_1", program: "BSc Computer Science", score: 89, status: "Approved", remarks: "Excellent in Math" },
    { id: "app_2", studentId: "stu_2", program: "BBA", score: 76, status: "Pending", remarks: "Awaiting interview" }
  ];
  state.courses = [
    { id: "crs_1", code: "CS101", title: "Intro to Programming", department: "CSE", credits: 4, seats: 40 },
    { id: "crs_2", code: "MGT201", title: "Principles of Management", department: "Business", credits: 3, seats: 35 }
  ];
  state.registrations = [
    { id: "reg_1", studentId: "stu_1", courseId: "crs_1", semester: "Fall 2026", date: formatDate() }
  ];
  state.fees = [
    { id: "fee_1", studentId: "stu_1", amount: 1500, mode: "Card", status: "Paid", date: formatDate() },
    { id: "fee_2", studentId: "stu_2", amount: 800, mode: "Bank Transfer", status: "Partial", date: formatDate() }
  ];
  rerender();
}

function init() {
  loadState();
  tabSystem();
  bindForms();
  rerender();
}

init();
