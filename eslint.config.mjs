import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores([
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        'docs/**',
        'coverage/**',
        // Código legado do Django, removido pelas tasks de migração (a última limpa o que sobrar).
        'src/app/pages/**',
        'src/app/auth/**',
        'src/components/**',
        'src/services/**',
        'src/hooks/**',
        'src/types/**',
        'tailwind.config.ts',
    ]),
    {
        rules: {
            // Anti-XSS: HTML cru nunca é injetado; o React já escapa o conteúdo.
            'no-restricted-syntax': [
                'error',
                {
                    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
                    message: 'dangerouslySetInnerHTML é proibido (risco de XSS).',
                },
            ],
            // Permitimos setState em effects nos casos controlados deste projeto
            'react-hooks/set-state-in-effect': 'off',
        },
    },
]);

export default eslintConfig;
