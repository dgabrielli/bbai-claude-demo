"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, AriaResponse, ProposedAction, AuditLogEntry } from "@/lib/types";
import { routeIntent } from "@/lib/intentRouter";

interface ChatPanelProps {
  onNewMessage: (response: AriaResponse) => void;
  onProposedActions: (actions: ProposedAction[]) => void;
  onAuditLog: (entry: AuditLogEntry) => void;
}

const SUGGESTED_PROMPTS = [
  "Why is Floor 9 so hot today?",
  "Any anomalies in HVAC right now?",
  "Summarize energy usage vs yesterday.",
  "Create a work order for the likely cause.",
];

export default function ChatPanel({
  onNewMessage,
  onProposedActions,
  onAuditLog,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "aria",
      content:
        "Hello! I'm Aria, your building engineer assistant. Ask me about HVAC systems, alerts, energy usage, or create work orders. Try one of the suggested prompts below!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastContextRef = useRef<AriaResponse | undefined>();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Add audit log entry for query
    const queryEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "Query",
      summary: userMessage.content,
      status: "Completed",
    };
    onAuditLog(queryEntry);

    // DEMO LOGIC: Process intent (simulated delay for realism)
    setTimeout(() => {
      const response: AriaResponse = routeIntent(userMessage.content, lastContextRef.current);
      lastContextRef.current = response;

      const ariaMessage: ChatMessage = {
        id: `aria-${Date.now()}`,
        role: "aria",
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, ariaMessage]);
      setIsProcessing(false);

      // Update proposed actions
      const proposedActions: ProposedAction[] = response.recommendations.map((rec, index) => ({
        id: `action-${Date.now()}-${index}`,
        description: rec,
        status: "Proposed",
        priority: index + 1,
        timestamp: new Date().toISOString(),
      }));
      onProposedActions(proposedActions);

      // Notify parent of new response
      onNewMessage(response);
    }, 300); // Small delay to simulate processing
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Chat with your building</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-900 border border-gray-200 shadow-sm"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === "user" ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 border-t border-gray-200 bg-white">
        <div className="flex flex-wrap gap-2 mb-2">
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border border-gray-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your building..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
