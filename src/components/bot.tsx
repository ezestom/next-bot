'use client'

import { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, BotIcon, Send } from 'lucide-react'
import { getLlamaCompletion } from '@/lib/llama' // Importa tu función de IA
import "./bot.css"
import { keywordResponses, allowedTopics, fallbackResponses } from '@/lib/consts'

export function Bot() {
  const { messages } = useChat()
  const [isWindowOpen, setIsWindowOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [prompt, setPrompt] = useState('') // Estado para capturar el input del usuario
  const [botMessages, setBotMessages] = useState(messages) // Estado para manejar los mensajes del bot
  const [loading, setLoading] = useState(false); // Estado para manejar la carga


  // Función para obtener la respuesta de IA
  const completion = async () => {
    const response = await getLlamaCompletion(prompt)
    return response
  }

  // Normaliza el prompt antes de agregar el mensaje
  const normalizePrompt = (prompt: string) => {
    return prompt
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ""); // Elimina los acentos
  }

  // Función para validar el prompt del usuario que contenga los siguientes tópicos
  const isValidPrompt = (prompt: string) => {
    return allowedTopics.some(topic => prompt.includes(topic.toLowerCase()));
  };

  // Función que genera una respuesta alternativa si el prompt es inválido
  const generateFallbackResponse = () => {
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  const handleToggleWindow = () => {
    const chatInput = document.getElementById('chat-input')
    if (chatInput) chatInput.focus({ preventScroll: true })
    setIsAnimating(true)
    setIsWindowOpen(prev => !prev)
    // limpia el chat si se cierra
    if (!isWindowOpen) setBotMessages([])
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() === '') return; // Evitar enviar mensajes vacíos

    const normalizedPrompt = normalizePrompt(prompt);

    // Agregar el mensaje del usuario
    setBotMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: prompt }]);

    // Limpiar el input
    setPrompt('');

    // Verificar si el prompt contiene alguna palabra clave
    const keywordResponse = keywordResponses.find(item => item.keywords.some(keyword => normalizedPrompt.includes(normalizePrompt(keyword))));

    if (keywordResponse) {
      // Si encuentra una coincidencia con una palabra clave, mostrar la respuesta predefinida
      setBotMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: keywordResponse.response }
      ]);
      return; // Salir de la función
    }

    // Verificar si el prompt contiene temas permitidos
    if (!isValidPrompt(normalizedPrompt)) {
      // Si el prompt no es válido, generar una respuesta alternativa
      const fallbackResponse = generateFallbackResponse();
      setBotMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: fallbackResponse }
      ]);
      return; // Salir de la función
    }

    // Establecer estado de carga para simular typing

    setLoading(true);
    try {
      // Obtener respuesta de IA
      await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo

      // Obtener respuesta de IA
      const response = await completion();

      // Agregar respuesta del bot
      setBotMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: response }]);

    } catch (error) {
      // Manejar cualquier error
      console.error("Error fetching AI response:", error);
      setBotMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: "Lo siento, hubo un problema al procesar tu solicitud. Inténtalo de nuevo más tarde." }
      ]);
    } finally {
      // Restablecer el estado de carga
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(true), 500) // Match this with the CSS transition duration
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

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
              {loading && <div className="text-gray-500 text-sm font-bold">Cacta AI Assistant is typing...</div>}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)} // Capturar el input del usuario
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
        <Button onClick={handleToggleWindow} className="shadow-lg">
          <BotIcon className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
