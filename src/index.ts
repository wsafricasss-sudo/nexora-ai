import { Env, ChatMessage } from "./types";

const MODEL_ID = "@cf/meta/llama-3.1-8b-instruct-fp8";

const SYSTEM_PROMPT = `
Você é o Nexora AI, um assistente virtual inteligente, amigável e útil.

Regras:
- Responda em português quando o usuário falar português.
- Seja claro e objetivo.
- Ajude com programação, estudos, ideias, tecnologia e tarefas gerais.
- Não invente informações quando não tiver certeza.
- Use uma linguagem natural e fácil de entender.
`;

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		// API do chat
		if (url.pathname === "/api/chat") {
			if (request.method !== "POST") {
				return new Response("Method not allowed", {
					status: 405,
				});
			}

			return handleChatRequest(request, env);
		}

		// Arquivos do frontend
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
		};

		const messages: ChatMessage[] = Array.isArray(body.messages)
			? body.messages
			: [];

		// Limita o tamanho do histórico enviado ao modelo
		const recentMessages = messages
			.filter((message) => message.role !== "system")
			.slice(-20);

		const finalMessages: ChatMessage[] = [
			{
				role: "system",
				content: SYSTEM_PROMPT,
			},
			...recentMessages,
		];

		const inputs = {
			messages: finalMessages,
			max_tokens: 1024,
			stream: true,
		} satisfies AiTextGenerationInput & { stream: true };

		const stream = await env.AI.run<typeof MODEL_ID>(
			MODEL_ID,
			inputs,
		);

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream; charset=utf-8",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("Nexora AI error:", error);

		return new Response(
			JSON.stringify({
				error: "Não foi possível processar sua mensagem.",
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
