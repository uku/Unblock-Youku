ZIP_FILENAME = unblock_youku_crx.zip
INCLUDED_FILES = manifest.json chrome shared _locales COPYING.txt
EXCLUDED_FILES = _locales/backup*

GREP_RESULT = $(shell grep --quiet "127\.0\.0\.1" chrome/config.js; echo $$?)

.PHONY: zip
zip:
ifeq ($(GREP_RESULT), 0)
	@echo "Remove 127.0.0.1 from chrome/config.js and try again"
else
	rm -rf $(ZIP_FILENAME)
	zip -9 -r $(ZIP_FILENAME) $(INCLUDED_FILES) -x=$(EXCLUDED_FILES)
endif
