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

export function Bot() {
  const { messages } = useChat()
  const [isWindowOpen, setIsWindowOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [prompt, setPrompt] = useState('') // Estado para capturar el input del usuario
  const [botMessages, setBotMessages] = useState(messages) // Estado para manejar los mensajes del bot
  const [loading, setLoading] = useState(false); // Estado para manejar la carga



  const allowedTopics = ["cacta", "energías limpias", "sustentabilidad", "medio ambiente"];
  const keywordResponses = [
    {
      keywords: ["Cacta", "Cacta software", "app Cacta"],
      response: "Cacta es una app de sustentabilidad que automatiza, calcula y reporta el impacto ambiental de tu empresa."
    },
    {
      keywords: ["Más que un Software", "Cacta es más que un software", "más que un software agrícola"],
      response: "Cacta es mucho más que un software; es la puerta al futuro de la industria agrícola, ayudando a automatizar procesos y mejorar la eficiencia."
    },
    {
      keywords: ["Vista 360", "vista 360 Cacta", "información en una pantalla"],
      response: "Cacta ofrece una vista 360, centralizando toda tu información en una pantalla para simplificar el análisis ambiental y mejorar la toma de decisiones."
    },
    {
      keywords: ["Eficiencia", "mejorar eficiencia", "más eficiencia"],
      response: "Con Cacta puedes mejorar la eficiencia de tu empresa, eliminando procesos manuales y automatizando la captura de datos."
    },
    {
      keywords: ["Informes automáticos", "reportes automáticos", "generación de informes"],
      response: "Cacta genera informes automáticos, lo que te permite estar al tanto de regulaciones internacionales y mantener reportes actualizados sin esfuerzo."
    },
    {
      keywords: ["Indicadores ambientales", "12 indicadores claves", "mide impacto ambiental"],
      response: "Cacta ofrece 12 indicadores clave para entender y comunicar el impacto ambiental de tu empresa, desde cambio climático hasta agotamiento de recursos."
    },
    {
      keywords: ["Monitoreo", "alertas en tiempo real", "monitoreo ambiental"],
      response: "Con Cacta puedes monitorear tu impacto ambiental en tiempo real y recibir alertas configurables para actuar rápidamente."
    },
    {
      keywords: ["Monitoreo por establecimiento", "control por establecimiento", "monitoreo por campo"],
      response: "Cacta permite el monitoreo por establecimiento, asegurando un control completo de las operaciones, recursos y rendimientos en cada campo."
    },
    {
      keywords: ["Monitoreo por producto", "trazabilidad de productos", "monitoreo por producto"],
      response: "Cacta proporciona trazabilidad del uso de recursos y las emisiones generadas por tus actividades, ayudando a mejorar la eficiencia y la sustentabilidad."
    },
    {
      keywords: ["Declaraciones ambientales", "EPD", "declaraciones ambientales de producto"],
      response: "Cacta incluye Declaraciones Ambientales de Producto, mostrando el impacto ambiental a lo largo de todo el ciclo de vida del material."
    },
    {
      keywords: ["Cálculo medioambiental", "cálculo de huella ambiental", "cálculo de impacto ambiental"],
      response: "Cacta centraliza toda tu información en una sola pantalla, permitiendo identificar de forma sencilla los principales contribuyentes de tu huella ambiental."
    },
    {
      keywords: ["Cadena de valor", "impacto en la cadena de valor", "indicadores cadena de valor"],
      response: "Cacta desagrega los indicadores de impacto para cada actor de tu cadena de valor, facilitando el reporte según los estándares internacionales."
    },
    {
      keywords: ["Reportes EPD", "declaraciones ambientales EPD", "reportes de sostenibilidad"],
      response: "Cacta ofrece reportes EPD (Declaraciones Ambientales de Producto) siguiendo la normativa ISO-14025, asegurando que cumples con las regulaciones ambientales."
    },
    {
      keywords: ["Eco Score", "indicador Eco Score", "cálculo Eco Score"],
      response: "Cacta calcula tu Eco Score, un único indicador de performance ambiental basado en benchmarks internacionales, para comunicar tu progreso de manera confiable."
    },
    {
      keywords: ["Misión", "propósito de Cacta", "misión de Cacta"],
      response: "Nuestra misión es apoyar a la industria primaria en su transformación hacia un futuro sustentable."
    },
    {
      keywords: ["Decisiones informadas", "tomar decisiones informadas", "información para decisiones"],
      response: "Nuestro principal objetivo es que las empresas tomen decisiones informadas, reduciendo su impacto ambiental y optimizando su eficiencia operativa."
    },
    {
      keywords: ["Conexión a sistemas de gestión", "integración con sistemas de gestión", "conexión a software"],
      response: "Cacta se conecta a tu sistema de gestión, obteniendo información confiable y con trazabilidad."
    },
    {
      keywords: ["Desarrollo agrícola", "software agrícola", "solución agrícola"],
      response: "Cacta es software desarrollado por y para agricultores bajo la metodología de Análisis de Ciclo de Vida (LCA)."
    },
    {
      keywords: ["Gestión sustentable", "gestión ambiental", "automación de gestión"],
      response: "Cacta ofrece paneles e informes automatizados que harán de tu gestión sustentable una labor simple y eficaz."
    },
    {
      keywords: ["Registro de emisiones", "emisiones al medio ambiente", "registro ambiental"],
      response: "Cacta cuenta con un algoritmo optimizado que registra más de 70.000 emisiones al suelo, aire y agua, y 27.000 registros ambientales."
    },
    {
      keywords: ["Certificación", "solución certificada", "cumplimiento de estándares"],
      response: "Cacta es una solución certificada, alineada a los estándares europeos y la normativa ISO 14040/44, siendo la herramienta más completa del mercado."
    },
    {
      keywords: ["Personalización", "herramienta personalizada", "solución a medida"],
      response: "Cacta es una herramienta customizada a tus necesidades, adecuada para pequeños, medianos y grandes productores."
    },
    {
      keywords: ["Sustentabilidad en la agricultura", "agricultura sustentable", "producción sustentable"],
      response: "Cacta promueve la sustentabilidad en la agricultura, ayudando a los productores a reducir su impacto ambiental mientras optimizan sus operaciones."
    }
  ];


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
    const fallbackResponses = [
      "Parece que tu pregunta no está en mis áreas de especialización. Sin embargo, puedo ofrecerte información sobre energías limpias, sustentabilidad, o el funcionamiento de nuestra aplicación. ¿Te gustaría explorar alguno de estos temas?",
      "No tengo información específica sobre ese asunto, pero estoy aquí para ayudarte con temas relacionados con energías renovables, la eficiencia ambiental, o el impacto de la agricultura en el medio ambiente. ¿Te interesa alguno de ellos?",
      "Lamento no entender tu pregunta. ¿Podrías darme más detalles o ser más específico sobre lo que necesitas? Estoy aquí para ayudarte.",
      "No tengo información sobre ese tema en particular. Pero puedo ofrecerte información sobre el uso sostenible de recursos, la gestión ambiental, o cómo nuestra aplicación puede ayudarte a optimizar tu impacto. ¿Te gustaría saber más?",
      "¿Podrías reformular tu pregunta o darme un poco más de contexto? Así podré ofrecerte una respuesta más precisa y útil.",
      "Lo siento, no tengo la información que buscas. Pero si estás interesado en conocer más sobre la sostenibilidad, el análisis de ciclo de vida, o cómo mejorar tu eficiencia operativa, házmelo saber.",
      "Puedo ayudarte mejor si me proporcionas más detalles. ¿Qué aspecto de la sostenibilidad o la eficiencia ambiental te gustaría que exploremos juntos?",
      "No tengo datos sobre ese tema. Sin embargo, puedo ayudarte a entender cómo gestionar tus emisiones, o cómo utilizar nuestro software para mejorar tu impacto ambiental. ¿Te gustaría eso?"
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
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

    const normalizedPrompt = normalizePrompt(prompt);

    // Agregar el mensaje del usuario
    setBotMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: prompt }]);

    // Limpiar el input
    setPrompt('');

    // Verificar si el prompt contiene alguna palabra clave
    const keywordResponse = keywordResponses.find(item => item.keywords.some(keyword => normalizedPrompt.includes(keyword.toLowerCase())));

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

    // Establecer estado de carga si no hay coincidencia con las palabras clave ni el tema es inválido
    setLoading(true);

    try {
      // Obtener respuesta de IA
      const response = await completion();
      // Agregar respuesta del bot
      setBotMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: response }
      ]);
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
              {botMessages.map(message => (
                <div key={message.id} className={`text-sm font-normal flex mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-black text-white' : 'bg-gray-100'}`}>
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
                className="flex-grow"
                id='chat-input'
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
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
