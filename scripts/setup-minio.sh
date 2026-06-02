#!/usr/bin/env sh
set -e

mc alias set local "$MINIO_HOST" minioadmin minioadmin

BUCKET_NAME="lazari-ways"

echo "Creating bucket..."
mc mb local/$BUCKET_NAME --with-lock
# echo "Created bucket $BUCKET_NAME"
mc anonymous set private local/$BUCKET_NAME
# echo "Set bucket policy to private"
mc anonymous set public local/$BUCKET_NAME/vacancies
# echo "Created bucket $BUCKET_NAME/vacancies"
# mc policy set public local/$BUCKET_NAME/vacancies
# echo "Set bucket policy to public for $BUCKET_NAME/vacancies"

echo "Creating service account..."
mc admin user svcacct add local/ minioadmin \
  --access-key MINIO_ACCESS_KEY \
  --secret-key MINIO_SECRET_KEY

echo "MinIO setup complete!"
