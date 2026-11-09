export type CategoryKey = "hotel" | "flight" | "insurance";

export const CATEGORIES: Record<
  CategoryKey,
  { label: string; tagline: string; description: string; examples: string[] }
> = {
  hotel: {
    label: "Hotel Issues",
    tagline: "Unreturned deposits & wrong bookings",
    description:
      "Security deposits not refunded after checkout, charges for damage you didn't cause, double bookings, or rooms that don't match what you paid for.",
    examples: [
      "Hotel kept my security deposit citing 'damage' I didn't cause",
      "Booking platform charged me twice for the same room",
      "Room downgraded on arrival without compensation",
    ],
  },
  flight: {
    label: "Flight Disruptions",
    tagline: "Delays & missed connections",
    description:
      "Long delays, cancellations, missed connections caused by the airline, denied boarding, or refusal to refund a clearly airline-caused disruption.",
    examples: [
      "5-hour delay caused me to miss a connecting flight",
      "Airline refused refund despite cancelling the route",
      "Denied boarding due to overbooking",
    ],
  },
  insurance: {
    label: "Insurance Traps",
    tagline: "Deceptive cancellation advice",
    description:
      "Booking sites pressuring you to cancel an active policy, insurers denying claims using fine-print loopholes, or sellers misrepresenting coverage.",
    examples: [
      "Agoda told me to cancel my insurance to get a refund",
      "Insurer denied my claim citing a hidden exclusion",
      "Agent sold me a policy that didn't cover my actual trip",
    ],
  },
};

export const COUNTRIES = [
  "Thailand",
  "Singapore",
  "Malaysia",
  "Indonesia",
  "Vietnam",
  "Philippines",
  "Cambodia",
  "Laos",
] as const;
