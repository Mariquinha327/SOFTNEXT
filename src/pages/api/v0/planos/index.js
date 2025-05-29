import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

async function handler(req, res) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      return await getPlanos(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Método ${method} não permitido` });
  }
}

async function getPlanos(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT 
        id,
        nome,
        preco_mensal,
        limite_conversas_mensal,
        historico_disponivel,
        uso_documentos,
        integra_whatsapp,
        created_at
      FROM planos 
      ORDER BY 
        CASE nome 
          WHEN 'Grátis' THEN 1 
          WHEN 'Starter' THEN 2 
          WHEN 'Pro' THEN 3 
        END
    `);

    // Formatear preços e recursos
    const planosFormatados = rows.map(plano => ({
      ...plano,
      preco_mensal: parseFloat(plano.preco_mensal),
      recursos: {
        limite_conversas: plano.limite_conversas_mensal,
        historico_disponivel: !!plano.historico_disponivel,
        uso_documentos: !!plano.uso_documentos,
        integra_whatsapp: !!plano.integra_whatsapp
      }
    }));

    return res.status(200).json({
      planos: planosFormatados
    });

  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withAuth(handler);
