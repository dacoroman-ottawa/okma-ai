"""
Tests for the email service.

Covers the three defects documented in docs/email-findings.md:
  1. The reset link must be built from FRONTEND_URL, not a hardcoded localhost.
  2. The blocking smtplib send must not run on the event loop, and must
     use an explicit timeout.
  3. Delivery failures must surface to the caller instead of being swallowed.
"""
import asyncio
import os
import subprocess
import sys
import time
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from backend.services import email as email_service

PROJECT_ROOT = Path(__file__).resolve().parents[2]

pytestmark = pytest.mark.real_email_service


@pytest.fixture
def real_sends(monkeypatch):
    """Enable real-send mode with dummy credentials for the duration of a test."""
    monkeypatch.setattr(email_service, "SEND_REAL_EMAILS", True)
    monkeypatch.setattr(email_service, "SMTP_USER", "sender@example.com")
    monkeypatch.setattr(email_service, "SMTP_PASSWORD", "app-password")


@pytest.fixture
def smtp_mock(real_sends):
    """Intercept smtplib.SMTP and hand back the mock server object."""
    with patch.object(email_service.smtplib, "SMTP") as smtp_cls:
        server = MagicMock()
        smtp_cls.return_value.__enter__.return_value = server
        yield smtp_cls, server


class TestFrontendUrl:
    """Defect 1: the emailed link must point at the configured frontend."""

    def test_reset_link_uses_configured_frontend_url(self, monkeypatch):
        monkeypatch.setattr(
            email_service, "FRONTEND_URL", "https://academy.example.com"
        )
        with patch.object(email_service, "_deliver", return_value=True) as deliver:
            asyncio.run(email_service.send_password_reset_email("a@b.com", "Ann"))

        body = deliver.call_args.args[2]
        assert "https://academy.example.com/reset-password?token=" in body
        assert "localhost:3000" not in body

    def test_welcome_link_uses_configured_frontend_url(self, monkeypatch):
        monkeypatch.setattr(
            email_service, "FRONTEND_URL", "https://academy.example.com"
        )
        with patch.object(email_service, "_deliver", return_value=True) as deliver:
            asyncio.run(
                email_service.send_welcome_email("a@b.com", "Ann", "Teacher")
            )

        body = deliver.call_args.args[2]
        assert "https://academy.example.com/reset-password?token=" in body
        assert "localhost:3000" not in body

    def test_trailing_slash_does_not_double_up(self, monkeypatch):
        monkeypatch.setattr(
            email_service, "FRONTEND_URL", "https://academy.example.com/"
        )
        with patch.object(email_service, "_deliver", return_value=True) as deliver:
            asyncio.run(email_service.send_password_reset_email("a@b.com", "Ann"))

        assert "example.com//reset-password" not in deliver.call_args.args[2]

    def test_defaults_to_localhost_for_development(self):
        """With no FRONTEND_URL configured, local development still works.

        Run in a subprocess: reloading the module in-process would rebind
        EmailDeliveryError to a new class and break every route that caught
        the original.
        """
        env = {k: v for k, v in os.environ.items() if k != "FRONTEND_URL"}

        # Neutralise load_dotenv so a developer's own .env cannot affect this.
        snippet = (
            "import dotenv; dotenv.load_dotenv = lambda *a, **k: None\n"
            "from backend.services.email import FRONTEND_URL; print(FRONTEND_URL)"
        )
        result = subprocess.run(
            [sys.executable, "-c", snippet],
            cwd=str(PROJECT_ROOT),
            env=env,
            capture_output=True,
            text=True,
        )

        assert result.returncode == 0, result.stderr
        assert result.stdout.strip() == "http://localhost:3000"


class TestNonBlocking:
    """Defect 2: smtplib must not block the event loop, and must time out."""

    def test_send_does_not_block_the_event_loop(self, real_sends):
        """A slow SMTP server must not stall other coroutines.

        The send sleeps for 0.3s. A concurrent ticker needs ~0.1s of loop time.
        If the send runs on the event loop, the ticker cannot finish until the
        send is done; off the loop, it finishes well before.
        """
        SEND_SECONDS = 0.3

        def slow_smtp(*args, **kwargs):
            time.sleep(SEND_SECONDS)
            return MagicMock()

        async def ticker():
            for _ in range(5):
                await asyncio.sleep(0.02)
            return time.perf_counter()

        async def scenario():
            start = time.perf_counter()
            with patch.object(email_service.smtplib, "SMTP", side_effect=slow_smtp):
                _, ticker_done = await asyncio.gather(
                    email_service.send_password_reset_email("a@b.com", "Ann"),
                    ticker(),
                )
            return ticker_done - start

        ticker_elapsed = asyncio.run(scenario())

        assert ticker_elapsed < SEND_SECONDS, (
            f"ticker took {ticker_elapsed:.3f}s, so the send blocked the loop"
        )

    def test_smtp_connection_uses_a_timeout(self, smtp_mock):
        smtp_cls, _ = smtp_mock
        asyncio.run(email_service.send_password_reset_email("a@b.com", "Ann"))

        assert smtp_cls.call_args.kwargs.get("timeout") == email_service.SMTP_TIMEOUT


class TestFailuresSurface:
    """Defect 3: delivery failures must reach the caller."""

    def test_smtp_error_raises_email_delivery_error(self, real_sends):
        with patch.object(
            email_service.smtplib, "SMTP", side_effect=OSError("connection refused")
        ):
            with pytest.raises(email_service.EmailDeliveryError):
                asyncio.run(
                    email_service.send_password_reset_email("a@b.com", "Ann")
                )

    def test_missing_credentials_raises_email_delivery_error(self, monkeypatch):
        monkeypatch.setattr(email_service, "SEND_REAL_EMAILS", True)
        monkeypatch.setattr(email_service, "SMTP_USER", "")
        monkeypatch.setattr(email_service, "SMTP_PASSWORD", "")

        with pytest.raises(email_service.EmailDeliveryError):
            asyncio.run(email_service.send_welcome_email("a@b.com", "Ann", "Student"))

    def test_successful_send_returns_true(self, smtp_mock):
        _, server = smtp_mock
        result = asyncio.run(
            email_service.send_password_reset_email("a@b.com", "Ann")
        )

        assert result is True
        assert server.starttls.called
        assert server.login.called
        assert server.sendmail.called

    def test_simulation_mode_returns_false_not_true(self, monkeypatch):
        """Simulation mode must not masquerade as a successful delivery."""
        monkeypatch.setattr(email_service, "SEND_REAL_EMAILS", False)

        result = asyncio.run(
            email_service.send_password_reset_email("a@b.com", "Ann")
        )

        assert result is False
