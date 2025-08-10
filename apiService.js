export const API_URL = process.env.EXPO_PUBLIC_AMBIENTE === 'dev'
    ? process.env.EXPO_PUBLIC_API_URL_DEV
    : process.env.EXPO_PUBLIC_API_URL_PROD;