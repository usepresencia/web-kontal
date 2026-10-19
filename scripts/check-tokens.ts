import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { findTokenViolations } from '../src/lib/_utils/token-rules';

const ROOT = 'src';
const EXEMPT = ['src/app/globals.css'];

function listFiles(dir: string): string[] {
    return readdirSync(dir).flatMap(name => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? listFiles(path) : [path];
    });
}

const files = listFiles(ROOT).filter(
    file =>
        /\.(ts|tsx|css)$/.test(file) &&
        !/\.test\.(ts|tsx)$/.test(file) &&
        !file.endsWith('token-rules.ts') &&
        !EXEMPT.some(exempt => file.startsWith(exempt)),
);

let total = 0;
for (const file of files) {
    for (const violation of findTokenViolations(readFileSync(file, 'utf8'))) {
        console.error(`${file}:${violation.line}  cor fora dos tokens: ${violation.match}`);
        total += 1;
    }
}

if (total > 0) {
    console.error(`\n${total} uso(s) de cor fora dos tokens. Use as classes semânticas do tema.`);
    process.exit(1);
}
console.log('Tokens: nenhuma cor fora do tema.');
