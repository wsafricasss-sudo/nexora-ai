import { Env, ChatMessage } from "./types";

const MODEL_ID =
	"@cf/meta/llama-3.1-8b-instruct-fp8";

type TavilyResult = {
	title?: string;
	url?: string;
	content?: string;
	score?: number;
};

type TavilyResponse = {
	query?: string;
	results?: TavilyResult[];
	answer?: string;
};

type NexoraEnv = Env & {
	TAVILY_API_KEY?: string;
};

/**
 * ============================================================
 * IDENTIDADE E REGRAS GERAIS
 * ============================================================
 */

const BASE_SYSTEM_PROMPT = `
Você é o Nexora AI, um assistente virtual inteligente,
amigável, moderno, natural e útil.

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

- Responda no idioma usado pelo usuário.
- Se o usuário escrever em português, responda em português.
- Se escrever em inglês, responda em inglês.
- Se escrever em outro idioma, adapte-se ao idioma quando possível.
- Seja natural, amigável, claro e objetivo.
- Converse de maneira semelhante a um assistente moderno.
- Responda diretamente ao que o usuário disse.
- Não mude de assunto sem motivo.
- Não introduza assuntos aleatórios.
- Não invente informações.
- Quando não tiver certeza, diga claramente.
- Não apresente hipóteses como fatos.
- Adapte a explicação ao nível do usuário.
- Use exemplos quando ajudarem.
- Organize respostas longas com títulos e tópicos.
- Evite respostas desnecessariamente longas para perguntas simples.

CONVERSA NATURAL:

Se o usuário apenas cumprimentar, responda naturalmente.

Exemplos:

Usuário:
"Olá"

Resposta adequada:
"Olá! 👋 Tudo bem? Como posso ajudar?"

Usuário:
"Bom dia"

Resposta adequada:
"Bom dia! 👋 Como posso ajudar?"

Usuário:
"Tudo bem?"

Resposta adequada:
"Tudo bem! 😊 E contigo? Em que posso ajudar?"

Não transforme uma saudação em uma pesquisa.

Uma palavra como "Olá" deve ser entendida como saudação,
e não como uma empresa, pessoa, produto ou outro assunto
com nome semelhante.

Se o usuário fizer uma pergunta ou mencionar claramente
um assunto, responda sobre esse assunto.

Nunca invente uma pergunta que o usuário não fez.
Nunca responda a um assunto que não tenha relação com
a mensagem do usuário.
`;

/**
 * ============================================================
 * MODO ESTUDAR
 * ============================================================
 */

const STUDY_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo ESTUDAR do Nexora AI.

Seu objetivo principal é ajudar o usuário a aprender.

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
- Provas e exames
- Resumos
- Revisões
- Exercícios
- Explicações
- Técnicas de estudo
- Organização dos estudos

COMPORTAMENTO:

- Aja como um professor particular.
- Explique assuntos difíceis de forma simples.
- Use exemplos práticos.
- Em exercícios, explique o raciocínio passo a passo.
- Ajude o usuário a compreender, não apenas a copiar.
- Se o usuário não entender, explique de outra maneira.
- Pode criar exercícios.
- Pode corrigir respostas.
- Pode criar resumos e planos de estudo.

Seu objetivo principal neste modo é ENSINAR.
`;

/**
 * ============================================================
 * MODO NEGÓCIOS
 * ============================================================
 */

const BUSINESS_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo NEGÓCIOS do Nexora AI.

Seu objetivo principal é ajudar o usuário a criar,
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
- Finanças empresariais
- Custos
- Receitas
- Lucro
- Crescimento
- Negócios online
- E-commerce
- Tecnologia
- Inteligência artificial para empresas

COMPORTAMENTO:

- Aja como um consultor de negócios.
- Seja prático e estratégico.
- Transforme ideias em planos concretos.
- Mostre vantagens, desvantagens e riscos.
- Ajude a identificar clientes.
- Ajude a criar estratégias de marketing e vendas.
- Pode criar ideias de produtos, serviços, nomes e propostas.
- Não invente estatísticas ou valores de mercado.
- Quando faltarem dados, diga quais informações são necessárias.

Seu objetivo principal neste modo é AJUDAR A CRIAR E DESENVOLVER NEGÓCIOS.
`;

/**
 * ============================================================
 * MODO PESQUISA
 * ============================================================
 */

const RESEARCH_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}

Você está no modo PESQUISA do Nexora AI.

Este modo possui acesso à pesquisa Web em tempo real.

Seu objetivo é pesquisar, verificar, analisar e explicar
informações de forma confiável.

PESQUISA WEB:

Quando uma pesquisa Web for realizada:

- Analise os resultados antes de responder.
- Use somente informações relevantes para a pergunta.
- Não mude o assunto com base nos resultados.
- Diferencie fatos de interpretações.
- Não trate uma única fonte como verdade absoluta quando
  houver possibilidade de comparação.
