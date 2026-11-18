(() => {
  const openBtn = document.getElementById("mannie-open");
  const closeBtn = document.getElementById("mannie-close");
  const panel = document.getElementById("mannie-panel");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-button");
  const micBtn = document.getElementById("mic-button");
  const messages = document.getElementById("chat-messages");
  const voiceStatus = document.getElementById("voice-status");
  const speakToggle = document.getElementById("speak-toggle");

  let speakReplies = true;
  let recognition = null;

  function addMessage(text, type) {
    const el = document.createElement("div");
    el.className = `message ${type}`;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function getMannieResponse(text) {
    const q = text.toLowerCase();

    if (q.includes("who are you") || q.includes("what are you")) {
      return "I'm Mannie, Emmanuel's portfolio AI assistant. I can answer questions about this website, his projects, and the information presented here.";
    }
    if (q.includes("emmanuel") || q.includes("about")) {
      return "Emmanuel Abimbola is an Information Technology student at Kean University. This portfolio highlights his technology projects, skills, coursework, and growth.";
    }
    if (q.includes("skill")) {
      return "The portfolio highlights web development, Information Technology, cybersecurity fundamentals, and tools such as VS Code, Git, Figma, and browser developer tools.";
    }
    if (q.includes("project")) {
      return "Featured projects include Emmanuel's personal portfolio, a website threat-modeling project, and Mannie, the AI assistant built into this site.";
    }
    if (q.includes("voice") || q.includes("speak") || q.includes("microphone")) {
      return "You can use the microphone button to speak to me. If your browser supports speech recognition, I'll turn your speech into text. I can also read my responses aloud.";
    }
    if (q.includes("kean") || q.includes("university")) {
      return "Emmanuel studies Information Technology at Kean University.";
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return "Hey! I'm Mannie. You can ask me about Emmanuel, cybersecurity, technology, or general knowledge.";
    }
    if (q.includes("capital of france")) return "The capital of France is Paris.";
    if (q.includes("largest planet")) return "Jupiter is the largest planet in our solar system.";
    if (q.includes("what is ai") || q.includes("artificial intelligence")) return "Artificial intelligence is technology that enables computers to perform tasks that normally require human intelligence, such as understanding language, recognizing patterns, and making predictions.";
    if (q.includes("what is phishing")) return "Phishing is a social-engineering attack that tries to trick people into revealing information or clicking malicious links.";
    if (q.includes("what is xss")) return "Cross-Site Scripting, or XSS, is a web security vulnerability where untrusted content can cause a browser to execute attacker-controlled script.";
    if (/\d+\s*[+\-*/]\s*\d+/.test(q)) {
      try { const m=q.match(/(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)/); if(m){const a=Number(m[1]),b=Number(m[3]);const r=m[2]==='+'?a+b:m[2]==='-'?a-b:m[2]==='*'?a*b:a/b;return `The answer is ${r}.`;}} catch(e) {}
    }

    return "I can answer questions about the portfolio, cybersecurity, technology, or general knowledge. Try asking me something like 'What is phishing?', 'What is AI?', or 'What is the capital of France?'";
  }

  function speak(text) {
    if (!speakReplies || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    const response = getMannieResponse(text);
    setTimeout(() => {
      addMessage(response, "bot");
      speak(response);
    }, 250);
  }

  openBtn.addEventListener("click", () => {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    input.focus();
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  speakToggle.addEventListener("click", () => {
    speakReplies = !speakReplies;
    speakToggle.setAttribute("aria-pressed", String(speakReplies));
    speakToggle.textContent = speakReplies
      ? "🔊 Read responses aloud: On"
      : "🔇 Read responses aloud: Off";
    if (!speakReplies && "speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      micBtn.classList.add("listening");
      voiceStatus.textContent = "Listening… speak now";
    };

    recognition.onend = () => {
      micBtn.classList.remove("listening");
      voiceStatus.textContent = "Voice ready";
    };

    recognition.onerror = event => {
      micBtn.classList.remove("listening");
      voiceStatus.textContent = `Voice error: ${event.error}`;
    };

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      sendMessage();
    };

    micBtn.addEventListener("click", () => {
      try {
        recognition.start();
      } catch (error) {
        // Recognition can throw if already active.
      }
    });
  } else {
    micBtn.disabled = true;
    micBtn.title = "Speech recognition is not supported in this browser";
    voiceStatus.textContent = "Voice input is not supported by this browser";
  }
})();
