@echo off
echo Starting local web server on port 8080...
start http://localhost:8080/New.html
python -m http.server 8080
pause
