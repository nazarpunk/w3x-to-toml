import {W3A} from "warodel/w3abdhqtu/W3A.mjs";

const electron = window.electron;
const dialog = window.dialog;
const fs = window.fs;

const buttonSelect = document.querySelector('.button-select');
const buttonClear = document.querySelector('.button-clear');
const filesContainer = document.querySelector('.files');

/*
"/Users/nazarpunk/Downloads/wa.toml"
"/Users/nazarpunk/Downloads/wa.w3u"
 */

buttonSelect.addEventListener('click', async () => {
    const paths = await electron.showOpenDialogSync({
        title: "Select game data file",
        buttonLabel: "Open",
        properties: ['openFile', 'multiSelections'],
        filters: [
            {name: 'Game data', extensions: ['w3a', 'w3u', 'toml']},
        ],
    });

    console.log(paths);

    if (paths === undefined) return;

    const w3a = new W3A(new ArrayBuffer(0));
});

buttonClear.addEventListener('click', async () => {

    const s = await fs.readFileSync('/Users/nazarpunk/Downloads/wa.toml', {encoding: 'utf8'});

    console.log('1', s);
});

