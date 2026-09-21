from dataclasses import dataclass

import boto3
from botocore.client import BaseClient
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import settings


class StorageError(Exception):
    pass


@dataclass(frozen=True)
class StoredObjectMetadata:
    size_bytes: int
    content_type: str | None


class StorageService:
    def __init__(self) -> None:
        self.bucket_name = settings.s3_bucket_name

        self.client = self._create_client(
            endpoint_url=settings.s3_endpoint_url,
        )

        presign_endpoint = settings.s3_public_endpoint_url or settings.s3_endpoint_url

        self.presign_client = self._create_client(
            endpoint_url=presign_endpoint,
        )

    @staticmethod
    def _create_client(
        *,
        endpoint_url: str | None,
    ) -> BaseClient:
        client_kwargs: dict[str, object] = {
            "service_name": "s3",
            "region_name": settings.s3_region,
            "config": Config(
                signature_version="s3v4",
                s3={
                    "addressing_style": "path",
                },
            ),
        }

        if settings.s3_access_key_id:
            client_kwargs["aws_access_key_id"] = settings.s3_access_key_id

        if settings.s3_secret_access_key:
            client_kwargs["aws_secret_access_key"] = settings.s3_secret_access_key

        if endpoint_url:
            client_kwargs["endpoint_url"] = endpoint_url

        return boto3.client(**client_kwargs)

    def create_upload_url(
        self,
        *,
        storage_key: str,
        content_type: str,
    ) -> str:
        try:
            return self.presign_client.generate_presigned_url(
                ClientMethod="put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": storage_key,
                    "ContentType": content_type,
                },
                ExpiresIn=(settings.photo_upload_url_expiry_seconds),
                HttpMethod="PUT",
            )
        except (BotoCoreError, ClientError) as exc:
            raise StorageError("Unable to create upload URL.") from exc

    def create_view_url(
        self,
        *,
        storage_key: str,
    ) -> str:
        try:
            return self.presign_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": storage_key,
                },
                ExpiresIn=(settings.photo_view_url_expiry_seconds),
                HttpMethod="GET",
            )
        except (BotoCoreError, ClientError) as exc:
            raise StorageError("Unable to create view URL.") from exc

    def get_object_metadata(
        self,
        *,
        storage_key: str,
    ) -> StoredObjectMetadata:
        try:
            response = self.client.head_object(
                Bucket=self.bucket_name,
                Key=storage_key,
            )
        except (BotoCoreError, ClientError) as exc:
            raise StorageError("Unable to verify uploaded object.") from exc

        return StoredObjectMetadata(
            size_bytes=response["ContentLength"],
            content_type=response.get("ContentType"),
        )
