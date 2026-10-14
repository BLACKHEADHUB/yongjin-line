// 서버에서 들어오는 모든 값은 여기서 검사한다.
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

export function strArray(value, { maxItems = 10, max = 300, label = '목록' } = {}) {
  if (!Array.isArray(value)) throw new ValidationError(`${label}은(는) 목록이어야 합니다.`);
  if (value.length > maxItems) throw new ValidationError(`${label}은(는) ${maxItems}개 이하여야 합니다.`);
  return value.map((v) => str(v, { max, label })).filter(Boolean);
}

/** http(s), mailto, 사이트 내부 경로(/로 시작)만 허용한다. javascript: 같은 주소는 거부한다. */
export function safeUrl(value, { label = '주소', allowEmpty = true } = {}) {
  const v = str(value ?? '', { max: 500, label });
  if (!v) {
    if (allowEmpty) return '';
    throw new ValidationError(`${label}을(를) 입력해 주세요.`);
  }
  if (/^https?:\/\/[^\s]+$/i.test(v) || /^mailto:[^\s]+$/i.test(v)) return v;
  if (/^\/(?!\/)[^\s]*$/.test(v)) return v;
  throw new ValidationError(`${label}은(는) https://, mailto:, 또는 /경로 형식이어야 합니다.`);
}

export function links(value, { label = '링크' } = {}) {
  if (!Array.isArray(value)) throw new ValidationError(`${label}은(는) 목록이어야 합니다.`);
  if (value.length > 10) throw new ValidationError(`${label}은(는) 10개 이하여야 합니다.`);
  return value.map((l) => {
    if (!l || typeof l !== 'object' || Array.isArray(l)) throw new ValidationError(`${label} 형식이 올바르지 않습니다.`);
    return { label: str(l.label, { min: 1, max: 40, label: '링크 이름' }), url: safeUrl(l.url, { label: '링크 주소', allowEmpty: false }) };
  });
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
export function youtubeId(src) {
  if (typeof src !== 'string') return null;
  if (YT_ID.test(src)) return src;
  const m = src.match(/^https:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[&?#].*)?$/);
  return m ? m[1] : null;
}

export function media(value) {
  if (!Array.isArray(value)) throw new ValidationError('미디어는 목록이어야 합니다.');
  if (value.length > 12) throw new ValidationError('미디어는 12개 이하여야 합니다.');
  return value.map((m) => {
    if (!m || typeof m !== 'object' || Array.isArray(m)) throw new ValidationError('미디어 형식이 올바르지 않습니다.');
    const type = m.type;
    if (!['image', 'video', 'youtube'].includes(type)) throw new ValidationError('미디어 종류는 image, video, youtube 중 하나여야 합니다.');
    const caption = str(m.caption ?? '', { max: 120, label: '설명' });
    if (type === 'youtube') {
      const id = youtubeId(m.src);
      if (!id) throw new ValidationError('유튜브 주소를 확인해 주세요.');
      return { type, src: id, caption };
    }
    return { type, src: safeUrl(m.src, { label: '미디어 주소', allowEmpty: false }), caption };
  });
}

export function facilities(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ValidationError('시설 안내 형식이 올바르지 않습니다.');
  const entries = Object.entries(value);
  if (entries.length > 10) throw new ValidationError('시설 안내는 10개 이하여야 합니다.');
  const out = {};
  for (const [k, v] of entries) {
    const key = str(k, { min: 1, max: 20, label: '시설 이름' });
    if (key.startsWith('$') || key.includes('.')) throw new ValidationError('시설 이름에 $ 또는 . 을 쓸 수 없습니다.');
    out[key] = str(v, { max: 60, label: '시설 내용' });
  }
  return out;
}

export const idPattern = /^[a-z0-9][a-z0-9-]{0,39}$/;
export function id(value, label = '아이디') {
  if (typeof value !== 'string' || !idPattern.test(value)) throw new ValidationError(`${label} 형식이 올바르지 않습니다.`);
  return value;
}

export function bool(value) {
  return value === true;
}

export function int(value, { min = 0, max = 1000, label = '숫자' } = {}) {
  if (!Number.isInteger(value) || value < min || value > max) throw new ValidationError(`${label} 범위를 확인해 주세요.`);
  return value;
}

const LEVELS = ['', '익숙함', '사용해 봄'];
export function skills(value) {
  if (!Array.isArray(value)) throw new ValidationError('기술 스택은 목록이어야 합니다.');
  if (value.length > 8) throw new ValidationError('기술 분야는 8개 이하여야 합니다.');
  return value.map((g) => {
    if (!g || typeof g !== 'object' || Array.isArray(g)) throw new ValidationError('기술 스택 형식이 올바르지 않습니다.');
    if (!Array.isArray(g.items) || g.items.length > 14) throw new ValidationError('분야별 기술은 14개 이하여야 합니다.');
    return {
      group: str(g.group, { min: 1, max: 20, label: '기술 분야' }),
      items: g.items.map((it) => {
        if (!it || typeof it !== 'object' || Array.isArray(it)) throw new ValidationError('기술 항목 형식이 올바르지 않습니다.');
        const level = str(it.level ?? '', { max: 10, label: '숙련도' });
        if (!LEVELS.includes(level)) throw new ValidationError('숙련도는 비우거나 "익숙함", "사용해 봄"만 쓸 수 있습니다.');
        return { name: str(it.name, { min: 1, max: 30, label: '기술 이름' }), level };
      }),
    };
  });
}
