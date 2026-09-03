# ALLEN IOQM Number Theory Marathon 2026 — Lot 6

**Questions:** Q27–Q31  
**Source video:** https://www.youtube.com/live/0j8W6Q8lD8A  
**Sequence anchor:** Q22 is directly visible at approximately 2:33:52.  
**Format:** Recovered question + verified answer + short solution + reusable IOQM tip/trick

> ## Sequence note
>
> Q27 and Q28 are the two problems immediately following Q26 in the same Western PA ARML advanced-number-theory set used for Q22–Q26.
>
> After that set ends, the lecture returns to the ALLEN Number Theory module's base-number section. Q29–Q31 align with the next three base problems:
>
> - Q29: the 2020 AIME II digit-sum/base problem;
> - Q30: hexadecimal representations among the first 1000 integers;
> - Q31: the 2012 AMC 12B consecutive-bases equation.
>
> All five answers below have been independently verified.

---

## Q27. Totient and divisor-sum divisibility

### Question

For a positive integer \(n\), let

\[
\phi(n)
\]

be Euler's totient function and let

\[
\sigma(n)
\]

be the sum of the positive divisors of \(n\).

Find the sum of all positive even integers \(n\) such that

\[
\frac{\sigma(n)n^5-2}{\phi(n)}
\]

is an integer.

**Answer:** \(\boxed{416}\)

### Short solution

We require

\[
\phi(n)\mid \sigma(n)n^5-2.
\]

Because \(n\) is even, the first term \(\sigma(n)n^5\) is divisible by \(32\). Hence

\[
\sigma(n)n^5-2\equiv -2\pmod{4},
\]

so

\[
v_2\!\left(\sigma(n)n^5-2\right)=1.
\]

Therefore

\[
v_2(\phi(n))\le1.
\]

Write

\[
n=2^a m,
\]

where \(m\) is odd.

Since

\[
\phi(n)=2^{a-1}\prod_{p^e\parallel m}p^{e-1}(p-1),
\]

every odd prime divisor \(p\) contributes at least one factor \(2\) through \(p-1\).

Thus the condition \(v_2(\phi(n))\le1\) forces one of the following:

1. \(n=2\);
2. \(n=4\);
3. \(n=2p^b\), where \(p\equiv3\pmod4\) is an odd prime.

Now if \(b\ge2\), then \(p\mid\phi(n)\). But

\[
\sigma(n)n^5-2\equiv -2\pmod p,
\]

which is impossible for odd \(p\).

Hence

\[
b=1,
\]

so

\[
n=2p.
\]

For \(n=2p\),

\[
\phi(n)=p-1,
\]

\[
\sigma(n)=3(p+1),
\]

and

\[
n^5=32p^5.
\]

Thus

\[
\sigma(n)n^5-2
=
96(p+1)p^5-2.
\]

Modulo \(p-1\), we have \(p\equiv1\), so

\[
96(p+1)p^5-2
\equiv
96(2)-2
=
190.
\]

Therefore

\[
p-1\mid190.
\]

The divisors of \(190\) that produce primes \(p=d+1\equiv3\pmod4\) give

\[
p=3,\ 11,\ 191.
\]

Thus

\[
n=6,\ 22,\ 382.
\]

Including \(n=2,4\), all solutions are

\[
2,4,6,22,382.
\]

Their sum is

\[
2+4+6+22+382
=
\boxed{416}.
\]

### IOQM tip / trick

When a divisibility condition has the form

\[
\phi(n)\mid A-2
\]

and \(n\) is even, inspect the **2-adic valuation** first.

Here \(n^5\) makes \(A=\sigma(n)n^5\) highly divisible by \(2\), so

\[
A-2
\]

has exactly one factor of \(2\). That immediately forces

\[
v_2(\phi(n))\le1,
\]

which almost completely determines the prime-factor structure of \(n\).

This is much faster than testing arbitrary even integers.

### Verification status

**Fully verified.**

---

## Q28. Reciprocal sum involving reduced residues

### Question

For a positive integer \(n\), let \(f(n)\) be the sum of all positive integers

\[
k\le n
\]

such that

\[
\gcd(k,n)=1.
\]

Let \(S\) be the sum of

\[
\frac1{f(m)}
\]

over all positive integers \(m\) that

- are divisible by \(2,3,\) and \(5\), and
- have no prime factors other than \(2,3,\) and \(5\).

Write

\[
S=\frac pq
\]

in lowest terms.

Find

\[
p+q.
\]

