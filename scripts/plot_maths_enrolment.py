#!/usr/bin/env python3
"""
Time series plot: SA Matric candidates writing Mathematics (selected years).

Inputs
- CSV with columns: year, maths_wrote

Outputs
- docs/plots/maths_enrolment_sa.png (default)
- docs/plots/maths_enrolment_sa.svg

Usage
  python scripts/plot_maths_enrolment.py \
    --csv data/maths_enrolment_sa.csv \
    --outdir docs/plots
"""
from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd
import matplotlib as mpl
import matplotlib.pyplot as plt
import seaborn as sns


def thousands(x: float) -> str:
    return f"{int(round(x)):,}"


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Plot SA Mathematics enrolment (NSC wrote)")
    p.add_argument("--csv", default="data/maths_enrolment_sa.csv", help="Input CSV path")
    p.add_argument("--outdir", default="docs/plots", help="Output directory for images")
    p.add_argument("--width", type=int, default=1400, help="Figure width in px")
    p.add_argument("--height", type=int, default=800, help="Figure height in px")
    return p


def set_style():
    sns.set_theme(context="notebook", style="whitegrid")
    mpl.rcParams.update(
        {
            "figure.dpi": 150,
            "savefig.dpi": 300,
            "font.size": 12,
            "axes.titlesize": 18,
            "axes.labelsize": 13,
            "axes.titleweight": "bold",
            "axes.edgecolor": "#9aa0a6",
            "axes.grid": True,
            "grid.color": "#e5e7eb",
            "grid.linewidth": 1.0,
            "grid.alpha": 0.9,
            "xtick.color": "#4b5563",
            "ytick.color": "#4b5563",
            "axes.labelcolor": "#111827",
            "text.color": "#111827",
            "axes.facecolor": "#ffffff",
            "figure.facecolor": "#ffffff",
            "legend.frameon": False,
        }
    )


def main():
    args = build_parser().parse_args()
    set_style()

    csv_path = Path(args.csv)
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(csv_path)
    if "year" not in df or "maths_wrote" not in df:
        raise SystemExit("CSV must have columns: year, maths_wrote")

    df = df.copy()
    df["year"] = df["year"].astype(int)
    df = df.sort_values("year")

    # Plot
    px = args.width
    py = args.height
    fig_w = px / 96
    fig_h = py / 96

    fig, ax = plt.subplots(figsize=(fig_w, fig_h))

    color = "#2563eb"  # Tailwind blue-600
    sns.lineplot(
        data=df,
        x="year",
        y="maths_wrote",
        ax=ax,
        color=color,
        marker="o",
        markersize=7,
        linewidth=2.5,
    )

    # Annotate points with thousands separators
    for _, row in df.iterrows():
        ax.annotate(
            thousands(row["maths_wrote"]),
            (row["year"], row["maths_wrote"]),
            textcoords="offset points",
            xytext=(0, 8),
            ha="center",
            fontsize=10,
            color="#1f2937",
        )

    # Axis formatting
    ax.set_title(
        "South Africa NSC: Learners Writing Mathematics (selected years)",
        pad=16,
    )
    ax.set_xlabel("Year")
    ax.set_ylabel("Learners who wrote Mathematics")

    # y ticks as thousands with light padding
    ax.yaxis.set_major_formatter(mpl.ticker.FuncFormatter(lambda x, _: thousands(x)))

    # Minor aesthetics
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    # Caption / footnote
    caption = (
        "Notes: Counts reflect number of NSC candidates who 'wrote' Mathematics. "
        "Sources: DBE School Subject Reports and DBE articles; 2024 reflects registrations, not final wrote."
    )
    fig.text(0.5, 0.01, caption, ha="center", va="bottom", fontsize=10, color="#6b7280")

    png_path = outdir / "maths_enrolment_sa.png"
    svg_path = outdir / "maths_enrolment_sa.svg"

    fig.tight_layout(rect=(0, 0.03, 1, 1))
    fig.savefig(png_path)
    fig.savefig(svg_path)
    print(f"Saved: {png_path}")
    print(f"Saved: {svg_path}")


if __name__ == "__main__":
    main()

