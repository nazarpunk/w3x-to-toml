import {W3A} from "warodel/w3abdhqtu/W3A.mjs";
import {FileMap} from "./file-map.mjs";
import {W3B} from "warodel/w3abdhqtu/W3B.mjs";
import {W3D} from "warodel/w3abdhqtu/W3D.mjs";
import {W3H} from "warodel/w3abdhqtu/W3H.mjs";
import {W3Q} from "warodel/w3abdhqtu/W3Q.mjs";
import {W3T} from "warodel/w3abdhqtu/W3T.mjs";
import {W3U} from "warodel/w3abdhqtu/W3U.mjs";

const electron = window.electron;
const path = window.path;
const fs = window.fs;

const buttonSelect = document.querySelector('.button-select');
const buttonClear = document.querySelector('.button-clear');
const buttonStart = document.querySelector('.button-start');
const filesContainer = document.querySelector('.files');
const processContainer = document.querySelector('.process');

const fileList = new FileMap();

const buttons = () => {
    const disabled = fileList.isEmpty;
    buttonSelect.disabled = false;
    buttonClear.disabled = disabled;
    buttonStart.disabled = disabled;
}

buttonSelect.addEventListener('click', async () => {
    const paths = await electron.showOpenDialogSync({
        title: "Select game data file",
        buttonLabel: "Open",
        properties: ['openFile', 'multiSelections'],
        filters: [
            {name: 'Game data', extensions: ['w3a', 'w3b', 'w3d', 'w3h', 'w3q', 'w3t', 'w3u', 'toml']},
        ],
    });

    if (paths === undefined) return;
    await fileList.add(paths);
    fileList.render = filesContainer;
    buttons();
});

buttonClear.addEventListener('click', async () => {
    fileList.clear(filesContainer);
    processContainer.textContent = ``;
    buttons();
    //const s = await fs.readFileSync('/Users/nazarpunk/Downloads/wa.toml', {encoding: 'utf8'});

    //console.log('1', s);
});

buttonStart.addEventListener('click', async () => {
    buttonSelect.disabled = true;
    buttonClear.disabled = true;
    buttonStart.disabled = true;
    let html = '';

    const _error = text => html += `<div class="error">${text}</div>\n`;

    for (const v of Object.values(fileList.map)) {
        for (const parts of Object.values(v)) {
            const filepath = await path.join(parts.dir, parts.base);
            html += filepath;
            const ok = ' <b>[OK]</b>\n\n';

            /** @type {W3A|W3B|W3D|W3H|W3Q|W3T|W3U} */
            let w3;
            let file;

            if (parts.ext === '.toml') {
                file = await fs.readFileSync(filepath, {encoding: 'utf8'}).catch(e => e);
                if (file instanceof Error) {
                    _error(file.message);
                    continue;
                }
                const newparts = await path.parse(parts.name);

                switch (newparts.ext) {
                    case '.w3a':
                        w3 = W3A.fromTOML(file);
                        break;
                    case '.w3b':
                        w3 = W3B.fromTOML(file);
                        break;
                    case '.w3d':
                        w3 = W3D.fromTOML(file);
                        break;
                    case '.w3h':
                        w3 = W3H.fromTOML(file);
                        break;
                    case '.w3q':
                        w3 = W3Q.fromTOML(file);
                        break;
                    case '.w3t':
                        w3 = W3T.fromTOML(file);
                        break;
                    case '.w3u':
                        w3 = W3U.fromTOML(file);
                        break;
                    default:
                        _error(`Wrong target extension: ${newparts.ext.length ? newparts.ext : '[empty string]'}`);
                        continue;
                }
                const newfilepath = await path.join(parts.dir, newparts.base);

                const response = await fs.writeFileSync(newfilepath, new Uint8Array(w3.write()), {flag: 'w+'}).catch(e => e);
                if (response instanceof Error) {
                    _error(response.message);
                    continue;
                }
                html += ok;
                continue;
            }

            const uintlist = await fs.readFileSync(filepath).catch(e => e);
            if (uintlist instanceof Error) {
                _error(uintlist.message);
                continue;
            }

            //TODO: move to warodel
            file = new ArrayBuffer(uintlist.length);
            const bufferView = new Uint8Array(file);
            bufferView.set(uintlist);

            switch (parts.ext) {
                case '.w3a':
                    w3 = new W3A(file);
                    break;
                case '.w3b':
                    w3 = new W3B(file);
                    break;
                case '.w3d':
                    w3 = new W3D(file);
                    break;
                case '.w3h':
                    w3 = new W3H(file);
                    break;
                case '.w3q':
                    w3 = new W3Q(file);
                    break;
                case '.w3t':
                    w3 = new W3T(file);
                    break;
                case '.w3u':
                    w3 = new W3U(file);
                    break;
                default:
                    _error(`Missing file extension: ${parts.ext}`);
                    continue;
            }

            w3.read();

            if (w3.errors.length > 0) {
                for (const error of w3.errors) _error(error.message);
                continue;
            } else {
                fs.writeFileSync(`${filepath}.toml`, w3.toTOML(), {flag: 'w+'});
            }

            html += ok;
        }
    }

    processContainer.innerHTML = html;
    buttons();
});

if (0) {
    fileList.add([
        '/Users/nazarpunk/Downloads/wa.w3u',
        '/Users/nazarpunk/Downloads/wa.toml',
        '/Users/nazarpunk/Downloads/wa.w3u.toml',
    ]).then(() => {
        fileList.render = filesContainer;
        buttons();
    });
}