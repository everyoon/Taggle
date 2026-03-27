export function getStorageUrl(url) {
  if (!url) return '';
  // 이미 타임스탬프 쿼리가 붙어있다면 그대로 반환 (중복 방지)
  if (url.includes('?t=')) return url;

  // 현재 시간을 밀리초 단위로 가져와서 쿼리 파라미터로 붙임
  // 예: .../avatar.png -> .../avatar.png?t=1710123456789
  return `${url}?t=${new Date().getTime()}`;
}
