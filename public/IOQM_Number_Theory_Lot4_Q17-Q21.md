# ALLEN IOQM Number Theory Marathon 2026 — Lot 4

**Questions:** Q17–Q21  
**Source video:** [Number Theory for IOQM | Live Marathon | ALLEN](https://www.youtube.com/live/0j8W6Q8lD8A)  
**Format:** Recovered/verified question + answer + short solution + IOQM tip/trick

> ## Numbering / reconstruction note
>
> The accessible video transcript ends at the start of video Q11. Video Q11 exactly matches Question 17 of the indexed ALLEN **IOQM Marathon — Number Theory** module, so the later lecture numbering is being continued by sequence anchoring:
>
> \[
> \text{video Q17–Q21} \longleftrightarrow \text{module Q23–Q27}.
> \]
>
> The mathematical content below is independently verified wherever an original contest source could be identified. The **video numbering itself remains source-sequence inferred**.
>
> Q18 is treated separately because the indexed module's mathematical typography is corrupted; its exact operand list is not reproduced.

---

## Q17. A number and its square end in the same four digits

**Original source identified:** 2014 AIME I, Problem 8

### Question

The positive integers \(N\) and \(N^2\) both end in the same sequence of four digits \(abcd\) when written in base \(10\), where \(a\neq0\).

Find the three-digit number \(abc\).

**Answer:** \(\boxed{937}\)

### Short solution

The condition says

\[
N^2\equiv N\pmod{10000}.
\]

Hence

\[
N(N-1)\equiv0\pmod{10000}.
\]

Now

\[
10000=16\cdot625.
\]

Since

\[
\gcd(N,N-1)=1,
\]

each prime-power factor must go entirely into one of the two consecutive factors. Thus

\[
N\equiv0\text{ or }1\pmod{16}
\]

and independently

\[
N\equiv0\text{ or }1\pmod{625}.
\]

The four CRT solutions modulo \(10000\) are

\[
0,\ 1,\ 625,\ 9376.
\]

The final four digits must form a genuine four-digit block, so \(a\neq0\). The only possibility is

\[
abcd=9376.
\]

Therefore

\[
abc=\boxed{937}.
\]

### IOQM tip / trick

The congruence

\[
x^2\equiv x\pmod m
\]

means \(x\) is an **idempotent modulo \(m\)**.

Rewrite it as

\[
x(x-1)\equiv0\pmod m.
\]

Because consecutive integers are coprime, prime-power factors of \(m\) can be distributed between \(x\) and \(x-1\). For composite moduli such as \(10^k\), split into powers of \(2\) and \(5\), then use CRT.

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** source-sequence inferred.

---

## Q18. Product/ratio of sums of cubes

### Partial reconstruction

The next ALLEN module problem is a numerical expression consisting of several factors of the form

\[
a^3+b^3
\]

in a numerator and denominator.

Unfortunately, the indexed copy of the module has corrupted mathematical typography in the actual operands, so reproducing the complete expression would require guessing digits.

**Answer listed by ALLEN:** \(\boxed{373}\)

### Lecture method recovered

The solution begins with the standard identity

\[
a^3+b^3=(a+b)(a^2-ab+b^2).
\]

The intended approach is therefore to **factor every sum of cubes first** and cancel matching factors rather than calculate the cubes directly.

### IOQM tip / trick

For large-looking products such as

\[
\frac{\prod(a_i^3+b_i^3)}
     {\prod(c_j^3+d_j^3)},
\]

do not expand the cubes.

Use

\[
a^3+b^3=(a+b)(a^2-ab+b^2)
\]

and search for telescoping/cancellation.

In olympiad arithmetic, a frightening product of large integers is often deliberately constructed so that factorization turns it into a small calculation.

### Verification status

**Partial reconstruction.**

- The position in the ALLEN sequence is established.
- The module answer is indexed as \(373\).
- The sum-of-cubes method is recoverable from the accompanying solution.
- The exact list of operands is **not reproduced** because the available mathematical typography is corrupted.
- Therefore \(373\) is retained as the **ALLEN-listed answer**, not claimed here as an independently recomputed answer.

---

## Q19. Three monkeys dividing bananas

**Original source identified:** 2004 AIME II, Problem 6

### Question

Three clever monkeys divide a pile of bananas.

The first monkey takes some bananas from the pile, keeps \(\frac34\) of what he takes, and divides the remainder equally between the other two monkeys.

The second monkey then takes some bananas from the remaining pile, keeps \(\frac14\) of what he takes, and divides the remainder equally between the other two.

Finally, the third monkey takes all the bananas remaining in the pile, keeps \(\frac1{12}\) of them, and divides the remainder equally between the other two.

All divisions result in whole numbers of bananas. At the end, the numbers of bananas held by the three monkeys are in the ratio

\[
3:2:1.
\]

Find the least possible original number of bananas.

**Answer:** \(\boxed{408}\)

### Short solution

Let the amounts taken by the first, second, and third monkeys be \(A,B,C\).

For the first split to be integral, \(A\) must be a multiple of \(8\).  
For the second split to be integral, \(B\) must be a multiple of \(8\).  
For the third split to be integral, \(C\) must be a multiple of \(24\).

After all transfers, the ratio condition yields the proportional solution

\[
A:B:C=22:26:54.
\]

So write

\[
A=22k,\qquad B=26k,\qquad C=54k.
\]

Now impose the divisibility conditions:

\[
8\mid22k,\qquad 8\mid26k,\qquad24\mid54k.
\]

These force

\[
4\mid k.
\]

The smallest choice is therefore

\[
k=4.
\]

Hence

\[
A+B+C
=
22(4)+26(4)+54(4)
=
88+104+216
=
\boxed{408}.
\]

### IOQM tip / trick

When fractional sharing must always produce integers, **absorb the denominators immediately**.

For example:

- keeping \(\frac34\) and splitting the remaining \(\frac14\) between two people forces the amount to be a multiple of \(8\);
- keeping \(\frac1{12}\) and splitting the \(\frac{11}{12}\) equally forces a multiple of \(24\).

This converts a word problem into integer linear constraints.

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** source-sequence inferred.

---

## Q20. Difference of consecutive cubes and another perfect square

**Original source identified:** 2008 AIME II, Problem 15

### Question

Find the largest integer \(n\) such that

1. \(n^2\) can be expressed as the difference of two consecutive positive cubes, and
2. \(2n+79\) is a perfect square.

**Answer:** \(\boxed{181}\)

### Short solution

Suppose

\[
n^2=(m+1)^3-m^3.
\]

Then

\[
n^2=3m^2+3m+1.
\]

Multiply by \(4\) and rearrange:

\[
4n^2-1=3(2m+1)^2.
\]

Therefore

\[
(2n-1)(2n+1)=3(2m+1)^2.
\]

The two factors \(2n-1\) and \(2n+1\) are coprime odd integers.

This forces the viable arrangement

\[
2n-1=b^2.
\]

The second condition gives

\[
2n+79=a^2.
\]

Subtracting,

\[
a^2-b^2=80.
\]

Hence

\[
(a-b)(a+b)=80.
\]

The same-parity positive factor pairs are

\[
(2,40),\quad(4,20),\quad(8,10).
\]

These give \(b=19,8,1\), respectively. Since \(b^2=2n-1\) is odd, take an odd \(b\). The largest resulting \(n\) comes from

\[
b=19.
\]

Thus

\[
2n-1=19^2=361,
\]

so

\[
n=\boxed{181}.
\]

Indeed,

\[
181^2=105^3-104^3
\]

and

\[
2(181)+79=441=21^2.
\]

### IOQM tip / trick

For consecutive cubes,

\[
(m+1)^3-m^3=3m^2+3m+1.
\]

A useful transformation is

\[
4n^2-1=(2n-1)(2n+1),
\]

which creates two neighboring odd factors with gcd \(1\).

When a second condition also says something is a square, try to turn the two square conditions into a **difference of squares**:

\[
a^2-b^2=(a-b)(a+b).
\]

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** source-sequence inferred.

---

## Q21. Decimal digits rearranged in base nine

**Original source identified:** 2022 AIME I, Problem 2

### Question

Find the three-digit positive integer \(\overline{abc}\) whose representation in base \(9\) is

\[
\overline{bca}_9,
\]

where \(a,b,c\) are not necessarily distinct digits.

**Answer:** \(\boxed{227}\)

### Short solution

In base \(10\),

\[
\overline{abc}=100a+10b+c.
\]

The base-\(9\) representation has value

\[
\overline{bca}_9=81b+9c+a.
\]

Therefore

\[
100a+10b+c=81b+9c+a,
\]

so

\[
99a=71b+8c.
\]

Because \(a,b,c\) are base-\(9\) digits,

\[
0\le a,b,c\le8,
\]

with \(a,b\neq0\).

Reduce the equation modulo \(8\):

\[
99a\equiv71b\pmod8.
\]

Thus

\[
3a\equiv -b\pmod8,
\]

or

\[
b\equiv-3a\pmod8.
\]

Checking the eight possible nonzero digit values for \(a\), the only choice that also gives a valid digit \(0\le c\le8\) is

\[
a=2,\qquad b=2.
\]

Then

\[
99(2)=71(2)+8c,
\]

so

\[
198=142+8c,
\]

giving

\[
c=7.
\]

Therefore

\[
\boxed{227}.
\]

Check:

\[
(272)_9
=
2\cdot81+7\cdot9+2
=
162+63+2
=
227.
\]

### IOQM tip / trick

For any base problem, immediately convert positional notation:

\[
(xyz)_b=xb^2+yb+z.
\]

Then preserve the **digit constraints**. A digit appearing in base \(9\) must lie in

\[
\{0,1,\dots,8\}.
\]

A congruence often reduces the small digit search to only one or two candidates.

### Verification status

**Problem and answer fully verified.**  
**Video numbering:** source-sequence inferred.

---

# Lot 4 answer key

| Video question (inferred) | ALLEN module question | Original source / status | Answer |
|---|---:|---|---:|
| Q17 | 23 | 2014 AIME I #8 | \(937\) |
| Q18 | 24 | Exact expression corrupted in indexed module | \(373\) — ALLEN-listed |
| Q19 | 25 | 2004 AIME II #6 | \(408\) |
| Q20 | 26 | 2008 AIME II #15 | \(181\) |
| Q21 | 27 | 2022 AIME I #2 | \(227\) |

---

# Accuracy notes

1. **Q17, Q19, Q20, Q21:** statements and answers are independently recoverable from their original published contest problems.
2. **Q18:** the indexed module preserves the problem's position, answer, and sum-of-cubes solution method, but corrupts the actual numerical expression. It is therefore intentionally left as a partial reconstruction instead of guessing the missing digits.
3. **Video numbering Q17–Q21:** source-sequence inferred from the established mapping of video Q11 to ALLEN module Q17.
4. No corrupted mathematical expression has been silently “repaired” without independent evidence.
