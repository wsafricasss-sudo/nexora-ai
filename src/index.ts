import { Env, ChatMessage } from "./types";

const TEXT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

const BASE_SYSTEM_PROMPT = `
Você é o Nexora AI, um assistente virtual inteligente, amigável e útil.

Regras gerais:
- Responda em português quando o usuário falar português.
- Seja claro, natural e objetivo.
- Não invente informações.
- Quando não tiver certeza, diga claramente que não tem certeza.
- Não apresente hipóteses como fatos.
- Adapte a explicação ao nível de conhecimento do usuário.
- Use exemplos quando ajudarem.
- Quando for útil, organize a resposta com títulos, listas ou etapas.
`;

const STUDY_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo ESTUDAR do Nexora AI.

Ajude o usuário a aprender e compreender.

Você pode ajudar com:
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
- Preparação para provas
- Técnicas de estudo

Comportamento:
- Aja como um professor particular.
- Explique assuntos difíceis de maneira simples.
- Mostre o raciocínio.
- Use exemplos.
- Ajude o usuário a aprender, não apenas a copiar respostas.
- Pode corrigir exercícios e respostas.
- Pode criar exercícios para praticar.

Se o usuário enviar uma imagem de uma questão, exercício, página ou conteúdo escolar:
- Analise a imagem.
- Leia o conteúdo visível.
- Explique o que está sendo pedido.
- Resolva ou ajude a resolver.
`;

const BUSINESS_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo NEGÓCIOS do Nexora AI.

Ajude o usuário com:
- Empreendedorismo
- Ideias de negócios
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
- Negócios online
- E-commerce
- Inteligência artificial para empresas

Se o usuário enviar uma imagem relacionada a um negócio:
- Analise a imagem.
- Explique o que consegue identificar.
- Sugira melhorias quando fizer sentido.
- Não invente informações que não estejam visíveis.
`;

const RESEARCH_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo PESQUISA do Nexora AI.

Ajude o usuário a:
- Compreender informações.
- Organizar informações.
- Comparar informações.
- Analisar conceitos.
- Entender ciência e tecnologia.
- Entender inteligência artificial.
- Entender história e geografia.
- Analisar conteúdos enviados pelo usuário.

IMPORTANTE:
Não diga que pesquisou na Internet se não tiver acesso real à Web.

Se o usuário enviar uma imagem:
- Analise o conteúdo visível.
- Explique gráficos, textos, objetos, documentos ou outros elementos quando possível.
- Diferencie claramente o que está visível daquilo que é apenas uma hipótese.
`;

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

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/api/chat") {
			if (request.method !== "POST") {
				return new Response("Method not allowed", {
					status: 405,
				});
			}

			return handleChatRequest(request, env);
		}

		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;

async function handleChatRequest(
	request: Request,
	env: Env,
): Promise<Response> {
	try {
		const body = (await request.json()) as {
			messages?: ChatMessage[];
			mode?: string;
			image?: string;
		};

		const messages: ChatMessage[] = Array.isArray(body.messages)
			? body.messages
			: [];

		const mode = body.mode;
		const image = body.image;

		const systemPrompt = getSystemPrompt(mode);

		const recentMessages = messages
			.filter((message) => message.role !== "system")
			.slice(-20);

		const finalMessages: ChatMessage[] = [
			{
				role: "system",
				content: systemPrompt,
			},
			...recentMessages,
		];

		/*
		 * Se existir imagem, usamos o modelo de visão.
		 * Caso contrário, usamos o modelo normal de texto.
		 */
		if (image && typeof image === "string") {
			const inputs = {
				messages: finalMessages,
				image,
				max_tokens: 1024,
				stream: true,
			};

			const stream = await env.AI.run(
				VISION_MODEL,
				inputs,
			);

			return new Response(stream, {
				headers: {
					"Content-Type":
						"text/event-stream; charset=utf-8",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			});
		}

		const inputs = {
			messages: finalMessages,
			max_tokens: 1024,
			stream: true,
		};

		const stream = await env.AI.run(
			TEXT_MODEL,
			inputs,
		);

		return new Response(stream, {
			headers: {
				"Content-Type":
					"text/event-stream; charset=utf-8",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("Nexora AI error:", error);

		return new Response(
			JSON.stringify({
				error:
					error instanceof Error
						? error.message
						: "Não foi possível processar sua mensagem.",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
}
