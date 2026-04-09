const chipSuggestions = [
    "Aktuelle Cyber-Angriffe",
    "Schutztools empfehlen",
    "Anbieter in meiner Region",
    "Ransomware Tipps",
    "IT-Sicherheitsnews"
];

let chatOpen = false;
let recognition = null;
let isListening = false;
let firstOpen = true;
let isResponding = false;

function toggleChat() {
    const container = document.getElementById('chatContainer');
    const launcher = document.getElementById('launcher');
    chatOpen = !chatOpen;
    if (chatOpen) {
        container.classList.add('open');
        launcher.style.opacity = '0.5';
        document.getElementById('badge').style.display = 'none';
        if (firstOpen) {
            if (!isResponding) {
                startTyping();
            }
        } else {
            addGreetingChips();
        }
    } else {
        container.classList.remove('open');
        launcher.style.opacity = '1';
        stopSpeechInput();
    }
}

function addGreetingChips() {
    const messages = document.getElementById('messages');
    if (messages.querySelector('.chips')) return;
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'chips-container';
    const chipsDiv = document.createElement('div');
    chipsDiv.className = 'chips';
    chipsDiv.id = 'greetingChips';
    chipSuggestions.forEach(text => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.textContent = text;
        chip.onclick = (e) => {
            e.stopPropagation();
            chipsContainer.remove();
            document.getElementById('userInput').value = text;
            sendMessage();
            document.getElementById('userInput').blur();
        };
        chipsDiv.appendChild(chip);
    });
    chipsContainer.appendChild(chipsDiv);
    messages.appendChild(chipsContainer);
    scrollToBottom();
}

function startTyping() {
    isResponding = true;
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar bot-avatar';
    avatar.innerHTML = 'B';
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<i class="material-icons typing-circle">lens</i><i class="material-icons typing-circle">lens</i><i class="material-icons typing-circle">lens</i>';
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(typingIndicator);
    messages.appendChild(messageDiv);
    scrollToBottom();
    const htmlText = 'Hallo! Ich bin <strong>Bob</strong>, und beantworte Fragen zum Thema IT-Sicherheit.<br><br>Was möchtest du wissen?';
    setTimeout(() => {
        messageDiv.removeChild(typingIndicator);
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble bot-bubble';
        messageDiv.appendChild(bubble);
        typewriter(bubble, htmlText);
    }, 2000);
}

function addTypingMessage(plain, html, sender) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender}-avatar`;
    avatar.innerHTML = 'B';
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}-bubble`;
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
    typewriter(bubble, html);
}

function addBotResponseWithTyping(plain, html) {
    isResponding = true;
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar bot-avatar';
    avatar.innerHTML = 'B';
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<i class="material-icons typing-circle">lens</i><i class="material-icons typing-circle">lens</i><i class="material-icons typing-circle">lens</i>';
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(typingIndicator);
    messages.appendChild(messageDiv);
    scrollToBottom();
    setTimeout(() => {
        messageDiv.removeChild(typingIndicator);
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble bot-bubble';
        messageDiv.appendChild(bubble);
        typewriter(bubble, html);
    }, 2000);
}

