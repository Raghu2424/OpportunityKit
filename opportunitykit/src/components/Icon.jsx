const PATHS = {
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  alert: ['M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20z', 'M12 8v4M12 16h.01'],
  search: ['M11 3a8 8 0 1 0 0 16a8 8 0 1 0 0-16z', 'M21 21l-4.35-4.35'],
  arrow: 'M5 12h14M12 5l7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  copy: ['M9 9h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
  menu: 'M3 12h18M3 6h18M3 18h18',
  clock: ['M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20z', 'M12 6v6l4 2'],
  refresh: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.5 15',
  briefcase: 'M4 7h16v13H4zM9 7V4h6v3M4 13h16',
  award: ['M12 2a6 6 0 1 0 0 12a6 6 0 1 0 0-12z', 'M8.2 13.5L7 22l5-3 5 3-1.2-8.5'],
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  layers: 'M12 2l10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5',
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8z'],
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
};

const CATEGORY_ICON = { Internship: 'briefcase', Scholarship: 'award', Hackathon: 'code', Program: 'layers' };
export const categoryIcon = (category) => CATEGORY_ICON[category] ?? 'layers';

export default function Icon({ name, className = 'h-4 w-4' }) {
  const paths = [].concat(PATHS[name] ?? []);
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
