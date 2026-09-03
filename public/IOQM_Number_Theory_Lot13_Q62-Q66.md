# ALLEN IOQM Number Theory Marathon 2026 — Lot 13

**Questions:** Q62–Q66  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A  
**Format:** Recovered question + verified answer + short solution + reusable IOQM tip/trick

> ## Continuation-source note
>
> This block is recovered from the later **IOQM 2012–2025 Number Theory PYQ** section used alongside the marathon materials.
>
> The mathematical statements and answers are independently verified. The exact **video Q62–Q81 numbering is continuation-source inferred** rather than directly screen-confirmed, so that distinction is preserved explicitly.

---

## Q62. Nested floor and square roots

**Original source:** IOQM 2021 Part A

### Question

For any real number \(t\), let \(\lfloor t\rfloor\) denote the greatest integer not exceeding \(t\).

Suppose \(N\) is the greatest integer such that

\[
\left\lfloor
\sqrt{
\sqrt{
\left\lfloor\sqrt N\right\rfloor
}
}
\right\rfloor
=4.
\]

Find the sum of the decimal digits of \(N\).

**Answer:** \(\boxed{24}\)

### Short solution

The condition gives

\[
4\le\sqrt{\sqrt{\lfloor\sqrt N\rfloor}}<5.
\]

Raise to the fourth power:

\[
256\le\lfloor\sqrt N\rfloor<625.
\]

Therefore

\[
256\le\sqrt N<625,
\]

so

\[
256^2\le N<625^2.
\]

The greatest possible integer is

\[
N=625^2-1=390624.
\]

Its digit sum is

\[
3+9+0+6+2+4=\boxed{24}.
\]

### IOQM tip / trick

For nested floor/root expressions, remove the layers **from the outside inward**. If

\[
\lfloor X\rfloor=m,
\]

replace it with

\[
m\le X<m+1.
\]

Then undo square roots by squaring positive inequalities.

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** continuation-source inferred.

---

## Q63. Alice and Bob iterate affine maps

**Original source:** IOQM 2022

### Question

Alice starts with a positive integer \(M\). On every move she replaces \(x\) by

\[
3x+2.
\]

Bob starts with a positive integer \(N\). On every move he replaces \(x\) by

\[
2x+27.
\]

After four moves each, Alice and Bob reach the same number. Find the smallest possible value of

\[
M+N.
\]

**Answer:** \(\boxed{10}\)

### Short solution

After four moves, Alice has

\[
3^4M+2(1+3+3^2+3^3)=81M+80.
\]

Bob has

\[
2^4N+27(1+2+2^2+2^3)=16N+405.
\]

Thus

\[
81M+80=16N+405,
\]

so

\[
81M-325=16N.
\]

Modulo \(16\),

\[
M-5\equiv0\pmod{16}.
\]

The least positive choice is \(M=5\), giving \(N=5\). Hence

\[
M+N=\boxed{10}.
\]

### IOQM tip / trick

Repeated affine maps

\[
x\mapsto ax+b
\]

have the closed form

\[
a^r x+b(1+a+\cdots+a^{r-1}).
\]

Write that immediately instead of performing the moves one by one.

### Verification status

**Fully verified.**

---

## Q64. Eleven consecutive squares summing to a square

**Original source:** IOQM 2022

### Question

Let \(m\) be the smallest positive integer such that

\[
m^2+(m+1)^2+\cdots+(m+10)^2
\]

is the square of a positive integer \(n\). Find

\[
m+n.
\]

**Answer:** \(\boxed{95}\)

### Short solution

The sum equals

\[
11m^2+110m+385=11\bigl((m+5)^2+10\bigr).
\]

Thus

\[
n^2=11\bigl((m+5)^2+10\bigr).
\]

Since \(11\mid n^2\), write \(n=11k\). Then

\[
(m+5)^2+10=11k^2.
\]

Modulo \(11\),

\[
(m+5)^2\equiv1\pmod{11}.
\]

For \(m<18\), the only possible values of \(m+5\) are \(10,12,21\), and none makes \(((m+5)^2+10)/11\) a square.

At \(m=18\),

\[
23^2+10=539=11\cdot49,
\]

so \(n=77\). Hence

\[
m+n=18+77=\boxed{95}.
\]

### IOQM tip / trick

If a prime divides a perfect square, \(p\mid n^2\), then \(p\mid n\). Use that before treating the equation as a Pell-type problem. A congruence can reduce the candidate search dramatically.

### Verification status

**Fully verified.**

---

## Q65. Cubic Diophantine equation

**Original source:** IOQM 2022

### Question

Let \(a,b\) be positive integers satisfying

\[
a^3-b^3-ab=25.
\]

Find the largest possible value of

\[
a^2+b^3.
\]

**Answer:** \(\boxed{43}\)

### Short solution

Clearly \(a>b\). Let \(d=a-b\ge1\). Then

\[
a^3-b^3-ab=d(a^2+b^2)+(d-1)ab.
\]

If \(d\ge3\), the expression already exceeds \(25\). For \(d=2\), the smallest case \((a,b)=(3,1)\) gives \(23\), and the next case already exceeds \(25\). Hence \(d=1\).

Then

\[
a^2+b^2=25
\]

with \(a=b+1\). Thus

\[
(b+1)^2+b^2=25,
\]

which gives \(b=3,a=4\). Therefore

\[
a^2+b^3=16+27=\boxed{43}.
\]

### IOQM tip / trick

When \(a^3-b^3\) appears together with \(ab\), introduce \(d=a-b\). Small constants often force \(d\) to be \(1\) or \(2\).

### Verification status

**Fully verified.**

---

## Q66. GCD plus LCM equals the sum

**Original source:** IOQM 2022

### Question

How many ordered pairs \((a,b)\) satisfy

\[
a,b\in\{10,11,\dots,30\}
\]

and

\[
\gcd(a,b)+\operatorname{lcm}(a,b)=a+b?
\]

**Answer:** \(\boxed{35}\)

### Short solution

Let

\[
d=\gcd(a,b),\qquad a=dx,\qquad b=dy,
\]

with \(\gcd(x,y)=1\). Then

\[
\operatorname{lcm}(a,b)=dxy.
\]

The equation becomes

\[
1+xy=x+y,
\]

or

\[
(x-1)(y-1)=0.
\]

Thus one of \(a,b\) divides the other.

There are \(21\) diagonal pairs. The distinct unordered divisibility pairs in the range are

\[
(10,20),(10,30),(11,22),(12,24),(13,26),(14,28),(15,30),
\]

seven in total. Each gives two ordered pairs, so

\[
21+2(7)=\boxed{35}.
\]

### IOQM tip / trick

Whenever both gcd and lcm appear, normalize with \(a=dx,b=dy\) and \(\gcd(x,y)=1\). Many gcd/lcm equations then collapse to a tiny factorization.

### Verification status

**Fully verified.**

---

# Lot 13 answer key

| Q | Answer |
|---|---:|
| Q62 | \(24\) |
| Q63 | \(10\) |
| Q64 | \(95\) |
| Q65 | \(43\) |
| Q66 | \(35\) |
