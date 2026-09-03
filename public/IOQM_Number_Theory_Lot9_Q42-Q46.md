# ALLEN IOQM Number Theory Marathon 2026 — Lot 9

**Questions:** Q42–Q46  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A  
**Format:** Recovered question + verified answer + short solution + IOQM tip/trick

> ## Sequence / source note
>
> Direct on-screen numbering has been confirmed through Q31, and Q29–Q31 align with Practice Sheet questions 28–30. For this continuation, the numbering follows the same post-Q31 source sequence.
>
> Two source-sheet problems are skipped because they were already taught earlier in the video:
>
> - source Q36 = video Q22;
> - source Q38 = video Q23.
>
> Thus this batch preserves **video numbering Q32–Q51** without repeating those two already-covered problems.
>
> Q50 and Q51 continue with the next ALLEN Number Theory module problems after the practice-sheet block. Their original contest sources are independently identifiable.
>
> Mathematical answers are independently checked; where OCR damaged a statement, the correction is stated explicitly.

---

## Q42. Divisibility of \(25^n+9^n\) by \(13\)

### Question

Find the number of positive integers \(n<2018\) such that

\[
25^n+9^n
\]

is divisible by \(13\).

**Answer:** \(\boxed{336}\)

### Short solution

Modulo \(13\), \(25\equiv-1\). Also \(9^3\equiv1\pmod{13}\). Thus

\[
25^n+9^n\equiv(-1)^n+9^n\pmod{13}.
\]

We need \(n\) odd and \(3\mid n\), so

\[
n\equiv3\pmod6.
\]

The values are \(3,9,15,\dots,2013\), giving

\[
\frac{2013-3}{6}+1=\boxed{336}.
\]

### IOQM tip / trick

Reduce bases first. A large base like \(25\) may become \(-1\) modulo the target, after which parity and multiplicative order finish the problem.

### Verification status

**Fully verified.**

---

## Q43. Record values of the prime-factor count

### Question

For a positive integer \(n\), let \(f(n)\) be the number of prime factors of \(n\), counted with multiplicity. Let \(g(n)\) be the number of positive integers \(k\le n\) satisfying

\[
f(k)\ge f(j)
\]

for every \(j\le n\). Find

\[
g(1)+g(2)+\cdots+g(100).
\]

**Answer:** \(\boxed{136}\)

### Short solution

The record value of \(f(k)=\Omega(k)\) increases at powers of \(2\). Up to \(100\), the current record-holders by intervals are:

- \(1\);
- for \(2\le n\le3\), the primes;
- for \(4\le n\le7\): \(4,6\);
- for \(8\le n\le15\): \(8,12\);
- for \(16\le n\le31\): \(16,24\);
- for \(32\le n\le63\): \(32,48\);
- for \(64\le n\le100\): \(64,96\).

The contributions to the requested sum are

\[
1,3,6,12,24,48,42.
\]

Hence

\[
1+3+6+12+24+48+42=\boxed{136}.
\]

### IOQM tip / trick

To maximize the number of prime factors **with multiplicity** under a size bound, repeatedly use the smallest prime: \(2^r\). Powers of 2 mark the record thresholds.

### Verification status

**Fully verified.**

---

## Q44. Four smallest possible values of \(a_2\)

### Question

A sequence of positive integers \(a_1,a_2,\dots\) has

\[
\gcd(a_m,a_n)>1
\]

if and only if \(|m-n|=1\). Find the sum of the four smallest possible values of \(a_2\).

**Answer:** \(\boxed{42}\)

### Short solution

The term \(a_2\) must share a nontrivial factor with both \(a_1\) and \(a_3\), while \(\gcd(a_1,a_3)=1\). Thus \(a_2\) must have at least **two distinct prime factors**.

Conversely, any number with at least two distinct prime factors can be used as \(a_2\) by assigning different fresh primes to adjacent edges of the sequence.

The four smallest possibilities are

\[
6,10,12,14.
\]

Their sum is

\[
6+10+12+14=\boxed{42}.
\]

### IOQM tip / trick

Translate gcd conditions into a **graph of shared primes**. Here the sequence is a path; assign a fresh prime to each adjacent edge.

### Verification status

**Fully verified.**

---

## Q45. Four-digit cubes equal to the cube of their digit sum

### Question

Find the sum of all four-digit positive integers that are equal to the cube of the sum of their decimal digits.

**Answer:** \(\boxed{10745}\)

### Short solution

Let the digit sum be \(s\). The number is \(s^3\), so \(10\le s\le21\). Since a number is congruent to its digit sum modulo \(9\),

\[
s^3\equiv s\pmod9.
\]

Thus \(s(s-1)(s+1)\equiv0\pmod9\). In the range, the candidates are

\[
s=10,17,18,19.
\]

Checking cubes:

\[
17^3=4913\quad(\text{digit sum }17),
\]

\[
18^3=5832\quad(\text{digit sum }18),
\]

while \(10\) and \(19\) fail. Therefore

\[
4913+5832=\boxed{10745}.
\]

### IOQM tip / trick

Digit sums give congruences modulo \(9\). Apply \(s^3\equiv s\pmod9\) before checking candidates.

### Verification status

**Fully verified.**

---

## Q46. Universal divisor of \(n^5-5n^3+4n\)

### Question

Let \(S\) be the set of integers

\[
n^5-5n^3+4n
\]

where \(3\nmid n\). Find the largest positive integer dividing every element of \(S\).

**Answer:** \(\boxed{360}\)

### Short solution

Factor:

\[
n^5-5n^3+4n=(n-2)(n-1)n(n+1)(n+2).
\]

This is a product of five consecutive integers, hence divisible by \(5!=120\). If \(3\nmid n\), the five terms contain two multiples of \(3\), guaranteeing one extra factor of \(3\). Therefore every value is divisible by

\[
120\cdot3=360.
\]

For \(n=4\) and \(n=5\), the values are \(720\) and \(2520\), whose gcd is \(360\). Thus no larger universal divisor exists, and the answer is \(\boxed{360}\).

### IOQM tip / trick

Polynomial divisibility problems often hide products of consecutive integers. Factor first; once five consecutive integers appear, divisibility by \(5!\) is automatic.

### Verification status

**Fully verified.**

---

# Lot 9 answer key

| Q | Answer |
|---|---:|
| Q42 | \(336\) |
| Q43 | \(136\) |
| Q44 | \(42\) |
| Q45 | \(10745\) |
| Q46 | \(360\) |
