'use server';

const LLAMA_API_URL = 'https://api.llama-api.com/chat/completions';

export const getLlamaCompletion = async (userInput: string) => {
   const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
   };

   // Definir un prompt que establece las restricciones de tema
   const prompt = `
      Actúa como un experto en sustentabilidad y software sustentable. 
      Responde solo preguntas relacionadas con la sustentabilidad, el software que ofrece Cacta, 
      y cómo Cacta contribuye a un futuro más sostenible. 
      Ignora cualquier pregunta sobre temas no relacionados.
      Aquí está la pregunta del usuario: ${userInput}
   `;

   const requestBody = {
      model: "llama3.1-70b", // Modelo especificado
      messages: [{ role: 'user', content: prompt }],
      "functions": [
         {
            "name": "get_section_info",
            "description": "Proporciona información detallada sobre una sección específica del sitio web.",
            "parameters": {
               "type": "object",
               "properties": {
                  "section": {
                     "type": "string",
                     "description": "Nombre de la sección sobre la que se solicita información (e.g., 'HERO', 'SECTION_SOLUTION', 'SECTION_FEATURES', 'SECTION_WHYCACTA')."
                  }
               },
               "required": ["section"]
            }
         },
         {
            "name": "list_features",
            "description": "Enumera las características y funcionalidades principales del software de Cacta.",
            "parameters": {
               "type": "object",
               "properties": {
                  "section": {
                     "type": "string",
                     "description": "Nombre de la sección específica para describir las funcionalidades detalladas (e.g., 'SECTION_FEATURES')."
                  },
                  "include_details": {
                     "type": "boolean",
                     "description": "Determina si se incluyen descripciones detalladas de cada funcionalidad."
                  }
               },
               "required": ["section"]
            }
         },
         {
            "name": "get_call_to_action",
            "description": "Proporciona el mensaje principal de llamada a la acción para inspirar al usuario a iniciar el proceso de contacto.",
            "parameters": {
               "type": "object",
               "properties": {
                  "action_type": {
                     "type": "string",
                     "description": "Especifica el tipo de acción que el usuario podría querer realizar, como 'contacto', 'información del producto' o 'ver demo'."
                  }
               },
               "required": ["action_type"]
            }
         },
         {
            "name": "show_partner_info",
            "description": "Proporciona información sobre los socios de la empresa.",
            "parameters": {
               "type": "object",
               "properties": {
                  "details_level": {
                     "type": "string",
                     "enum": ["breve", "detallado"],
                     "description": "Nivel de detalle para mostrar información de los socios, 'breve' o 'detallado'."
                  }
               },
               "required": ["details_level"]
            }
         },
         {
            "name": "submit_contact_form",
            "description": "Simula el envío de un formulario de contacto en el sitio web, proporcionando respuesta de confirmación.",
            "parameters": {
               "type": "object",
               "properties": {
                  "name": {
                     "type": "string",
                     "description": "Nombre de la persona que contacta."
                  },
                  "company": {
                     "type": "string",
                     "description": "Nombre de la empresa de la persona que contacta."
                  },
                  "email": {
                     "type": "string",
                     "description": "Correo electrónico de la persona que contacta."
                  },
                  "message": {
                     "type": "string",
                     "description": "Mensaje o consulta de la persona que contacta."
                  }
               },
               "required": ["name", "email", "message"]
            }
         },
         {
            "name": "get_environmental_impact_data",
            "description": "Proporciona un resumen de los impactos ambientales claves medidos por el software.",
            "parameters": {
               "type": "object",
               "properties": {
                  "indicators": {
                     "type": "array",
                     "items": {
                        "type": "string",
                        "enum": [
                           "Cambio climático",
                           "Biodiversidad",
                           "Salud humana",
                           "Agotamiento de recursos"
                        ]
                     },
                     "description": "Lista de indicadores ambientales para los cuales se solicita información."
                  }
               },
               "required": ["indicators"]
            }
         },
         {
            "name": "get_kpi_performance",
            "description": "Proporciona un análisis detallado del rendimiento de los indicadores clave de rendimiento (KPI).",
            "parameters": {
               "type": "object",
               "properties": {
                  "kpi_type": {
                     "type": "string",
                     "description": "Tipo de KPI para el cual se solicita un análisis (e.g., 'eco_score', 'performance')."
                  }
               },
               "required": ["kpi_type"]
            }
         },
         {
            "name": "get_product_environmental_declaration",
            "description": "Proporciona detalles sobre las declaraciones ambientales de producto (EPD) para un producto específico.",
            "parameters": {
               "type": "object",
               "properties": {
                  "product_name": {
                     "type": "string",
                     "description": "Nombre del producto para el cual se solicita la declaración ambiental."
                  }
               },
               "required": ["product_name"]
            }
         }
      ]

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
