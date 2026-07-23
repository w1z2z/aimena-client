export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  onboardingCompleted: boolean;
  favoriteCategories: string[];
  cityId: string | null;
  city: string | null;
};
