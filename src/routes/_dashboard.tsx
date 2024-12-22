import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { isAuthenticated } from "../lib/auth";

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async () => ({
    isAuthenticated,
  }),
  loader: async ({ context }) => {
    const isAuth = context.isAuthenticated();

    return isAuth;
  },
  component: Authenticated,
});

function Authenticated() {
  const isAuth = Route.useLoaderData();
  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-full">
      <Outlet />
    </div>
  );
}
