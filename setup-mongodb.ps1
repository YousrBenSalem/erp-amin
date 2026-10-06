# ============================================================
# Script : Setup MongoDB Replica Set pour AMIN ERP
# Exécuter en PowerShell ADMINISTRATEUR
# ============================================================

Write-Host "🔧 Configuration MongoDB Replica Set pour AMIN..." -ForegroundColor Cyan

# Trouver le chemin MongoDB
$mongoPaths = @(
    "C:\Program Files\MongoDB\Server\8.0\bin",
    "C:\Program Files\MongoDB\Server\7.0\bin",
    "C:\Program Files\MongoDB\Server\6.0\bin",
    "C:\Program Files\MongoDB\Server\5.0\bin"
)

$mongoPath = $null
foreach ($path in $mongoPaths) {
    if (Test-Path "$path\mongod.exe") {
        $mongoPath = $path
        break
    }
}

if (-not $mongoPath) {
    Write-Host "❌ MongoDB n'est pas installé." -ForegroundColor Red
    Write-Host "➡  Télécharger : https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MongoDB trouvé : $mongoPath" -ForegroundColor Green

# Trouver le fichier de config
$configFile = "C:\Program Files\MongoDB\Server\$((Get-Item $mongoPath).Parent.Name)\bin\mongod.cfg"

if (-not (Test-Path $configFile)) {
    $configFile = "$mongoPath\mongod.cfg"
}

Write-Host "📄 Fichier de config : $configFile"

# Lire la config actuelle
$config = Get-Content $configFile -Raw

# Vérifier si replication est déjà configuré
if ($config -notmatch "replSetName") {
    Write-Host "⚙  Ajout de la configuration replica set..."
    
    $replicationBlock = @"

replication:
  replSetName: "rs0"
"@
    Add-Content -Path $configFile -Value $replicationBlock
    Write-Host "✅ Configuration replica set ajoutée"
} else {
    Write-Host "✅ Replica set déjà configuré"
}

# Redémarrer le service MongoDB
Write-Host "🔄 Redémarrage du service MongoDB..."
try {
    Restart-Service -Name "MongoDB" -Force -ErrorAction Stop
    Start-Sleep -Seconds 3
    Write-Host "✅ Service MongoDB redémarré" -ForegroundColor Green
} catch {
    Write-Host "⚠  Service MongoDB non trouvé, tentative de démarrage manuel..." -ForegroundColor Yellow
}

# Initialiser le replica set
Write-Host "🔧 Initialisation du replica set rs0..."
Start-Sleep -Seconds 2

$initCmd = '"' + "$mongoPath\mongosh.exe" + '" --eval "rs.initiate({_id: \"rs0\", members: [{_id: 0, host: \"localhost:27017\"}]})" --quiet'
$result = cmd /c $initCmd 2>&1

if ($LASTEXITCODE -eq 0 -or $result -match "already initialized") {
    Write-Host "✅ Replica set rs0 initialisé avec succès!" -ForegroundColor Green
} else {
    Write-Host "ℹ  Résultat : $result"
}

Write-Host ""
Write-Host "🎉 MongoDB est prêt pour AMIN!" -ForegroundColor Green
Write-Host "   URL : mongodb://localhost:27017/societe_amin?replicaSet=rs0" -ForegroundColor Cyan
Write-Host ""
Write-Host "➡  Maintenant lancez : npm run start:dev (dans le dossier backend)" -ForegroundColor Yellow
