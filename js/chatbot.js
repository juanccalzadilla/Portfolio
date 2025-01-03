let userName = "";
let step = 0; // Rastrea el progreso de las preguntas
let isChatInitialized = false; // Controla si la conversación ya fue inicializada

function toggleChat() {
  const chatbot = document.getElementById("chatbot");
  chatbot.classList.toggle("hidden");

  if (!chatbot.classList.contains("hidden") && !isChatInitialized) {
    iniciarChat();
    isChatInitialized = true; // La conversación solo se inicializa una vez
  }
}

function iniciarChat() {
  const chatContent = document.getElementById("chat-content");
  const userInput = document.getElementById("user-input");

  // Detectar ENTER para enviar el mensaje
  userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleUserInput();
    }
  });

  // Mensaje de bienvenida con ícono
  addMessage("Robotin", "¡Hola! ¿Quieres saber más sobre Juan?", "bot");

  setTimeout(() => {
    addMessage(
      "Robotin",
      "Soy una AI entrenada por Juan para responder peguntas comúnes",
      "bot"
    );
  }, 1000);
}

const AIPayload = {
  generationConfig: {
    temperature: 1,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  },
};

async function answerFormAI(userInput) {

    let AIContext = await fetch('../data/ai-context.txt').then(response => response.text());
  const data = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: userInput,
          },
        ],
      },
    ],
    systemInstruction: {
      role: "user",
      parts: [
        {
          text: AIContext,
        },
      ],
    },
    ...AIPayload,
  };

  fetch(
    " https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBJRcVJr3dBeqokT3NJkasW1GUrW4_JvtE",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  ).then((response) => {
    response.json().then((data) => {
      console.log(data.candidates[0].content.parts[0].text);
      addMessage("Robotino", data.candidates[0].content.parts[0].text, "bot");
    });
  });
}

async function handleUserInput() {
  const userInput = document.getElementById("user-input");
  const message = userInput.value.trim();

  if (message !== "") {
    // Agrega mensaje del usuario
    addMessage("YO", message, "user");
    userInput.value = "";

    // Simula animación de escritura antes de responder
    showTypingIndicator();
    await answerFormAI(message);

    // Aqui nos conectaremos con la API de Juan para obtener la respuesta

    // setTimeout(() => {
    //   let botMessage = "";

    //   if (step === 0) {
    //     userName = message;
    //     botMessage = `¡Hola, ${userName}! ¿Cuántos años tienes?`;
    //     step++;
    //   } else if (step === 1) {
    //     botMessage = `¡Genial! ¿A qué te dedicas, ${userName}?`;
    //     step++;
    //   } else if (step === 2) {
    //     botMessage = `¡Interesante! ¿Qué comiste hoy?`;
    //     step++;
    //   } else if (step === 3) {
    //     botMessage = `Gracias por compartir, ${userName}. Esto puede interesarte:`;
    //     hideTypingIndicator();
    //     addMessage("Robotin", botMessage, "bot");

    //     // Envia el mensaje con enlace
    //     setTimeout(() => {
    //       sendLinkMessage(
    //         "https://ejemplo.com",
    //         "Súper promoción",
    //         [
    //           "25% de descuento reservando online.",
    //           "Descuento aplica para servicios adicionales contratados.",
    //         ],
    //         "VER MÁS"
    //       );
    //     }, 1000);
    //     return; // Salir aquí para que no agregue más mensajes después
    //   }

    //   hideTypingIndicator();
    //   addMessage("Robotin", botMessage, "bot");
    // }, 1500); // Tiempo de respuesta tras la animación de escritura
  }
}

function addMessage(sender, text, type) {
  const chatContent = document.getElementById("chat-content");
  const lastMessageContainer = chatContent.lastElementChild;
  const isSameSender =
    lastMessageContainer && lastMessageContainer.classList.contains(type);

  const messageContainer = document.createElement("div");
  messageContainer.className = `message-container ${type}`;
  if (isSameSender) {
    messageContainer.classList.add("hide-sender"); // Ocultar el emisor si es el mismo
  }

  if (!isSameSender) {
    const senderRow = document.createElement("div");
    senderRow.className = "sender-row";

    if (sender === "Robotin") {
      const senderIcon = document.createElement("span");
      senderIcon.className = "sender-icon";
      senderRow.appendChild(senderIcon);
    }

    const senderLabel = document.createElement("span");
    senderLabel.className = "sender";
    senderLabel.textContent = sender;
    senderRow.appendChild(senderLabel);

    messageContainer.appendChild(senderRow);
  }

  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.innerHTML = text.replaceAll("<li>", "<li class='mb-2'>");
  hideTypingIndicator();
  messageContainer.appendChild(message);
  chatContent.appendChild(messageContainer);

  chatContent.scrollTop = chatContent.scrollHeight;
}

function sendLinkMessage(link, title, benefits, buttonText) {
  const chatContent = document.getElementById("chat-content");

  // Crea el contenedor del mensaje con enlace
  const linkContainer = document.createElement("div");
  linkContainer.className = "message-container bot link-message visible";

  // Inserta contenido HTML con la imagen - título - lista de beneficios y botón
  linkContainer.innerHTML = `
        <div class="link-image-container">
            <img src="https://picsum.photos/id/237/200/300" alt="Imagen del beneficio" class="link-image visible">
        </div>
        <h4 class="link-title">${title}</h4>
        <ul class="benefits-list">
            ${benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
        </ul>
        <a href="${link}" target="_blank" class="link-button_chat">${buttonText}</a>
    `;

  // Agrega el mensaje al contenido del chat
  chatContent.appendChild(linkContainer);

  // Asegurarse de que el chat haga scroll hacia abajo
  chatContent.scrollTop = chatContent.scrollHeight;
}

function showTypingIndicator() {
  const chatContent = document.getElementById("chat-content");
  const typingIndicator = document.createElement("div");
  typingIndicator.id = "typing-indicator";
  typingIndicator.className = "message-container bot";

  const typingDots = document.createElement("div");
  typingDots.className = "message bot typing";
  typingDots.innerHTML = "<span></span><span></span><span></span>";

  typingIndicator.appendChild(typingDots);
  chatContent.appendChild(typingIndicator);

  chatContent.scrollTop = chatContent.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

const chatContent = document.querySelector("#chatbot-container #chat-content");

chatContent.addEventListener("wheel", (event) => {
  const { scrollTop, scrollHeight, clientHeight } = chatContent;

  // Prevenir scroll de la página si el chat está en sus límites
  if (
    (event.deltaY < 0 && scrollTop === 0) ||
    (event.deltaY > 0 && scrollTop + clientHeight >= scrollHeight)
  ) {
    event.preventDefault();
  }
});
