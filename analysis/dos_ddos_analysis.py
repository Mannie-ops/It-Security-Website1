"""Educational CIC-IDS2017 DoS/DDoS analysis.

Run from the project folder:
  python -m pip install -r analysis/requirements.txt
  python analysis/dos_ddos_analysis.py --csv-dir /path/to/CICIDS2017/CSVs

The script reads CSV files in the supplied folder, keeps BENIGN and DoS/DDoS
labels, samples a balanced working set, trains a Random Forest, and saves
plots/metrics under assets/assignment7/results/. It does not generate traffic
or interact with any live website/network.
"""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (classification_report, ConfusionMatrixDisplay,
                             confusion_matrix, precision_recall_fscore_support,
                             accuracy_score)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

DOS_LABELS = {
    "dos hulk", "dos goldeneye", "dos slowloris", "dos slowhttptest", "ddos"
}


def normalize_label(value: object) -> str:
    return re.sub(r"\s+", " ", str(value).strip().lower())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv-dir", required=True, help="Folder containing CIC-IDS2017 labeled CSV files")
    parser.add_argument("--sample-per-class", type=int, default=50000,
                        help="Maximum sampled records per class (default: 50000)")
    parser.add_argument("--random-state", type=int, default=42)
    args = parser.parse_args()

    csv_files = sorted(Path(args.csv_dir).glob("*.csv"))
    if not csv_files:
        raise SystemExit(f"No CSV files found in: {args.csv_dir}")

    frames = []
    for file in csv_files:
        print(f"Reading {file.name} ...")
        try:
            frame = pd.read_csv(file, low_memory=False, encoding_errors="replace")
        except TypeError:  # compatibility with older pandas
            frame = pd.read_csv(file, low_memory=False)
        frame.columns = [str(c).strip() for c in frame.columns]
        label_col = next((c for c in frame.columns if c.lower() == "label"), None)
        if label_col is None:
            print(f"  Skipping {file.name}: no Label column")
            continue
        frame["__label_norm"] = frame[label_col].map(normalize_label)
        keep = frame["__label_norm"].eq("benign") | frame["__label_norm"].isin(DOS_LABELS)
        selected = frame.loc[keep].copy()
        if not selected.empty:
            frames.append(selected)

    if not frames:
        raise SystemExit("No BENIGN or DoS/DDoS labeled rows found in the supplied CSV files.")

    data = pd.concat(frames, ignore_index=True)
    data["TrafficClass"] = np.where(data["__label_norm"].eq("benign"), "BENIGN", "DOS_DDOS")
    before = len(data)
    data = data.replace([np.inf, -np.inf], np.nan)
    data = data.drop_duplicates()
    # Drop rows missing all useful feature values after conversion below.
    excluded = {"__label_norm", "TrafficClass"}
    excluded.update(c for c in data.columns if c.lower() in {
        "label", "flow id", "source ip", "destination ip", "timestamp"
    })
    feature_cols = [c for c in data.columns if c not in excluded]
    X_all = data[feature_cols].apply(pd.to_numeric, errors="coerce")
    usable = X_all.notna().any(axis=1)
    data = data.loc[usable].copy()
    X_all = X_all.loc[usable]

    sampled_parts = []
    for label, group in data.groupby("TrafficClass"):
        n = min(args.sample_per_class, len(group))
        sampled_parts.append(group.sample(n=n, random_state=args.random_state))
    sample = pd.concat(sampled_parts, ignore_index=True).sample(frac=1, random_state=args.random_state)
    X = sample[feature_cols].apply(pd.to_numeric, errors="coerce")
    y = sample["TrafficClass"]
    valid_features = [c for c in X.columns if X[c].notna().any()]
    X = X[valid_features]
    if y.nunique() < 2:
        raise SystemExit("The supplied CSVs must contain both BENIGN and DoS/DDoS records.")

    output = Path(__file__).resolve().parents[1] / "assets" / "assignment7" / "results"
    output.mkdir(parents=True, exist_ok=True)

    # Plot actual sampled class counts.
    counts = y.value_counts().reindex(["BENIGN", "DOS_DDOS"], fill_value=0)
    ax = counts.plot(kind="bar", figsize=(7, 4), rot=0)
    ax.set_title("CIC-IDS2017 sampled traffic classes")
    ax.set_xlabel("Traffic class")
    ax.set_ylabel("Number of flows")
    plt.tight_layout()
    plt.savefig(output / "traffic_class_counts.png", dpi=160)
    plt.close()

    # Actual packet/byte-rate distributions (log scale; extreme values clipped for readability).
    rate_col = next((c for c in X.columns if c.lower() == "flow packets/s"), None)
    if rate_col:
        plot_data = sample[["TrafficClass"]].copy()
        plot_data[rate_col] = pd.to_numeric(sample[rate_col], errors="coerce")
        plot_data[rate_col] = plot_data[rate_col].replace([np.inf, -np.inf], np.nan).dropna()
        plot_data = plot_data.dropna()
        plot_data[rate_col] = plot_data[rate_col].clip(lower=0)
        groups = [np.log10(plot_data.loc[plot_data.TrafficClass == cls, rate_col] + 1)
                  for cls in ["BENIGN", "DOS_DDOS"]]
        plt.figure(figsize=(7, 4))
        plt.boxplot(groups, tick_labels=["BENIGN", "DOS/DDoS"], showfliers=False)
        plt.ylabel("log10(Flow Packets/s + 1)")
        plt.title("Packet-rate distribution by traffic class")
        plt.tight_layout()
        plt.savefig(output / "packet_rate_comparison.png", dpi=160)
        plt.close()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=args.random_state, stratify=y
    )
    model = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("classifier", RandomForestClassifier(
            n_estimators=250, class_weight="balanced", random_state=args.random_state,
            n_jobs=-1, min_samples_leaf=2
        )),
    ])
    model.fit(X_train, y_train)
    predicted = model.predict(X_test)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, predicted, labels=["BENIGN", "DOS_DDOS"], average="binary", pos_label="DOS_DDOS", zero_division=0
    )
    cm = confusion_matrix(y_test, predicted, labels=["BENIGN", "DOS_DDOS"])
    ConfusionMatrixDisplay(cm, display_labels=["BENIGN", "DOS/DDoS"]).plot(cmap="Greens", values_format="d")
    plt.title("Random Forest confusion matrix")
    plt.tight_layout()
    plt.savefig(output / "confusion_matrix.png", dpi=160)
    plt.close()

    report = classification_report(y_test, predicted, output_dict=True, zero_division=0)
    metrics = {
        "source_files": [p.name for p in csv_files],
        "rows_before_deduplication": int(before),
        "rows_after_cleaning_before_sampling": int(len(data)),
        "sampled_rows": int(len(sample)),
        "class_counts": {k: int(v) for k, v in counts.items()},
        "features_used": valid_features,
        "test_accuracy": float(accuracy_score(y_test, predicted)),
        "dos_ddos_precision": float(precision),
        "dos_ddos_recall": float(recall),
        "dos_ddos_f1": float(f1),
        "confusion_matrix_labels": ["BENIGN", "DOS_DDOS"],
        "confusion_matrix": cm.tolist(),
        "classification_report": report,
        "caution": "Random stratified split is an initial benchmark; use a time/day-based holdout for stronger generalization testing."
    }
    (output / "metrics.json").write_text(json.dumps(metrics, indent=2))
    print(json.dumps({k: metrics[k] for k in ["sampled_rows", "class_counts", "test_accuracy", "dos_ddos_precision", "dos_ddos_recall", "dos_ddos_f1", "confusion_matrix"]}, indent=2))
    print(f"\nSaved results to: {output}")


if __name__ == "__main__":
    main()
