/** Até duas iniciais maiúsculas das primeiras palavras do nome. */
export function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}
