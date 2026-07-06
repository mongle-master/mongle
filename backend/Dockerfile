# syntax=docker/dockerfile:1
# ---- build ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
# 의존성 레이어 캐시: 빌드 스크립트만 먼저 복사해 소스 변경 시 재다운로드를 피한다.
COPY gradlew settings.gradle.kts build.gradle.kts gradle.properties ./
COPY gradle ./gradle
RUN ./gradlew dependencies --no-daemon -q || true
COPY src ./src
# -plain.jar(비실행 jar)를 제외하고 부트 jar만 고른다.
RUN ./gradlew bootJar --no-daemon -q \
    && cp "$(ls build/libs/*.jar | grep -v plain)" /app/app.jar

# ---- runtime ----
FROM eclipse-temurin:21-jre
WORKDIR /app
ENV TZ=Asia/Seoul
COPY --from=build /app/app.jar app.jar
# H2 데이터·업로드 이미지가 쌓이는 경로 — 호스트 볼륨 마운트 지점(runbook/local.md)
VOLUME /app/data
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
