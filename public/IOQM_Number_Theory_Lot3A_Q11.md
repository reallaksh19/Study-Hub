# ALLEN IOQM Number Theory Marathon 2026 — Lot 3A

**Question:** Q11  
**Source video:** [Number Theory for IOQM | Live Marathon | ALLEN](https://www.youtube.com/live/0j8W6Q8lD8A)  
**Original problem source identified:** 2021 AMC 12A, Problem 5

> This question can be reconstructed exactly because the lecture statement matches the published AMC problem.

---

## Q11. Repeating decimal misread as a terminating decimal

When a student multiplied the number \(66\) by the repeating decimal

\[
1.\overline{ab}=1.abab\ldots,
\]

where \(a\) and \(b\) are digits, he did not notice the bar notation and instead multiplied \(66\) by the terminating decimal

\[
1.ab.
\]

His incorrect answer was \(0.5\) less than the correct answer.

Find the two-digit integer \(\overline{ab}\).

**Answer:** \(\boxed{75}\)

### Short solution

Let

\[
N=10a+b.
\]

Then

\[
1.\overline{ab}=1+\frac{N}{99},
\]

while the incorrectly read terminating decimal is

\[
1.ab=1+\frac{N}{100}.
\]

The difference between the correct and incorrect products is therefore

\[
66\left(\frac{N}{99}-\frac{N}{100}\right)=0.5.
\]

Now

\[
\frac{1}{99}-\frac{1}{100}
=
\frac{1}{9900},
\]

so

\[
66\cdot\frac{N}{9900}
=
\frac{N}{150}
=
\frac12.
\]

Hence

\[
N=75.
\]

Therefore,

\[
\boxed{\overline{ab}=75}.
\]

---

## IOQM tip / trick

For a two-digit repeating block \(N\),

\[
0.\overline{N}=\frac{N}{99},
\]

whereas the corresponding two-digit terminating decimal is

\[
0.N=\frac{N}{100}.
\]

So their difference is immediately

\[
\frac{N}{99}-\frac{N}{100}
=
\frac{N}{9900}.
\]

This avoids separately converting the entire mixed decimals.

### General pattern

For a \(k\)-digit block \(N\),

\[
0.\overline{N}=\frac{N}{10^k-1}.
\]

This is one of the fastest recurring-decimal identities to recognize in olympiad number theory.

---

## Answer key

| Question | Answer |
|---|---:|
| Q11 | \(75\) |

---

## Accuracy note

Q11 is not merely transcript-reconstructed: its wording is identifiable as **2021 AMC 12A Problem 5**, so the statement and answer are independently verifiable.
