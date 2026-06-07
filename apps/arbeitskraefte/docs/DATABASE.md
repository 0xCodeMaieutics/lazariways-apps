# Database conventions

This project uses `@workspace/database` package to handle database queries.

# import client

```ts
import prisma from "@workspace/database/client"

const [applications, totalCount] = await Promise.all([
    prisma.application.findMany({
      skip,
      take: APPLICATIONS_PER_PAGE,
      orderBy: { submittedAt: "desc" },
    }),
    prisma.application.count(),
  ])
```
