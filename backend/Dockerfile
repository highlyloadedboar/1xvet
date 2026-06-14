FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache curl \
    && curl -sf https://storage.yandexcloud.net/cloud-certs/CA.pem -o /usr/local/share/ca-certificates/yandex-cloud-ca.crt \
    && update-ca-certificates \
    && keytool -import -trustcacerts -noprompt -alias yandex-cloud-ca \
       -file /usr/local/share/ca-certificates/yandex-cloud-ca.crt \
       -keystore $JAVA_HOME/lib/security/cacerts \
       -storepass changeit \
    && mkdir -p /root/.postgresql \
    && cp /usr/local/share/ca-certificates/yandex-cloud-ca.crt /root/.postgresql/root.crt \
    && apk del curl

WORKDIR /app

COPY build/libs/*.jar app.jar

EXPOSE 8080 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
