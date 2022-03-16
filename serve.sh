#!/bin/sh

. build/scripts/prebuild.sh
node src/rot13-service/serve.js $*