/**
 * Nexora AI — Chat Frontend
 * Conversas separadas por modo + histórico local
 */

// ============================================================
// DOM
// ============================================================

const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// ============================================================
// MODOS
// ============================================================

const MODES = {
	study: {
		title: "ESTUDAR",
		icon: "📚",
		welcome:
			"Olá! 👋 Eu sou a Nexora AI.\n\n" +
			"Você está no modo Estudar.\n\n" +
			"Posso ajudar com matérias, exercícios, " +
			"resumos, explicações e preparação para provas.\n\n" +
			"Como posso ajudar?",
	},

	business: {
		title: "NEGÓCIOS",
		icon: "💼",
		welcome:
			"Olá! 👋 Eu sou a Nexora AI.\n\n" +
			"Você está no modo Negócios.\n\n" +
			"Posso ajudar com ideias de negócios, " +
			"marketing, vendas, estratégia, clientes e empreendedorismo.\n\n" +
			"Como posso ajudar?",
	},

	research: {
		title: "PESQUISA",
		icon: "🔎",
		welcome:
			"Olá! 👋 Eu sou a Nexora AI.\n\n" +
			"Você está no modo Pesquisa.\n\n" +
			"Posso ajudar a compreender, organizar e analisar informações.\n\n" +
			"Como posso ajudar?",
	},
};

// ============================================================
// ESTADO
// ============================================================

let currentMode = "research";

let conversations = loadConversations();

let currentConversationId = null;

let isProcessing = false;

// ============================================================
// ARMAZENAMENTO
// ============================================================

const STORAGE_KEY = "nexora_ai_conversations_v1";

function loadConversations() {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);

		if (!saved) {
			return [];
		}

		const parsed = JSON.parse(saved);

		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed;
	} catch (error) {
		console.error(
			"Nexora: erro ao carregar histórico:",
			error,
		);

		return [];
	}
}

function saveConversations() {
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify(conversations),
		);
	} catch (error) {
		console.error(
			"Nexora: erro ao guardar histórico:",
			error,
		);
	}
}

// ============================================================
// ID DE CONVERSA
// ============================================================

function createConversationId() {
	return (
		Date.now().toString(36) +
		"-" +
		Math.random()
			.toString(36)
			.slice(2, 10)
	);
}

// ============================================================
// CONVERSAS
// ============================================================

function createConversation(mode = currentMode) {
	const modeInfo = MODES[mode] || MODES.research;

	const conversation = {
		id: createConversationId(),

		mode,

		title: "Nova conversa",

		createdAt: Date.now(),

		updatedAt: Date.now(),

		messages: [
			{
				role: "assistant",
				content: modeInfo.welcome,
			},
		],
	};

	conversations.unshift(conversation);

	currentConversationId = conversation.id;

	saveConversations();

	return conversation;
}

function getCurrentConversation() {
	return conversations.find(
		(conversation) =>
			conversation.id === currentConversationId,
	);
}

function getConversationsByMode(mode) {
	return conversations
		.filter(
			(conversation) =>
				conversation.mode === mode,
		)
		.sort(
			(a, b) =>
				b.updatedAt - a.updatedAt,
		);
}

function deleteConversation(id) {
	conversations = conversations.filter(
		(conversation) =>
			conversation.id !== id,
	);

	saveConversations();

	if (currentConversationId === id) {
		const nextConversation =
			getConversationsByMode(currentMode)[0];

		if (nextConversation) {
			openConversation(
				nextConversation.id,
			);
		} else {
			const conversation =
				createConversation(currentMode);

			renderConversation(
				conversation,
			);
		}
	}

	renderHistory();
}

function updateConversationTitle(
	conversation,
	firstUserMessage,
) {
	if (
		!conversation ||
		!firstUserMessage
	) {
		return;
	}

	if (conversation.title !== "Nova conversa") {
		return;
	}

	let title =
		firstUserMessage
			.replace(/\s+/g, " ")
			.trim();

	if (title.length > 45) {
		title =
			title.slice(0, 45).trim() +
			"...";
	}

	conversation.title =
		title || "Nova conversa";
}

// ============================================================
// CONVERSA ATUAL
// ============================================================

