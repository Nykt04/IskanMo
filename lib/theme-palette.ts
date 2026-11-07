export interface ColorTheme {
  id: string;
  name: string;
  bg: string;
  border: string;
  text: string;
  accent: string;
  badge: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'indigo',
    name: 'Indigo',
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/15',
    border: 'border-indigo-500/30',
    text: 'text-indigo-200',
    accent: 'bg-indigo-500',
    badge: 'bg-indigo-500/20 text-indigo-300',
  },
  {
    id: 'cyan',
    name: 'Cyan',
    bg: 'bg-cyan-500/10 hover:bg-cyan-500/15',
    border: 'border-cyan-500/30',
    text: 'text-cyan-200',
    accent: 'bg-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-200',
    accent: 'bg-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    id: 'amber',
    name: 'Amber',
    bg: 'bg-amber-500/10 hover:bg-amber-500/15',
    border: 'border-amber-500/30',
    text: 'text-amber-200',
    accent: 'bg-amber-400',
    badge: 'bg-amber-500/20 text-amber-300',
  },
  {
    id: 'rose',
    name: 'Rose',
    bg: 'bg-rose-500/10 hover:bg-rose-500/15',
    border: 'border-rose-500/30',
    text: 'text-rose-200',
    accent: 'bg-rose-400',
    badge: 'bg-rose-500/20 text-rose-300',
  },
  {
    id: 'zinc',
    name: 'Graphite',
    bg: 'bg-zinc-800/40 hover:bg-zinc-800/60',
    border: 'border-zinc-700/50',
    text: 'text-zinc-200',
    accent: 'bg-zinc-400',
    badge: 'bg-zinc-800 text-zinc-300',
  },
];

export const getThemeById = (id?: string): ColorTheme => {
  return COLOR_THEMES.find((t) => t.id === id) || COLOR_THEMES[0];
};
