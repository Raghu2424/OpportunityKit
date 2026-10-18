export function deadlineLabel(days) {
  if (days <= 0) return 'Demo deadline today';
  if (days === 1) return 'Demo deadline tomorrow';
  return `Demo deadline in ${days} days`;
}

export function downloadTextFile(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
