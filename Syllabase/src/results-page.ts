import type { Course } from "./course-data";
import { defaultCourses } from "./course-data";
import {
  renderSidebar,
  saveCourses,
  setupSidebar,
  state,
  generateId,
  loadFolders,
  saveFolders,
  loadCourses,
} from "./courses";
import type { Folder } from "./courses";

export function renderResultsPage(department: string): void {
  const app = document.querySelector<HTMLDivElement>("#results-template");
  if (!app) {
    console.error("No #results-template in HTML");
    return;
  }

  const filteredData = defaultCourses.filter(
    (f: Course) => f.department.toLowerCase() === department.toLowerCase(),
  );

  app!.innerHTML = `
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

            <main>
                <div id="sub-search-bar">
                    <form id="results-search">
                        <input type="text" placeholder="Search within ${department}" name="search" />
                        <button type="submit"><i class="fa fa-search"></i></button>
                    </form>
                </div>

                <h2 id="resultsTitle">Results for ${department}</h2>

                <table id="results-database">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Professor</th>
                            <th>Course Number</th>
                            <th>Course Name</th>
                            <th>University</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        ${filteredData
                          .map(
                            (f: any) => `
                                <tr>
                                    <td>${f.department}</td>
                                    <td>${f.professor}</td>
                                    <td>${f.courseNumber}</td>
                                    <td>${f.courseName}</td>
                                    <td>${f.university}</td>
                                    <td>
                                        <i class="save-button fas fa-ribbon" data-course-id="${f.courseNumber}" style="font-size:20px; color:#086769;"></i>
                                    </td>
                                </tr>
                            `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </main>
        </div>
    `;

  setupSidebar();

  const tableBody = app.querySelector<HTMLTableSectionElement>("tbody");
  const baseResults = filteredData;

  const renderTableRows = (coursesToRender: Course[]): void => {
    if (!tableBody) return;

    if (coursesToRender.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-results-row">No courses match your search.</td>
        </tr>
      `;
      bindSaveButtons();
      return;
    }

    tableBody.innerHTML = coursesToRender
      .map(
        (t: Course) => `
            <tr>
                <td>${t.department}</td>
                <td>${t.professor}</td>
                <td>${t.courseNumber}</td>
                <td>${t.courseName}</td>
                <td>${t.university}</td>
                <td>
                    <i class="save-button fas fa-ribbon" data-course-id="${t.courseNumber}" style="font-size:20px; color:#086769;"></i>
                </td>
            </tr>
        `,
      )
      .join("");

    bindSaveButtons();
  };

  renderTableRows(baseResults);

  const resultsSearch =
    document.querySelector<HTMLFormElement>("#results-search");
  const resultsSearchInput =
    resultsSearch?.querySelector<HTMLInputElement>('input[name="search"]');

  const handleResultsSearch = (): void => {
    const query = resultsSearchInput?.value.trim().toLowerCase() || "";
    if (!query) {
      renderTableRows(baseResults);
      return;
    }

    const filteredResults = baseResults.filter((course) =>
      course.courseName.toLowerCase().includes(query),
    );
    renderTableRows(filteredResults);
  };

  resultsSearchInput?.addEventListener("input", handleResultsSearch);

  resultsSearch?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleResultsSearch();
  });

}

function bindSaveButtons() {
  document
    .querySelectorAll<HTMLButtonElement>(".save-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const courseId = button.dataset.courseId!;
        renderSaveOverlay(courseId);
      });
    });
}

function renderSaveOverlay(courseId: string): void {
  const overlay = document.createElement("div");
  overlay.id = "add-to-folder-overlay";
  overlay.className = "overlay";

  overlay.innerHTML = `
        <div class="overlay-content">
            <h3>Save to Folder</h3>
            <hr>

            <label id="my-folders">My Folders</label>
            <select id="select-folder">
                ${state.folders.map((f) => `<option value="${f.id}">${f.name}</option>`).join("")}
            </select>

            <div class="new-folder">
                <input id="folder-name" type="text" placeholder="New Folder Name" />
                <button id="create-folder"><i class="fas fa-plus"></i></button>
            </div>

            <div class="actions">
                <button id="cancel">Cancel</button>
                <button id="save">Save</button>
            </div>
        </div>

    `;

  document.body.appendChild(overlay);

  const cancelButton = document.getElementById("cancel")!;
  const saveButton = document.getElementById("save")!;
  const createFolderButton = document.getElementById("create-folder")!;
  const selectFolder = document.getElementById(
    "select-folder",
  ) as HTMLSelectElement;
  const newFolderName = document.getElementById(
    "folder-name",
  ) as HTMLInputElement;
  const closeOverlay = () => overlay.remove();

  cancelButton?.addEventListener("click", closeOverlay);

  createFolderButton.addEventListener("click", () => {
    const folderName = newFolderName.value.trim();
    if (!folderName) {
      return;
    }

    const newFolder: Folder = {
      id: generateId(),
      name: folderName,
      courseIds: [],
    };

    state.folders.push(newFolder);
    saveCourses();
    saveFolders();

    selectFolder.innerHTML = state.folders
      .map((f) => `<option value="${f.id}">${f.name}</option>`)
      .join("");
    newFolderName.value = "";
  });

  saveButton.addEventListener("click", () => {
    const folderId = selectFolder.value;
    const folder = state.folders.find((f) => f.id === folderId);
    if (!folder) {
      return;
    }

    if (!folder.courseIds.includes(courseId)) {
      folder.courseIds.push(courseId);
      saveCourses();
      saveFolders();
    }

    closeOverlay();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadCourses();
  loadFolders();

  const department = localStorage.getItem("selectedDepartment");
  if (department) {
    renderResultsPage(department);
  } else {
    console.warn("No department in localStorage - cannot render results");
  }
});
