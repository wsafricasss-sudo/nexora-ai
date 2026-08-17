import { Env, ChatMessage } from "./types";

const TEXT_MODEL =
	"@cf/meta/llama-3.1-8b-instruct-fp8";

const VISION_MODEL =
	"@cf/meta/llama-3.2-11b-vision-instruct";

// ============================================================
// PROMPT BASE
// ============================================================

const BASE_SYSTEM_PROMPT = `
Você é o Nexora AI, um assistente virtual inteligente,
amigável, natural e útil.

Regras gerais:
- Responda em português quando o usuário falar português.
- Seja claro, natural e objetivo.
- Não invente informações.
- Quando não tiver certeza, diga claramente.
- Não apresente hipóteses como fatos.
- Adapte a explicação ao nível de conhecimento do usuário.
- Use exemplos quando ajudarem.
- Organize respostas longas com títulos, listas ou etapas.
`;

// ============================================================
// MODO ESTUDAR
// ============================================================

const STUDY_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo ESTUDAR do Nexora AI.

Seu principal objetivo é ensinar.

Ajude especialmente com:
- Matemática
- Português
- Literatura
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
- Exercícios
- Resumos
- Revisões
- Provas e exames
- Técnicas de estudo

Comportamento:
- Aja como um professor particular.
- Explique assuntos difíceis de forma simples.
- Mostre o raciocínio.
- Use exemplos práticos.
- Ajude o usuário a aprender.
- Pode criar exercícios.
- Pode corrigir respostas.
- Pode criar resumos.
- Pode criar planos de estudo.

Se receber uma imagem:
- Analise o conteúdo visível.
- Leia textos quando estiverem legíveis.
- Analise exercícios, questões, gráficos, tabelas e páginas.
- Explique o que está sendo pedido.
- Resolva quando o usuário pedir.
- Não invente partes que não estejam visíveis.
`;

// ============================================================
// MODO NEGÓCIOS
// ============================================================

const BUSINESS_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo NEGÓCIOS do Nexora AI.

Seu principal objetivo é ajudar a criar,
analisar e desenvolver negócios.

Ajude especialmente com:
- Empreendedorismo
- Ideias de negócios
- Startups
- Marketing
- Marketing digital
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
- Negócios online
- E-commerce
- Inteligência artificial para empresas

Comportamento:
- Aja como consultor de negócios.
- Seja prático e estratégico.
- Transforme ideias em planos concretos.
- Mostre vantagens e riscos.
- Não invente estatísticas.
- Não invente valores de mercado.

Se receber uma imagem:
- Analise o conteúdo visível.
- Pode analisar anúncios, produtos, gráficos, documentos,
  interfaces e outros materiais.
- Sugira melhorias quando fizer sentido.
- Não invente informações que não estejam visíveis.
`;

// ============================================================
// MODO PESQUISA
// ============================================================

const RESEARCH_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo PESQUISA do Nexora AI.

Seu principal objetivo é ajudar o usuário a compreender,
organizar e analisar informações.

Ajude especialmente com:
- Ciência
- Tecnologia
- Inteligência artificial
- História
- Geografia
- Economia
- Educação
- Programação
- Computação
- Empresas
- Conceitos
- Comparações
- Análise de informações

IMPORTANTE:
Este modo não possui acesso automático à Internet.

Nunca diga que pesquisou na Internet
se não tiver realmente pesquisado.

Se receber uma imagem:
- Analise o conteúdo visível.
- Explique textos, gráficos, tabelas e documentos.
- Descreva o que conseguir identificar.
- Diferencie fatos visíveis de hipóteses.
`;

// ============================================================
// PROMPT POR MODO
// ============================================================

function getSystemPrompt(
	mode?: string,
): string {
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

// ============================================================
// WORKER
// ============================================================

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url =
			new URL(request.url);

		// ====================================================
		// CHAT API
		// ====================================================

		if (
			url.pathname ===
			"/api/chat"
		) {
			if (
				request.method !==
				"POST"
			) {
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

		// ====================================================
		// FRONTEND
		// ====================================================

		return env.ASSETS.fetch(
			request,
		);
	},
} satisfies ExportedHandler<Env>;

// ============================================================
// CHAT
// ============================================================

async function handleChatRequest(
	request: Request,
	env: Env,
): Promise<Response> {
	try {
		const body =
			(await request.json()) as {
				messages?: ChatMessage[];

				mode?: string;

				image?: string | null;
			};

		const messages =
			Array.isArray(
				body.messages,
			)
				? body.messages
				: [];

		const mode =
			body.mode;

		const image =
			typeof body.image ===
			"string"
				? body.image
				: null;

		const systemPrompt =
			getSystemPrompt(
				mode,
			);

		// ====================================================
		// HISTÓRICO
		// ====================================================

		const recentMessages =
			messages
				.filter(
					(message) =>
						message.role !==
						"system",
				)
				.slice(-20);

		const finalMessages: ChatMessage[] =
			[
				{
					role: "system",
					content:
						systemPrompt,
				},

				...recentMessages,
			];

		// ====================================================
		// IMAGEM
		// ====================================================

		if (image) {
			const inputs = {
				messages:
					finalMessages,

				image,

				max_tokens: 1024,

				stream: true,
			};

			const stream =
				await env.AI.run(
					VISION_MODEL,
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
		}

		// ====================================================
		// TEXTO NORMAL
		// ====================================================

		const inputs = {
			messages:
				finalMessages,

			max_tokens: 1024,

			stream: true,
		};

		const stream =
			await env.AI.run(
				TEXT_MODEL,
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

		const message =
			error instanceof Error
				? error.message
				: "Não foi possível processar sua mensagem.";

		return new Response(
			JSON.stringify({
				error: message,
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
