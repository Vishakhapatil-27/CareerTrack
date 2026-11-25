
const API_URL = "https://careertrack-backend-cwsz.onrender.com/api/applications";

const jobForm = document.getElementById("jobForm");
const applicationList = document.getElementById("applicationList");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

let applications = [];
let editingId = null;

// Load applications from MongoDB
async function loadApplications() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to load applications");

        applications = await response.json();
        renderApplications();
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend. Please start the server.");
    }
}

// Set today's date
document.getElementById("date").value =
    new Date().toISOString().split("T")[0];

// Add or update application
jobForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const company = document.getElementById("company").value.trim();
    const role = document.getElementById("role").value.trim();
    const date = document.getElementById("date").value;
    const status = document.getElementById("status").value;
    const notes = document.getElementById("notes").value.trim();

    if (!company || !role || !date) {
        alert("Please fill all required fields.");
        return;
    }

    const applicationData = { company, role, date, status, notes };

    try {
        let response;

        if (editingId !== null) {
            response = await fetch(`${API_URL}/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(applicationData)
            });
        } else {
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(applicationData)
            });
        }

        if (!response.ok) throw new Error("Unable to save application");

        editingId = null;
        await loadApplications();
        resetForm();

    } catch (error) {
        console.error(error);
        alert("Could not save application.");
    }
});

// Reset form
function resetForm() {
    jobForm.reset();

    document.getElementById("date").value =
        new Date().toISOString().split("T")[0];

    document.getElementById("formTitle").textContent =
        "Add New Application";

    document.getElementById("submitButton").textContent =
        "Add Application";

    document.getElementById("cancelButton").hidden = true;
    editingId = null;
}

// Display applications
function renderApplications() {
    applicationList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = filterStatus.value;

    const filteredApplications = applications.filter(app => {
        const matchesSearch =
            app.company.toLowerCase().includes(searchText) ||
            app.role.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            app.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (filteredApplications.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No applications found.";
        applicationList.appendChild(message);
    }

    filteredApplications.forEach(app => {
        const card = document.createElement("div");
        card.className = "application-card";

        const heading = document.createElement("h3");
        heading.textContent = app.company;

        const roleText = document.createElement("p");
        roleText.textContent = "Role: " + app.role;

        const dateText = document.createElement("p");
        dateText.textContent = "Date: " + app.date.split("T")[0];

        const statusText = document.createElement("p");
        const statusBadge = document.createElement("span");
        statusBadge.className = "status " + app.status.toLowerCase();
        statusBadge.textContent = app.status;
        statusText.appendChild(statusBadge);

        const notesText = document.createElement("p");
        notesText.textContent = "Notes: " + (app.notes || "No notes");

        const buttons = document.createElement("div");
        buttons.className = "card-buttons";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.dataset.action = "edit";
        editButton.dataset.id = app._id;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = app._id;

        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);

        card.append(heading, roleText, dateText, statusText, notesText, buttons);
        applicationList.appendChild(card);
    });

    updateDashboard();
    updateAnalytics();
}

// Edit and delete
applicationList.addEventListener("click", async function(event) {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;

    if (!action || !id) return;

    const app = applications.find(item => item._id === id);
    if (!app) return;

    if (action === "edit") {
        document.getElementById("company").value = app.company;
        document.getElementById("role").value = app.role;
        document.getElementById("date").value = app.date.split("T")[0];
        document.getElementById("status").value = app.status;
        document.getElementById("notes").value = app.notes || "";

        editingId = id;

        document.getElementById("formTitle").textContent = "Edit Application";
        document.getElementById("submitButton").textContent = "Update Application";
        document.getElementById("cancelButton").hidden = false;

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (action === "delete") {
        if (confirm("Are you sure you want to delete this application?")) {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: "DELETE"
                });

                if (!response.ok) throw new Error("Delete failed");

                await loadApplications();

                if (editingId === id) resetForm();

            } catch (error) {
                console.error(error);
                alert("Could not delete application.");
            }
        }
    }
});

// Cancel edit
document.getElementById("cancelButton").addEventListener("click", resetForm);

// Search and filter
searchInput.addEventListener("input", renderApplications);
filterStatus.addEventListener("change", renderApplications);

// Dashboard
function updateDashboard() {
    document.getElementById("totalCount").textContent = applications.length;

    document.getElementById("interviewCount").textContent =
        applications.filter(app => app.status === "Interview").length;

    document.getElementById("offerCount").textContent =
        applications.filter(app => app.status === "Offer").length;

    document.getElementById("rejectedCount").textContent =
        applications.filter(app => app.status === "Rejected").length;
}

// Analytics
function updateAnalytics() {
    const total = applications.length;

    const offers = applications.filter(app => app.status === "Offer").length;

    const responses = applications.filter(app =>
        ["Interview", "Assessment", "Offer", "Rejected"].includes(app.status)
    ).length;

    const pending = applications.filter(app =>
        ["Applied", "Assessment"].includes(app.status)
    ).length;

    document.getElementById("successRate").textContent =
        total ? Math.round((offers / total) * 100) + "%" : "0%";

    document.getElementById("pendingCount").textContent = pending;

    document.getElementById("responseRate").textContent =
        total ? Math.round((responses / total) * 100) + "%" : "0%";
}

// Load data when page opens
loadApplications();
