import type { RefObject, UIEventHandler } from "react";

export type ChatMessage = {
  sender: string;
  message: string;
  time: string;
};

export type ChatFeedProps = {
  messages: ChatMessage[];
  name: string;
  chatFeedRef: RefObject<HTMLDivElement | null>;
  chatFeedEndRef: RefObject<HTMLDivElement | null>;
  handleScroll: UIEventHandler<HTMLDivElement>;
};

export type ChatFormProps = {
  name: string;
  setName: (value: string) => void;
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
};
