# ALLEN IOQM Number Theory Marathon 2026 — Lot 10

**Questions:** Q47–Q51  
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

## Q47. Three floor terms modulo \(3\)

### Question

For how many positive integers \(n\le1000\) is

\[
\left\lfloor\frac{998}{n}\right\rfloor+
\left\lfloor\frac{999}{n}\right\rfloor+
\left\lfloor\frac{1000}{n}\right\rfloor
\]

not divisible by \(3\)?

**Answer:** \(\boxed{22}\)

### Short solution

Let \(q=\lfloor999/n\rfloor\). Then \(\lfloor998/n\rfloor=q-1\) exactly when \(n\mid999\), otherwise it equals \(q\). Similarly, \(\lfloor1000/n\rfloor=q+1\) exactly when \(n\mid1000\), otherwise it equals \(q\).

Except for \(n=1\), where both corrections occur and cancel, the sum is nonzero modulo \(3\) exactly when \(n\) divides one of \(999\) or \(1000\).

Now

\[
999=3^3\cdot37,\qquad \tau(999)=8,
\]

and

\[
1000=2^35^3,\qquad \tau(1000)=16.
\]

Their only common positive divisor is \(1\). The union has \(8+16-1=23\) divisors; removing \(n=1\) gives \(\boxed{22}\).

### IOQM tip / trick

For sums of nearby floor functions, compare everything with the middle term. Changes by one occur exactly at divisibility boundaries.

### Verification status

**Fully verified.**

---

## Q48. A recurrence modulo \(99\)

**Original source identified:** 2017 AIME I, Problem 9

### Corrected question

Let \(a_{10}=10\), and for \(n>10\), let

\[
a_n=100a_{n-1}+n.
\]

Find the least \(n>10\) such that \(a_n\) is a multiple of \(99\).

**Answer:** \(\boxed{45}\)

> **Source correction:** one OCR copy renders the modulus as \(90\). The original 2017 AIME I problem is **99**, and the listed answer \(45\) is consistent with \(99\), not \(90\).

### Short solution

Modulo \(99\), \(100\equiv1\), so

\[
a_n\equiv a_{n-1}+n\pmod{99}.
\]

Iterating gives

\[
a_n\equiv10+11+\cdots+n=\frac{(n+10)(n-9)}2\pmod{99}.
\]

We need

\[
99\mid\frac{(n+10)(n-9)}2,
\]

equivalently

\[
198\mid(n+10)(n-9).
\]

The first solution with \(n>10\) is \(n=45\). Indeed,

\[
\frac{55\cdot36}{2}=990,
\]

which is divisible by \(99\). Hence \(\boxed{45}\).

### IOQM tip / trick

If a recurrence has coefficient \(c\equiv1\pmod m\), reduce modulo \(m\) first; the recurrence may collapse to a simple sum.

### Verification status

**Fully verified after correcting the OCR modulus from \(90\) to \(99\).**

---

## Q49. A double-factorial sum

**Original source identified:** 2009 AIME II, Problem 7

### Question

When

\[
\sum_{i=1}^{2009}\frac{(2i-1)!!}{(2i)!!}
\]

is written in lowest terms, its denominator is \(2^ab\), where \(b\) is odd. Find \(ab/10\).

**Answer:** \(\boxed{401}\)

### Short solution

Since

\[
(2i)!!=2^ii!,
\]

all odd denominator factors cancel, and each reduced denominator is a power of \(2\). For term \(i\), the denominator is

\[
2^{i+v_2(i!)}.
\]

These exponents strictly increase, so the final term controls the denominator of the sum. Thus \(b=1\) and

\[
a=2009+v_2(2009!).
\]

Legendre's formula gives

\[
v_2(2009!)=1004+502+251+125+62+31+15+7+3+1=2001.
\]

Hence \(a=4010\), and

\[
\frac{ab}{10}=\frac{4010}{10}=\boxed{401}.
\]

### IOQM tip / trick

Use \(p\)-adic valuation rather than an explicit common denominator when denominators are powers of one prime.

### Verification status

**Fully verified.**

---

## Q50. GCD of \(2^m+1\) and \(2^n-1\)

**Original source identified:** 2021 AIME II, Problem 9

### Question

Find the number of ordered pairs \((m,n)\) in \(\{1,2,\dots,30\}^2\) such that

\[
\gcd(2^m+1,2^n-1)\ne1.
\]

**Answer:** \(\boxed{295}\)

### Short solution

Using

\[
\gcd(2^a-1,2^b-1)=2^{\gcd(a,b)}-1
\]

and

\[
(2^m+1)(2^m-1)=2^{2m}-1,
\]

one obtains

\[
\gcd(2^m+1,2^n-1)>1
\iff
v_2(n)>v_2(m).
\]

Among \(1,\dots,30\), the counts for \(v_2=0,1,2,3,4\) are

\[
15,8,4,2,1.
\]

Thus the number of ordered pairs is

\[
15(15)+8(7)+4(3)+2(1)=225+56+12+2=\boxed{295}.
\]

### IOQM tip / trick

For gcds involving \(a^m+1\), multiply by \(a^m-1\) to create the standard form \(a^{2m}-1\).

### Verification status

**Fully verified.**

---

## Q51. Binary digits of the inverse of \(7\)

**Original source identified:** 2022 AMC 10B, Problem 25

### Question

Let \(x_0,x_1,x_2,\dots\) be bits. Define

\[
S_n=\sum_{k=0}^{n-1}x_k2^k.
\]

Suppose

\[
7S_n\equiv1\pmod{2^n}
\]

for every \(n\ge1\). Find

\[
x_{2019}+2x_{2020}+4x_{2021}+8x_{2022}.
\]

**Answer:** \(\boxed{6}\)

### Short solution

Since \(7=2^3-1\), the binary digits of its \(2\)-adic inverse have period \(3\):

\[
x_k=0\iff k\equiv0\pmod3
\]

for \(k\ge3\), with the other bits equal to \(1\).

Now

\[
2019,2022\equiv0\pmod3,
\]

while \(2020\equiv1\) and \(2021\equiv2\). Hence

\[
(x_{2019},x_{2020},x_{2021},x_{2022})=(0,1,1,0).
\]

Therefore

\[
0+2+4+0=\boxed{6}.
\]

### IOQM tip / trick

Modular inverses modulo powers of \(2\) can reveal periodic binary patterns. Denominators of the form \(2^r-1\) naturally produce period \(r\).

### Verification status

**Fully verified.**

---

# Lot 10 answer key

| Q | Answer |
|---|---:|
| Q47 | \(22\) |
| Q48 | \(45\) |
| Q49 | \(401\) |
| Q50 | \(295\) |
| Q51 | \(6\) |
