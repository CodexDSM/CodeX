// Importa as bibliotecas necessárias
import multer from 'multer';
import { extname, resolve } from 'path';

// Gera um nome de arquivo aleatório para evitar que arquivos com o mesmo nome se sobreponham
const aleatorio = () => Math.floor(Math.random() * 10000 + 10000);

// Configuração principal do Multer
export default {
  // Filtro para garantir que apenas arquivos de imagem (PNG e JPG/JPEG) sejam aceitos
  fileFilter: (req, file, cb) => {
    // Verifica se o tipo do arquivo (mimetype) é png ou jpeg
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
      // Se não for, retorna um erro
      return cb(new multer.MulterError('Arquivo precisa ser PNG ou JPG.'));
    }
    // Se for, permite o upload
    return cb(null, true);
  },

  // Define como os arquivos serão armazenados
  storage: multer.diskStorage({
    // Define a pasta de destino dos arquivos
    destination: (req, file, cb) => {
      // O caminho é relativo a partir da raiz do projeto.
      // __dirname é o diretório atual, '..' sobe um nível, 'uploads' é a pasta de destino.
      cb(null, resolve(__dirname, '..', '..', 'uploads', 'images'));
    },
    // Define o nome do arquivo que será salvo
    filename: (req, file, cb) => {
      // Usa a data atual, um número aleatório e a extensão original do arquivo
      // Ex: 1663545600000_12345.png
      cb(null, `${Date.now()}_${aleatorio()}${extname(file.originalname)}`);
    },
  }),
};
