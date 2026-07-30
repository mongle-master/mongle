#!/usr/bin/env node
// 시안 간 이동 내비(draft-nav.snippet.html)를 실험 폴더의 모든 .html에 주입합니다. 멱등입니다.
//
// 사용법:
//   node docs/experiments/_shared/inject-draft-nav.js <실험-폴더>
//
// 주의: 내비의 항목 목록(.xdn-item)과 ORDER 배열은 스니펫 안에 하드코딩돼 있습니다.
// 새 실험에 쓰기 전에 draft-nav.snippet.html의 항목을 그 실험의 파일명에 맞게 먼저 수정하세요.
// 키 매핑: index.html → "index", 그 외 파일은 파일명 첫 글자(A-xxx.html → "A").
const fs = require('fs')
const path = require('path')

const dir = process.argv[2]
if (!dir) {
  console.error('사용법: node inject-draft-nav.js <실험-폴더>')
  process.exit(1)
}

const snippetPath = path.join(__dirname, 'draft-nav.snippet.html')
const tpl = fs.readFileSync(snippetPath, 'utf8')

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'))
if (files.length === 0) {
  console.error('HTML 파일이 없습니다:', dir)
  process.exit(1)
}

for (const file of files) {
  const p = path.join(dir, file)
  let html = fs.readFileSync(p, 'utf8')
  if (html.includes('class="xdn"')) {
    console.log('건너뜀 (이미 주입됨):', file)
    continue
  }
  if (!/<body[^>]*>/.test(html)) {
    console.log('건너뜀 (<body> 없음):', file)
    continue
  }
  const key = file === 'index.html' ? 'index' : file.charAt(0).toUpperCase()
  const injected = tpl.replaceAll('@@KEY@@', key)
  html = html.replace(/<body[^>]*>/, (m) => m + '\n' + injected)
  fs.writeFileSync(p, html)
  console.log('주입 완료:', file, `(key=${key})`)
}
