import type { Course } from "./course-data";
import { defaultCourses } from "./course-data";
import { renderSidebar, setupSidebar } from "./courses"

export function renderResultsPage(department: string): void {
    const app = document.querySelector<HTMLDivElement>('#results-template');
    if (!app) {
        console.error("No #results-template in HTML");
        return;
    };

    const filteredData = defaultCourses.filter(
        (f: Course) => f.department.toLowerCase() === department.toLowerCase());

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
                        ${filteredData.map(
                            (f: any) => `
                                <tr>
                                    <td>${f.department}</td>
                                    <td>${f.professor}</td>
                                    <td>${f.courseNumber}</td>
                                    <td>${f.courseName}</td>
                                    <td>${f.university}</td>
                                    <td>
                                        <i id="save-button" class="fas fa-ribbon" style="font-size:20px; color:#086769;"></i>
                                    </td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>

                ${renderSaveOverlay()}
            </main>
        </div>
    `;

    setupSidebar();

    const resultsSearch = document.querySelector<HTMLFormElement>('#results-search');
    resultsSearch?.addEventListener('submit', (event) => {
        event.preventDefault();

        const input = (resultsSearch.querySelector('input[name="search"]') as HTMLInputElement).value.trim();
        const filteredData = defaultCourses.filter((f: Course) =>
            f.department.toLowerCase() === department.toLowerCase() && (
                f.professor.toLowerCase().includes(input.toLowerCase()) ||
                f.courseNumber.toLowerCase().includes(input) ||
                f.courseName.toLowerCase().includes(input.toLowerCase()) ||
                f.university.toLowerCase().includes(input.toLowerCase())
            )
        );

        const tableBody = app!.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = filteredData.map((t: any) => `
                <tr>
                    <td>${t.department}</td>
                    <td>${t.professor}</td>
                    <td>${t.courseNumber}</td>
                    <td>${t.courseName}</td>
                    <td>${t.university}</td>
                </tr>
            `).join('');
        }
    });
}

function renderSaveOverlay(): string {
    return `
        <div id="add-to-folder-overlay" class="overlay hidden">
            <div class="overlay-content">
                <h2>Save to Folder</h2>

                <label>My Folders</label>
                <select id="select-folder"></select>

                <div class="new-folder">
                    <input id="folder-name" placeholder="New Folder Name" />
                    <button><i class="fas fa-plus"></i></button>
                </div>

                <div class="actions">
                    <button id="cancel">Cancel</button>
                    <button id="save">Save</button>
                </div>
            </div>
        </div>
    `
}

function renderActionButtons() {
    const buttons = document.querySelectorAll<HTMLButtonElement>('#save-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const courseData = JSON.parse(button.dataset.course!);
            openOverlay(courseData);
        });
    });
}

let saveCourse: any = null;
function openOverlay(course: any) {
    saveCourse = course;

    const overlay = document.querySelector<HTMLDivElement>('#add-to-folder-overlay')!;
    overlay.classList.remove('hidden');
    
}

document.addEventListener("DOMContentLoaded", () => {
    const department = localStorage.getItem('selectedDepartment');
    console.log("Loaded dept:", department); 

    if (department) {
        renderResultsPage(department);
    } else {
        console.warn("No department in localStorage - cannot render results");
    }
});