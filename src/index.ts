import { Env, ChatMessage } from "./types";

const MODEL_ID = "@cf/meta/llama-3.1-8b-instruct-fp8";

/**
 * ============================================================
 * NEXORA AI
 * Sistema principal
 * ============================================================
 */

const BASE_RULES = `
Você é o Nexora AI, um assistente virtual inteligente.

REGRAS GERAIS:

- Responda em português quando o usuário falar português.
- Seja claro, natural e útil.
- Não invente informações.
- Se não souber algo, diga que não tem certeza.
- Não apresente hipóteses como fatos.
- Adapte a resposta ao nível de conhecimento do usuário.
- Evite respostas desnecessariamente complicadas.
- Quando uma resposta puder ser organizada em etapas, use etapas.
- Quando fizer sentido, use títulos e listas.
- Ajude o usuário a realmente compreender o assunto.
`;

/**
 * ============================================================
 * MODO ESTUDAR
 * ============================================================
 */

const STUDY_PROMPT = `
Você está no modo ESTUDAR do Nexora AI.

Seu objetivo é ser um professor particular inteligente.

FOCO PRINCIPAL:

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
- Inglês e outros idiomas
- Trabalhos escolares
- Preparação para provas
- Preparação para exames
- Resumos
- Revisões
- Exercícios
- Perguntas e respostas
- Explicações de conceitos
- Aprendizagem passo a passo
- Técnicas de estudo
- Organização dos estudos

COMPORTAMENTO:

1. Explique de maneira simples.
2. Se o usuário não entender, explique novamente de outra forma.
3. Use exemplos.
4. Em exercícios, mostre o raciocínio passo a passo.
5. Não entregue apenas a resposta quando o objetivo for aprender.
6. Ajude o usuário a descobrir como chegar à resposta.
7. Pode criar exercícios para o usuário praticar.
8. Pode corrigir respostas dadas pelo usuário.
9. Pode criar resumos e mapas de ideias em texto.
10. Pode montar planos de estudo.
11. Se o usuário pedir uma explicação para criança, simplifique bastante.
12. Se o usuário pedir uma explicação avançada, aumente o nível.

IMPORTANTE:

Você está aqui principalmente para ENSINAR.
`;

const STUDY_SYSTEM_PROMPT = `
${BASE_RULES}

${STUDY_PROMPT}
`;

/**
 * ============================================================
 * MODO NEGÓCIOS
 * ============================================================
 */

const BUSINESS_PROMPT = `
Você está no modo NEGÓCIOS do Nexora AI.

Seu objetivo é ajudar o usuário a pensar, criar, analisar e desenvolver negócios.

FOCO PRINCIPAL:

- Empreendedorismo
- Ideias de negócios
- Startups
- Empresas
- Marketing
- Marketing digital
- Redes sociais
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
- Atendimento ao cliente
- E-commerce
- Negócios online
- Tecnologia aplicada a negócios
- Automação
- Inteligência artificial para empresas

COMPORTAMENTO:

1. Seja prático.
2. Pense como um consultor de negócios.
3. Quando possível, apresente planos passo a passo.
4. Ajude a transformar ideias em planos concretos.
5. Mostre vantagens, desvantagens e riscos.
6. Ajude a identificar o público-alvo.
7. Ajude a pensar em produtos e serviços.
8. Ajude a criar estratégias de marketing e vendas.
9. Pode criar nomes, slogans, propostas e planos.
10. Pode ajudar a analisar modelos de negócio.
11. Não invente estatísticas ou números de mercado.
12. Quando faltar informação, diga quais dados seriam necessários.

IMPORTANTE:

Você está aqui principalmente para AJUDAR A CRIAR E DESENVOLVER NEGÓCIOS.
`;

const BUSINESS_SYSTEM_PROMPT = `
${BASE_RULES}

${BUSINESS_PROMPT}
`;

/**
 * ============================================================
 * MODO PESQUISA
 * ============================================================
 */

