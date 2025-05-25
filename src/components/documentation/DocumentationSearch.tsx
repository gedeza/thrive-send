export function DocumentationSearch({ onSearch }: { onSearch: (query: string) => void }) {
    return (
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search documentation..."
          className="pl-8 w-full"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    );
  }