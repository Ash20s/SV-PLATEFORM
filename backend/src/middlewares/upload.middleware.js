const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Créer les sous-dossiers pour chaque type
const avatarsDir = path.join(uploadDir, 'avatars');
const bannersDir = path.join(uploadDir, 'banners');
const teamsDir = path.join(uploadDir, 'teams');

[avatarsDir, bannersDir, teamsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';
    
    // Déterminer le dossier selon le type d'upload
    if (req.path.includes('avatar')) {
      folder = avatarsDir;
    } else if (req.path.includes('banner')) {
      folder = bannersDir;
    } else if (req.path.includes('team')) {
      folder = teamsDir;
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Validation des fichiers
const fileFilter = (req, file, cb) => {
  // Formats autorisés (sécurisés)
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];
  
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non autorisé. Formats acceptés : JPEG, PNG, WebP'), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 1 // 1 fichier à la fois
  }
});

// Middleware pour gérer les erreurs d'upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'Fichier trop volumineux. Taille maximale : 5 MB' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Trop de fichiers. Un seul fichier autorisé' 
      });
    }
    return res.status(400).json({ 
      message: `Erreur d'upload : ${err.message}` 
    });
  }
  
  if (err) {
    return res.status(400).json({ 
      message: err.message 
    });
  }
  
  next();
};

module.exports = {
  uploadAvatar: upload.single('avatar'),
  uploadBanner: upload.single('banner'),
  uploadTeamLogo: upload.single('logo'),
  uploadTeamBanner: upload.single('banner'),
  handleUploadError
};
