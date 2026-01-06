# Test Experiments API Endpoint
# This script will call the experiments API and show the response

param(
    [Parameter(Mandatory=$false)]
    [string]$AccessToken = "",
    [Parameter(Mandatory=$false)]
    [string]$CompanyId = "5dfb7ae7-41ad-4922-bdf2-952139c2d42c"
)

$baseUrl = "https://api-staging-ap-south-1.truegradient.ai"
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$url = "$baseUrl/experimentByCompany?companyID=$CompanyId&t=$timestamp&sendHash=true"

Write-Host ""
Write-Host "🧪 Testing Experiments API" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Gray
Write-Host "Company ID: $CompanyId" -ForegroundColor Yellow
Write-Host "Endpoint: $url" -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor Gray
Write-Host ""

if ([string]::IsNullOrWhiteSpace($AccessToken)) {
    Write-Host "❌ No access token provided!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To get your access token:" -ForegroundColor Yellow
    Write-Host "1. Look at your app logs for the line: ✅ accessToken obtained!" -ForegroundColor White
    Write-Host "2. Copy the token value (starts with eyJhbGciOiJ...)" -ForegroundColor White
    Write-Host "3. Run this script with the token:" -ForegroundColor White
    Write-Host "   .\test-experiments-endpoint.ps1 -AccessToken 'YOUR_TOKEN_HERE'" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $AccessToken"
    }
    
    Write-Host "📡 Making API Request..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri $url -Method GET -Headers $headers -UseBasicParsing
    
    Write-Host ""
    Write-Host "📊 Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Raw Response:" -ForegroundColor Cyan
    Write-Host $response.Content
    Write-Host ""
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "📊 Response Analysis:" -ForegroundColor Cyan
    Write-Host "  Type: $($data.GetType().Name)" -ForegroundColor White
    Write-Host "  Is Array: $($data -is [Array])" -ForegroundColor White
    
    if ($data -is [PSCustomObject]) {
        $properties = $data | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
        Write-Host "  Properties: $($properties -join ', ')" -ForegroundColor White
        
        if ($properties -contains 'experiments') {
            Write-Host "  Has 'experiments': YES" -ForegroundColor Green
            if ($data.experiments -is [Array]) {
                Write-Host "  experiments.length: $($data.experiments.Count)" -ForegroundColor Green
                if ($data.experiments.Count -gt 0) {
                    Write-Host ""
                    Write-Host "📋 First Experiment:" -ForegroundColor Cyan
                    $data.experiments[0] | ConvertTo-Json -Depth 3
                }
            }
        } else {
            Write-Host "  Has 'experiments': NO" -ForegroundColor Red
        }
        
        if ($properties -contains 'data') {
            Write-Host "  Has 'data': YES" -ForegroundColor Green
        }
    } elseif ($data -is [Array]) {
        Write-Host "  Array Length: $($data.Count)" -ForegroundColor Green
        if ($data.Count -gt 0) {
            Write-Host ""
            Write-Host "📋 First Item:" -ForegroundColor Cyan
            $data[0] | ConvertTo-Json -Depth 3
        }
    }
    
    Write-Host ""
    Write-Host "✅ Test Completed Successfully!" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host ""
            Write-Host "⚠️  Token might be expired or invalid" -ForegroundColor Yellow
            Write-Host "   Get a fresh token from your app logs" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    exit 1
}
