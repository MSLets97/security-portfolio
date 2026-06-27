export function GitHubRepoCard({
  name,
  description,
  tags,
  href,
}: {
  name: string;
  description: string;
  tags: string[];
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl p-7 max-w-2xl mx-auto transition-all"
      style={{ backgroundColor: "#0d1117", border: "1px solid #30363d" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="#7d8590">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: "#58a6ff" }}>{name}</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 16 16" fill="#7d8590">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.1-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.47-.55.38A8.014 8.014 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
        </svg>
      </div>

      <p className="text-sm leading-relaxed mb-5" style={{ color: "#8b949e" }}>
        {description}
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {tags.map((t) => (
          <span
            key={t}
            className="text-xs px-2.5 py-0.5 rounded-full font-mono"
            style={{ backgroundColor: "#161b22", color: "#79c0ff", border: "1px solid #30363d" }}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#58a6ff" }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="#e3b341">
          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
        </svg>
        View on GitHub →
      </div>
    </a>
  );
}
