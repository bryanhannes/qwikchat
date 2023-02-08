import { component$, Slot } from "@builder.io/qwik";

export const ChatMessage = component$(() => {
  return (
    <>
      <div
        class={`p-4 bg-gray-100 dark:bg-gray-600 dark:text-white flex flex-nowrap justify-between items-center mx-auto max-w-screen-xl w-full rounded-lg`}
      >
        <div class={"w-10 mr-8 self-center"}>
          <Slot name="icon" />
        </div>
        <div class={"w-full"}>
          <Slot />
        </div>
      </div>
    </>
  );
});
