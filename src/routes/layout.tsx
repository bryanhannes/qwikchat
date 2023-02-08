import { component$, Slot } from "@builder.io/qwik";
import { QwikLogo } from "~/components/icons/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <header>
        <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-900">
          <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <Link href="/" class="flex items-center">
              <QwikLogo />
              <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white ml-2">
                QwikChat
              </span>
            </Link>
          </div>
        </nav>
      </header>
      <main class="bg-white dark:bg-gray-800 min-h-[calc(100vh-55px)] flex flex-col p-4 justify-between">
        <Slot />
      </main>
    </>
  );
});
