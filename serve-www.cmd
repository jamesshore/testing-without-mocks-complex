@echo off
call build\scripts\prebuild
node src/rot13-www/serve-www.js %*
