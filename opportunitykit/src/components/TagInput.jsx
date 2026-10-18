import { useId, useState } from 'react';
import Icon from './Icon.jsx';

// Add-and-remove list input. `variant="chips"` suits short tags (skills, interests);
// `variant="list"` suits sentences (achievements).
export default function TagInput({
  label, hint, values, onChange, suggestions = [], placeholder, max = 20, maxLength = 80,
  variant = 'chips', splitOnComma = true, addLabel = 'Add',
}) {
  const id = useId();
  const [text, setText] = useState('');

  const add = (raw) => {
    const parts = (splitOnComma ? raw.split(',') : [raw]).map((s) => s.trim().slice(0, maxLength)).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...values];
    for (const p of parts) {
      if (next.length < max && !next.some((v) => v.toLowerCase() === p.toLowerCase())) next.push(p);
    }
    onChange(next);
    setText('');
  };

  const remove = (value) => onChange(values.filter((v) => v !== value));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || (splitOnComma && e.key === ',')) {
      e.preventDefault();
      add(text);
    }
  };

  const available = suggestions.filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase())).slice(0, 12);

  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {hint && <p id={`${id}-hint`} className="-mt-1 mb-2 text-sm text-ink-soft">{hint}</p>}
      <div className="flex gap-2">
        <input
          id={id} type="text" className="field" value={text} placeholder={placeholder} maxLength={maxLength}
          onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <button type="button" className="btn btn-secondary shrink-0" onClick={() => add(text)} disabled={!text.trim()}>
          <Icon name="plus" />
          {addLabel}
        </button>
      </div>

      {values.length > 0 && (
        <ul className={variant === 'chips' ? 'mt-3 flex flex-wrap gap-2' : 'mt-3 space-y-2'} aria-label={`${label}, added`}>
          {values.map((v) => (
            <li key={v} className={variant === 'chips' ? 'chip bg-brand-tint' : 'flex items-start justify-between gap-3 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm'}>
              <span>{v}</span>
              <button
                type="button" onClick={() => remove(v)} aria-label={`Remove ${v}`}
                className="-mr-1 rounded-full p-1 text-ink-soft hover:bg-ink/10 hover:text-ink"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-ink-soft">Quick add</p>
          <div className="flex flex-wrap gap-1.5">
            {available.map((s) => (
              <button
                key={s} type="button" onClick={() => add(s)}
                className="rounded-full border border-dashed border-ink/30 px-2.5 py-1 text-xs font-medium text-ink hover:border-brand hover:bg-brand-tint"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
