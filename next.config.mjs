/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  transpilePackages: [
    'firebase',
    '@firebase/auth',
    '@firebase/app',
    '@firebase/firestore',
    '@firebase/storage',
    'undici',
    'zod',
    'zod-to-json-schema',
    '@ai-sdk/ui-utils'
  ],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "utf-8-validate": false,
      bufferutil: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      'zod': require.resolve('zod'),
      '@ai-sdk/ui-utils': require.resolve('@ai-sdk/ui-utils')
    };

    // Remove existing rules that might conflict
    config.module.rules = config.module.rules.filter(rule => 
      !(rule.test && rule.test.toString().includes('.m?js'))
    );

    // Add new rules
    config.module.rules.push({
      test: /\.m?js/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    });

    // Add JSON handling
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    config.module.rules.push({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: [
        /node_modules\/firebase/,
        /node_modules\/@firebase/,
        /node_modules\/undici/,
        /node_modules\/react-syntax-highlighter/,
        /node_modules\/parse-entities/,
        /node_modules\/character-entities-legacy/,
        /node_modules\/zod/,
        /node_modules\/zod-to-json-schema/,
        /node_modules\/@ai-sdk/,
        /node_modules\/ai/
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            ['@babel/plugin-proposal-private-methods', { loose: true }],
            ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }]
          ],
          cacheDirectory: true,
        }
      }
    });

    return config;
  }
};

export default nextConfig;
