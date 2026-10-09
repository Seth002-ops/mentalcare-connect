import ipaddress
import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from auth import get_current_user
from cache_service import delete_all_cache, get_cache_info
from database import get_db
from models import SecurityEvent
from security_service import (
    block_ip,
    get_blocked_ips,
    record_security_event,
    redis_ready,
    unblock_ip,
)

security_router = APIRouter(prefix="/admin/security", tags=["Admin Security"])


class BlockIPRequest(BaseModel):
    ip: str
    reason: str | None = ""
    duration_seconds: int | None = None
    permanent: bool = True


class UnblockIPRequest(BaseModel):
    ip: str


def require_admin(current_user=Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return current_user


def validate_ip(ip: str) -> bool:
    try:
        ipaddress.ip_address(ip)
        return True

    except Exception:
        return False


def serialize_event(event: SecurityEvent) -> dict:
    details = {}

    if event.details:
        try:
            details = json.loads(event.details)

        except Exception:
            details = {
                "raw": event.details,
            }

    return {
        "id": event.id,
        "created_at": event.created_at,
        "ip_address": event.ip_address,
        "user_agent": event.user_agent,
        "user_id": event.user_id,
        "event_type": event.event_type,
        "severity": event.severity,
        "method": event.method,
        "path_hit": event.path_hit,
        "status_code": event.status_code,
        "details": details,
        "action_taken": event.action_taken,
    }


@security_router.get("/status")
def security_status(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    now = datetime.utcnow()
    last_24_hours = now - timedelta(hours=24)

    total_events = db.query(SecurityEvent).count()

    events_last_24h = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.created_at >= last_24_hours)
        .count()
    )

    critical_last_24h = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.created_at >= last_24_hours,
            SecurityEvent.severity == "critical",
        )
        .count()
    )

    high_last_24h = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.created_at >= last_24_hours,
            SecurityEvent.severity == "high",
        )
        .count()
    )

    blocked_ips = get_blocked_ips()

    return {
        "redis_available": redis_ready(),
        "blocked_ip_count": len(blocked_ips),
        "total_security_events": total_events,
        "events_last_24h": events_last_24h,
        "critical_last_24h": critical_last_24h,
        "high_last_24h": high_last_24h,
        "cache": get_cache_info(),
    }


@security_router.get("/events")
def security_events(
    limit: int = 50,
    severity: str | None = None,
    event_type: str | None = None,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    limit = min(max(limit, 1), 200)

    query = db.query(SecurityEvent)

    if severity:
        query = query.filter(SecurityEvent.severity == severity)

    if event_type:
        query = query.filter(SecurityEvent.event_type == event_type)

    events = (
        query.order_by(desc(SecurityEvent.created_at))
        .limit(limit)
        .all()
    )

    return {
        "count": len(events),
        "events": [serialize_event(event) for event in events],
    }


@security_router.get("/blocked-ips")
def blocked_ips(admin=Depends(require_admin)):
    ips = get_blocked_ips()

    return {
        "count": len(ips),
        "blocked_ips": ips,
    }


@security_router.post("/block-ip")
def admin_block_ip(
    payload: BlockIPRequest,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    ip = payload.ip.strip()

    if not validate_ip(ip):
        raise HTTPException(status_code=400, detail="Invalid IP address")

    if ip in ("127.0.0.1", "0.0.0.0", "::1"):
        raise HTTPException(
            status_code=400,
            detail="You cannot block localhost because it may lock you out during development.",
        )

    blocked = block_ip(
        ip,
        reason=payload.reason or "manual_admin_block",
        duration_seconds=payload.duration_seconds,
        permanent=payload.permanent,
    )

    if not blocked:
        raise HTTPException(
            status_code=503,
            detail="Redis is unavailable. IP could not be blocked.",
        )

    record_security_event(
        db,
        ip_address=ip,
        event_type="manual_ip_block",
        severity="high",
        method="POST",
        path_hit="/admin/security/block-ip",
        status_code=200,
        user_id=admin.id,
        details={
            "reason": payload.reason,
            "duration_seconds": payload.duration_seconds,
            "permanent": payload.permanent,
            "blocked_by_admin_id": admin.id,
        },
        action_taken="ip_blocked",
    )

    return {
        "message": f"IP {ip} blocked",
        "ip": ip,
        "permanent": payload.permanent,
        "duration_seconds": payload.duration_seconds,
    }


@security_router.post("/unblock-ip")
def admin_unblock_ip(
    payload: UnblockIPRequest,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    ip = payload.ip.strip()

    if not validate_ip(ip):
        raise HTTPException(status_code=400, detail="Invalid IP address")

    unblocked = unblock_ip(ip)

    if not unblocked:
        raise HTTPException(
            status_code=503,
            detail="Redis is unavailable. IP could not be unblocked.",
        )

    record_security_event(
        db,
        ip_address=ip,
        event_type="manual_ip_unblock",
        severity="medium",
        method="POST",
        path_hit="/admin/security/unblock-ip",
        status_code=200,
        user_id=admin.id,
        details={
            "unblocked_by_admin_id": admin.id,
        },
        action_taken="ip_unblocked",
    )

    return {
        "message": f"IP {ip} unblocked",
        "ip": ip,
    }


@security_router.post("/cache/clear")
def clear_cache(admin=Depends(require_admin)):
    deleted = delete_all_cache()

    return {
        "message": "Cache cleared",
        "deleted_keys": deleted,
    }