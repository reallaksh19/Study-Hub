# ALLEN IOQM Number Theory Marathon 2026 — Lot 5

**Questions:** Q22–Q26  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A  
**Direct video anchor:** Q22 is visible on-screen at approximately **2:33:52**.  
**Format:** Recovered question + verified answer + short solution + reusable IOQM tip/trick

> ## Reconstruction note
>
> Q22 is directly confirmed by the supplied video screenshot.
>
> The neighboring problems Q23–Q26 align with the same archived Number Theory problem sequence used in the marathon. Their mathematics has been independently checked.
>
> For Q24, the archived source defines a set \(S\) but does not preserve a final instruction such as “find \(|S|\)” or “find the sum of the elements of \(S\).” Therefore the complete set is determined below, together with both common requested statistics. No missing instruction is guessed.

---

## Q22. Exactly one prime among \(kx+60\)

### Question

Find the smallest positive integer \(k\) such that there is exactly one prime number of the form

\[
kx+60
\]

for integers

\[
0\le x\le10.
\]

**Answer:** \(\boxed{17}\)

### Short solution

If

\[
\gcd(k,30)>1,
\]

then \(k\) shares a prime factor \(2\), \(3\), or \(5\) with \(60\). Hence every number

\[
kx+60
\]

is divisible by that same prime. Since every term is at least \(60\), none is prime.

Thus for \(k<17\) we only need to test values coprime to \(30\):

\[
k=1,7,11,13.
\]

Each gives at least two primes:

- \(k=1\): \(61,67\);
- \(k=7\): \(67,109\);
- \(k=11\): \(71,137\);
- \(k=13\): \(73,151\).

Now take

\[
k=17.
\]

The eleven values are

\[
60,77,94,111,128,145,162,179,196,213,230.
\]

Only

\[
179
\]

is prime.

Therefore

\[
\boxed{k=17}.
\]

### IOQM tip / trick

Before testing an arithmetic progression for primes, first exploit a **fixed common divisor**.

Here

\[
60=2^2\cdot3\cdot5.
\]

Any \(k\) sharing \(2\), \(3\), or \(5\) with \(60\) eliminates the entire progression immediately.

This turns a search over \(k=1,2,\dots,16\) into only four genuine checks.

### Verification status

**Direct video-confirmed question; answer independently verified.**

---

## Q23. Divisors of \(2^a3^b\) that are multiples of \(6\)

### Question

Let \(S\) be the sum of all positive integers \(n\) such that:

1. \(\frac35\) of the positive divisors of \(n\) are multiples of \(6\), and
2. \(n\) has no prime divisors greater than \(3\).

Calculate

\[
\frac{S}{36}.
\]

**Answer:** \(\boxed{2345}\)

### Short solution

Because \(n\) has no prime factors greater than \(3\),

\[
n=2^a3^b.
\]

We must have \(a,b\ge1\).

The total number of divisors is

\[
(a+1)(b+1).
\]

A divisor is a multiple of \(6\) exactly when it contains at least one factor \(2\) and one factor \(3\). Hence there are

\[
ab
\]

such divisors.

Therefore

\[
\frac{ab}{(a+1)(b+1)}=\frac35.
\]

Cross-multiplying,

\[
5ab=3ab+3a+3b+3,
\]

so

\[
2ab-3a-3b=3.
\]

Factor:

\[
(2a-3)(2b-3)=15.
\]

The positive ordered factor pairs of \(15\) give

\[
(a,b)=(2,9),(3,4),(4,3),(9,2).
\]

Thus the possible \(n\) are

\[
2^2 3^9,\qquad
2^3 3^4,\qquad
2^4 3^3,\qquad
2^9 3^2.
\]

Their sum is

\[
S=84420.
\]

Therefore

\[
\frac{S}{36}
=
\frac{84420}{36}
=
\boxed{2345}.
\]

### IOQM tip / trick

For

\[
n=p^a q^b,
\]

