import asyncio
from typing import Any, Literal, Protocol, TypedDict


class LegacyResponse(TypedDict):
    status: int
    headers: dict[str, str | None]
    body: Any


class LegacyClient(Protocol):
    async def get_account(
        self,
        account_id: str,
    ) -> LegacyResponse:
        ...


class AccountStatus(TypedDict):
    accountId: str
    state: Literal["active", "suspended", "closed"]
    updatedAt: str | None


class AdapterError(TypedDict, total=False):
    code: Literal[
        "not_found",
        "rate_limited",
        "timeout",
        "unavailable",
        "malformed_response",
    ]
    retryAfterSeconds: int


class AdapterResult(TypedDict, total=False):
    ok: bool
    account: AccountStatus
    error: AdapterError


class LegacyAccountAdapter:
    def __init__(self, client: LegacyClient):
        self.client = client

    async def get_status(
        self,
        account_id: str,
    ) -> AdapterResult:
        try:
            resp = await self.client.get_account(account_id)

            if resp["status"] == 404:
                return {
                    "ok": False,
                    "error": {
                        "code": "not_found",
                    },
                }

            if resp["status"] == 429:
                raw_retry_after = resp["headers"].get("retry-after")

                retry_after_seconds = None

                if raw_retry_after is not None:
                    try:
                        parsed = int(raw_retry_after)

                        if parsed >= 0:
                            retry_after_seconds = parsed
                    except ValueError:
                        pass

                error: AdapterError = {
                    "code": "rate_limited",
                }

                if retry_after_seconds is not None:
                    error["retryAfterSeconds"] = retry_after_seconds

                return {
                    "ok": False,
                    "error": error,
                }

            if resp["status"] == 503:
                return {
                    "ok": False,
                    "error": {
                        "code": "unavailable",
                    },
                }

            if resp["status"] != 200:
                return {
                    "ok": False,
                    "error": {
                        "code": "unavailable",
                    },
                }

            body = resp["body"]

            # Legacy API can return logical errors with HTTP 200
            if isinstance(body, dict) and "error" in body:
                error = body.get("error")

                if (
                    isinstance(error, dict)
                    and error.get("code") == "MISSING"
                ):
                    return {
                        "ok": False,
                        "error": {
                            "code": "not_found",
                        },
                    }

                return {
                    "ok": False,
                    "error": {
                        "code": "malformed_response",
                    },
                }

            account = self._normalize_account(body)

            if account is None:
                return {
                    "ok": False,
                    "error": {
                        "code": "malformed_response",
                    },
                }

            return {
                "ok": True,
                "account": account,
            }

        except asyncio.TimeoutError:
            return {
                "ok": False,
                "error": {
                    "code": "timeout",
                },
            }

        except Exception:
            return {
                "ok": False,
                "error": {
                    "code": "unavailable",
                },
            }

    def _normalize_account(
        self,
        body: Any,
    ) -> AccountStatus | None:
        if not isinstance(body, dict):
            return None

        # v1
        if "status_code" in body:
            account_id = body.get("account_id")
            status_code = body.get("status_code")
            updated_at = body.get("updated_at")

            has_expected_types = (
                isinstance(account_id, str)
                and len(account_id.strip()) > 0
                and isinstance(status_code, str)
                and (
                    updated_at is None
                    or isinstance(updated_at, str)
                )
            )

            if not has_expected_types:
                return None

            state_map: dict[
                str,
                Literal["active", "suspended", "closed"],
            ] = {
                "A": "active",
                "S": "suspended",
                "C": "closed",
            }

            state = state_map.get(status_code)

            if state is None:
                return None

            return {
                "accountId": account_id,
                "state": state,
                "updatedAt": updated_at,
            }

        # v2
        if "state" in body:
            account_id = body.get("accountId")
            state_code = body.get("state")
            updated_at = body.get("updatedAt")

            has_expected_types = (
                isinstance(account_id, str)
                and len(account_id.strip()) > 0
                and isinstance(state_code, str)
                and (
                    updated_at is None
                    or isinstance(updated_at, str)
                )
            )

            if not has_expected_types:
                return None

            state_map: dict[
                str,
                Literal["active", "suspended", "closed"],
            ] = {
                "ACTIVE": "active",
                "SUSPENDED": "suspended",
                "CLOSED": "closed",
            }

            state = state_map.get(state_code)

            if state is None:
                return None

            return {
                "accountId": account_id,
                "state": state,
                "updatedAt": updated_at,
            }

        return None