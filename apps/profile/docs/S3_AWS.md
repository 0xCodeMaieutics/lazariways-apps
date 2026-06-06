# S3 bucket conventions

This project uses `@workspace/file-upload` package to handle s3 bucket operations.

# import file upload utilities

```ts
import {
  getSignedUrlForDownload,
  uploadToStorage,
} from "@workspace/file-upload/s3-client.ts"
```
