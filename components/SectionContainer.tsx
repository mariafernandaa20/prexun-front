import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export default function SectionContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state: sidebarState, isMobile } = useSidebar();

  const containerClasses = React.useMemo(() => {
    const baseClasses =
      'w-full mx-auto overflow-x-auto transition-all duration-200 ease-linear';
    if (sidebarState === 'expanded') {
      return `${baseClasses} max-w-[calc(90vw-var(--sidebar-width-icon))] max-w-[calc(90vw-var(--sidebar-width))] lg:max-w-[calc(90vw-var(--sidebar-width))] xl:max-w-[calc(95vw-var(--sidebar-width))]`;
    } else {
      return `${baseClasses} max-w-[calc(90vw-var(--sidebar-width-icon))] max-w-[calc(90vw-var(--sidebar-width))] lg:max-w-[calc(90vw-var(--sidebar-width-icon))] xl:max-w-[calc(95vw-var(--sidebar-width-icon))]`;
    }
  }, [sidebarState, isMobile]);

  return <div className={containerClasses}>{children}</div>;
}
