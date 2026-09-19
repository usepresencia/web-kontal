import withFlowbiteReact from 'flowbite-react/plugin/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    eslint: {
        // Avoid blocking production builds due to lint errors. We still run `npm run lint` separately.
        ignoreDuringBuilds: true,
    },
};

export default withFlowbiteReact(nextConfig);
