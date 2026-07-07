import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people/$personId')({
  component: PersonLayout,
})

function PersonLayout() {
  return <Outlet />
}
