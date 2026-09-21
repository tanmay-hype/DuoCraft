from typing import Any

import httpx

from app.core.config import settings


class PaymentProviderError(Exception):
    """Raised when the payment provider cannot fulfill a request."""


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
        if not settings.razorpay_key_id:
            raise PaymentProviderError(
                "Razorpay key ID is not configured."
            )

        if not settings.razorpay_key_secret:
            raise PaymentProviderError(
                "Razorpay key secret is not configured."
            )

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
                "Unable to reach Razorpay."
            ) from exc

        if response.is_error:
            raise PaymentProviderError(
                "Razorpay rejected the order."
            )

        try:
            data = response.json()
        except ValueError as exc:
            raise PaymentProviderError(
                "Razorpay returned an invalid response."
            ) from exc

        provider_order_id = data.get("id")

        if not isinstance(provider_order_id, str):
            raise PaymentProviderError(
                "Razorpay response did not contain an order ID."
            )

        return data