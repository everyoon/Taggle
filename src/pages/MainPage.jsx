import { useState } from 'react';
import styled from 'styled-components';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { TAGS } from '../components/common/tags';
import TagChip from '../components/common/TagChip';
import Sidebar from '../components/common/Sidebar';
import BookmarkGrid from '../components/bookmark/BookmarkGrid';
import BookmarkModal from '../components/bookmark/BookmarkModal';
import { useBookmarks } from '../hooks/useBookmarks';
import Button from '../components/common/Button';
import { MdAdd } from 'react-icons/md';
import { useTeam } from '../hooks/useTeam';
import Pagination from '../components/common/Pagination';
import BottomNav from '../components/common/BottomNav';
import ProfileModal from '../components/profile/ProfileModal';
import CreateTeamModal from '../components/team/CreateTeamModal';
import ManageTeamModal from '../components/team/ManageTeamModal';

function MainPage({ user, onSignOut, onToggleTheme, isDark }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [filter, setFilter] = useState('home');
  const [sort] = useState('latest');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [manageTeamOpen, setManageTeamOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const ITEMS_PER_PAGE = 12;

  const {
    bookmarks,
    loading,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    toggleFavorite,
    refetch: refetchBookmarks,
  } = useBookmarks(user.id, filter, selectedTags);

  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    setSelectedAuthor(null);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    setCurrentPage(1);
  };

  const handleClearTags = () => {
    setSelectedTags([]);
    setCurrentPage(1);
  };

  // 팀 목록 호출
  const { teams, refetch: refetchTeams } = useTeam(user.id);

  const handleEdit = (bookmark) => {
    setEditTarget(bookmark);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = async (form) => {
    if (editTarget) return await updateBookmark(editTarget.id, form);
    return await addBookmark(form);
  };

  const handleTeamsUpdated = async () => {
    await refetchTeams();
    await refetchBookmarks();
  };

  const handleAuthorClick = (authorData) => {
    // 1. 현재 클릭한 유저의 ID를 먼저 파악합니다.
    const clickedId = typeof authorData === 'string' ? authorData : authorData.id;

    // 2. 이미 선택된 유저를 다시 눌렀다면 -> 필터 해제
    if (selectedAuthor?.id === clickedId) {
      setSelectedAuthor(null);
    }
    // 3. 새로운 유저를 눌렀다면 -> 필터 적용
    else {
      if (typeof authorData === 'string') {
        const targetBookmark = bookmarks.find((b) => b.user_id === authorData);
        setSelectedAuthor({
          id: authorData,
          name: targetBookmark?.profiles?.name || '알 수 없음',
          avatar: targetBookmark?.profiles?.avatar_url,
        });
      } else {
        setSelectedAuthor(authorData);
      }
    }

    // 4. 페이지 초기화 및 상단 이동
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const teamAuthors = Array.from(
    new Map(
      bookmarks.map((b) => [
        b.user_id,
        { id: b.user_id, name: b.profiles?.name || '알 수 없음', avatar: b.profiles?.avatar_url },
      ]),
    ).values(),
  );

  // 사이드 필터링
  const filtered = bookmarks.filter((b) => {
    if (selectedAuthor && b.user_id !== selectedAuthor.id) return false;

    // 1. 검색어 필터 (기존 로직)
    if (search) {
      const q = search.toLowerCase();
      const hit =
        b.title?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.tags?.some((t) => t.toLowerCase().includes(q)) ||
        b.url?.toLowerCase().includes(q) ||
        (b.profiles?.name || '').toLowerCase().includes(q);
      if (!hit) return false;
    }

    // 2. 태그 OR 필터
    if (selectedTags.length > 0) {
      const hasTag = selectedTags.some((t) => b.tags?.includes(t));
      if (!hasTag) return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'favorited') {
      if (a.is_favorited === b.is_favorited) return new Date(b.created_at) - new Date(a.created_at);
      return a.is_favorited ? -1 : 1;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookmarks = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

  return (
    <Layout>
      <Header
        user={user}
        search={search}
        onSearch={handleSearch}
        onSignOut={onSignOut}
        onToggleTheme={onToggleTheme}
        isDark={isDark}
        teams={teams}
        onTeamsUpdated={refetchTeams}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenCreateTeam={() => setCreateTeamOpen(true)}
        onOpenManageTeam={() => setManageTeamOpen(true)}
      />
      <Body>
        <Sidebar
          filter={filter}
          onFilterChange={handleFilterChange}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          onClearTags={handleClearTags}
          teams={teams}
        />
        <Main>
          <MobileTagScroll>
            <TagInner>
              {TAGS.map((tag) => (
                <TagChip key={tag} $tag={tag} $active={selectedTags.includes(tag)} onClick={() => handleTagToggle(tag)}>
                  {tag}
                </TagChip>
              ))}
            </TagInner>
          </MobileTagScroll>
          <StickySection>
            <TopBar>
              <TopLeft>
                <Count>{sorted.length} 개</Count>
                {filter.startsWith('team_') && teamAuthors.length > 0 && (
                  <AvatarGroup>
                    {teamAuthors.map((author) => (
                      <AvatarCircle
                        key={author.id}
                        src={author.avatar || '기본프로필이미지경로.png'}
                        alt={author.name}
                        title={`${author.name} 님의 북마크 보기`}
                        onClick={() => handleAuthorClick(author)}
                      />
                    ))}
                  </AvatarGroup>
                )}
              </TopLeft>
              <AddBookmarkButton id="add-bookmark-btn" onClick={() => setModalOpen(true)}>
                <MdAdd size={20} />
                <span>북마크 추가하기</span>
              </AddBookmarkButton>
            </TopBar>
            {selectedAuthor && (
              <BadgeWrapper>
                <ActiveFilterBadge onClick={() => setSelectedAuthor(null)}>
                  {selectedAuthor.name} 님의 북마크 모아보기 ✕
                </ActiveFilterBadge>
              </BadgeWrapper>
            )}
          </StickySection>
          <BookmarkGrid
            loading={loading}
            currentUserId={user.id}
            filter={filter}
            onEdit={handleEdit}
            onDelete={deleteBookmark}
            onFavorite={toggleFavorite}
            search={search}
            hasTags={selectedTags.length > 0}
            bookmarks={paginatedBookmarks}
            onOpenCreateTeam={() => setCreateTeamOpen(true)}
            onAuthorClick={filter === 'home' || filter === 'private' ? null : handleAuthorClick}
          />
          {sorted.length > 0 && <Pagination current={currentPage} total={totalPages} onPageChange={setCurrentPage} />}
        </Main>
      </Body>
      <BottomNav filter={filter} onFilterChange={handleFilterChange} teams={teams} />
      {user && (
        <>
          <ProfileModal
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            user={user}
            onUpdated={() => window.location.reload()}
          />
          <CreateTeamModal
            open={createTeamOpen}
            onClose={() => setCreateTeamOpen(false)}
            userId={user.id}
            onCreated={refetchTeams}
          />
          <ManageTeamModal
            open={manageTeamOpen}
            onClose={() => setManageTeamOpen(false)}
            userId={user.id}
            teams={teams}
            onTeamsUpdated={handleTeamsUpdated}
          />
        </>
      )}
      <BookmarkModal
        key={editTarget?.id || 'new'}
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        editTarget={editTarget}
        teams={teams}
      />
      <Footer />
    </Layout>
  );
}

const Layout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  min-width: 100%;
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[16]};
  display: flex;
  flex: 1;
  @media (max-width: 1024px) {
    padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[14]};
  }
  @media (max-width: 504px) {
    padding: 0;
  }
`;

const Main = styled.main`
  border-left: 1px solid${({ theme }) => theme.colors.border.secondary};
  flex: 1;
  padding: ${({ theme }) => theme.spacing[5]};
  @media (max-width: 504px) {
    border-left: none;
    padding: ${({ theme }) => theme.spacing[4]};
    width: 100%;
    margin-bottom: ${({ theme }) => theme.spacing[16]};
  }
`;

const MobileTagScroll = styled.div`
  display: none;
  @media (max-width: 504px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    padding: ${({ theme }) => theme.spacing[3]} 0;
    margin-bottom: ${({ theme }) => theme.spacing[4]};
    -ms-overflow-style: none;
    scrollbar-width: none;
    overflow-y: scroll;
    .scroll-container::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TagInner = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin: ${({ theme }) => theme.spacing[3]} 0;
`;

const StickySection = styled.div`
  position: sticky;
  top: 88px;
  z-index: 90;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  padding-bottom: ${({ theme }) => theme.spacing[2]};

  @media (max-width: 504px) {
    top: 120px;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[2]} 0;
  margin-bottom: ${({ theme }) => theme.spacing[2]};

  @media (max-width: 504px) {
    padding: ${({ theme }) => theme.spacing[3]} 0;
  }
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing[2]};
`;

const AvatarCircle = styled.img`
  background-color: ${({ theme }) => theme.colors.surface.secondary};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.surface.primary};
  margin-left: -${({ theme }) => theme.spacing[4]};
  cursor: pointer;
  position: relative;
  transition:
    z-index 0.2s,
    transform 0.2s;

  &:first-child {
    margin-left: 0;
  }

  &:hover {
    z-index: 10;
    transform: translateY(-2px);
  }
`;

const BadgeWrapper = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ActiveFilterBadge = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[5]};
  background-color: ${({ theme }) => theme.colors.surface.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => theme.typography.Label['KR-Midium']}
  transition: background-color ${({ theme }) => theme.transition.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.border.secondary};
  }
`;

const Count = styled.span`
  ${({ theme }) => theme.typography.Label['KR-Midium']};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AddBookmarkButton = styled(Button)`
  @media (max-width: 504px) {
    padding: ${({ theme }) => theme.spacing[2]};
    border-radius: ${({ theme }) => theme.spacing[2]};
    min-width: 40px;
    height: 40px;
    justify-content: center;

    span {
      display: none;
    }
    svg {
      margin: 0;
    }
  }
`;

export default MainPage;
