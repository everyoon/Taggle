import { useState } from 'react';
import styled from 'styled-components';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

import Sidebar from '../components/common/Sidebar';
import BookmarkGrid from '../components/bookmark/BookmarkGrid';
import BookmarkModal from '../components/bookmark/BookmarkModal';
import { useBookmarks } from '../hooks/useBookmarks';
import Button from '../components/common/Button';
import { MdAdd } from 'react-icons/md';
import { useTeam } from '../hooks/useTeam';
import Pagination from '../components/common/Pagination';

function MainPage({ user, onSignOut, onToggleTheme, isDark }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [filter, setFilter] = useState('home');
  const [sort] = useState('latest');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const { bookmarks, loading, addBookmark, updateBookmark, deleteBookmark, toggleFavorite } = useBookmarks(
    user.id,
    filter,
    selectedTags,
  );

  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
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

  // 사이드 필터링
  const filtered = bookmarks.filter((b) => {
    // 1. 검색어 필터
    if (search) {
      const q = search.toLowerCase();
      const hit =
        b.title?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.tags?.some((t) => t.toLowerCase().includes(q)) ||
        b.url?.toLowerCase().includes(q);
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
          <TopBar>
            <Count>{sorted.length} 개</Count>
            <Button id="add-bookmark-btn" onClick={() => setModalOpen(true)}>
              <MdAdd />
              북마크 추가하기
            </Button>
          </TopBar>
          <BookmarkGrid
            loading={loading}
            currentUserId={user.id}
            filter={filter}
            onEdit={handleEdit}
            onDelete={deleteBookmark}
            onFavorite={toggleFavorite}
            search={search} // 검색어 상태 전달
            hasTags={selectedTags.length > 0}
            bookmarks={paginatedBookmarks}
          />
          {sorted.length > 0 && <Pagination current={currentPage} total={totalPages} onPageChange={setCurrentPage} />}
        </Main>
      </Body>

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
  min-width: 504px;
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[16]};
  display: flex;
  flex: 1;
  position: sticky;
  @media (max-width: 1024px) {
    padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[14]};
  }
  @media (max-width: 500px) {
    padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[4]}${({ theme }) => theme.spacing[10]};
  }
`;

const Main = styled.main`
  border-left: 1px solid${({ theme }) => theme.colors.border.secondary};
  flex: 1;
  padding: ${({ theme }) => theme.spacing[5]};
  overflow-y: auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const Count = styled.span`
  ${({ theme }) => theme.typography.Label['KR-Midium']};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export default MainPage;
