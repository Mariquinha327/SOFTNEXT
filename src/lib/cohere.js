import { CohereApi } from 'cohere-ai';

const cohere = new CohereApi({
  token: process.env.COHERE_API_KEY,
});

export async function generateResponse(message, context = '') {
  try {
    const response = await cohere.generate({
      model: 'command',
      prompt: `${context}\n\nPergunta: ${message}\nResposta:`,
      max_tokens: 300,
      temperature: 0.7,
    });
    
    return response.generations[0].text.trim();
  } catch (error) {
    throw new Error('Erro ao gerar resposta: ' + error.message);
  }
}

export async function chatWithCohere(message, chatHistory = [], context = '') {
  try {
    const response = await cohere.chat({
      model: 'command',
      message: message,
      chat_history: chatHistory,
      preamble: context,
    });
    
    return response.text;
  } catch (error) {
    throw new Error('Erro no chat: ' + error.message);
  }
}
