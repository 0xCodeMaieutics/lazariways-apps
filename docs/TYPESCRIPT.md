# TypeScript conventions

### TypeScript Coding Standards

- Always use const instead of let.
- Use interface instead of type when possible.
- Use strict null checks.

### Define constant value with uppercase:

```ts
const DEFAULT_SKIP = 0
const DEFAULT_TAKE = 50
```

### Mandatory Async Error Handling: Never leave a Promise rejection unintentionally unhandled. Every asynchronous operation that can reject must either:

- be handled locally using try/catch when using await,
- be handled with .catch() when using Promise chaining, or
- be intentionally propagated to a caller that is explicitly responsible for handling the error.

> Do not generate fire-and-forget Promises without explicit rejection handling. Never silently swallow errors; handle, log, transform, or propagate them appropriately.

### Use explicit nullish comparisons instead of falsy checks when testing whether a value is absent.

```ts
// Bad
if (!user) {
}

// Good — specifically null
if (user === null) {
}

// Good — specifically undefined
if (user === undefined) {
}
```
