import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Brand, Influencer, UserRole } from '@/types'

interface AuthState {
  user: User | null
  brand: Brand | null
  influencer: Influencer | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User, brand?: Brand, influencer?: Influencer) => void
  clearAuth: () => void
  updateUser: (user: Partial<User>) => void
  updateBrand: (brand: Partial<Brand>) => void
  updateInfluencer: (influencer: Partial<Influencer>) => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      brand: null,
      influencer: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user, brand, influencer) => {
        set({
          user,
          brand: brand || null,
          influencer: influencer || null,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      clearAuth: () => {
        set({
          user: null,
          brand: null,
          influencer: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },

      updateBrand: (updates) => {
        set((state) => ({
          brand: state.brand ? { ...state.brand, ...updates } : null,
        }))
      },

      updateInfluencer: (updates) => {
        set((state) => ({
          influencer: state.influencer ? { ...state.influencer, ...updates } : null,
        }))
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

/**
 * Helper functions
 */
export function isBrand(): boolean {
  const { user } = useAuthStore.getState()
  return user?.role === UserRole.BRAND
}

export function isInfluencer(): boolean {
  const { user } = useAuthStore.getState()
  return user?.role === UserRole.INFLUENCER
}

export function getUserRole(): UserRole | null {
  const { user } = useAuthStore.getState()
  return user?.role || null
}
