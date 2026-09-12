# FIG-FORTH for Radio-86RK

The source targets the standard 32 KB Radio-86RK and its matching Monitor ROM (EM=7600H). Use Latin keyboard mode for Forth commands. The historical FIG credits are retained.

Address labels now end in a colon (not a semicolon). EQU definitions retain M80 syntax. Explicit .8080 and ASEG select Intel instructions and absolute addressing.

The assembly label for Forth TYPE is FTYPE because TYPE is an M80 expression operator. The Forth dictionary name remains TYPE. The banner and NO DISK message use uppercase because the standard Radio-86RK character ROM displays lowercase ASCII codes as Cyrillic glyphs.

The supplied Python assembler successfully builds the image with M80 six-character symbol handling:

    python assemble8080/assemble8080.py fig-forth.asm fig-forth --m80-symbols

Outputs: fig-forth.bin (5,812 bytes, load at 0100H), fig-forth.hex (Intel HEX), and fig-forth.sym (symbols). The highest emitted address is 17B3H.

Assemble fig-forth.asm with M80, then link the absolute module with LINK-80. For a CP/M-hosted build, copy it to RKFOR.MAC and use:

    M80 RKFOR,RKFOR=RKFOR
    L80 RKFOR,RKFOR/N/E

These commands have not been executed here. Load the resulting image at 0100H using your tape loader or emulator; a CP/M COM image requires conversion/wrapping for the chosen Radio-86RK loader. It is not directly a cassette file. Start with Monitor command G100. G104 is the warm entry after initialization. BYE jumps to the Monitor cold entry F800H, which initializes its own stack and peripherals.

Console entry points: F803H returns a character in A; F809H displays C; F812H returns keyboard readiness in A. Wrappers preserve BC, DE and HL. ?TERMINAL tests readiness, and KEY reads a character. CR emits CR then LF. Input rubout remains 7FH and output backspace 08H. The CP/M Ctrl-P printer toggle is removed; EPRINT remains an unused compatibility cell. F80CH is tape output and is not used.

Disk words (including BLOCK, BUFFER, UPDATE, LOAD, -->, FLUSH, LIST, INDEX, TRIAD and low-level sector calls) immediately enter a shared handler. It resets the data and return stacks, sets DISK-ERROR to 1, prints `no disk`, and enters ABORT. ABORT restores decimal base and the FORTH vocabulary; QUIT clears BLK and compilation state and reads a fresh terminal line. Completed definitions remain. As with FIG-FORTH ABORT, an unfinished definition is not reclaimed automatically. DR0 remains an offset reset used by COLD; EMPTY-BUFFERS remains a RAM erase operation. Compatibility variables and eight RAM buffers are retained, but BLOCK never returns cached contents as disk data.

## RAM allocation

| Region | Default addresses |
| --- | --- |
| Kernel | 0100H-17B3H |
| Initial dictionary pointer | 17B4H |
| Dictionary growth and downward data stack | 17B4H-70FFH |
| Terminal input and downward return stack | 7100H-719FH |
| User variables | 71A0H-71DFH |
| Compatibility buffers | 71E0H-75FFH |
| Reserved Monitor workspace, stack and display | 7600H-7FFFH |

The inherited 160-byte combined terminal/return-stack space is retained; the terminal query uses 80 characters. The dictionary/stack gap is shared capacity, not a promise of unlimited stack depth. The old trailing DS to the memory limit has been removed, so the image ends at the kernel rather than padding through runtime RAM.

For a 16 KB machine with its matching Monitor, change EM to 3600H and adjust the static check's expected EM: S0 becomes 3100H, R0/UP 31A0H, and FIRST 31E0H. Reserve 3600H-3FFFH for that Monitor. Do not use the default 32 KB setting with a 16 KB machine.

## Validation

`node check-port.cjs` checks instruction sizes, symbol definitions/references, six-character M80 symbol uniqueness, RAM clearance, and disk entry-point routing. These static checks pass. Compilation with the supplied assemble8080 also passes; the historical Microsoft M80 executable has not been run.

Execution was verified on Emu80 4.0.571, platform rk86, 8080 at 1,777,777 Hz, through its local MCP endpoint. The binary was written to RAM in two chunks starting at 0100H, then PC was set to 0100H. Keyboard tests use the emulated keyboard and real Monitor ROM routines.

Run `python verify-emulator.py test` to reload the current binary and repeat the checks. It requires the configured emulator at http://127.0.0.1:19781/mcp and overwrites the Forth image and runtime state. Results are appended to emulator-results.jsonl. All final-build checks passed:

- Cold startup displays 8080 FIG-FORTH 1.1 and accepts input.
- `1 2 + .` prints 3; `: SQ DUP * ; 7 SQ .` prints 49.
- `: SUM 0 10 0 DO I + LOOP ; SUM .` prints 45.
- BLOCK, LOAD, FLUSH, R/W, and BLOCK inside a colon definition print NO DISK and abandon the caller.
- After each disk failure, `8 SQ . STATE @ . BLK @ . DISK-ERROR @ .` prints 64 0 0 1.
- BYE displays the Monitor prompt. G104 returns to Forth; `9 SQ .` prints 81, confirming warm preservation of definitions.

The emulator was left running in Forth after warm re-entry. Rubout editing and exhaustive word coverage were not tested.

Hardware/emulator smoke checks: G100; `1 2 + .` (3); `: SQ DUP * ; 7 SQ .` (49); rubout editing; `0 BLOCK`, `0 LOAD`, `FLUSH`, `0 0 1 R/W` (each reports no disk); arithmetic after each failure; BYE (Monitor prompt). Check disk calls inside a colon definition too, to verify abandonment of the caller.

References: [Monitor ROM listing](https://rk86.ru/monitor/) and [Microsoft M80 manual](https://www.s100computers.com/Software%20Folder/Assembler%20Collection/Microsoft%20M80%20Manual.pdf). The ROM listing shows the 32 KB workspace at 7600H; the standard 16 KB layout uses the corresponding 3600H area.
