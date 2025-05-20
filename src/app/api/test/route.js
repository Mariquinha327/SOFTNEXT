import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { executeQuery } from '@/lib/mysql/config';
import { generateContent } from '@/lib/ai/config';

export async function GET() {
  try {
    // Testando conexão com o Firebase
    const firebaseStatus = db ? 'Firebase conectado' : 'Erro na conexão com Firebase';
    
    // Testando conexão com MySQL
    let mysqlStatus = 'Erro na conexão com MySQL';
    try {
      await executeQuery({ query: 'SELECT 1' });
      mysqlStatus = 'MySQL conectado';
    } catch {
      // Manter o status de erro
    }
    
    // Testando a API do Google AI
    let aiStatus = 'Erro na conexão com Google AI';
    try {
      const content = await generateContent(); // Chamada à função
      // Se você tem uma lógica específica
      aiStatus = content ? 'Google AI gerou conteúdo com sucesso' : 'Falha ao gerar conteúdo';
    } catch (error) {
      aiStatus = `Erro na chamada para Google AI: ${error.message}`;
    }
    
    return NextResponse.json({
      status: 'success',
      connections: {
        firebase: firebaseStatus,
        mysql: mysqlStatus,
        googleAI: aiStatus
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}