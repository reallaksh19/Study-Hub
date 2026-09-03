# ALLEN IOQM Number Theory Marathon 2026 — Lot 12

**Questions:** Q57–Q61  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A  
**Format:** Recovered question + verified answer + short solution + reusable IOQM tip/trick

> ## Sequence note
>
> This lot continues the verified mapping:
>
> \[
> \text{video Q57–Q61} \longleftrightarrow \text{ALLEN module Q58–Q62}.
> \]
>
> ALLEN module Q62 is the final Number Theory problem in that module.

---

## Q57. Largest \(7\)-\(10\) double

**Original source identified:** 2001 AIME I, Problem 8

### Question

Call a positive integer \(N\) a **\(7\)-\(10\) double** if the digits of the base-\(7\) representation of \(N\), when read as a base-\(10\) integer, form the number \(2N\). Find the largest \(7\)-\(10\) double.

**Answer:** \(\boxed{315}\)

### Short solution

If the base-\(7\) digits are \(d_k\cdots d_1d_0\), then

\[
\sum d_i(10^i-2\cdot7^i)=0.
\]

For \(i=0,1,2,3\), the coefficients are \(-1,-4,2,314\). The total possible negative contribution is at most \(30\), so no digit at position \(i\ge3\) can be nonzero.

Thus

\[
2d_2=4d_1+d_0.
\]

To maximize \(N\), take \(d_2=6\). Then \(4d_1+d_0=12\), maximized by \(d_1=3,d_0=0\). Hence

\[
N=(630)_7=315.
\]

### IOQM tip / trick

If the same digit string is interpreted in two bases, subtract the positional-value formulas. The coefficient sizes can often bound the number of digits immediately.

### Verification status

**Fully verified.**

---

## Q58. A sum-and-sum-of-squares equation involving \(2023\)

### Question

Suppose \(a,b,c,d\) are nonnegative integers such that

\[
(a+b+c+d)(a^2+b^2+c^2+d^2)^2=2023.
\]

Find

\[
a^3+b^3+c^3+d^3.
\]

**Answer:** \(\boxed{43}\)

### Short solution

Factor

\[
2023=7\cdot17^2.
\]

Let \(S_1=a+b+c+d\) and \(S_2=a^2+b^2+c^2+d^2\). Since \(S_1S_2^2=7\cdot17^2\), the only viable choice is

\[
S_1=7,\qquad S_2=17.
\]

The nonnegative quadruple is, up to order,

\[
(0,2,2,3).
\]

Thus

\[
0+8+8+27=\boxed{43}.
\]

### IOQM tip / trick

Factor the constant before doing casework. A square factor in the equation often forces the entire structure.

### Verification status

**Fully verified.**

---

## Q59. Three primes and a cubic quotient

### Question

There is a unique triple of positive primes \(p<q<r\) such that

\[
\frac{p^3+q^3+r^3}{p+q+r}=249.
\]

Find \(r\).

**Answer:** \(\boxed{19}\)

### Short solution

Since

\[
249>\frac{r^3}{3r}=\frac{r^2}{3},
\]

we get \(r<28\), so \(r\le23\).

Use

\[
p^3+q^3+r^3-3pqr=(p+q+r)(p^2+q^2+r^2-pq-pr-qr).
\]

The given equation forces \(p+q+r\mid3pqr\). The viable divisor case reduces to

\[
p+q+r=pq,
\]

or

\[
r+1=(p-1)(q-1).
\]

The small-prime check under \(r\le23\) gives the unique triple

\[
(p,q,r)=(3,11,19).
\]

Therefore \(\boxed{r=19}\).

### IOQM tip / trick

First bound the largest prime using the size of the quotient. Then use the identity for \(x^3+y^3+z^3-3xyz\) to convert the equation into divisibility.

### Verification status

**Fully verified.**

---

## Q60. Floor-function quadratic equation

**Original source identified:** HMMT 1998

### Question

Find the sum of all positive real solutions to

\[
2x^2-x\lfloor x\rfloor=5.
\]

**Answer:**

\[
\boxed{\frac{3+\sqrt{41}+2\sqrt{11}}4}.
\]

### Short solution

Since \(\lfloor x\rfloor\le x\),

\[
2x^2-x\lfloor x\rfloor\ge x^2,
\]

so \(x\le\sqrt5\) and \(\lfloor x\rfloor\in\{0,1,2\}\).

The \(0\) case is invalid. For \(\lfloor x\rfloor=1\),

\[
x=\frac{1+\sqrt{41}}4.
\]

For \(\lfloor x\rfloor=2\),

\[
x=\frac{1+\sqrt{11}}2.
\]

Adding gives

\[
\boxed{\frac{3+\sqrt{41}+2\sqrt{11}}4}.
\]

### IOQM tip / trick

With floor functions, derive a global bound first. It can reduce infinitely many floor cases to just a few.

### Verification status

**Fully verified.**

---

## Q61. Sum of squares of real solutions involving \(\lfloor a\rfloor\)

### Question

Let \(a\) be a real number satisfying

\[
\lfloor a\rfloor^3-4a^2+\lfloor a\rfloor-1=0.
\]

The sum of the squares of all such real numbers can be written as \(m/n\), where \(m,n\) are relatively prime positive integers. Find \(m+n\).

**Answer:** \(\boxed{50}\)

### Short solution

Let

\[
k=\lfloor a\rfloor.
\]

Then

\[
4a^2=k^3+k-1.
\]

For \(k\le0\) there is no real candidate; for \(k=1,2,3\), the positive root is outside \([k,k+1)\).

For \(k=4\),

\[
a^2=\frac{67}{4},
\]

and the positive root lies in \([4,5)\). For \(k=5\),

\[
a^2=\frac{129}{4},
\]

and the positive root lies in \([5,6)\). For \(k\ge6\), the positive root exceeds \(k+1\).

Thus the squared sum is

\[
\frac{67+129}{4}=49=\frac{49}{1},
\]

so

\[
m+n=\boxed{50}.
\]

### IOQM tip / trick

Set \(k=\lfloor a\rfloor\), solve algebraically, and then enforce the interval condition \(k\le a<k+1\). A candidate root is not valid until it passes its own floor interval.

### Verification status

**Recovered and independently verified from the final ALLEN module problem.**

---

# Lot 12 answer key

| Question | Answer |
|---|---:|
| Q57 | \(315\) |
| Q58 | \(43\) |
| Q59 | \(19\) |
| Q60 | \(\frac{3+\sqrt{41}+2\sqrt{11}}4\) |
| Q61 | \(50\) |
