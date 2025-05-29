import db from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

async function handler(req, res) {
  const { method } = req;
  
  switch (method) {
    case 'POST':
      return await ativarPlano(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Método ${method} não permitido` });
  }
}

async function ativarPlano(req, res) {
  try {
    const { cliente_id, plano_id, duracao_meses = 1 } = req.body;

    if (!cliente_id || !plano_id) {
      return res.status(400).json({ 
        error: 'cliente_id e plano_id são obrigatórios' 
      });
    }

    // Verificar se o plano existe
    const [planoExists] = await db.execute(
      'SELECT id, nome FROM planos WHERE id = ?',
      [plano_id]
    );

    if (planoExists.length === 0) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    const plano = planoExists[0];

    // Desativar plano atual se existir
    await db.execute(`
      UPDATE plano_cliente 
      SET ativo = FALSE 
      WHERE cliente_id = ? AND ativo = TRUE
    `, [cliente_id]);

    // Calcular datas
    const dataInicio = new Date();
    const dataExpiracao = new Date();
    dataExpiracao.setMonth(dataExpiracao.getMonth() + parseInt(duracao_meses));

    // Ativar novo plano
    const [result] = await db.execute(`
      INSERT INTO plano_cliente (
        cliente_id, plano_id, ativo, data_inicio, data_expiracao, conversas_usadas
      ) VALUES (?, ?, TRUE, ?, ?, 0)
    `, [
      cliente_id, 
      plano_id, 
      dataInicio.toISOString().split('T')[0],
      dataExpiracao.toISOString().split('T')[0]
    ]);

    return res.status(201).json({
      message: 'Plano ativado com sucesso',
      plano_cliente_id: result.insertId,
      plano_nome: plano.nome,
      data_inicio: dataInicio.toISOString().split('T')[0],
      data_expiracao: dataExpiracao.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Erro ao ativar plano:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withAuth(handler);

