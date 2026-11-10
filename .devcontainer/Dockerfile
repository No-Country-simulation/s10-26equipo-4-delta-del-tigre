FROM mcr.microsoft.com/devcontainers/java:1-21-bookworm

ARG LOCAL_UID=1000
ARG LOCAL_GID=1000

RUN current_gid="$(id -g vscode)" \
    && if [ "$current_gid" != "${LOCAL_GID}" ]; then groupmod --non-unique --gid "${LOCAL_GID}" vscode; fi \
    && usermod --non-unique --uid "${LOCAL_UID}" --gid "${LOCAL_GID}" vscode

WORKDIR /workspaces/hostflow
USER vscode
CMD ["sleep", "infinity"]
