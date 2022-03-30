@echo off
call build\scripts\prebuild
node build/scripts/serve_dev.js %*
