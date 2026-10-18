import { useState } from 'react';
import Icon from './Icon.jsx';

const ITEMS = [
  ['home', 'Home'],
  ['profile', 'Profile'],
  ['opportunities', 'Opportunities'],
  ['checklist', 'Checklist'],
  ['dashboard', 'Dashboard'],
];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-ink">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-mark" aria-hidden="true">
        <Icon name="check" className="h-5 w-5 stroke-[3]" />
      </span>
      OpportunityKit
    </span>
  );
}

export default function Navbar({ view, onNavigate, profile }) {
  const [open, setOpen] = useState(false);
  const go = (v) => {
    setOpen(false);
    onNavigate(v);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button type="button" onClick={() => go('home')} aria-label="OpportunityKit home" className="rounded-lg">
          <Logo />
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm md:hidden"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'x' : 'menu'} />
          Menu
        </button>

        <nav aria-label="Main" className="hidden md:block">
          <NavList view={view} go={go} profile={profile} />
        </nav>
      </div>
      {open && (
        <nav id="main-menu" aria-label="Main" className="border-t border-ink/10 px-4 pb-3 md:hidden">
          <NavList view={view} go={go} profile={profile} stacked />
        </nav>
      )}
    </header>
  );
}

function NavList({ view, go, profile, stacked }) {
  return (
    <ul className={stacked ? 'mt-2 flex flex-col gap-1' : 'flex items-center gap-1'}>
      {ITEMS.map(([id, label]) => (
        <li key={id}>
          <button
            type="button"
            onClick={() => go(id)}
            aria-current={view === id ? 'page' : undefined}
            className={`flex min-h-[44px] w-full items-center rounded-lg px-3.5 text-sm font-semibold transition-colors ${
              view === id ? 'bg-ink text-white' : 'text-ink hover:bg-brand-tint'
            }`}
          >
            {label}
            {id === 'profile' && !profile && (
              <span className="ml-2 rounded-full bg-mark px-2 py-0.5 text-xs font-bold text-ink">Start</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
