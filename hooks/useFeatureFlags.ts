const config = {
  features: {
    SAT: process.env.NEXT_PUBLIC_SAT === 'true',
  }
} as const;

export const useFeatureFlags = () => config.features;