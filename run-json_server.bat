@echo off
cd /d "%~dp0bbdd"
json-server --watch -p 3000 db.json
