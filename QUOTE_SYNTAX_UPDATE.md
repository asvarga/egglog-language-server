# Egglog Language Server - Quote/Unquote Syntax Support

This document describes the updates made to the egglog-language-server to support the new Lisp-style quasiquotation syntax using backtick (`` ` ``) and comma (`,`).

## Changes Made

### 1. Tree-sitter Grammar (`tree-sitter-egglog/grammar.js`)

Added support for backtick and comma operators:

```javascript
// New token definitions
backtick: ($) => token("`"),
comma_op: ($) => token(","),

// Updated expr rule to include quote_expr and unquote_expr
expr: ($) => choice($.literal, $.ident, $.callexpr, $.quote_expr, $.unquote_expr),

// New grammar rules
quote_expr: ($) => seq($.backtick, $.expr),
unquote_expr: ($) => seq($.comma_op, $.expr),
```

**Rationale:** These rules mirror the parser implementation in `src/ast/parse.rs` where:
- `` `expr `` is transformed into `(quote expr)`
- `,expr` is transformed into `(unquote expr)`

### 2. Syntax Highlighting Queries (`tree-sitter-egglog/queries/highlights.scm`)

Added highlighting for the new syntax:

```scheme
[(backtick) (comma_op)] @operator
["saturate" "set" "repeat" "delete" "union" "panic" "extract" "let" "true" "false" "quote" "unquote"] @keyword
(quote_expr) @string.special
(unquote_expr) @string.special
```

**Rationale:** 
- Backtick and comma are highlighted as operators
- `quote` and `unquote` keywords are highlighted when used in explicit form
- Quote/unquote expressions get special highlighting to visually distinguish quoted code

### 3. TextMate Grammar (`syntaxes/eggsmol.tmLanguage.json`)

Updated for VS Code syntax highlighting:

```json
"quote": {
    "patterns": [
        {
            "name": "string.special.quoted",
            "match": "`"
        },
        {
            "name": "string.special.unquote",
            "match": ","
        }
    ]
}
```

Also added `quote` and `unquote` to the command keywords.

**Rationale:** Provides fallback syntax highlighting for editors that use TextMate grammars instead of tree-sitter.

## Syntax Examples

The language server now correctly parses and highlights:

### Basic Quoting
```egglog
`(Knows (Bob) (Charlie))
; Equivalent to: (quote (Knows (Bob) (Charlie)))
```

### Unquoting (Splicing)
```egglog
(let bob `(Bob))
`(Knows ,bob (Charlie))
; Equivalent to: (quote (Knows (unquote bob) (Charlie)))
```

### Nested Quoting
```egglog
`(outer (middle (inner x)))
```

### Simple Expressions
```egglog
`x      ; Quote a variable
`42     ; Quote a literal
```

## Building the Updated Language Server

1. **Regenerate the tree-sitter parser:**
   ```bash
   cd tree-sitter-egglog
   tree-sitter generate
   npm install
   ```

2. **Build the language server:**
   ```bash
   cd egglog-language-server
   cargo build --release
   ```

3. **Install/reload the VS Code extension:**
   - Copy the built binary to your extension directory, or
   - Package and install the extension: `vsce package && code --install-extension *.vsix`

## Testing

A test file is included at `examples/quote_test.egg` demonstrating all the supported syntax forms:
- Basic backtick quoting
- Comma unquoting
- Nested structures
- Simple variable and literal quoting

You can verify the parser works correctly with:
```bash
cd tree-sitter-egglog
tree-sitter parse ../examples/quote_test.egg
```

The parse tree should show `quote_expr` and `unquote_expr` nodes with no errors.

## Compatibility

This update is **forward-compatible** with the main egglog implementation. The tree-sitter grammar matches the behavior of egglog's parser in `src/ast/parse.rs`:

- `` `expr `` desugars to `(quote expr)` at parse time
- `,expr` desugars to `(unquote expr)` at parse time
- No semantic changes - pure syntactic sugar

## Benefits

1. **Improved ergonomics:** More concise syntax for reflection-heavy code
2. **Standard conventions:** Follows Lisp quasiquotation conventions familiar to functional programmers
3. **Better tooling:** Proper syntax highlighting and parsing in VS Code
4. **No breaking changes:** Explicit `(quote ...)` and `(unquote ...)` forms still work

## Future Enhancements

Potential improvements:
- Add semantic highlighting to distinguish quoted vs. unquoted code
- Add code completion for quote/unquote operators
- Add snippets for common quoting patterns
- Improve error messages for malformed quote expressions
