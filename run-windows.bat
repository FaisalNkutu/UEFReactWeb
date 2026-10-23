@echo off
cd /d "%~dp0"
call mvn compile exec:java
if errorlevel 1 pause
