## Clean Code

### Variable naming conventions

Avoid abbreviations; prefer descriptive, intention-revealing names.

Examples:

```
amt → amount
qty → quantity
dest → destination
src → source
errMsg → errorMessage
```

### Boolean variables name

Boolean variable names should either start with: has or is

**Example:**

```tsx
const { control, register, formState } = form
const hasFormChanged = formState.isDirty
```
