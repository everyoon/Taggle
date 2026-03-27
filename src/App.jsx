import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import InvitePage from './pages/InvitePage';

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('taggle-theme');
    return saved === 'true';
  });

  const { user, loading, signOut } = useAuth();
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('taggle-theme', String(next));
      return next;
    });
  };

  if (loading) return null;
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Routes>
          <Route path="/invite/:code" element={<InvitePage user={user} />} />
          <Route
            path="*"
            element={
              !user ? (
                <LoginPage onToggleTheme={toggleTheme} isDark={isDark} />
              ) : (
                <MainPage user={user} onSignOut={signOut} onToggleTheme={toggleTheme} isDark={isDark} />
              )
            }
          />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