function typewriter(bubble, html) {
    bubble.innerHTML = html;
    const segments = [];
    let position = 0;

    function collect(node) {
        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.data;
                segments.push({ type: 'text', node: child, text, length: text.length });
                position += text.length;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                if (child.tagName === 'BR') {
                    segments.push({ type: 'br', node: child, position });
                } else {
                    collect(child);
                }
            }
        });
    }

    collect(bubble);
    segments.forEach(segment => {
        if (segment.type === 'text') {
            segment.node.textContent = '';
        } else if (segment.type === 'br') {
            segment.node.style.display = 'none';
        }
    });

    const fullLength = position;
    let i = 0;

    function updateText() {
        i++;
        let remaining = i;

        segments.forEach(segment => {
            if (segment.type === 'text') {
                if (remaining <= 0) {
                    segment.node.textContent = '';
                    return;
                }
                if (remaining >= segment.length) {
                    segment.node.textContent = segment.text;
                    remaining -= segment.length;
                } else {
                    segment.node.textContent = segment.text.slice(0, remaining);
                    remaining = 0;
                }
            } else if (segment.type === 'br') {
                segment.node.style.display = segment.position <= i ? '' : 'none';
            }
        });
    }

    updateText();
    const interval = setInterval(() => {
        if (i >= fullLength) {
            clearInterval(interval);
            if (firstOpen) {
                firstOpen = false;
                addGreetingChips();
            }
            isResponding = false;
            return;
        }
        updateText();
        scrollToBottom();
    }, 50);
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text || isResponding) return;

    addMessage(text, 'user');
    input.value = '';
    input.blur();

    if (chipSuggestions.includes(text)) {
        setTimeout(() => {
            const chipResponses = {
                "Aktuelle Cyber-Angriffe": `Hier sind aktuelle Infos zu Cyber-Angriffen:<br><br><strong>📰 News:</strong> "Phishing-Welle erreicht Rekordhoch" (15.03.2026)<br><a href="https://marktplatz-it-sicherheit.de/news/phishing-rekord-2026" target="_blank" class="link">→ News lesen</a><br><br><strong>📄 Artikel:</strong> "Top 5 Angriffe der Woche"<br><a href="https://marktplatz-it-sicherheit.de/artikel/top-angriffe-2026" target="_blank" class="link">→ Artikel lesen</a>`,
                "Schutztools empfehlen": `Gute Schutztools für Unternehmen:<br><br><strong>📰 News:</strong> "Neue SIEM-Tools im Test" (02.04.2026)<br><a href="https://marktplatz-it-sicherheit.de/news/siem-test-2026" target="_blank" class="link">→ News lesen</a><br><br><strong>📄 Artikel:</strong> "Die besten 10 Tools 2026"<br><a href="https://marktplatz-it-sicherheit.de/artikel/best-tools-2026" target="_blank" class="link">→ Artikel lesen</a>`,
                "Anbieter in meiner Region": `Anbieter-Suche für deine Region:<br><br><strong>📰 News:</strong> "Neue if(is) Partner in NRW" (01.04.2026)<br><a href="https://marktplatz-it-sicherheit.de/news/partner-nrw-2026" target="_blank" class="link">→ News lesen</a><br><br><strong>📄 Artikel:</strong> "Lokale Sicherheitsanbieter"<br><a href="https://marktplatz-it-sicherheit.de/artikel/lokale-anbieter" target="_blank" class="link">→ Artikel lesen</a>`,
                "Ransomware Tipps": `Tipps gegen Ransomware:<br><br><strong>📰 News:</strong> "Neuer LockBit-Angriff" (03.04.2026)<br><a href="https://marktplatz-it-sicherheit.de/news/lockbit-2026" target="_blank" class="link">→ News lesen</a><br><br><strong>📄 Artikel:</strong> "Ransomware-Abwehrstrategie"<br><a href="https://marktplatz-it-sicherheit.de/artikel/ransomware-strategie" target="_blank" class="link">→ Artikel lesen</a>`,
                "IT-Sicherheitsnews": `Neueste IT-Sicherheitsnews:<br><br><strong>📰 News:</strong> "Patchday April 2026" (heute)<br><a href="https://marktplatz-it-sicherheit.de/news/patchday-april-2026" target="_blank" class="link">→ News lesen</a><br><br><strong>📄 Artikel:</strong> "Wochenrückblick IT-Sicherheit"<br><a href="https://marktplatz-it-sicherheit.de/artikel/wochenrueckblick-2026" target="_blank" class="link">→ Artikel lesen</a>`
            };
            const plainResponses = {
                "Aktuelle Cyber-Angriffe": 'Hier sind aktuelle Infos zu Cyber-Angriffen: News: "Phishing-Welle erreicht Rekordhoch" (15.03.2026) → News lesen Artikel: "Top 5 Angriffe der Woche" → Artikel lesen',
                "Schutztools empfehlen": 'Gute Schutztools für Unternehmen: News: "Neue SIEM-Tools im Test" (02.04.2026) → News lesen Artikel: "Die besten 10 Tools 2026" → Artikel lesen',
                "Anbieter in meiner Region": 'Anbieter-Suche für deine Region: News: "Neue if(is) Partner in NRW" (01.04.2026) → News lesen Artikel: "Lokale Sicherheitsanbieter" → Artikel lesen',
                "Ransomware Tipps": 'Tipps gegen Ransomware: News: "Neuer LockBit-Angriff" (03.04.2026) → News lesen Artikel: "Ransomware-Abwehrstrategie" → Artikel lesen',
                "IT-Sicherheitsnews": 'Neueste IT-Sicherheitsnews: News: "Patchday April 2026" (heute) → News lesen Artikel: "Wochenrückblick IT-Sicherheit" → Artikel lesen'
            };
            addBotResponseWithTyping(plainResponses[text], chipResponses[text]);
        }, 800);
        return;
    }

    setTimeout(() => {
        const responses = [
            `Hier wird dann die Antwort des RAG Systems stehen zu deiner Frage: "${text}"!`,
            `Hier wird dann die Antwort des RAG Systems stehen zu deiner Frage: "${text}"!`,
            `Hier wird dann die Antwort des RAG Systems stehen zu deiner Frage: "${text}"!`
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addBotResponseWithTyping(randomResponse, randomResponse);
    }, 800);
}

