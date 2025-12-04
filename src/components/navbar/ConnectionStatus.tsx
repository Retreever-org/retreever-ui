const ConnectionStatus: React.FC = () => {
  return (
    <button className="hidden items-center gap-1 rounded-md border border-surface-700 bg-surface-800/80 px-2.5 py-1.5 text-[11px] font-medium text-surface-100 hover:border-surface-400/20 hover:text-primary-200 sm:inline-flex transition-all duration-200">
      <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
      <span>Connected</span>
    </button>
  );
};

export default ConnectionStatus;