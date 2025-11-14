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
                    <button class="quick-search-link" data-department="design">Architecture & Design</button>
                    <button class="quick-search-link" data-department="business">Business</button>
                    <button class="quick-search-link" data-department="computer science">Computer Science</button>
                    <button class="quick-search-link" data-department="engineering">Engineering</button>
                    <button class="quick-search-link" data-department="environmental science">Environmental Sciences</button>
                    <button class="quick-search-link" data-department="liberal arts">Liberal Arts</button>
                    <button class="quick-search-link" data-department="mathematics">Mathematics</button>
                    <button class="quick-search-link" data-department="science">Science</but
                </div>
            </div>
        </main>
    `;

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