'use server';

const LLAMA_API_URL = 'https://api.llama-api.com/chat/completions';

export const getLlamaCompletion = async (prompt: string) => {
   const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
   };

   try {
      const response = await fetch(LLAMA_API_URL, {
         method: 'POST',
         headers,
         body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }]
         })
      });

      // Verifica si la respuesta fue exitosa
      if (!response.ok) {
         const errorData = await response.json();
         console.error('Error from API:', errorData);
         throw new Error(`Error ${response.status}: ${errorData.message || 'Failed to fetch completion from Llama API'}`);
      }

      const data = await response.json();

      // Asegúrate de que el contenido esté disponible
      if (data.choices && data.choices.length > 0) {
         console.log(data.choices[0].message.content);
         return data.choices[0].message.content;
      } else {
         throw new Error('No choices returned from API');
      }
   } catch (e) {
      console.error(e);
      throw new Error('Failed to fetch completion from Llama API');
   }
};
