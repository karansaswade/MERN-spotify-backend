
const ImageKit = require("@imagekit/nodejs").default;

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile(file) {
    const result = await imagekit.files.upload({
        file,
        fileName: "music_" + Date.now() + ".mp3",
        folder: "backend-music"
    });

    return result;
}

module.exports = { uploadFile };
