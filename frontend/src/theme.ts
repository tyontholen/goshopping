// my old spotify theme
import { createTheme } from "@mui/material";

export const themeOptions = createTheme({
  palette: {
    primary: {
      main: "#1bd760", // Spotify green
      light: "#39d472",
      dark: "#3b5249",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#b3b3b3", // neutral gray
      contrastText: "#ffffff",
    },
    error: {
      main: "#e91429", // Spotify red for destructive actions
      contrastText: "#ffffff",
    },
    background: {
      default: "#000000",
      paper: "#121212",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
    divider: "#292929",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
});