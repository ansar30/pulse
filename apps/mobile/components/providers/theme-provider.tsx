import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance, AppearanceListener } from 'react-native';
import { useThemeStore, ColorTheme } from '@/lib/store';
import { ThemeColors, getThemeColors } from '@/lib/theme-colors';

interface ThemeContextValue {
    colors: ThemeColors;
    isDark: boolean;
    colorTheme: ColorTheme;
    setColorTheme: (theme: ColorTheme) => void;
    darkMode: 'system' | 'light' | 'dark';
    setDarkMode: (mode: 'system' | 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { darkMode, colorTheme, setDarkMode, setColorTheme, getEffectiveDarkMode } = useThemeStore();
    const [systemDarkMode, setSystemDarkMode] = useState(Appearance.getColorScheme() === 'dark');

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemDarkMode(colorScheme === 'dark');
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const isDark = darkMode === 'system' ? systemDarkMode : darkMode === 'dark';
    const colors = getThemeColors(colorTheme, isDark);

    const value: ThemeContextValue = {
        colors,
        isDark,
        colorTheme,
        setColorTheme,
        darkMode,
        setDarkMode,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