function scrollToBottom() {
    const messages = document.getElementById('messages');
    const threshold = 100; // Pixel threshold from bottom
    const isNearBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < threshold;
    if (isNearBottom) {
        messages.scrollTop = messages.scrollHeight;
    }
}

function addMessage(text, sender) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender}-avatar`;
    if (sender === 'bot') {
        avatar.innerHTML = 'B';
    } else {
        avatar.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>`;
    }
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}-bubble`;
    bubble.innerHTML = text;
    if (sender === 'user') {
        messageDiv.appendChild(bubble);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
    }
    messages.appendChild(messageDiv);
    scrollToBottom();
}

function toggleSpeechInput() {
    const micBtn = document.getElementById('micBtn');
    const micStatus = document.getElementById('micStatus');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micStatus.textContent = 'Spracherkennung wird in diesem Browser nicht unterstützt.';
        micStatus.classList.add('active');
        return;
    }

    if (!recognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'de-DE';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
            micStatus.textContent = 'Ich höre zu...';
            micStatus.classList.add('active');
        };

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('userInput').value = transcript.trim();
        };

        recognition.onerror = (event) => {
            micStatus.textContent = 'Fehler bei der Spracherkennung: ' + event.error;
            micStatus.classList.add('active');
            stopSpeechInput();
        };

        recognition.onend = () => {
            stopSpeechInput(false);
        };
    }

    if (isListening) {
        stopSpeechInput();
    } else {
        try {
            recognition.start();
        } catch (e) {
            micStatus.textContent = 'Spracherkennung konnte nicht gestartet werden.';
            micStatus.classList.add('active');
        }
    }
}

function stopSpeechInput(resetStatus = true) {
    isListening = false;
    const micBtn = document.getElementById('micBtn');
    const micStatus = document.getElementById('micStatus');
    micBtn.classList.remove('listening');
    if (resetStatus) {
        micStatus.textContent = '';
        micStatus.classList.remove('active');
    }
}

document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
        document.getElementById('userInput').blur();
    }
});

setInterval(() => {
    if (!chatOpen) {
        const launcher = document.getElementById('launcher');
        launcher.style.transform = 'scale(1.02)';
        setTimeout(() => { launcher.style.transform = 'scale(1)'; }, 500);
    }
}, 4000);
