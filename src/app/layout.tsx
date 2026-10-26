import { BusyProvider } from '@/lib/_components/busy-provider';
import { FlashToast } from '@/lib/_components/flash-toast';
import { ToastProvider } from '@/lib/_components/ui/toast-provider';
import { rootMetadata } from '@/lib/config/metadata';
import { Inter, Space_Grotesk } from 'next/font/google';
import { headers } from 'next/headers';
import Script from 'next/script';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata = rootMetadata;

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Ler os cabeçalhos torna toda página dinâmica, o que permite ao Next aplicar o nonce da CSP.
    const nonce = (await headers()).get('x-nonce') ?? '';

    return (
        <html lang="pt-BR" className={`${spaceGrotesk.variable} ${inter.variable}`}>
            <body className="bg-background text-foreground antialiased">
                {/* O Radix (Dialog/Popover) trava o scroll injetando um <style>; sem o nonce, a
                CSP de produção bloqueia essa tag. react-style-singleton lê esse global. */}
                <Script id="csp-nonce" strategy="beforeInteractive" nonce={nonce}>
                    {`window.__webpack_nonce__=${JSON.stringify(nonce)};`}
                </Script>
                <BusyProvider>{children}</BusyProvider>
                <ToastProvider />
                <FlashToast />
            </body>
        </html>
    );
}
