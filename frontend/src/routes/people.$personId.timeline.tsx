import { createFileRoute, redirect } from '@tanstack/react-router'

// 구 URL 호환: 인물 타임라인은 이제 Person activity의 step(`?view=timeline`)이다.
// 북마크·공유된 기존 링크만 여기로 들어오고, 앱 내부에서는 이 URL을 만들지 않는다.
export const Route = createFileRoute('/people/$personId/timeline')({
  beforeLoad: ({ params }) => {
    throw redirect({
      href: `/people/${params.personId}?view=timeline`,
      replace: true,
    })
  },
})
