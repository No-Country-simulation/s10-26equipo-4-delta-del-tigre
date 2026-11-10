# ==========================================
# ETAPA 1: Compilación (Build)
# ==========================================
ARG JAVA_BUILD_IMAGE=eclipse-temurin:21-jdk-alpine
ARG JAVA_RUNTIME_IMAGE=eclipse-temurin:21-jre-alpine
FROM ${JAVA_BUILD_IMAGE} AS builder

WORKDIR /app

# 1. Copiamos el wrapper de Maven y la configuración del POM
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# 2. Le damos permisos de ejecución al script mvnw y descargamos dependencias (aprovechando la caché de Docker)
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# 3. Copiamos el código fuente
COPY src ./src

# 4. Compilamos el proyecto omitiendo la ejecución de tests para agilizar el build del contenedor
RUN ./mvnw clean package -DskipTests

# ==========================================
# ETAPA 2: Entorno de Ejecución (Runtime)
# ==========================================
FROM ${JAVA_RUNTIME_IMAGE}

WORKDIR /app

# Creamos un usuario no-root por seguridad en producción
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiamos solo el JAR empaquetado desde la etapa de compilación
COPY --from=builder /app/target/*.jar app.jar

# Exponemos el puerto por defecto de Spring Boot
EXPOSE 8080

# Definimos el comando de arranque del contenedor
ENTRYPOINT ["java", "-jar", "app.jar"]
