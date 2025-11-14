import type { Course } from "./course-data";
import { defaultCourses } from "./course-data";

export function renderResultsPage(department: string): void {
    const app = document.querySelector<HTMLDivElement>('#results-template');
    if (!app) return;

    const filteredData = defaultCourses.filter((f: Course) => f.department === department);

    app!.innerHTML = `
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
                            </tr>
                        `).join('')}
                </tbody>
            </table>
        </main>
    `;

    const resultsSearch = document.querySelector<HTMLFormElement>('#results-search');
    resultsSearch?.addEventListener('submit', (event) => {
        event.preventDefault();

        const input = (resultsSearch.querySelector('input[name="search"]') as HTMLInputElement).value.trim();
        const filteredData = defaultCourses.filter((f: Course) =>
            f.department === department && (
                f.professor.includes(input) ||
                f.courseNumber.includes(input) ||
                f.courseName.includes(input) ||
                f.university.includes(input)
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

document.addEventListener("DOMContentLoaded", () => {
    const department = localStorage.getItem('selectedDepartment');
    if (department) {
        renderResultsPage(department);
    } else {
        console.warn("No department in localStorage - cannot render results");
    }
});