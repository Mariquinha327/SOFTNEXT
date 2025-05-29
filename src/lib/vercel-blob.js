import { put, del, list } from '@vercel/blob';

export async function uploadFile(file, fileName) {
  try {
    const blob = await put(fileName, file, {
      access: 'public',
    });
    return blob.url;
  } catch (error) {
    throw new Error('Erro ao fazer upload do arquivo: ' + error.message);
  }
}

export async function deleteFile(url) {
  try {
    await del(url);
    return true;
  } catch (error) {
    throw new Error('Erro ao deletar arquivo: ' + error.message);
  }
}

export async function listFiles() {
  try {
    const { blobs } = await list();
    return blobs;
  } catch (error) {
    throw new Error('Erro ao listar arquivos: ' + error.message);
  }
}