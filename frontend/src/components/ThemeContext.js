import { useState, useContext, createContext, useMemo } from "react";

const ThemeContext = createContext({
    darkMode: true,
    setDarkMode: () => {},
    theme: {
        text: "",
        textSecondary: "",
        textBackground: "",
        background: "",
        backgroundSecondary: "",
        border: "",
        red: ""
    },
});

export function useTheme() {
    return useContext(ThemeContext);
}

// ThemeProvider is a wrapper for the entire app that provides the theme context
export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(true);

    const theme = useMemo(
        () => ({
            text: darkMode ? "white" : "#181818",
            textSecondary: darkMode ? "lightgray" : "darkgray",
            textBackground: darkMode ? "black" : "white",
            background: darkMode ? "#181818" : "white",
            backgroundSecondary: darkMode ? "rgb(35, 35, 35)" : "rgb(247, 247, 247)",
            backgroundTertiary: darkMode ? "rgb(55, 55, 55)" : "rgb(220, 220, 220)",
            red: "rgb(219, 50, 50)"
        }),
        [darkMode]
    );

    function toggleDarkMode() {
        setDarkMode((prevDarkMode) => !prevDarkMode);
    }

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme }}>
            {children}
        </ThemeContext.Provider>
    );
}
