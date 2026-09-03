# ALLEN IOQM Number Theory Marathon 2026 — Lot 16

**Questions:** Q77–Q81  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A  
**Format:** Recovered question + verified answer + short solution + reusable IOQM tip/trick

> ## Continuation-source note
>
> This block is recovered from the later **IOQM 2012–2025 Number Theory PYQ** section used alongside the marathon materials.
>
> The mathematical statements and answers are independently verified. The exact **video Q62–Q81 numbering is continuation-source inferred** rather than directly screen-confirmed.

---

## Q77. Distinct fourth-power residues

**Original source:** IOQM 2024

### Question

Consider

\[
1^4,2^4,\dots,14^4.
\]

Find the smallest positive integer \(n\) such that these fourteen numbers leave pairwise distinct remainders modulo \(n\).

**Answer:** \(\boxed{31}\)

### Short solution

For every \(3\le n\le27\), choose \(1\le x<y\le14\) with \(x+y=n\). Then

\[
n\mid y^4-x^4,
\]

so two residues coincide.

The cases \(28,29,30\) also fail, for example

\[
1^4\equiv13^4\pmod{28},
\]

\[
1^4\equiv12^4\pmod{29},
\]

\[
1^4\equiv7^4\pmod{30}.
\]

For \(n=31\), if \(x^4\equiv y^4\pmod{31}\), then

\[
31\mid(x-y)(x+y)(x^2+y^2).
\]

The two linear factors have absolute value below \(31\), while \(x^2+y^2\not\equiv0\pmod{31}\) because \(-1\) is not a quadratic residue modulo \(31\equiv3\pmod4\).

Hence all residues are distinct modulo \(31\), and

\[
\boxed{31}.
\]

### IOQM tip / trick

Factor the difference

\[
x^4-y^4=(x-y)(x+y)(x^2+y^2).
\]

For primes \(p\equiv3\pmod4\), \(-1\) is not a quadratic residue.

### Verification status

**Fully verified.**

---

## Q78. Largest \(n<30\) giving a squarefree value

**Original source:** IOQM 2024

### Question

Find the largest positive integer \(n<30\) such that

\[
\frac{n^8+3n^4-4}{2}
\]

is not divisible by the square of any prime.

**Answer:** \(\boxed{20}\)

### Short solution

Factor

\[
n^8+3n^4-4
=(n-1)(n+1)(n^2+1)(n^2-2n+2)(n^2+2n+2).
\]

If \(n\) is odd, then after division by \(2\), the factor \((n-1)(n+1)/2\) is still divisible by \(4\). So every odd \(n>1\) fails.

For the even candidates above \(20\):

- \(22\): a factor \(5^2\) occurs;
- \(24\): a factor \(5^2\) occurs;
- \(26\): a factor \(5^2\) occurs;
- \(28\): a factor \(3^2\) occurs.

For \(n=20\),

\[
\frac{20^8+3\cdot20^4-4}{2}
=2\cdot3\cdot7\cdot13\cdot17\cdot19\cdot181\cdot401,
\]

which is squarefree.

Hence

\[
\boxed{20}.
\]

### IOQM tip / trick

When a polynomial value must be squarefree, factor the polynomial first. Parity and small congruences can then force prime-square divisors quickly.

### Verification status

**Fully verified.**

---

## Q79. Three-digit numbers with \(c=a+b\)

**Original source:** IOQM 2025

### Question

How many three-digit decimal numbers \(\overline{abc}\) satisfy

\[
a\ne0,\qquad c=a+b?
\]

**Answer:** \(\boxed{45}\)

### Short solution

For fixed \(a\in\{1,\dots,9\}\), we need

\[
0\le b\le9-a.
\]

So there are \(10-a\) choices for \(b\). Therefore

\[
\sum_{a=1}^{9}(10-a)
=9+8+\cdots+1
=\boxed{45}.
\]

### IOQM tip / trick

Digit equations often become lattice-point counts. Translate digit validity into inequalities first, then count by rows.

### Verification status

**Fully verified.**

---

## Q80. Five-digit numbers of the form \(\overline{abcab}\)

**Original source:** IOQM 2025

### Question

Consider five-digit positive integers of the form \(\overline{abcab}\) that are divisible by the two-digit number \(\overline{ab}\), but are not divisible by \(13\).

Find the largest possible sum of the digits.

**Answer:** \(\boxed{33}\)

### Short solution

Let

\[
D=\overline{ab}=10a+b.
\]

Then

\[
\overline{abcab}=1001D+100c.
\]

Thus

\[
D\mid\overline{abcab}
\iff
D\mid100c.
\]

Since

\[
1001=7\cdot11\cdot13,
\]

we also have

\[
\overline{abcab}\equiv100c\pmod{13}.
\]

Therefore \(c\ne0\).

Among the two-digit divisors of \(100c\), for \(c=1,\dots,9\), the choice maximizing

\[
2a+2b+c
\]

is

\[
D=75,\qquad c=9.
\]

This gives

\[
75975
\]

with digit sum

\[
7+5+9+7+5=\boxed{33}.
\]

### IOQM tip / trick

Repeated blocks often hide \(1001=10^3+1\). Write

\[
\overline{abcab}=1001\overline{ab}+100c.
\]

That exposes both divisibility conditions at once.

### Verification status

**Fully verified.**

---

## Q81. Permutations of \(223334444\)

**Original source:** IOQM 2025

### Question

Let \(N\) be the number of nine-digit integers obtained by permuting the digits of

\[
223334444
\]

such that at least one digit \(3\) lies to the right of the rightmost occurrence of \(4\).

Find the remainder when \(N\) is divided by \(100\).

**Answer:** \(\boxed{40}\)

### Short solution

First ignore the two \(2\)'s. Among the three \(3\)'s and four \(4\)'s, the condition says the rightmost symbol must be a \(3\).

Fix that final \(3\). Choose the positions of the other two \(3\)'s among the first six positions:

\[
\binom62=15.
\]

Now choose the positions of the two identical \(2\)'s among all nine positions:

\[
\binom92=36.
\]

Thus

\[
N=15\cdot36=540.
\]

Therefore

\[
N\equiv\boxed{40}\pmod{100}.
\]

### IOQM tip / trick

For a rightmost-occurrence condition in a multiset permutation, first solve the relative-order problem for the relevant symbols. Insert unrelated repeated symbols afterward.

### Verification status

**Fully verified.**

---

# Lot 16 answer key

| Q | Answer |
|---|---:|
| Q77 | \(31\) |
| Q78 | \(20\) |
| Q79 | \(45\) |
| Q80 | \(33\) |
| Q81 | \(40\) |
