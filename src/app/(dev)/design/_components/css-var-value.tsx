'use client';

import { useEffect, useState } from 'react';

/** Mostra o valor atual de uma variável CSS do tema. */
export function CssVarValue({ name }: { name: string }) {
    const [value, setValue] = useState('');

    useEffect(() => {
        setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
    }, [name]);

    return <span>{value || name}</span>;
}
