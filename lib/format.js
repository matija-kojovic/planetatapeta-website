const rsd = new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 });

/** 12500 → "12.500 RSD" */
export const formatRSD = (amount) => `${rsd.format(Math.round(amount))} RSD`;

/** 4.32 → "4,32 m²" */
export const formatArea = (m2) => `${decimal.format(m2)} m²`;

/** 1000 → "1.000" */
export const formatNumber = (n) => integer.format(n);

export const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("sr-RS", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
