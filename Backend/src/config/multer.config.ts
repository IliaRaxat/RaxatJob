import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const multerConfig: MulterOptions = {
  // Не используем diskStorage - файлы обрабатываются в памяти
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1, // Только один файл за раз
  },
  fileFilter: (req, file, cb) => {
    // Разрешаем только изображения
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
};

// Конфигурация для резюме (документы)
export const resumeMulterConfig: MulterOptions = {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1, // Только один файл за раз
  },
  fileFilter: (req, file, cb) => {
    // Разрешаем документы для резюме
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume'), false);
    }
  },
};