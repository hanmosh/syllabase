import type { Course as SearchCourse } from "./course-data";
import { defaultCourses } from "./course-data";
import {
  renderSidebar,
  saveCourses,
  setupSidebar,
  state,
  generateId,
  loadFolders,
  saveFolders,
  initCourses,
  showCoursePreviewModal,
} from "./courses";
import type { Folder, Course as SavedCourse } from "./courses";

let currentResults: SearchCourse[] = [];

export function renderResultsPage(department: string): void {
  const app = document.querySelector<HTMLDivElement>("#results-template");
  if (!app) {
    console.error("No #results-template in HTML");
    return;
  }

  const filteredData = defaultCourses.filter(
    (f: SearchCourse) => f.department.toLowerCase() === department.toLowerCase(),
  );
  currentResults = filteredData;

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

                <div id="results-database-wrapper">
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
                                    <tr data-course-id="${f.courseNumber}">
                                        <td>${f.department}</td>
                                        <td>${f.professor}</td>
                                        <td>${f.courseNumber}</td>
                                        <td>${f.courseName}</td>
                                        <td>${f.university}</td>
                                        <td>
                                            <i class="save-button fas fa-ribbon" data-course-id="${f.courseNumber}" style="font-size:20px; color:#02514c;"></i>
                                        </td>
                                    </tr>
                                `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    `;

  setupSidebar();

  const tableBody = app.querySelector<HTMLTableSectionElement>("tbody");
  const baseResults = filteredData;

  const renderTableRows = (coursesToRender: SearchCourse[]): void => {
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
        (t: SearchCourse) => `
            <tr data-course-id="${t.courseNumber}">
                <td>${t.department}</td>
                <td>${t.professor}</td>
                <td>${t.courseNumber}</td>
                <td>${t.courseName}</td>
                <td>${t.university}</td>
                <td>
                    <i class="save-button fas fa-ribbon" data-course-id="${t.courseNumber}" style="font-size:20px; color:#02514c;"></i>
                </td>
            </tr>
        `,
      )
      .join("");

    bindSaveButtons();
    attachResultsPreviewHandlers();
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
      currentResults = baseResults;
      return;
    }

    const filteredResults = baseResults.filter((course) =>
      course.courseName.toLowerCase().includes(query),
    );
    currentResults = filteredResults;
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

function buildPreviewCourse(courseData: SearchCourse): SavedCourse {
  return {
    id: `search-${courseData.courseNumber}`,
    courseName: { text: `${courseData.courseNumber} - ${courseData.courseName}` },
    professorName: { text: courseData.professor },
    assignments: {
      text: `Key focus areas:\n• Department: ${courseData.department}\n• University: ${courseData.university}`,
    },
    modules: {
      text: `Course Number: ${courseData.courseNumber}\nUniversity: ${courseData.university}`,
    },
    customFields: {
      Department: { text: courseData.department },
      "Course Number": { text: courseData.courseNumber },
      University: { text: courseData.university },
    },
    fromFolderSave: true,
  };
}

function attachResultsPreviewHandlers(): void {
  const rows = document.querySelectorAll<HTMLTableRowElement>(
    "#results-database tbody tr"
  );

  rows.forEach((row) => {
    row.addEventListener("click", (event) => {
      if ((event.target as HTMLElement).closest(".save-button")) return;

      const courseId = row.getAttribute("data-course-id");
      if (!courseId) return;

      const courseData = currentResults.find(
        (course) => course.courseNumber === courseId
      );
      if (!courseData) return;

      const previewCourse = buildPreviewCourse(courseData);
      showCoursePreviewModal(previewCourse);
    });
  });
}

function renderSaveOverlay(courseId: string): void {
  const overlay = document.createElement("div");
  overlay.id = "add-to-folder-overlay";
  overlay.className = "overlay";

  const getFolderOptions = (): string => {
    if (!state.folders.length) {
      return '<option value="">No folders yet</option>';
    }
    return state.folders
      .map((f) => `<option value="${f.id}">${f.name}</option>`)
      .join("");
  };

  overlay.innerHTML = `
        <div class="overlay-content">
            <h3>Save to Folder</h3>
            <hr>

            <label id="my-folders">My Folders</label>
            <select id="select-folder">
                ${getFolderOptions()}
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

    selectFolder.innerHTML = getFolderOptions();
    selectFolder.value = newFolder.id;
    newFolderName.value = "";
  });

  saveButton.addEventListener("click", () => {
    const folderId = selectFolder.value;
    const folder = state.folders.find((f) => f.id === folderId);
    if (!folder) {
      return;
    }

    let course = state.courses.find((c) => c.id === courseId);
    if (!course) {
      const courseData = currentResults.find(
        (c) => c.courseNumber === courseId,
      );
      if (courseData) {
        course = {
          id: courseId,
          courseName: { text: courseData.courseName },
          professorName: { text: courseData.professor },
          customFields: {
            Department: { text: courseData.department },
            CourseNumber: { text: courseData.courseNumber },
            University: { text: courseData.university },
          },
          fromFolderSave: true,
        };
        state.courses.push(course);
      }
    }

    if (!folder.courseIds.includes(courseId)) {
      folder.courseIds.push(courseId);
    }
    saveCourses();
    saveFolders();

    closeOverlay();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initCourses();
  loadFolders();

  const department = localStorage.getItem("selectedDepartment");
  if (department) {
    renderResultsPage(department);
  } else {
    console.warn("No department in localStorage - cannot render results");
  }
});
