import Link from "next/link";

/** Site-wide footer. Keeps the privacy policy one click away from every page. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 font-mono text-xs text-faint">
        <p>
          cvam<span className="text-lime">.learn</span> · learn it, map it, prove it
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/privacy" className="hover:text-text">
            Privacy Policy
          </Link>
          <Link href="/courseware" className="hover:text-text">
            Courseware
          </Link>
          <Link href="/paths" className="hover:text-text">
            Paths
          </Link>
          <a
            href="https://shivam2003.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text"
          >
            Blog
          </a>
        </nav>
      </div>
    </footer>
  );
}
