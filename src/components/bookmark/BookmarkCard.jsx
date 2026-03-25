import styled from 'styled-components';
import { tokens } from '../../styles/theme';

function BookmarkCard({ bookmark, currentUserId, onEdit, onDelete, onFavorite }) {
  const isOwner = bookmark.user_id === currentUserId;
  const isShared = bookmark.visibility === 'shared';

  return (
    <Card>
      <Thumbnail href={bookmark.url} target="_blank" rel="noopener noreferrer">
        {bookmark.thumbnail_url ? (
          <ThumbImg src={bookmark.thumbnail_url} alt={bookmark.title} />
        ) : (
          <ThumbPlaceholder>{getDomain(bookmark.url)}</ThumbPlaceholder>
        )}
        <VisibilityBadge $shared={isShared}>{isShared ? '팀 공유' : '나만 보기'}</VisibilityBadge>

        <FavoriteButton
          onClick={(e) => {
            e.preventDefault();
            onFavorite(bookmark.id, bookmark.is_favorited);
          }}
          $active={bookmark.is_favorited}
        >
          {bookmark.is_favorited ? '♥' : '♡'}
        </FavoriteButton>
      </Thumbnail>

      <Body>
        <SiteRow>
          <Favicon
            src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=32`}
            alt=""
            onError={(e) => (e.target.style.display = 'none')}
          />
          <Domain>{getDomain(bookmark.url)}</Domain>
        </SiteRow>

        <Title href={bookmark.url} target="_blank" rel="noopener noreferrer">
          {bookmark.title}
        </Title>

        {bookmark.description && <Memo>{bookmark.description}</Memo>}

        {bookmark.tags?.length > 0 && (
          <TagList>
            {bookmark.tags.map((tag) => (
              <Tag key={tag} $tag={tag}>
                {tag}
              </Tag>
            ))}
          </TagList>
        )}

        <Footer>
          <Who>
            {bookmark.profiles?.avatar_url ? (
              <AuthorAvatar src={bookmark.profiles.avatar_url} alt="" />
            ) : (
              <AuthorInitial>{bookmark.profiles?.name?.[0] ?? '?'}</AuthorInitial>
            )}
            <AuthorName>{isOwner ? '나' : (bookmark.profiles?.name ?? '알 수 없음')}</AuthorName>
          </Who>

          {isOwner && (
            <Actions>
              <ActionButton onClick={() => onEdit(bookmark)}>편집</ActionButton>
              <ActionButton $danger onClick={() => onDelete(bookmark.id)}>
                삭제
              </ActionButton>
            </Actions>
          )}
        </Footer>
      </Body>
    </Card>
  );
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

const Card = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${tokens.radius.lg};
  overflow: hidden;
  transition:
    box-shadow ${tokens.transition.normal},
    transform ${tokens.transition.normal};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.card};
    transform: translateY(-2px);
  }
`;

const Thumbnail = styled.a`
  display: block;
  position: relative;
  height: 160px;
  overflow: hidden;
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 18px;
  line-height: 1;
  color: ${({ $active }) => ($active ? '#E05050' : 'rgba(255,255,255,0.8)')};
  transition:
    color ${tokens.transition.fast},
    transform ${tokens.transition.fast};
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: scale(1.2);
    color: #e05050;
  }
`;

const ThumbPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const VisibilityBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 9px;
  border-radius: ${tokens.radius.full};
`;

const Body = styled.div`
  padding: ${tokens.spacing[14]} ${tokens.spacing[16]} ${tokens.spacing[16]};
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[8]};
`;

const SiteRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[6]};
`;

const Favicon = styled.img`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
`;

const Domain = styled.span`
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const Title = styled.a`
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover {
    text-decoration: underline;
  }
`;

const Memo = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${tokens.spacing[4]};
`;

const Tag = styled.span`
  padding: 3px 9px;
  border-radius: ${tokens.radius.full};
  color: ${({ theme, $tag }) => theme.colors.tag[$tag]?.text ?? theme.colors.text.secondary};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${tokens.spacing[8]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  margin-top: ${tokens.spacing[4]};
`;

const Who = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[6]};
`;

const AuthorAvatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: ${tokens.radius.full};
  object-fit: cover;
`;

const AuthorInitial = styled.div`
  width: 20px;
  height: 20px;
  border-radius: ${tokens.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AuthorName = styled.span`
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const Actions = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  opacity: 0;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  padding: 3px 8px;
  border-radius: ${tokens.radius.sm};
  color: ${({ theme, $danger }) => ($danger ? '#E05050' : theme.colors.text.secondary)};
  transition: background-color ${tokens.transition.fast};

  &:hover {
  }
`;

export default BookmarkCard;
