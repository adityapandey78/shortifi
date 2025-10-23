I n# PowerShell Script to Set All Vercel Environment Variables
# Run this from the project root: .\set-vercel-env.ps1

Write-Host "🚀 Setting up Vercel Environment Variables for Production" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is installed
try {
    $null = Get-Command vercel -ErrorAction Stop
} catch {
    Write-Host "❌ Vercel CLI not found. Install it with: npm i -g vercel" -ForegroundColor Red
    exit 1
}

Write-Host "⚠️  IMPORTANT: Make sure you have your Supabase POOLER URL ready!" -ForegroundColor Yellow
Write-Host "   Get it from: Supabase Dashboard → Settings → Database → Connection Pooling (Transaction mode, port 6543)" -ForegroundColor Yellow
Write-Host ""

# Prompt for critical DATABASE_URL
Write-Host "📋 Enter your Supabase Connection Pooler URL (port 6543):" -ForegroundColor Green
Write-Host "   Example: postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -ForegroundColor Gray
$DATABASE_URL = Read-Host "DATABASE_URL"

if ([string]::IsNullOrWhiteSpace($DATABASE_URL)) {
    Write-Host "❌ DATABASE_URL is required!" -ForegroundColor Red
    exit 1
}

# Check if it's the pooler URL (port 6543)
if ($DATABASE_URL -notmatch ":6543/") {
    Write-Host "⚠️  WARNING: Your URL doesn't contain ':6543' - make sure you're using the POOLER URL, not direct connection!" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y") {
        exit 0
    }
}

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Cyan

# Array of environment variables to set
$envVars = @(
    @{Name="DATABASE_URL"; Value=$DATABASE_URL; Required=$true},
    @{Name="FRONTEND_URL"; Value="https://shortifi-sand.vercel.app"; Required=$true},
    @{Name="NODE_ENV"; Value="production"; Required=$true},
    @{Name="JWT_SECRET"; Value="flGu8NqvaHGVJ8X9Nsx9zDxk3a/EaRupCOXv4ATW16YU1/xqhiSRVXz/1L1br3MSHLvY0o30VXN2r9ryvni2cw=="; Required=$true},
    @{Name="SMTP_HOST"; Value="smtp.gmail.com"; Required=$false},
    @{Name="SMTP_PORT"; Value="465"; Required=$false},
    @{Name="SMTP_USER"; Value="pandeyernest@gmail.com"; Required=$false},
    @{Name="SMTP_PASS"; Value="qduvvudiphbmztox"; Required=$false},
    @{Name="FROM_NAME"; Value="URL_Shortener"; Required=$false},
    @{Name="GOOGLE_CLIENT_ID"; Value="1000834607535-btcbq5epaf3l9rpprjgj9htpjgqiki8c.apps.googleusercontent.com"; Required=$false},
    @{Name="GOOGLE_CLIENT_SECRET"; Value="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"; Required=$false}
)

# Set each environment variable
foreach ($var in $envVars) {
    Write-Host "  Setting $($var.Name)..." -ForegroundColor Gray
    
    # Use echo to pipe the value to vercel env add
    echo $var.Value | vercel env add $var.Name production --force 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $($var.Name) set successfully" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Failed to set $($var.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Environment variables configured!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Update Google OAuth callback URL:" -ForegroundColor White
Write-Host "     → https://console.cloud.google.com/apis/credentials" -ForegroundColor Gray
Write-Host "     → Add: https://shortifi-sand.vercel.app/google/callback" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Redeploy to Vercel:" -ForegroundColor White
Write-Host "     → vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Test your deployment:" -ForegroundColor White
Write-Host "     → https://shortifi-sand.vercel.app" -ForegroundColor Gray
Write-Host ""