**Answer:** \(\boxed{389}\)

### Short solution

For \(n>1\), the reduced residues modulo \(n\) pair as

\[
k\longleftrightarrow n-k.
\]

Each pair sums to \(n\), so

\[
f(n)=\frac{n\phi(n)}2.
\]

Now write

\[
m=2^a3^b5^c,
\qquad
a,b,c\ge1.
\]

We have

\[
\phi(m)
=
2^{a-1}\cdot 2\cdot3^{b-1}\cdot4\cdot5^{c-1}
=
2^{a+2}3^{b-1}5^{c-1}.
\]

Hence

\[
f(m)
=
\frac{m\phi(m)}2
=
2^{2a+1}3^{2b-1}5^{2c-1}.
\]

Therefore

\[
S
=
\sum_{a,b,c\ge1}
\frac1{2^{2a+1}3^{2b-1}5^{2c-1}}.
\]

The sum separates into three geometric series:

\[
S=
\left(\sum_{a\ge1}\frac1{2^{2a+1}}\right)
\left(\sum_{b\ge1}\frac1{3^{2b-1}}\right)
\left(\sum_{c\ge1}\frac1{5^{2c-1}}\right).
\]

Compute:

\[
\sum_{a\ge1}\frac1{2^{2a+1}}
=
\frac{1/8}{1-1/4}
=
\frac16,
\]

\[
\sum_{b\ge1}\frac1{3^{2b-1}}
=
\frac{1/3}{1-1/9}
=
\frac38,
\]

and

\[
\sum_{c\ge1}\frac1{5^{2c-1}}
=
\frac{1/5}{1-1/25}
=
\frac5{24}.
\]

Thus

\[
S
=
\frac16\cdot\frac38\cdot\frac5{24}
=
\frac5{384}.
\]

Therefore

\[
p+q=5+384=\boxed{389}.
\]

### IOQM tip / trick

Two reusable ideas occur here.

First, for \(n>1\),

\[
\sum_{\substack{1\le k\le n\\(k,n)=1}}k
=
\frac{n\phi(n)}2.
\]

Second, whenever the allowed integers have independent prime exponents,

\[
m=p^aq^br^c,
\]

a sum over all such \(m\) often factorizes into a **product of geometric series**.

Look for multiplicativity before trying to add terms one at a time.

### Verification status

**Fully verified.**

---

## Q29. Nested digit sums in bases \(4,8,16\)

**Original source identified:** 2020 AIME II, Problem 5

### Question

For each positive integer \(n\), let \(f(n)\) be the sum of the digits in the base-\(4\) representation of \(n\), and let \(g(n)\) be the sum of the digits in the base-\(8\) representation of \(f(n)\).

For example,

\[
f(2020)=f(133210_4)=10=12_8,
\]

and

\[
g(2020)=1+2=3.
\]

Let \(N\) be the least value of \(n\) such that the base-\(16\) representation of \(g(n)\) cannot be written using only the digits \(0,1,\dots,9\).

Find the remainder when \(N\) is divided by \(1000\).

**Answer:** \(\boxed{151}\)

### Short solution

A base-\(16\) representation first requires a letter digit \(A,\dots,F\) when the number reaches

\[
10.
\]

So we need the least \(n\) such that

\[
g(n)\ge10.
\]

Now \(g(n)\) is the base-\(8\) digit sum of \(f(n)\).

The smallest positive integer whose base-\(8\) digit sum is \(10\) is

\[
37_8=31.
\]

Therefore we need the smallest \(n\) whose base-\(4\) digit sum is

\[
31.
\]

Base-\(4\) digits are at most \(3\). To obtain digit sum \(31\) with the smallest possible value, use

\[
N=13333333333_4,
\]

namely one leading \(1\) followed by ten \(3\)'s.

Then

\[
N
=
4^{10}+3(1+4+\cdots+4^9).
\]

Since

\[
3(1+4+\cdots+4^9)=4^{10}-1,
\]

we get

\[
N=2\cdot4^{10}-1.
\]

Now

\[
4^{10}=2^{20}=1,048,576,
\]

so

\[
N=2,097,151.
\]

Therefore

\[
N\equiv\boxed{151}\pmod{1000}.
\]

### IOQM tip / trick

For nested digit-sum problems, work **backwards**.

Here:

1. first determine the smallest forbidden hexadecimal value;
2. then find the smallest base-\(8\) number having the required digit sum;
3. then find the smallest base-\(4\) number with that digit sum.

