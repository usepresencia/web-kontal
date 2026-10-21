import { Composition } from 'remotion';
import { KontalShowcase } from './scenes/kontal-showcase';

export function Root() {
    return (
        <Composition
            id="KontalShowcase"
            component={KontalShowcase}
            durationInFrames={1800}
            fps={30}
            width={1920}
            height={1080}
        />
    );
}
