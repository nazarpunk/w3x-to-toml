let a;
const b = () => (a ??= 1) + 2;
const c = () => (a ??= 3) + 4;

console.log(c() + b());
console.log(b() + c());


/**
 * @typedef {Electron} electron
 */

import {W3A} from "warodel/w3abdhqtu/W3A.mjs";

document.querySelector('.files').addEventListener('click', async () => {
    const paths = await electron.openDialog('showOpenDialogSync', {
        title: "Select game data file",
        buttonLabel: "Open",
        properties: ['openFile', 'multiSelections'],
        filters: [
            {name: 'Game data', extensions: ['w3a', 'w3u', 'toml']},
        ],
    });
    console.log('11111');

    if (paths === undefined) return;

    console.log(paths);


    const w3a = new W3A(new ArrayBuffer(0));
});