count divisors by choosing exponents.

- Total divisors:
  \[
  (a+1)(b+1).
  \]
- Divisors containing both \(p\) and \(q\):
  \[
  ab.
  \]

When a rational proportion of divisors is prescribed, cross-multiply and try to convert the resulting Diophantine equation into a factorization such as

\[
(2a-3)(2b-3)=15.
\]

### Verification status

**Fully verified.**

---

## Q24. Integers coprime to everything up to \(n/6\)

### Recovered source statement

Let \(S\) be the set of all positive integers \(n\) satisfying:

1. \(n\) is relatively prime to every positive integer not exceeding \(n/6\);
2.
   \[
   2^n\equiv4\pmod n.
   \]

The archived source does not preserve the final command.

### Complete result

\[
\boxed{S=\{1,2,4,6,10\}}.
\]

Therefore

\[
\boxed{|S|=5}
\]

and

\[
\boxed{\sum_{n\in S}n=23}.
\]

### Short solution

First consider a prime \(n\).

For an odd prime \(n\), Fermat's theorem gives

\[
2^n\equiv2\pmod n.
\]

But the required congruence says

\[
2^n\equiv4\pmod n,
\]

so \(n\mid2\), impossible for an odd prime.

Thus the only prime candidate is

\[
n=2,
\]

which works.

Now suppose \(n\) is composite, and let \(p\) be its smallest prime divisor.

The coprimality condition implies

\[
p>\frac n6.
\]

But for a composite integer,

\[
p\le\sqrt n.
\]

Hence

\[
\frac n6<\sqrt n,
\]

which implies

\[
n<36.
\]

So only composites below \(36\) need checking.

### Even case

If \(2\mid n\), then

\[
2>\frac n6,
\]

so

\[
n<12.
\]

The composite candidates are

\[
4,6,8,10.
\]

Checking \(2^n\equiv4\pmod n\), we obtain

\[
4,6,10
\]

as solutions, while \(8\) fails.

### Odd composite case

If the smallest prime factor is \(3\), then \(n<18\), so the only odd composite possibilities are

\[
9,15,
\]

and both fail the congruence.

If the smallest prime factor is \(5\), then \(n<30\); the only new possibility is

\[
25,
\]

which also fails.

Larger smallest prime factors would force \(n\ge49\), contradicting \(n<36\).

Finally, \(n=1\) satisfies both conditions vacuously/modulo \(1\).

Hence

\[
\boxed{S=\{1,2,4,6,10\}}.
\]

### IOQM tip / trick

The condition

> “\(n\) is coprime to every number \(\le n/6\)”

is really a statement about the **smallest prime factor** \(p\) of \(n\):

\[
p>\frac n6.
\]

For composite \(n\), combine this with

\[
p\le\sqrt n.
\]

The resulting inequality

\[
\frac n6<\sqrt n
\]

immediately bounds the entire problem by

\[
n<36.
\]

This is a powerful general technique: turn an unusual coprimality condition into a bound on the smallest prime factor.

### Verification status

**Mathematical set fully verified; final requested statistic missing from archived wording.**

---

## Q25. A product of \(2^i+5\) modulo \(1000\)

### Question

Find the remainder when

\[
\prod_{i=1}^{1903}(2^i+5)
\]

is divided by \(1000\).

**Answer:** \(\boxed{931}\)

### Short solution

Use

\[
1000=8\cdot125
\]

and the Chinese Remainder Theorem.

### Modulo \(8\)

For \(i\ge3\),

\[
2^i+5\equiv5\pmod8.
\]

Thus

\[
\prod_{i=1}^{1903}(2^i+5)
\equiv
7\cdot1\cdot5^{1901}
\pmod8.
\]

Since \(5^2\equiv1\pmod8\) and \(1901\) is odd,

\[
\equiv7\cdot5
\equiv3\pmod8.
\]

### Modulo \(125\)

The powers

