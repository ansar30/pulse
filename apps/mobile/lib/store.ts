import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@business-app/types';
import { disconnectSocket } from './socket';
import { Appearance } from 'react-native';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    updateUser: (user: User) => void;
    logout: () => Promise<void>;
    initAuth: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            _hasHydrated: false,

            setAuth: (user, accessToken, refreshToken) => {
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true
                });
            },

            updateUser: (updatedUser) => {
                const currentUser = get().user;
                if (!currentUser) {
                    set({ user: updatedUser });
                    return;
                }
                
                // Deep merge to preserve all existing fields, especially tenantId and nested objects
                const mergedUser = {
                    ...currentUser,
                    ...updatedUser,
                    // Preserve tenantId if it exists in current user but not in update
                    tenantId: updatedUser.tenantId || currentUser.tenantId,
                    // Deep merge profile object
                    profile: {
                        ...(currentUser.profile || {}),
                        ...(updatedUser.profile || {}),
                    },
                };
                set({ user: mergedUser });
            },

            logout: async () => {
                // Disconnect socket connection before clearing auth state
                disconnectSocket();
                // Clear AsyncStorage explicitly
                try {
                    await AsyncStorage.removeItem('auth-storage');
                } catch (error) {
                    console.error('Error clearing auth storage:', error);
                }
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false
                });
            },

            initAuth: () => {
                try {
                    const state = get();
                    if (state.accessToken && state.user) {
                        set({ isAuthenticated: true });
                    } else {
                        set({ isAuthenticated: false });
                    }
                } catch (error) {
                    console.error('Error initializing auth:', error);
                    set({ isAuthenticated: false });
                }
            },

            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => {
                return (state) => {
                    if (state) {
                        state.setHasHydrated(true);
                        state.initAuth();
                    }
                };
            },
        }
    )
);

export type ColorTheme = 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink' | 'teal' | 'indigo';
export type DarkModePreference = 'system' | 'light' | 'dark';

interface ThemeState {
    darkMode: DarkModePreference;
    colorTheme: ColorTheme;
    setDarkMode: (mode: DarkModePreference) => void;
    setColorTheme: (theme: ColorTheme) => void;
    getEffectiveDarkMode: () => boolean;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            darkMode: 'system',
            colorTheme: 'blue',

            setDarkMode: (mode) => {
                set({ darkMode: mode });
            },

            setColorTheme: (theme) => {
                set({ colorTheme: theme });
            },

            getEffectiveDarkMode: () => {
                const { darkMode } = get();
                if (darkMode === 'system') {
                    return Appearance.getColorScheme() === 'dark';
                }
                return darkMode === 'dark';
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

