# Script PowerShell - Diagnostic et Correction Automatique
# Utilisation: .\diagnose-backend.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTIC BACKEND - Erreurs 500" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$backendUrl = "http://localhost:8080"
$postgresHost = "localhost"
$postgresPort = 5432
$postgresUser = "postgres"
$postgresDb = "votre_base"  # À modifier

# Fonction pour tester un endpoint
function Test-Endpoint {
    param($Url, $Name)
    
    Write-Host "🔍 Test: $Name" -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -ErrorAction Stop -TimeoutSec 5
        Write-Host " ✅ OK (Status: $($response.StatusCode))" -ForegroundColor Green
        return $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 500) {
            Write-Host " ❌ ERREUR 500" -ForegroundColor Red
            
            # Tenter de récupérer le message d'erreur
            try {
                $errorContent = $_.ErrorDetails.Message | ConvertFrom-Json
                if ($errorContent.message) {
                    Write-Host "   Message: $($errorContent.message)" -ForegroundColor Yellow
                }
            } catch {}
        }
        elseif ($statusCode -eq 0 -or $null -eq $statusCode) {
            Write-Host " ❌ Serveur inaccessible" -ForegroundColor Red
        }
        else {
            Write-Host " ⚠️  Status: $statusCode" -ForegroundColor Yellow
        }
        return $false
    }
}

# Fonction pour tester PostgreSQL
function Test-PostgreSQL {
    Write-Host "🔍 Test: PostgreSQL Connection" -NoNewline
    
    # Vérifier si psql est disponible
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    if (-not $psqlPath) {
        Write-Host " ⚠️  psql non trouvé (PostgreSQL non installé ou non dans PATH)" -ForegroundColor Yellow
        return $false
    }
    
    # Tester la connexion
    $testCommand = "SELECT 1;"
    $env:PGPASSWORD = "postgres"  # À modifier
    $result = & psql -h $postgresHost -p $postgresPort -U $postgresUser -d postgres -c $testCommand 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ OK" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host " ❌ Échec" -ForegroundColor Red
        return $false
    }
}

Write-Host "📡 TEST DES SERVICES" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Tests des endpoints
$healthOk = Test-Endpoint "$backendUrl/sinistres/health" "Service Sinistres Health"
$sinistresOk = Test-Endpoint "$backendUrl/sinistres" "API Sinistres (GET)"
$contractsOk = Test-Endpoint "$backendUrl/contracts" "API Contrats (GET)"
$authOk = Test-Endpoint "$backendUrl/auth/users" "Service Auth (peut échouer si pas de token)"

Write-Host ""
Write-Host "💾 TEST BASE DE DONNÉES" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

$dbOk = Test-PostgreSQL

Write-Host ""
Write-Host "📊 RÉSUMÉ" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

$totalTests = 0
$passedTests = 0

if ($healthOk) { $passedTests++ }; $totalTests++
if ($sinistresOk) { $passedTests++ }; $totalTests++
if ($contractsOk) { $passedTests++ }; $totalTests++
if ($dbOk) { $passedTests++ }; $totalTests++

Write-Host "Tests réussis: $passedTests / $totalTests" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })
Write-Host ""

# Diagnostics et recommandations
if (-not $healthOk -and -not $sinistresOk -and -not $contractsOk) {
    Write-Host "⚠️  DIAGNOSTIC: Backend non démarré ou inaccessible" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTIONS:" -ForegroundColor Cyan
    Write-Host "1. Démarrer Spring Boot:" -ForegroundColor White
    Write-Host "   cd chemin/vers/backend" -ForegroundColor Gray
    Write-Host "   mvn spring-boot:run" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Vérifier que le port 8080 est libre:" -ForegroundColor White
    Write-Host "   netstat -ano | findstr :8080" -ForegroundColor Gray
    Write-Host ""
}
elseif (-not $sinistresOk -or -not $contractsOk) {
    Write-Host "⚠️  DIAGNOSTIC: Erreurs 500 détectées" -ForegroundColor Red
    Write-Host ""
    Write-Host "CAUSES PROBABLES:" -ForegroundColor Cyan
    
    if (-not $sinistresOk) {
        Write-Host "• Table 'sinistres': Colonne 'contrat_id' manquante ou mal nommée" -ForegroundColor Yellow
    }
    
    if (-not $contractsOk) {
        Write-Host "• Table 'contrats': Valeurs invalides dans colonne 'type'" -ForegroundColor Yellow
        Write-Host "  (ex: 'string' au lieu de 'AUTO', 'HABITATION', etc.)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "SOLUTIONS:" -ForegroundColor Cyan
    Write-Host "1. Exécuter les scripts de correction SQL:" -ForegroundColor White
    Write-Host "   psql -U postgres -d $postgresDb -f FIX_DATABASE.sql" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. OU corriger manuellement dans pgAdmin/psql:" -ForegroundColor White
    Write-Host "   ALTER TABLE sinistres RENAME COLUMN contract_id TO contrat_id;" -ForegroundColor Gray
    Write-Host "   UPDATE contrats SET type = 'AUTO' WHERE type = 'string';" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Redémarrer Spring Boot après correction" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Voir FIX_ERREURS_500.md pour le guide complet" -ForegroundColor Cyan
}
else {
    Write-Host "✅ Tous les services fonctionnent correctement!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant:" -ForegroundColor Cyan
    Write-Host "• Accéder à l'application: http://localhost:4200" -ForegroundColor White
    Write-Host "• Vérifier le Health Check: http://localhost:4200/admin/health" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Diagnostic terminé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Demander si l'utilisateur veut voir les logs détaillés
Write-Host ""
$showLogs = Read-Host "Voulez-vous voir les logs détaillés du backend? (O/N)"

if ($showLogs -eq "O" -or $showLogs -eq "o") {
    Write-Host ""
    Write-Host "Tentative de récupération des logs..." -ForegroundColor Yellow
    
    # Chercher les fichiers de logs Spring Boot courants
    $logLocations = @(
        ".\logs\spring-boot.log",
        "..\backend\logs\spring-boot.log",
        ".\target\spring-boot.log"
    )
    
    $logFound = $false
    foreach ($logPath in $logLocations) {
        if (Test-Path $logPath) {
            Write-Host "Logs trouvés: $logPath" -ForegroundColor Green
            Get-Content $logPath -Tail 50
            $logFound = $true
            break
        }
    }
    
    if (-not $logFound) {
        Write-Host "Aucun fichier de logs trouvé automatiquement." -ForegroundColor Yellow
        Write-Host "Vérifiez manuellement dans le dossier backend/logs/" -ForegroundColor Gray
    }
}
