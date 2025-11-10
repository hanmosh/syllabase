import './style.css'

// Preset user credentials
const PRESET_USER = {
  name: 'Josh Hall',
  email: 'j@calpoly.edu',
  password: 'password123'
}

// State management
let isLoggedIn = false
let currentUser: { name: string; email: string } | null = null

// Render the login form
function renderLoginForm(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <h1>Welcome to Syllabase</h1>
        <p class="subtitle">Please sign in to continue</p>

        <form id="login-form" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div id="error-message" class="error-message"></div>

          <button type="submit" class="login-button">Sign In</button>
        </form>
      </div>
    </div>
  `

  setupLoginForm()
}

// Render the logged-in state
function renderLoggedInState(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="logged-in-container">
      <div class="success-card">
        <div class="success-icon">✓</div>
        <h1>Welcome back!</h1>
        <p class="user-info">You are now logged in as</p>
        <p class="user-name">${currentUser?.name}</p>
        <p class="user-email">${currentUser?.email}</p>
        <button id="logout-button" class="logout-button">Sign Out</button>
      </div>
    </div>
  `

  setupLogout()
}

// Handle login form submission
function setupLoginForm(): void {
  const form = document.querySelector<HTMLFormElement>('#login-form')!
  const errorMessage = document.querySelector<HTMLDivElement>('#error-message')!

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault()

    const formData = new FormData(form)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validate credentials
    if (email === PRESET_USER.email && password === PRESET_USER.password) {
      // Successful login
      isLoggedIn = true
      currentUser = {
        name: PRESET_USER.name,
        email: PRESET_USER.email
      }
      errorMessage.textContent = ''
      renderLoggedInState()
    } else {
      // Failed login
      errorMessage.textContent = 'Invalid email or password. Please try again.'
      form.reset()
    }
  })
}

// Handle logout
function setupLogout(): void {
  const logoutButton = document.querySelector<HTMLButtonElement>('#logout-button')!

  logoutButton.addEventListener('click', () => {
    isLoggedIn = false
    currentUser = null
    renderLoginForm()
  })
}

// Initialize the app
if (isLoggedIn) {
  renderLoggedInState()
} else {
  renderLoginForm()
}
