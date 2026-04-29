param(
  [switch]$SkipDocker
)

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host ".env criado a partir de .env.example"
}

if (-not $SkipDocker) {
  docker compose up -d postgres redis
}

npm install
npm run db:migrate
npm run db:seed

Write-Host "Setup concluido. Rode npm run dev para iniciar API e Web."

