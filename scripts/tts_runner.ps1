
Add-Type -AssemblyName System.Speech

$jobsPath = Join-Path $PSScriptRoot "tts_jobs.json"
$jobs = Get-Content -Raw $jobsPath -Encoding UTF8 | ConvertFrom-Json

$zira = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $zira.SelectVoice('Microsoft Zira Desktop') } catch {}
$zira.Rate = 1

$david = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $david.SelectVoice('Microsoft David Desktop') } catch {}
$david.Rate = 1

Write-Host "🎙️ Starting high-speed batch TTS synthesis of $($jobs.Count) voiceovers..."
$count = 0
$total = $jobs.Count

foreach ($item in $jobs) {
    $speaker = if ($item.voice -eq "david") { $david } else { $zira }
    $speaker.SetOutputToWaveFile($item.file)
    $speaker.Speak($item.text)
    $count++
    if ($count % 50 -eq 0 -or $count -eq $total) {
        Write-Host "[$count / $total] Synthesized $(Split-Path $item.file -Leaf)"
    }
}

$zira.Dispose()
$david.Dispose()
Write-Host "🎉 Successfully synthesized all $count voiceovers!"
