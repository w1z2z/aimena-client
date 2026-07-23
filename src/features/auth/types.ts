export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  favoriteCategories: string[];
  cityId: string | null;
  city: string | null;
};
