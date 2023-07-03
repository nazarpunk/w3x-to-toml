/**
 * @typedef {Dialog} DialogPreload
 */

document.querySelector('.files').addEventListener('click', async () => {

    const a = await DialogPreload.fileDialog();

    console.log('a', a);
});