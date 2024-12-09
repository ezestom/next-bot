'use server';

const LLAMA_API_URL = 'https://api.llama-api.com/chat/completions';

export const getLlamaCompletion = async (userInput: string) => {
   const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
   };

   // Definir un prompt optimizado para el chatbot
   const prompt = `
   Actúa como un experto en sustentabilidad y en el software sustentable desarrollado por Cacta. 
   Tu objetivo es responder exclusivamente a preguntas relacionadas con los siguientes temas:
   1. La sustentabilidad: prácticas y estrategias para mejorar la sostenibilidad en empresas.
   2. El software de Cacta: sus características, funcionalidades, beneficios y cómo ayuda a las empresas a ser más sostenibles.
   3. La contribución de Cacta al futuro sostenible: cómo Cacta está promoviendo la transformación positiva en el sector agrícola y más allá.

   Reglas de interacción:
   - Si el usuario escribe en inglés, responde en inglés. Si el usuario escribe en español, responde en español.
   - Responde de manera clara, detallada y práctica. Utiliza ejemplos específicos, listas de características y datos relevantes para enriquecer tus respuestas.
   - No respondas preguntas que no estén relacionadas con los temas anteriores.
   
   Aquí está la pregunta del usuario: ${userInput}
`;

   const requestBody = {
      model: "llama3.1-70b", // Modelo especificado
      messages: [{ role: 'user', content: prompt }],
      // "functions": [
      //    {
      //       "name": "get_section_info",
      //       "description": "Proporciona información detallada sobre una sección específica del sitio web.",
      //       "parameters": {
      //          "type": "object",
      //          "properties": {
      //             "section": {
      //                "type": "string",
      //                "description": "Nombre de la sección sobre la que se solicita información (e.g., 'HERO', 'SECTION_SOLUTION', 'SECTION_FEATURES', 'SECTION_WHYCACTA')."
      //             }
      //          },
      //          "required": ["section"]
      //       }
      //    }
      // ]

   };

   try {
      const response = await fetch(LLAMA_API_URL, {
         method: 'POST',
         headers,
         body: JSON.stringify(requestBody)
      });

      // Verificar respuesta
      if (!response.ok) {
         const errorData = await response.json();
         console.error('Error from API:', errorData);
         throw new Error(`Error ${response.status}: ${errorData.detail || 'Failed to fetch completion from Llama API'}`);
      }

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
         return data.choices[0].message.content;
      } else {
         throw new Error('No choices returned from API');
      }
   } catch (e) {
      console.error(e);
      throw new Error('Failed to fetch completion from Llama API');
   }
};
