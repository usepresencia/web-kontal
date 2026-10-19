import { describe, expect, it } from 'vitest';
import { SUCCESS } from './toast-messages';

describe('SUCCESS', () => {
    it('segue o padrão do web-presencia: título curto sem ponto e frase terminada em "com sucesso."', () => {
        for (const { title, message } of Object.values(SUCCESS)) {
            expect(title.endsWith('.')).toBe(false);
            expect(message.endsWith('com sucesso.')).toBe(true);
        }
    });
});
