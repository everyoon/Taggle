import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { useAuth } from './hooks/useAuth';
import { useTeam } from './hooks/useTeam';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import TeamSetup from './components/common/TeamSetup';

function App() {
  const [isDark, setIsDark] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();
  const { team, loading: teamLoading, createTeam, joinTeam } = useTeam(user?.id);
  const theme = isDark ? darkTheme : lightTheme;

  if (authLoading || teamLoading) return null;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {!user ? (
        <LoginPage />
      ) : !team ? (
        <TeamSetup onCreateTeam={createTeam} onJoinTeam={joinTeam} />
      ) : (
        <MainPage
          user={user}
          team={team}
          onSignOut={signOut}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          isDark={isDark}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
