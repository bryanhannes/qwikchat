import type { RequestHandler } from "@builder.io/qwik-city";
import type { CreateCompletionResponse } from "openai";
import { Configuration, OpenAIApi } from "openai";

interface ChatRequestBody {
  prompt: string;
  model: string | null;
}

export const onPost: RequestHandler<CreateCompletionResponse> = async ({
  request,
}) => {
  const configuration = new Configuration({
    apiKey: process.env["OPENAI_API"],
  });
  const openai = new OpenAIApi(configuration);

  const chatRequestBody: ChatRequestBody = await request.json();

  const response = await openai.createCompletion({
    prompt: `You are a genius chatbot named QwikChat. When users asks you something you do your best to answer in a polite and professional way. This is a prompt: ${chatRequestBody.prompt}`,
    model: chatRequestBody.model ? chatRequestBody.model : "text-davinci-003",
    max_tokens: 100,
    temperature: 0.5,
  });

  return response.data;
};
