# ALLEN IOQM Number Theory Marathon 2026 — Final Verified Continuation

**Questions:** Q82–Q83  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A  
**Continuation source:** IOQM 2012–2025 Number Theory PYQ compilation  
**Format:** Recovered question + verified answer + short solution + reusable IOQM tip/trick

> ## Important boundary correction
>
> The continuation source used for Q62 onward contains **83 Number Theory questions in total**. It ends at Q83.
>
> Therefore Q82 and Q83 can be recovered and verified from this source, but there are **no source questions Q84–Q90** in this compilation.
>
> The mathematical content below is fully verified. The exact video numbering remains continuation-source inferred unless directly confirmed on-screen.

---

## Q82. Period of \(n^n\pmod 7\)

**Original source:** IOQM 2025

### Question

Let \(f\) be the function defined for every positive integer \(n\) by

\[
f(n)=\text{the remainder when }n^n\text{ is divided by }7.
\]

Find the smallest positive integer \(T\) such that

\[
f(n+T)=f(n)
\]

for every positive integer \(n\).

**Answer:** \(\boxed{42}\)

### Short solution

First observe that

\[
f(n)=0
\]

exactly when

\[
7\mid n.
\]

Therefore any period \(T\) must preserve the multiples of \(7\), so

\[
7\mid T.
\]

Now take \(n=3\).

Since \(7\mid T\),

\[
3+T\equiv3\pmod7.
\]

Thus periodicity requires

\[
3^{3+T}\equiv3^3\pmod7,
\]

so

\[
3^T\equiv1\pmod7.
\]

The multiplicative order of \(3\) modulo \(7\) is \(6\). Hence

\[
6\mid T.
\]

Therefore

\[
\operatorname{lcm}(6,7)=42\mid T.
\]

It remains to check that \(42\) works.

Because

\[
n+42\equiv n\pmod7
\]

and, when \(7\nmid n\),

\[
n^6\equiv1\pmod7
\]

by Fermat's theorem, we have

\[
n^{n+42}
=
n^n(n^6)^7
\equiv n^n\pmod7.
\]

For multiples of \(7\), both sides are \(0\).

Hence the smallest period is

\[
\boxed{42}.
\]

### IOQM tip / trick

For a function such as

\[
f(n)=n^n\bmod p,
\]

two periodicities interact:

1. the **base** depends on \(n\bmod p\);
2. the **exponent** depends on \(n\bmod(p-1)\) when the base is nonzero modulo \(p\).

That strongly suggests a period involving

\[
\operatorname{lcm}(p,p-1).
\]

But always prove minimality rather than merely finding a working period.

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** continuation-source inferred.

---

## Q83. Counting triples involving two LCMs

**Original source:** IOQM 2025

### Question

Find the number of ordered triples

\[
(a,b,c)
\]

of positive integers satisfying

\[
1\le a,b,c\le50
\]

and

\[
\frac{\operatorname{lcm}(a,c)+\operatorname{lcm}(b,c)}
{a+b}
=
\frac{26c}{27}.
\]

**Answer:** \(\boxed{40}\)

### Short solution

Let

\[
g_1=\gcd(a,c),
\qquad
g_2=\gcd(b,c).
\]

Then

\[
\operatorname{lcm}(a,c)=\frac{ac}{g_1},
\qquad
\operatorname{lcm}(b,c)=\frac{bc}{g_2}.
\]

Cancel \(c\) from the equation:

\[
27\left(\frac a{g_1}+\frac b{g_2}\right)
=
26(a+b).
\]

Rearrange:

\[
a\left(\frac{27}{g_1}-26\right)
+
b\left(\frac{27}{g_2}-26\right)
=0.
\]

For \(g=1\),

\[
\frac{27}{g}-26=1>0,
\]

while for every \(g\ge2\),

\[
\frac{27}{g}-26<0.
\]

Therefore exactly one of \(g_1,g_2\) equals \(1\).

Assume first

\[
g_1=1.
\]

Then

\[
a=b\left(26-\frac{27}{g_2}\right).
\]

Because \(g_2\mid b\), write

\[
b=g_2y.
\]

Thus

\[
a=(26g_2-27)y.
\]

Since

\[
a\le50
\]

and \(g_2\ge2\), the only possibility is

\[
g_2=2.
\]

Hence

\[
a=25y,\qquad b=2y.
\]

If \(y=2\), then \(a=50\), and the conditions

\[
\gcd(50,c)=1,\qquad \gcd(4,c)=2
\]

are incompatible: the first requires \(c\) odd while the second requires \(c\) even.

Therefore

\[
y=1,
\]

so

\[
(a,b)=(25,2).
\]

We need

\[
\gcd(25,c)=1,
\qquad
\gcd(2,c)=2.
\]

Thus \(c\) must be even but not divisible by \(5\).

Among

\[
1\le c\le50,
\]

there are \(25\) even numbers, of which \(5\) are multiples of \(10\). Therefore

\[
25-5=20
\]

values of \(c\) work.

By symmetry, swapping \(a\) and \(b\) gives another \(20\) triples.

Hence the total is

\[
20+20=\boxed{40}.
\]

### IOQM tip / trick

When LCMs share a common variable, replace them using

\[
\operatorname{lcm}(x,c)
=
\frac{xc}{\gcd(x,c)}.
\]

Then classify the possible gcd values.

Here the coefficient

\[
\frac{27}{g}-26
\]

changes sign immediately between \(g=1\) and \(g\ge2\), which forces one gcd to equal \(1\) and makes the entire count manageable.

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** continuation-source inferred.

---

# Final answer key

| Question | Answer |
|---|---:|
| Q82 | \(42\) |
| Q83 | \(40\) |

---

# Q84–Q90 status

The verified continuation source ends at **Q83**.

No Q84–Q90 questions appear in that source. Assigning unrelated problems to those numbers would break the sequence-verification standard used throughout this extraction.

To continue beyond Q83, a new direct anchor is required, for example:

- an on-screen screenshot showing Q84;
- a video timestamp for Q84;
- the official marathon slide/PDF containing the next section;
- a transcript segment that includes Q84.

Until such an anchor is available, Q84–Q90 should remain **unassigned** rather than fabricated.
