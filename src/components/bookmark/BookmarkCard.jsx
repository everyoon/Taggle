import { useState } from 'react';
import styled from 'styled-components';
import { FaStar, FaRegStar } from 'react-icons/fa';

function BookmarkCard({ bookmark, currentUserId, onEdit, onDelete, onFavorite }) {
  const isOwner = bookmark.user_id === currentUserId;
  const isShared = bookmark.visibility === 'shared';
  const [memoExpanded, setMemoExpanded] = useState(false);

  const isLongMemo = bookmark.description && bookmark.description.length > 63;

  return (
    <Card>
      <Thumb href={bookmark.url} target="_blank" rel="noopener noreferrer">
        {bookmark.thumbnail_url ? (
          <ThumbImg src={bookmark.thumbnail_url} alt="사이트 썸네일" />
        ) : (
          <ThumbPlaceholder>{bookmark.title}</ThumbPlaceholder>
        )}
        <ThumbTop>
          <VisibilityBadge $shared={isShared}>{isShared ? 'Teams' : 'Private'}</VisibilityBadge>
          <FavBtn
            onClick={(e) => {
              e.preventDefault();
              onFavorite(bookmark.id, bookmark.is_favorited);
            }}
            $active={bookmark.is_favorited}
          >
            {bookmark.is_favorited ? <FaStar /> : <FaRegStar />}
          </FavBtn>
        </ThumbTop>
      </Thumb>

      <Body>
        <InfoContents>
          <Domain>{getDomain(bookmark.url)}</Domain>
          <TextInner>
            <Title href={bookmark.url} target="_blank" rel="noopener noreferrer">
              {bookmark.title}
            </Title>
            {bookmark.description && (
              <MemoWrap>
                <Memo $expanded={memoExpanded}>{bookmark.description}</Memo>
                {isLongMemo && (
                  <MoreBtn
                    onClick={(e) => {
                      e.preventDefault();
                      setMemoExpanded((prev) => !prev);
                    }}
                    type="button"
                  >
                    {memoExpanded ? '접기' : '더보기'}
                  </MoreBtn>
                )}
              </MemoWrap>
            )}
          </TextInner>

          {bookmark.tags?.length > 0 && (
            <TagList>
              {bookmark.tags.map((tag) => (
                <TagChip key={tag} $tag={tag}>
                  {tag}
                </TagChip>
              ))}
            </TagList>
          )}
        </InfoContents>

        <Footer>
          <Who>
            {bookmark.profiles?.avatar_url ? (
              <AuthorImg src={bookmark.profiles.avatar_url} alt="" />
            ) : (
              <AuthorInitial>{bookmark.profiles?.name?.[0] ?? '?'}</AuthorInitial>
            )}
            <AuthorName>{isOwner ? bookmark.profiles?.name : (bookmark.profiles?.name ?? '알 수 없음')}</AuthorName>
          </Who>
          {isOwner && (
            <Actions>
              <ActionBtn onClick={() => onEdit(bookmark)}>편집</ActionBtn>
              <ActionBtn $danger onClick={() => onDelete(bookmark.id)}>
                삭제
              </ActionBtn>
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
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: ${({ theme }) => theme.radius[4]};
  overflow: hidden;
  transition:
    box-shadow ${({ theme }) => theme.transition.normal},
    transform ${({ theme }) => theme.transition.normal};
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows[2]};
    transform: translateY(-2px);
  }
`;

const Thumb = styled.a`
  display: block;
  position: relative;
  height: 180px;
  background-color: ${({ theme }) => theme.colors.surface.secondary};
  overflow: hidden;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbPlaceholder = styled.div`
  ${({ theme }) => theme.typography.Body['KR-Small']}
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const ThumbTop = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const VisibilityBadge = styled.span`
  ${({ theme }) => theme.typography.Label['EN-Small']}
  padding:  ${({ theme }) => theme.spacing[1]}  ${({ theme }) => theme.spacing[3]} 2px;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ $shared }) => ($shared ? '#34c759' : '#96CEFF')};
  color: ${({ theme }) => theme.colors.text.invert};
`;

const FavBtn = styled.button`
  width: 24px;
  height: 24px;
  font-size: 24px;
  color: ${({ $active }) => ($active ? '#FFD700' : '#BFBFBF')};
  transition:
    transform ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast};

  &:hover {
    transform: scale(1.2);
    color: #ffd700;
  }
`;

const Body = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[1]};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const InfoContents = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
`;

const Domain = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const TextInner = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Title = styled.a`
  ${({ theme }) => theme.typography.Label['KR-Large']}
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration-line: underline;
  text-decoration-color: transparent;
  text-underline-offset: 5px;
  padding-bottom: 2px;

  &:hover {
    text-decoration-color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const MemoWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Memo = styled.p`
  ${({ theme }) => theme.typography.Body['KR-Small']}
  color: ${({ theme }) => theme.colors.text.contrast};
  width: 100%;
  display: -webkit-box !important;
  -webkit-line-clamp: ${({ $expanded }) => ($expanded ? 'unset' : 2)};
  -webkit-box-orient: vertical;
  overflow: ${({ $expanded }) => ($expanded ? 'visible' : 'hidden')};
  white-space: pre-wrap;
  word-break: break-all;
`;

const MoreBtn = styled.button`
  display: flex;
  justify-content: flex-end;
  ${({ theme }) => theme.typography.Caption['KR']}
  color: #bfbfbf;
  background: none;
  border: none;
  padding: 0;
  transition: color ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;
const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TagChip = styled.span`
  ${({ theme }) => theme.typography.Label['EN-Small']}
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ theme, $tag }) => theme.colors.tag[$tag]?.bg ?? theme.colors.surface.secondary};
  color: ${({ theme, $tag }) => theme.colors.tag[$tag]?.text ?? theme.colors.text.contrast};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[2]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const Who = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const AuthorImg = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorInitial = styled.div`
  ${({ theme }) => theme.typography.Caption['KR']}
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.surface.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const AuthorName = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transition.fast};

  ${Card}:hover & {
    opacity: 1;
  }
`;

const ActionBtn = styled.button`
  ${({ theme }) => theme.typography.Label['KR-Small']}
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.radius[1]};
  color: ${({ $danger }) => ($danger ? '#ff383c' : 'inherit')};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.text.negative : theme.colors.text.contrast)};
  transition: background-color ${({ theme }) => theme.transition.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

export default BookmarkCard;
