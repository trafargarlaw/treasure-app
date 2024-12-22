import { userLogout } from '@/gen/endpoints/fastAPI';
import { isAuthenticated } from '@/lib/auth';
import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/logout')({
  beforeLoad: async () => ({
    isAuthenticated,
  }),
  loader: async ({ context }) => {
    const isAuth = context.isAuthenticated();
    if (!isAuth) {
      return <Navigate to="/login" />;
    } else {
      const logout = await userLogout();
      return logout;
    }
  },
  component: LogoutPage,
})

function LogoutPage() {
  const logout = Route.useLoaderData();
  if (logout) {
    return <Navigate to="/login" />;
  }
}
