export const isDevelopment = (): boolean => {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.VERCEL_ENV === 'development' ||
    (!process.env.VERCEL && process.env.NODE_ENV !== 'production')
  )
}
