/*
 * 시각 레퍼런스 HTML 생성기 (playbook 단계 G).
 * Storybook 정적 빌드가 출력한 컴파일 CSS(= 토큰 정본의 실제 산출물)를 템플릿에
 * 인라인해 자기 완결 단일 파일을 만든다. 명세와 구현이 같은 파일이라 어긋날 수 없다.
 *
 * 순서: pnpm build-storybook → node scripts/build-showcase.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const assetsDir = path.join(root, 'storybook-static/assets')

const cssFile = readdirSync(assetsDir).find((f) => f.startsWith('iframe-') && f.endsWith('.css'))
if (!cssFile) {
  console.error('storybook-static/assets/iframe-*.css 가 없습니다. pnpm build-storybook 먼저.')
  process.exit(1)
}
let css = readFileSync(path.join(assetsDir, cssFile), 'utf8')

/* 로컬 에셋(폰트) base64 인라인 — 외부 의존은 구글 폰트 CDN만 남긴다 */
let inlined = 0
css = css.replace(/url\((['"])?([^)'"]+)\1\)/g, (match, _q, ref) => {
  if (/^(data:|https?:|#)/.test(ref)) return match
  try {
    const abs = path.join(assetsDir, ref)
    const buf = readFileSync(abs)
    const ext = path.extname(abs).slice(1).toLowerCase()
    const mime =
      ext === 'woff2' ? 'font/woff2' : ext === 'woff' ? 'font/woff' : ext === 'ttf' ? 'font/ttf' : `image/${ext}`
    inlined++
    return `url(data:${mime};base64,${buf.toString('base64')})`
  } catch {
    return match
  }
})

/* 폰트 CDN @import 주입 — @import는 스타일시트 맨 앞이어야 하므로 CSS 선두에 붙인다.
   .storybook/fonts.css와 같은 목록을 유지한다. */
const fontImports = readFileSync(path.join(root, '.storybook/fonts.css'), 'utf8')
css = `${fontImports}\n${css}`

const template = readFileSync(path.join(root, 'showcase/template.html'), 'utf8')

/* 클래스 커버리지 점검 — 템플릿이 쓴 클래스가 컴파일 CSS에 실제로 있는지 */
const usedClasses = new Set()
for (const m of template.matchAll(/class="([^"]+)"/g)) {
  for (const c of m[1].split(/\s+/)) usedClasses.add(c)
}
const missing = [...usedClasses].filter((cls) => {
  const escaped = cls.replaceAll('.', '\\.').replace(/([/:[\]])/g, '\\$1')
  return !css.includes(`.${escaped}`)
})
if (missing.length > 0) {
  console.warn(`경고: 컴파일 CSS에 없는 클래스 ${missing.length}개 (인라인 스타일로 대체했는지 확인):`)
  console.warn(missing.join(', '))
}

const html = `<!doctype html>
<html lang="ko" class="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>결 (Gyeol) — 디자인 시스템</title>
<style id="gyeol-tokens">
/* src/styles/globals.css 의 컴파일 산출물 — 편집 금지. 재생성: scripts/build-showcase.mjs */
${css}
</style>
</head>
<body class="bg-background text-foreground antialiased">
${template}
</body>
</html>
`

const out = path.join(root, 'docs/design-system.html')
writeFileSync(out, html)
console.log(
  `docs/design-system.html 생성 완료 — ${(html.length / 1024).toFixed(0)} KB, 인라인 에셋 ${inlined}개` +
    (missing.length ? `, 미해결 클래스 ${missing.length}개` : ', 클래스 100% 커버'),
)
