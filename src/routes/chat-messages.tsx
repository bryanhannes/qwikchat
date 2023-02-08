import { component$ } from "@builder.io/qwik";
import type { Message } from "~/routes/index";
import { UserIcon } from "~/components/icons/user";
import { QwikLogo } from "~/components/icons/qwik";
import { ChatMessage } from "~/routes/chat-message";

export type ChatMessageProps = {
  messages: Message[];
};

export const ChatMessages = component$((props: ChatMessageProps) => {
  return (
    <>
      {props.messages.map((message: Message) => (
        <>
          <ChatMessage>
            <div q:slot="icon">
              <UserIcon />
            </div>
            {message.prompt}
          </ChatMessage>
          <ChatMessage>
            <div q:slot="icon">
              <QwikLogo />
            </div>
            {message.response}
          </ChatMessage>
        </>
      ))}
    </>
  );
});
