import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializando a API do Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Função para gerar conteúdo com o modelo Gemini
export async function generateContent(prompt, options = {}) {
  try {
    // Modelo padrão Gemini Pro
    const modelName = options.model || 'gemini-pro';
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Gerando resposta
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    console.error('Erro ao gerar conteúdo com Google AI:', error);
    throw error;
  }
}

export { genAI };