#!/usr/bin/env python3
"""Assemble only the approved static preview and its licensed web assets."""
from pathlib import Path
import hashlib
import io
import json
import os
import shutil
import subprocess
import tarfile

root = Path(__file__).resolve().parent
target = root / 'dist'
if target.exists():
    shutil.rmtree(target)
shutil.copytree(root / 'site', target)
config = (target / 'config.js').read_text()
if "mode: 'preview'" not in config or "mode: 'production'" in config:
    raise SystemExit('Refusing to publish an activated lead form')
if list(target.rglob('*.php')) or list(target.rglob('*.otf')):
    raise SystemExit('Unexpected server or desktop font in static preview')
if not os.environ.get('FONTS_BUILD_PASSWORD'):
    raise SystemExit('Font build secret is missing')
result = subprocess.run([
    'openssl', 'enc', '-d', '-aes-256-cbc', '-pbkdf2', '-iter', '200000',
    '-in', str(root / 'font-assets.enc'), '-pass', 'env:FONTS_BUILD_PASSWORD'
], capture_output=True)
if result.returncode:
    raise SystemExit('Font asset decryption failed')
expected = json.loads((root / 'font-assets.json').read_text())
with tarfile.open(fileobj=io.BytesIO(result.stdout), mode='r:gz') as archive:
    members = archive.getmembers()
    if {m.name for m in members} != set(expected) or any(not m.isfile() for m in members):
        raise SystemExit('Unexpected font asset package')
    for member in members:
        data = archive.extractfile(member).read()
        if hashlib.sha256(data).hexdigest() != expected[member.name]:
            raise SystemExit('Font asset integrity check failed')
        (target / 'assets' / member.name).write_bytes(data)
print('Approved offline preview prepared; no server files or desktop fonts included')
