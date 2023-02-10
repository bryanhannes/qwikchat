import { getMessageStream } from "~/routes/api/chat/chat-api";

export interface ChatRequestBody {
  prompt: string;
  model: string | null;
}

export const config = {
  runtime: "edge",
};

export interface OpenAIStreamPayload {
  model: string;
  prompt: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

export const onPost = async (req: Request): Promise<Response> => {
  const chatRequestBody: ChatRequestBody = await req.json();

  if (!chatRequestBody.prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  if (!chatRequestBody.model) {
    return new Response("No model in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    prompt: `You are a genius chatbot named QwikChat. When users asks you something you do your best to answer in a polite and professional way. This is a prompt: ${chatRequestBody.prompt}`,
    model: chatRequestBody.model ? chatRequestBody.model : "text-davinci-003",
    max_tokens: 100,
    temperature: 0.5,
    stream: true,
    frequency_penalty: 0,
    presence_penalty: 0,
    top_p: 0,
    n: 1,
  };

  const stream = await getMessageStream(payload);
  return new Response(stream);
};
