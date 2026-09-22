import hashlib
import hmac
from typing import Any

import httpx

from app.core.config import settings


class PaymentProviderError(Exception):
    """Raised when the payment provider cannot fulfill a request."""


class PaymentSignatureError(Exception):
    """Raised when a payment signature is invalid."""


class RazorpayService:
    base_url = "https://api.razorpay.com/v1"

    def __init__(self) -> None:
        self.client = httpx.Client(
            base_url=self.base_url,
            auth=(
                settings.razorpay_key_id,
                settings.razorpay_key_secret,
            ),
            timeout=settings.razorpay_timeout_seconds,
        )

    def close(self) -> None:
        self.client.close()

    def create_order(
        self,
        *,
        amount: int,
        currency: str,
        receipt: str,
    ) -> dict[str, Any]:
        self._require_credentials()

        payload = {
            "amount": amount,
            "currency": currency,
            "receipt": receipt,
        }

        try:
            response = self.client.post(
                "/orders",
                json=payload,
            )
        except httpx.HTTPError as exc:
            raise PaymentProviderError(
                "Unable to reach Razorpay.",
            ) from exc

        if response.is_error:
            raise PaymentProviderError(
                "Razorpay rejected the order.",
            )

        data = self._parse_response(response)

        provider_order_id = data.get("id")

        if not isinstance(provider_order_id, str):
            raise PaymentProviderError(
                "Razorpay response did not contain an order ID.",
            )

        return data

    def get_payment(
        self,
        *,
        payment_id: str,
    ) -> dict[str, Any]:
        self._require_credentials()

        try:
            response = self.client.get(
                f"/payments/{payment_id}",
            )
        except httpx.HTTPError as exc:
            raise PaymentProviderError(
                "Unable to reach Razorpay.",
            ) from exc

        if response.is_error:
            raise PaymentProviderError(
                "Unable to retrieve payment from Razorpay.",
            )

        return self._parse_response(response)

    @staticmethod
    def verify_payment_signature(
        *,
        order_id: str,
        payment_id: str,
        signature: str,
    ) -> bool:
        message = f"{order_id}|{payment_id}".encode()

        expected_signature = hmac.new(
            settings.razorpay_key_secret.encode("utf-8"),
            message,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(
            expected_signature,
            signature,
        )

    @staticmethod
    def verify_webhook_signature(
        *,
        raw_body: bytes,
        signature: str,
    ) -> bool:
        expected_signature = hmac.new(
            settings.razorpay_webhook_secret.encode(
                "utf-8",
            ),
            raw_body,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(
            expected_signature,
            signature,
        )

    def _require_credentials(self) -> None:
        if not settings.razorpay_key_id:
            raise PaymentProviderError(
                "Razorpay key ID is not configured.",
            )

        if not settings.razorpay_key_secret:
            raise PaymentProviderError(
                "Razorpay key secret is not configured.",
            )
        if not settings.razorpay_webhook_secret:
            raise PaymentProviderError(
                "Razorpay webhook secret is not configured.",
            )

    @staticmethod
    def _parse_response(
        response: httpx.Response,
    ) -> dict[str, Any]:
        try:
            data = response.json()
        except ValueError as exc:
            raise PaymentProviderError(
                "Razorpay returned an invalid response.",
            ) from exc

        if not isinstance(data, dict):
            raise PaymentProviderError(
                "Razorpay returned an invalid response.",
            )

        return data
