"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/navigation/Navbar";
import { Icon } from "@/components/ui/Icons";

// Overlays are gated on user interaction (open cart, open wishlist,
// open mobile menu, etc.) so we don't ship their JS in the initial
// bundle. ssr: false keeps the wrapper out of the static HTML where
// these components would render nothing anyway. The chunks load on
// first hover/intent because the trigger components stay in the main
// bundle.
const MobileMenu = dynamic(
  () => import("@/components/navigation/MobileMenu").then((m) => m.MobileMenu),
  { ssr: false },
);
const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false },
);
const CheckoutDrawer = dynamic(
  () =>
    import("@/components/cart/CheckoutDrawer").then((m) => m.CheckoutDrawer),
  { ssr: false },
);
const WishlistDrawer = dynamic(
  () =>
    import("@/components/wishlist/WishlistDrawer").then((m) => m.WishlistDrawer),
  { ssr: false },
);
const QuickViewModal = dynamic(
  () =>
    import("@/components/product/QuickViewModal").then((m) => m.QuickViewModal),
  { ssr: false },
);
const AuthGateModal = dynamic(
  () =>
    import("@/components/auth/AuthGateModal").then((m) => m.AuthGateModal),
  { ssr: false },
);
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CatalogProvider } from "@/components/catalog/CatalogProvider";
import { StoreProvider, useUIStore } from "@/store/StoreProvider";
import { useBodyScrollLock, useEscapeKey } from "@/hooks/useOverlayControls";
import type { Product } from "@/types/product";
import type { User } from "@/types/user";
import styles from "@/styles/store.module.css";

export default function AppShell({
  children,
  initialProducts,
  initialUser,
}: {
  children: React.ReactNode;
  initialProducts: Product[];
  initialUser: User | null;
}) {
  return (
    <AuthProvider initialUser={initialUser}>
      <CatalogProvider products={initialProducts}>
        <StoreProvider>
          <ShellFrame>{children}</ShellFrame>
        </StoreProvider>
      </CatalogProvider>
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
    authGate,
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
  } = useUIStore();

  // Sticky-mount the lazy overlays once they're first opened. Before
  // that we don't load their JS chunks at all; after, they stay mounted
  // so close animations and re-opens stay snappy. The set-during-render
  // pattern is React's recommended alternative to a useEffect for
  // derived "has-ever-been-true" state — React just re-renders once
  // before paint without bouncing through commit-phase effects.
  const [mountMobileMenu, setMountMobileMenu] = useState(false);
  const [mountCartDrawer, setMountCartDrawer] = useState(false);
  const [mountWishlistDrawer, setMountWishlistDrawer] = useState(false);
  const [mountCheckoutDrawer, setMountCheckoutDrawer] = useState(false);
  const [mountQuickView, setMountQuickView] = useState(false);
  const [mountAuthGate, setMountAuthGate] = useState(false);

  if (mobileOpen && !mountMobileMenu) setMountMobileMenu(true);
  if (cartOpen && !mountCartDrawer) setMountCartDrawer(true);
  if (wishlistOpen && !mountWishlistDrawer) setMountWishlistDrawer(true);
  if (checkoutOpen && !mountCheckoutDrawer) setMountCheckoutDrawer(true);
  if (quickViewProduct && !mountQuickView) setMountQuickView(true);
  if (authGate && !mountAuthGate) setMountAuthGate(true);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname, setSearchOpen]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const previous = previousPathname.current;

    previousPathname.current = pathname;

    if (hash) {
      const frame = window.requestAnimationFrame(() => {
        document
          .getElementById(decodeURIComponent(hash))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return () => window.cancelAnimationFrame(frame);
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
          "--soo-scroll",
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
    Boolean(quickViewProduct) ||
    Boolean(authGate);

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
      {mountMobileMenu ? (
        <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      ) : null}

      <div
        key={pageTransitionKey}
        className={`${styles.pageTransition} ${
          isAccountRoute ? styles.accountPageTransition : ""
        }`}
      >
        {children}
      </div>
      <Footer />
      {mountCartDrawer ? <CartDrawer /> : null}
      {mountWishlistDrawer ? <WishlistDrawer /> : null}
      {mountCheckoutDrawer ? <CheckoutDrawer /> : null}
      {mountQuickView ? <QuickViewModal /> : null}
      {mountAuthGate ? <AuthGateModal /> : null}

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
