@echo off
echo Starting MinIO server locally...
echo.
echo MinIO will be available at: http://localhost:9000
echo Console UI: http://localhost:9001
echo.
echo Default credentials:
echo Access Key: minioadmin
echo Secret Key: minioadmin
echo.
echo Press Ctrl+C to stop the server
echo.

REM Download MinIO if not exists
if not exist "minio.exe" (
    echo Downloading MinIO...
    powershell -Command "Invoke-WebRequest -Uri 'https://dl.min.io/server/minio/release/windows-amd64/minio.exe' -OutFile 'minio.exe'"
)

REM Start MinIO server
minio.exe server .\minio-data --console-address ":9001"
