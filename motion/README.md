# Kontal Motion

Vídeo demonstrativo do Kontal com Remotion, independente da autenticação e da API de produção. Todos os dados apresentados são fictícios.

## Executar

```bash
cd motion
npm install
npm run dev
```

Abra a composição **KontalShowcase** no Remotion Studio.

## Renderizar

```bash
npm run render
```

Saída: `motion/out/kontal-showcase.mp4`. Para renderizar MP4, é necessário ter as dependências de renderização do Remotion disponíveis no ambiente.

## Configuração

- Resolução: 1920×1080
- FPS: 30
- Duração: 60 segundos (1.800 frames)
- Dados demonstrativos: `src/data/demo.ts`
- O projeto Next.js principal não precisa ser executado.

O vídeo é uma composição inicial para revisão criativa. Os elementos visuais são adaptações dos componentes do dashboard, não capturas de tela. A identidade visual segue os tokens de `src/app/globals.css`.
