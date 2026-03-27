import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`

@font-face {
    font-family: 'Lugati v1';
    src: url('/fonts/Lugati BLD.otf') format('opentype'); 
    font-weight: 700;
    font-style: normal;
  }
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;

  ::-webkit-scrollbar {
    width: 6px; 
    height: 6px; 
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.surface.brand}; 
    border-radius: 50%;
    background-clip: padding-box;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.colors.surface.brand}; 
  }

  }
  
  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.colors.surface.brand} transparent;
  }

  body {
   font-family: ${({ theme }) => theme.fontFamily};
    background-color: ${({ theme }) => theme.colors.surface.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    transition: background-color ${({ theme }) => theme.transition.normal},
                color ${({ theme }) => theme.transition.normal};
    ${({ theme }) => theme.typography.Body['KR-Midium']}
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  input, textarea {
    font-family: inherit;
    border: none;
    background-color: inherit;
    outline: none;
  }
  img{
    width: 100%;
    vertical-align: top;
  }
`;
