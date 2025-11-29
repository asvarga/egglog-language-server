# Quote/Unquote Syntax - Quick Reference

## Syntax Comparison

| Old Syntax (Explicit) | New Syntax (Backtick) | Desugared Form |
|-----------------------|----------------------|----------------|
| `(quote x)` | `` `x `` | `(expr-var "x")` |
| `(quote 42)` | `` `42 `` | `(expr-lit 42)` |
| `(quote (f a b))` | `` `(f a b) `` | `(expr-call "f" ...)` |
| `(quote (f (unquote e)))` | `` `(f ,e) `` | Splices `e` without quoting |

## Examples

### Modal Reasoning
```egglog
; Old way
(Believes (Alice) (quote (Knows (Bob) (Charlie))))

; New way with backtick
(Believes (Alice) `(Knows (Bob) (Charlie)))
```

### Expression Splicing
```egglog
; Build expressions dynamically
(let bob `(Bob))
(let charlie `(Charlie))

; Old way
(Believes (Alice) (quote (Knows (unquote bob) (unquote charlie))))

; New way with comma
(Believes (Alice) `(Knows ,bob ,charlie))
```

### Nested Quoting
```egglog
; Backtick works recursively
(Believes (Alice) `(outer (middle (inner x))))
```

## Tree-sitter Parse Tree

Input: `` `(f ,x) ``

```
quote_expr
├── backtick: `
└── expr
    └── callexpr
        ├── lparen: (
        ├── ident: f
        ├── expr
        │   └── unquote_expr
        │       ├── comma_op: ,
        │       └── expr
        │           └── ident: x
        └── rparen: )
```

## Syntax Highlighting

- **Backtick (`` ` ``)**: Operator color
- **Comma (`,`)**: Operator color
- **Quote expressions**: String.special color
- **Keywords (`quote`, `unquote`)**: Keyword color

## Implementation Files

- **Grammar**: `tree-sitter-egglog/grammar.js`
- **Highlights**: `tree-sitter-egglog/queries/highlights.scm`
- **TextMate**: `syntaxes/eggsmol.tmLanguage.json`
- **Parser**: `src/ast/parse.rs` (egglog core)

## Testing

Run the parser on test files:
```bash
cd tree-sitter-egglog
tree-sitter parse examples/quote_test.egg
```

Expected output: Clean parse tree with `quote_expr` and `unquote_expr` nodes, no errors.
