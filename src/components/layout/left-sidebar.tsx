import LeftSidebarContent from './left-sidebar-content';

// Definišemo novi tip koji sadrži i broj mečeva
export interface SportWithCount {
  name: string;
  count: number;
}

interface LeftSidebarProps {
  sports: SportWithCount[];
}

export default function LeftSidebar({ sports }: LeftSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col border-r border-border p-4 pt-6">
      <LeftSidebarContent sports={sports} />
    </aside>
  );
}