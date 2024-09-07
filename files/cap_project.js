// Fitness Tracker Functionality

// Function to save goals to local storage
function saveGoals() {
  const goalsList = document.getElementById("goalsList");
  const goals = Array.from(goalsList.children).map((item) => {
    return {
      name: item.querySelector("span").textContent.split(": ")[0],
      target: item.querySelector("span").textContent.split(": ")[1],
    };
  });
  localStorage.setItem("fitnessGoals", JSON.stringify(goals));
}

// Function to load goals from local storage
function loadGoals() {
  const storedGoals = localStorage.getItem("fitnessGoals");
  if (storedGoals) {
    const goals = JSON.parse(storedGoals);
    const goalsList = document.getElementById("goalsList");
    goals.forEach((goal) => {
      const goalItem = document.createElement("div");
      goalItem.classList.add("goal-item");
      goalItem.innerHTML = `
          <span>${goal.name}: ${goal.target}</span>
          <button onclick="removeGoal(this)">Delete</button>
        `;
      goalsList.appendChild(goalItem);
    });
  }
}

// Call loadGoals when the page loads
window.addEventListener("load", loadGoals);

document.getElementById("goalForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const goalName = document.getElementById("goalName").value.trim();
  const goalTarget = document.getElementById("goalTarget").value.trim();

  // if (!goalName || !goalTarget) return;

  const goalsList = document.getElementById("goalsList");

  const goalItem = document.createElement("div");
  goalItem.classList.add("goal-item");
  goalItem.innerHTML = `
      <span>${goalName}: ${goalTarget} </span>
      <button onclick="removeGoal(this)">Delete</button>
    `;

  goalsList.appendChild(goalItem);
  saveGoals(); // Save goals to local storage

  document.getElementById("goalForm").reset();
});

function removeGoal(button) {
  button.parentElement.remove();
  saveGoals(); // Save updated goals to local storage
}

// Chatbot Functionality
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

// API configuration
const API_KEY = "AIzaSyDe644F4TCLASLP24HcjNjsk-ADQXo-klk"; // Replace with your API key
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  const chatContent =
    className === "outgoing"
      ? `<p>${message}</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
  chatLi.innerHTML = chatContent;
  return chatLi;
};

const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    messageElement.textContent =
      data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1");
  } catch (error) {
    messageElement.classList.add("error");
    messageElement.textContent = error.message;
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () =>
  document.body.classList.remove("show-chatbot")
);
chatbotToggler.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);
