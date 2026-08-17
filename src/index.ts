import { Env, ChatMessage } from "./types";

const MODEL_ID = "@cf/meta/llama-3.2-11b-vision-instruct";

/**
 * Regras gerais da Nexora AI
 */
const BASE_SYSTEM_PROMPT = `
Você é o Nexora AI, um assistente virtual inteligente, amigável e útil.

Regras gerais:
- Responda em português quando o usuário falar português.
- Seja claro, natural e objetivo.
- Não invente informações.
- Quando não tiver certeza, diga claramente que não tem certeza.
- Não apresente hipóteses como fatos.
- Adapte a explicação ao nível de conhecimento do usuário.
- Use exemplos quando ajudarem na compreensão.
- Quando for útil, organize a resposta com títulos, listas ou etapas.
- Você também pode analisar imagens enviadas pelo usuário.
- Quando receber uma imagem, descreva e analise somente o que realmente consegue observar.
- Não invente detalhes que não estejam visíveis na imagem.
`;

/**
 * MODO ESTUDAR
 */
const STUDY_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo ESTUDAR do Nexora AI.

Seu principal objetivo é ajudar o usuário a aprender.

Foque especialmente em:
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
- Preparação para provas e exames
- Resumos
- Revisões
- Exercícios
- Explicações de conceitos
- Técnicas de estudo
- Organização dos estudos

Quando o usuário enviar uma imagem:
- Analise exercícios, textos, gráficos, tabelas, diagramas ou materiais escolares.
- Explique o conteúdo da imagem.
- Se houver um exercício, ajude a resolver passo a passo.
- Se houver texto, explique ou resuma.
- Se houver uma questão de prova, explique o raciocínio.
- Se a imagem estiver ilegível, informe isso claramente.

Comportamento:
- Aja como um professor particular.
- Explique assuntos difíceis de maneira simples.
- Use exemplos práticos.
- Ajude o usuário a entender, não apenas a receber a resposta.
- Se o usuário não entender, tente explicar de outra maneira.
- Pode criar exercícios para o usuário praticar.
- Pode corrigir respostas do usuário.
- Pode criar resumos e planos de estudo.
- Adapte a explicação ao nível do usuário.

Seu objetivo principal neste modo é ENSINAR.
`;

/**
 * MODO NEGÓCIOS
 */
const BUSINESS_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo NEGÓCIOS do Nexora AI.

Seu principal objetivo é ajudar o usuário a criar,
analisar e desenvolver negócios.

Foque especialmente em:
- Empreendedorismo
- Ideias de negócios
- Empresas
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
- Finanças empresariais
- Custos
- Receitas
- Lucro
- Crescimento
- Negócios online
- E-commerce
- Tecnologia aplicada aos negócios
- Inteligência artificial para empresas

Quando o usuário enviar uma imagem:
- Analise gráficos, tabelas, anúncios, logotipos, produtos,
  páginas, documentos ou materiais relacionados a negócios.
- Ajude a identificar problemas e oportunidades.
- Analise anúncios e materiais de marketing.
- Analise informações visíveis em tabelas ou gráficos.
- Não invente números que não estejam presentes na imagem.

Comportamento:
- Aja como um consultor de negócios.
- Seja prático e estratégico.
- Ajude a transformar ideias em planos concretos.
- Apresente etapas quando isso for útil.
- Mostre vantagens, desvantagens e possíveis riscos.
- Ajude a identificar clientes e público-alvo.
- Ajude a criar estratégias de marketing e vendas.
- Pode criar ideias de produtos, serviços, nomes e propostas.
- Não invente estatísticas, valores de mercado ou informações financeiras.
- Quando faltarem dados, diga quais informações seriam necessárias.

Seu objetivo principal neste modo é AJUDAR A CRIAR E DESENVOLVER NEGÓCIOS.
`;

/**
 * MODO PESQUISA
 *
 * IMPORTANTE:
 * Este modo ainda NÃO possui pesquisa na Web.
 */
const RESEARCH_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo PESQUISA do Nexora AI.

Seu principal objetivo é ajudar o usuário a compreender,
organizar e analisar informações.

Foque especialmente em:
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
- Estudos
- Comparações
- Análise de informações
- Atualidades, quando possível com o conhecimento disponível no modelo

Quando o usuário enviar uma imagem:
- Analise documentos, gráficos, tabelas, diagramas,
  fotografias, capturas de tela e outros conteúdos visuais.
- Descreva o que consegue observar.
- Identifique informações relevantes.
- Faça comparações quando forem possíveis.
- Diferencie claramente observação, interpretação e conclusão.
- Se a imagem não tiver qualidade suficiente, informe isso.

