'use client';
import { AdminSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { data as sidebarData } from "@/components/sidebar";
import { usePathname } from 'next/navigation';

export default function Page({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  console.log(pathname);
  const item = sidebarData.navMain.find((item) => item.url === pathname);

  console.log("Current Path:", pathname);
  console.log("Matched Item:", item);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-bold">{item ? item.title : "Default Title"}</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
