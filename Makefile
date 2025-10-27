PY := python3

.PHONY: setup plot fmt

setup:
	$(PY) -m venv .venv && . .venv/bin/activate && pip install -U pip && pip install -r requirements.txt

plot:
	. .venv/bin/activate && $(PY) scripts/plot_maths_enrolment.py --csv data/maths_enrolment_sa.csv --outdir docs/plots

fmt:
	@echo "No formatter configured for this repo."

