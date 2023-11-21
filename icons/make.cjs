const path = require('path');
const Jimp = require('jimp');
const fs = require('fs');
const icongen = require('icon-gen');

const input = path.join(__dirname, 'icon.png');
const pngDir = path.join(__dirname, 'png');

if (!fs.existsSync(pngDir)) fs.mkdirSync(pngDir);

const gen = async () => {
    const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
    for (const size of sizes) {
        const image = await Jimp.read(input);
        // noinspection JSUnresolvedReference
        await image.resize(size, size);
        await image.writeAsync(path.join(pngDir, `${size}.png`));
    }

    await icongen(pngDir, __dirname, {
        icns: {name: "icon"},
        ico: {name: "icon"},
        report: true,
    });

    for (const size of sizes) {
        fs.renameSync(
            path.join(pngDir, `${size}.png`),
            path.join(pngDir, `${size}x${size}.png`)
        );
    }
}

gen().then();

// https://github.com/develar/app-builder/issues/68

