import { interpolate, useCurrentFrame } from 'remotion';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function AnimatedNumber({ value, startFrame = 0 }: { value: number; startFrame?: number }) {
    const frame = useCurrentFrame();
    const progress = interpolate(frame, [startFrame, startFrame + 35], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return <>{currency.format(value * progress)}</>;
}
