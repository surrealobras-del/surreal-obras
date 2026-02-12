# Script para configurar conexão com GitHub
# Execute: .\setup-github.ps1

Write-Host "=== Configuração do GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar informações
$userName = Read-Host "Digite seu nome completo"
$userEmail = Read-Host "Digite seu email do GitHub"
$repoUrl = Read-Host "Digite a URL do repositório GitHub (ex: https://github.com/usuario/repositorio.git)"

# Configurar Git
Write-Host "`nConfigurando Git..." -ForegroundColor Yellow
git config --global user.name "$userName"
git config --global user.email "$userEmail"
git config --global credential.helper manager-core
git config --global init.defaultBranch main

Write-Host "✓ Configurações do Git atualizadas" -ForegroundColor Green

# Adicionar remote
if ($repoUrl) {
    Write-Host "`nConfigurando remote..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin $repoUrl
    Write-Host "✓ Remote 'origin' configurado: $repoUrl" -ForegroundColor Green
}

# Preparar commit inicial
Write-Host "`nPreparando commit inicial..." -ForegroundColor Yellow
git add .
git commit -m "Initial commit: Surreal Construções e Reformas CRM"

Write-Host "`n✓ Repositório configurado com sucesso!" -ForegroundColor Green
Write-Host "`nPara fazer push, execute:" -ForegroundColor Cyan
Write-Host "  git push -u origin main" -ForegroundColor White
Write-Host "`nNota: Você será solicitado a inserir suas credenciais do GitHub." -ForegroundColor Yellow
Write-Host "      Use um Personal Access Token (PAT) como senha." -ForegroundColor Yellow
