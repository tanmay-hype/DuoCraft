from celery import Celery

from app.core.config import settings
from app.core.database import SessionLocal
from app.services.notification_providers import NotificationDeliveryError
from app.services.notifications import NotificationService

celery_app = Celery(
    "duocraft",
    broker=settings.redis_url,
    backend=settings.redis_url,
)
celery_app.conf.update(
    task_default_queue=settings.notification_queue_name,
    task_routes={
        "app.worker.deliver_notification": {
            "queue": settings.notification_queue_name,
        },
    },
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(
    bind=True,
    name="app.worker.deliver_notification",
    max_retries=settings.notification_max_retries,
)
def deliver_notification(task, notification_id: str) -> str:
    db = SessionLocal()

    try:
        try:
            result = NotificationService(db).process(notification_id)
        except NotificationDeliveryError as exc:
            raise task.retry(
                exc=exc,
                countdown=settings.notification_retry_delay_seconds,
            ) from exc

        return result
    finally:
        db.close()