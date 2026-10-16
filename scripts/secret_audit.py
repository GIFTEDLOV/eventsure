#!/usr/bin/env python3
"""Scan the EventSure worktree and every reachable Git blob for common secrets.

The scanner reports only the matching rule and path, never the matched value.
It supplements provider-side secret scanning; it is not a general DLP system.
"""

from __future__ import annotations

import re
import shutil
import subprocess  # nosec B404
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GIT_EXECUTABLE = shutil.which("git")
if GIT_EXECUTABLE is None:
    raise RuntimeError("Git is required to scan the repository history")
RULES: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("private-key PEM", re.compile(r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----")),
    (
        "private key assignment",
        re.compile(
            r"(?i)\b(?:private[_-]?key|mnemonic|seed[_-]?phrase)\b\s*[:=]\s*"
            r"[\"']?(?:0x)?[0-9a-f]{64}\b"
        ),
    ),
    (
        "provider token",
        re.compile(
            r"\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|"
            r"xox[baprs]-[A-Za-z0-9-]{20,}|AKIA[0-9A-Z]{16}|"
            r"vcp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{24,})\b"
        ),
    ),
    (
        "secret assignment",
        re.compile(
            r"(?i)\b(?:client[_-]?secret|access[_-]?token|api[_-]?token|password)\b"
            r"\s*[:=]\s*[\"'][^\"'\s]{24,}[\"']"
        ),
    ),
)


def git_output(*args: str) -> bytes:
    return subprocess.check_output([GIT_EXECUTABLE, *args], cwd=ROOT)  # nosec B603


def scan_text(text: str, path: str, findings: set[tuple[str, str]]) -> None:
    for rule, pattern in RULES:
        if pattern.search(text):
            findings.add((rule, path))


def main() -> int:
    findings: set[tuple[str, str]] = set()
    tracked = git_output("ls-files", "-z").decode().split("\0")
    untracked = git_output("ls-files", "--others", "--exclude-standard", "-z").decode().split("\0")
    worktree_paths = {item for item in (*tracked, *untracked) if item}

    for relative in sorted(worktree_paths):
        name = Path(relative).name.lower()
        if name.startswith(".env") and name not in {".env.example", ".env.sample", ".env.template"}:
            findings.add(("environment file", relative))
        file_path = ROOT / relative
        if file_path.is_file():
            scan_text(file_path.read_bytes().decode("utf-8", errors="ignore"), relative, findings)

    object_rows = git_output("rev-list", "--objects", "--all").decode(errors="replace").splitlines()
    seen: set[str] = set()
    scanned_blobs = 0
    for row in object_rows:
        parts = row.split(" ", 1)
        object_id = parts[0]
        object_path = parts[1] if len(parts) == 2 else "<git object>"
        if object_id in seen:
            continue
        seen.add(object_id)
        kind = subprocess.run(
            [GIT_EXECUTABLE, "cat-file", "-t", object_id],  # nosec B603
            cwd=ROOT,
            capture_output=True,
            check=False,
        )
        if kind.returncode != 0 or kind.stdout.strip() != b"blob":
            continue
        blob = subprocess.run(
            [GIT_EXECUTABLE, "cat-file", "blob", object_id],  # nosec B603
            cwd=ROOT,
            capture_output=True,
            check=True,
        ).stdout
        scanned_blobs += 1
        scan_text(blob.decode("utf-8", errors="ignore"), object_path, findings)

    if findings:
        for rule, relative in sorted(findings):
            print(f"SECRET_SCAN=FAIL rule={rule} path={relative}")
        return 1
    print(f"SECRET_SCAN=PASS worktree_files={len(worktree_paths)} history_blobs={scanned_blobs}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except subprocess.CalledProcessError as error:
        print(f"SECRET_SCAN=ERROR git_command_exit={error.returncode}", file=sys.stderr)
        sys.exit(error.returncode or 1)
