proxy: default

default:
	-rm *utf8*
	for f in *.rundown.html; do bf=`echo $$f | sed 's/\.html//'`; iconv -f UTF-16LE -t UTF-8 $$f -o $$f.utf8; dos2unix $$f.utf8; awk -f awk.ENPSrundownhtml2json -v F=$$f $$f.utf8 > $$bf.json; done
	for f in *.rundown.json; do cat $$f; done
	-rm *utf8*
	php createInputFromRundownAndTranscript
