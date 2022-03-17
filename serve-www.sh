#!/bin/sh

. build/scripts/prebuild.sh
node src/rot13-www/serve-www.js "$@"