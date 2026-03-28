import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTeam(userId) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 팀 목록 불러오기
  const fetchMyTeams = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(
          `
          role,
          teams!team_id (
            id,
            name,
            avatar_url,
            invite_code
          )
        `,
        )
        .eq('user_id', userId);

      if (error) throw error;

      const formatted =
        data?.map((item) => ({
          ...item.teams,
          role: item.role,
        })) ?? [];

      setTeams(formatted);
    } catch (err) {
      console.error('팀 목록 로드 실패:', err.message);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setTeams([]);
      setLoading(false);
      return;
    }
    fetchMyTeams();
  }, [userId, fetchMyTeams]);

  // 2. 팀 생성
  const createTeam = async (name) => {
    try {
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({ name, created_by: userId })
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase.from('team_members').insert({
        team_id: newTeam.id,
        user_id: userId,
        role: 'owner',
      });

      if (memberError) throw memberError;

      const newTeamWithRole = { ...newTeam, role: 'owner' };
      setTeams((prev) => [...prev, newTeamWithRole]);

      return { data: newTeamWithRole, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  // 3. 팀 참여
  const joinTeam = async (inviteCode) => {
    try {
      const { data: foundTeam, error: findError } = await supabase
        .from('teams')
        .select()
        .eq('invite_code', inviteCode.trim())
        .single();

      if (findError || !foundTeam) throw new Error('초대 코드가 유효하지 않습니다.');

      const { data: existing } = await supabase
        .from('team_members')
        .select()
        .eq('team_id', foundTeam.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) throw new Error('이미 참여 중인 팀입니다.');

      const { error: joinError } = await supabase.from('team_members').insert({
        team_id: foundTeam.id,
        user_id: userId,
        role: 'member',
      });

      if (joinError) throw joinError;

      const joinedTeamWithRole = { ...foundTeam, role: 'member' };
      setTeams((prev) => [...prev, joinedTeamWithRole]);

      return { data: joinedTeamWithRole, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  // 4. 팀장 권한 넘기기
  const transferOwnership = async (teamId, targetUserId) => {
    try {
      const { error: nextOwnerError } = await supabase
        .from('team_members')
        .update({ role: 'owner' })
        .eq('team_id', teamId)
        .eq('user_id', targetUserId);

      if (nextOwnerError) throw nextOwnerError;

      const { error: prevOwnerError } = await supabase
        .from('team_members')
        .update({ role: 'member' })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (prevOwnerError) throw prevOwnerError;

      await fetchMyTeams();

      return { success: true };
    } catch (err) {
      console.error('위임 에러:', err.message);
      return { success: false, error: err.message };
    }
  };

  const leaveTeam = async (teamId) => {
    // 1. 해당 팀에서 내가 작성한 북마크 ID 조회
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('team_id', teamId);

    const bookmarkIds = bookmarks?.map((b) => b.id) ?? [];

    // 2. bookmark_teams 삭제
    if (bookmarkIds.length > 0) {
      await supabase.from('bookmark_teams').delete().in('bookmark_id', bookmarkIds);
    }

    // 3. 북마크 삭제
    if (bookmarkIds.length > 0) {
      await supabase.from('bookmarks').delete().in('id', bookmarkIds);
    }

    // 4. 팀 멤버에서 제거
    const { error } = await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', userId);

    if (!error) {
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      return { success: true };
    }
    return { success: false, error };
  };

  // 7. 팀원 내보내기
  const removeMember = async (teamId, targetUserId) => {
    try {
      // 1. 해당 팀에서 멤버가 작성한 북마크 ID 조회
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('team_id', teamId);

      const bookmarkIds = bookmarks?.map((b) => b.id) ?? [];

      // 2. bookmark_teams 삭제
      if (bookmarkIds.length > 0) {
        await supabase.from('bookmark_teams').delete().in('bookmark_id', bookmarkIds);
      }

      // 3. 북마크 삭제
      if (bookmarkIds.length > 0) {
        await supabase.from('bookmarks').delete().in('id', bookmarkIds);
      }

      // 4. 팀 멤버에서 제거
      const { error } = await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', targetUserId);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err) {
      console.error('멤버 강퇴 실패:', err.message);
      return { success: false, error: err.message };
    }
  };

  // 6. 팀 삭제
  const deleteTeam = async (teamId) => {
    const { error } = await supabase.from('teams').delete().eq('id', teamId);

    if (!error) {
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      return { success: true };
    }
    return { success: false, error };
  };

  return {
    teams,
    loading,
    refetch: fetchMyTeams,
    createTeam,
    joinTeam,
    transferOwnership,
    leaveTeam,
    removeMember,
    deleteTeam,
  };
}
