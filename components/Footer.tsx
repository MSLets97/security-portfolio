import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-32 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>Matome Samson Letsoalo</p>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>Cloud Security Analyst · Midrand, Gauteng</p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Portfolio</p>
              <div className="flex flex-col gap-2">
                <Link href="/#about"  className="text-sm transition-colors" style={{ color: "var(--text-2)" }}>About</Link>
                <Link href="/#skills" className="text-sm transition-colors" style={{ color: "var(--text-2)" }}>Skills</Link>
                <Link href="/labs"    className="text-sm transition-colors" style={{ color: "var(--text-2)" }}>Labs</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Connect</p>
              <div className="flex flex-col gap-2">
                <a href="https://linkedin.com/in/mslets97" target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: "var(--text-2)" }}>LinkedIn ↗</a>
                <a href="https://github.com/YOUR_GITHUB"   target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: "var(--text-2)" }}>GitHub ↗</a>
                <a href="mailto:mslets6040@gmail.com" className="text-sm" style={{ color: "var(--text-2)" }}>Email</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>© 2026 Matome Samson Letsoalo. Built with Next.js, deployed on Vercel.</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>Midrand, Gauteng · Open to Johannesburg & Hybrid</p>
        </div>
      </div>
    </footer>
  );
}
