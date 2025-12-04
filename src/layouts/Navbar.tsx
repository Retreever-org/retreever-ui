import type React from "react";
import Logo from "/images/retreever-icon.png";
import GitHubLogo from "/images/github.svg";
import SearchBar from "../components/navbar/SearchBar";
import EnvDisplay from "../components/navbar/EnvDisplay";
import ConnectionStatus from "../components/navbar/ConnectionStatus";

export const Navbar: React.FC = () => {
  return (
    <header className="border-b border-surface-500/30 bg-transparent">
      <div className="mx-auto flex h-12 items-center justify-between px-4 sm:px-6">
        
        {/* Left: Logo + product */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7">
              <img
                className="h-full w-full object-contain"
                src={Logo}
                alt="Retreever logo"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold tracking-wide text-surface-50">
                Retreever
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-surface-300/80">
                API Studio
              </span>
            </div>
          </div>

          <EnvDisplay />

        </div>

        {/* Center: Search (hidden on very small screens) */}
        <SearchBar />

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          
          <ConnectionStatus />

          <a
            target="_blank"
            href="https://retreever.dev"
            title="Retreever"
            className="rounded-md bg-primary-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-primary-600 transition-all duration-200"
          >
            Visit Site
          </a>

          <a
            target="_blank"
            href="https://github.com/Retreever-org"
            title="GitHub Organization"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-surface-700 bg-surface-800/80 text-[11px] font-semibold text-surface-100"
          >
            <img className="opacity-80 hover:opacity-100 transition-all duration-200" src={GitHubLogo} alt="GitHub" />
          </a>
        </div>
      </div>
    </header>
  );
};
