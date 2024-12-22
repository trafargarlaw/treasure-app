import { Toaster } from "@/components/ui/sonner";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

export const Route = createRootRouteWithContext()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex flex-col h-screen">
      <Toaster />
      <Outlet />
    </div>
  );
}
