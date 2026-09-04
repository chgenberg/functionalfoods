export const COUPON_TYPE_PREFIX = "type:";

export type CouponProductType = "course" | "book";

export interface CouponApplicableItem {
  id: string;
  type: CouponProductType;
}

export function couponAppliesToItem(
  item: CouponApplicableItem,
  applicableProductIds?: unknown,
): boolean {
  if (!Array.isArray(applicableProductIds) || applicableProductIds.length === 0) {
    return true;
  }

  return applicableProductIds.some(
    (value) =>
      value === item.id || value === `${COUPON_TYPE_PREFIX}${item.type}`,
  );
}

export function filterCouponItems<T extends CouponApplicableItem>(
  items: T[],
  applicableProductIds?: unknown,
): T[] {
  return items.filter((item) => couponAppliesToItem(item, applicableProductIds));
}
