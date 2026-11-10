param(
    [Parameter(Position = 0)]
    [string]$Command = "help",

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments = @()
)

$ErrorActionPreference = "Stop"
$scriptDir = $PSScriptRoot
$composeFile = Join-Path $scriptDir "compose.yaml"
$envFile = Join-Path $scriptDir ".env"
$devEnvFile = Join-Path $scriptDir ".env.desarrollo"

function Show-Usage {
    @"
Uso: .\delta.ps1 <comando> [argumentos]

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
"@
}

if ($Command -in @("help", "--help", "-h")) {
    Show-Usage
    exit 0
}

if ($Command -eq "init") {
    if (Test-Path $envFile) {
        Write-Output "Ya existe $envFile; no se modificó."
    }
    else {
        Copy-Item -LiteralPath $devEnvFile -Destination $envFile
        Write-Output "Se creó $envFile. Revísalo antes de iniciar los contenedores."
    }
    exit 0
}

if (-not (Test-Path $envFile)) {
    throw "Falta .env. Ejecuta .\delta.ps1 init y revisa el archivo creado."
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "No se encontró Docker. Instala Docker y asegúrate de que el daemon esté activo."
}

$previousUid = $env:LOCAL_UID
$previousGid = $env:LOCAL_GID
$env:LOCAL_UID = "1000"
$env:LOCAL_GID = "1000"

try {
    $composeArgs = @("compose", "--env-file", $envFile, "-f", $composeFile)

    switch ($Command) {
        "build" {
            & docker @composeArgs build @Arguments
        }
        "create" {
            & docker @composeArgs create --build @Arguments
        }
        "up" {
            & docker @composeArgs up --build --detach @Arguments
        }
        "start" {
            & docker @composeArgs start @Arguments
        }
        "stop" {
            & docker @composeArgs stop @Arguments
        }
        "restart" {
            & docker @composeArgs restart @Arguments
        }
        "down" {
            & docker @composeArgs down @Arguments
        }
        { $_ -in @("status", "ps") } {
            & docker @composeArgs ps --all @Arguments
        }
        "logs" {
            & docker @composeArgs logs @Arguments
        }
        { $_ -in @("connect", "exec") } {
            $service = "workspace"
            $execArguments = @("sh")
            if ($Arguments.Count -gt 0) {
                $service = $Arguments[0]
                if ($Arguments.Count -gt 1) {
                    $execArguments = $Arguments[1..($Arguments.Count - 1)]
                }
            }
            & docker @composeArgs exec --interactive --tty $service @execArguments
        }
        default {
            Show-Usage
            throw "Comando desconocido: $Command"
        }
    }

    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
finally {
    $env:LOCAL_UID = $previousUid
    $env:LOCAL_GID = $previousGid
}
