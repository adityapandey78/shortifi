import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Global state store using Zustand
 * Manages user authentication state and theme
 */

export const useStore = create(
  persist(
    (set) => ({
      // User state
      user: null,
      isAuthenticated: false,
      
      // Theme state
      theme: 'dark',

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'shortifi-storage',
      partialPersist: (state) => ({
        theme: state.theme,
      }),
    }
  )
)
