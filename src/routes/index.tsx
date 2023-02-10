import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useStore,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { UserIcon } from "~/components/icons/user";
import { getModels } from "~/routes/api/models/models-api";
import { ChatMessages } from "~/routes/chat-messages";
import { ChatMessage } from "~/routes/chat-message";
import { QwikLogo } from "~/components/icons/qwik";
import { getMessage } from "~/routes/api/chat/chat-api";

export type Message = {
  date: Date;
  prompt: string;
  response: string;
};

type State = {
  model: string;
  prompt: string;
  messages: Message[];
  message: string;
};

export default component$(() => {
  const store = useStore<State>({
    model: "text-davinci-003",
    prompt: "",
    messages: [],
    message: "",
  });

  const modelResource = useResource$<string[] | null>(async ({ cleanup }) => {
    const controller = new AbortController();
    cleanup(() => controller.abort());

    return getModels(controller);
  });

  const chatResource = useResource$(async ({ track, cleanup }) => {
    track(() => store.prompt);

    const controller = new AbortController();
    cleanup(() => controller.abort());

    if (store.prompt === "") {
      return Promise.resolve(null);
    }

    const response = await getMessage(store.prompt, store.model, controller);

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      const prevMessage = store.message;
      store.message = prevMessage + chunkValue;
    }

    if (store.message) {
      store.messages = [
        ...store.messages,
        {
          date: new Date(),
          prompt: store.prompt,
          response: store.message,
        },
      ];
    }

    store.messages = store.messages.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    store.prompt = "";

    return response;
  });

  useClientEffect$(() => {
    if (localStorage.getItem("messages")) {
      store.messages = JSON.parse(localStorage.getItem("messages")!);
    }
  });

  useClientEffect$(async ({ track }) => {
    track(() => store.messages);
    localStorage.setItem("messages", JSON.stringify(store.messages));
  });

  return (
    <>
      <section class={`flex gap-1 flex-col flex-1 w-full m-auto `}>
        <ChatMessages messages={store.messages} />
        {store.message}
        <Resource
          value={chatResource}
          onPending={() => (
            <>
              <ChatMessage>
                <div q:slot="icon">
                  <UserIcon />
                </div>
                {store.prompt}
              </ChatMessage>

              <ChatMessage>
                <div q:slot="icon">
                  <QwikLogo />
                </div>
                <div class="animate-pulse carousel-item mt-4 self-center">
                  <div class="rounded-box bg-white h-4 w-2"></div>
                </div>
              </ChatMessage>
            </>
          )}
          onRejected={(error) => <>{error}</>}
          onResolved={(chat) => <>{chat}</>}
        />
      </section>
      <section class="flex justify-center py-4">
        <form class={`w-full`}>
          <div class="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700 max-w-screen-xl w-full mx-auto">
            <div class="flex mr-4 w-full">
              <label for="models" class="sr-only">
                Choose a model
              </label>
              <select
                onchange$={(e) => {
                  // @ts-ignore
                  store.model = e.target.value;
                }}
                id="models"
                name="models"
                class={
                  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg border-r-gray-100 dark:border-r-gray-700 border-r-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-[240px]"
                }
              >
                <Resource
                  value={modelResource}
                  onPending={() => <>Loading</>}
                  onResolved={(models) => (
                    <>
                      {models &&
                        models.map((model: string) =>
                          model === store.model ? (
                            <option value={model} selected>
                              {model}
                            </option>
                          ) : (
                            <option value={model}>{model}</option>
                          )
                        )}
                    </>
                  )}
                />
              </select>

              <label for="chat" class="sr-only">
                What do you want to ask QwikChat?
              </label>
              <textarea
                name="prompt"
                id="prompt"
                rows={1}
                class="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-r-lg border border-gray-300 focus:ring-blue-500 border-r-2 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="What do you want to ask QwikChat?"
                onkeypress$={(event: KeyboardEvent) => {
                  if (event.key === "Enter") {
                    const textarea = document.getElementById(
                      "prompt"
                    ) as HTMLTextAreaElement;
                    store.prompt = textarea.value;
                    textarea.value = "";
                  }
                }}
              ></textarea>
            </div>
            <button
              onClick$={() => {
                store.prompt = "";
                store.messages = [];
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
