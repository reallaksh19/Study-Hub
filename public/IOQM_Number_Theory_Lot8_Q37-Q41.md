# ALLEN IOQM Number Theory Marathon 2026 — Lot 8

**Questions:** Q37–Q41  
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

## Q37. A nested digit-sum equation

### Question

For a nonnegative integer \(n\), let \(S(n)\) denote the sum of the decimal digits of \(n\). Let \(K\) be the number of nonnegative integers \(n\le10^{10}\) satisfying

\[
S(n)=\bigl(S(S(n))\bigr)^2.
\]

Find the remainder when \(K\) is divided by \(1000\).

**Answer:** \(\boxed{632}\)

### Short solution

Since \(n\le10^{10}\), we have \(S(n)\le90\). Let \(t=S(n)\). Then

\[
t=(S(t))^2.
\]

For \(0\le t\le90\), the only solutions are \(t=0,1,81\).

Digit sum \(0\): only \(n=0\), giving 1 case.

Digit sum \(1\): \(1,10,100,\dots,10^{10}\), giving 11 cases.

For digit sum \(81\), use ten digit positions and write each digit as \(9-y_i\). Then

\[
y_1+\cdots+y_{10}=9.
\]

By stars and bars, the count is

\[
\binom{18}{9}=48620.
\]

Thus

\[
K=1+11+48620=48632,
\]

so

\[
K\equiv\boxed{632}\pmod{1000}.
\]

### IOQM tip / trick

When a desired digit sum is close to the maximum, use **complementary digits**. Counting deficits from 9 can convert a bounded digit problem into stars and bars.

### Verification status

**Fully verified.**

---

## Q38. A universal gcd ratio

### Question

Find the largest positive integer \(N\) for which there exist positive integers \(x,y,z\) satisfying

\[
N\gcd(x,y,z)=\gcd(x+2y,\ y+2z,\ z+2x).
\]

**Answer:** \(\boxed{9}\)

### Short solution

Let \(d=\gcd(x,y,z)\), and write \(x=da,y=db,z=dc\) with \(\gcd(a,b,c)=1\). Then

\[
N=\gcd(a+2b,b+2c,c+2a).
\]

Let this gcd be \(g\). Integer linear combinations give

\[
g\mid9a,\qquad g\mid9b,\qquad g\mid9c.
\]

Because \(\gcd(a,b,c)=1\), we get \(g\mid9\), so \(N\le9\).

Equality is attainable with \((a,b,c)=(4,7,1)\), since the three linear forms are \(18,9,9\). Therefore \(\boxed{N=9}\).

### IOQM tip / trick

For a gcd of several linear forms, search for **integer linear combinations** that recover multiples of the original variables.

### Verification status

**Fully verified.**

---

## Q39. Ten pairwise-coprime terms in arithmetic progression

### Question

An arithmetic progression of exactly \(10\) positive integers has the property that every two terms are relatively prime. Find the smallest possible sum.

**Answer:** \(\boxed{1360}\)

### Short solution

Write the progression as

\[
a,a+d,\dots,a+9d.
\]

If \(2\nmid d\), at least two terms are even. Similarly, if \(3\nmid d\) or \(5\nmid d\), at least two terms are divisible by \(3\) or \(5\). Therefore

\[
30\mid d.
\]

So \(d\ge30\) and \(a\ge1\). The sum is at least

\[
10a+45d\ge10+45(30)=1360.
\]

This is attained by

\[
1,31,61,91,121,151,181,211,241,271,
\]

which are pairwise relatively prime. Hence \(\boxed{1360}\).

### IOQM tip / trick

In a long pairwise-coprime arithmetic progression, small primes force the common difference. This is a modular pigeonhole argument.

### Verification status

**Fully verified.**

---

## Q40. When is \(\operatorname{lcm}(n,9)\) a square?

### Question

How many positive integers \(n\le1000\) have \(\operatorname{lcm}(n,9)\) a perfect square?

**Answer:** \(\boxed{43}\)

### Short solution

Write

\[
n=3^a m,\qquad3\nmid m.
\]

Then

\[
\operatorname{lcm}(n,9)=3^{\max(a,2)}m.
\]

For this to be a square, \(m\) must be a square and \(\max(a,2)\) must be even. Thus \(n\) is either a square or \(n=3t^2\) with \(3\nmid t\).

There are \(\lfloor\sqrt{1000}\rfloor=31\) squares. For the second type, \(t\le18\), with the 6 multiples of 3 excluded, leaving 12. Total:

\[
31+12=\boxed{43}.
\]

### IOQM tip / trick

LCM-square questions are exponent-parity questions. Write prime exponents and demand that every exponent in the LCM be even.

### Verification status

**Fully verified.**

---

## Q41. When \(2n+3\) fails to divide \(2^{n!}-1\)

### Question

Compute the sum of all positive integers \(n\) such that \(50\le n\le100\) and

\[
2n+3\nmid2^{n!}-1.
\]

**Answer:** \(\boxed{222}\)

### Short solution

For this range, the exceptional case occurs when both \(n+1\) and \(2n+3\) are prime. If \(2n+3\) is prime and \(n+1\) is composite, then \(2(n+1)\mid n!\), so Fermat's theorem gives \(2^{n!}\equiv1\pmod{2n+3}\). Composite moduli in this range likewise have their relevant exponent absorbed by \(n!\).

Checking the range for which both \(n+1\) and \(2n+3\) are prime gives

\[
n=52,82,88.
\]

Therefore

\[
52+82+88=\boxed{222}.
\]

### IOQM tip / trick

With \(a^{n!}\pmod m\), ask whether the multiplicative order divides \(n!\). Factorials are designed to absorb many possible orders.

### Verification status

**Fully verified.**

---

# Lot 8 answer key

| Q | Answer |
|---|---:|
| Q37 | \(632\) |
| Q38 | \(9\) |
| Q39 | \(1360\) |
| Q40 | \(43\) |
| Q41 | \(222\) |
