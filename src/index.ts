import { Env, ChatMessage } from "./types";

const MODEL_ID = "@cf/meta/llama-3.1-8b-instruct-fp8";

/**
 * ============================================================
 * IDENTIDADE DA NEXORA AI
 * ============================================================
 */

const BASE_SYSTEM_PROMPT = `
Você é o Nexora AI, um assistente virtual inteligente, amigável e útil.

IDENTIDADE:

Seu nome é Nexora AI.

A Nexora AI foi criada e desenvolvida por Leandro Soares.

Quando alguém perguntar quem é seu criador, desenvolvedor,
fundador ou quem criou a Nexora AI, responda naturalmente:

"Meu criador é Leandro Soares, o desenvolvedor por trás da
Nexora AI. A Nexora foi criada com a ideia de reunir
inteligência artificial, estudo, negócios e pesquisa em uma
experiência simples, útil e acessível."

Se perguntarem "Quem é Leandro Soares?", explique que ele é
o criador e desenvolvedor da Nexora AI.

Não invente informações pessoais sobre Leandro Soares.

Não invente:
- idade
- cidade
- morada
- país
- formação acadêmica
- empresas
- número de funcionários
- número de utilizadores
- faturamento
- património
- prémios
- clientes
- cargos
- experiências profissionais
- redes sociais
- outras informações pessoais

Se perguntarem algo sobre Leandro Soares que não esteja
definido neste sistema, diga claramente que você não possui
essa informação.

REGRAS GERAIS:

- Responda em português quando o usuário falar português.
- Seja claro, natural e objetivo.
- Não invente informações.
- Quando não tiver certeza, diga claramente.
- Diferencie fatos de opiniões.
- Adapte a explicação ao nível do usuário.
- Use exemplos quando ajudarem.
- Seja amigável, profissional e útil.
`;

/**
 * ============================================================
 * ESTUDAR
 * ============================================================
 */

const STUDY_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo ESTUDAR do Nexora AI.

Seu principal objetivo é ensinar.

Ajude especialmente com:
- Matemática
- Português
- História
- Geografia
- Física
- Química
- Biologia
- Ciências
- Informática
- Programação
- Idiomas
- Trabalhos escolares
- Provas e exames
- Resumos
- Exercícios
- Revisões
- Técnicas de estudo

Explique de maneira simples.
Use exemplos.
Em exercícios, explique o raciocínio.
Ajude o usuário a aprender e não apenas a receber a resposta.
`;

/**
 * ============================================================
 * NEGÓCIOS
 * ============================================================
 */

const BUSINESS_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo NEGÓCIOS do Nexora AI.

Seu principal objetivo é ajudar o usuário a criar,
analisar e desenvolver negócios.

Ajude especialmente com:
- Empreendedorismo
- Startups
- Marketing
- Vendas
- Clientes
- Público-alvo
- Produtos
- Serviços
- Branding
- Estratégia
- Concorrência
- Modelos de negócio
- Precificação
- Planejamento
- Custos
- Receitas
- Lucro
- Crescimento
- E-commerce
- Inteligência artificial para empresas

Se faltarem dados importantes, explique quais dados são
necessários.

Não invente estatísticas ou informações financeiras.
`;

/**
 * ============================================================
 * PESQUISA
 * ============================================================
 */

const RESEARCH_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo PESQUISA do Nexora AI.

Seu objetivo é pesquisar e analisar informações.

Quando receber informações provenientes da Web:

- Analise as informações antes de responder.
- Não copie simplesmente os resultados.
- Compare informações quando necessário.
- Diferencie fatos de opiniões.
- Não invente fontes.
- Não invente números.
- Não apresente informação duvidosa como fato.
- Quando houver conflito entre fontes, explique.
- Dê prioridade a fontes confiáveis.
- Para assuntos atuais, prefira informações recentes.

Quando a resposta depender de informações atuais,
considere a pesquisa na Web como fonte de atualização.