function ensureCurrentConversation() {
	let conversation =
		getCurrentConversation();

	if (
		!conversation ||
		conversation.mode !== currentMode
	) {
		const modeConversations =
			getConversationsByMode(
				currentMode,
			);

		if (modeConversations.length > 0) {
			conversation =
				modeConversations[0];

			currentConversationId =
				conversation.id;
		} else {
			conversation =
				createConversation(
					currentMode,
				);
		}
	}

	return conversation;
}

// ============================================================
// RENDER DA CONVERSA
// ============================================================

function renderConversation(conversation) {
	chatMessages.innerHTML = "";

	if (!conversation) {
		return;
	}

	for (const message of conversation.messages) {
		addMessageToChat(
			message.role,
			message.content,
		);
	}

	chatMessages.scrollTop =
		chatMessages.scrollHeight;
}

function addMessageToChat(
	role,
	content,
) {
	const messageEl =
		document.createElement("div");

	messageEl.className =
		`message ${role}-message`;

	const paragraph =
		document.createElement("p");

	paragraph.textContent =
		content;

	messageEl.appendChild(
		paragraph,
	);

	chatMessages.appendChild(
		messageEl,
	);

	chatMessages.scrollTop =
		chatMessages.scrollHeight;

	return messageEl;
}

// ============================================================
// HISTÓRICO
// ============================================================

function createHistoryPanel() {
	if (
		document.getElementById(
			"nexora-history",
		)
	) {
		return;
	}

	const panel =
		document.createElement("aside");

	panel.id =
		"nexora-history";

	panel.innerHTML = `
		<div class="nexora-history-header">
			<div>
				<strong>Histórico</strong>
				<div class="nexora-history-mode"></div>
			</div>

			<button
				type="button"
				class="nexora-new-chat"
				title="Nova conversa"
			>
				+
			</button>
		</div>

		<div
			class="nexora-history-list"
			id="nexora-history-list"
		></div>
	`;

	document.body.appendChild(panel);

	const style =
		document.createElement("style");

	style.id =
		"nexora-history-style";

	style.textContent = `
		#nexora-history {
			position: fixed;
			top: 0;
			left: 0;
			width: 280px;
			height: 100vh;
			z-index: 9999;

			padding: 18px;

			background: #0f1b2d;
			border-right: 1px solid #263a55;

			color: #f8fafc;

			overflow-y: auto;

			transform: translateX(-100%);
			transition: transform 0.2s ease;
		}

		#nexora-history.open {
			transform: translateX(0);
		}

		.nexora-history-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 10px;

			margin-bottom: 18px;
		}

		.nexora-history-mode {
			margin-top: 4px;
			color: #94a3b8;
			font-size: 12px;
		}

		.nexora-new-chat {
			width: 38px;
			height: 38px;

			border: none;
			border-radius: 10px;

			background: #38bdf8;
			color: #062033;

			font-size: 24px;
			font-weight: 700;

			cursor: pointer;
		}

		.nexora-history-item {
			width: 100%;

			display: flex;
			align-items: center;
			gap: 8px;

			margin-bottom: 8px;
			padding: 10px;

			border: 1px solid #263a55;
			border-radius: 10px;

			background: #08111f;
			color: #f8fafc;

			text-align: left;

			cursor: pointer;
		}

		.nexora-history-item.active {
			border-color: #38bdf8;
			background: #14243a;
		}

		.nexora-history-item-content {
			flex: 1;
			min-width: 0;
		}

		.nexora-history-title {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			font-size: 14px;
		}

		.nexora-history-date {
			margin-top: 4px;

			color: #94a3b8;
			font-size: 11px;
		}

		.nexora-delete-chat {
			flex: 0 0 auto;

			width: 30px;
			height: 30px;

			border: none;
			border-radius: 8px;

			background: transparent;
			color: #94a3b8;

			cursor: pointer;
		}

		.nexora-delete-chat:hover {
			background: #132238;
			color: #f8fafc;
		}

		.nexora-history-empty {
			padding: 20px 5px;

			color: #94a3b8;
			font-size: 13px;
			line-height: 1.5;
		}

		.nexora-history-toggle {
			position: fixed;

			top: 15px;
			left: 15px;

			z-index: 10000;

			width: 42px;
			height: 42px;

			border: 1px solid #263a55;
			border-radius: 10px;

			background: #0f1b2d;
			color: #f8fafc;

			font-size: 20px;

			cursor: pointer;
		}

		@media (min-width: 901px) {
			#nexora-history {
				width: 300px;
			}
		}

		@media (max-width: 600px) {
			#nexora-history {
				width: 85vw;
				max-width: 320px;
			}
		}
	`;

	document.head.appendChild(
		style,
	);

	const toggle =
		document.createElement("button");

	toggle.type = "button";

	toggle.className =
		"nexora-history-toggle";

	toggle.title =
		"Abrir histórico";

	toggle.textContent =
		"☰";

	document.body.appendChild(
		toggle,
	);

	toggle.addEventListener(
		"click",
		() => {
			panel.classList.toggle(
				"open",
			);
		},
	);

	panel
		.querySelector(
			".nexora-new-chat",
		)
		.addEventListener(
			"click",
			() => {
				const conversation =
					createConversation(
						currentMode,
					);

				renderConversation(
					conversation,
				);

				renderHistory();

				userInput.focus();
			},
		);
}

