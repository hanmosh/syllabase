import { handleLogout } from './main'

export interface UploadedFile {
  name: string
  data: string // base64 encoded
  type: string
  size: number
}

export interface FieldData {
  text?: string
  files?: UploadedFile[]
}

export interface Course {
  id: string
  professorName?: FieldData
  courseName?: FieldData
  modules?: FieldData
  assignments?: FieldData
  files?: FieldData
  customFields?: { [key: string]: FieldData }
  folderId?: string // Optional folder assignment
}

export interface Folder {
  id: string
  name: string
  courseIds: string[]
}

export interface CourseState {
  courses: Course[]
  folders: Folder[]
  editingCourseId?: string
  currentPage: 'courses' | 'folders'
}

// State management
let state: CourseState = {
  courses: [],
  folders: [],
  editingCourseId: undefined,
  currentPage: 'courses'
}

// Get current user name and profile picture
let currentUserName = 'Josh Hall'
let currentUserProfilePic: string | null = null

export function setCurrentUser(name: string): void {
  currentUserName = name
  loadProfilePicture()
}

// Load profile picture from localStorage
function loadProfilePicture(): void {
  const stored = localStorage.getItem('syllabase-profile-pic')
  if (stored) {
    currentUserProfilePic = stored
  }
}

// Save profile picture to localStorage
function saveProfilePicture(base64Image: string): void {
  currentUserProfilePic = base64Image
  localStorage.setItem('syllabase-profile-pic', base64Image)
}

// Handle profile picture upload
function handleProfilePictureUpload(file: File): void {
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const base64Data = e.target?.result as string
    saveProfilePicture(base64Data)
    // Re-render to show new profile picture
    if (state.currentPage === 'courses') {
      renderPublishedCoursesPage()
    } else if (state.currentPage === 'folders') {
      renderFoldersPage()
    }
  }
  reader.readAsDataURL(file)
}

// Load courses from localStorage
export function loadCourses(): void {
  const stored = localStorage.getItem('syllabase-courses')
  if (stored) {
    try {
      const loadedState = JSON.parse(stored)
      state = {
        ...loadedState,
        currentPage: loadedState.currentPage || 'courses',
        folders: loadedState.folders || []
      }
    } catch (e) {
      console.error('Error loading courses:', e)
    }
  }
  loadProfilePicture()
}

// Save courses to localStorage
export function saveCourses(): void {
  localStorage.setItem('syllabase-courses', JSON.stringify(state))
}

