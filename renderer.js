/** @typedef {Electron} electron */
/** @typedef {fs} fs */

import {W3A} from "warodel/w3abdhqtu/W3A.mjs";

const buttonSelect = document.querySelector('.button-select');
const buttonClear = document.querySelector('.button-clear');
const filesContainer = document.querySelector('.files');

/*
"/Users/nazarpunk/Downloads/wa.toml"
"/Users/nazarpunk/Downloads/wa.w3u"
 */

buttonSelect.addEventListener('click', async () => {
    const paths = await electron.openDialog('showOpenDialogSync', {
        title: "Select game data file",
        buttonLabel: "Open",
        properties: ['openFile', 'multiSelections'],
        filters: [
            {name: 'Game data', extensions: ['w3a', 'w3u', 'toml']},
        ],
    });

    if (paths === undefined) return;

    const w3a = new W3A(new ArrayBuffer(0));
});

buttonClear.addEventListener('click', async () => {
    console.log('click');

    const s = await fs.readFile('/Users/nazarpunk/Downloads/wa.toml');


    console.log(1, s);

});

