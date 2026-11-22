param(
    [ValidateRange(1, 100)]
    [int]$MaxFileSizeMB = 10,
    [ValidateRange(1, 20)]
    [int]$ArchiveCount = 5,
    [string[]]$Service
)

$ErrorActionPreference = 'Stop'
$logsDirectory = Join-Path $PSScriptRoot 'logs'
$logPath = Join-Path $logsDirectory 'runtime.log'
$maximumBytes = $MaxFileSizeMB * 1MB

New-Item -ItemType Directory -Path $logsDirectory -Force | Out-Null

function Open-LogWriter([string]$Path, [bool]$Append) {
    $writer = [System.IO.StreamWriter]::new($Path, $Append, [System.Text.UTF8Encoding]::new($false))
    $writer.AutoFlush = $true
    return $writer
}

function Rotate-LogFile {
    if ($script:writer) {
        $script:writer.Dispose()
        $script:writer = $null
    }

    for ($index = $ArchiveCount - 1; $index -ge 1; $index--) {
        $source = "$logPath.$index"
        $target = "$logPath.$($index + 1)"
        if (Test-Path -LiteralPath $source) {
            if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target -Force }
            Move-Item -LiteralPath $source -Destination $target
        }
    }

    if (Test-Path -LiteralPath $logPath) {
        $firstArchive = "$logPath.1"
        if (Test-Path -LiteralPath $firstArchive) { Remove-Item -LiteralPath $firstArchive -Force }
        Move-Item -LiteralPath $logPath -Destination $firstArchive
    }

    $script:writer = Open-LogWriter -Path $logPath -Append $false
}

$script:writer = Open-LogWriter -Path $logPath -Append $true
$composeArgs = @('compose', 'logs', '--follow', '--timestamps', '--no-color')
if ($Service -and $Service.Count -gt 0) { $composeArgs += $Service }

Write-Host "Mostrando logs de Docker y guardándolos en $logPath (Ctrl+C para terminar)." -ForegroundColor DarkCyan
try {
    & docker @composeArgs 2>&1 | ForEach-Object {
        $line = [string]$_
        [Console]::WriteLine($line)
        $script:writer.WriteLine($line)
        if ($script:writer.BaseStream.Length -ge $maximumBytes) { Rotate-LogFile }
    }
} finally {
    if ($script:writer) {
        $script:writer.Flush()
        $script:writer.Dispose()
        $script:writer = $null
    }
}
