@echo off
call build\scripts\prebuild
node src/rot13-service/serve.js %*
