'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, BotIcon, Send, Rocket } from 'lucide-react'
import { getLlamaCompletion } from '@/lib/llama'
import "./bot.css"
import { keywordResponses } from '@/lib/consts'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

let messageCounter = 0;


export function Bot() {
  const [isWindowOpen, setIsWindowOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [prompt, setPrompt] = useState('') // Estado para capturar el input del usuario
  type BotMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
  };

  const [botMessages, setBotMessages] = useState<BotMessage[]>([]) // Estado para manejar los mensajes del bot
  const [loading, setLoading] = useState(false); // Estado para manejar la carga
  const [hasGreeted, setHasGreeted] = useState(false); // Para verificar si ya saludó

  // Función para obtener la respuesta de IA
  const completion = async () => {
    const response = await getLlamaCompletion(prompt)
    return response
  }

  const normalizePrompt = (prompt: string) => {
    return prompt
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ""); // Elimina los acentos
  }

  // const isValidPrompt = (prompt: string) => {
  //   return allowedTopics.some(topic => prompt.includes(topic.toLowerCase()));
  // };

  // const generateFallbackResponse = () => {
  //   return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  // }

  const handleToggleWindow = () => {
    setIsAnimating(true)
    document.getElementById('chat-input')?.focus({ preventScroll: true });
    setIsWindowOpen(prev => !prev)

    if (!isWindowOpen) {
      // Limpiar el chat si se cierra
      setBotMessages([])

      // Saludar al abrir el chat por primera vez
      if (!hasGreeted) {
        setBotMessages([{ id: Date.now().toString(), role: 'assistant', content: "¡Hola! Soy Cacta AI Assistant. Estoy para brindarte más información sobre nuestra App." }]);
        setHasGreeted(true);
      }
    }
  }

  const generateUniqueId = () => {
    return `${Date.now()}-${messageCounter++}`;
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() === '') return;

    setLoading(true); // Iniciar el indicador de escritura
    const normalizedPrompt = normalizePrompt(prompt);

    // Agregar el mensaje del usuario con ID único
    setBotMessages(prev => [...prev, { id: generateUniqueId(), role: 'user', content: prompt }]);
    setPrompt('');

    // Verificar si hay respuesta basada en palabras clave
    const keywordResponse = keywordResponses.find(item => item.keywords.some(keyword => normalizedPrompt.includes(normalizePrompt(keyword))));

    // Si no hay coincidencia, pasa el control a la IA directamente
    if (!keywordResponse) {
      try {
        const response = await completion();
        setBotMessages(prev => [...prev, { id: generateUniqueId(), role: 'assistant', content: response }]);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        setBotMessages(prev => [
          ...prev,
          { id: generateUniqueId(), role: 'assistant', content: "Lo siento, hubo un problema al procesar tu solicitud. Inténtalo de nuevo más tarde." }
        ]);
      }
      setLoading(false);
      return;
    }

    // Si hay una respuesta de palabras clave, mostrarla
    setTimeout(() => {
      setBotMessages(prev => [
        ...prev,
        { id: generateUniqueId(), role: 'assistant', content: keywordResponse.response }
      ]);
      setLoading(false);
    }, 3000);
  };


  useEffect(() => {
    const isAnimatingTimeout = setTimeout(() => {
      setIsAnimating(false)
    }, 300);
    return () => clearTimeout(isAnimatingTimeout);
  }, [isAnimating]);

  useEffect(() => {
    const scrollArea = document.getElementById('scroll');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [botMessages, loading]);



  return (
    <div className="fixed inset-0 sm:bottom-4 sm:right-4 sm:inset-auto flex items-end justify-end">
      <div
        className={`w-full h-full sm:w-[400px] sm:h-auto transition-all duration-300 ease-in-out ${isWindowOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-full pointer-events-none'}`}
      >
        <Card className="w-full h-full sm:h-auto flex flex-col">
          <CardHeader className="flex-shrink-0 py-4 ">
            <CardTitle className="flex font-black text-base justify-between items-center">
              Cacta AI Chatbot
              <Button variant="ghost" size="icon" onClick={handleToggleWindow} aria-label="Close window">
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent id='scroll' className="flex-grow overflow-y-scroll pt-4 max-h-[80vh]">
            <ScrollArea className="h-full pr-4">
              {botMessages.map(message => (
                <div key={message.id} className={`text-sm font-normal flex mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-black text-white' : 'bg-white border'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && <div className="text-gray-500 text-sm font-bold animate-pulse">Cacta AI Assistant is typing...</div>}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Can I help you with something?"
                className="flex-grow focus-visible:ring-1 focus-visible:ring-black "
                id='chat-input'
              />
              <Button type="submit">
                <Send className="size-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
      <div className={`fixed bottom-4 right-4 transition-all duration-300 ease-in-out ${!isWindowOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-full pointer-events-none'}`}>
        <HoverCard>
          <HoverCardTrigger>
            <Button id='open-bot' onClick={handleToggleWindow} className="outline outline-2 rounded-md outline-[#007d67]">
              <BotIcon className="h-6 w-6" />
            </Button> </HoverCardTrigger>
          <HoverCardContent>
            <div className="p-2">
              <p className="text-sm font-black flex">AI Chatbot - Powered by Team Cacta Tech <Rocket /></p>
              <p className="text-sm">You can chat with the AI and get answers to your questions about our sustentability app.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>


      </div>
    </div>
  )
}