// Render sidebar navigation
function renderSidebar(): string {
  return `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-user-icon-wrapper">
          <div class="sidebar-user-icon" id="sidebar-user-icon">
            ${currentUserProfilePic 
              ? `<img src="${currentUserProfilePic}" alt="Profile" class="profile-picture" />`
              : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="default-profile-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>`
            }
          </div>
          <div class="profile-edit-overlay" id="profile-edit-trigger">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="edit-icon">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
          <input type="file" id="profile-pic-input" accept="image/*" style="display: none;" />
        </div>
        <div class="sidebar-user-greeting">Hello, ${currentUserName}</div>
      </div>
      
      <div class="sidebar-menu">
        <button class="sidebar-menu-item ${state.currentPage === 'courses' ? 'active' : ''}" data-page="courses">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="menu-icon">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
          </svg>
          My Courses
        </button>
        
        <button class="sidebar-menu-item ${state.currentPage === 'folders' ? 'active' : ''}" data-page="folders">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="menu-icon">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
          </svg>
          My Folders
        </button>
      </div>
      
      <div class="sidebar-footer">
        <button class="sidebar-logout-btn" id="sidebar-logout-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="menu-icon">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Log Out
        </button>
      </div>
    </nav>
  `
}

// Toggle sidebar
function toggleSidebar(): void {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('sidebar-overlay')
  
  if (sidebar && overlay) {
    const isOpen = sidebar.classList.contains('open')
    
    if (isOpen) {
      sidebar.classList.remove('open')
      overlay.classList.remove('open')
    } else {
      sidebar.classList.add('open')
      overlay.classList.add('open')
    }
  }
}

// Close sidebar
function closeSidebar(): void {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('sidebar-overlay')
  
  if (sidebar && overlay) {
    sidebar.classList.remove('open')
    overlay.classList.remove('open')
  }
}

// Setup sidebar handlers
function setupSidebar(): void {
  const hamburger = document.getElementById('hamburger-menu')
  const overlay = document.getElementById('sidebar-overlay')
  const menuItems = document.querySelectorAll('.sidebar-menu-item')
  const logoutBtn = document.getElementById('sidebar-logout-btn')
  const userIcon = document.getElementById('sidebar-user-icon')
  const profilePicInput = document.getElementById('profile-pic-input') as HTMLInputElement
  
  hamburger?.addEventListener('click', toggleSidebar)
  overlay?.addEventListener('click', closeSidebar)
  
  // Handle profile picture upload
  userIcon?.addEventListener('click', () => {
    profilePicInput?.click()
  })
  
  profilePicInput?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      handleProfilePictureUpload(file)
    }
  })
  
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const page = (e.currentTarget as HTMLElement).getAttribute('data-page') as 'courses' | 'folders'
      state.currentPage = page
      closeSidebar()
      
      if (page === 'courses') {
        renderPublishedCoursesPage()
      } else if (page === 'folders') {
        renderFoldersPage()
      }
    })
  })
  
  logoutBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      handleLogout()
    }
  })
}

// Helper to render a form field with file upload
function renderFieldWithUpload(
  fieldName: string,
  label: string,
  fieldData: FieldData | undefined,
  inputType: 'input' | 'textarea' = 'input'
): string {
  const textValue = fieldData?.text || ''
  const files = fieldData?.files || []
  const fieldId = fieldName.toLowerCase().replace(/\s+/g, '-')

  return `
    <div class="form-field-with-upload" data-field-name="${fieldName}">
      <label for="${fieldId}">${label}</label>
      ${inputType === 'textarea'
        ? `<textarea
            id="${fieldId}"
            name="${fieldName}"
            placeholder="Enter ${label.toLowerCase()} (optional)"
            rows="3"
          >${textValue}</textarea>`
        : `<input
            type="text"
            id="${fieldId}"
            name="${fieldName}"
            placeholder="Enter ${label.toLowerCase()} (optional)"
            value="${textValue}"
          />`
      }
      <div class="file-upload-section">
        <input
          type="file"
          accept="application/pdf"
          class="file-input"
          id="file-${fieldId}"
          data-field-name="${fieldName}"
          multiple
          style="display: none;"
        />
        <button type="button" class="upload-file-btn" data-field-id="file-${fieldId}">
          📎 Upload PDF${files.length > 0 ? 's' : ''}
        </button>
        <div class="uploaded-files-list" data-field-name="${fieldName}">
          ${files.map((file, index) => `
            <div class="uploaded-file-item" data-file-index="${index}">
              <span class="file-name" title="${file.name}">${file.name}</span>
              <span class="file-size">${formatFileSize(file.size)}</span>
              <button type="button" class="view-file-btn" data-field-name="${fieldName}" data-file-index="${index}">View</button>
              <button type="button" class="remove-file-btn" data-field-name="${fieldName}" data-file-index="${index}">×</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Render the new course page
export function renderNewCoursePage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!

  // Load existing course data if editing
  const editingCourse = state.editingCourseId
    ? state.courses.find(c => c.id === state.editingCourseId)
    : null

  app.innerHTML = `
    ${renderSidebar()}
    <div class="course-page">
      <header class="app-header">
        <button class="hamburger-menu" id="hamburger-menu">
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
        </button>
        <h1 class="app-title">Syllabase</h1>
      </header>

      <main class="course-content">
        <div class="course-form-container">
          <div class="course-form-header">
            <button type="button" id="back-btn" class="back-btn">← Back</button>
            <h2>${editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
            ${editingCourse ? '<p class="form-subtitle">Make changes to your course and click publish to save</p>' : '<p class="form-subtitle">Fill in the details below to publish a new course</p>'}
          </div>

          <form id="course-form" class="course-form">
            ${renderFieldWithUpload('professorName', 'Professor Name', editingCourse?.professorName, 'input')}
            ${renderFieldWithUpload('courseName', 'Course Name', editingCourse?.courseName, 'input')}
            ${renderFieldWithUpload('modules', 'Modules', editingCourse?.modules, 'textarea')}
            ${renderFieldWithUpload('assignments', 'Assignments', editingCourse?.assignments, 'textarea')}
            ${renderFieldWithUpload('files', 'Files', editingCourse?.files, 'textarea')}

            <div id="custom-fields-container">
              ${renderCustomFields(editingCourse?.customFields || {})}
            </div>

            <button type="button" id="add-field-btn" class="add-field-btn">
              + Add Custom Field
            </button>

            <div class="form-actions">
              <button type="button" id="view-courses-btn" class="secondary-btn">View My Courses</button>
              <button type="submit" class="publish-btn">
                ${editingCourse ? 'Update Course' : 'Publish Course'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `

  setupSidebar()
  setupCourseForm()
}

// Render custom fields
function renderCustomFields(customFields: { [key: string]: FieldData }): string {
  return Object.entries(customFields)
    .map(([key, fieldData], index) => {
      const textValue = fieldData?.text || ''
      const files = fieldData?.files || []

      return `
        <div class="custom-field" data-field-index="${index}">
          <div class="custom-field-header">
            <input
              type="text"
              class="custom-field-name"
              placeholder="Field name"
              value="${key}"
              data-field-index="${index}"
            />
            <button type="button" class="remove-custom-field-btn" data-field-index="${index}">Remove Field</button>
          </div>
          <div class="form-field-with-upload" data-field-name="custom-${index}">
            <textarea
              class="custom-field-value"
              placeholder="Field value"
              data-field-index="${index}"
              rows="3"
            >${textValue}</textarea>
            <div class="file-upload-section">
              <input
                type="file"
                accept="application/pdf"
                class="file-input custom-file-input"
                id="file-custom-${index}"
                data-field-index="${index}"
                multiple
                style="display: none;"
              />
              <button type="button" class="upload-file-btn" data-field-id="file-custom-${index}">
                📎 Upload PDF${files.length > 0 ? 's' : ''}
              </button>
              <div class="uploaded-files-list" data-field-index="${index}">
                ${files.map((file, fileIndex) => `
                  <div class="uploaded-file-item" data-file-index="${fileIndex}">
                    <span class="file-name" title="${file.name}">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                    <button type="button" class="view-file-btn custom-view" data-field-index="${index}" data-file-index="${fileIndex}">View</button>
                    <button type="button" class="remove-file-btn custom-remove" data-field-index="${index}" data-file-index="${fileIndex}">×</button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `
    })
    .join('')
}

// Setup course form handlers
function setupCourseForm(): void {
  const form = document.querySelector<HTMLFormElement>('#course-form')!
  const addFieldBtn = document.querySelector<HTMLButtonElement>('#add-field-btn')!
  const viewCoursesBtn = document.querySelector<HTMLButtonElement>('#view-courses-btn')!
  const backBtn = document.querySelector<HTMLButtonElement>('#back-btn')!

  // Handle back button click
  backBtn.addEventListener('click', () => {
    state.editingCourseId = undefined
    renderPublishedCoursesPage()
  })

  // Handle form submission
  form.addEventListener('submit', (e: Event) => {
    e.preventDefault()
    handlePublishCourse()
  })

  // Setup file uploads
  setupFileUploads()

  // Handle add custom field
  addFieldBtn.addEventListener('click', () => {
    addCustomField()
  })

  // Handle remove custom fields
  document.querySelectorAll('.remove-custom-field-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement
      const field = target.closest('.custom-field')
      field?.remove()
    })
  })

  // Handle view courses button
  viewCoursesBtn.addEventListener('click', () => {
    state.editingCourseId = undefined
    renderPublishedCoursesPage()
  })
}