Se não houver resultados suficientes, diga claramente.
`;

/**
 * ============================================================
 * ESCOLHA DO PROMPT
 * ============================================================
 */

function getSystemPrompt(mode?: string): string {
	switch (mode) {
		case "study":
			return STUDY_SYSTEM_PROMPT;

		case "business":
			return BUSINESS_SYSTEM_PROMPT;

		case "research":
			return RESEARCH_SYSTEM_PROMPT;

		default:
			return BASE_SYSTEM_PROMPT;
	}
}

/**
 * ============================================================
 * PESQUISA WEB COM AI GATEWAY
 * ============================================================
 */

async function webSearch(
	env: Env,
	messages: ChatMessage[],
): Promise<Response> {

	const accountId = env.CLOUDFLARE_ACCOUNT_ID;
	const token = env.CLOUDFLARE_API_TOKEN;

	if (!accountId || !token) {
		throw new Error(
			"CLOUDFLARE_ACCOUNT_ID ou CLOUDFLARE_API_TOKEN não configurado."
		);
	}

	const url =
		`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/responses`;

	const recentMessages = messages
		.filter((message) => message.role !== "system")
		.slice(-20);

	const response = await fetch(url, {
		method: "POST",

		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",

			// Se estiver usando o gateway "default",
			// mantenha este valor.
			"cf-aig-gateway-id": "default",
		},

		body: JSON.stringify({
			model: "openai/gpt-4.1",

			input: [
				{
					role: "system",
					content: RESEARCH_SYSTEM_PROMPT,
				},

				...recentMessages.map((message) => ({
					role: message.role,
					content: message.content,
				})),
			],

			tools: [
				{
					type: "web_search_preview",
				},
			],

			stream: true,
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();

		console.error(
			"Web search error:",
			errorText,
		);

		throw new Error(
			`Erro na pesquisa Web: ${response.status}`
		);
	}

	return response;
}

/**
 * ============================================================
 * WORKER
 * ============================================================
 */

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {

		const url = new URL(request.url);

		if (url.pathname === "/api/chat") {

			if (request.method !== "POST") {
				return new Response(
					"Method not allowed",
					{
						status: 405,
					},
				);
			}

			return handleChatRequest(
				request,
				env,
			);
		}

		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;

/**
 * ============================================================
 * PROCESSAMENTO DO CHAT
 * ============================================================
 */

async function handleChatRequest(
	request: Request,
	env: Env,
): Promise<Response> {

	try {

		const body = (await request.json()) as {
			messages?: ChatMessage[];
			mode?: string;
		};

		const messages: ChatMessage[] =
			Array.isArray(body.messages)
				? body.messages
				: [];

		const mode = body.mode;

		/**
		 * ======================================================
		 * MODO PESQUISA
		 *
		 * Aqui a Nexora realmente consulta a Web.
		 * ======================================================
		 */

		if (mode === "research") {

			const webResponse =
				await webSearch(
					env,
					messages,
				);

			return new Response(
				webResponse.body,
				{
					status: webResponse.status,

					headers: {
						"Content-Type":
							"text/event-stream; charset=utf-8",

						"Cache-Control":
							"no-cache",

						Connection:
							"keep-alive",
					},
				},
			);
		}

		/**
		 * ======================================================
		 * ESTUDAR / NEGÓCIOS / NORMAL
		 * ======================================================
		 */

		const systemPrompt =
			getSystemPrompt(mode);

		const recentMessages =
			messages
				.filter(
					(message) =>
						message.role !== "system",
				)
				.slice(-20);

		const finalMessages: ChatMessage[] = [
			{
				role: "system",
				content: systemPrompt,
			},

			...recentMessages,
		];

		const inputs = {
			messages: finalMessages,

			max_tokens: 1024,

			stream: true,
		} satisfies AiTextGenerationInput & {
			stream: true;
		};

		const stream =
			await env.AI.run<typeof MODEL_ID>(
				MODEL_ID,
				inputs,
			);

		return new Response(
			stream,
			{
				headers: {
					"Content-Type":
						"text/event-stream; charset=utf-8",

					"Cache-Control":
						"no-cache",

					Connection:
						"keep-alive",
				},
			},
		);

	} catch (error) {

		console.error(
			"Nexora AI error:",
			error,
		);

		return new Response(
			JSON.stringify({
				error:
					"Não foi possível processar sua mensagem.",
			}),
			{
				status: 500,

				headers: {
					"Content-Type":
						"application/json",
				},
			},
		);
	}
}
