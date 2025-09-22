const multer = require('multer');
const path = require('path');

module.exports = {
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
      return cb(new multer.MulterError('Arquivo precisa ser do tipo PNG ou JPG.'));
    }
    return cb(null, true);
  },

  storage: multer.diskStorage({
    destination: (req, file, cb) => {

      const destinationPath = path.resolve(process.cwd(), 'uploads', 'images');
      
      console.log('Salvando arquivo em:', destinationPath);

      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '_' + file.originalname.toLowerCase().split(' ').join('_');
      cb(null, uniqueSuffix);
    },
  }),
};