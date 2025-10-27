# NSC Mathematics Enrolment Plot

This folder contains rendered plots created by `scripts/plot_maths_enrolment.py`.

- Output files: `maths_enrolment_sa.png`, `maths_enrolment_sa.svg`
- Data: `data/maths_enrolment_sa.csv`

Notes
- Counts reflect the number of NSC candidates who wrote Mathematics in a given year (where available).
- 2024 row reflects registered candidates for Mathematics (not final wrote), used as a directional indicator only.

Sources (selection)
- DBE: School Subject Report (2012) — historical series including 2010–2012.
- DBE: Articles on Class of 2023; participation figures for 2021–2022.
- BusinessTech (summarising DBE reports): figures for 2015–2019 and 2023. 

To reproduce
```
make setup
make plot
```

