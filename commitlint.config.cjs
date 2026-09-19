module.exports = {
    extends: ['@commitlint/config-conventional'],
    /**
     * Ignora commits que claramente não seguem o formato convencional
     * (por exemplo, mensagens geradas por ferramentas como "src/app/page.tsx").
     * Assim, só validamos de fato os commits que começam com "tipo(scope):".
     */
    ignores: [message => !/^[a-z]+(\([\w-]+\))?:/.test(message)],
    rules: {
        /**
         * Permite nomes de componentes / termos próprios no subject
         * (ex.: EntryModal, Kontal, Sidebar).
         */
        'subject-case': [0, 'never'],
    },
};
