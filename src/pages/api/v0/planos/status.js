import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

async function handler(req, res) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      return await getStatusPlano(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Método ${method} não permitido` });
  }
}

async function getStatusPlano(req, res) {
  try {
    const { cliente_id } = req.query;

    if (!cliente_id) {
      return res.status(400).json({ error: 'cliente_id é obrigatório' });
    }

    const [rows] = await db.execute(`
      SELECT 
        pc.id,
        pc.cliente_id,
        pc.ativo,
        pc.data_inicio,
        pc.data_expiracao,
        pc.conversas_usadas,
        p.nome as plano_nome,
        p.preco_mensal,
        p.limite_conversas_mensal,
        p.historico_disponivel,
        p.uso_documentos,
        p.integra_whatsapp
      FROM plano_cliente pc
      JOIN planos p ON pc.plano_id = p.id
      WHERE pc.cliente_id = ? AND pc.ativo = TRUE
      ORDER BY pc.created_at DESC
      LIMIT 1
    `, [cliente_id]);

    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhum plano ativo encontrado para este cliente' 
      });
    }

    const planoAtivo = rows[0];
    const hoje = new Date();
    const dataExpiracao = new Date(planoAtivo.data_expiracao);
    
    const expirado = hoje > dataExpiracao;
    const diasRestantes = Math.ceil((dataExpiracao - hoje) / (1000 * 60 * 60 * 24));
    const percentualUso = (planoAtivo.conversas_usadas / planoAtivo.limite_conversas_mensal) * 100;
    const conversasRestantes = Math.max(0, planoAtivo.limite_conversas_mensal - planoAtivo.conversas_usadas);

    const status = {
      plano_ativo: !expirado,
      plano_nome: planoAtivo.plano_nome,
      preco_mensal: parseFloat(planoAtivo.preco_mensal),
      data_inicio: planoAtivo.data_inicio,
      data_expiracao: planoAtivo.data_expiracao,
      dias_restantes: expirado ? 0 : diasRestantes,
      expirado: expirado,
      conversas: {
        usadas: planoAtivo.conversas_usadas,
        limite: planoAtivo.limite_conversas_mensal,
        restantes: conversasRestantes,
        percentual_uso: Math.round(percentualUso)
      },
      recursos: {
        historico_disponivel: !!planoAtivo.historico_disponivel,
        uso_documentos: !!planoAtivo.uso_documentos,
        integra_whatsapp: !!planoAtivo.integra_whatsapp
      }
    };

    return res.status(200).json(status);

  } catch (error) {
    console.error('Erro ao obter status do plano:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withAuth(handler);