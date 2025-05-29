import db from '../../../../lib/db';
import { verifyToken } from '../../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verifica o token e extrai o cliente
    const user = verifyToken(req);
    const cliente_id = user.id;

    const {
      nome_atendente,
      tom_linguagem,
      mensagem_boas_vindas,
      idioma,
      regras_especificas,
      horarios_atendimento,
      produtos_servicos,
      documentos_referencia
    } = req.body;

    // Verificação de campos obrigatórios
    if (!cliente_id || !nome_atendente || !tom_linguagem || !mensagem_boas_vindas || !idioma) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Define valores padrão para campos opcionais
    const regras = regras_especificas ?? '';
    const horarios = horarios_atendimento ?? '';
    const produtos = produtos_servicos ?? '';
    const docs = Array.isArray(documentos_referencia)
      ? JSON.stringify(documentos_referencia)
      : JSON.stringify([]);

    const createdAt = new Date();

    // Verifica se já existe configuração
    const [existing] = await db.execute(
      'SELECT id FROM config_ia WHERE cliente_id = ?',
      [cliente_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Configuração já existe para este cliente' });
    }

    // Insere nova configuração
    await db.execute(`
      INSERT INTO config_ia (
        cliente_id,
        nome_atendente,
        tom_linguagem,
        mensagem_boas_vindas,
        idioma,
        regras_especificas,
        horarios_atendimento,
        produtos_servicos,
        documentos_referencia,
        createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cliente_id,
      nome_atendente,
      tom_linguagem,
      mensagem_boas_vindas,
      idioma,
      regras,
      horarios,
      produtos,
      docs,
      createdAt
    ]);

    return res.status(201).json({ mensagem: 'Configuração criada com sucesso' });

  } catch (error) {
    console.error('Erro ao criar configuração:', error);
    return res.status(500).json({ error: 'Erro ao criar configuração' });
  }
}
