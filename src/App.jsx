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
  const [isDark, setIsDark] = useState(false);
  const { user, loading, signOut } = useAuth();
  const theme = isDark ? darkTheme : lightTheme;

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
                <LoginPage onToggleTheme={() => setIsDark((prev) => !prev)} isDark={isDark} />
              ) : (
                <MainPage
                  user={user}
                  onSignOut={signOut}
                  onToggleTheme={() => setIsDark((prev) => !prev)}
                  isDark={isDark}
                />
              )
            }
          />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
