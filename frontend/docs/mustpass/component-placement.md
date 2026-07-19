# mustpass — 컴포넌트 배치 기준

> 왜: 이 기준이 없어서 같은 종류의 컴포넌트가 activities와 components에 반반 갈리고, 순수 컴포넌트가 화면 폴더에 섞이고, components가 activities를 역참조하는 일이 반복됐다. 새 파일을 만들 때 "어디 둘까"를 이 표로 판단한다.

## 배치 규칙

| 무엇                                                         | 어디                                 | 판별                                                                |
| ------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------- |
| 화면 (라우팅 진입점, 데이터 로딩, mutation)                  | `src/stackflow/activities/{도메인}/` | useFlow, useQuery, useMutation 중 하나라도 직접 쓰면 화면이다       |
| 도메인 컴포넌트 (도메인 지식은 있으나 데이터는 props로 받음) | `src/components/{도메인}/`           | 라우팅, 데이터 의존 0. 도메인 타입(예: ChipResponse)을 props로 받음 |
| 공용 부품 (도메인 지식 0)                                    | `src/components/ui/`                 | 어느 도메인에서도 그대로 쓸 수 있음. shadcn 계열 포함               |
| 유틸, 상수, storage                                          | `src/lib/`                           | 컴포넌트가 아닌 순수 함수, 상수, 브라우저 저장소 접근               |

## 계약

- [ ] 화면(activities)에는 순수 프레젠테이션 컴포넌트를 두지 않는다. 순수하면 components로 내린다.
- [ ] `src/components/`는 `src/stackflow/`를 import 하지 않는다 (역방향 의존 금지). 컴포넌트가 쓰는 유틸이 activities에 있으면 그 유틸도 함께 내린다.
- [ ] 화면 이동(push, pop)은 화면 레이어가 소유하고, 하위 컴포넌트는 onNavigate/onBack 콜백을 props로 받는다.
- [ ] components로 내린 순수 컴포넌트는 storybook-stories.md 컨벤션대로 스토리를 동반한다.
- [ ] 한 파일은 한 컴포넌트만 export 한다. 여러 개면 파일명이 담을 수 없으므로 나눈다.

## 미결

- [ ] `components/brand/`, `components/layout/`을 `components/ui/`로 흡수할지 여부. 도메인 지식이 없어 ui 후보이나, 성격 구분을 위해 유지하는 선택지도 있음. 결정 시 이 문서에 반영한다.
