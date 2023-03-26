@echo off
call build\scripts\prebuild
node build/scripts/self_check.js %*
