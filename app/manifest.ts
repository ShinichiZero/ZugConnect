import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return {
    name: 'ZugConnect',
    short_name: 'ZugConnect',
    description: 'Unofficial German transit assistant',
    start_url: `${basePath}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: `${basePath}/icon-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `${basePath}/icon-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}