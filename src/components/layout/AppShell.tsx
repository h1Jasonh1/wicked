"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/navigation/Navbar";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutDrawer } from "@/components/cart/CheckoutDrawer";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Icon } from "@/components/ui/Icons";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { StoreProvider, useStore } from "@/store/StoreProvider";
import { useBodyScrollLock, useEscapeKey } from "@/hooks/useOverlayControls";
import styles from "@/styles/store.module.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <ShellFrame>{children}</ShellFrame>
      </StoreProvider>
    </AuthProvider>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAccountRoute =
    pathname === "/account" || pathname.startsWith("/account/");
  const pageTransitionKey = isAccountRoute ? "account" : pathname;
  const shellRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const {
    cartOpen,
    checkoutOpen,
    quickViewProduct,
    setCartOpen,
    setCheckoutOpen,
    setQuickViewProduct,
    setSearchOpen,
    setWishlistOpen,
    toast,
    wishlistOpen,
  } = useStore();

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname, setSearchOpen]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const previous = previousPathname.current;

    previousPathname.current = pathname;

    if (hash) {
      window.requestAnimationFrame(() => {
        document
          .getElementById(decodeURIComponent(hash))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    const wasAccountRoute = Boolean(
      previous === "/account" || previous?.startsWith("/account/"),
    );

    if (isAccountRoute && wasAccountRoute) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isAccountRoute, pathname]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 16);
        setShowTop(window.scrollY > 700);
        shellRef.current?.style.setProperty(
          "--wicked-scroll",
          `${Math.min(window.scrollY * -0.025, 0)}px`,
        );
        frame = 0;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    const root = shellRef.current;

    if (!root || !("IntersectionObserver" in window)) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let revealFrame = window.requestAnimationFrame(() => {
      revealFrame = window.requestAnimationFrame(() => {
        const revealSelector = isAccountRoute
          ? `.${styles.accountContentInner} > *`
          : "main section, main article";
        const targets = Array.from(
          root.querySelectorAll<HTMLElement>(revealSelector),
        );

        targets.forEach((target, index) => {
          target.classList.add(styles.revealItem);
          target.style.setProperty(
            "--reveal-delay",
            `${Math.min(index * 45, 360)}ms`,
          );
        });

        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add(styles.revealVisible);
                observer?.unobserve(entry.target);
              }
            });
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
        );

        targets.forEach((target) => observer?.observe(target));
      });
    });

    return () => {
      window.cancelAnimationFrame(revealFrame);
      observer?.disconnect();
    };
  }, [isAccountRoute, pathname]);

  const closeOverlays = useCallback(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
    setWishlistOpen(false);
    setCheckoutOpen(false);
    setQuickViewProduct(null);
  }, [
    setCartOpen,
    setCheckoutOpen,
    setQuickViewProduct,
    setSearchOpen,
    setWishlistOpen,
  ]);

  const overlayOpen =
    mobileOpen ||
    cartOpen ||
    checkoutOpen ||
    wishlistOpen ||
    Boolean(quickViewProduct);

  useEscapeKey(true, closeOverlays);
  useBodyScrollLock(overlayOpen);

  return (
    <div className={styles.shell} ref={shellRef}>
      <AnnouncementBar />
      <Navbar
        isScrolled={isScrolled}
        mobileOpen={mobileOpen}
        pathname={pathname}
        onOpenMobileMenu={() => setMobileOpen(true)}
      />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div
        key={pageTransitionKey}
        className={`${styles.pageTransition} ${
          isAccountRoute ? styles.accountPageTransition : ""
        }`}
      >
        {children}
      </div>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutDrawer />
      <QuickViewModal />

      {toast ? (
        <div
          className={`${styles.toast} ${
            toast.type === "error" ? styles.toastError : ""
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <button
        className={`${styles.backToTop} ${showTop ? styles.backToTopVisible : ""}`}
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <Icon name="up" />
      </button>
    </div>
  );
}
