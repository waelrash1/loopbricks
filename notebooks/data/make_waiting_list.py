"""Make waiting_list.csv, the book's running case: a synthetic outpatient waiting list for one hospital group.

The series is invented. It is shaped like published Irish waiting-list data (monthly counts by time waited, no
additions or removals reported), so readers practise on the same problem: the flows must be inferred from the
stock. Run `python3 make_waiting_list.py` in this folder to rebuild it; the seed makes it identical every time.
ponytail: synthetic until the NTPF reuse licence is confirmed; swap in the real series with the same columns.
"""
import numpy as np
import pandas as pd

rng = np.random.default_rng(2014)
months = pd.period_range("2014-01", "2023-12", freq="M")
bands = [3.0, 3.0, 6.0]                      # months spent in each band before ageing into the next
w = np.array([8800.0, 6600.0, 8200.0, 9000.0])  # 0-3, 3-6, 6-12, 12+ months waited
rows = []
for i, m in enumerate(months):
    t = i / 12                                # years since January 2014
    referrals = 4000 * 1.03 ** t * (1 + 0.04 * np.sin(2 * np.pi * (m.month - 3) / 12))
    capacity = 3950 * 1.02 ** t
    if m >= pd.Period("2020-03", "M"):        # a shock: activity collapses, then recovers
        capacity *= min(1.0, 0.35 + 0.65 * min(1.0, (m - pd.Period("2020-03", "M")).n / 9))
    if m >= pd.Period("2022-01", "M"):        # a waiting-list initiative buys extra activity
        capacity *= 1.10
    referrals *= rng.lognormal(0, 0.03)
    capacity *= rng.lognormal(0, 0.03)
    treated = min(capacity, w.sum() / 1.0)    # never more than the whole list in a month
    share = w * np.array([1.4, 1.0, 0.9, 0.8]) # the shorter waits are seen a little more often (urgent cases)
    out = treated * share / share.sum()
    age = np.append(w[:3] / bands, 0)
    w = w + np.array([referrals, 0, 0, 0]) - out - age + np.insert(age[:3], 0, 0)
    rows.append([str(m), *np.round(w).astype(int)])

df = pd.DataFrame(rows, columns=["month", "w0_3", "w3_6", "w6_12", "w12_plus"])
df.insert(1, "total", df[["w0_3", "w3_6", "w6_12", "w12_plus"]].sum(axis=1))
df.to_csv("waiting_list.csv", index=False)
print(df.iloc[[0, 23, 47, 71, 74, 80, 95, 107, 119]].to_string(index=False))
