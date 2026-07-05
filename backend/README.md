# mongle-backend

mongle 백엔드 (Spring Boot + Kotlin). 이 레포는 프론트/백엔드를 함께 담는 모노레포이며,
백엔드는 `backend/`에 위치한다.
평범한 **레이어드 아키텍처**(`controller → service → repository` + `domain`)로 구성되어 있다.

## 스택

| 구분 | 버전 |
| --- | --- |
| Kotlin | 2.1.10 |
| Spring Boot | 3.5.0 |
| Java (toolchain) | 21 |
| Build | Gradle 9.4 (Kotlin DSL + Version Catalog) |
| Lint | ktlint |

의존성/플러그인 버전은 [`gradle/libs.versions.toml`](gradle/libs.versions.toml) 한 곳에서 관리한다.

## 프로젝트 구조

```
src/main/kotlin/com/mongle
├── Application.kt              # 진입점
├── config/                     # 설정 (JPA 감사 등)
├── controller/                 # 웹 계층 (REST) + dto/
├── service/                    # 비즈니스 로직
├── repository/                 # 영속 계층 (Spring Data JPA)
├── domain/                     # 엔티티 (BaseEntity, Sample)
└── common/exception/           # 공통 예외 + 전역 핸들러
```

`Sample`은 계층 전체(엔티티→리포지토리→서비스→컨트롤러)를 보여주는 **예시**다.
실제 프로젝트에서는 지우고 도메인에 맞게 새로 작성한다.

## 실행

```bash
./gradlew bootRun      # 앱 실행 (기본 임베디드 H2)
./gradlew test         # 테스트
./gradlew ktlintCheck  # 린트
./gradlew ktlintFormat # 린트 자동 수정
./gradlew build        # 전체 빌드
```

### 샘플 엔드포인트

```bash
curl -X POST localhost:8080/api/samples -H 'Content-Type: application/json' -d '{"name":"hello"}'
curl localhost:8080/api/samples
curl localhost:8080/api/samples/1
curl localhost:8080/actuator/health
```

## 설정 (application.yml)

템플릿의 `src/main/resources/application.yml`은 **비어 있다**.
프로젝트에 맞게 채워 넣으면 된다 (파일 상단 주석에 참고 구조 포함).
설정이 비어 있어도 클래스패스의 임베디드 **H2**로 바로 뜨고 테스트가 통과한다.
운영에서 MySQL을 쓰려면 `datasource`를 채우면 된다 (드라이버는 이미 포함).

## 개발 메모

- 패키지 루트: `com.mongle`
- `domain/Sample.kt` 등 샘플 계층은 실제 도메인 작성 시 지우고 대체한다.
- 모노레포이므로 백엔드 gradle 명령은 `backend/` 안에서 실행한다.
