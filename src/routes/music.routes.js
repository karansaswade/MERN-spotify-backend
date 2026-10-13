const express = require('express');
const musicController = require('../controllers/music.controller');
const multer = require('multer');
const {
    authMiddleware,
    authUserMiddleware
} = require('../middlewares/auth.middleware');

const upload = multer({ 
    storage: multer.memoryStorage()
 }); // Temporary storage for uploaded files

const router = express.Router();


router.post('/upload', authMiddleware, upload.single('music'), musicController.createMusic); 

router.post('/create-album', authMiddleware, musicController.createAlbum);

router.get('/all-musics',authUserMiddleware, musicController.getAllmusics);

router.get('/all-albums',authUserMiddleware, musicController.getAllAlbums);


module.exports = router;