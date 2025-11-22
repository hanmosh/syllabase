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
            <button type="button" class="secondary-btn" id="undo-objective-btn" disabled>Undo Change</button>
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

type ObjectiveAction = RemoveAction | AcceptAction;

interface RemoveAction {
  type: "remove";
  row: HTMLDivElement;
  index: number;
}

interface AcceptAction {
  type: "accept";
  iconGroup: HTMLDivElement;
}

function setupSyllabusInteractions(): void {
  const objectiveTable = document.querySelector<HTMLDivElement>(".syllabus-table");
  const undoBtn = document.querySelector<HTMLButtonElement>("#undo-objective-btn");

  if (!objectiveTable || !undoBtn) return;

  const actionHistory: ObjectiveAction[] = [];

  const updateUndoButton = () => {
    undoBtn.disabled = actionHistory.length === 0;
  };

  const updateObjectiveNumbers = () => {
    objectiveTable.querySelectorAll<HTMLDivElement>(".syllabus-row").forEach((row, idx) => {
      const label = row.querySelector("strong");
      if (label) {
        label.textContent = `Objective ${idx + 1}`;
      }
      row.querySelector<HTMLButtonElement>(".syllabus-check")?.setAttribute(
        "aria-label",
        `Mark objective ${idx + 1} complete`
      );
      row.querySelector<HTMLButtonElement>(".syllabus-remove")?.setAttribute(
        "aria-label",
        `Remove objective ${idx + 1}`
      );
    });
  };

  const removeRow = (row: HTMLDivElement) => {
    const rows = Array.from(objectiveTable.children);
    const rowIndex = rows.indexOf(row);
    if (rowIndex === -1) return;

    row.remove();
    actionHistory.push({ type: "remove", row, index: rowIndex });
    updateObjectiveNumbers();
    updateUndoButton();
  };

  objectiveTable.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const checkBtn = target.closest<HTMLButtonElement>(".syllabus-check");
    if (checkBtn) {
      const iconGroup = checkBtn.closest<HTMLDivElement>(".syllabus-icons");
      if (iconGroup && !iconGroup.classList.contains("syllabus-complete")) {
        iconGroup.classList.add("syllabus-complete");
        actionHistory.push({ type: "accept", iconGroup });
        updateUndoButton();
      }
      return;
    }

    const removeBtn = target.closest<HTMLButtonElement>(".syllabus-remove");
    if (removeBtn) {
      const row = removeBtn.closest<HTMLDivElement>(".syllabus-row");
      if (row) {
        removeRow(row);
      }
    }
  });

  undoBtn.addEventListener("click", () => {
    const lastAction = actionHistory.pop();
    if (!lastAction) return;

    if (lastAction.type === "remove") {
      const insertBeforeRow = objectiveTable.children[lastAction.index] ?? null;
      objectiveTable.insertBefore(lastAction.row, insertBeforeRow);
      updateObjectiveNumbers();
      lastAction.row
        .querySelector<HTMLDivElement>(".syllabus-icons")
        ?.classList.remove("syllabus-complete");
    } else if (lastAction.type === "accept") {
      lastAction.iconGroup.classList.remove("syllabus-complete");
    }

    updateUndoButton();
  });

  const downloadBtn = document.getElementById("download-syllabus-btn");
  downloadBtn?.addEventListener("click", () => {
    showDownloadToast();
  });

  updateObjectiveNumbers();
  updateUndoButton();
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
