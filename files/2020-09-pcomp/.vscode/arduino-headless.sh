#!/bin/bash

# https://github.com/arduino/Arduino/issues/1970#issuecomment-321975809

APP_ROOT=/Applications/Arduino.app
JVM_RUNTIME=$(/usr/libexec/java_home)

java \
    -cp "$APP_ROOT/Contents/Java/*" \
    -DAPP_DIR=$APP_ROOT/Contents/Java \
    -Djava.ext.dirs=$JVM_RUNTIME/Contents/Home/lib/ext/:$JVM_RUNTIME/Contents/Home/jre/lib/ext/ \
    -Dfile.encoding=UTF-8 \
    -Dapple.awt.UIElement=true \
    -Xms128M \
    -Xmx512M \
    processing.app.Base \
    "$@"
