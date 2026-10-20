#!/usr/bin/env python3
"""Conservative publication guard for Architectarium's tracked repository files.

Detects selected high-confidence risky paths and content signatures.
Passing does NOT establish that prose, binary assets, history, or provenance are safe.
"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOCKED_PATHS = (
    re.compile(r"(^|/)\.env($|\.)", re.I),
    re.compile(r"\.(?:pem|p12|pfx|key|sqlite|sqlite3|db|eml|mbox|har|log|zip|7z|tar|gz)$", re.I),
    re.compile(r"(^|/)(?:id_rsa|id_ed25519|credentials\.json|secrets\.json)$", re.I),
    re.compile(r"(^|/)(?:conversation[-_ ]?export|chat[-_ ]?export|private[-_ ]?notes)(?:/|\.|$)", re.I),
)
CHECKS = (
    ("private-key material", re.compile(r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----")),
    ("credential token", re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{24,}|AKIA[0-9A-Z]{16})\b")),
    ("raw chat delimiter", re.compile(r"<\|(?:im_start|im_end)\|>|\[im_start\]|<<< BEGIN OF CONVERSATION >>>")),
    ("role-tagged transcript", re.compile(r"(?m)^\s*(?:USER|ASSISTANT|SYSTEM|DEVELOPER):\s+\S")),
    ("private context serialization", re.compile(r"model_editable_context|sandbox:/mnt/data/|<MemoryCite\s*/>")),
    ("absolute local account path", re.compile(r"(?:/home/[A-Za-z0-9_.-]+/|[A-Za-z]:\\\\Users\\\\[^\\\\]+\\\\)")),
    ("merge conflict", re.compile(r"(?m)^(?:<{7}|>{7}) ")),
)
# The implementation documents the patterns as executable code.
SELF = "scripts/publication_guard.py"
REQUIRED = ("CONSTITUTION.md", "AGENTS.md")
MAX_TEXT_BYTES = 3_000_000


def scan_name(name):
    return [f"{name}: sensitive or opaque file path" for p in BLOCKED_PATHS if p.search(name)]


def scan_content(name, content):
    return [f"{name}: possible {label}" for label, p in CHECKS if p.search(content)]


def main():
    paths = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=ROOT,
        capture_output=True,
        check=True,
    ).stdout
    names = [p.decode("utf-8", errors="replace") for p in paths.split(b"\0") if p]
    failures = []
    warnings = []
    for required in REQUIRED:
        if required not in names:
            failures.append(f"missing required governance file: {required}")
    for name in names:
        failures.extend(scan_name(name))
        file = ROOT / name
        if not file.is_file():
            failures.append(f"{name}: tracked file missing")
            continue
        if name == SELF:
            continue
        data = file.read_bytes()
        if b"\0" in data[:4096]:
            warnings.append(f"{name}: binary requires manual asset and metadata review")
            continue
        if len(data) > MAX_TEXT_BYTES:
            warnings.append(f"{name}: large text requires full human/agent provenance review")
        failures.extend(scan_content(name, data.decode("utf-8", errors="replace")))
    for failure in sorted(set(failures)):
        print("BLOCKED:", failure, file=sys.stderr)
    for warning in sorted(set(warnings)):
        print("REVIEW:", warning)
    if failures:
        return 1
    print(f"Publication signature check passed for {len(names)} tracked files.")
    print("This does not certify language, provenance, history, imagery, or release rights.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
