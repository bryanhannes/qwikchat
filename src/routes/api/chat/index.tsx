import type { RequestHandler } from "@builder.io/qwik-city";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

interface ChatRequestBody {
  prompt: string;
  model: string | null;
}

export const onPost: RequestHandler = async ({ request, send }) => {
  const chatRequestBody: ChatRequestBody = await request.json();

  const payload: OpenAIStreamPayload = {
    model: chatRequestBody.model ? chatRequestBody.model : "text-davinci-003",
    prompt: `You are a genius chatbot named QwikChat. When users asks you something you do your best to answer in a polite and professional way. This is a prompt: ${chatRequestBody.prompt}`,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);

  send(new Response(stream));
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

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  // console.log(JSON.stringify(payload));

  const res = await fetch("https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env["OPENAI_API"] ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  return new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].text;
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        console.log(decoder.decode(chunk));
        parser.feed(decoder.decode(chunk));
      }
    },
  });
}
