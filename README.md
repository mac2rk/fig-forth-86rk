# FIG-FORTH for Radio-86RK

A port of **8080 FIG-FORTH 1.1** from CP/M to the **32 KB Radio-86RK**, using the computer's standard Monitor ROM for keyboard input and display output.

The source uses Microsoft MACRO-80 (M80) conventions and builds with the included Python assembler, [[assemble8080](assemble8080/README.md)](https://github.com/mac2rk/assemble8080). Basic functionality has been verified in Emu80 with the Radio-86RK Monitor ROM.

## What changed

- Address labels use M80 colon syntax, with explicit `.8080` and `ASEG` directives.
- CP/M console calls are replaced with Radio-86RK Monitor calls.
- Disk operations print `NO DISK` and return to the interactive Forth interpreter through `ABORT`.
- `BYE` returns to the Monitor.
- The memory limit is `7600H`, reserving the top of 32 KB RAM for the Monitor and display.
- The assembly label for Forth's `TYPE` word is `FTYPE`, avoiding M80's `TYPE` expression operator. The Forth word name is unchanged.
- Messages use uppercase characters for the standard Radio-86RK character ROM.

## Build

Requirements: Python 3.9 or later. The included assembler needs no third-party Python packages.

Run from the repository root:

```sh
python assemble8080/assemble8080.py fig-forth.asm fig-forth --m80-symbols
```

The `--m80-symbols` option enables M80's six-character symbol significance.

| Output | Description |
| --- | --- |
| `fig-forth.bin` | Raw binary, loaded at `0100H`; no address header |
| `fig-forth.hex` | Intel HEX image with load addresses |
| `fig-forth.sym` | Assembly symbol table |

The current build is **5,812 bytes**, occupying `0100H–17B3H`.

For historical M80/LINK-80 build notes, see [RADIO86.md](RADIO86.md). The supplied Python assembler has been tested; the original Microsoft tools have not been run against this port.

## Load and run

Use a 32 KB Radio-86RK with its matching Monitor ROM, or an emulator configured for that machine.

1. Load `fig-forth.bin` into RAM starting at **`0100H`**, or import `fig-forth.hex` with a loader that supports Intel HEX.
2. Enter **`G100`** at the Monitor prompt to cold-start Forth.
3. Use Latin keyboard mode and uppercase Forth commands.

The startup banner is:

```text
8080 FIG-FORTH 1.1
```

Try these commands, pressing Enter after each line:

```forth
1 2 + .
: SQ DUP * ;
7 SQ .
: SUM 0 10 0 DO I + LOOP ;
SUM .
```

The numeric results are `3`, `49`, and `45`. Successfully interpreted lines end with `OK`.

Enter `BYE` to return to the Monitor. After Forth has been initialized, **`G104`** performs a warm re-entry, preserving completed definitions as long as their RAM remains intact. `G100` starts a fresh Forth session.

The raw binary and Intel HEX outputs are not cassette images. Loading on physical hardware requires the appropriate tape wrapper or transfer method for your setup. This port does not add Forth tape save/load words.

## Diskless behavior

Disk words remain in the dictionary for compatibility, but do not perform disk access. `BLOCK`, `BUFFER`, `UPDATE`, `LOAD`, `-->`, `FLUSH`, `LIST`, `INDEX`, `TRIAD`, and low-level sector operations enter a shared error handler.

For example:

```forth
0 BLOCK
```

prints `NO DISK` and returns to terminal input. The handler resets both stacks and sets `DISK-ERROR` to `1`. The subsequent `ABORT`/`QUIT` path restores decimal base and the FORTH vocabulary, clears `BLK` and compilation state, and abandons the calling word. Completed definitions remain available.

`DR0` still resets the block offset for initialization, and `EMPTY-BUFFERS` still clears the compatibility buffers in RAM. These operations do not access storage. An unfinished definition is not automatically reclaimed by `ABORT`.

## Memory layout

All addresses below are hexadecimal. `EM` is an exclusive upper limit.

| Region | Addresses |
| --- | --- |
| Initial kernel and dictionary | `0100–17B3` |
| Initial dictionary pointer | `17B4` |
| Dictionary growth and downward data stack | `17B4–70FF` |
| Terminal input buffer and downward return stack | `7100–719F` |
| User variables | `71A0–71DF` |
| Eight compatibility buffers | `71E0–75FF` |
| Reserved Monitor workspace, stack, and display | `7600–7FFF` |

The dictionary and data stack share their available region. The inherited terminal/return-stack region is 160 bytes, and terminal queries accept up to 80 characters.

A 16 KB configuration requires changing `EM` to `3600H`, rebuilding, and adjusting the static check's expected limit. See [RADIO86.md](RADIO86.md) for that layout. The default binary is intended for 32 KB RAM.

## Monitor interface

| Entry | Function |
| --- | --- |
| `F800H` | Return to Monitor through its cold-start entry |
| `F803H` | Read a keyboard character into A |
| `F809H` | Display the character in C |
| `F812H` | Query keyboard readiness |

Console wrappers preserve BC, DE, and HL, including Forth's instruction pointer in BC. Carriage return emits CR followed by LF. The CP/M Ctrl-P printer toggle has been removed.

## Verification

Optional static checks require Node.js:

```sh
node check-port.cjs
```

These check symbol references, M80 symbol uniqueness, instruction sizes, memory clearance, and disk entry-point routing. They supplement assembly and runtime tests.

The emulator tests require a running **Emu80 instance with MCP support**, configured for `rk86` with the standard 32 KB Monitor. The scripts connect to `http://127.0.0.1:19781/mcp` and use its memory, CPU, keyboard, and text-screen tools. The emulator and Monitor ROM are not supplied by these scripts.

After building, run:

```sh
python verify-emulator.py test
```

This reloads the binary into emulator RAM and replaces the current Forth session. Results are appended to `emulator-results.jsonl`. On success, the emulator is left running Forth after warm re-entry.

Tests passed on **Emu80 4.0.571**, using its 8080 at 1,777,777 Hz:

- Cold startup and keyboard input.
- Arithmetic, colon definitions, and `DO`/`LOOP`.
- Disk errors from `BLOCK`, `LOAD`, `FLUSH`, and `R/W`.
- A disk error inside a colon definition abandoning the caller.
- Recovery with `STATE = 0`, `BLK = 0`, and `DISK-ERROR = 1`, while retaining compiled definitions.
- `BYE` returning to Monitor and `G104` preserving definitions on warm re-entry.

Physical hardware, rubout editing, and exhaustive dictionary coverage have not been tested.

## Repository contents

| File | Purpose |
| --- | --- |
| [fig-forth.asm](fig-forth.asm) | Radio-86RK assembly source and original credits |
| [assemble8080/](assemble8080/) | Python assembler and its documentation |
| [check-port.cjs](check-port.cjs) | Static source and memory checks |
| [verify-emulator.py](verify-emulator.py) | Emulator loading and functional tests |
| [emu-call.py](emu-call.py) | Local Emu80 MCP client |
| [RADIO86.md](RADIO86.md) | Detailed port and validation notes |

## Credits

The original source credits **John Cassady** for the 8080 implementation, the **Forth Interest Group (FIG)** and its implementation team, and **Kim Harris** for the CP/M modifications. The historical publication and attribution notices are preserved in `fig-forth.asm`.

The original FIG notice describes its publications as public domain and asks that its credit notice be included when redistributing them. Refer to the source header for the complete original notices; this README does not assign a new license to the bundled tools.
