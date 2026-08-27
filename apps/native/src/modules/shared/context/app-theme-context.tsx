import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Uniwind, useUniwind } from "uniwind";

type ThemeName = "light" | "dark";

type AppThemeContextType = {
  currentTheme: string;
  isLight: boolean;
  isDark: boolean;
  isThemeLoaded: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "@app_theme";

const AppThemeContext = createContext<AppThemeContextType | undefined>(
  undefined
);

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { theme } = useUniwind();
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Cargar el tema guardado al montar el provider
  useEffect(() => {
    let isMounted = true;

    const loadStoredTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMounted && (storedTheme === "light" || storedTheme === "dark")) {
          Uniwind.setTheme(storedTheme);
        }
      } catch (error) {
        console.warn("Error al cargar el tema guardado:", error);
      } finally {
        if (isMounted) {
          setIsThemeLoaded(true);
        }
      }
    };

    loadStoredTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistTheme = useCallback(async (newTheme: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn("Error al guardar el tema:", error);
    }
  }, []);

  const isLight = useMemo(() => {
    return theme === "light";
  }, [theme]);

  const isDark = useMemo(() => {
    return theme === "dark";
  }, [theme]);

  const setTheme = useCallback(
    (newTheme: ThemeName) => {
      Uniwind.setTheme(newTheme);
      persistTheme(newTheme);
    },
    [persistTheme]
  );

  const toggleTheme = useCallback(() => {
    const newTheme: ThemeName = theme === "light" ? "dark" : "light";
    Uniwind.setTheme(newTheme);
    persistTheme(newTheme);
  }, [theme, persistTheme]);

  const value = useMemo(
    () => ({
      currentTheme: theme,
      isLight,
      isDark,
      isThemeLoaded,
      setTheme,
      toggleTheme,
    }),
    [theme, isLight, isDark, isThemeLoaded, setTheme, toggleTheme]
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
};

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return context;
}
