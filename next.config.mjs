/** @type {import('next').NextConfig} */

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
    'undici'
  ],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "utf-8-validate": false,
      bufferutil: false,
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

    config.module.rules.push({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: [
        /node_modules\/firebase/,
        /node_modules\/@firebase/,
        /node_modules\/undici/
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
