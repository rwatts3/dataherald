import { useChat } from "@/context/chat";
import { usePrompt } from "@/context/prompt";
import apiService from "@/services/api";
import { Message, MessageContent } from "@/types/chat";
import { useUser } from "@auth0/nextjs-auth0/client";
import { FC, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Header } from "../Layout/Header";
import { ChatInput } from "./ChatInput";
import { ChatKickoff } from "./ChatKickoff";
import { ChatMessage } from "./ChatMessage";

export const Chat: FC = () => {
  const { messages, setMessages, loading, setLoading, error } = useChat();
  const { user } = useUser();
  const { prompt, setPrompt } = usePrompt();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = useCallback(
    async (newUserMessage: string) => {
      const newMessage: Message = {
        role: "user",
        content: newUserMessage,
      };
      const updatedMessages: Message[] = [...messages, newMessage];
      setLoading(true);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: {
            status: "loading",
          },
        },
      ]);
      try {
        const chatResponse = await apiService.chat(
          updatedMessages,
          user?.email || ""
        );

        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            (message.content as MessageContent).status === "loading"
              ? {
                  role: "assistant",
                  content: chatResponse,
                }
              : message
          )
        );
      } catch (e) {
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            (message.content as MessageContent).status === "loading"
              ? {
                  role: "assistant",
                  content: {
                    status: "error",
                    generated_text:
                      "Something went wrong. Please try again later.",
                  },
                }
              : message
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [messages, setMessages, setLoading, user]
  );

  const handleExample = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage]
  );

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, loading, error]);

  useEffect(() => {
    if (prompt) {
      handleExample(prompt);
      setPrompt(null);
    }
  }, [prompt, setPrompt, handleExample]);

  return (
    <>
      {!messages.length ? (
        <div className="flex-1 flex flex-col gap-2 py-6">
          <Header title="Dataherald AI - Technical preview"></Header>
          <div className="flex-grow">
            <ChatKickoff onExampleClick={handleExample}></ChatKickoff>
          </div>
          <div className="mt-4">
            <ChatInput onSend={sendMessage} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col mb-4">
          <div className="flex flex-col flex-grow">
            {messages.map((message, index) => (
              <div key={index} className="my-4">
                <ChatMessage message={message} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <ChatInput onSend={sendMessage} />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </>
  );
};