// Setup file upload handlers
function setupFileUploads(): void {
  // Handle upload button clicks
  document.querySelectorAll('.upload-file-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement
      const fileInputId = target.getAttribute('data-field-id')
      if (fileInputId) {
        const fileInput = document.getElementById(fileInputId) as HTMLInputElement
        fileInput?.click()
      }
    })
  })

  // Handle file input changes
  document.querySelectorAll('.file-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement
      const files = target.files
      if (files && files.length > 0) {
        await handleFileUpload(target, files)
      }
    })
  })

  // Handle view file buttons
  document.querySelectorAll('.view-file-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement
      handleViewFile(target)
    })
  })

  // Handle remove file buttons
  document.querySelectorAll('.remove-file-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement
      handleRemoveFile(target)
    })
  })
}

// Handle file upload
async function handleFileUpload(input: HTMLInputElement, files: FileList): Promise<void> {
  const fieldName = input.getAttribute('data-field-name')
  const fieldIndex = input.getAttribute('data-field-index')

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    // Validate PDF
    if (file.type !== 'application/pdf') {
      alert(`${file.name} is not a PDF file. Only PDF files are allowed.`)
      continue
    }

    // Read file as base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Data = e.target?.result as string
      const uploadedFile: UploadedFile = {
        name: file.name,
        data: base64Data,
        type: file.type,
        size: file.size
      }

      // Add file to the UI
      addFileToUI(fieldName, fieldIndex, uploadedFile)
    }
    reader.readAsDataURL(file)
  }

  // Clear the input
  input.value = ''
}