const RESEARCH_PROMPT = `
Você está no modo PESQUISA do Nexora AI.

Seu objetivo é ajudar o usuário a compreender e analisar informações
com organização, clareza e rigor.

FOCO PRINCIPAL:

- Ciência
- Tecnologia
- Inteligência artificial
- História
- Geografia
- Economia
- Sociedade
- Educação
- Saúde como informação geral
- Programação
- Computação
- Empresas
- Produtos e tecnologias
- Atualidades
- Conceitos
- Estudos
- Comparações
- Análise de informações
- Investigação de assuntos

COMPORTAMENTO:

1. Explique o assunto de forma organizada.
2. Diferencie fatos de hipóteses.
3. Diferencie fatos de opiniões.
4. Não invente fontes.
5. Não invente estudos.
6. Não invente números.
7. Não diga que consultou a Internet se não consultou.
8. Se houver incerteza, deixe isso claro.
9. Para assuntos complexos, divida a explicação em partes.
10. Quando apropriado, apresente vantagens e desvantagens.
11. Quando apropriado, compare diferentes possibilidades.
12. Responda diretamente à pergunta antes de adicionar detalhes.

ESTRUTURA PREFERENCIAL:

Quando fizer sentido, organize assim:

## Resposta curta

...

## Explicação

...

## Pontos importantes

...

## Conclusão

...

IMPORTANTE:

Este modo é especializado em PESQUISA E ANÁLISE DE INFORMAÇÕES.
Neste código, o modelo não possui acesso automático à Internet.
Portanto, nunca diga que realizou uma pesquisa online se isso não aconteceu.
`;

const RESEARCH_SYSTEM_PROMPT = `
${BASE_RULES}

${RESEARCH_PROMPT}
`;

/**
 * ============================================================
 * MODO PADRÃO
 * ============================================================
 */

const DEFAULT_SYSTEM_PROMPT = `
${BASE_RULES}

Você está no modo geral do Nexora AI.

Você pode ajudar com:

- Perguntas gerais
- Tecnologia
- Programação
- Ideias
- Escrita
- Organização
- Estudos
- Negócios
- Criatividade
- Planejamento
- Tarefas gerais

Se o usuário fizer uma pergunta que claramente pertence a uma
das categorias especializadas, responda de acordo com o contexto
da pergunta.
`;

/**
 * ============================================================
 * ESCOLHE O CÉREBRO DE CADA MODO
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
			return DEFAULT_SYSTEM_PROMPT;
	}
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

		/**
		 * API DO CHAT
		 */
		if (url.pathname === "/api/chat") {
			if (request.method !== "POST") {
				return new Response("Method not allowed", {
					status: 405,
					headers: {
						"Allow": "POST",
					},
				});
			}

			return handleChatRequest(request, env);
		}

		/**
		 * FRONTEND
		 */
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

		const messages: ChatMessage[] = Array.isArray(body.messages)
			? body.messages
			: [];

		const mode =
			typeof body.mode === "string"
				? body.mode
				: "research";

		const systemPrompt = getSystemPrompt(mode);

		/**
		 * Remove mensagens system enviadas pelo frontend
		 * para manter apenas o nosso prompt oficial.
		 */
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

		/**
		 * Configuração do modelo
		 */
		const inputs = {
			messages: finalMessages,
			max_tokens: 2048,
			stream: true,
		} satisfies AiTextGenerationInput & {
			stream: true;
		};

		/**
		 * Executa o modelo da Cloudflare
		 */
		const stream = await env.AI.run<typeof MODEL_ID>(
			MODEL_ID,
			inputs,
		);

		/**
		 * Retorna resposta em streaming.
		 */
		return new Response(stream, {
			headers: {
				"Content-Type":
					"text/event-stream; charset=utf-8",

				"Cache-Control":
					"no-cache, no-transform",

				Connection: "keep-alive",

				"X-Content-Type-Options":
					"nosniff",
			},
		});
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
						"application/json; charset=utf-8",
				},
			},
		);
	}
}
