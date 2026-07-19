type CoursePricingInput = {
  price: number;
  basePrice?: number | null;
  salePrice?: number | null;
  saleStartsAt?: string | Date | null;
  saleEndsAt?: string | Date | null;
};

const toValidDate = (value?: string | Date | null) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function isCourseSaleActive(
  course: Pick<CoursePricingInput, "salePrice" | "saleStartsAt" | "saleEndsAt">,
  now: Date = new Date(),
) {
  if (typeof course.salePrice !== "number" || course.salePrice <= 0) {
    return false;
  }

  const startsAt = toValidDate(course.saleStartsAt);
  const endsAt = toValidDate(course.saleEndsAt);

  return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
}

export function getCourseEffectivePrice(
  course: CoursePricingInput,
  now: Date = new Date(),
) {
  return isCourseSaleActive(course, now) ? course.salePrice as number : course.price;
}

export function getCourseDisplayPricing(
  course: CoursePricingInput,
  now: Date = new Date(),
) {
  const saleActive = isCourseSaleActive(course, now);
  const price = saleActive ? course.salePrice as number : course.price;
  const compareAtPrice = saleActive
    ? typeof course.basePrice === "number" && course.basePrice > price
      ? course.basePrice
      : course.price > price
        ? course.price
        : null
    : null;

  return {
    price,
    compareAtPrice,
    saleActive,
  };
}
