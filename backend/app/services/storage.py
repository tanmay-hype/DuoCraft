from dataclasses import dataclass
from urllib.parse import urlsplit, urlunsplit

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
            client_kwargs["aws_secret_access_key"] = (
                settings.s3_secret_access_key
            )

        if settings.s3_endpoint_url:
            client_kwargs["endpoint_url"] = settings.s3_endpoint_url

        self.client: BaseClient = boto3.client(**client_kwargs)
        self.bucket_name = settings.s3_bucket_name

    def create_upload_url(
        self,
        *,
        storage_key: str,
        content_type: str,
    ) -> str:
        try:
            upload_url = self.client.generate_presigned_url(
                ClientMethod="put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": storage_key,
                    "ContentType": content_type,
                },
                ExpiresIn=settings.photo_upload_url_expiry_seconds,
                HttpMethod="PUT",
            )
        except (BotoCoreError, ClientError) as exc:
            raise StorageError(
                "Unable to create upload URL."
            ) from exc

        return self._replace_endpoint_for_browser(upload_url)

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
            raise StorageError(
                "Unable to verify uploaded object."
            ) from exc

        return StoredObjectMetadata(
            size_bytes=response["ContentLength"],
            content_type=response.get("ContentType"),
        )

    @staticmethod
    def _replace_endpoint_for_browser(url: str) -> str:
        public_endpoint = settings.s3_public_endpoint_url

        if not public_endpoint:
            return url

        original = urlsplit(url)
        public = urlsplit(public_endpoint)

        return urlunsplit(
            (
                public.scheme,
                public.netloc,
                original.path,
                original.query,
                original.fragment,
            )
        )