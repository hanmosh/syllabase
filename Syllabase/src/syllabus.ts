import { renderSidebar, setupSidebar, initCourses } from "./courses";

function renderSyllabusPage(): void {
  const app = document.querySelector<HTMLDivElement>("#syllabus-page");
  if (!app) return;

  const source = localStorage.getItem("syllabusSource") || "Course";

  app.innerHTML = `
    ${renderSidebar()}
    <div class="course-page">
      <header class="app-header">
        <a href="search.html"><h1 class="app-title">Syllabase</h1></a>
        <button class="hamburger-menu" id="hamburger-menu">
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
        </button>
      </header>

      <main class="course-content">
        <div class="syllabus-wrapper">
          <div class="syllabus-header">
            <h2>${source} - Collaborative Syllabus</h2>
            <p>Generated overview of weekly checkpoints</p>
          </div>
          <div class="syllabus-table">
            ${["Week 1", "Week 3", "Week 5", "Week 7"].map((label, index) => `
              <div class="syllabus-row">
                <div class="syllabus-icons">
                  <button type="button" class="syllabus-icon-btn syllabus-check" data-row="${index}" aria-label="Mark ${label} complete">✔</button>
                  <button type="button" class="syllabus-icon-btn syllabus-remove" data-row="${index}" aria-label="Remove ${label}">✖</button>
                </div>
                <div class="syllabus-text">
                  <strong>${label}</strong> — Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. - ${String.fromCharCode(65 + index)}
                </div>
              </div>
            `).join("")}
          </div>
          <div class="syllabus-download">
            <button type="button" class="primary-btn" id="download-syllabus-btn">Download Syllabus</button>
          </div>
        </div>
      </main>
    </div>
  `;

  setupSidebar();
  setupSyllabusInteractions();
}

function setupSyllabusInteractions(): void {
  document.querySelectorAll<HTMLButtonElement>(".syllabus-check").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const iconGroup = (e.currentTarget as HTMLElement).closest(".syllabus-icons");
      iconGroup?.classList.add("syllabus-complete");
    });
  });

  document.querySelectorAll<HTMLButtonElement>(".syllabus-remove").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const row = (e.currentTarget as HTMLElement).closest(".syllabus-row");
      row?.remove();
    });
  });

  const downloadBtn = document.getElementById("download-syllabus-btn");
  downloadBtn?.addEventListener("click", () => {
    showDownloadToast();
  });
}

function showDownloadToast(): void {
  if (document.getElementById("download-toast")) return;

  const toast = document.createElement("div");
  toast.id = "download-toast";
  toast.className = "syllabus-download-toast";
  toast.innerHTML = `
    <div class="syllabus-download-toast-content">
      <p>Syllabus has been downloaded.</p>
      <button type="button" id="dismiss-toast-btn">×</button>
    </div>
  `;

  document.body.appendChild(toast);

  const close = () => toast.remove();
  document.getElementById("dismiss-toast-btn")?.addEventListener("click", close);
  setTimeout(close, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  initCourses();
  renderSyllabusPage();
});
