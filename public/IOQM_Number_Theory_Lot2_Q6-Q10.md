# ALLEN IOQM Number Theory Marathon 2026 — Lot 2

**Questions:** Q6–Q10  
**Source video:** [Number Theory for IOQM | Live Marathon | ALLEN](https://www.youtube.com/live/0j8W6Q8lD8A)  
**Format:** Reconstructed question + verified answer + short solution + IOQM tip/trick

> **Reconstruction note:** These questions are reconstructed from the lecture/transcript discussion rather than copied verbatim from the on-screen slides. Where the transcript wording is incomplete or inconsistent, the mathematically consistent reconstruction is stated explicitly.

---

## Q6. Pairwise sums of five integers

Five positive integers

\[
a<b<c<d<e
\]

have their ten pairwise sums, in ascending order,

\[
165,\ 170,\ 175,\ 177,\ 182,\ 187,\ 190,\ 195,\ 200,\ 207.
\]

Find \(c\).

**Answer:** \(\boxed{90}\)

### Short solution

Every one of \(a,b,c,d,e\) appears in exactly four of the ten pairwise sums. Therefore,

\[
4(a+b+c+d+e)
=
165+170+175+177+182+187+190+195+200+207.
\]

The right-hand side is

\[
1848,
\]

so

\[
a+b+c+d+e=462.
\]

Because the smallest pairwise sum is

\[
a+b=165
\]

and the largest pairwise sum is

\[
d+e=207,
\]

we get

\[
c=462-(a+b)-(d+e)
=462-165-207
=90.
\]

Hence,

\[
\boxed{c=90}.
\]

### IOQM tip / trick

For \(n\) numbers, the sum of **all pairwise sums** equals

\[
(n-1)\times(\text{sum of the original numbers}).
\]

Here \(n=5\), so multiply/divide by \(4\).  
Also remember:

- smallest pair sum \(=a+b\),
- largest pair sum \(=d+e\).

That avoids reconstructing all five numbers.

---

## Q7. Equal sums of every seven consecutive terms

There are \(2024\) numbers

\[
a_1,a_2,\dots,a_{2024}
\]

in a line. Every seven consecutive numbers have sum \(77\), and

\[
a_1=7.
\]

Find \(a_{2024}\).

**Answer:** \(\boxed{7}\)

### Short solution

For consecutive blocks,

\[
a_i+a_{i+1}+\cdots+a_{i+6}=77
\]

and

\[
a_{i+1}+a_{i+2}+\cdots+a_{i+7}=77.
\]

Subtracting gives

\[
a_i=a_{i+7}.
\]

So the sequence is periodic with period \(7\).

Now

\[
2024=7\cdot 289+1,
\]

hence

\[
2024\equiv 1\pmod 7.
\]

Therefore,

\[
a_{2024}=a_1=7.
\]

Thus,

\[
\boxed{7}.
\]

### IOQM tip / trick

Whenever **every \(k\) consecutive terms have the same sum**, subtract two adjacent \(k\)-term sums. You immediately get

\[
a_i=a_{i+k},
\]

so the sequence is \(k\)-periodic.

---

## Q8. Numbers written in consecutive bases

### Reconstructed relation

The mathematically consistent form of the lecture problem is

\[
(132)_a+(43)_b=(69)_{a+b},
\]

where \(a\) and \(b\) are consecutive positive integers.

Find \(a+b\).

**Answer:** \(\boxed{13}\)

### Short solution

Convert each numeral to base \(10\):

\[
(132)_a=a^2+3a+2,
\]

\[
(43)_b=4b+3,
\]

and

\[
(69)_{a+b}=6(a+b)+9.
\]

Therefore,

\[
a^2+3a+2+4b+3=6a+6b+9.
\]

Simplifying,

\[
a^2-3a-2b-4=0.
\]

Since \(a,b\) are consecutive, test the two possible orders.

If

\[
b=a+1,
\]

then

\[
a^2-3a-2(a+1)-4=0,
\]

so

\[
a^2-5a-6=0
\]

and

\[
(a-6)(a+1)=0.
\]

Thus \(a=6\), hence \(b=7\).

Therefore,

\[
a+b=13.
\]

So,

\[
\boxed{13}.
\]

### IOQM tip / trick

For base-\(b\) numerals, expand immediately:

\[
(xyz)_b=x b^2+y b+z.
\]

Before doing algebra, also check the **digit-validity condition**: every digit must be smaller than its base.

---

## Q9. Largest two-digit \(n\) for which a product is not divisible by 18

### Corrected reconstruction

Find the largest two-digit positive integer \(n\) such that

\[
n(n+1)(2n+1)
\]

is **not divisible by \(18\)**.

**Answer:** \(\boxed{97}\)

> The word **not** is essential. Without it, \(n=99\) is already a valid example, so the stated answer \(97\) would be impossible.

### Short solution

Work downward from the largest two-digit integers.

For \(n=99\),

\[
99\cdot100\cdot199
\]

is divisible by \(18\), because \(99\) supplies \(9\) and \(100\) supplies \(2\).

For \(n=98\),

\[
98\cdot99\cdot197
\]

is also divisible by \(18\), because \(98\) is even and \(99\) is divisible by \(9\).

For \(n=97\),

\[
97\cdot98\cdot195.
\]

Here \(98\) supplies a factor \(2\), but among the three factors there is only one factor of \(3\):

\[
195=3\cdot65.
\]

So the product is not divisible by \(9\), hence not divisible by \(18\).

Therefore the largest such two-digit integer is

\[
\boxed{97}.
\]

### IOQM tip / trick

For divisibility by

\[
18=2\cdot 3^2,
\]

check the \(2\)-part and \(3\)-part separately.

When the question asks for the **largest** two-digit value, testing \(99,98,97,\dots\) can be much faster than classifying every possible residue class.

---

## Q10. Power tower of 7s / terminal block \(777\)

### Partial reconstruction

The exact on-screen wording is not recoverable from the available transcript. In the lecture discussion, the relevant terminal three-digit block is

\[
777,
\]

and the required prime factor is \(37\).

**Answer discussed:** \(\boxed{37}\)

### Key observation

Factor the repeated-digit number:

\[
777=7\cdot111.
\]

Also,

\[
111=3\cdot37.
\]

Therefore,

\[
777=3\cdot7\cdot37,
\]

so the required prime factor is

\[
\boxed{37}.
\]

### IOQM tip / trick

Repeated-digit numbers often hide **repunit factors**:

\[
777=7(111),\qquad 111=3\cdot37.
\]

If a huge power tower is used only to establish its final digits, **stop working with the tower once the terminal block is known**. Factor the small resulting number instead.

---

## Lot 2 answer key

| Question | Answer |
|---|---:|
| Q6 | \(90\) |
| Q7 | \(7\) |
| Q8 | \(13\) |
| Q9 | \(97\) |
| Q10 | \(37\) |

---

## Accuracy notes

- **Q6:** Fully verified; the five original integers are uniquely \(80,85,90,97,110\).
- **Q7:** Fully verified by period-\(7\) subtraction.
- **Q8:** The transcript reconstruction omitted the equality/operation. The relation used above is the consistent one matching \(a=6,b=7\) and answer \(13\).
- **Q9:** Corrected to **not divisible by \(18\)**; otherwise the answer \(97\) is false.
- **Q10:** Only the mathematical core and discussed answer are retained because the exact slide wording is not available.
