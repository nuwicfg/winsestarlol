@echo off
set /p msg="Commit mesajini gir (ornegin 'Guncelleme'): "
git add .
git commit -m "%msg%"
git push origin main
echo Bitti! Cloudflare Pages su an otomatik olarak deploy ediyor...
pause
