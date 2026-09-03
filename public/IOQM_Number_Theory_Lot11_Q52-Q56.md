# ALLEN IOQM Number Theory Marathon 2026 — Lot 11

**Questions:** Q52–Q56  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A  
**Format:** Recovered question + verified answer + short solution + reusable IOQM tip/trick

> ## Sequence note
>
> The previously verified mapping gives video Q51 = ALLEN module Q52.
> Therefore this lot follows:
>
> \[
> \text{video Q52–Q56} \longleftrightarrow \text{module Q53–Q57}.
> \]
>
> Each problem below has been independently checked, and several are identifiable as published AMC/AIME problems.

---

## Q52. Smallest \(k\) for which a sum of squares is divisible by \(200\)

### Question

It is known that

\[
1^2+2^2+\cdots+k^2=\frac{k(k+1)(2k+1)}6.
\]

Find the smallest positive integer \(k\) such that the sum is a multiple of \(200\).

**Answer:** \(\boxed{112}\)

### Short solution

We need

\[
200\mid\frac{k(k+1)(2k+1)}6,
\]

so

\[
1200=2^4\cdot3\cdot5^2
\]

must divide \(k(k+1)(2k+1)\). The factor \(3\) is automatic. For \(25\), one of \(k,k+1,2k+1\) must be divisible by \(25\), so

\[
k\equiv0,24,12\pmod{25}.
\]

Below \(112\), the candidates are

\[
12,24,25,37,49,50,62,74,75,87,99,100.
\]

For all of them the product has fewer than four factors of \(2\). At \(k=112\), \(2k+1=225\) and \(112\cdot113\cdot225\) has the required divisibility. Hence \(\boxed{112}\).

### IOQM tip / trick

Move the denominator into the divisibility target first, factor the target into prime powers, and solve the prime-power conditions separately.

### Verification status

**Fully verified.**

---

## Q53. Number of powers of \(2\) in a quotient

**Original source identified:** 2020 AMC 12A, Problem 19

### Question

There is a unique strictly increasing sequence of nonnegative integers

\[
a_1<a_2<\cdots<a_k
\]

such that

\[
\frac{2^{289}+1}{2^{17}+1}=2^{a_1}+\cdots+2^{a_k}.
\]

Find \(k\).

**Answer:** \(\boxed{137}\)

### Short solution

Set \(x=2^{17}\). Then

\[
\frac{x^{17}+1}{x+1}=x^{16}-x^{15}+\cdots-x+1.
\]

Pair terms:

\[
x^{2j}-x^{2j-1}=2^{34j-17}(2^{17}-1).
\]

Since

\[
2^{17}-1=1+2+\cdots+2^{16},
\]

each pair contributes \(17\) distinct powers of \(2\). There are \(8\) pairs plus the final \(1\), so

\[
k=8\cdot17+1=\boxed{137}.
\]

### IOQM tip / trick

Group alternating powers in pairs and use \(2^m-1=1+2+\cdots+2^{m-1}\) to turn subtraction into a binary expansion.

### Verification status

**Fully verified.**

---

## Q54. Perfect squares ending in \(256\)

**Original source identified:** 2012 AIME I, Problem 10

### Question

Let \(S\) be the set of perfect squares whose rightmost three decimal digits are \(256\). For each \(N\in S\), delete the final three digits and call the remaining integer \(T\). Find the remainder when the tenth smallest such \(T\) is divided by \(1000\).

**Answer:** \(\boxed{170}\)

### Short solution

Solve

\[
x^2\equiv256\pmod{1000}.
\]

The roots are

\[
x\equiv16,484\pmod{500}.
\]

Thus the positive roots in order are

\[
16,484,516,984,1016,1484,1516,1984,2016,2484,\dots
\]

The tenth uses \(x=2484\), and

\[
2484^2=6,170,256.
\]

So \(T=6170\), hence the requested remainder is \(\boxed{170}\).

### IOQM tip / trick

Prescribed final digits of a square are congruence problems. Solve modulo powers of \(2\) and \(5\), then combine with CRT.

### Verification status

**Fully verified.**

---

## Q55. Last two nonzero digits of \(90!\)

**Original source identified:** 2010 AMC 10A, Problem 24

### Question

What are the last two nonzero digits of \(90!\)?

**Answer:** \(\boxed{12}\)

### Short solution

The number of trailing zeros is

\[
v_5(90!)=18+3=21.
\]

Let \(R=90!/10^{21}\). Then \(R\equiv0\pmod4\). Modulo \(25\), remove all factors of \(5\) from \(90!\); the remaining product is \(24\pmod{25}\). Hence

\[
R\equiv24\cdot2^{-21}\equiv12\pmod{25}.
\]

The unique residue modulo \(100\) with

\[
R\equiv0\pmod4,\qquad R\equiv12\pmod{25}
\]

is \(\boxed{12}\).

### IOQM tip / trick

For last nonzero digits of a factorial: count trailing zeros, remove matching factors of \(2\) and \(5\), then use CRT modulo \(4\) and \(25\) for the last two digits.

### Verification status

**Fully verified.**

---

## Q56. Two numerals in different bases

**Original source identified:** 2021 AMC 10B, Problem 13

### Question

Let \(n\) be a positive integer and \(d\) a digit such that

\[
(32d)_n=263
\]

and

\[
(324)_n=(11d1)_6.
\]

Find \(n+d\).

**Answer:** \(\boxed{11}\)

### Short solution

The equations are

\[
3n^2+2n+d=263
\]

and

\[
3n^2+2n+4=253+6d.
\]

Using the first in the second gives \(267-d=253+6d\), so \(d=2\). Then

\[
3n^2+2n=261,
\]

which gives \(n=9\). Therefore

\[
n+d=\boxed{11}.
\]

### IOQM tip / trick

Convert every base numeral immediately. If two equations contain the same polynomial in the base, subtract them before solving anything else.

### Verification status

**Fully verified.**

---

# Lot 11 answer key

| Question | Answer |
|---|---:|
| Q52 | \(112\) |
| Q53 | \(137\) |
| Q54 | \(170\) |
| Q55 | \(12\) |
| Q56 | \(11\) |
