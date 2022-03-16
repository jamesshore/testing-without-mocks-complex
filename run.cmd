@echo off
call build\scripts\prebuild
node src/rot13-cli/run.js %*
