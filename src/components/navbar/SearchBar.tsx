const SearchBar: React.FC = () => {
  return (
    <div className="hidden min-w-6/12 max-w-sm flex-1 px-4 md:block">
      <div className="group flex items-center gap-2 rounded-md border border-surface-500/30 px-2.5 py-1.5 text-xs text-surface-200 shadow-sm outline-none hover:border-surface-500 focus-within:border-primary-100/30 transition-all duration-150">
        <span className="text-[11px] text-surface-400">/</span>

        <input
          className="w-full bg-transparent text-[12px] text-surface-100 placeholder:text-surface-500 focus:outline-none transition-all duration-150"
          placeholder="Search endpoints, groups, models…"
        />

        <span className="rounded w-14 bg-surface-900/60 px-1.5 py-1.5 text-[9px] font-medium text-surface-300">
          Ctrl + Q
        </span>
      </div>
    </div>
  );
};

export default SearchBar;