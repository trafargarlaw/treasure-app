import { Login } from "@/components/login";
import { isAuthenticated } from "@/lib/auth";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  beforeLoad: async () => ({
    isAuthenticated,
  }),
  loader: async ({ context }) => {
    const isAuth = context.isAuthenticated();
    return isAuth;
  },
});

function RouteComponent() {
  const isAuth = Route.useLoaderData();

  if (isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex justify-center items-center h-full">
      <Login />
    </div>
  );
}
