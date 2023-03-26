#!/bin/sh

. build/scripts/prebuild.sh
node build/scripts/self_check.js "$@"
