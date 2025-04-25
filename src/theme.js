import { createTheme } from '@mui/material/styles';

// HPE palette
const hpeGreen = '#00b388';
const hpeDark = '#333e48';
const hpeLight = '#f7f9fa';
const hpeAccent = '#01a982';

const theme = createTheme({
  palette: {
    primary: {
      main: hpeGreen,
      contrastText: '#fff',
    },
    secondary: {
      main: hpeAccent,
    },
    background: {
      default: hpeLight,
      paper: '#fff',
    },
    text: {
      primary: hpeDark,
      secondary: '#556066',
    },
    success: {
      main: hpeGreen,
    },
    error: {
      main: '#e6026b', // HPE magenta
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h6: {
      fontWeight: 700,
      letterSpacing: 1,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
