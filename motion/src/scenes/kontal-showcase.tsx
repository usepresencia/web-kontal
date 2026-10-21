import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArrowDownRight, ArrowUpRight, Wallet, LayoutDashboard, ReceiptText, CircleDollarSign } from 'lucide-react';
import { AnimatedNumber } from '../components/animated-number';
import { demo } from '../data/demo';

const ink = '#1f1f1f';
const surface = '#edede4';
const accent = '#bcfc04';
const positive = '#00c853';
const negative = '#ff4d4d';
const font = 'Inter, Arial, sans-serif';
const display = 'Space Grotesk, Inter, Arial, sans-serif';

function appear(frame: number, start: number, distance = 50): CSSProperties {
    const p = interpolate(frame, [start, start + 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
    return { opacity: p, transform: `translateY(${(1 - p) * distance}px) scale(${0.94 + p * 0.06})` };
}

function Kpi({ title, value, tone, delay }: { title: string; value: number; tone: string; delay: number }) {
    const frame = useCurrentFrame();
    return <div style={{ ...appear(frame, delay), background: '#fafaf7', padding: 30, borderRadius: 24, flex: 1, minWidth: 0, boxShadow: '0 18px 42px #00000012' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#686861', fontSize: 20, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>
            {title}<span style={{ background: tone + '22', borderRadius: 30, padding: 12, color: tone }}>{tone === negative ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}</span>
        </div>
        <div style={{ fontFamily: display, fontSize: 46, fontWeight: 700, margin: '30px 0', color: tone }}><AnimatedNumber value={value} startFrame={delay} /></div>
        <div style={{ fontSize: 19, color: '#77776f' }}>no mês corrente</div>
    </div>;
}

function Result({ delay }: { delay: number }) {
    const frame = useCurrentFrame();
    const progress = interpolate(frame, [delay + 8, delay + 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ ...appear(frame, delay), flex: 1, minWidth: 0, borderRadius: 24, padding: 30, background: ink, color: surface, boxShadow: '0 18px 42px #00000018' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, letterSpacing: 1, fontWeight: 700 }}>RESULTADO <span style={{ background: accent, borderRadius: 40, padding: 12, color: ink }}><Wallet size={24} /></span></div>
        <div style={{ fontFamily: display, fontSize: 46, fontWeight: 700, margin: '30px 0', color: positive }}><AnimatedNumber value={demo.result} startFrame={delay} /></div>
        <div style={{ display: 'flex', height: 12, borderRadius: 8, overflow: 'hidden', background: '#444' }}><div style={{ width: `${62 * progress}%`, background: positive }} /><div style={{ width: `${38 * progress}%`, background: negative }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, color: '#c6c6bc', fontSize: 17 }}><span>62% receitas</span><span>38% despesas</span></div>
    </div>;
}

function ListCard({ title, values, delay }: { title: string; values: string[]; delay: number }) {
    const frame = useCurrentFrame();
    return <div style={{ ...appear(frame, delay), flex: 1, background: '#fafaf7', padding: 28, borderRadius: 24, boxShadow: '0 14px 35px #0000000b' }}>
        <div style={{ fontFamily: display, fontSize: 25, fontWeight: 700, marginBottom: 20 }}>{title}</div>
        {values.map((v, i) => <div key={v} style={{ ...appear(frame, delay + 8 + i * 7, 18), display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e5e5dc', padding: '16px 0', fontSize: 19 }}><span>{v}</span><span style={{ color: '#77776f' }}>Em aberto</span></div>)}
    </div>;
}

function Dashboard() {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const intro = spring({ frame: frame - 195, fps, config: { damping: 200 } });
    const camera = interpolate(frame, [195, 320, 510, 800, 1200, 1530], [0, 1, 1, 1, 1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const tilt = (1 - intro) * 11 + Math.sin(frame / 100) * 1.1 * camera;
    const zoom = interpolate(frame, [200, 400, 650, 950, 1450, 1580], [0.83, 1, 1.07, 1.04, 1, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ display: 'flex', width: 1580, height: 860, borderRadius: 34, overflow: 'hidden', boxShadow: '0 65px 140px #00000042', transform: `perspective(1800px) rotateY(${tilt}deg) rotateX(${(1 - intro) * 7}deg) scale(${zoom})`, opacity: intro }}>
        <aside style={{ width: 250, background: ink, color: surface, padding: '40px 24px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: display, fontSize: 35, fontWeight: 700, marginBottom: 8 }}><div style={{ background: accent, width: 38, height: 38, borderRadius: 12 }} />Kontal</div>
            <div style={{ color: '#b8b8ad', fontSize: 16, marginBottom: 65 }}>{demo.company}</div>
            {[[LayoutDashboard, 'Visão geral'], [ReceiptText, 'Operações'], [CircleDollarSign, 'Financeiro']].map(([Icon, label], i) => {
                const IconComponent = Icon as typeof LayoutDashboard;
                return <div key={String(label)} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 20, padding: 14, borderRadius: 12, marginBottom: 14, background: i === 0 ? accent : 'transparent', color: i === 0 ? ink : surface }}><IconComponent size={24} />{label as ReactNode}</div>;
            })}
        </aside>
        <main style={{ background: surface, flex: 1, padding: 40, overflow: 'hidden' }}>
            <div style={{ ...appear(frame, 210), display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 38 }}>
                <div><div style={{ fontSize: 18, color: '#77776f' }}>Bom dia,</div><div style={{ fontFamily: display, fontSize: 42, fontWeight: 700 }}>{demo.user}<span style={{ color: positive }}>.</span></div><div style={{ fontSize: 18, color: '#77776f' }}>Rigor sem peso.</div></div>
                <div style={{ background: '#fafaf7', padding: '16px 28px', borderRadius: 24, fontSize: 18 }}>Buscar transações…</div>
            </div>
            <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
                <Kpi title="Receitas" value={demo.revenues} tone={positive} delay={340} />
                <Kpi title="Despesas" value={demo.expenses} tone={negative} delay={365} />
                <Result delay={390} />
            </div>
            <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
                <ListCard title="Próximos pagamentos" values={['Fornecedor de materiais', 'Serviços de infraestrutura', 'Assinatura de software']} delay={810} />
                <ListCard title="Próximos recebimentos" values={['Mensalidade de contrato', 'Serviços prestados', 'Consultoria mensal']} delay={845} />
            </div>
            <div style={{ ...appear(frame, 1190), background: '#fafaf7', borderRadius: 24, padding: '22px 28px' }}>
                <div style={{ fontFamily: display, fontWeight: 700, fontSize: 25, marginBottom: 14 }}>Transações recentes</div>
                {demo.transactions.map((t, i) => <div key={t.description} style={{ ...appear(frame, 1210 + i * 12, 15), display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #e5e5dc', fontSize: 18 }}><span>{t.description}</span><span style={{ color: t.amount > 0 ? positive : negative }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}</span></div>)}
            </div>
        </main>
    </div>;
}

export function KontalShowcase() {
    const frame = useCurrentFrame();
    const introOpacity = interpolate(frame, [0, 25, 150, 205], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const outroOpacity = interpolate(frame, [1530, 1610, 1750], [0, 1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <AbsoluteFill style={{ background: ink, color: surface, fontFamily: font, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 1250, height: 1250, borderRadius: '50%', background: accent, opacity: 0.07, filter: 'blur(160px)', top: -450, right: -300 }} />
        <Sequence from={0} durationInFrames={220}><AbsoluteFill style={{ opacity: introOpacity, justifyContent: 'center', alignItems: 'center' }}><div style={{ fontFamily: display, fontSize: 130, fontWeight: 700 }}>Kontal<span style={{ color: accent }}>.</span></div><div style={{ fontSize: 34, marginTop: 22, color: '#c5c5b9' }}>Rigor sem peso.</div></AbsoluteFill></Sequence>
        <Sequence from={0} durationInFrames={1600}><AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}><Dashboard /></AbsoluteFill></Sequence>
        <Sequence from={1530} durationInFrames={270}><AbsoluteFill style={{ background: ink, opacity: outroOpacity, justifyContent: 'center', alignItems: 'center' }}><div style={{ fontFamily: display, fontSize: 140, fontWeight: 700 }}>Kontal<span style={{ color: accent }}>.</span></div><div style={{ fontSize: 36, marginTop: 16 }}>Rigor sem peso.</div></AbsoluteFill></Sequence>
    </AbsoluteFill>;
}
