export const colors = {
  background: '#FFFFFF',
  card: '#FFFD92',

  text: {
    primary: '#000000',
    semiLight: '#373737',
    light: '#434343',
    extraLight: '#696969',
    placeholder: '#D7D6D6',
    error: '#FF7D7D',
  },

  button: {
    primary: '#EEEEEE',
    disabled: '#DDDDDD',
    light: '#F1F1F1',
    focus: '#CFCFCF',
    dark: '#434343',
    delete: '#FF7F7F',
    white: '#FFFFFF',
    black: '#000000',
    like: '#FF5252',
  },

  border: {
    primary: '#E6E6E6',
    secondary: '#D9D9D9',
    search: '#E4E4E4',
  },
} as const;

export const fontFamily = {
  logo: 'Archivo Black',
  primary: 'Asta Sans',
} as const;

export const fontSize = {
  xs: '8px',
  sm: '10px',
  md: '12px',
  lg: '14px',
  xl: '16px',
  page: '20px',
  title: '24px',
  logo: '32px',
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const spacing = {
  4: '4px',
  8: '8px',
  10: '10px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  28: '28px',
  32: '32px',
  36: '36px',
} as const;

export const radius = {
  xs: '8px',
  sm: '10px',
  md: '15px',
  lg: '18px',
  xl: '20px',
} as const;

export const tokens = {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  spacing,
  radius,
} as const;
