# ALLEN IOQM Number Theory Marathon 2026 — Lot 1

**Questions:** Q1–Q5  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A

> Q1 remains wording-unverified; Q2–Q5 are mathematically checked.

---

## Q1. Repeated-9 exponent expression

### Question

**Unverified wording.** The available transcript reconstruction describes a 2020-level nested exponent expression involving repeated \(9\)s and asks for its last two digits.

**Answer stated in the lecture reconstruction:** \(\boxed{20}\) — **not independently verified from the current wording**

### Verification note

If the expression were simply the ordinary right-associated power tower

\[
9^{9^{9^{\cdot^{\cdot}}}},
\]

then the residue modulo \(100\) does not match \(20\). Therefore some part of the original on-screen expression is missing from the accessible transcript reconstruction.

### IOQM tip / trick

For “last two digits,” work modulo \(100\) immediately.

For power towers:

1. determine the multiplicative period/order of the base modulo \(100\);
2. reduce the exponent modulo that period;
3. preserve the exact right-associated exponent structure.

Do not flatten or reinterpret a tower when the original slide is unavailable.

### Verification status

**Unverified wording.** The lecture answer is retained, but the problem statement is not yet safe to reproduce as exact.

---

## Q2. Largest two-digit factor of a huge difference

### Question

Find the largest positive two-digit factor of

\[
3^{2^{2011}}-2^{2^{2011}}.
\]

**Answer:** \(\boxed{97}\)

### Short solution

Repeatedly use

\[
x^{2m}-y^{2m}=(x^m-y^m)(x^m+y^m).
\]

Because the exponent \(2^{2011}\) is a power of \(2\), the factorization contains

\[
3^4+2^4=81+16=97.
\]

So \(97\) divides the number.

Now rule out larger two-digit integers:

- \(98\) cannot divide it because the original number is odd.
- \(99\) cannot divide it because the number is not divisible by \(3\).

Therefore the largest two-digit factor is

\[
\boxed{97}.
\]

### IOQM tip / trick

When an exponent is itself a power of \(2\), look for the factor chain

\[
x-y,\quad x+y,\quad x^2+y^2,\quad x^4+y^4,\dots
\]

before doing modular arithmetic. A large-looking expression may contain a small explicit factor such as

\[
3^4+2^4=97.
\]

### Verification status

**Verified reconstruction.**

---

## Q3. Factorials after deleting trailing zeros

### Question

Richard writes \(n!\) and \((n+1)!\) on a board and erases all trailing zeros from each, leaving integers \(a\) and \(b\).

If one of \(a,b\) is four times the other, find the last two digits of the sum of all possible values of \(n<1000\).

**Answer:** \(\boxed{14}\)

The valid values are

\[
n=3,\ 24,\ 39,\ 249,\ 399,
\]

whose sum is

\[
714.
\]

### Short solution

Let

\[
t=v_5(n+1).
\]

When passing from \(n!\) to \((n+1)!\), the factor \(n+1\) introduces \(t\) new factors of \(5\), hence \(t\) new trailing zeros.

After removing those zeros,

\[
\frac{b}{a}=\frac{n+1}{10^t}.
\]

We need

\[
\frac{b}{a}=4
\]

or

\[
\frac{b}{a}=\frac14.
\]

This yields

\[
n+1=4,\ 40,\ 400,\ 25,\ 250.
\]

Therefore

\[
n=3,\ 39,\ 399,\ 24,\ 249.
\]

Their sum is

\[
714,
\]

so the last two digits are

\[
\boxed{14}.
\]

### IOQM tip / trick

Never compute the factorials themselves.

Trailing-zero questions are valuation questions. In factorials, factors of \(2\) are abundant, so the limiting quantity is usually

\[
v_5(n!).
\]

Comparing two zero-stripped factorials by a ratio is much faster than expanding either factorial.

### Verification status

**Verified reconstruction.**

---

## Q4. Preserving \(\operatorname{lcm}(1,2,\dots,50)\)

### Corrected question

Find the **largest** positive integer \(n\) such that

\[
\operatorname{lcm}(n,n+1,\dots,50)
=
\operatorname{lcm}(1,2,\dots,50).
\]

**Answer:** \(\boxed{27}\)

> The word **largest** is necessary. Without it, \(n=1\) is trivially a solution.

### Short solution

The LCM is determined by the largest prime powers not exceeding \(50\), including

\[
2^5=32,\qquad 3^3=27,\qquad 5^2=25,\qquad 7^2=49,
\]

together with the needed larger primes.

Starting at \(27\) still leaves a multiple carrying every required maximal prime power.

Starting at \(28\), however, removes the only multiple of

\[
3^3=27
\]

from the interval.

Therefore the largest possible starting value is

\[
\boxed{27}.
\]

### IOQM tip / trick

For interval-LCM problems, do not track every omitted integer.

Track only the **maximal prime powers** \(p^k\) that define the full LCM. Ask whether the shortened interval still contains a multiple carrying each required prime power.

### Verification status

**Corrected and verified reconstruction.**

---

## Q5. Balance three integer factors of \(7!\)

### Question

Positive integers \(x,y,z\) satisfy

\[
xyz=7!.
\]

Minimize

\[
\max(x,y,z).
\]

**Answer:** \(\boxed{20}\)

One optimal factorization is

\[
14\cdot18\cdot20=5040=7!.
\]

### Short solution

Since

\[
7!=5040
\]

and

\[
\sqrt[3]{5040}\approx17.1,
\]

the optimal triple should be as balanced as possible.

The factorization

\[
5040=14\cdot18\cdot20
\]

shows that a maximum value of \(20\) is achievable.

To improve this to \(19\), all three factors would have to be divisors of \(5040\) not exceeding \(19\), with product \(5040\). Checking the only sufficiently large candidate divisor combinations shows no such triple exists.

Therefore the minimum possible maximum is

\[
\boxed{20}.
\]

### IOQM tip / trick

For “minimize the maximum factor” problems:

1. start near the cube root of the product;
2. search for a balanced divisor triple;
3. after finding a candidate \(M\), prove \(M-1\) impossible using divisibility and the narrow list of possible factors.

### Verification status

**Verified reconstruction.**
