import './globals.css';
import VoiceWrapper from './VoiceWrapper';

export const metadata = {
    title: 'Voice UI Kit Demo',
    description: 'Pro-grade Voice UI Kit for React',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <VoiceWrapper>{children}</VoiceWrapper>
            </body>
        </html>
    );
}
