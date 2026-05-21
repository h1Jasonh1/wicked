// Format deterministically rather than via Intl.NumberFormat — Node's
// trimmed ICU data formats en-ZA with a non-breaking space as the
// thousands separator ("R 1 490"), but browsers use a comma ("R 1,490"),
// which trips React's hydration check on every price label.
export const formatPrice = (value: number) => {
  const whole = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `R ${whole}`;
};
