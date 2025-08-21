"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import type { ChatMessage } from "@leas-academy/shared";
import { Card, Button, Icon } from "@master-aesthetics-suite/ui";

export default function StudentAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      text: "Welcome! How can I help you with your studies today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: currentInput,
    };
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      text: "",
    };

    // Use the state before the update for the API call
    const historyForApi = messages;

    // Perform a single, atomic state update for a smoother UI experience
    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput, history: historyForApi }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text();
        throw new Error(errText || "Failed to get a response from the server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantResponse += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, text: assistantResponse }
              : msg,
          ),
        );
      }
    } catch (e: unknown) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Sorry, I couldn't get a response.`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, text: `Error: ${errorMessage}` }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="flex items-center mb-4">
        <Icon name="sparkles" className="w-6 h-6 text-gold" />
        <h2 className="text-xl font-playfair font-semibold text-slate ml-2">
          Student Assistant
        </h2>
      </div>
      <div
        className="flex-grow overflow-y-auto pr-2 space-y-4 bg-ivory p-4 rounded-xl border border-smoke"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gold/20 flex-shrink-0 flex items-center justify-center">
                <Icon name="message-circle" className="w-5 h-5 text-gold" />
              </div>
            )}
            <div
              className={`p-3 rounded-xl max-w-xs md:max-w-sm ${msg.role === "user" ? "bg-slate text-ivory rounded-br-none" : "bg-smoke/60 text-charcoal rounded-bl-none"}`}
            >
              <p
                className={`text-sm ${isLoading && msg.role === "assistant" && msg.text === "" ? "animate-pulse" : ""}`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.text === "" ? "..." : msg.text}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="text-red-500 text-sm mt-2 px-1">{error}</p>}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="w-full p-3 border-2 border-smoke rounded-xl focus:outline-none focus:ring-2 focus:ring-gold transition"
          disabled={isLoading}
          aria-label="Your message"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="!p-3 !rounded-xl"
          aria-label="Send message"
        >
          <Icon name="send" className="w-5 h-5" />
        </Button>
      </form>
    </Card>
  );
}
