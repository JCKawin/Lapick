import fs from "node:fs";

const READABILITY_JS = fs.readFileSync('./node_modules/@mozilla/readability/Readability.js', 'utf-8');

export const SCRIPT_TO_INJECT_INTO_FRAME = `
${READABILITY_JS}

function giveSnapshot(stopActiveSnapshot) {
    if (stopActiveSnapshot) {
        window.haltSnapshot = true;
    }
    let parsed;
    try {
        parsed = new Readability(document.cloneNode(true)).parse();
    } catch (err) {
        void 0;
    }
    const r = {
        title: document.title,
        href: document.location.href,
        parsed: parsed,
    };
    return r;
}
`;