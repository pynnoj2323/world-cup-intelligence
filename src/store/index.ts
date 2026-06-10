import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserPrediction {
  user_prediction_id: string;
  match_id: string;
  predicted_result: "home_win" | "draw" | "away_win";
  predicted_home_score: number;
  predicted_away_score: number;
  confidence: number;
  comment: string;
  locked: boolean;
  score_awarded: number | null;
  created_at: string;
}

interface UserState {
  userId: string;
  favorites: string[];
  userPredictions: UserPrediction[];
  addFavorite: (teamId: string) => void;
  removeFavorite: (teamId: string) => void;
  toggleFavorite: (teamId: string) => void;
  isFavorite: (teamId: string) => boolean;
  addPrediction: (prediction: UserPrediction) => void;
  getUserPrediction: (matchId: string) => UserPrediction | undefined;
  getPredictionStats: () => { total: number; correct: number; accuracy: number; points: number };
  points: number;
}

export const useStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: "user_001",
      favorites: ["bra", "arg"],
      userPredictions: [],
      points: 0,
      addFavorite: (teamId) =>
        set((state) => ({
          favorites: state.favorites.includes(teamId) ? state.favorites : [...state.favorites, teamId],
        })),
      removeFavorite: (teamId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== teamId),
        })),
      toggleFavorite: (teamId) =>
        set((state) => ({
          favorites: state.favorites.includes(teamId)
            ? state.favorites.filter((id) => id !== teamId)
            : [...state.favorites, teamId],
        })),
      isFavorite: (teamId) => get().favorites.includes(teamId),
      addPrediction: (prediction) =>
        set((state) => {
          const existing = state.userPredictions.findIndex(
            (p) => p.match_id === prediction.match_id
          );
          if (existing >= 0) {
            const updated = [...state.userPredictions];
            updated[existing] = prediction;
            return { userPredictions: updated };
          }
          return { userPredictions: [...state.userPredictions, prediction] };
        }),
      getUserPrediction: (matchId) =>
        get().userPredictions.find((p) => p.match_id === matchId),
      getPredictionStats: () => {
        const predictions = get().userPredictions;
        const scored = predictions.filter((p) => p.score_awarded !== null);
        const correct = scored.filter((p) => (p.score_awarded || 0) > 0).length;
        const totalPoints = scored.reduce((sum, p) => sum + (p.score_awarded || 0), 0);
        return {
          total: predictions.length,
          correct,
          accuracy: predictions.length > 0 ? Math.round((correct / predictions.length) * 100) : 0,
          points: totalPoints,
        };
      },
    }),
    {
      name: "worldcup-storage",
    }
  )
);
