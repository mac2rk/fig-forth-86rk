# Built-in Forth words

This reference documents all **241 entries** in the built-in dictionary of [fig-forth.asm](fig-forth.asm), in source order (oldest to newest). Coverage was checked by assembling the source and following the dictionary links from `TASK` back to `LIT`. Names are decoded from the actual name fields, rather than inferred from assembly labels or comments.

Each row names a Forth word, its assembly label, whether its header marks it **immediate**, and its behavior in this Radio-86RK port. Immediate words execute when encountered during compilation; that flag alone does not mean a word is safe in every context. Runtime/compiler helpers are included because they have dictionary headers, even when normally used only by compiled code.

A cell is 16 bits and a double-cell number is 32 bits (low cell below high cell on the data stack). Arithmetic uses the current `BASE` where conversion is involved. Variables and user variables return **addresses**; use `@` or `!` to read or write their cells. Numeric addresses and constants below describe the default 32 KB build. This is FIG-FORTH 1.1, not an ANS Forth reference: in particular, `VARIABLE` takes an initial value, tick returns a PFA, `R` copies the return-stack top, and `LEAVE` exits at the next loop control.

All direct disk stubs print `NO DISK`, reset the data and return stacks, set `DISK-ERROR` to 1, and enter `ABORT`/`QUIT`. They abandon the caller rather than return a normal result. That recovery selects decimal and FORTH, clears compilation state and `BLK`, and resumes terminal input. Completed definitions remain. Indirect screen operations are identified below too.

The internal NUL-named entry is shown as **NUL (00H)**; it is distinct from the printable constant `0`. Assembly routines without dictionary headers, such as `NEXT`, `DOCOL`, `NODISK`, and `PEMIT`, are not Forth words and are excluded. `EPRINT` is likewise only an assembly storage label.

