"use client";

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/Icons";
import styles from "@/styles/store.module.css";

const drawerBackdropStyle: CSSProperties = {
  background: "rgba(0, 0, 0, 0.74)",
  backdropFilter: "none",
  opacity: 1,
  transition: "none",
};

export function Drawer({
  ariaLabel,
  children,
  onClose,
  open,
  title,
  eyebrow,
}: {
  ariaLabel: string;
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
  eyebrow: string;
}) {
  return (
    <div
      className={`${styles.drawerLayer} ${open ? styles.drawerOpen : ""}`}
      aria-hidden={!open}
    >
      {open ? (
        <button
          className={styles.backdrop}
          data-drawer-backdrop="true"
          type="button"
          style={drawerBackdropStyle}
          aria-label={`Close ${ariaLabel.toLowerCase()} overlay`}
          onClick={onClose}
        />
      ) : null}
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={ariaLabel}>
        <div className={styles.drawerTop}>
          <div>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          <button
            className={styles.mobileClose}
            type="button"
            aria-label={`Close ${ariaLabel.toLowerCase()}`}
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
