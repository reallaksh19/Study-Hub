# ALLEN IOQM Number Theory Marathon 2026 — Lot 7

**Questions:** Q32–Q36  
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

## Q32. Prime \(p\) with \(16p+1\) a cube

**Original source identified:** 2015 AIME I, Problem 3

### Question

There is a prime number \(p\) such that

\[
16p+1
\]

is the cube of a positive integer. Find \(p\).

**Answer:** \(\boxed{307}\)

### Short solution

Let

\[
16p+1=n^3.
\]

Then

\[
16p=n^3-1=(n-1)(n^2+n+1).
\]

Since \(16p+1\) is odd, \(n\) is odd. Therefore \(n^2+n+1\) is odd, so all four factors of \(2\) in \(16\) must lie in \(n-1\). Write

\[
n-1=16k.
\]

Then

\[
p=k(n^2+n+1).
\]

Because \(p\) is prime and \(n^2+n+1>1\), we must have \(k=1\). Thus \(n=17\), so

\[
p=17^2+17+1=307.
\]

Hence \(\boxed{307}\).

### IOQM tip / trick

When a prime appears in a factorization such as

\[
16p=(n-1)(n^2+n+1),
\]

first separate the **power-of-two part** from the odd part. Once one factor is forced to absorb all of \(16\), primality often forces the remaining cofactor to be \(1\).

### Verification status

**Fully verified.**

---

## Q33. Equal digit sums after adding \(864\)

**Original source identified:** 2015 AIME I, Problem 8

### Question

For a positive integer \(n\), let \(s(n)\) denote the sum of its decimal digits. Find the smallest positive integer \(n\) satisfying

\[
s(n)=s(n+864)=20.
\]

**Answer:** \(\boxed{695}\)

### Short solution

When two decimal numbers are added, every carry reduces the expected digit sum by \(9\). Since \(s(864)=18\), if there are \(c\) carries in adding \(864\) to \(n\), then

\[
s(n+864)=s(n)+18-9c.
\]

Both digit sums are \(20\), so \(c=2\). For a three-digit \(n=\overline{tuv}\) with \(t+u+v=20\), the hundreds column necessarily carries because \(t\ge2\) and \(t+8\ge10\). Exactly one of the units and tens columns must also carry.

To minimize \(n\), make the tens column carry but the units column not carry. Then \(v+4\le9\), so \(v\le5\). Taking the largest possible \(u=9\) and \(v=5\) gives the smallest possible hundreds digit:

\[
t=20-9-5=6.
\]

So \(n=695\). Check: \(695+864=1559\), and both numbers have digit sum \(20\). Therefore \(\boxed{695}\).

### IOQM tip / trick

Memorize the carry principle:

\[
s(a+b)=s(a)+s(b)-9(\text{number of carries}).
\]

Digit-sum problems that look like brute force often reduce to counting carries.

### Verification status

**Fully verified.**

---

## Q34. When is a factorial quotient integral?

**Original source identified:** 2019 AMC 10A, Problem 25

### Question

For how many integers \(n\) between \(1\) and \(50\), inclusive, is

\[
\frac{(n^2-1)!}{(n!)^n}
\]

an integer?

**Answer:** \(\boxed{34}\)

### Short solution

The quantity

\[
\frac{(n^2)!}{(n!)^{n+1}}
\]

is always an integer: it counts partitions of \(n^2\) objects into \(n\) unordered groups of size \(n\). Now

\[
\frac{(n^2-1)!}{(n!)^n}
=
\frac{(n^2)!}{(n!)^{n+1}}\cdot\frac{n!}{n^2}.
\]

Thus the condition reduces to \(n\mid(n-1)!\). This fails precisely for every prime \(n\) and for \(n=4\). There are \(15\) primes at most \(50\), so \(16\) values fail and

\[
50-16=\boxed{34}.
\]

### IOQM tip / trick

When a complicated factorial quotient appears, try to multiply/divide by one extra factorial term to create a known integer such as a multinomial coefficient.

### Verification status

**Fully verified.**

---

## Q35. Products of two distinct divisors of \(100000\)

### Question

Let \(S\) be the set of all positive divisors of \(100000\). How many distinct numbers can be expressed as the product of two **distinct** elements of \(S\)?

**Answer:** \(\boxed{117}\)

### Short solution

Since

\[
100000=2^5 5^5,
\]

every divisor is \(2^a5^b\) with \(0\le a,b\le5\). A product of two divisors has the form \(2^u5^v\), where \(0\le u,v\le10\). Without the “distinct” restriction, all \(11\cdot11=121\) exponent pairs are possible.

Exactly four products can only arise by multiplying a divisor by itself:

\[
1,\quad2^{10},\quad5^{10},\quad2^{10}5^{10}.
\]

Therefore

\[
121-4=\boxed{117}.
\]

### IOQM tip / trick

Translate divisor multiplication into **addition of exponent vectors**. For \(N=p^aq^b\), divisors correspond to lattice points, and products correspond to sums of those points.

### Verification status

**Fully verified.**

---

## Q36. Delete the leftmost digit

**Original source identified:** 2006 AIME I, Problem 3

### Question

Find the least positive integer such that, when its leftmost digit is deleted, the resulting integer is \(\frac1{29}\) of the original integer.

**Answer:** \(\boxed{725}\)

### Short solution

Let the leftmost digit be \(d\), and suppose the remaining \(r\)-digit integer is \(m\). Then the original number is

\[
d10^r+m.
\]

The condition gives

\[
d10^r+m=29m,
\]

so

\[
d10^r=28m.
\]

Because \(7\nmid10^r\), the digit \(d\) must be divisible by \(7\), so \(d=7\). Then \(m=10^r/4\). The least possible \(r\) is \(2\), giving \(m=25\). Therefore the original integer is \(\boxed{725}\).

### IOQM tip / trick

For “delete digits” questions, write the decimal number using place value:

\[
N=d10^r+m.
\]

That converts a digit manipulation into an ordinary divisibility equation.

### Verification status

**Fully verified.**

---

# Lot 7 answer key

| Q | Answer |
|---|---:|
| Q32 | \(307\) |
| Q33 | \(695\) |
| Q34 | \(34\) |
| Q35 | \(117\) |
| Q36 | \(725\) |
