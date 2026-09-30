import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site, sections } from "../data/site.js";
import { MenuIcon, CloseIcon } from "./Icons.jsx";
import SocialLinks from "./SocialLinks.jsx";

export default function MobileNav({ active }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="mobile-nav">
      <div className="mobile-bar">
        <a href="#top" className="brand-mobile">{site.name.toUpperCase()}</a>
        <button ref={toggleRef} className="icon-btn" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
          <MenuIcon />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button ref={closeRef} className="icon-btn overlay-close" aria-label="Close menu" onClick={() => setOpen(false)}>
              <CloseIcon />
            </button>
            <nav aria-label="Mobile">
              <ul>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className={active === s.id ? "active" : ""} onClick={() => setOpen(false)}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <SocialLinks />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
