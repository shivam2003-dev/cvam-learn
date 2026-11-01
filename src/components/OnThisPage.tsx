"use client";

import { useEffect, useState } from "react";

export function OnThisPage({
  items,
}: {
  items: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto px-5 py-8 xl:block"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-faint">
        On this page
      </p>
      <ul className="mt-3 space-y-1 border-l border-line text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`-ml-px block border-l px-3 py-1 ${active === item.id ? "border-lime text-text" : "border-transparent text-faint hover:text-soft"}`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
