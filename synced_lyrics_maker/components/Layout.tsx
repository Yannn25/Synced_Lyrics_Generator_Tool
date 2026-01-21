import React from "react";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
            <header className="py-4 px-6 shadow bg-[var(--color-primary-lightest)] text-[var(--color-primary-darkest)] text-center font-bold text-xl">
                POC Synced Lyrics Maker
            </header>
            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
                {children}
            </main>
            <footer className="py-3 px-6 text-center text-xs text-[var(--color-primary-dark)] bg-[var(--color-primary-lightest)]">
                © 2026 - Synced Lyrics Maker | <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="underline">Crédits &amp; code source</a>
            </footer>
        </div>
    );
};

export default Layout;
