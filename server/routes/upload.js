const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext || mime);
  }
});

router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier' });

    const ext = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) return res.status(400).json({ message: error.message });

    const { data: { publicUrl } } = supabase.storage
      .from('uploads').getPublicUrl(fileName);

    res.json({ url: publicUrl, fileName, message: 'Fichier uploadé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
