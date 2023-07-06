const path = window.path;

export class FileMap {

    /** @type {{}} */
    map = {};

    /** @param {string[]} list */
    async add(list) {
        for (const item of list) {
            const parts = await path.parse(item);
            this.map[parts.dir] ??= {};
            this.map[parts.dir][parts.base] = parts;
        }
    }

    /** @param {HTMLElement?} elem */
    clear(elem) {
        elem && (elem.textContent = '');
        this.map = {}
    }

    get isEmpty() {
        return Object.keys(this.map).length === 0;
    }

    /** @param {HTMLElement} elem */
    set render(elem) {
        let html = '';
        for (const [k, v] of Object.entries(this.map)) {
            html += `${k}\n`;
            const list = Object.keys(v);
            for (let i = 0; i < list.length; i++) {
                const s = i === list.length - 1 ? '└──' : '├──';
                html += ` ${s} ${list[i]}\n`;
            }
        }
        elem.innerHTML = html;
    }
}