function renderHistory() {
	const list =
		document.getElementById(
			"nexora-history-list",
		);

	const modeLabel =
		document.querySelector(
			".nexora-history-mode",
		);

	if (!list) {
		return;
	}

	const modeInfo =
		MODES[currentMode] ||
		MODES.research;

	if (modeLabel) {
		modeLabel.textContent =
			`${modeInfo.icon} ${modeInfo.title}`;
	}

	list.innerHTML = "";

	const modeConversations =
		getConversationsByMode(
			currentMode,
		);

	if (
		modeConversations.length === 0
	) {
		list.innerHTML = `
			<div class="nexora-history-empty">
				Nenhuma conversa neste modo.
			</div>
		`;

		return;
	}

	for (
		const conversation
		of modeConversations
	) {
		const item =
			document.createElement(
				"div",
			);

		item.className =
			"nexora-history-item";

		if (
			conversation.id ===
			currentConversationId
		) {
			item.classList.add(
				"active",
			);
		}

		const content =
			document.createElement(
				"div",
			);

		content.className =
			"nexora-history-item-content";

		const title =
			document.createElement(
				"div",
			);

		title.className =
			"nexora-history-title";

		title.textContent =
			conversation.title ||
			"Nova conversa";

		const date =
			document.createElement(
				"div",
			);

		date.className =
			"nexora-history-date";

		date.textContent =
			formatDate(
				conversation.updatedAt,
			);

		content.appendChild(title);
		content.appendChild(date);

		const deleteButton =
			document.createElement(
				"button",
			);

		deleteButton.type =
			"button";

		deleteButton.className =
			"nexora-delete-chat";

		deleteButton.textContent =
			"×";

		deleteButton.title =
			"Apagar conversa";

		deleteButton.addEventListener(
			"click",
			(event) => {
				event.stopPropagation();

				const confirmed =
					window.confirm(
						"Apagar esta conversa?",
					);

				if (confirmed) {
					deleteConversation(
						conversation.id,
					);
				}
			},
		);

		item.appendChild(
			content,
		);

		item.appendChild(
			deleteButton,
		);

		item.addEventListener(
			"click",
			() => {
				openConversation(
					conversation.id,
				);
			},
		);

		list.appendChild(item);
	}
}

function formatDate(timestamp) {
	const date =
		new Date(timestamp);

	return date.toLocaleString(
		"pt-PT",
		{
			day: "2-digit",
			month: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		},
	);
}

// ============================================================
// ABRIR CONVERSA
// ============================================================

function openConversation(id) {
	const conversation =
		conversations.find(
			(item) =>
				item.id === id,
		);

	if (!conversation) {
		return;
	}

	currentConversationId =
		conversation.id;

	currentMode =
		conversation.mode;

	updateModeButtons();

	renderConversation(
		conversation,
	);

	renderHistory();

	userInput.focus();
}

// ============================================================
// NOVA CONVERSA AO MUDAR DE MODO
// ============================================================

function switchMode(mode) {
	if (!MODES[mode]) {
		return;
	}

	if (isProcessing) {
		return;
	}

	currentMode = mode;

	updateModeButtons();

	/**
	 * Ao mudar de modo, procuramos a conversa
	 * mais recente daquele modo.
	 *
	 * Se não existir, criamos uma nova.
	 */
	const modeConversations =
		getConversationsByMode(
			currentMode,
		);

	let conversation;

	if (modeConversations.length > 0) {
		conversation =
			modeConversations[0];
	} else {
		conversation =
			createConversation(
				currentMode,
			);
	}

	currentConversationId =
		conversation.id;

	renderConversation(
		conversation,
	);

	renderHistory();

	userInput.focus();
}

