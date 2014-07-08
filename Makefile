ZIP_FILENAME = ../ubuku_crx.zip
INCLUDED_FILES = manifest.json chrome shared _locales COPYING.txt
EXCLUDED_FILES = _locales/backup*

.PHONY: zip
zip:
	rm -rf $(ZIP_FILENAME)
	zip -9 -r $(ZIP_FILENAME) $(INCLUDED_FILES) -x=$(EXCLUDED_FILES)