To minimize a number with a prescribed digit sum in base \(b\), pack as many \(b-1\) digits as possible into the **rightmost positions**.

### Verification status

**Problem and answer fully verified from 2020 AIME II #5.**

---

## Q30. Hexadecimal integers using only decimal digits

### Question

Hexadecimal numbers use the ordinary digits \(0\) through \(9\), together with the letters \(A\) through \(F\) for the values \(10\) through \(15\).

Among the first \(1000\) positive integers, suppose there are \(n\) integers whose hexadecimal representation contains only the ordinary numeric digits \(0\) through \(9\).

Find the sum of the decimal digits of \(n\).

**Answer:** \(\boxed{21}\)

### Short solution

Count valid hexadecimal representations.

### One hexadecimal digit

The possibilities are

\[
1,2,\dots,9,
\]

so there are

\[
9.
\]

### Two hexadecimal digits

The first digit has \(9\) choices and the second has \(10\) choices:

\[
9\cdot10=90.
\]

### Three hexadecimal digits

All hexadecimal numbers from

\[
100_{16}
\]

through

\[
399_{16}
\]

are below \(1000\) in decimal, since

\[
399_{16}
=
3\cdot256+9\cdot16+9
=
921.
\]

Their first digit has \(3\) choices, and each later digit has \(10\) choices:

\[
3\cdot10\cdot10=300.
\]

No valid numeric-digit-only hexadecimal number beginning with \(4\) is below \(1000\), because

\[
400_{16}=1024.
\]

Hence

\[
n=9+90+300=399.
\]

The sum of its digits is

\[
3+9+9=\boxed{21}.
\]

### IOQM tip / trick

When counting base-\(b\) representations under a decimal bound, convert the **place-value thresholds**, not every candidate.

Here,

\[
400_{16}=1024>1000,
\]

so only first hexadecimal digits \(1,2,3\) can occur in a three-digit valid representation.

Then the count becomes a simple product of digit choices.

### Verification status

**Fully verified.**

---

## Q31. Consecutive number bases

**Original source identified:** 2012 AMC 12B, Problem 11

### Question

In the equation

\[
132_A+43_B=69_{A+B},
\]

the positive integers \(A\) and \(B\) are consecutive, and the subscripts represent number bases.

Find

\[
A+B.
\]

**Answer:** \(\boxed{13}\)

### Short solution

Convert each numeral to base \(10\):

\[
132_A=A^2+3A+2,
\]

\[
43_B=4B+3,
\]

and

\[
69_{A+B}=6(A+B)+9.
\]

Thus

\[
A^2+3A+2+4B+3
=
6A+6B+9.
\]

So

\[
A^2-3A-2B-4=0.
\]

Because \(A,B\) are consecutive, there are two cases.

### Case 1: \(B=A-1\)

Then

\[
A^2-3A-2(A-1)-4=0,
\]

giving

\[
A^2-5A-2=0,
\]

which has no integer solution.

### Case 2: \(B=A+1\)

Then

\[
A^2-3A-2(A+1)-4=0,
\]

so

\[
A^2-5A-6=0.
\]

Hence

\[
(A-6)(A+1)=0,
\]

and the positive solution is

\[
A=6,\qquad B=7.
\]

Therefore

\[
A+B=\boxed{13}.
\]

### IOQM tip / trick

In any base problem, immediately expand positional notation:

\[
xyz_b=xb^2+yb+z.
\]

Then enforce **digit validity**. Here the digit \(9\) appears in base \(A+B\), so necessarily

\[
A+B\ge10.
\]

The consecutive-base condition then reduces the algebra to only two cases.

### Verification status

**Problem and answer fully verified from 2012 AMC 12B #11.**

---

# Lot 6 answer key

| Question | Answer |
|---|---:|
| Q27 | \(416\) |
| Q28 | \(389\) |
| Q29 | \(151\) |
| Q30 | \(21\) |
| Q31 | \(13\) |

---

# Accuracy notes

1. **Q27–Q28:** exact statements are preserved in the Western PA ARML advanced-problem sheet that supplied Q22–Q26.
2. **Q27:** the full solution set is
   \[
   \{2,4,6,22,382\}.
   \]
3. **Q28:** the reciprocal sum is
   \[
   \frac5{384}.
   \]
4. **Q29:** independently identified as 2020 AIME II Problem 5.
5. **Q30:** the count is \(399\), so the requested digit sum is \(21\).
6. **Q31:** independently identified as 2012 AMC 12B Problem 11.
