#!/usr/bin/env pwsh

param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [Parameter(Mandatory = $false)]
    [bool]$PushLatest
)

# Exit on any error
$ErrorActionPreference = "Stop"

$IMAGE = "ghcr.io/mckimcreed/pyramid-tools"

Write-Host "Building Docker image: ${IMAGE}:$Version"
docker build -t "${IMAGE}:$Version" .

if ($PushLatest) {
    Write-Host "Tagging image as latest"
    docker tag "${IMAGE}:$Version" "${IMAGE}:latest"
}
Write-Host "Pushing versioned image: ${IMAGE}:$Version"
docker push "${IMAGE}:$Version"

if ($PushLatest) {
    Write-Host "Pushing latest image: ${IMAGE}:latest"
    docker push "${IMAGE}:latest"
}

Write-Host "Successfully pushed both ${IMAGE}:$Version and ${IMAGE}:latest"