| Forth word | Assembly label | Immediate | Brief description |
| --- | --- | --- | --- |
| `LIT` | `LIT` |  | Runtime: push the cell embedded immediately after this instruction in a compiled definition. |
| `EXECUTE` | `EXEC` |  | Execute the word at a supplied code-field address (CFA). |
| `BRANCH` | `BRAN` |  | Runtime: take the inline relative branch unconditionally. |
| `0BRANCH` | `ZBRAN` |  | Runtime: consume a flag and take the inline relative branch when it is zero. |
| `(LOOP)` | `XLOOP` |  | Runtime for LOOP: increment the loop index and branch back until the limit is reached. |
| `(+LOOP)` | `XPLOO` |  | Runtime for +LOOP: add the supplied signed increment and test the loop boundary. |
| `(DO)` | `XDO` |  | Runtime for DO: move the limit and starting index from the data stack to the return stack. |
| `I` | `IDO` |  | Copy the current loop index from the return stack to the data stack. |
| `DIGIT` | `DIGIT` |  | Convert a character using a supplied base; return digit and true on success, or false on failure. |
| `(FIND)` | `PFIND` |  | Search from a supplied dictionary name-field address for a counted string; return PFA, header byte, true, or just false. |
| `ENCLOSE` | `ENCL` |  | Scan a string for a supplied delimiter; return its address and offsets for token start, end, and the next position. |
| `EMIT` | `EMIT` |  | Display a character through the Monitor and increment OUT. |
| `KEY` | `KEY` |  | Wait for a keyboard character and return its code. |
| `?TERMINAL` | `QTERM` |  | Return a flag indicating keyboard input is ready; does not consume the character. |
| `CR` | `CR` |  | Output carriage return and line feed. |
| `CMOVE` | `CMOVE` |  | Copy a byte count from source to destination, proceeding toward increasing addresses. |
| `U*` | `USTAR` |  | Multiply two unsigned 16-bit values to produce a 32-bit result. |
| `U/` | `USLAS` |  | Divide an unsigned 32-bit dividend by a 16-bit divisor; return remainder and 16-bit quotient. |
| `AND` | `ANDD` |  | Bitwise AND of two cells. |
| `OV` | `ORR` |  | Bitwise OR of two cells. |
| `XOR` | `XORR` |  | Bitwise exclusive OR of two cells. |
| `SP@` | `SPAT` |  | Return the data-stack pointer as it was before the result was pushed. |
| `SP!` | `SPSTO` |  | Reset the data-stack pointer from S0; discards the current data stack. |
| `RP@` | `RPAT` |  | Return the current return-stack pointer. |
| `RP!` | `RPSTO` |  | Reset the return-stack pointer from R0. |
| `;S` | `SEMIS` |  | Runtime return from a colon definition; restore the interpreter address from the return stack. |
| `LEAVE` | `LEAVE` |  | Set the current loop limit equal to its index so the next loop control ends the loop; does not immediately skip the remaining body. |
| `>R` | `TOR` |  | Move the top data-stack cell to the return stack. |
| `R>` | `FROMR` |  | Move the top return-stack cell to the data stack. |
| `R` | `RR` |  | Copy the top return-stack cell without removing it; shares I's implementation. |
| `0=` | `ZEQU` |  | Return true if the supplied cell is zero. |
| `0<` | `ZLESS` |  | Return true if the supplied signed cell is negative. |
| `+` | `PLUS` |  | Add two cells. |
| `D+` | `DPLUS` |  | Add two double-cell numbers. |
| `MINUS` | `MINUS` |  | Negate a single-cell number. |
| `DMINUS` | `DMINU` |  | Negate a double-cell number. |
| `OVER` | `OVER` |  | Copy the second data-stack cell to the top. |
| `DROP` | `DROP` |  | Discard the top data-stack cell. |
| `SWAP` | `SWAP` |  | Exchange the top two data-stack cells. |
| `DUP` | `DUP` |  | Duplicate the top data-stack cell. |
| `2DUP` | `TDUP` |  | Duplicate the top two cells, preserving their order. |
| `+!` | `PSTOR` |  | Add a value to the cell stored at an address. |
| `TOGGLE` | `TOGGL` |  | XOR the byte at an address with a supplied byte mask. |
| `@` | `AT` |  | Fetch a 16-bit cell from an address. |
| `C@` | `CAT` |  | Fetch a byte, zero-extended to a cell. |
| `2@` | `TAT` |  | Fetch two cells; the cell at the lower address is returned on top. |
| `!` | `STORE` |  | Store a cell at an address. |
| `C!` | `CSTOR` |  | Store the low byte of a cell at an address. |
| `2!` | `TSTOR` |  | Store two cells; the cell immediately below the address goes at the lower address. |
| `:` | `COLON` | Yes | Parse a name and begin a colon definition, checking interpretation state and saving the compile-time stack pointer. |
| `;` | `SEMI` | Yes | End a colon definition: check stack balance, compile ;S, reveal the name, and return to interpretation state. |
| `NOOP` | `NOOP` |  | Do nothing. |
| `CONSTANT` | `CON` |  | Define a named constant using the supplied initial cell; executing it returns that cell. |
| `VARIABLE` | `VAR` |  | Define a named variable using a supplied initial cell, e.g. 0 VARIABLE X; executing it returns its storage address. |
| `USER` | `USER` |  | Define a named user variable using a supplied byte offset within the user area. |
| `0` | `ZERO` |  | Push constant 0. |
| `1` | `ONE` |  | Push constant 1. |
| `2` | `TWO` |  | Push constant 2. |
| `3` | `THREE` |  | Push constant 3. |
| `BL` | `BL` |  | Push the space character code, 32. |
| `C/L` | `CSLL` |  | Push the logical screen-line length, 64 characters; this is not the physical display width. |
| `FIRST` | `FIRST` |  | Push the first compatibility-buffer address, 71E0H in the default build. |
| `LIMIT` | `LIMIT` |  | Push the exclusive compatibility-buffer/RAM limit, 7600H. |
| `B/BUF` | `BBUF` |  | Push the buffer data size, 128 bytes. |
| `B/SCR` | `BSCR` |  | Push the number of buffers per 1024-byte screen, 8. |
| `+ORIGIN` | `PORIG` |  | Add the program origin (0100H) to an offset, yielding an address in the startup parameter area. |
| `S0` | `SZERO` |  | User variable: initial data-stack pointer, 7100H. |
| `R0` | `RZERO` |  | User variable: initial return-stack pointer, 71A0H. |
| `TIB` | `TIB` |  | User variable: terminal input buffer address, initially 7100H. |
| `WIDTH` | `WIDTH` |  | User variable: maximum name width used by CREATE, initially 32. |
| `WARNING` | `WARN` |  | User variable: error-message policy; initially zero for numeric messages, positive for disk messages, negative for the ERROR abort path. |
| `FENCE` | `FENCE` |  | User variable: lowest permitted FORGET boundary, initially the end of the built-in dictionary. |
| `DP` | `DP` |  | User variable: next free dictionary address. |
| `VOC-LINK` | `VOCL` |  | User variable: head of the vocabulary-link chain. |
| `BLK` | `BLK` |  | User variable: current input block; zero selects terminal input. |
| `IN` | `INN` |  | User variable: byte offset into the current input source. |
| `OUT` | `OUTT` |  | User variable: output-character counter incremented by EMIT. |
| `SCR` | `SCR` |  | User variable: screen number retained for compatibility with screen tools. |
| `OFFSET` | `OFSET` |  | User variable: block-number offset; DR0 clears it. |
| `CONTEXT` | `CONT` |  | User variable: pointer to the vocabulary searched first. |
| `CURRENT` | `CURR` |  | User variable: pointer to the vocabulary receiving new definitions. |
| `STATE` | `STATE` |  | User variable: zero for interpreting, nonzero for compiling. |
| `BASE` | `BASE` |  | User variable: numeric input/output radix. |
| `DPL` | `DPL` |  | User variable: number of digits after a number's decimal point; -1 means no point was encountered. |
| `FLD` | `FLD` |  | User variable reserved for numeric field-width support; not used by the built-in formatting words. |
| `CSP` | `CSPP` |  | User variable: saved stack pointer used to check compile-time stack balance. |
| `R#` | `RNUM` |  | User variable reserved for screen-editor cursor position; no editor is included. |
| `HLD` | `HLD` |  | User variable: current address for pictured numeric output. |
| `1+` | `ONEP` |  | Add 1 to a cell. |
| `2+` | `TWOP` |  | Add 2 to a cell. |
| `HERE` | `HERE` |  | Return the next free dictionary address (DP @). |
| `ALLOT` | `ALLOT` |  | Add a signed byte count to DP, allocating or releasing dictionary space. |
| `,` | `COMMA` |  | Store a cell at HERE and advance DP by two bytes. |
| `C,` | `CCOMM` |  | Store a byte at HERE and advance DP by one byte. |
| `-` | `SUBB` |  | Subtract the top cell from the next cell. |
| `=` | `EQUAL` |  | Return true if two cells are equal. |
| `<` | `LESS` |  | Signed less-than comparison. |
| `U<` | `ULESS` |  | Unsigned less-than comparison. |
| `>` | `GREAT` |  | Signed greater-than comparison. |
| `ROT` | `ROT` |  | Rotate three cells: a b c becomes b c a. |
| `SPACE` | `SPACE` |  | Output one space. |
| `-DUP` | `DDUP` |  | Duplicate the top cell only when it is nonzero (the FIG equivalent of ?DUP). |
| `TRAVERSE` | `TRAV` |  | Starting at an address, step by a signed increment until a byte with bit 7 set is found; used to traverse name fields. |
| `LATEST` | `LATES` |  | Return the name-field address of the latest word in CURRENT. |
| `LFA` | `LFA` |  | Convert a parameter-field address (PFA) to its link-field address. |
| `CFA` | `CFA` |  | Convert a parameter-field address (PFA) to its code-field address. |
| `NFA` | `NFA` |  | Convert a parameter-field address (PFA) to its name-field address. |
| `PFA` | `PFA` |  | Convert a name-field address (NFA) to its parameter-field address. |
| `!CSP` | `SCSP` |  | Save the current data-stack pointer in CSP. |
| `?ERROR` | `QERR` |  | Consume a flag and error number; call ERROR if the flag is nonzero. |
| `?COMP` | `QCOMP` |  | Report an error unless compilation is active. |
| `?EXEC` | `QEXEC` |  | Report an error unless interpretation is active. |
| `?PAIRS` | `QPAIR` |  | Check that two compiler control markers match; report an error otherwise. |
| `?CSP` | `QCSP` |  | Check the current data-stack pointer against CSP; report an error on imbalance. |
| `?LOADING` | `QLOAD` |  | Report an error unless BLK is nonzero (block input). |
| `COMPILE` | `COMP` |  | Runtime compiler helper: append the next inline word's CFA to the dictionary and skip over it. |
| `[` | `LBRAC` | Yes | Switch to interpretation state, including within a definition. |
| `]` | `RBRAC` |  | Switch to compilation state. |
| `SMUDGE` | `SMUDG` |  | Toggle the latest name's smudge bit, hiding or revealing it to dictionary searches. |
| `HEX` | `HEX` |  | Set BASE to 16. |
| `DECIMAL` | `DEC` |  | Set BASE to 10. |
| `(;CODE)` | `PSCOD` |  | Runtime helper for defining words: install the following machine-code address in the latest word's code field. |
| `;CODE` | `SEMIC` | Yes | End a defining word with machine-code behavior; the assembler-vocabulary hook is NOOP in this source, so no Forth assembler is supplied. |
| `<BUILDS` | `BUILD` |  | Create a child word with a zero-initialized cell for use with DOES>. |
| `DOES>` | `DOES` |  | Specify the Forth behavior of words made by a defining word; the child's data address is supplied when it executes. |
| `COUNT` | `COUNT` |  | Convert a counted-string address into the character address and byte count. |
| `TYPE` | `FTYPE` |  | Display a specified number of bytes from an address. |
| `-TRAILING` | `DTRAI` |  | Reduce a string length to exclude trailing spaces, retaining the original address. |
| `(.")` | `PDOTQ` |  | Runtime for compiled dot-quote: display the inline counted string and advance past it. |
| `."` | `DOTQ` | Yes | Parse through the next double quote; display the text now or compile it for later display. |
| `EXPECT` | `EXPEC` |  | Read up to a supplied number of characters into an address, with echo and rubout handling; terminate on carriage return and add zero termination. |
| `QUERY` | `QUERY` |  | Read an 80-character terminal line into TIB and reset IN to zero. |
| NUL (00H) | `NULL` | Yes | Internal word whose name is one NUL byte; ends terminal interpretation or advances/checks block input. It is not the printable word 0. |
| `FILL` | `FILL` |  | Fill a byte range with the low byte of a supplied value. |
| `ERASE` | `ERASEE` |  | Fill a byte range with zeros. |
| `BLANKS` | `BLANK` |  | Fill a byte range with spaces. |
| `HOLD` | `HOLD` |  | Prepend a character to the pictured numeric output buffer, updating HLD. |
| `PAD` | `PAD` |  | Return the scratch-area address, HERE plus 68 decimal bytes. |
| `WORD` | `WORD` |  | Parse the next token using a supplied delimiter, store a counted string at HERE, and advance IN; nonzero BLK leads to disk access and NO DISK. |
| `(NUMBER)` | `PNUMB` |  | Internal digit accumulator: extend a double-cell number while scanning the string and update DPL; stop at the first non-digit. |
| `NUMBER` | `NUMB` |  | Convert a counted numeric string using BASE to a signed double-cell number; update DPL and report malformed input. |
| `-FIND` | `DFIND` |  | Parse the next space-delimited name and search CONTEXT, then CURRENT; return PFA, header byte, true, or false. |
| `(ABORT)` | `PABOR` |  | Internal abort hook; this implementation calls ABORT. |
| `ERROR` | `ERROR` |  | Handle a supplied error number according to WARNING, reset the data stack, report the offending token/message, and return through QUIT or (ABORT). |
| `ID.` | `IDDOT` |  | Display a dictionary name given its name-field address, followed by a space. |
| `CREATE` | `CREAT` |  | Parse and link a new dictionary header, warn on an existing name, and leave the new entry smudged for a defining word to finish. |
| `[COMPILE]` | `BCOMP` | Yes | Parse a word and compile its CFA even if it is immediate. |
| `LITERAL` | `LITER` | Yes | When compiling, compile LIT and a supplied cell; when interpreting, leave the cell on the stack. |
| `DLITERAL` | `DLITE` | Yes | When compiling, compile a double-cell literal; otherwise leave the double-cell value unchanged. |
| `?STACK` | `QSTAC` |  | Check for data-stack underflow and collision with the dictionary plus an 80H-byte margin. |
| `INTERPRET` | `INTER` |  | Interpret input tokens: execute or compile found words, convert numbers, and check the stack. |
| `IMMEDIATE` | `IMMED` |  | Toggle the latest definition's immediate bit. |
| `VOCABULARY` | `VOCAB` |  | Define a named vocabulary linked to the vocabulary chain; executing it selects its search context. |
| `FORTH` | `FORTH` | Yes | Select the built-in FORTH vocabulary as CONTEXT. |
| `DEFINITIONS` | `DEFIN` |  | Set CURRENT to CONTEXT so new definitions enter the selected vocabulary. |
| `(` | `PAREN` | Yes | Skip input through the next closing parenthesis; comment word. |
| `QUIT` | `QUIT` |  | Clear BLK and compilation state, reset the return stack each line, and run the terminal interpreter loop; does not itself clear the data stack. |
| `ABORT` | `ABORT` |  | Clear the data stack, select decimal and FORTH, print the banner, and enter QUIT. |
| `WARM` | `WARM` |  | Clear compatibility buffers and perform ABORT, retaining dictionary definitions. |
| `COLD` | `COLD` |  | Reset startup user parameters and the built-in vocabulary head, clear buffers and compatibility settings, then perform ABORT. |
| `S->D` | `STOD` |  | Sign-extend a single-cell number to a double-cell number. |
| `+-` | `PM` |  | Negate a single-cell value if the supplied sign-test value is negative; otherwise leave it unchanged. |
| `D+-` | `DPM` |  | Negate a double-cell value if the supplied sign-test value is negative. |
| `ABS` | `ABS` |  | Return a single-cell absolute value. |
| `DABS` | `DABS` |  | Return a double-cell absolute value. |
| `MIN` | `MIN` |  | Return the smaller of two signed cells. |
| `MAX` | `MAX` |  | Return the larger of two signed cells. |
| `M*` | `MSTAR` |  | Multiply two signed cells to produce a double-cell result. |
| `M/` | `MSLAS` |  | Divide a signed double-cell dividend by a signed single-cell divisor; return remainder and quotient, truncating toward zero with the remainder taking the dividend's sign. |
| `*` | `STAR` |  | Multiply two cells, keeping the single-cell result. |
| `/MOD` | `SLMOD` |  | Signed single-cell division; return remainder followed by quotient. |
| `/` | `SLASH` |  | Signed single-cell division; return the quotient. |
| `MOD` | `MODD` |  | Signed single-cell division; return the remainder. |
| `*/MOD` | `SSMOD` |  | Multiply two signed cells with a double-cell intermediate, then divide by a third; return remainder and quotient. |
| `*/` | `SSLA` |  | Multiply two signed cells with a double-cell intermediate, divide by a third, and return the quotient. |
| `M/MOD` | `MSMOD` |  | Divide an unsigned double-cell number by an unsigned cell; return a single-cell remainder and double-cell quotient. |
| `(LINE)` | `PLINE` |  | Compute a screen-line address and length through BLOCK; in this port it reports NO DISK and aborts. |
| `.LINE` | `DLINE` |  | Display a screen line with trailing spaces removed; reaches (LINE), so reports NO DISK and aborts here. |
| `MESSAGE` | `MESS` |  | With WARNING zero, print MSG # and the supplied number; nonzero WARNING and a nonzero message number attempt a disk message and reach NO DISK. |
| `P@` | `PTAT` |  | Read an 8080 I/O port using the low byte of the supplied port number. |
| `P!` | `PTSTO` |  | Write a byte to an 8080 I/O port; takes value then port number. These are CPU ports, not Monitor services. |
| `DRIVE` | `DRIVE` |  | Variable: retained disk-drive number; no functional disk backend. |
| `SEC` | `SEC` |  | Variable: retained sector number. |
| `TRACK` | `TRACK` |  | Variable: retained track number. |
| `USE` | `USE` |  | Variable: compatibility-buffer selection pointer, initialized to FIRST. |
| `PREV` | `PREV` |  | Variable: previous compatibility-buffer pointer, initialized to FIRST. |
| `SEC/BLK` | `SPBLK` |  | Constant: sectors per buffer/block, 1 in this build. |
| `#BUFF` | `NOBUF` |  | Constant: number of compatibility buffers, 8. |
| `DENSITY` | `DENSTY` |  | Variable: retained disk-density selector, initialized to zero; does not enable storage. |
| `DISK-ERROR` | `DSKERR` |  | Variable: disk-error status; the NO DISK handler sets it to 1. |
| `+BUF` | `PBUF` |  | Advance a buffer-header address by 132 bytes, wrapping at LIMIT; also return its difference from PREV @. |
| `UPDATE` | `UPDAT` |  | Diskless stub: report NO DISK and abort; does not mark a buffer dirty. |
| `EMPTY-BUFFERS` | `MTBUF` |  | Erase the compatibility-buffer RAM range from FIRST to LIMIT. |
| `DR0` | `DRZER` |  | Set OFFSET to zero; used during COLD and does not access a disk. |
| `DR1` | `DRONE` |  | Diskless stub for selecting the second drive: report NO DISK and abort. |
| `BUFFER` | `BUFFE` |  | Diskless stub: report NO DISK and abort; does not allocate or return a buffer. |
| `BLOCK` | `BLOCK` |  | Diskless stub: report NO DISK and abort, even for a nominally cached block. |
| `SET-IO` | `SETIO` |  | Diskless stub for setting disk I/O parameters: report NO DISK and abort. |
| `SET-DRIVE` | `SETDRV` |  | Diskless stub for selecting a disk drive: report NO DISK and abort. |
| `T&SCALC` | `TSCALC` |  | Diskless stub for track/sector calculation: report NO DISK and abort. |
| `SEC-READ` | `SECRD` |  | Diskless stub for sector reading: report NO DISK and abort. |
| `SEC-WRITE` | `SECWT` |  | Diskless stub for sector writing: report NO DISK and abort. |
| `R/W` | `RSLW` |  | Diskless read/write primitive: report NO DISK and abort; no transfer takes place. |
| `FLUSH` | `FLUSH` |  | Diskless stub: report NO DISK and abort; no data is written. |
| `LOAD` | `LOAD` |  | Diskless stub: report NO DISK and abort; no screen is interpreted. |
| `-->` | `ARROW` | Yes | Immediate diskless stub for continuing screen loading: report NO DISK and abort. |
| `'` | `TICK` | Yes | Parse a name and return its PFA when interpreting, or compile that PFA as a literal; unlike modern tick, this returns a PFA, not a CFA. |
| `FORGET` | `FORG` |  | Parse a name and discard it and later dictionary entries, subject to FENCE and matching CURRENT/CONTEXT checks. |
| `BACK` | `BACK` |  | Compiler helper: append the relative backward-branch offset to a supplied destination. |
| `BEGIN` | `BEGIN` | Yes | Mark the start of a loop for a later UNTIL, AGAIN, or WHILE/REPEAT. |
| `ENDIF` | `ENDIFF` | Yes | Resolve the forward branch from IF or ELSE; equivalent to THEN. |
| `THEN` | `THEN` | Yes | Resolve the forward branch from IF or ELSE; calls ENDIF. |
| `DO` | `DO` | Yes | Compile a counted loop setup; at runtime takes limit then initial index. |
| `LOOP` | `LOOP` | Yes | Compile the unit-increment end of a DO loop. |
| `+LOOP` | `PLOOP` | Yes | Compile a DO-loop end whose signed increment is supplied at runtime. |
| `UNTIL` | `UNTIL` | Yes | Compile a backward conditional branch to BEGIN; repeat while the runtime flag is zero. |
| `END` | `ENDD` | Yes | Alias for UNTIL. |
| `AGAIN` | `AGAIN` | Yes | Compile an unconditional backward branch to BEGIN. |
| `REPEAT` | `REPEA` | Yes | Finish a BEGIN ... WHILE ... REPEAT loop and resolve its forward exit. |
| `IF` | `IFF` | Yes | Compile a conditional forward branch; at runtime skip the true part if the flag is zero. |
| `ELSE` | `ELSEE` | Yes | Compile the alternative part of IF, resolving the first branch and creating another forward branch. |
| `WHILE` | `WHILE` | Yes | Compile a conditional exit from a BEGIN loop; pair with REPEAT. |
| `SPACES` | `SPACS` |  | Output the supplied number of spaces; negative counts produce none. |
| `<#` | `BDIGS` |  | Begin pictured numeric output by setting HLD to PAD. |
| `#>` | `EDIGS` |  | Finish pictured numeric output: discard the working double value and return the string address and length. |
| `SIGN` | `SIGN` |  | Given a sign-test cell beneath a working double value, prepend a minus sign if negative; leave the double value. |
| `#` | `DIG` |  | Convert one digit of an unsigned double value using BASE, prepend it to the output buffer, and leave the quotient. |
| `#S` | `DIGS` |  | Repeat # until the double value is zero, producing at least one digit. |
| `D.R` | `DDOTR` |  | Print a signed double-cell value right-justified in a supplied field width. |
| `.R` | `DOTR` |  | Print a signed single-cell value right-justified in a supplied field width. |
| `D.` | `DDOT` |  | Print a signed double-cell value followed by a space. |
| `.` | `DOT` |  | Print a signed single-cell value followed by a space. |
| `?` | `QUES` |  | Fetch and print the signed cell at an address. |
| `U.` | `UDOT` |  | Print an unsigned single-cell value followed by a space. |
| `VLIST` | `VLIST` |  | List words in CONTEXT, newest first; stop at the end of the dictionary or when keyboard input is ready. |
| `BYE` | `BYE` |  | Jump to the Monitor cold-start entry F800H. |
| `LIST` | `LIST` |  | Diskless screen-listing stub: report NO DISK and abort. |
| `INDEX` | `INDEX` |  | Diskless screen-index stub: report NO DISK and abort. |
| `TRIAD` | `TRIAD` |  | Diskless three-screen listing stub: report NO DISK and abort. |
| `.CPU` | `DOTCPU` |  | Print the encoded CPU identifier (8080), preserving BASE. |
| `TASK` | `TASK` |  | Empty colon definition marking the end of the built-in dictionary; does nothing when executed. |