function updateModeButtons() {
	const modeButtons =
		document.querySelectorAll(
			".mode",
		);

	modeButtons.forEach(
		(button) => {
			const title =
				button
					.querySelector(
						".mode-title",
					)
					?.textContent
					?.trim();

			let buttonMode = null;

			if (
				title === "ESTUDAR"
			) {
				buttonMode =
					"study";
			} else if (
				title === "NEGÓCIOS"
			) {
				buttonMode =
					"business";
			} else if (
				title === "PESQUISA"
			) {
				buttonMode =
					"research";
			}

			if (
				buttonMode ===
				currentMode
			) {
				button.style.borderColor =
					"var(--primary)";

				button.style.background =
					"var(--card-light)";
			} else {
				button.style.borderColor =
					"";

				button.style.background =
					"";
			}
		},
	);
}

// ============================================================
// BOTÕES DOS MODOS
// ============================================================

const modeButtons =
	document.querySelectorAll(
		".mode",
	);

modeButtons.forEach(
	(button) => {
		button.addEventListener(
			"click",
			() => {
				const title =
					button
						.querySelector(
							".mode-title",
						)
						?.textContent
						?.trim();

				if (
					title === "ESTUDAR"
				) {
					switchMode(
						"study",
					);
				} else if (
					title ===
					"NEGÓCIOS"
				) {
					switchMode(
						"business",
					);
				} else if (
					title ===
					"PESQUISA"
				) {
					switchMode(
						"research",
					);
				}
			},
		);
	},
);

// ============================================================
// INPUT
// ============================================================

userInput.addEventListener(
	"input",
	function () {
		this.style.height =
			"auto";

		this.style.height =
			this.scrollHeight +
			"px";
	},
);

// ============================================================
// ENTER
// ============================================================

userInput.addEventListener(
	"keydown",
	(e) => {
		if (
			e.key === "Enter" &&
			!e.shiftKey
		) {
			e.preventDefault();

			sendMessage();
		}
	},
);

// ============================================================
// BOTÃO ENVIAR
// ============================================================

sendButton.addEventListener(
	"click",
	sendMessage,
);

// ============================================================
// ENVIO DA MENSAGEM
// ============================================================