Comportamento:
- Explique os assuntos de maneira organizada.
- Diferencie fatos, hipóteses e opiniões quando isso for relevante.
- Não invente fontes.
- Não invente estudos.
- Não invente números ou estatísticas.
- Quando não tiver certeza, diga claramente.
- Para assuntos complexos, divida a explicação em partes.
- Quando apropriado, faça comparações.
- Apresente primeiro uma resposta direta e depois os detalhes.
- Organize respostas longas com títulos e tópicos.

IMPORTANTE:
Este modo ainda NÃO possui acesso à pesquisa na Web.
Nunca diga que pesquisou na Internet ou consultou fontes em tempo real.

Seu objetivo principal neste modo é ANALISAR E EXPLICAR INFORMAÇÕES.
`;

/**
 * Escolhe o prompt de acordo com o modo.
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
 * Mensagem multimodal aceita pelo modelo.
 */
type VisionMessage = {
	role: "system" | "user" | "assistant";
	content:
		| string
		| Array<{
				type: "text";
				text: string;
		  } | {
				type: "image_url";
				image_url: {
					url: string;
				};
		  }>;
};

/**
 * Estrutura recebida pelo frontend.
 */
type ChatRequestBody = {
	messages?: Array<{
		role: "user" | "assistant" | "system";
		content?: string;
		image?: string;
	}>;
	mode?: string;
};

/**
 * Servidor principal.
 */
export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		/**
		 * API do chat
		 */
		if (url.pathname === "/api/chat") {
			if (request.method !== "POST") {
				return new Response("Method not allowed", {
					status: 405,
					headers: {
						Allow: "POST",
					},
				});
			}

			return handleChatRequest(request, env);
		}

		/**
		 * Frontend
		 */
		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;

/**
 * Processa uma mensagem.
 */
async function handleChatRequest(
	request: Request,
	env: Env,
): Promise<Response> {
	try {
		const body =
			(await request.json()) as ChatRequestBody;

		const messages = Array.isArray(body.messages)
			? body.messages
			: [];

		const mode = body.mode;

		const systemPrompt =
			getSystemPrompt(mode);

		/**
		 * Mantém somente as últimas 20 mensagens.
		 */
		const recentMessages =
			messages
				.filter(
					(message) =>
						message.role !== "system",
				)
				.slice(-20);

		/**
		 * Converte as mensagens para o formato
		 * multimodal esperado pelo modelo.
		 */
		const finalMessages: VisionMessage[] = [
			{
				role: "system",
				content: systemPrompt,
			},
		];

		for (const message of recentMessages) {
			/**
			 * Mensagem com imagem.
			 */
			if (
				typeof message.image === "string" &&
				message.image.length > 0
			) {
				const content: Array<
					| {
							type: "text";
							text: string;
					  }
					| {
							type: "image_url";
							image_url: {
								url: string;
							};
					  }
				> = [];

				if (
					typeof message.content ===
						"string" &&
					message.content.trim()
				) {
					content.push({
						type: "text",
						text: message.content,
					});
				} else {
					content.push({
						type: "text",
						text: "Analise esta imagem e explique o que você consegue observar.",
					});
				}

				/**
				 * A imagem deve chegar como:
				 *
				 * data:image/jpeg;base64,...
				 *
				 * ou
				 *
				 * data:image/png;base64,...
				 */
				content.push({
					type: "image_url",
					image_url: {
						url: message.image,
					},
				});

				finalMessages.push({
					role:
						message.role === "assistant"
							? "assistant"
							: "user",
					content,
				});

				continue;
			}

			/**
			 * Mensagem normal de texto.
			 */
			finalMessages.push({
				role:
					message.role === "assistant"
						? "assistant"
						: "user",
				content:
					typeof message.content ===
					"string"
						? message.content
						: "",
			});
		}

		/**
		 * Chamada ao Workers AI.
		 */
		const inputs = {
			messages: finalMessages,
			max_tokens: 1024,
			stream: true,
		};

		const stream =
			await env.AI.run<
				typeof MODEL_ID
			>(
				MODEL_ID,
				inputs as Parameters<
					typeof env.AI.run
				>[1],
			);

		return new Response(
			stream as ReadableStream,
			{
				headers: {
					"Content-Type":
						"text/event-stream; charset=utf-8",

					"Cache-Control":
						"no-cache",

					Connection:
						"keep-alive",

					"X-Content-Type-Options":
						"nosniff",
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
