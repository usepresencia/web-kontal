export default function AccessDeniedPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-8">
            <div className="max-w-md space-y-2 text-center">
                <h1 className="text-2xl font-bold">Acesso negado</h1>
                <p className="text-muted-foreground">
                    Seu usuário não tem permissão para acessar o Kontal.
                </p>
            </div>
        </main>
    );
}
