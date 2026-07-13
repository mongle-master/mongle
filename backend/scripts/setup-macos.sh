#!/usr/bin/env bash
# 맥북 로컬 개발 사전 준비 (멱등 — 여러 번 실행해도 안전)
# Docker Compose 실행과 호스트 NestJS 개발에 필요한 Docker·Node.js·pnpm·jq를 준비한다.
set -euo pipefail

if ! command -v brew >/dev/null; then
  echo "Homebrew가 없습니다. https://brew.sh 안내대로 설치 후 다시 실행하세요."
  exit 1
fi

if ! command -v docker >/dev/null; then
  echo "==> Docker Desktop 설치"
  brew install --cask docker
  echo "   설치 후 Docker.app을 한 번 실행해 데몬을 켜세요."
else
  echo "ok: docker $(docker --version | cut -d' ' -f3)"
fi

node_major=0
if command -v node >/dev/null; then
  node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
fi
if (( node_major < 22 )); then
  echo "==> Node.js 22 이상 설치"
  if brew list --versions node >/dev/null 2>&1; then
    brew upgrade node
  else
    brew install node
  fi
  hash -r
  node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
  if (( node_major < 22 )); then
    echo "Node.js 22 이상이 PATH에 없습니다. 현재: $(node --version)"
    exit 1
  fi
else
  echo "ok: node $(node --version)"
fi

pnpm_major=0
if command -v pnpm >/dev/null; then
  pnpm_major="$(pnpm --version | cut -d. -f1)"
fi
if (( pnpm_major < 10 )); then
  echo "==> pnpm 10 이상 설치"
  if brew list --versions pnpm >/dev/null 2>&1; then
    brew upgrade pnpm
  else
    brew install pnpm
  fi
  hash -r
  pnpm_major="$(pnpm --version | cut -d. -f1)"
  if (( pnpm_major < 10 )); then
    echo "pnpm 10 이상이 PATH에 없습니다. 현재: $(pnpm --version)"
    exit 1
  fi
else
  echo "ok: pnpm $(pnpm --version)"
fi

if ! command -v jq >/dev/null; then
  echo "==> jq 설치 (runbook 예제의 토큰 추출용)"
  brew install jq
fi

# 커밋 메시지 훅(Conventional Commits 검증) 활성화 — 멱등
repo_root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -n "$repo_root" && -d "$repo_root/.githooks" ]]; then
  git -C "$repo_root" config core.hooksPath .githooks
  echo "ok: git hooks (.githooks) 활성화"
fi

echo
echo "완료. 다음 단계: backend/docs/runbook/local.md"
echo "  cd backend && docker compose up -d --build"
echo "  # 호스트 개발은 pnpm install 후 pnpm dev"
