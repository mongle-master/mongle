import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Foundation/Tokens',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SURFACE_TOKENS = [
  ['--background', '캔버스'],
  ['--card', '카드'],
  ['--secondary', '조작 표면'],
  ['--muted', '비활성 표면'],
  ['--accent', 'hover 표면'],
] as const

const TEXT_TOKENS = [
  ['--foreground', '잉크 (제목)'],
  ['--body', '본문'],
  ['--muted-foreground', '보조'],
] as const

const ACTION_TOKENS = [
  ['--primary', '주요 액션'],
  ['--destructive', '위험'],
  ['--warning', '경고'],
  ['--success', '성공'],
] as const

const EMOTION_TOKENS = [
  ['--emotion-calm', '고요'],
  ['--emotion-warm', '따뜻'],
  ['--emotion-muse', '사색'],
  ['--emotion-clear', '맑음'],
  ['--emotion-dear', '소중'],
] as const

function Swatches({ tokens }: { tokens: readonly (readonly [string, string])[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {tokens.map(([token, label]) => (
        <div key={token} className="flex w-36 flex-col gap-2">
          <div
            className="h-16 rounded-lg border border-border"
            style={{ background: `var(${token})` }}
          />
          <div className="flex flex-col">
            <span className="text-caption font-medium text-foreground">{label}</span>
            <code className="text-[11px] text-muted-foreground">{token}</code>
          </div>
        </div>
      ))}
    </div>
  )
}

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <section>
        <p className="eyebrow mb-3">표면</p>
        <Swatches tokens={SURFACE_TOKENS} />
      </section>
      <section>
        <p className="eyebrow mb-3">글자</p>
        <Swatches tokens={TEXT_TOKENS} />
      </section>
      <section>
        <p className="eyebrow mb-3">액션·상태</p>
        <Swatches tokens={ACTION_TOKENS} />
      </section>
      <section>
        <p className="eyebrow mb-3">감정 orb (대기 전용)</p>
        <Swatches tokens={EMOTION_TOKENS} />
      </section>
    </div>
  ),
}

const TYPE_SCALE = [
  ['display-mega', 'text-display-mega font-display font-light', '기록의 제목, 히어로'],
  ['display-lg', 'text-display-lg font-display font-light', '섹션 헤드'],
  ['display-sm', 'text-display-sm font-display font-light', '회고 인용'],
  ['title-md', 'text-title-md font-medium', '카드 제목 (산세리프)'],
  ['body-md', 'text-body-md', '기본 본문'],
  ['body-sm', 'text-body-sm', '보조 본문'],
  ['caption', 'text-caption', '캡션'],
  ['eyebrow', 'eyebrow', '섹션 라벨'],
] as const

export const Typography: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {TYPE_SCALE.map(([name, cls, use]) => (
        <div key={name} className="flex flex-col gap-1 border-b border-border pb-4">
          <p className={cls === 'eyebrow' ? cls : `text-foreground ${cls}`}>
            조용한 날에도 결은 남는다 — {name}
          </p>
          <span className="text-caption text-muted-foreground">
            {name} · {use}
          </span>
        </div>
      ))}
    </div>
  ),
}

export const RadiusAndShadow: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {(
        [
          ['xs · 4px', 'var(--radius-xs)'],
          ['md · 8px (입력)', 'var(--radius-md)'],
          ['xl · 16px (카드)', 'var(--radius-xl)'],
          ['2xl · 24px (대기)', 'var(--radius-2xl)'],
          ['pill (CTA)', 'var(--radius-pill)'],
        ] as const
      ).map(([label, radius]) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <div className="size-24 bg-secondary" style={{ borderRadius: radius }} />
          <span className="text-caption text-muted-foreground">{label}</span>
        </div>
      ))}
      {(
        [
          ['card', 'var(--shadow-card)'],
          ['float', 'var(--shadow-float)'],
          ['overlay', 'var(--shadow-overlay)'],
        ] as const
      ).map(([label, shadow]) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <div className="size-24 rounded-xl bg-card" style={{ boxShadow: shadow }} />
          <span className="text-caption text-muted-foreground">shadow-{label}</span>
        </div>
      ))}
    </div>
  ),
}
