#!/usr/bin/env python3
"""Regenerate lessons/index.ts for each course from the lesson files on disk."""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent / "src" / "content"


def camel(slug):
    head, *rest = slug.split("-")
    return head + "".join(word.capitalize() for word in rest)


for directory in sorted(ROOT.glob("*/lessons")):
    slugs = sorted(path.stem for path in directory.glob("*.tsx"))
    imports = "".join(f'import {{ lesson as {camel(s)} }} from "./{s}";\n' for s in slugs)
    entries = "".join(f'  "{s}": {camel(s)},\n' for s in slugs)
    directory.joinpath("index.ts").write_text(
        'import type { Lesson } from "@/lib/types";\n'
        f"{imports}\n"
        "export const lessons: Record<string, Lesson> = {\n"
        f"{entries}"
        "};\n"
    )
    print(directory.parent.name, len(slugs))
