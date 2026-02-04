import LeftSidebarContent from './left-sidebar-content';

interface LeftSidebarProps {
  sports: string[];
}

export default function LeftSidebar({ sports }: LeftSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col border-r border-border p-4 pt-6">
      <LeftSidebarContent sports={sports} />
    </aside>
  );
}
