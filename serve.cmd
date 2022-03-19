@echo off
call build\scripts\prebuild
node src/serve.js %*
