import type { Metadata } from "next";
import { AccountWishlist } from "@/components/account/AccountWishlist";
import styles from "@/styles/store.module.css";

export const metadata: Metadata = {
  title: "Wishlist | SOO",
};

export default function AccountWishlistPage() {
  return (
    <section className={styles.accountPanel}>
      <AccountWishlist />
    </section>
  );
}
