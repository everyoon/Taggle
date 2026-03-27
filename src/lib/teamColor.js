import { lightTheme } from '../styles/theme';

const TAG_KEYS = Object.keys(lightTheme.colors.tag);

export function getTeamColor(teamName) {
  if (!teamName) return lightTheme.colors.tag[TAG_KEYS[0]];

  const index = teamName.charCodeAt(0) % TAG_KEYS.length;
  return lightTheme.colors.tag[TAG_KEYS[index]];
}
