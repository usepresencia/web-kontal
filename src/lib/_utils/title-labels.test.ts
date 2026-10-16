import { describe, expect, it } from 'vitest';
import { formatDate } from './title-labels';

describe('formatDate', () => {
    it('converte YYYY-MM-DD em DD/MM/YYYY', () => {
        expect(formatDate('2026-10-05')).toBe('05/10/2026');
    });
});