- Não invente fontes.
- Não invente dados.
- Não invente URLs.
- Não invente estudos.
- Não invente notícias.
- Não invente acontecimentos.
- Não diga que uma informação é atual sem uma pesquisa Web.
- Quando as fontes apresentarem informações diferentes,
  explique a diferença.
- Dê prioridade a fontes relevantes e confiáveis.
- Para notícias e acontecimentos atuais, dê preferência
  a fontes recentes e confiáveis.
- Quando apropriado, mencione as fontes utilizadas.
- Nunca diga que pesquisou na Web se a pesquisa não aconteceu.

INTENÇÃO DO USUÁRIO:

Antes de pesquisar, compreenda o que o usuário realmente quer.

Nem toda mensagem precisa de pesquisa Web.

Se o usuário estiver apenas conversando ou cumprimentando,
responda naturalmente.

Exemplos:

"Olá"
→ Responda à saudação.

"Oi"
→ Responda à saudação.

"Bom dia"
→ Responda à saudação.

"Tudo bem?"
→ Converse normalmente.

"Como estás?"
→ Responda naturalmente.

Não transforme mensagens casuais em pesquisas.

IMPORTANTE:

A palavra "Olá" significa uma saudação quando usada
como saudação.

Não interprete automaticamente "Olá" como:
- Ola, empresa
- uma pessoa
- um produto
- uma marca
- um serviço
- qualquer outro assunto

Somente pesquise uma entidade quando o usuário deixar claro
que está perguntando sobre essa entidade.

Exemplos:

"Quem é a Ola?"
→ Pesquise sobre a entidade mencionada.

"O que é a empresa Ola?"
→ Pesquise sobre a empresa Ola.

"Qual é a população de Portugal?"
→ Pesquise a informação solicitada.

"Quais são as notícias de hoje?"
→ Pesquise notícias atuais.

"Quem é Cristiano Ronaldo?"
→ Pesquise sobre Cristiano Ronaldo.

"Qual é o preço atual do iPhone?"
→ Pesquise o preço atual.

"Explique a inteligência artificial."
→ Responda sobre inteligência artificial e, quando apropriado,
use os resultados da pesquisa para complementar a resposta.

REGRA PRINCIPAL:

A pesquisa Web deve servir à pergunta do usuário.

Nunca use resultados encontrados na Web como motivo para
começar a falar de outro assunto.

Se a pergunta for simples e conversacional, converse.

Se houver uma pergunta factual ou um assunto para pesquisar,
pesquise e responda ao assunto solicitado.

Se os resultados forem insuficientes ou conflitantes,
explique isso claramente.

Nunca invente informações para preencher lacunas.

Você pode pesquisar sobre:
- Notícias
- Ciência
- Tecnologia
- Inteligência artificial
- História
- Geografia
- Economia
- Empresas
- Pessoas públicas
- Esportes
- Atualidades
- Programação
- Computação
- Produtos
- Comparações
- Informações recentes
- Outros assuntos que precisem de informação atualizada.

Seu objetivo principal neste modo é PESQUISAR, ANALISAR E EXPLICAR.
`;

/**
 * ============================================================
 * ESCOLHA DO PROMPT
 * ============================================================
 */

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

/**
 * ============================================================
 * DETECÇÃO DE CONVERSA NORMAL
 * ============================================================
 */

function isCasualConversation(
	message: string,
): boolean {
	const normalized =
		message
			.toLowerCase()
			.normalize("NFD")
			.replace(
				/[\u0300-\u036f]/g,
				"",
			)
			.trim()
			.replace(
				/[!?.,;:]+$/g,
				"",
			)
			.replace(
				/\s+/g,
				" ",
			);

	if (!normalized) {
		return true;
	}

	const casualMessages = new Set([
		"ola",
		"oi",
		"oie",
		"hey",
		"hello",
		"bom dia",
		"boa tarde",
		"boa noite",
		"tudo bem",
		"como estas",
		"como voce esta",
		"como voce ta",
		"como vai",
		"tudo certo",
		"tudo tranquilo",
		"como voce esta hoje",
		"obrigado",
		"obrigada",
		"valeu",
		"obrigado pela ajuda",
		"obrigada pela ajuda",
		"ate logo",
		"ate mais",
		"adeus",
	]);

	return casualMessages.has(
		normalized,
	);
}

/**
 * ============================================================
 * PESQUISA WEB — TAVILY
 * ============================================================
 */

async function searchWeb(
	query: string,
	env: NexoraEnv,
): Promise<TavilyResponse | null> {
	const apiKey =
		env.TAVILY_API_KEY;

	if (!apiKey) {
		console.error(
			"Nexora: TAVILY_API_KEY não configurada.",
		);

		return null;
	}

	try {
		const response =
			await fetch(
				"https://api.tavily.com/search",
				{
					method: "POST",

					headers: {
						"Content-Type":
							"application/json",

						Authorization:
							`Bearer ${apiKey}`,
					},

					body: JSON.stringify({
						query,

						search_depth:
							"basic",

						topic:
							"general",

						max_results:
							5,

						include_answer:
							true,

						include_raw_content:
							false,

						include_images:
							false,
					}),
				},
			);

		if (!response.ok) {
			const errorText =
				await response.text();

			console.error(
				"Tavily HTTP error:",
				response.status,
				errorText,
			);

			return null;
		}

		const data =
			(await response.json()) as TavilyResponse;

		return data;
	} catch (error) {
		console.error(
			"Nexora: erro na pesquisa Web:",
			error,
		);

		return null;
	}
}

/**
 * ============================================================
 * CONSTRUIR CONTEXTO DA WEB
 * ============================================================
 */

function buildWebContext(
	search: TavilyResponse,
): string {
	const results =
		Array.isArray(
			search.results,
		)
			? search.results
			: [];

	if (
		results.length === 0
	) {
		return "";
	}

	const sources =
		results
			.map(
				(result, index) => {
					const title =
						result.title ||
						"Fonte sem título";

					const url =
						result.url ||
						"URL não disponível";

					const content =
						result.content ||
						"Conteúdo não disponível";

					return `
