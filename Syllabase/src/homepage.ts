import { renderSidebar, setupSidebar, initCourses, setCurrentPage } from "./courses"

export function renderHomePage(): void {
    const app = document.querySelector<HTMLDivElement>('#search-page')
    if (!app) return

    setCurrentPage("homepage")
    const quickSearchOptions = [
        'Architecture & Design',
        'Business',
        'Computer Science',
        'Engineering',
        'Environmental Science',
        'Liberal Arts',
        'Mathematics',
        'Science',
        'Social Science'
    ]
    
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

            <main>
                <div id="main-search-bar">
                    <form id="department-search">
                        <input type="text" placeholder="Search for Department" name="search"/>
                        <button type="submit"><i class="fa fa-search"></i></button>
                    </form>
                </div>

                <div class="quick-search">
                    <h2>Quick Search:</h2>
                    <div class="quick-search-links" id="quick-search-links"></div>
                </div>
            </main>
        </div>
    `;

    setupSidebar()

    const quickSearchContainer = document.querySelector<HTMLDivElement>('#quick-search-links')

    const renderQuickSearchButtons = (departments: string[]): void => {
        if (!quickSearchContainer) return

        if (departments.length === 0) {
            quickSearchContainer.innerHTML = '<p class="quick-search-empty">No departments match your search.</p>'
            return
        }

        quickSearchContainer.innerHTML = departments.map((department) => `
            <button class="quick-search-link" data-department="${department}">${department}</button>
        `).join('')

        quickSearchContainer.querySelectorAll<HTMLButtonElement>('.quick-search-link').forEach((button) => {
            button.addEventListener('click', () => {
                const department = button.dataset.department!
                localStorage.setItem('selectedDepartment', department)
                window.location.href = 'results.html'
            })
        })
    }

    const filterQuickSearch = (query: string): void => {
        const normalized = query.trim().toLowerCase()
        const filtered = normalized
            ? quickSearchOptions.filter((department) => department.toLowerCase().includes(normalized))
            : quickSearchOptions
        renderQuickSearchButtons(filtered)
    }

    renderQuickSearchButtons(quickSearchOptions)

    const departmentSearch = document.querySelector<HTMLFormElement>('#department-search')
    const departmentSearchInput = departmentSearch?.querySelector<HTMLInputElement>('input[name="search"]')

    departmentSearchInput?.addEventListener('input', () => {
        filterQuickSearch(departmentSearchInput.value)
    })

    departmentSearch?.addEventListener('submit', (d) => {
        d.preventDefault()

        const input = departmentSearchInput?.value.trim()
        if (input) {
            localStorage.setItem('selectedDepartment', input)
            window.location.href = 'results.html'
        }
    })
}

document.addEventListener('DOMContentLoaded', () => {
    initCourses()
    renderHomePage()
})
