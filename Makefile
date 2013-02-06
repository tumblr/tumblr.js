test:
	npm test

coverage:
	jscoverage --no-highlight lib lib-cov
	- TUMBLR_COV=1 mocha -R html-cov > coverage.html
	rm -rf lib-cov

jslint:
	jsl -process lib/tumblr.js -process index.js

.PHONY: test
