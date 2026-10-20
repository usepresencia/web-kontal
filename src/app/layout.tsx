import { BusyProvider } from '@/lib/_components/busy-provider';
import { FlashToast } from '@/lib/_components/flash-toast';
import { ToastProvider } from '@/lib/_components/ui/toast-provider';
import { rootMetadata } from '@/lib/config/metadata';
import { Inter, Space_Grotesk } from 'next/font/google';
import { headers } from 'next/headers';
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
    await headers();

    return (
        <html lang="pt-BR" className={`${spaceGrotesk.variable} ${inter.variable}`}>
            <body className="bg-background text-foreground antialiased">
                <BusyProvider>{children}</BusyProvider>
                <ToastProvider />
                <FlashToast />
            </body>
        </html>
    );
}
