// app/components/AIChatBox.tsx
"use client";
import { useState } from "react";

export default function AIChatBox({ analysis }: { analysis: any }) {
  const [messages, setMessages] = useState([
    { role: "system", text: "You can now ask follow-up questions about your health analysis." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);

    // Skicka till backend (t.ex. /api/healthchat)
    const res = await fetch("/api/healthchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          ...newMessages,
          { role: "system", text: `Here is the user's health analysis: ${JSON.stringify(analysis)}` }
        ]
      }),
    });
    const data = await res.json();

    // Ta bort fetstil (**)
    const cleanReply = (data.reply || "").replace(/\*\*/g, "");

    setMessages([...newMessages, { role: "assistant", text: cleanReply }]);
    setInput("");
    setLoading(false);
  }

  // Styckeindelning: dela på dubbla radbrytningar eller \n\n
  function renderParagraphs(text: string) {
    return text
      .split(/\n\s*\n/) // dela på tomma rader
      .map((para, i) => (
        <p key={i} className="mb-3 whitespace-pre-line">{para.trim()}</p>
      ));
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center my-8 border border-[#4B2E19]/20">
      <div className="w-full h-64 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        {messages.slice(1).map((msg, i) => (
          <div
            key={i}
            className={`mb-4 text-base ${
              msg.role === "user"
                ? "text-right text-[#4B2E19] font-medium"
                : "text-left text-gray-900"
            }`}
          >
            {renderParagraphs(msg.text)}
          </div>
        ))}
        {loading && (
          <div className="text-left text-gray-500 italic animate-pulse">Dietitian is typing...</div>
        )}
      </div>
      <div className="flex w-full">
        <input
          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none text-black bg-white"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask the dietitian anything about your analysis..."
          disabled={loading}
          onKeyDown={e => {
            if (e.key === "Enter" && input.trim()) sendMessage();
          }}
        />
        <button
          className="bg-[#4B2E19] text-white px-4 py-2 rounded-r-lg font-semibold disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}