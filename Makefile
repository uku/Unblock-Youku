CRX_FILES = manifest.json chrome shared _locales COPYING.txt README.md
ZIP_FILENAME = crx.zip

.PHONY: zip
zip:
	zip -r $(ZIP_FILENAME) $(CRX_FILES)
