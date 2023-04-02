import {
  component$,
  Resource,
  useResource$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import type { CreateCompletionResponse } from "openai";
import { getModels } from "~/routes/api/models/models-api";
import { ChatMessages } from "~/routes/chat-messages";
import { isServer } from "@builder.io/qwik/build";
import { SendIcon } from "~/components/icons/send";

export type Message = {
  date: Date;
  prompt: string;
  response: string;
};

export default component$(() => {
  const model = useSignal("");
  const prompt = useSignal("");
  const messages = useSignal<Message[]>([]);

  const modelResource = useResource$<string[] | null>(async ({ cleanup }) => {
    const controller = new AbortController();
    cleanup(() => controller.abort());

    return getModels(controller).then((models) => {
      return [...new Set(models)].sort();
    });
  });

  const chatResource = useResource$<CreateCompletionResponse | null>(
    async ({ track, cleanup }) => {
      track(prompt);

      const controller = new AbortController();
      cleanup(() => controller.abort());

      if (prompt.value === "") {
        return Promise.resolve(null);
      }

      const response = await fetch(`http://localhost:5173/api/chat`, {
        signal: controller?.signal,
        method: "POST",
        body: JSON.stringify({
          prompt: prompt.value,
          model: model.value,
        }),
      });

      // This data is a ReadableStream
      const data = response.body;

      if (!data) {
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      messages.value = [
        ...messages.value,
        { date: new Date(), prompt: prompt.value, response: "" },
      ];

      const lastMessageIndex = messages.value.length - 1;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        // update the last message in a immutable way
        messages.value = messages.value.map((message, index) => {
          if (index === lastMessageIndex) {
            return {
              ...message,
              response: message.response + chunkValue,
            };
          }
          return message;
        });
      }

      prompt.value = "";

      return messages.value[lastMessageIndex].response;
    }
  );

  useTask$(({ track }) => {
    track(model);

    if (isServer) {
      return; // Server guard
    }

    localStorage.setItem("model", JSON.stringify(model.value));
  });

  useTask$(({ track }) => {
    track(messages);

    if (isServer) {
      return; // Server guard
    }

    localStorage.setItem("messages", JSON.stringify(messages.value));
  });

  useVisibleTask$(() => {
    // Save history of messages between browser refresh
    if (localStorage.getItem("model")) {
      model.value = JSON.parse(localStorage.getItem("model") || "");
    }
    if (localStorage.getItem("messages")) {
      messages.value = JSON.parse(localStorage.getItem("messages") || "");
    }
  });

  return (
    <>
      <section class={`flex gap-1 flex-col flex-1 w-full m-auto `}>
        <ChatMessages messages={messages.value} />
        <Resource
          value={chatResource}
          onRejected={(error) => <>{error}</>}
          onResolved={(chat) => <>{chat}</>}
        />
      </section>
      <section class="flex justify-center py-4">
        <form class={`w-full`}>
          <div class="flex flex-col sm:flex-row items-center p-2 gap-2 rounded-lg bg-gray-50 dark:bg-gray-700 max-w-screen-xl w-full mx-auto">
            <div class="flex w-full">
              <label for="models" class="sr-only">
                Choose a model
              </label>

              <Resource
                value={modelResource}
                onPending={() => <>Loading</>}
                onResolved={(models) => (
                  <>
                    <select
                      onchange$={(e) => {
                        // @ts-ignore
                        model.value = e.target.value;
                      }}
                      value={model.value}
                      id="models"
                      name="models"
                      class={
                        "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg border-r-gray-100 dark:border-r-gray-700 border-r-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-[240px]"
                      }
                    >
                      {models &&
                        models.map((model: string) => (
                          <option value={model} key={model}>
                            {model}
                          </option>
                        ))}
                    </select>
                  </>
                )}
              />

              <label for="chat" class="sr-only">
                What do you want to ask QwikChat?
              </label>
              <textarea
                name="prompt"
                id="prompt"
                rows={1}
                class="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-r-lg border border-gray-300 focus:ring-blue-500 border-r-2 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="What do you want to ask QwikChat?"
                value={prompt.value}
              ></textarea>
            </div>
            <button
              onclick$={() => {
                const textarea = document.getElementById(
                  "prompt"
                ) as HTMLTextAreaElement;
                prompt.value = textarea.value;
                textarea.value = "";
              }}
              type="button"
              class="p-2 text-red-900 bg-red-200 hover:bg-red-400 inline-flex flex-row gap-2 rounded-lg cursor-pointer"
            >
              <SendIcon></SendIcon>
              Send
            </button>
            <button
              onClick$={() => {
                prompt.value = "";
                messages.value = [];
              }}
              type="button"
              class="p-2 text-red-900 bg-red-200 hover:bg-red-400 inline-flex flex-row gap-2 rounded-lg cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
              Clear
              <span class="sr-only">Clear chats</span>
            </button>
          </div>
        </form>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "QwikChat",
  meta: [
    {
      name: "description",
      content: "QwikChat the ChatGPT powered chatbot",
    },
  ],
};
