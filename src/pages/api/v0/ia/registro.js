import db from '../../../../lib/db';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { nome, email, senha } = req.body;

  // Validação dos campos obrigatórios
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  try {
    // Verifica se o email já existe
    const [existente] = await db.execute(
      'SELECT id FROM clientes WHERE email = ?',
      [email]
    );

    if (existente.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10);
    const createdAt = new Date();

    // Insere novo cliente no banco
    await db.execute(
      'INSERT INTO clientes (nome, email, senha_hash, createdAt) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, createdAt]
    );

    return res.status(201).json({ mensagem: 'Cliente registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar cliente:', error); // Log do erro no terminal
    return res.status(500).json({ error: 'Erro interno ao registrar cliente' });
  }
}