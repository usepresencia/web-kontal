import { describe, expect, it } from 'vitest';
import { getGreeting } from './page-greeting';

describe('getGreeting', () => {
    it.each([
        [0, 'Bom dia,'],
        [11, 'Bom dia,'],
        [12, 'Boa tarde,'],
        [17, 'Boa tarde,'],
        [18, 'Boa noite,'],
        [23, 'Boa noite,'],
    ])('às %ih diz "%s"', (hour, expected) => {
        expect(getGreeting(hour)).toBe(expected);
    });
});
