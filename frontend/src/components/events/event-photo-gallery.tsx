import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { mediaUrl } from '@/lib/api/client'
import { cn } from '@/lib/utils'

const PREVIEW_LIMIT = 4
const SWIPE_THRESHOLD_PX = 48

export function EventPhotoGallery({ photoUrls }: { photoUrls: string[] }) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const didSwipe = useRef(false)

  const previews = photoUrls.slice(0, PREVIEW_LIMIT)
  const hiddenCount = Math.max(photoUrls.length - PREVIEW_LIMIT, 0)

  const openViewer = (index: number) => {
    setActiveIndex(index)
    setViewerOpen(true)
  }

  const goPrev = () => {
    setActiveIndex((index) => (index === 0 ? photoUrls.length - 1 : index - 1))
  }

  const goNext = () => {
    setActiveIndex((index) => (index === photoUrls.length - 1 ? 0 : index + 1))
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX
    didSwipe.current = false
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || photoUrls.length <= 1) return

    const deltaX = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return

    didSwipe.current = true
    if (deltaX < 0) goNext()
    else goPrev()
  }

  const handleViewerAreaClick = () => {
    if (didSwipe.current) {
      didSwipe.current = false
      return
    }
    setViewerOpen(false)
  }

  useEffect(() => {
    if (!viewerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewerOpen(false)
      if (event.key === 'ArrowLeft') {
        setActiveIndex((index) =>
          index === 0 ? photoUrls.length - 1 : index - 1,
        )
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((index) =>
          index === photoUrls.length - 1 ? 0 : index + 1,
        )
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [viewerOpen, photoUrls.length])

  if (photoUrls.length === 0) return null

  return (
    <>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {previews.map((url, index) => {
          const src = mediaUrl(url)
          if (!src) return null
          const isOverflowTile = index === PREVIEW_LIMIT - 1 && hiddenCount > 0

          return (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => openViewer(index)}
              className="relative aspect-square overflow-hidden rounded-2xl bg-muted"
            >
              <img
                src={src}
                alt={`기록 사진 ${index + 1}`}
                className="size-full object-cover"
                loading="lazy"
              />
              {isOverflowTile ? (
                <span className="absolute inset-0 flex items-center justify-center bg-foreground/45 text-lg font-extrabold text-background">
                  +{hiddenCount}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {viewerOpen ? (
        <div
          className="fixed inset-0 z-50 flex justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="기록 사진 보기"
          onClick={() => setViewerOpen(false)}
        >
          <div className="absolute inset-0 bg-foreground/55 backdrop-blur-[2px]" />

          <div className="relative flex h-full w-full max-w-md flex-col px-5">
            <div className="mt-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between">
              {photoUrls.length > 1 ? (
                <span
                  onClick={(event) => event.stopPropagation()}
                  className="rounded-full bg-background/90 px-3 py-1 text-xs font-extrabold text-foreground"
                >
                  {activeIndex + 1} / {photoUrls.length}
                </span>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setViewerOpen(false)
                }}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background/90 text-foreground"
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            </div>

            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-7 py-8"
              onClick={handleViewerAreaClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {photoUrls.length > 1 ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    goPrev()
                  }}
                  className="absolute left-5 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground"
                  aria-label="이전 사진"
                >
                  <ChevronLeft className="size-6" />
                </button>
              ) : null}

              {(() => {
                const src = mediaUrl(photoUrls[activeIndex])
                if (!src) return null
                return (
                  <img
                    src={src}
                    alt={`기록 사진 ${activeIndex + 1}`}
                    className="max-h-full max-w-full touch-pan-y rounded-2xl object-contain shadow-lg"
                    onClick={(event) => event.stopPropagation()}
                    draggable={false}
                  />
                )
              })()}

              {photoUrls.length > 1 ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    goNext()
                  }}
                  className="absolute right-5 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground"
                  aria-label="다음 사진"
                >
                  <ChevronRight className="size-6" />
                </button>
              ) : null}
            </div>

            <div
              className="flex justify-center gap-1.5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
              onClick={(event) => event.stopPropagation()}
            >
              {photoUrls.map((url, index) => (
                <button
                  key={`${url}-dot-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`${index + 1}번째 사진`}
                  className={cn(
                    'rounded-full transition-all',
                    index === activeIndex
                      ? 'size-2 bg-background'
                      : 'size-1.5 bg-background/45',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
