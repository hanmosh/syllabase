import { renderSidebar, setupSidebar } from "./courses"

export function renderHomePage(): void {
    const app = document.querySelector<HTMLDivElement>('#search-page');
    
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
                <div id="main-search-bar">
                    <form id="department-search">
                        <input type="text" placeholder="Search for Department" name="search"/>
                        <button type="submit"><i class="fa fa-search"></i></button>
                    </form>
                </div>

                <div class="quick-search">
                    <h2>Quick Search:</h2>
                    <div class="quick-search-links">
                        <button class="quick-search-link" data-department="Architecture & Design">Architecture & Design</button>
                        <button class="quick-search-link" data-department="Business">Business</button>
                        <button class="quick-search-link" data-department="Computer Science">Computer Science</button>
                        <button class="quick-search-link" data-department="Engineering">Engineering</button>
                        <button class="quick-search-link" data-department="Environmental Science">Environmental Science</button>
                        <button class="quick-search-link" data-department="Liberal Arts">Liberal Arts</button>
                        <button class="quick-search-link" data-department="Mathematics">Mathematics</button>
                        <button class="quick-search-link" data-department="Science">Science</button>
                        <button class="quick-search-link" data-department="Social Science">Social Science</button>
                    </div>
                </div>
            </main>
        </div>
    `;

    setupSidebar();

    // QUICK SEARCH
    const quickSeachButtons = document.querySelectorAll<HTMLButtonElement>(".quick-search-link");
    quickSeachButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const department = button.dataset.department!;
            localStorage.setItem('selectedDepartment', department);
            window.location.href = "results.html";
        });
    });

    const departmentSearch = document.querySelector<HTMLFormElement>('#department-search');
    departmentSearch?.addEventListener('submit', (d) => {
        d.preventDefault();

        const input = (departmentSearch.querySelector('input[name="search"]') as HTMLInputElement).value.trim();
        if (input) {
            localStorage.setItem('selectedDepartment', input);
            window.location.href = "results.html";
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderHomePage();
});