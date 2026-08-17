/**
 * Nexora AI — Chat Frontend
 */

// DOM elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// Modo atual da Nexora
let currentMode = "research";

// Chat state
let chatHistory = [
	{
		role: "assistant",
		content:
			"Olá! 👋 Eu sou a Nexora AI.\n\nPosso ajudar você a estudar, desenvolver ideias de negócios e pesquisar informações.\n\nComo posso ajudar?",
	},
];

let isProcessing = false;

// Seleção dos modos
const modeButtons = document.querySelectorAll(".mode");

modeButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const title = button.querySelector(".mode-title")?.textContent?.trim();

		if (title === "ESTUDAR") {
			currentMode = "study";
		} else if (title === "NEGÓCIOS") {
			currentMode = "business";
		} else if (title === "PESQUISA") {
			currentMode = "research";
		}

		// Marca visualmente o modo selecionado
		modeButtons.forEach((item) => {
			item.style.borderColor = "";
			item.style.background = "";
		});

		button.style.borderColor = "var(--primary)";
		button.style.background = "var(--card-light)";

		console.log("Nexora mode:", currentMode);
	});
});

// Auto-resize textarea
userInput.addEventListener("input", function () {
	this.style.height = "auto";
	this.style.height = this.scrollHeight + "px";
});

// Send message on Enter
userInput.addEventListener("keydown", function (e) {
	if (e.key === "Enter" && !e.shiftKey) {
		e.preventDefault();
		sendMessage();
	}
});

// Send button
sendButton.addEventListener("click", sendMessage);

/**
 * Sends a message to the chat API
 */
async function sendMessage() {
	const message = userInput.value.trim();

	if (message === "" || isProcessing) return;

	isProcessing = true;
	userInput.disabled = true;
	sendButton.disabled = true;

	addMessageToChat("user", message);

	userInput.value = "";
	userInput.style.height = "auto";

	typingIndicator.classList.add("visible");

	chatHistory.push({
		role: "user",
		content: message,
	});

	try {
		const assistantMessageEl = document.createElement("div");
		assistantMessageEl.className = "message assistant-message";
		assistantMessageEl.innerHTML = "<p></p>";

		chatMessages.appendChild(assistantMessageEl);

		const assistantTextEl =
			assistantMessageEl.querySelector("p");

		chatMessages.scrollTop =
			chatMessages.scrollHeight;

		const response = await fetch("/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messages: chatHistory,
				mode: currentMode,
			}),
		});

		if (!response.ok) {
			throw new Error("Failed to get response");
		}

		if (!response.body) {
			throw new Error("Response body is null");
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		let responseText = "";
		let buffer = "";

		const flushAssistantText = () => {
			assistantTextEl.textContent = responseText;
			chatMessages.scrollTop =
				chatMessages.scrollHeight;
		};

		let sawDone = false;

		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				const parsed =
					consumeSseEvents(buffer + "\n\n");

				for (const data of parsed.events) {
					if (data === "[DONE]") {
						break;
					}

					try {
						const jsonData = JSON.parse(data);

						let content = "";

						if (
							typeof jsonData.response === "string" &&
							jsonData.response.length > 0
						) {
							content = jsonData.response;
						} else if (
							jsonData.choices?.[0]?.delta?.content
						) {
							content =
								jsonData.choices[0].delta.content;
						}

						if (content) {
							responseText += content;
							flushAssistantText();
						}
					} catch (e) {
						console.error(
							"Error parsing SSE data:",
							e,
							data,
						);
					}
				}

				break;
			}

			buffer += decoder.decode(value, {
				stream: true,
			});

			const parsed =
				consumeSseEvents(buffer);

			buffer = parsed.buffer;

			for (const data of parsed.events) {
				if (data === "[DONE]") {
					sawDone = true;
					buffer = "";
					break;
				}

				try {
					const jsonData = JSON.parse(data);

					let content = "";

					if (
						typeof jsonData.response === "string" &&
						jsonData.response.length > 0
					) {
						content = jsonData.response;
					} else if (
						jsonData.choices?.[0]?.delta?.content
					) {
						content =
							jsonData.choices[0].delta.content;
					}

					if (content) {
						responseText += content;
						flushAssistantText();
					}
				} catch (e) {
					console.error(
						"Error parsing SSE data:",
						e,
						data,
					);
				}
			}

			if (sawDone) {
				break;
			}
		}

		if (responseText.length > 0) {
			chatHistory.push({
				role: "assistant",
				content: responseText,
			});
		}
	} catch (error) {
		console.error("Error:", error);

		addMessageToChat(
			"assistant",
			"Não foi possível processar sua mensagem.",
		);
	} finally {
		typingIndicator.classList.remove("visible");

		isProcessing = false;
		userInput.disabled = false;
		sendButton.disabled = false;

		userInput.focus();
	}
}

/**
 * Add message to chat
 */
function addMessageToChat(role, content) {
	const messageEl =
		document.createElement("div");

	messageEl.className =
		`message ${role}-message`;

	const paragraph =
		document.createElement("p");

	paragraph.textContent = content;

	messageEl.appendChild(paragraph);

	chatMessages.appendChild(messageEl);

	chatMessages.scrollTop =
		chatMessages.scrollHeight;
}

/**
 * Process Server-Sent Events
 */
function consumeSseEvents(buffer) {
	let normalized = buffer.replace(/\r/g, "");

	const events = [];

	let eventEndIndex;

	while (
		(eventEndIndex =
			normalized.indexOf("\n\n")) !== -1
	) {
		const rawEvent =
			normalized.slice(
				0,
				eventEndIndex,
			);

		normalized =
			normalized.slice(
				eventEndIndex + 2,
			);

		const lines =
			rawEvent.split("\n");

		const dataLines = [];

		for (const line of lines) {
			if (line.startsWith("data:")) {
				dataLines.push(
					line
						.slice("data:".length)
						.trimStart(),
				);
			}
		}

		if (dataLines.length === 0) continue;

		events.push(
			dataLines.join("\n"),
		);
	}

	return {
		events,
		buffer: normalized,
	};
					 }
