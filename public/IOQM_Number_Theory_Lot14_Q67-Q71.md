# ALLEN IOQM Number Theory Marathon 2026 — Lot 14

**Questions:** Q67–Q71  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A  
**Format:** Recovered question + verified answer + short solution + reusable IOQM tip/trick

> ## Continuation-source note
>
> This block is recovered from the later **IOQM 2012–2025 Number Theory PYQ** section used alongside the marathon materials.
>
> The mathematical statements and answers are independently verified. The exact **video Q62–Q81 numbering is continuation-source inferred** rather than directly screen-confirmed, so that distinction is preserved explicitly.

---

## Q67. GCD–LCM equation in two variables

**Original source:** IOQM 2022

### Question

Let \(m,n\) be natural numbers satisfying

\[
m+3n-5=2\operatorname{lcm}(m,n)-11\gcd(m,n).
\]

Find the maximum possible value of \(m+n\).

**Answer:** \(\boxed{70}\)

### Short solution

Let

\[
d=\gcd(m,n),\qquad m=dx,\quad n=dy,\quad \gcd(x,y)=1.
\]

Then \(\operatorname{lcm}(m,n)=dxy\), so

\[
d(x+3y-2xy+11)=5.
\]

Hence \(d\in\{1,5\}\). For maximum size, use \(d=5\). Then

\[
2xy-x-3y=10.
\]

Factor:

\[
(2x-3)(2y-1)=23.
\]

The coprime positive solution is

\[
x=13,\qquad y=1.
\]

Thus

\[
m=65,\qquad n=5,
\]

and

\[
m+n=\boxed{70}.
\]

### IOQM tip / trick

After extracting the gcd, look for a factorization of the normalized equation. Expressions such as \(2xy-x-3y\) are ideal for Simon’s Favorite Factoring Trick.

### Verification status

**Fully verified.**

---

## Q68. Number of squares in moving intervals

**Original source:** IOQM 2023

### Question

For \(1\le n\le1000\), let \(M_n\) be the number of perfect squares in

\[
X_n=\{4n+1,4n+2,\dots,4n+1000\}.
\]

Let

\[
A=\max M_n,\qquad B=\min M_n.
\]

Find \(A-B\).

**Answer:** \(\boxed{22}\)

### Short solution

At \(n=1\), the interval is \(5\) through \(1004\), containing

\[
3^2,4^2,\dots,31^2,
\]

so \(M_1=29\).

At \(n=1000\), the interval is \(4001\) through \(5000\), containing

\[
64^2,65^2,\dots,70^2,
\]

so \(M_{1000}=7\).

Because consecutive-square gaps \(2k+1\) increase with \(k\), a fixed-length interval cannot contain fewer squares when shifted left. Thus

\[
A=29,\qquad B=7,
\]

and

\[
A-B=\boxed{22}.
\]

### IOQM tip / trick

The square gaps

\[
(k+1)^2-k^2=2k+1
\]

increase steadily. Use this monotonicity when counting squares in moving intervals of fixed length.

### Verification status

**Fully verified.**

---

## Q69. Counting squarefree prime-product triples

**Original source:** IOQM 2023

### Question

Find the number of triples \((a,b,c)\) of positive integers such that:

1. \(ab\) is prime;
2. \(bc\) is a product of two primes;
3. \(abc\) is not divisible by the square of any prime;
4. \(abc\le30\).

**Answer:** \(\boxed{17}\)

### Short solution

Since \(ab\) is prime, exactly one of \(a,b\) is \(1\).

If \(a=1\), then \(b=p\) and \(c=q\) are distinct primes with \(pq\le30\). This gives \(14\) ordered pairs.

If \(b=1\), then \(a=p\) is prime and \(c=qr\) is the product of two different primes not equal to \(p\). The bound \(pqr\le30\) forces the prime set \(\{2,3,5\}\). Any of the three primes can be \(a\), giving \(3\) more triples.

Hence

\[
14+3=\boxed{17}.
\]

### IOQM tip / trick

A product that is prime forces one factor to be \(1\). Then a squarefree condition means all primes involved must be distinct.

### Verification status

**Fully verified.**

---

## Q70. Largest beautiful number below \(100\)

**Original source:** IOQM 2023

### Question

A positive integer \(n>1\) is called **beautiful** if it can be written in exactly one way as

\[
n=a_1+\cdots+a_k=a_1a_2\cdots a_k,
\]

where \(k>1\) and \(a_1\ge\cdots\ge a_k\) are positive integers.

Find the largest beautiful number less than \(100\).

**Answer:** \(\boxed{95}\)

### Short solution

Once the factors greater than \(1\) are chosen, the number of required \(1\)'s is forced:

\[
t=n-(\text{sum of non-1 factors}).
\]

Thus different nontrivial unordered factorizations give different representations.

Now:

- \(99=9\cdot11=3\cdot33\): not unique;
- \(98=2\cdot49=7\cdot14\): not unique;
- \(97\) is prime: no representation;
- \(96=2\cdot48=3\cdot32\): not unique;
- \(95=5\cdot19\), its only nontrivial unordered factorization.

Indeed,

\[
95=5\cdot19\cdot1^{71}
\]

and

\[
5+19+71=95.
\]

Hence the largest beautiful number is

\[
\boxed{95}.
\]

### IOQM tip / trick

When \(1\)'s are allowed in a sum-product representation, choose the factors greater than \(1\) first. The number of \(1\)'s is then forced.

### Verification status

**Fully verified.**

---

## Q71. Smallest integer not dividing \(9!\)

**Original source:** IOQM 2024

### Question

Find the smallest positive integer that does not divide

\[
9!=1\cdot2\cdot3\cdots9.
\]

**Answer:** \(\boxed{11}\)

### Short solution

\[
9!=2^7 3^4 5\cdot7.
\]

Every integer from \(1\) through \(10\) divides \(9!\), while the prime \(11\) does not. Therefore

\[
\boxed{11}.
\]

### IOQM tip / trick

For “smallest integer not dividing \(n!\),” check prime powers as well as primes. A small composite can fail before the next prime if its exponent demand exceeds the factorial valuation.

### Verification status

**Fully verified.**

---

# Lot 14 answer key

| Q | Answer |
|---|---:|
| Q67 | \(70\) |
| Q68 | \(22\) |
| Q69 | \(17\) |
| Q70 | \(95\) |
| Q71 | \(11\) |