// Add file to UI
function addFileToUI(fieldName: string | null, fieldIndex: string | null, file: UploadedFile): void {
  let filesList: HTMLElement | null

  if (fieldIndex !== null) {
    // Custom field
    filesList = document.querySelector(`.uploaded-files-list[data-field-index="${fieldIndex}"]`)
  } else if (fieldName) {
    // Standard field
    filesList = document.querySelector(`.uploaded-files-list[data-field-name="${fieldName}"]`)
  } else {
    return
  }

  if (!filesList) return

  const fileItems = filesList.querySelectorAll('.uploaded-file-item')
  const newIndex = fileItems.length

  const fileElement = document.createElement('div')
  fileElement.className = 'uploaded-file-item'
  fileElement.setAttribute('data-file-index', newIndex.toString())
  fileElement.setAttribute('data-file-data', file.data)
  fileElement.innerHTML = `
    <span class="file-name" title="${file.name}">${file.name}</span>
    <span class="file-size">${formatFileSize(file.size)}</span>
    <button type="button" class="view-file-btn ${fieldIndex !== null ? 'custom-view' : ''}" ${fieldIndex !== null ? `data-field-index="${fieldIndex}"` : `data-field-name="${fieldName}"`} data-file-index="${newIndex}">View</button>
    <button type="button" class="remove-file-btn ${fieldIndex !== null ? 'custom-remove' : ''}" ${fieldIndex !== null ? `data-field-index="${fieldIndex}"` : `data-field-name="${fieldName}"`} data-file-index="${newIndex}">×</button>
  `

  filesList.appendChild(fileElement)

  // Add event listeners to new buttons
  const viewBtn = fileElement.querySelector('.view-file-btn')
  const removeBtn = fileElement.querySelector('.remove-file-btn')

  viewBtn?.addEventListener('click', (e) => {
    handleViewFile(e.target as HTMLButtonElement)
  })

  removeBtn?.addEventListener('click', (e) => {
    handleRemoveFile(e.target as HTMLButtonElement)
  })
}

