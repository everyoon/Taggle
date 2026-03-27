import styled from 'styled-components';
import { getTeamColor } from '../../lib/teamColor';

function TeamAvatar({ team, size = 40 }) {
  if (team?.avatar_url) {
    return <AvatarImg src={team.avatar_url} alt={team.name} $size={size} />;
  }

  const color = getTeamColor(team?.name);
  const initial = team?.name?.[0] ?? '?';

  return (
    <AvatarInitial $size={size} $bg={color.bg} $text={color.text}>
      {initial}
    </AvatarInitial>
  );
}

const AvatarImg = styled.img`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const AvatarInitial = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => Math.round($size * 0.4)}px;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: -0.025em;
`;

export default TeamAvatar;
