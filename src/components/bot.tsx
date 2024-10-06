'use client'

import { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, BotIcon } from 'lucide-react'
import { getLlamaCompletion } from '@/lib/llama'  // Importa tu función de IA
import "./bot.css"

export function Bot() {
  const { messages } = useChat()
  const [isWindowOpen, setIsWindowOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [prompt, setPrompt] = useState('') // Estado para capturar el input del usuario
  const [botMessages, setBotMessages] = useState(messages) // Nuevo estado para manejar los mensajes del bot
  const [loading, setLoading] = useState(false); // Estado para manejar la carga

  // Función para obtener la respuesta de IA
  const completion = async () => {
    const response = await getLlamaCompletion(prompt)
    return response
  }

  // Función para validar el prompt del usuario que que tenga los siguientes tópicos
  const isValidPrompt = (prompt: string) => {
    const allowedTopics = [
      "sustentabilidad",
      "energias renovables",
      "Cacta",
      "control de sustentabilidad",
      "medio ambiente",
      "impacto social",
      "cambio climático",
      "eficiencia energética",
      "reciclaje",
      "energía solar",
      "energía eólica",
      "energía hidroeléctrica",
    ]
    const normalizedPrompt = prompt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    return allowedTopics.some(topic => normalizedPrompt.includes(topic))
  }

  const handleToggleWindow = () => {
    const chatInput = document.getElementById('chat-input')
    if (chatInput) chatInput.focus({ preventScroll: true })
    setIsAnimating(true)
    setIsWindowOpen(prev => !prev)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() === '') return; // Evitar enviar mensajes vacíos

    // Normaliza el prompt antes de agregar el mensaje
    const normalizedPrompt = prompt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    // Agregar el mensaje del usuario
    setBotMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: prompt }]);

    // Limpiar el input
    setPrompt('');

    // Verificar si el prompt es válido antes de procesar
    if (!isValidPrompt(normalizedPrompt)) {
      // Si el prompt no es válido, enviar mensaje informativo
      setBotMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Te puedo ayudar en temas relacionados con la sustentabilidad, impacto ambiental, energías renovables y mucho más." }]);
      return; // Salir de la función
    }

    // Establecer estado de carga
    setLoading(true);

    try {
      // Obtener respuesta de IA
      const response = await completion();
      // Agregar respuesta del bot
      setBotMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: response }]);
    } catch (error) {
      // Manejar cualquier error
      console.error("Error fetching AI response:", error);
      setBotMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Lo siento, no pude procesar tu solicitud." }]);
    } finally {
      // Restablecer el estado de carga
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300) // Match this with the CSS transition duration
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
            <CardTitle className="flex justify-between items-center">
              Cacta AI Chatbot
              <Button variant="ghost" size="icon" onClick={handleToggleWindow} aria-label="Close window">
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent id='scroll' className="flex-grow overflow-y-scroll pt-4 max-h-[80vh]">
            <ScrollArea className="h-full pr-4">
              {botMessages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 leading-normal text-sm ${message.role === 'assistant' ? 'text-blue-600' : 'text-green-600 '}`}
                >
                  <strong>{message.role === 'assistant' ? 'Cacta AI Assistant: ' : 'You: '}</strong>
                  {message.content}
                </div>
              ))}
              {loading && <div className="text-gray-500">Cacta AI Assistant is typing...</div>}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)} // Capturar el input del usuario
                placeholder="Can I help you with something?"
                className="flex-grow"
                id='chat-input'
              />
              <Button type="submit">Send</Button>
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
