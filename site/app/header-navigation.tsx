"use client";

import { useRef, useState, type KeyboardEvent } from "react";

const links = [
  ["#sobre", "Sobre"],
  ["#servicos", "Serviços"],
  ["#metodo", "Método"],
  ["#projetos", "Projetos"],
  ["#contato", "Contato"],
];

export default function HeaderNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  function handleEscape(event: KeyboardEvent) {
    if (event.key === "Escape" && isOpen && menuButton.current?.getClientRects().length) {
      setIsOpen(false);
      menuButton.current.focus();
    }
  }

  return (
    <>
      <button
        className="menu-toggle"
        type="button"
        ref={menuButton}
        aria-expanded={isOpen}
        aria-controls="header-navigation"
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleEscape}
      >
        Menu
      </button>
      <nav
        id="header-navigation"
        aria-label="Navegação principal"
        data-open={isOpen}
        onKeyDown={handleEscape}
      >
        {links.map(([href, label]) => (
          <a
            key={href}
            href={href}
            className={href === "#contato" ? "nav-contact" : undefined}
            onClick={() => setIsOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}
