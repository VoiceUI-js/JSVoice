import Link from 'next/link';

export default function Home() {
    return (
        <main style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            background: 'var(--jv-bg-canvas)'
        }}>
            <h1 style={{ fontSize: '3rem', margin: '0 0 20px 0' }}>JSVoice UI Kit</h1>
            <p style={{ maxWidth: '600px', margin: '0 0 40px 0', opacity: 0.8 }}>
                A generic, pro-grade voice interface system for React.
                Explore the 15+ modules including intent tracking, history, advanced filtering, and more.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/ui/hyper" style={{
                    padding: '16px 32px',
                    background: 'var(--jv-accent, #7c5cff)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                }}>
                    Hyper Voice UI Kit
                </Link>
                <Link href="/ui" style={{
                    padding: '16px 32px',
                    background: 'transparent',
                    color: 'var(--jv-text-primary, #fff)',
                    border: '1px solid var(--jv-border, #444)',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 600
                }}>
                    Classic Hub
                </Link>
                <Link href="/ui/kit" style={{
                    padding: '16px 32px',
                    background: 'transparent',
                    color: 'var(--jv-text-primary, #fff)',
                    border: '1px solid var(--jv-border, #444)',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 600
                }}>
                    Widget Playground
                </Link>
            </div>
        </main>
    );
}
