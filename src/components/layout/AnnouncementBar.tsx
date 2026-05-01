import { announcementItems } from "@/data/navigation";
import styles from "@/styles/store.module.css";

export function AnnouncementBar() {
  return (
    <div className={styles.announcementBar} aria-label="Store announcements">
      <div className={styles.announcementTrack}>
        {[0, 1].map((group) => (
          <span aria-hidden={group === 1} key={group}>
            {announcementItems.map((item) => (
              <small key={`${group}-${item}`}>{item}</small>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
