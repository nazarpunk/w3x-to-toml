const {W3A} = require("warodel/w3abdhqtu/W3A.mjs");

document.querySelector('button').addEventListener('click', () => {
    console.log('click');
    const w = new W3A(new ArrayBuffer(0));
    console.log(w);
});