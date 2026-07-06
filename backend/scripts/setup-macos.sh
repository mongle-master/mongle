#!/usr/bin/env bash
# 맥북 로컬 개발 사전 준비 (멱등 — 여러 번 실행해도 안전)
# 권장 경로(도커)만 쓰면 Docker Desktop만 있으면 되고,
# 비도커 ./gradlew bootRun 까지 쓰려면 JDK 21(툴체인 고정 버전)이 필요하다.
set -euo pipefail

need_jdk=false
[[ "${1:-}" == "--with-jdk" ]] && need_jdk=true

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

if $need_jdk; then
  # 백엔드 toolchain은 21 고정(backend/build.gradle.kts). 25 등 다른 JDK가 있어도
  # gradle foojay 리졸버가 21을 내려받지만, gradle 구동용 JDK는 하나 필요하다.
  if /usr/libexec/java_home -v 21 >/dev/null 2>&1; then
    echo "ok: JDK 21 ($(/usr/libexec/java_home -v 21))"
  else
    echo "==> Temurin 21 설치"
    brew install --cask temurin@21
  fi
fi

if ! command -v jq >/dev/null; then
  echo "==> jq 설치 (runbook 예제의 토큰 추출용)"
  brew install jq
fi

echo
echo "완료. 다음 단계: backend/docs/runbook/local.md"
echo "  cd backend && docker compose up -d --build"