// Handle view file
function handleViewFile(btn: HTMLButtonElement): void {
  const fileItem = btn.closest('.uploaded-file-item') as HTMLElement
  const fileData = fileItem?.getAttribute('data-file-data')

  if (fileData) {
    // Open PDF in new tab
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>PDF Viewer</title></head>
          <body style="margin:0">
            <embed src="${fileData}" type="application/pdf" width="100%" height="100%" />
          </body>
        </html>
      `)
    }
  }
}

// Handle remove file
function handleRemoveFile(btn: HTMLButtonElement): void {
  const fileItem = btn.closest('.uploaded-file-item')
  fileItem?.remove()
}

// Add custom field
function addCustomField(): void {
  const container = document.querySelector('#custom-fields-container')!
  const fieldCount = container.querySelectorAll('.custom-field').length

  const newField = document.createElement('div')
  newField.className = 'custom-field'
  newField.setAttribute('data-field-index', fieldCount.toString())
  newField.innerHTML = `
    <div class="custom-field-header">
      <input
        type="text"
        class="custom-field-name"
        placeholder="Field name"
        value=""
        data-field-index="${fieldCount}"
      />
      <button type="button" class="remove-custom-field-btn" data-field-index="${fieldCount}">Remove Field</button>
    </div>
    <div class="form-field-with-upload" data-field-name="custom-${fieldCount}">
      <textarea
        class="custom-field-value"
        placeholder="Field value"
        data-field-index="${fieldCount}"
        rows="3"
      ></textarea>
      <div class="file-upload-section">
        <input
          type="file"
          accept="application/pdf"
          class="file-input custom-file-input"
          id="file-custom-${fieldCount}"
          data-field-index="${fieldCount}"
          multiple
          style="display: none;"
        />
        <button type="button" class="upload-file-btn" data-field-id="file-custom-${fieldCount}">
          📎 Upload PDFs
        </button>
        <div class="uploaded-files-list" data-field-index="${fieldCount}">
        </div>
      </div>
    </div>
  `

  container.appendChild(newField)

  // Add event listeners
  const removeBtn = newField.querySelector('.remove-custom-field-btn')
  removeBtn?.addEventListener('click', () => {
    newField.remove()
  })

  const uploadBtn = newField.querySelector('.upload-file-btn')
  uploadBtn?.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement
    const fileInputId = target.getAttribute('data-field-id')
    if (fileInputId) {
      const fileInput = document.getElementById(fileInputId) as HTMLInputElement
      fileInput?.click()
    }
  })

  const fileInput = newField.querySelector('.file-input')
  fileInput?.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (files && files.length > 0) {
      await handleFileUpload(target, files)
    }
  })
}

// Collect field data from form
function collectFieldData(fieldName: string): FieldData | undefined {
  const textInput = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLTextAreaElement
  const filesList = document.querySelector(`.uploaded-files-list[data-field-name="${fieldName}"]`)

  const text = textInput?.value.trim() || undefined
  const files: UploadedFile[] = []

  if (filesList) {
    const fileItems = filesList.querySelectorAll('.uploaded-file-item')
    fileItems.forEach(item => {
      const element = item as HTMLElement
      const fileName = element.querySelector('.file-name')?.textContent || ''
      const fileData = element.getAttribute('data-file-data') || ''
      const fileSizeText = element.querySelector('.file-size')?.textContent || '0 Bytes'

      if (fileData) {
        files.push({
          name: fileName,
          data: fileData,
          type: 'application/pdf',
          size: parseSizeText(fileSizeText)
        })
      }
    })
  }

  if (!text && files.length === 0) {
    return undefined
  }

  return { text, files: files.length > 0 ? files : undefined }
}

// Parse size text back to bytes
function parseSizeText(sizeText: string): number {
  const parts = sizeText.split(' ')
  const value = parseFloat(parts[0])
  const unit = parts[1]

  const multipliers: { [key: string]: number } = {
    'Bytes': 1,
    'KB': 1024,
    'MB': 1024 * 1024
  }

  return Math.round(value * (multipliers[unit] || 1))
}

// Handle publishing/updating a course
function handlePublishCourse(): void {
  // Collect custom fields
  const customFields: { [key: string]: FieldData } = {}
  const customFieldElements = document.querySelectorAll('.custom-field')

  customFieldElements.forEach((fieldElement, index) => {
    const nameInput = fieldElement.querySelector('.custom-field-name') as HTMLInputElement
    const valueInput = fieldElement.querySelector('.custom-field-value') as HTMLTextAreaElement
    const filesList = fieldElement.querySelector('.uploaded-files-list')

    const name = nameInput?.value.trim()
    const text = valueInput?.value.trim() || undefined
    const files: UploadedFile[] = []

    if (filesList) {
      const fileItems = filesList.querySelectorAll('.uploaded-file-item')
      fileItems.forEach(item => {
        const element = item as HTMLElement
        const fileName = element.querySelector('.file-name')?.textContent || ''
        const fileData = element.getAttribute('data-file-data') || ''
        const fileSizeText = element.querySelector('.file-size')?.textContent || '0 Bytes'

        if (fileData) {
          files.push({
            name: fileName,
            data: fileData,
            type: 'application/pdf',
            size: parseSizeText(fileSizeText)
          })
        }
      })
    }

    if (name && (text || files.length > 0)) {
      customFields[name] = {
        text,
        files: files.length > 0 ? files : undefined
      }
    }
  })

  const course: Course = {
    id: state.editingCourseId || generateId(),
    professorName: collectFieldData('professorName'),
    courseName: collectFieldData('courseName'),
    modules: collectFieldData('modules'),
    assignments: collectFieldData('assignments'),
    files: collectFieldData('files'),
    customFields: Object.keys(customFields).length > 0 ? customFields : undefined
  }

  if (state.editingCourseId) {
    // Update existing course
    const index = state.courses.findIndex(c => c.id === state.editingCourseId)
    if (index !== -1) {
      state.courses[index] = course
    }
  } else {
    // Add new course
    state.courses.push(course)
  }

  saveCourses()
  state.editingCourseId = undefined
  renderPublishedCoursesPage()
}

// Render published courses page
export function renderPublishedCoursesPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  state.currentPage = 'courses'

  app.innerHTML = `
    ${renderSidebar()}
    <div class="course-page">
      <header class="app-header">
        <h1 class="app-title">Syllabase</h1>
        <button class="hamburger-menu" id="hamburger-menu">
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
        </button>
      </header>

      <main class="course-content">
        <div class="courses-container">
          <div class="courses-header">
            <h2>My Published Courses</h2>
            <button id="new-course-btn" class="new-course-btn">+ New Course</button>
          </div>

          <div class="courses-list">
            ${state.courses.length === 0
              ? '<div class="empty-state"><p>No courses published yet. Create your first course!</p></div>'
              : state.courses.map(course => renderCourseCard(course)).join('')
            }
          </div>
        </div>
      </main>
    </div>
  `

  setupSidebar()
  setupPublishedCoursesPage()
}

// Render folders page
export function renderFoldersPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  state.currentPage = 'folders'

  app.innerHTML = `
    ${renderSidebar()}
    <div class="course-page">
      <header class="app-header">
        <button class="hamburger-menu" id="hamburger-menu">
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
        </button>
        <h1 class="app-title">Syllabase</h1>
      </header>

      <main class="course-content">
        <div class="courses-container">
          <div class="courses-header">
            <h2>My Folders</h2>
            <button id="new-folder-btn" class="new-course-btn">+ New Folder</button>
          </div>

          <div class="courses-list">
            ${state.folders.length === 0
              ? '<div class="empty-state"><p>No folders yet. Create your first folder to organize your courses!</p></div>'
              : state.folders.map(folder => renderFolderCard(folder)).join('')
            }
          </div>
        </div>
      </main>
    </div>
  `

  setupSidebar()
  setupFoldersPage()
}

// Render a folder card
function renderFolderCard(folder: Folder): string {
  const coursesInFolder = state.courses.filter(c => folder.courseIds.includes(c.id))
  const courseCount = coursesInFolder.length

  return `
    <div class="course-card folder-card" data-folder-id="${folder.id}">
      <div class="course-card-header">
        <div class="folder-title-section">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="folder-icon">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
          </svg>
          <h3>${folder.name}</h3>
        </div>
        <div class="course-card-actions">
          <button class="edit-folder-btn" data-folder-id="${folder.id}">Edit</button>
          <button class="delete-folder-btn" data-folder-id="${folder.id}">Delete</button>
        </div>
      </div>
      <p class="course-professor">${courseCount} course${courseCount !== 1 ? 's' : ''}</p>
      ${coursesInFolder.length > 0 ? `
        <div class="folder-courses-preview">
          ${coursesInFolder.slice(0, 3).map(course => `
            <div class="folder-course-item">
              📚 ${course.courseName?.text || 'Untitled Course'}
            </div>
          `).join('')}
          ${coursesInFolder.length > 3 ? `<div class="folder-course-item">+${coursesInFolder.length - 3} more</div>` : ''}
        </div>
      ` : ''}
    </div>
  `
}

// Setup folders page
function setupFoldersPage(): void {
  const newFolderBtn = document.getElementById('new-folder-btn')

  newFolderBtn?.addEventListener('click', () => {
    const folderName = prompt('Enter folder name:')
    if (folderName && folderName.trim()) {
      const newFolder: Folder = {
        id: generateId(),
        name: folderName.trim(),
        courseIds: []
      }
      state.folders.push(newFolder)
      saveCourses()
      renderFoldersPage()
    }
  })

  // Handle edit buttons
  document.querySelectorAll('.edit-folder-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const folderId = (e.target as HTMLElement).getAttribute('data-folder-id')
      const folder = state.folders.find(f => f.id === folderId)
      
      if (folder) {
        const newName = prompt('Enter new folder name:', folder.name)
        if (newName && newName.trim()) {
          folder.name = newName.trim()
          saveCourses()
          renderFoldersPage()
        }
      }
    })
  })

  // Handle delete buttons
  document.querySelectorAll('.delete-folder-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const folderId = (e.target as HTMLElement).getAttribute('data-folder-id')
      
      if (folderId && confirm('Are you sure you want to delete this folder? Courses inside will not be deleted.')) {
        state.folders = state.folders.filter(f => f.id !== folderId)
        saveCourses()
        renderFoldersPage()
      }
    })
  })

  // Handle clicking on folder cards to view courses inside
  document.querySelectorAll('.folder-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.edit-folder-btn, .delete-folder-btn')) return
      
      const folderId = (card as HTMLElement).getAttribute('data-folder-id')
      if (folderId) {
        renderFolderDetailPage(folderId)
      }
    })
  })
}

// Render folder detail page (shows courses in folder)
function renderFolderDetailPage(folderId: string): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  const folder = state.folders.find(f => f.id === folderId)
  
  if (!folder) {
    renderFoldersPage()
    return
  }

  const coursesInFolder = state.courses.filter(c => folder.courseIds.includes(c.id))

  app.innerHTML = `
    ${renderSidebar()}
    <div class="course-page">
      <header class="app-header">
        <button class="hamburger-menu" id="hamburger-menu">
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
        </button>
        <h1 class="app-title">Syllabase</h1>
      </header>

      <main class="course-content">
        <div class="courses-container">
          <div class="course-form-header">
            <button type="button" id="back-to-folders-btn" class="back-btn">← Back to Folders</button>
            <h2>${folder.name}</h2>
            <p class="form-subtitle">${coursesInFolder.length} course${coursesInFolder.length !== 1 ? 's' : ''} in this folder</p>
          </div>

          <div class="folder-actions">
            <button id="add-course-to-folder-btn" class="new-course-btn">+ Add Course to Folder</button>
          </div>

          <div class="courses-list">
            ${coursesInFolder.length === 0
              ? '<div class="empty-state"><p>No courses in this folder yet. Add courses to get started!</p></div>'
              : coursesInFolder.map(course => renderCourseCard(course, folderId)).join('')
            }
          </div>
        </div>
      </main>
    </div>
  `

  setupSidebar()
  setupFolderDetailPage(folderId)
}

// Setup folder detail page
function setupFolderDetailPage(folderId: string): void {
  const backBtn = document.getElementById('back-to-folders-btn')
  const addCourseBtn = document.getElementById('add-course-to-folder-btn')

  backBtn?.addEventListener('click', () => {
    renderFoldersPage()
  })

  addCourseBtn?.addEventListener('click', () => {
    showAddCourseToFolderModal(folderId)
  })

  // Handle edit/delete for courses in folder
  document.querySelectorAll('.edit-course-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const courseId = (e.target as HTMLElement).getAttribute('data-course-id')
      if (courseId) {
        state.editingCourseId = courseId
        renderNewCoursePage()
      }
    })
  })

  document.querySelectorAll('.delete-course-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const courseId = (e.target as HTMLElement).getAttribute('data-course-id')
      
      if (courseId && confirm('Are you sure you want to delete this course?')) {
        state.courses = state.courses.filter(c => c.id !== courseId)
        // Remove from all folders
        state.folders.forEach(f => {
          f.courseIds = f.courseIds.filter(id => id !== courseId)
        })
        saveCourses()
        renderFolderDetailPage(folderId)
      }
    })
  })

  // Handle remove from folder buttons
  document.querySelectorAll('.remove-from-folder-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const courseId = (e.target as HTMLElement).getAttribute('data-course-id')
      
      if (courseId && confirm('Remove this course from the folder?')) {
        const folder = state.folders.find(f => f.id === folderId)
        if (folder) {
          folder.courseIds = folder.courseIds.filter(id => id !== courseId)
          saveCourses()
          renderFolderDetailPage(folderId)
        }
      }
    })
  })

  // Handle clicking on course cards to show preview
  document.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.edit-course-btn, .delete-course-btn, .remove-from-folder-btn')) return
      
      const courseId = (card as HTMLElement).getAttribute('data-course-id')
      if (courseId) {
        showCoursePreviewModal(courseId)
      }
    })
  })
}

// Show modal to add course to folder
function showAddCourseToFolderModal(folderId: string): void {
  const folder = state.folders.find(f => f.id === folderId)
  if (!folder) return

  const availableCourses = state.courses.filter(c => !folder.courseIds.includes(c.id))

  if (availableCourses.length === 0) {
    alert('All courses are already in this folder!')
    return
  }

  // Create modal HTML
  const modalHTML = `
    <div class="modal-overlay" id="course-select-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Course to Folder</h3>
          <button class="modal-close-btn" id="modal-close-btn">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-subtitle">Select a course to add to "${folder.name}"</p>
          <div class="course-select-list">
            ${availableCourses.map(course => `
              <button class="course-select-item" data-course-id="${course.id}">
                <div class="course-select-info">
                  <div class="course-select-name">${course.courseName?.text || 'Untitled Course'}</div>
                  <div class="course-select-prof">${course.professorName?.text || 'No professor'}</div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="course-select-icon">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML)

  // Setup modal handlers
  const modal = document.getElementById('course-select-modal')
  const closeBtn = document.getElementById('modal-close-btn')

  const closeModal = () => modal?.remove()

  closeBtn?.addEventListener('click', closeModal)
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
  })

  // Handle course selection
  document.querySelectorAll('.course-select-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const courseId = (e.currentTarget as HTMLElement).getAttribute('data-course-id')
      if (courseId && folder) {
        folder.courseIds.push(courseId)
        saveCourses()
        closeModal()
        renderFolderDetailPage(folderId)
      }
    })
  })
}

// Render a single course card
function renderCourseCard(course: Course, folderId?: string): string {
  const title = course.courseName?.text || 'Untitled Course'
  const professor = course.professorName?.text || 'No professor assigned'

  return `
    <div class="course-card" data-course-id="${course.id}">
      <div class="course-card-header">
        <h3>${title}</h3>
        <div class="course-card-actions">
          <button class="edit-course-btn" data-course-id="${course.id}">Edit</button>
          ${folderId 
            ? `<button class="remove-from-folder-btn" data-course-id="${course.id}">Remove</button>`
            : ''
          }
          <button class="delete-course-btn" data-course-id="${course.id}">Delete</button>
        </div>
      </div>
      <p class="course-professor">${professor}</p>
    </div>
  `
}

// Show course preview modal
function showCoursePreviewModal(courseId: string): void {
  const course = state.courses.find(c => c.id === courseId)
  if (!course) return

  const renderPreviewSection = (label: string, fieldData: FieldData | undefined) => {
    if (!fieldData || (!fieldData.text && (!fieldData.files || fieldData.files.length === 0))) {
      return `
        <div class="preview-section">
          <div class="preview-section-header">${label}</div>
          <div class="preview-section-content empty">No ${label.toLowerCase()} added</div>
        </div>
      `
    }

    const MAX_ITEMS = 3
    let textContent = fieldData.text || ''
    let textLines: string[] = []
    let showMoreText = false

    if (textContent) {
      textLines = textContent.split('\n').filter(line => line.trim())
      if (textLines.length > MAX_ITEMS) {
        showMoreText = true
      }
    }

    const displayLines = showMoreText ? textLines.slice(0, MAX_ITEMS) : textLines

    return `
      <div class="preview-section">
        <div class="preview-section-header">${label}</div>
        <div class="preview-section-content">
          ${displayLines.length > 0 ? displayLines.map(line => `
            <div class="preview-item">${line}</div>
          `).join('') : ''}
          
          ${showMoreText ? `
            <button class="preview-show-more" data-label="${label}" data-full-text="${encodeURIComponent(textContent)}">
              Show More...
            </button>
          ` : ''}
          
          ${fieldData.files && fieldData.files.length > 0 ? `
            <div class="preview-files-list">
              ${fieldData.files.slice(0, MAX_ITEMS).map(file => `
                <div class="preview-file-badge">
                  <span class="preview-file-icon">📄</span>
                  <span class="preview-file-text">${file.name}</span>
                </div>
              `).join('')}
              ${fieldData.files.length > MAX_ITEMS ? `
                <button class="preview-show-more-files" data-label="${label}">
                  Show More...
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  const modalHTML = `
    <div class="course-preview-overlay" id="course-preview-overlay">
      <div class="course-preview-modal">
        <div class="course-preview-header">
          <h2>Syllabase</h2>
          <button class="course-preview-close" id="course-preview-close">×</button>
        </div>
        
        <div class="course-preview-body">
          <div class="preview-row">
            <div class="preview-section">
              <div class="preview-section-header">Professor Name</div>
              <div class="preview-section-content">
                ${course.professorName?.text || 'Anonymous'}
              </div>
            </div>
            
            <div class="preview-section">
              <div class="preview-section-header">Course Name</div>
              <div class="preview-section-content">
                ${course.courseName?.text || 'Untitled Course'}
              </div>
            </div>
          </div>
          
          <div class="preview-row">
            ${renderPreviewSection('Assignments', course.assignments)}
            ${renderPreviewSection('Modules', course.modules)}
          </div>
          
          ${renderPreviewSection('Files', course.files)}
          
          ${course.customFields ? Object.entries(course.customFields)
            .map(([key, value]) => renderPreviewSection(key, value))
            .join('') : ''}
        </div>
      </div>
    </div>
  `

  document.body.insertAdjacentHTML('beforeend', modalHTML)

  const overlay = document.getElementById('course-preview-overlay')
  const closeBtn = document.getElementById('course-preview-close')

  const closeModal = () => overlay?.remove()

  closeBtn?.addEventListener('click', closeModal)
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal()
  })

  // Handle show more buttons
  document.querySelectorAll('.preview-show-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement
      const label = target.getAttribute('data-label')
      const fullText = decodeURIComponent(target.getAttribute('data-full-text') || '')
      const content = target.closest('.preview-section-content')
      
      if (content) {
        const allLines = fullText.split('\n').filter(line => line.trim())
        content.innerHTML = allLines.map(line => `
          <div class="preview-item">${line}</div>
        `).join('') + `
          <button class="preview-show-less" data-label="${label}" data-full-text="${encodeURIComponent(fullText)}">
            Show Less
          </button>
        `
        
        // Re-add event listener for show less
        const showLessBtn = content.querySelector('.preview-show-less')
        showLessBtn?.addEventListener('click', () => {
          const course = state.courses.find(c => c.id === courseId)
          if (course) {
            closeModal()
            showCoursePreviewModal(courseId)
          }
        })
      }
    })
  })

  // Handle show more files buttons
  document.querySelectorAll('.preview-show-more-files').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement
      const label = target.getAttribute('data-label') || ''
      const fieldData = label === 'Modules' ? course.modules : 
                       label === 'Assignments' ? course.assignments :
                       label === 'Files' ? course.files :
                       course.customFields?.[label]

      if (fieldData?.files) {
        const filesList = target.previousElementSibling as HTMLElement
        const allFiles = fieldData.files.slice(3).map(file => `
          <div class="preview-file-badge">
            <span class="preview-file-icon">📄</span>
            <span class="preview-file-text">${file.name}</span>
          </div>
        `).join('')
        
        filesList?.insertAdjacentHTML('beforeend', allFiles)
        target.remove()
      }
    })
  })
}

