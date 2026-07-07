import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { fetchPerson } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import { fallbackPersonDetail } from '@/lib/fallback-data'
import { queryKeys } from '@/lib/query-keys'

export const Route = createFileRoute('/people/$personId')({
  component: PersonProfilePage,
})

function PersonProfilePage() {
  const { personId } = Route.useParams()
  const id = Number(personId)

  const personQuery = useQuery({
    queryKey: queryKeys.person(id),
    queryFn: () => safeApi(() => fetchPerson(id), fallbackPersonDetail(id)),
    enabled: Number.isFinite(id),
  })

  const person = personQuery.data ?? fallbackPersonDetail(id)

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-10">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted-foreground"
      >
        <ArrowLeft className="size-4" />홈
      </Link>

      <div className="flex items-center gap-4">
        <MonogramAvatar
          name={person.name}
          imageUrl={person.profileImageUrl}
          favorite={person.favorite}
          className="size-20"
        />
        <div>
          <h1 className="text-2xl font-extrabold">{person.name}</h1>
          {person.relationType ? (
            <p className="text-sm text-muted-foreground">
              {person.relationType}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {person.relationTags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button asChild className="w-full">
          <Link to="/people/$personId/timeline" params={{ personId }}>
            타임라인 보기
          </Link>
        </Button>
      </div>

      <Card className="mt-6 p-4">
        <h2 className="font-extrabold">관계 통계</h2>
        <Separator className="my-3" />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="만남 횟수" value={`${person.stats.meetCount}회`} />
          <Stat label="기록 수" value={`${person.stats.recordCount}개`} />
          <Stat
            label="알게 된 지"
            value={person.stats.acquaintancePeriod ?? '—'}
          />
          <Stat
            label="마지막 만남"
            value={person.stats.lastMetRelative ?? '—'}
          />
        </dl>
      </Card>

      {person.likes.length > 0 ? (
        <Card className="mt-4 p-4">
          <h2 className="font-extrabold">좋아하는 것</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {person.likes.join(' · ')}
          </p>
        </Card>
      ) : null}

      {person.cautions.length > 0 ? (
        <Card className="mt-4 p-4">
          <h2 className="font-extrabold">주의할 점</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {person.cautions.join(' · ')}
          </p>
        </Card>
      ) : null}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-extrabold">{value}</dd>
    </div>
  )
}