async function sendMessage() {
	const message =
		userInput.value.trim();

	if (
		message === "" ||
		isProcessing
	) {
		return;
	}

	const conversation =
		ensureCurrentConversation();

	if (!conversation) {
		return;
	}

	isProcessing = true;

	userInput.disabled = true;

	sendButton.disabled = true;

	typingIndicator.classList.add(
		"visible",
	);

	/**
	 * Adiciona mensagem do usuário.
	 */
	conversation.messages.push({
		role: "user",
		content: message,
	});

	/**
	 * Cria título baseado na primeira pergunta.
	 */
	updateConversationTitle(
		conversation,
		message,
	);

	conversation.updatedAt =
		Date.now();

	saveConversations();

	addMessageToChat(
		"user",
		message,
	);

	userInput.value = "";

	userInput.style.height =
		"auto";

	try {
		const assistantMessageEl =
			document.createElement(
				"div",
			);

		assistantMessageEl.className =
			"message assistant-message";

		assistantMessageEl.innerHTML =
			"<p></p>";

		chatMessages.appendChild(
			assistantMessageEl,
		);

		const assistantTextEl =
			assistantMessageEl.querySelector(
				"p",
			);

		chatMessages.scrollTop =
			chatMessages.scrollHeight;

		/**
		 * Envia somente as mensagens
		 * da conversa atual.
		 */
		const response =
			await fetch(
				"/api/chat",
				{
					method: "POST",

					headers: {
						"Content-Type":
							"application/json",
					},

					body:
						JSON.stringify({
							messages:
								conversation.messages,

							mode:
								conversation.mode,
						}),
				},
			);

		if (!response.ok) {
			throw new Error(
				"Failed to get response",
			);
		}

		if (!response.body) {
			throw new Error(
				"Response body is null",
			);
		}

		const reader =
			response.body.getReader();

		const decoder =
			new TextDecoder();

		let responseText = "";

		let buffer = "";

		let sawDone = false;

		const flushAssistantText =
			() => {
				assistantTextEl.textContent =
					responseText;

				chatMessages.scrollTop =
					chatMessages.scrollHeight;
			};

		while (true) {
			const {
				done,
				value,
			} = await reader.read();

			if (done) {
				const parsed =
					consumeSseEvents(
						buffer +
							"\n\n",
					);

				for (
					const data
					of parsed.events
				) {
					if (
						data ===
						"[DONE]"
					) {
						break;
					}

					try {
						const jsonData =
							JSON.parse(
								data,
							);

						let content =
							"";

						if (
							typeof jsonData.response ===
								"string" &&
							jsonData.response
								.length >
								0
						) {
							content =
								jsonData.response;
						} else if (
							jsonData
								.choices?.[0]
								?.delta
								?.content
						) {
							content =
								jsonData
									.choices[0]
									.delta
									.content;
						}

						if (content) {
							responseText +=
								content;

							flushAssistantText();
						}
					} catch (error) {
						console.error(
							"Nexora: erro ao interpretar SSE:",
							error,
							data,
						);
					}
				}

				break;
			}

			buffer +=
				decoder.decode(
					value,
					{
						stream: true,
					},
				);

			const parsed =
				consumeSseEvents(
					buffer,
				);

			buffer =
				parsed.buffer;

			for (
				const data
				of parsed.events
			) {
				if (
					data ===
					"[DONE]"
				) {
					sawDone =
						true;

					buffer = "";

					break;
				}

				try {
					const jsonData =
						JSON.parse(
							data,
						);

					let content =
						"";

					if (
						typeof jsonData.response ===
							"string" &&
						jsonData.response
							.length >
							0
					) {
						content =
							jsonData.response;
					} else if (
						jsonData
							.choices?.[0]
							?.delta
							?.content
					) {
						content =
							jsonData
								.choices[0]
								.delta
								.content;
					}

					if (content) {
						responseText +=
							content;

						flushAssistantText();
					}
				} catch (error) {
					console.error(
						"Nexora: erro ao interpretar SSE:",
						error,
						data,
					);
				}
			}

			if (sawDone) {
				break;
			}
		}

		/**
		 * Guarda a resposta no chat atual.
		 */
		if (
			responseText.length >
			0
		) {
			conversation.messages.push(
				{
					role:
						"assistant",

					content:
						responseText,
				},
			);

			conversation.updatedAt =
				Date.now();

			saveConversations();

			renderHistory();
		}
	} catch (error) {
		console.error(
			"Nexora error:",
			error,
		);

		addMessageToChat(
			"assistant",
			"Não foi possível processar sua mensagem.",
		);
	} finally {
		typingIndicator.classList.remove(
			"visible",
		);

		isProcessing = false;

		userInput.disabled =
			false;

		sendButton.disabled =
			false;

		userInput.focus();
	}
}

// ============================================================
// SSE
// ============================================================

function consumeSseEvents(
	buffer,
) {
	let normalized =
		buffer.replace(
			/\r/g,
			"",
		);

	const events = [];

	let eventEndIndex;

	while (
		(eventEndIndex =
			normalized.indexOf(
				"\n\n",
			)) !== -1
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
			rawEvent.split(
				"\n",
			);

		const dataLines = [];

		for (
			const line of lines
		) {
			if (
				line.startsWith(
					"data:",
				)
			) {
				dataLines.push(
					line
						.slice(
							"data:"
								.length,
						)
						.trimStart(),
				);
			}
		}

		if (
			dataLines.length ===
			0
		) {
			continue;
		}

		events.push(
			dataLines.join(
				"\n",
			),
		);
	}

	return {
		events,
		buffer: normalized,
	};
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

function initializeNexora() {
	createHistoryPanel();

	const currentModeConversations =
		getConversationsByMode(
			currentMode,
		);

	let conversation;

	if (
		currentModeConversations.length >
		0
	) {
		conversation =
			currentModeConversations[0];
	} else {
		conversation =
			createConversation(
				currentMode,
			);
	}

	currentConversationId =
		conversation.id;

	updateModeButtons();

	renderConversation(
		conversation,
	);

	renderHistory();

	userInput.focus();
}

initializeNexora();