// Setup published courses page handlers
function setupPublishedCoursesPage(): void {
  const newCourseBtn = document.querySelector<HTMLButtonElement>('#new-course-btn')!

  newCourseBtn.addEventListener('click', () => {
    state.editingCourseId = undefined
    renderNewCoursePage()
  })

  // Handle edit buttons
  document.querySelectorAll('.edit-course-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const target = e.target as HTMLButtonElement
      const courseId = target.getAttribute('data-course-id')
      if (courseId) {
        state.editingCourseId = courseId
        renderNewCoursePage()
      }
    })
  })

  // Handle delete buttons
  document.querySelectorAll('.delete-course-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const target = e.target as HTMLButtonElement
      const courseId = target.getAttribute('data-course-id')

      if (courseId && confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        state.courses = state.courses.filter(c => c.id !== courseId)
        // Remove from all folders
        state.folders.forEach(f => {
          f.courseIds = f.courseIds.filter(id => id !== courseId)
        })
        saveCourses()
        renderPublishedCoursesPage()
      }
    })
  })

  // Handle clicking on course cards to show preview
  document.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking buttons
      if ((e.target as HTMLElement).closest('.edit-course-btn, .delete-course-btn, .remove-from-folder-btn')) return

      const courseId = (card as HTMLElement).getAttribute('data-course-id')
      if (courseId) {
        showCoursePreviewModal(courseId)
      }
    })
  })
}

// Generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Initialize courses module
export function initCourses(): void {
  loadCourses()
}