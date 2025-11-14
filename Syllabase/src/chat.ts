import { initCourses, renderSidebar, setupSidebar } from "./courses";

type ChatMessage = {
  sender: "user" | "system";
  text: string;
  timestamp: string;
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderChatInterface(): void {
  const app = document.querySelector<HTMLDivElement>("#chat-page");
  if (!app) return;

  const contextName =
    localStorage.getItem("chatContextName") ||
    localStorage.getItem("chatCourseName") ||
    "Course";
  const contextType =
    (localStorage.getItem("chatContextType") as "course" | "folder" | null) ||
    "course";
  const contextLabel = contextType === "folder" ? "folder" : "course";

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

      <main class="chat-content">
        <div class="chat-header">
          <h2>Chat about ${contextName}</h2>
          <p class="chat-subtitle">Start a quick discussion about this ${contextLabel}.</p>
        </div>

        <div class="chat-panel">
          <div id="chat-messages" class="chat-messages"></div>
          <div class="chat-quick-prompts">
            <button type="button" id="prompt-compare">Compare the learning objectives for these course</button>
            <button type="button" id="prompt-syllabus">Create a syllabus based off these courses</button>
          </div>
          <form id="chat-form" class="chat-form">
            <input
              type="text"
              id="chat-input"
              placeholder="Type a message"
              autocomplete="off"
              required
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </main>
    </div>
  `;

  setupSidebar();
  setupChatHandlers(contextName);
}

function setupChatHandlers(contextName: string): void {
  const messageContainer =
    document.querySelector<HTMLDivElement>("#chat-messages");
  const chatForm = document.querySelector<HTMLFormElement>("#chat-form");
  const chatInput = document.querySelector<HTMLInputElement>("#chat-input");
  const comparePrompt = document.querySelector<HTMLButtonElement>(
    "#prompt-compare"
  );
  const syllabusPrompt = document.querySelector<HTMLButtonElement>(
    "#prompt-syllabus"
  );

  if (!messageContainer || !chatForm || !chatInput) return;

  const messages: ChatMessage[] = [
    {
      sender: "system",
      text: `This chat is now open for conversations about ${contextName}.`,
      timestamp: formatTime(new Date()),
    },
  ];

  const renderMessages = (): void => {
    messageContainer.innerHTML = messages
      .map(
        (message) => `
        <div class="chat-message ${message.sender}">
          <div class="chat-message-text">${message.text}</div>
          <span class="chat-message-time">${message.timestamp}</span>
        </div>
      `
      )
      .join("");
    messageContainer.scrollTop = messageContainer.scrollHeight;
  };

  renderMessages();

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    messages.push({
      sender: "user",
      text,
      timestamp: formatTime(new Date()),
    });
    renderMessages();
    chatInput.value = "";
  });

  comparePrompt?.addEventListener("click", () => {
    messages.push({
      sender: "system",
      text: `After reviewing available material for ${contextName}, the overlapping learning objectives are collaboration, critical thinking, and iterative project work. Differences include emphasis on research depth versus presentation skills.`,
      timestamp: formatTime(new Date()),
    });
    renderMessages();
  });

  syllabusPrompt?.addEventListener("click", () => {
    localStorage.setItem("syllabusSource", contextName);
    window.location.href = "syllabus.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initCourses();
  renderChatInterface();
});
