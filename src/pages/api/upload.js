import { put } from '@vercel/blob';
import formidable from 'formidable-serverless';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const tiposPermitidos = [
  '.mp3', '.wav',       // Áudio
  '.mp4', '.webm',      // Vídeo
  '.jpg', '.jpeg', '.png', '.gif', // Imagens
  '.pdf', '.docx', '.xlsx', '.txt' // Documentos
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erro ao processar o upload:', err);
      return res.status(500).json({ error: 'Erro ao processar o upload' });
    }

    const file = files.arquivo;
    if (!file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    // ✅ Aqui usamos file.path corretamente
    const filePath = file.path;
    const nomeArquivo = file.originalFilename || file.name || 'arquivo';

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Caminho do arquivo inválido' });
    }

    const ext = path.extname(nomeArquivo).toLowerCase();

    if (!tiposPermitidos.includes(ext)) {
      return res.status(400).json({
        error: `Tipo de arquivo "${ext}" não permitido`
      });
    }

    try {
      const stream = fs.createReadStream(filePath);

      if (!process.env.VERCEL_BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({ error: 'Token Vercel Blob não configurado' });
      }

      const blob = await put(nomeArquivo, stream, {
        access: 'public',
        token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
      });

      return res.status(200).json({
        mensagem: 'Upload realizado com sucesso',
        url: blob.url,
        tipo: ext,
      });
    } catch (uploadError) {
      console.error('Erro no upload:', uploadError);
      return res.status(500).json({ error: 'Falha no upload do arquivo' });
    }
  });
}