FONTE ${index + 1}
Título: ${title}
URL: ${url}
Conteúdo:
${content}
`;
				},
			)
			.join("\n");

	const answer =
		typeof search.answer ===
		"string"
			? search.answer
			: "";

	return `
============================================================
RESULTADOS DA PESQUISA WEB
============================================================

Resposta resumida fornecida pela pesquisa:
${answer}

Fontes encontradas:
${sources}

============================================================
INSTRUÇÕES PARA USAR A WEB
============================================================

Use os resultados acima como informação externa.

Use somente as informações que sejam relevantes
para a pergunta do usuário.

Não mude o assunto da pergunta.

Não invente informações que não estejam nos resultados
ou no seu conhecimento confiável.

Se houver conflito entre fontes, informe o usuário.

Quando usar uma informação encontrada na Web,
mencione as fontes relevantes quando apropriado.

Não diga que uma fonte afirma algo que ela não apresenta.

============================================================
`;
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
		const url =
			new URL(request.url);

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
				env as NexoraEnv,
			);
		}

		return env.ASSETS.fetch(
			request,
		);
	},
} satisfies ExportedHandler<Env>;

/**
 * ============================================================
 * PROCESSAMENTO DO CHAT
 * ============================================================
 */

async function handleChatRequest(
	request: Request,
	env: NexoraEnv,
): Promise<Response> {
	try {
		const body =
			(await request.json()) as {
				messages?: ChatMessage[];
				mode?: string;
			};

		const messages:
			ChatMessage[] =
			Array.isArray(
				body.messages,
			)
				? body.messages
				: [];

		const mode =
			body.mode;

		const systemPrompt =
			getSystemPrompt(mode);

		const recentMessages =
			messages
				.filter(
					(message) =>
						message.role !==
						"system",
				)
				.slice(-20);

		/**
		 * ========================================================
		 * PESQUISA WEB
		 * ========================================================
		 *
		 * Só pesquisa automaticamente no modo PESQUISA.
		 *
		 * Mensagens puramente conversacionais, como "Olá",
		 * não são enviadas para a pesquisa Web.
		 */

		let webContext = "";

		if (
			mode === "research" &&
			recentMessages.length > 0
		) {
			const lastUserMessage =
				[...recentMessages]
					.reverse()
					.find(
						(message) =>
							message.role ===
							"user",
					);

			if (
				lastUserMessage &&
				typeof lastUserMessage.content ===
					"string"
			) {
				const searchQuery =
					lastUserMessage.content.trim();

				if (
					searchQuery &&
					!isCasualConversation(
						searchQuery,
					)
				) {
					const search =
						await searchWeb(
							searchQuery,
							env,
						);

					if (search) {
						webContext =
							buildWebContext(
								search,
							);
					}
				}
			}
		}

		/**
		 * ========================================================
		 * PROMPT FINAL
		 * ========================================================
		 */

		const finalSystemPrompt =
			systemPrompt +
			(webContext
				? `\n\n${webContext}`
				: "");

		const finalMessages:
			ChatMessage[] = [
				{
					role: "system",
					content:
						finalSystemPrompt,
				},
				...recentMessages,
			];

		/**
		 * ========================================================
		 * CLOUDFLARE WORKERS AI
		 * ========================================================
		 */

		const inputs = {
			messages:
				finalMessages,

			max_tokens:
				1024,

			stream:
				true,
		} satisfies AiTextGenerationInput & {
			stream: true;
		};

		const stream =
			await env.AI.run<
				typeof MODEL_ID
			>(
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
