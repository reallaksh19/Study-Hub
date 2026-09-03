# ALLEN IOQM Number Theory Marathon 2026 — Lot 15

**Questions:** Q72–Q76  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A  
**Format:** Recovered question + verified answer + short solution + reusable IOQM tip/trick

> ## Continuation-source note
>
> This block is recovered from the later **IOQM 2012–2025 Number Theory PYQ** section used alongside the marathon materials.
>
> The mathematical statements and answers are independently verified. The exact **video Q62–Q81 numbering is continuation-source inferred** rather than directly screen-confirmed.

---

## Q72. Last two digits of \(5^{2024}\)

**Original source:** IOQM 2024

### Question

What number is formed by the last two digits of

\[
5^{2024}
\]

in the same order?

**Answer:** \(\boxed{25}\)

### Short solution

For every \(k\ge2\),

\[
5^k\equiv25\pmod{100}.
\]

Therefore

\[
5^{2024}\equiv\boxed{25}\pmod{100}.
\]

### IOQM tip / trick

Before using Euler’s theorem for last digits, check whether the base is coprime to the modulus. Powers of \(5\) modulo \(100\) stabilize almost immediately.

### Verification status

**Fully verified.**

---

## Q73. Two even-power equations

**Original source:** IOQM 2024

### Question

Find the number of triples of real numbers \((a,b,c)\) satisfying

\[
a^{20}+b^{20}+c^{20}=a^{24}+b^{24}+c^{24}=1.
\]

**Answer:** \(\boxed{6}\)

### Short solution

The first equality gives \(|a|,|b|,|c|\le1\). For \(|x|\le1\),

\[
x^{20}-x^{24}=x^{20}(1-x^4)\ge0.
\]

Subtracting the two equations gives a sum of nonnegative terms equal to zero, so every variable is in \(\{0,\pm1\}\).

Exactly one variable must be \(\pm1\), and the other two must be zero. Thus

\[
3\cdot2=\boxed{6}.
\]

### IOQM tip / trick

When two sums of different even powers are equal, subtract them. If all terms are bounded by \(1\), the difference often becomes a sum of nonnegative terms.

### Verification status

**Fully verified.**

---

## Q74. Consecutive numbers with digit sums divisible by \(5\)

**Original source:** IOQM 2024

### Question

Let \(n\) be the smallest positive integer such that both \(s(n)\) and \(s(n+1)\) are divisible by \(5\), where \(s(x)\) is the decimal digit sum.

What are the first two digits of \(n\), in the same order?

**Answer:** \(\boxed{49}\)

### Short solution

If \(n\) ends in exactly \(r\) consecutive \(9\)'s, then

\[
s(n+1)-s(n)=1-9r.
\]

For both digit sums to be multiples of \(5\),

\[
1-9r\equiv0\pmod5,
\]

so

\[
r\equiv4\pmod5.
\]

The least possibility is \(r=4\), so the smallest candidate has the form \(q9999\).

Now

\[
s(q)+36\equiv0\pmod5,
\]

so \(s(q)\equiv4\pmod5\). The smallest positive \(q\) is \(4\).

Thus

\[
n=49999,
\]

whose first two digits are

\[
\boxed{49}.
\]

### IOQM tip / trick

When adding \(1\), if there are \(r\) trailing \(9\)'s, the digit sum changes by

\[
1-9r.
\]

This is the main invariant for digit-sum conditions on consecutive integers.

### Verification status

**Fully verified.**

---

## Q75. Concatenating two two-digit numbers

**Original source:** IOQM 2024

### Question

Let \(p,q\) be two-digit positive integers, neither divisible by \(10\). Form

\[
R=100p+q.
\]

The number \(R\) is printed if \(\gcd(p,q)=1\) and \(p+q\mid R\). Let \(N\) be the largest printed number.

Find the number formed by the last two digits of \(N\).

**Answer:** \(\boxed{13}\)

### Short solution

\[
R=100p+q=99p+(p+q).
\]

Thus

\[
p+q\mid99p.
\]

Since

\[
\gcd(p+q,p)=\gcd(p,q)=1,
\]

we get

\[
p+q\mid99.
\]

Because both numbers are two-digit,

\[
p+q\in\{33,99\}.
\]

To maximize \(R\), use \(p+q=99\) and maximize \(p\). Testing downward:

- \((89,10)\): \(q\) forbidden;
- \((88,11)\): gcd \(11\);
- \((87,12)\): gcd \(3\);
- \((86,13)\): gcd \(1\).

Hence

\[
N=8613,
\]

and the last two digits form

\[
\boxed{13}.
\]

### IOQM tip / trick

For concatenations, use place value and reduce modulo the requested divisor. Here

\[
100p+q=99p+(p+q)
\]

solves the core divisibility condition immediately.

### Verification status

**Fully verified.**

---

## Q76. Two floor constraints and a permutation of \(2024\)

**Original source:** IOQM 2024

### Question

An integer \(n\) satisfies:

1. \(\lfloor n/9\rfloor\) is a three-digit number with all three digits equal;
2. \(\lfloor(n-172)/4\rfloor\) is a four-digit number formed by arranging the digits \(2,0,2,4\).

Find the remainder when \(n\) is divided by \(100\).

**Answer:** \(\boxed{91}\)

### Short solution

Write

\[
\left\lfloor\frac n9\right\rfloor=111a,
\qquad a\in\{1,\dots,9\}.
\]

Then

\[
999a\le n<999a+9.
\]

Let

\[
k=\left\lfloor\frac{n-172}{4}\right\rfloor,
\]

where \(k\) is a permutation of \(2024\). Then

\[
4k+172\le n<4k+176.
\]

Checking the distinct permutations against the nine short intervals leaves the unique intersection

\[
a=9,\qquad k=2204.
\]

The intervals are

\[
8991\le n<9000
\]

and

\[
8988\le n<8992.
\]

Thus

\[
n=8991,
\]

so

\[
n\bmod100=\boxed{91}.
\]

### IOQM tip / trick

Convert every floor condition into an interval. Intersecting short intervals is usually cleaner than manipulating nested floor symbols algebraically.

### Verification status

**Fully verified.**

---

# Lot 15 answer key

| Q | Answer |
|---|---:|
| Q72 | \(25\) |
| Q73 | \(6\) |
| Q74 | \(49\) |
| Q75 | \(13\) |
| Q76 | \(91\) |
