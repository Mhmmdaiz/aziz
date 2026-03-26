/**
 * Mengambil URL dasar aplikasi dengan memastikan adanya protokol (http/https).
 * Berguna untuk metadataBase dan callback URL eksternal.
 */
export function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://chckt-store.vercel.app';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Jika di localhost atau preview Vercel tanpa protokol
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return `http://${url}`;
  }
  
  return `https://${url}`;
}
