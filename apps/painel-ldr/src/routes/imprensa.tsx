import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/imprensa")({
  component: ImprensaLayout,
});

function ImprensaLayout() {
  return <Outlet />;
}
