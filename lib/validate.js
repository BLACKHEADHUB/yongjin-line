// 방명록으로 들어오는 값은 여기서 검사한다.
// 문자열만 허용하므로 { "$ne": "" } 같은 객체가 들어와도 거부된다 (NoSQL 인젝션 방지).

export class ValidationError extends Error {}

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function str(value, { min = 0, max = 200, label = '값', multiline = false } = {}) {
  if (typeof value !== 'string') throw new ValidationError(`${label}은(는) 문자열이어야 합니다.`);
  let v = value.replace(CONTROL, '').trim();
  if (!multiline) v = v.replace(/[\r\n]+/g, ' ');
  if (v.length < min) throw new ValidationError(`${label}을(를) 입력해 주세요.`);
  if (v.length > max) throw new ValidationError(`${label}은(는) ${max}자 이하여야 합니다.`);
  return v;
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
export function youtubeId(src) {
  if (typeof src !== 'string') return null;
  if (YT_ID.test(src)) return src;
  const m = src.match(/^https:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[&?#].*)?$/);
  return m ? m[1] : null;
}
