import { renderSidebar, setupSidebar, initCourses, renderHeaderActions, setupHeaderChatButton } from "./courses";

function renderSyllabusPage(): void {
  const app = document.querySelector<HTMLDivElement>("#syllabus-page");
  if (!app) return;

  const source = localStorage.getItem("syllabusSource") || "Course";

  const learningObjectives = [
    "Critically evaluate user needs and translate them into interaction requirements [CSC 123]",
    "Produce low-fidelity prototypes and iterate using evidence-based design critiques [CSC 123]",
    "Conduct usability tests, synthesize findings, and communicate design implications [CSC 222]",
    "Collaborate in multidisciplinary teams to deliver polished interactive experiences [CSC 222 & 123]"
  ];

  const sourceLabel = source.includes("CSC")
    ? `${source} - Human Computer Interaction`
    : `${source} - Collaborative Syllabus`;

  app.innerHTML = `
    ${renderSidebar()}
    <div class="course-page">
      <header class="app-header">
        <a href="search.html"><h1 class="app-title">Syllabase</h1></a>
        ${renderHeaderActions()}
      </header>

      <main class="course-content">
        <div class="syllabus-wrapper">
          <div class="syllabus-header">
            <h2>${sourceLabel}</h2>
            <p>Learning objectives generated from CSC 123 and CSC 222</p>
          </div>
          <div class="syllabus-table">
            ${learningObjectives
              .map((objective, index) => `
              <div class="syllabus-row">
                <div class="syllabus-icons">
                  <button type="button" class="syllabus-icon-btn syllabus-check" data-row="${index}" aria-label="Mark objective ${index + 1} complete">✔</button>
                  <button type="button" class="syllabus-icon-btn syllabus-remove" data-row="${index}" aria-label="Remove objective ${index + 1}">✖</button>
                </div>
                <div class="syllabus-text">
                  <strong>Objective ${index + 1}</strong> — ${objective}
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
  setupHeaderChatButton({ contextName: sourceLabel, contextType: "course" });
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
