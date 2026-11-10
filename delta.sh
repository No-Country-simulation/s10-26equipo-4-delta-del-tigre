#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/compose.yaml"
ENV_FILE="$SCRIPT_DIR/.env"
DEV_ENV_FILE="$SCRIPT_DIR/.env.desarrollo"

usage() {
  cat <<'EOF'
Uso: ./delta.sh <comando> [argumentos]

Comandos:
  init                 Crear .env desde .env.desarrollo (no sobrescribe)
  build                Construir las imágenes
  create               Crear los contenedores sin iniciarlos
  up                   Construir y levantar el entorno en segundo plano
  start                Iniciar contenedores ya creados
  stop                 Detener los contenedores sin eliminarlos
  restart [servicio]   Reiniciar todos o un servicio
  down                 Detener y eliminar contenedores (conserva volúmenes)
  status               Mostrar el estado de los contenedores
  logs [servicio]      Mostrar logs; acepta -f para seguirlos
  connect [servicio]   Abrir una shell interactiva (por defecto: workspace)
  help                 Mostrar esta ayuda
EOF
}

command_name="${1:-help}"
if (($# > 0)); then
  shift
fi

if [[ "$command_name" == "help" || "$command_name" == "--help" || "$command_name" == "-h" ]]; then
  usage
  exit 0
fi

if [[ "$command_name" == "init" ]]; then
  if [[ -e "$ENV_FILE" ]]; then
    printf 'Ya existe %s; no se modificó.\n' "$ENV_FILE"
  else
    cp "$DEV_ENV_FILE" "$ENV_FILE"
    printf 'Se creó %s. Revísalo antes de iniciar los contenedores.\n' "$ENV_FILE"
  fi
  exit 0
fi

if [[ ! -f "$ENV_FILE" ]]; then
  printf 'Falta .env. Ejecuta ./delta.sh init y revisa el archivo creado.\n' >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  printf 'No se encontró Docker. Instala Docker y asegúrate de que el daemon esté activo.\n' >&2
  exit 1
fi

if command -v id >/dev/null 2>&1; then
  local_uid="$(id -u)"
  if [[ "$local_uid" == "0" ]]; then
    printf 'No ejecutes este script como root; ejecútalo con tu usuario normal para evitar archivos del host propiedad de root.\n' >&2
    exit 1
  fi
  export LOCAL_UID="$local_uid"
  export LOCAL_GID="$(id -g)"
else
  export LOCAL_UID=1000
  export LOCAL_GID=1000
fi

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

case "$command_name" in
  build)
    compose build "$@"
    ;;
  create)
    compose create --build "$@"
    ;;
  up)
    compose up --build --detach "$@"
    ;;
  start)
    compose start "$@"
    ;;
  stop)
    compose stop "$@"
    ;;
  restart)
    compose restart "$@"
    ;;
  down)
    compose down "$@"
    ;;
  status|ps)
    compose ps --all "$@"
    ;;
  logs)
    compose logs "$@"
    ;;
  connect|exec)
    service="${1:-workspace}"
    if (($# > 0)); then
      shift
    fi
    if (($# == 0)); then
      set -- sh
    fi
    compose exec --interactive --tty "$service" "$@"
    ;;
  *)
    printf 'Comando desconocido: %s\n\n' "$command_name" >&2
    usage >&2
    exit 2
    ;;
esac
