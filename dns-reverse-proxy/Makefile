TOP := $(dir $(lastword $(MAKEFILE_LIST)))
# node binary is renamed to nodejs on Debian
NODE = $(shell which nodejs || which node)

# locate rapydscript file
# pass NPM_PATH to make will override rapydscript bin path
RAPYDSCRIPT = rapydscript
NPM = $(shell which npm)
ifndef NPM_PATH
	NPM_PATH = $(shell ${NPM} bin)
endif

ifeq (,$(wildcard ${NPM_PATH}))
	NPM_PATH =
	RAPYDSCRIPT := $(shell which ${RAPYDSCRIPT})
else
	RAPYDSCRIPT := ${NPM_PATH}/${RAPYDSCRIPT}
endif

JS_TARGET = dns-proxy.js \
	    droxy.js \
	    reverse-sogou-proxy.js \
	    lutils.js \

all: $(JS_TARGET)

%.js: %.py
ifeq (, $(wildcard ${RAPYDSCRIPT}))
	$(error please install 'rapydscript' by `npm install rapydscript`)
endif
	${NODE} ${RAPYDSCRIPT} $< --screw-ie8 -p > $@

.PHONY: all

# vim:fileencoding=utf-8:sw=8:tabstop=8
