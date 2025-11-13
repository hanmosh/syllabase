import type { Course } from "./course-data";
import { defaultCourses } from "./course-data";

export function renderHomePage(): void {
    const app = document.querySelector<HTMLDivElement>('#app');
    
    app!.innerHTML = `
        <main>
            <div id="main-search-bar">
                <form id="department-search">
                    <input type="text" placeholder="Search for Department" name="search"/>
                    <button type="submit"><i class="fa fa-search"></i></button>
                </form>
            </div>

            <div class="quick-search">
                <h2>Quick Search:</h2>
                <div class="quick-search-links">
                    <button class="quick-search-link" data-subject="design">Architecture & Design</button>
                    <button class="quick-search-link" data-subject="business">Business</button>
                    <button class="quick-search-link" data-subject="computer science">Computer Science</button>
                    <button class="quick-search-link" data-subject="engineering">Engineering</button>
                    <button class="quick-search-link" data-subject="environmental science">Environmental Sciences</button>
                    <button class="quick-search-link" data-subject="liberal arts">Liberal Arts</button>
                    <button class="quick-search-link" data-subject="mathematics">Mathematics</button>
                    <button class="quick-search-link" data-subject="science">Science</but
                </div>
            </div>
        </main>
    `;

    // QUICK SEARCH
    const quickSeachButtons = document.querySelectorAll<HTMLButtonElement>(".quick-search-link");
    quickSeachButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const department = button.dataset.department!;
            renderResultsPage(department);
        });
    });

    const departmentSearch = document.querySelector<HTMLFormElement>('#department-search');
    departmentSearch?.addEventListener('submit', (d) => {
        d.preventDefault();

        const input = (departmentSearch.querySelector('input[name="search"]') as HTMLInputElement).value.trim();
        if (input) {
            renderResultsPage(input);
        }
    });
}

export function renderResultsPage(department: string): void {
    const app = document.querySelector<HTMLDivElement>('#results-template');
    const filteredData = defaultCourses.filter((f: Course) => f.department === department);

    app!.innerHTML = `
        <main>
            <h2 id="resultsTitle">Results for ${department}</h2>

            <div class="sub-search-bar">
            <form id="results-search">
                <input type="text" placeholder="Search within ${department}" name="search" />
                <button type="submit"><i class="fa fa-search"></i></button>
            </form>
            </div>

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
    resultsSearch?.addEventListener('submit', (r) => {
        r.preventDefault();

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