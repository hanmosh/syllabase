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
}

export interface CourseState {
  courses: Course[]
  editingCourseId?: string
}

// State management
let state: CourseState = {
  courses: [],
  editingCourseId: undefined
}

// Load courses from localStorage
export function loadCourses(): void {
  const stored = localStorage.getItem('syllabase-courses')
  if (stored) {
    try {
      state = JSON.parse(stored)
    } catch (e) {
      console.error('Error loading courses:', e)
    }
  }
}

// Save courses to localStorage
export function saveCourses(): void {
  localStorage.setItem('syllabase-courses', JSON.stringify(state))
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
    <div class="course-page">
      <header class="app-header">
        <button class="hamburger-menu" id="hamburger-menu">
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
        </button>
        <h1 class="app-title">Syllabase</h1>
        <button class="profile-icon" id="profile-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </button>
      </header>

      <main class="course-content">
        <div class="course-form-container">
          <div class="course-form-header">
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
  const profileIcon = document.querySelector<HTMLButtonElement>('#profile-icon')!

  // Handle profile icon click (logout)
  profileIcon.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      handleLogout()
    }
  })

  // Handle form submission
  form.addEventListener('submit', (e: Event) => {
    e.preventDefault()
    handlePublishCourse()
  })

  // Setup file upload buttons
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

  app.innerHTML = `
    <div class="course-page">
      <header class="app-header">
        <button class="hamburger-menu" id="hamburger-menu">
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
        </button>
        <h1 class="app-title">Syllabase</h1>
        <button class="profile-icon" id="profile-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
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

  setupPublishedCoursesPage()
}

// Render a single course card
function renderCourseCard(course: Course): string {
  const title = course.courseName?.text || 'Untitled Course'
  const professor = course.professorName?.text || 'No professor assigned'

  return `
    <div class="course-card" data-course-id="${course.id}">
      <div class="course-card-header">
        <h3>${title}</h3>
        <div class="course-card-actions">
          <button class="edit-course-btn" data-course-id="${course.id}">Edit</button>
          <button class="delete-course-btn" data-course-id="${course.id}">Delete</button>
        </div>
      </div>
      <p class="course-professor">${professor}</p>
      <div class="course-details">
        ${renderFieldView('Modules', course.modules)}
        ${renderFieldView('Assignments', course.assignments)}
        ${renderFieldView('Files', course.files)}
        ${renderCustomFieldsView(course.customFields || {})}
      </div>
    </div>
  `
}

// Render a field in view mode
function renderFieldView(label: string, fieldData: FieldData | undefined): string {
  if (!fieldData || (!fieldData.text && (!fieldData.files || fieldData.files.length === 0))) {
    return ''
  }

  return `
    <div class="detail-item">
      <strong>${label}:</strong>
      ${fieldData.text ? `<div class="detail-text">${fieldData.text}</div>` : ''}
      ${fieldData.files && fieldData.files.length > 0
        ? `<div class="detail-files">
            ${fieldData.files.map(file => `
              <div class="file-badge">
                <span class="file-icon">📄</span>
                <span class="file-name-small">${file.name}</span>
                <button class="view-pdf-btn" data-file-data="${file.data}">View</button>
              </div>
            `).join('')}
          </div>`
        : ''
      }
    </div>
  `
}

// Render custom fields in view mode
function renderCustomFieldsView(customFields: { [key: string]: FieldData }): string {
  return Object.entries(customFields)
    .map(([key, fieldData]) => renderFieldView(key, fieldData))
    .join('')
}

// Setup published courses page handlers
function setupPublishedCoursesPage(): void {
  const newCourseBtn = document.querySelector<HTMLButtonElement>('#new-course-btn')!
  const profileIcon = document.querySelector<HTMLButtonElement>('#profile-icon')!

  // Handle profile icon click (logout)
  profileIcon.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      handleLogout()
    }
  })

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
        saveCourses()
        renderPublishedCoursesPage()
      }
    })
  })

  // Handle clicking on course cards
  document.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking buttons
      if ((e.target as HTMLElement).closest('.edit-course-btn, .delete-course-btn, .view-pdf-btn')) return

      const courseId = (card as HTMLElement).getAttribute('data-course-id')
      if (courseId) {
        state.editingCourseId = courseId
        renderNewCoursePage()
      }
    })
  })

  // Handle view PDF buttons
  document.querySelectorAll('.view-pdf-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const target = e.target as HTMLButtonElement
      const fileData = target.getAttribute('data-file-data')

      if (fileData) {
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
