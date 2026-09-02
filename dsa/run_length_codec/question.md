# Run-Length Codec

## 1. Interview Prompt

Implement a run-length encoder and decoder for printable ASCII text. The encoded format is a sequence of `<count>:<character>` segments, where `count` is a positive decimal integer and `character` is exactly one printable ASCII character.

The decoder must reject malformed data rather than returning a partial result.

## 2. Requirements

- The encoder accepts printable ASCII characters from code point 32 through 126.
- Adjacent equal characters form one run.
- Counts use canonical decimal form: no sign, zero, or leading zeros.
- A segment contains count digits, one colon delimiter, and exactly one character; that character may itself be a digit or colon.
- Empty input encodes to `""`, and `""` decodes to `""`.
- The decoder rejects truncated segments, invalid counts, missing delimiters, and decoded output longer than 100,000 characters.
- The encoder must split no valid run; assume input length is at most 100,000.
- Aim for linear time in input plus output size.

## 3. Example Input / Output

```text
encodeRuns("aaabb") -> "3:a2:b"
decodeRuns("3:a2:b") -> { ok: true, value: "aaabb" }
encodeRuns("::") -> "2::"
encodeRuns("111a") -> "3:11:a"

decodeRuns("0:a")   -> malformed
decodeRuns("01:a")  -> malformed
decodeRuns("3")     -> malformed
decodeRuns("2:")    -> malformed
```

## 4. What the Interviewer Is Evaluating

- Precise stateful parsing
- Reversible contract and boundary cases
- Malformed-input and allocation safety
- Complexity proportional to encoded and decoded sizes

## 5. Concept Questions and Interview Answers

### Why is a decoded-size limit important?

**Interview answer:**

> A short encoded input can claim an enormous run and force excessive allocation or CPU work. Validating the count against a configured output limit prevents decompression-style resource exhaustion.

### Why prefer one canonical count format?

**Interview answer:**

> Canonical encoding removes alternate representations of the same value, simplifies tests and signatures, and makes malformed inputs easier to identify consistently.