\[
2^1,2^2,\dots,2^{100}
\]

run through all invertible residue classes modulo \(125\).

Translation by \(5\),

\[
u\mapsto u+5,
\]

permutes these invertible residue classes, because adding \(5\) does not change whether a residue is divisible by \(5\).

Therefore one block of \(100\) factors satisfies

\[
\prod_{i=1}^{100}(2^i+5)
\equiv
\prod_{u\in(\mathbb Z/125\mathbb Z)^\times}u
\equiv-1
\pmod{125}.
\]

(The units pair with their inverses; only \(1\) and \(-1\) are self-inverse.)

Now

\[
1903=19\cdot100+3.
\]

Hence

\[
\prod_{i=1}^{1903}(2^i+5)
\equiv
(-1)^{19}(7)(9)(13)
\equiv56
\pmod{125}.
\]

So the remainder \(R\) satisfies

\[
R\equiv3\pmod8,
\qquad
R\equiv56\pmod{125}.
\]

Write

\[
R=56+125k.
\]

Modulo \(8\),

\[
5k\equiv3\pmod8,
\]

giving

\[
k\equiv7\pmod8.
\]

Taking \(k=7\),

\[
R=56+875=931.
\]

Therefore

\[
\boxed{931}.
\]

### IOQM tip / trick

For modulus \(1000\), split immediately into

\[
8\quad\text{and}\quad125.
\]

A second useful idea here is **permutation of reduced residue systems**. Instead of multiplying 100 ugly terms, recognize that

\[
u\mapsto u+5
\]

simply permutes the units modulo \(125\).

### Verification status

**Fully verified; published solution answer also gives \(931\).**

---

## Q26. Prime quotient required to be a square

### Recovered question

Let \(p,q<200\) be prime numbers such that

\[
\frac{q^{p-1}}{p}
\]

is a perfect square.

Find the possible value(s) of

\[
p+q.
\]

**Answer under the literal recovered formula:** \(\boxed{4}\)

### Short solution

For

\[
\frac{q^{p-1}}p
\]

to be an integer, the prime \(p\) must divide

\[
q^{p-1}.
\]

Since \(q\) is prime, this forces

\[
p=q.
\]

The expression becomes

\[
p^{p-2}.
\]

If \(p\) is odd, then

\[
p-2
\]

is odd, so \(p^{p-2}\) is not a perfect square.

Therefore

\[
p=2.
\]

Thus

\[
q=2
\]

and

\[
p+q=4.
\]

Hence

\[
\boxed{4}.
\]

### IOQM tip / trick

Before doing sophisticated congruences, check **integrality**.

If a prime \(p\) appears in the denominator of

\[
\frac{q^m}{p},
\]

with \(q\) also prime, then integrality immediately forces

\[
p=q.
\]

That can collapse an apparently two-variable prime problem into a one-line exponent-parity check.

### Verification status

**Literal archived formula independently verified.**  
The source wording “find all possible pairs of \(p+q\)” is grammatically awkward; mathematically, the literal formula yields the single value \(4\).

---

# Lot 5 answer key

| Question | Answer / result |
|---|---:|
| Q22 | \(17\) |
| Q23 | \(2345\) |
| Q24 | \(S=\{1,2,4,6,10\}\); \(|S|=5\); sum \(=23\) |
| Q25 | \(931\) |
| Q26 | \(4\) |

---

# Accuracy notes

1. **Q22** is directly confirmed by the supplied screenshot at about 2:33:52.
2. **Q23–Q26** align with the neighboring archived Number Theory problem sequence.
3. **Q24** has a damaged/incomplete final instruction in the archived sheet. The full solution set is supplied instead of guessing whether the requested output was the set, its cardinality, or its sum.
4. **Q25** is independently confirmed by a published Number Theory A solution sheet with answer \(931\).
5. **Q26** is solved exactly as the archived mathematical formula is rendered; the unusual wording is explicitly preserved rather than silently rewritten.
