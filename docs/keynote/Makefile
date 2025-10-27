PDF=saair-keynote.pdf
TEX=saair-keynote.tex

.PHONY: all clean

all: $(PDF)

$(PDF): $(TEX) sections/*.tex
	pdflatex -interaction=nonstopmode -halt-on-error $(TEX) >/dev/null
	# run twice for refs/toc
	pdflatex -interaction=nonstopmode -halt-on-error $(TEX) >/dev/null

clean:
	rm -f *.aux *.log *.out *.toc *.nav *.snm *.synctex.gz
