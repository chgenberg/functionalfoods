"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, HelpCircle } from 'lucide-react';
import { useLanguage, useT } from '@/app/lib/i18n/LanguageProvider';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import UserProfileSummary from './UserProfileSummary';
import Link from 'next/link';
import { useErrorHandler } from '../lib/errorHandler';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatBot() {
  const { locale } = useLanguage();
  const t = useT();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { withErrorHandling } = useErrorHandler();

  // Check if we're on dashboard page
  const isDashboardPage = pathname.startsWith('/dashboard/');

  useEffect(() => { setIsClient(true); }, []);

  // Allow external trigger to open chat
  useEffect(() => {
    if (isAdmin) return; // skip on admin
    const handler = () => setIsOpen(true);
    window.addEventListener('openChatBot' as any, handler);
    return () => window.removeEventListener('openChatBot' as any, handler);
  }, [isAdmin]);

  // Ensure welcome message follows current language and only once at start
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: t('chat.welcome','Hej! Jag är Functional Foods AI‑assistent, fråga mig vad du vill om Functional Foods, hälsa och recept...'),
        sender: 'bot',
        timestamp: new Date()
      }]);
    } else if (messages.length === 1 && messages[0].id === 'welcome') {
      // Update welcome message if language changed
      setMessages([{
        id: 'welcome',
        text: t('chat.welcome','Hej! Jag är Functional Foods AI‑assistent, fråga mig vad du vill om Functional Foods, hälsa och recept...'),
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [t, locale]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: inputValue, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const result = await withErrorHandling(
      async () => {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/personalized-chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: userMessage.text, locale })
        });

        if (!response.ok) throw new Error('Failed to get response');
        const data = await response.json();
        return data.message;
      },
      'ChatBot.sendMessage',
      (errorMessage) => {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: errorMessage || t('chat.error','Ursäkta, något gick fel. Försök igen senare eller kontakta oss på hej@functionalfoods.se'),
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    );

    if (result) {
      const botMessage: Message = { id: (Date.now() + 1).toString(), text: result, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    }

    setIsLoading(false);
  };

  const exampleQuestions: string[] = [
    t('chat.example1','Vad är functional foods?'),
    t('chat.example2','Vilka livsmedel är bra för inflammation?'),
    t('chat.example3','Hur kan jag förbättra min maghälsa?'),
    t('chat.example4','Hur kan jag få mer energi?')
  ];

  if (isAdmin) return null;
  return (
    <>
      {/* Chat Button - Now visible on mobile too */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 sm:bottom-20 right-6 z-40 bg-primary text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 ${isOpen ? 'scale-0' : 'scale-100'}`}
        aria-label="Öppna chat"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Chat Window - Responsive */}
      <div className={`fixed inset-4 sm:bottom-6 sm:right-6 sm:inset-auto z-50 sm:w-96 sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        {/* Header */}
        <div className="bg-primary text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image src="/Ulrika_portratt/Ulrika3.jpg?v=1" alt="Ulrika AI:sson" width={40} height={40} className="rounded-full border-2 border-white object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-semibold">Ulrika AI:sson</h3>
              <p className="text-xs opacity-90">{t('chat.ready','Alltid redo att hjälpa')}</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Button */}
        <div className="bg-primary/90 px-4 py-2 border-t border-white/20">
          <Link 
            href="/kontakt/formular" 
            className="block w-full text-center bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Jag vill ha personlig rådgivning →
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <UserProfileSummary compact={true} />
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                {message.sender === 'bot' ? (
                  <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {isClient ? message.timestamp.toLocaleTimeString(locale === 'sv' ? 'sv-SE' : locale === 'en' ? 'en-GB' : locale === 'es' ? 'es-ES' : locale === 'de' ? 'de-DE' : 'fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Example Questions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">{t('chat.examples','Vanliga frågor:')}</p>
            <div className="space-y-1">
              {exampleQuestions.map((question, index) => (
                <button key={index} onClick={() => setInputValue(question)} className="w-full text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('chat.placeholder','Skriv ditt meddelande...')}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} className={`p-2 rounded-full transition-all ${inputValue.trim() && !isLoading ? 'bg-primary text-white hover:bg-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* AI Policy Link */}
          <div className="mt-2 text-center">
            <Link 
              href="/ai-policy" 
              className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs transition-colors"
              title="Läs vår AI Policy"
            >
              <HelpCircle className="w-3 h-3" />
              <span>AI-assisterad rådgivning - Läs vår AI Policy</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 
