#!/usr/bin/env bash
ctags --exclude=.git --exclude=node_modules --exclude=dist -R ./*
exit $?

