import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTeam(userId) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 유저가 없으면 팀 정보도 없으니 로딩을 바로 끝내버림!
    if (!userId) {
      setTeam(null);
      setLoading(false);
      return;
    }

    // 유저가 있으면 팀 정보를 불러옴
    fetchMyTeam();
  }, [userId]);

  const fetchMyTeam = async () => {
    setLoading(true);
    const { data } = await supabase.from('team_members').select('team_id, teams(*)').eq('user_id', userId).single();

    setTeam(data?.teams ?? null);
    setLoading(false);
  };

  const createTeam = async (name) => {
    // 팀 생성
    const { data: newTeam, error } = await supabase
      .from('teams')
      .insert({ name, created_by: userId })
      .select()
      .single();

    if (error) return { error };

    // 생성자를 owner로 팀에 추가
    await supabase.from('team_members').insert({ team_id: newTeam.id, user_id: userId, role: 'owner' });

    setTeam(newTeam);
    return { error: null };
  };

  const joinTeam = async (inviteCode) => {
    // 초대 코드로 팀 찾기
    const { data: foundTeam, error } = await supabase
      .from('teams')
      .select()
      .eq('invite_code', inviteCode.trim())
      .single();

    if (error || !foundTeam) return { error: '초대 코드를 확인해주세요.' };

    // 이미 팀원인지 확인
    const { data: existing } = await supabase
      .from('team_members')
      .select()
      .eq('team_id', foundTeam.id)
      .eq('user_id', userId)
      .single();

    if (existing) return { error: '이미 팀에 속해있어요.' };

    // 팀 참여
    await supabase.from('team_members').insert({ team_id: foundTeam.id, user_id: userId, role: 'member' });

    setTeam(foundTeam);
    return { error: null };
  };

  return { team, loading, createTeam, joinTeam };
}
