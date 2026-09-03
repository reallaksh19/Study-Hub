# ALLEN IOQM Number Theory Marathon 2026 — Lot 3B

**Questions:** Q12–Q16  
**Source video:** [Number Theory for IOQM | Live Marathon | ALLEN](https://www.youtube.com/live/0j8W6Q8lD8A)  
**Format:** Exact/source-recovered problem + verified answer + short solution + IOQM tip/trick

> ## Numbering / reconstruction note
>
> The accessible video transcript cuts off as video Q11 begins. However, that Q11 is an exact match for **Question 17** in ALLEN's indexed **IOQM Marathon — Number Theory** module. The five problems immediately following it in that module are Questions 18–22.
>
> Accordingly, this lot treats module Questions **18–22** as the **inferred next lecture sequence Q12–Q16**.
>
> Each problem below has also been independently matched to its original contest source, so the **problem statements and answers are verified**. What remains inferred is only their Q12–Q16 numbering in the streamed lecture.

---

## Q12. Three-digit numbers reversible as multiples of 4

**Original source identified:** 2012 AIME I, Problem 1

### Question

Find the number of positive integers with three not necessarily distinct digits, \(abc\), with

\[
a\ne 0,\qquad c\ne 0,
\]

such that both \(abc\) and \(cba\) are multiples of \(4\).

**Answer:** \(\boxed{40}\)

### Short solution

A number is divisible by \(4\) exactly when its last two digits form a multiple of \(4\).

Therefore we need

\[
10b+c\equiv 0\pmod 4
\]

and

\[
10b+a\equiv 0\pmod 4.
\]

Since

\[
10b\equiv 2b\pmod4,
\]

we split according to the parity of \(b\).

### Case 1: \(b\) is even

Then \(2b\equiv0\pmod4\), so

\[
a,c\equiv0\pmod4.
\]

Because \(a,c\) are nonzero digits,

\[
a,c\in\{4,8\}.
\]

There are

\[
5\cdot2\cdot2=20
\]

such numbers, since \(b\) has \(5\) even digit choices.

### Case 2: \(b\) is odd

Then \(2b\equiv2\pmod4\), so

\[
a,c\equiv2\pmod4.
\]

Thus

\[
a,c\in\{2,6\}.
\]

Again there are

\[
5\cdot2\cdot2=20
\]

possibilities.

Hence the total is

\[
20+20=\boxed{40}.
\]

### IOQM tip / trick

For divisibility by \(4\), **ignore every digit except the last two**.

When the number and its reversal must both be divisible by \(4\), write the two relevant endings:

\[
bc=10b+c,\qquad ba=10b+a.
\]

Then reduce modulo \(4\) and split by the parity of the common tens digit \(b\).

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** source-sequence inferred.

---

## Q13. Greatest prime factors of \(n\) and \(n+48\)

**Original source identified:** 2005 AMC 10A, Problem 24

### Question

For each positive integer \(n>1\), let \(P(n)\) denote the greatest prime factor of \(n\).

For how many positive integers \(n\) is it true that both

\[
P(n)=\sqrt n
\]

and

\[
P(n+48)=\sqrt{n+48}?
\]

**Answer:** \(\boxed{1}\)

### Short solution

If

\[
P(n)=\sqrt n,
\]

then \(\sqrt n\) itself is prime and

\[
n=p^2
\]

for some prime \(p\).

Similarly,

\[
n+48=q^2
\]

for some prime \(q\).

Thus

\[
q^2-p^2=48,
\]

so

\[
(q-p)(q+p)=48.
\]

Since \(p\) and \(q\) must be odd primes in the viable case, both factors are even.

Checking the even factor pairs of \(48\),

\[
(q-p,q+p)=(2,24)
\]

gives

\[
q=13,\qquad p=11.
\]

Hence

\[
n=11^2=121.
\]

The other factor pairs do not produce two primes.

Therefore exactly one positive integer \(n\) works:

\[
\boxed{1}.
\]

### IOQM tip / trick

A condition such as

\[
P(n)=\sqrt n
\]

is much stronger than it first appears.

Because \(P(n)\) is prime, it forces

\[
n=p^2
\]

for a prime \(p\).

Then two greatest-prime-factor conditions become a simple **difference of squares**:

\[
q^2-p^2=(q-p)(q+p).
\]

Whenever a fixed difference separates two squares, factor before trying values.

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** source-sequence inferred.

---

## Q14. Special three-term arithmetic sequences

**Original source identified:** 2021 AIME I, Problem 5

### Question

Call a three-term strictly increasing arithmetic sequence of integers **special** if the sum of the squares of the three terms equals the product of the middle term and the square of the common difference.

Find the sum of the third terms of all special sequences.

**Answer:** \(\boxed{31}\)

### Short solution

Write the three terms as

\[
a-d,\quad a,\quad a+d,
\]

where \(d>0\).

The condition gives

\[
(a-d)^2+a^2+(a+d)^2=ad^2.
\]

Hence

\[
3a^2+2d^2=ad^2,
\]

or

\[
3a^2-d^2a+2d^2=0.
\]

Treat this as a quadratic in \(a\). Its discriminant must be a square:

\[
d^4-24d^2=d^2(d^2-24).
\]

Thus

\[
d^2-24=x^2
\]

for some nonnegative integer \(x\). Therefore

\[
(d-x)(d+x)=24.
\]

The two factors have the same parity, so the positive possibilities are

\[
(d-x,d+x)=(4,6)
\]

or

\[
(2,12).
\]

Hence

\[
d=5\quad\text{or}\quad d=7.
\]

These yield the special sequences

\[
0,5,10
\]

and

\[
7,14,21.
\]

The requested sum of the third terms is

\[
10+21=\boxed{31}.
\]

### IOQM tip / trick

When an integer parameter appears inside a quadratic equation, ask:

> **What must the discriminant look like for the solution to remain integral?**

Here the discriminant condition reduces the problem to

\[
d^2-x^2=24,
\]

and then to the factorization

\[
(d-x)(d+x)=24.
\]

This **quadratic → perfect-square discriminant → difference of squares** pipeline is extremely useful in olympiad Diophantine problems.

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** source-sequence inferred.

---

## Q15. Smallest exponent making \(2013^n\) end in \(001\)

**Original source identified:** PUMaC 2013, Number Theory, Problem 2

### Question

What is the smallest positive integer \(n\) such that

\[
2013^n
\]

ends in \(001\); that is,

\[
2013^n\equiv1\pmod{1000}?
\]

**Answer:** \(\boxed{100}\)

### Short solution

We need the multiplicative order of \(2013\) modulo \(1000\).

Because

\[
2013\equiv13\pmod{1000},
\]

the condition is

\[
13^n\equiv1\pmod{1000}.
\]

An efficient verification is:

\[
13^{100}\equiv1\pmod{1000}.
\]

So the order divides \(100\).

Now check the two maximal proper-divisor branches:

\[
13^{50}\not\equiv1\pmod{1000},
\]

and

\[
13^{20}\not\equiv1\pmod{1000}.
\]

Every proper divisor of \(100\),

\[
1,2,4,5,10,20,25,50,
\]

divides either \(20\) or \(50\). Therefore none of them can be the order.

Hence the least possible exponent is

\[
\boxed{100}.
\]

### CRT viewpoint

Since

\[
1000=8\cdot125,
\]

we can equivalently solve

\[
13^n\equiv1\pmod8
\]

and

\[
13^n\equiv1\pmod{125}.
\]

The order modulo \(8\) is \(2\), while the order modulo \(125\) is \(100\), so the order modulo \(1000\) is

\[
\operatorname{lcm}(2,100)=100.
\]

### IOQM tip / trick

“Last three digits” means **modulo \(1000\)**.

For exponent problems modulo \(10^k\), immediately split

\[
10^k=2^k5^k
\]

and use the Chinese Remainder Theorem.

Also distinguish:

- finding *some* exponent using Euler's theorem, and
- finding the **smallest** exponent, which means finding a multiplicative order.

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** source-sequence inferred.

---

## Q16. \(k\)-nice divisor counts

**Original source identified:** 2016 AIME II, Problem 11

### Question

For positive integers \(N\) and \(k\), define \(N\) to be **\(k\)-nice** if there exists a positive integer \(a\) such that

\[
a^k
\]

has exactly \(N\) positive divisors.

Find the number of positive integers less than \(1000\) that are neither \(7\)-nice nor \(8\)-nice.

**Answer:** \(\boxed{749}\)

### Short solution

Suppose

\[
a=p_1^{e_1}p_2^{e_2}\cdots p_r^{e_r}.
\]

Then

\[
a^k=p_1^{ke_1}p_2^{ke_2}\cdots p_r^{ke_r},
\]

so

\[
\tau(a^k)
=
(ke_1+1)(ke_2+1)\cdots(ke_r+1).
\]

Every factor is congruent to \(1\pmod k\). Therefore

\[
\tau(a^k)\equiv1\pmod k.
\]

So a necessary condition for \(N\) to be \(k\)-nice is

\[
N\equiv1\pmod k.
\]

It is also sufficient: if

\[
N\equiv1\pmod k,
\]

then

\[
e=\frac{N-1}{k}
\]

is a nonnegative integer, and choosing

\[
a=2^e
\]

gives

\[
a^k=2^{N-1},
\]

which has exactly \(N\) positive divisors.

Thus

\[
N\text{ is \(k\)-nice}
\iff
N\equiv1\pmod k.
\]

So:

- \(7\)-nice numbers below \(1000\): \(143\),
- \(8\)-nice numbers below \(1000\): \(125\),
- both: numbers congruent to \(1\pmod{56}\), of which there are \(18\).

By inclusion-exclusion, the number that are \(7\)-nice or \(8\)-nice is

\[
143+125-18=250.
\]

There are \(999\) positive integers below \(1000\), so the number that are neither is

\[
999-250=\boxed{749}.
\]

### IOQM tip / trick

For

\[
a=\prod p_i^{e_i},
\]

memorize the divisor-count formula

\[
\tau(a)=\prod(e_i+1).
\]

For a perfect \(k\)th power, every exponent is a multiple of \(k\). Therefore every divisor-count factor has the form

\[
ke_i+1\equiv1\pmod k.
\]

This turns what looks like a divisor-function existence problem into a simple congruence classification.

After that, use **inclusion-exclusion**.

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** source-sequence inferred.

---

# Lot 3B answer key

| Video question (inferred) | ALLEN module question | Original source | Answer |
|---|---:|---|---:|
| Q12 | 18 | 2012 AIME I #1 | \(40\) |
| Q13 | 19 | 2005 AMC 10A #24 | \(1\) |
| Q14 | 20 | 2021 AIME I #5 | \(31\) |
| Q15 | 21 | PUMaC 2013 NT #2 | \(100\) |
| Q16 | 22 | 2016 AIME II #11 | \(749\) |

---

# Accuracy notes

1. **Statements and answers:** independently verified from the original contest problems.
2. **ALLEN module order:** verified as Questions 18–22 immediately following the module's Question 17, which is the exact repeating-decimal problem used as video Q11.
3. **Video numbering Q12–Q16:** inferred from that sequence because the accessible auto-transcript ends at the start of Q11.
4. No missing transcript text has been invented; the uncertainty is isolated to the lecture numbering/order, not to the mathematics of the five problems.
