export type CaseOutcome = "full" | "partial" | "rejected";

export type ExampleCase = {
  title: string;
  tags: string[];
  situation: string;
  action: string;
  outcome: CaseOutcome;
  result: string;
};

/** Illustrative example cases per guide slug (English only, not real records). */
export const CASES: Record<string, ExampleCase[]> = {
  "thailand-hotel-deposits": [
    {
      title: "\"Damage\" charge for a stain that was already there",
      tags: ["Bangkok hotel", "฿8,000 deposit"],
      situation:
        "At checkout the hotel kept the full cash deposit, claiming a sofa stain. The guest had check-in photos showing the same stain.",
      action:
        "Sent a demand letter citing the Consumer Protection Act with the timestamped check-in photos, and asked for an itemised damage invoice within 14 days.",
      outcome: "full",
      result: "The hotel refunded the full ฿8,000 by bank transfer 9 days after the letter.",
    },
    {
      title: "Card hold not released after 30 days",
      tags: ["Phuket resort", "฿15,000 pre-authorisation"],
      situation:
        "A pre-authorisation stayed on the guest's credit card for more than a month after a stay with no incidents.",
      action:
        "Emailed the resort for a written release confirmation, then opened a dispute with the card issuer when it did not reply.",
      outcome: "full",
      result: "The issuer released the hold within 5 business days of the dispute.",
    },
    {
      title: "Cash deposit withheld with no checkout evidence",
      tags: ["Chiang Mai guesthouse", "฿3,000 deposit"],
      situation:
        "The owner claimed a broken lamp and kept the cash deposit. The guest had no photos and no receipt for the deposit.",
      action: "Filed an OCPB complaint based only on a written account of what happened.",
      outcome: "rejected",
      result:
        "The complaint was closed for lack of evidence. Lesson: always get a deposit receipt and take checkout photos.",
    },
  ],
  "thailand-tour-cancellations": [
    {
      title: "Island tour cancelled for \"weather\" with no refund",
      tags: ["Krabi", "฿4,200 for 2 people"],
      situation:
        "The operator cancelled on the morning of the trip, citing weather, and offered only a rebooking on a date after the guests' departure.",
      action:
        "Asked for the marine weather notice in writing, then sent a CPA demand for a cash refund because the service was not delivered.",
      outcome: "full",
      result: "Full refund within 10 days. The operator could not produce any official weather warning.",
    },
    {
      title: "Phi Phi day-trip operator disappeared",
      tags: ["Phuket", "฿6,500 paid online"],
      situation: "Nobody came to the hotel pickup, and the operator's phone and website went offline the same week.",
      action: "Reported it to the tourist police (1155) and filed a chargeback for services not delivered.",
      outcome: "partial",
      result:
        "The card chargeback was approved. A second payment made by bank transfer could not be recovered.",
    },
  ],
  "singapore-hotel-bookings": [
    {
      title: "Booked a sea-view room, got a city-view room",
      tags: ["Sentosa hotel", "S$420 via an OTA"],
      situation:
        "The room given did not match the category paid for, and the front desk refused to change it.",
      action:
        "Documented the room with photos, complained to the booking platform within 24 hours, then sent a CPFTA-based demand to the hotel.",
      outcome: "partial",
      result: "The platform refunded the S$140 price difference within 2 weeks.",
    },
    {
      title: "Non-refundable rate, but the hotel itself cancelled",
      tags: ["Orchard Road", "S$610"],
      situation:
        "The hotel cancelled because it was overbooked, then argued that the rate was \"non-refundable\" and offered only credit.",
      action: "Opened a CASE complaint, pointing out that the hotel, not the guest, had broken the contract.",
      outcome: "full",
      result: "Full cash refund after CASE mediation, about 3 weeks in total.",
    },
  ],
  "singapore-lemon-law-travel": [
    {
      title: "Spa package not as advertised",
      tags: ["Marina Bay", "S$380 package"],
      situation:
        "A 3-hour couples package turned out to be 90 minutes with fewer treatments than advertised.",
      action: "Asked for a remedy under the Lemon Law with screenshots of the advertisement, then filed with CASE.",
      outcome: "partial",
      result: "A 50% refund was agreed at CASE mediation.",
    },
    {
      title: "Defective rental gear package",
      tags: ["Diving gear rental", "S$260"],
      situation: "The regulator leaked on the first dive, and the shop refused a replacement or refund.",
      action: "Filed at the Small Claims Tribunals with the dive-buddy's witness statement and photos.",
      outcome: "rejected",
      result:
        "The claim was dismissed because the damage could not be proven to exist before use. Lesson: test gear and report problems in writing straight away.",
    },
  ],
  "malaysia-flight-delays": [
    {
      title: "6-hour delay, no meals provided",
      tags: ["KUL → BKI", "RM 520 ticket"],
      situation: "The airline delayed the flight 6 hours for \"operational reasons\" and gave out no meal vouchers.",
      action: "Claimed compensation under the MACPC and escalated to the regulator after 30 days with no reply.",
      outcome: "full",
      result: "The airline paid the compensation set out by the code, plus meal costs, about 6 weeks after escalation.",
    },
    {
      title: "Missed connection on a single booking",
      tags: ["PEN → KUL → SIN", "RM 780"],
      situation:
        "A late first leg caused a missed connection, and the airline wanted the passenger to pay for a new ticket.",
      action: "Insisted on free rerouting because both flights were on one booking, and kept all written replies.",
      outcome: "full",
      result: "Rebooked on the next flight free of charge, with a hotel night covered.",
    },
    {
      title: "\"Weather\" excuse that didn't hold up",
      tags: ["KUL → LGK", "RM 310"],
      situation: "The airline refused compensation for a cancellation, citing weather.",
      action:
        "Asked for evidence, and showed that other flights on the same route left on time that day.",
      outcome: "partial",
      result: "The airline gave a full fare refund but no extra compensation.",
    },
  ],
  "insurance-deceptive-denials": [
    {
      title: "\"Unattended baggage\" denial overturned",
      tags: ["Stolen bag", "US$1,200 claim"],
      situation:
        "The insurer denied a theft claim, saying the bag was unattended, even though it was taken from a locked hotel room.",
      action:
        "Appealed with the police report and the hotel's incident letter, and quoted the policy's exact definition of \"unattended\".",
      outcome: "full",
      result: "The denial was reversed and the claim paid in full after the internal appeal.",
    },
    {
      title: "Pre-existing condition denial upheld",
      tags: ["Medical claim", "US$3,400"],
      situation:
        "A hospital claim was denied because of a condition the traveller had been treated for 4 months before the trip.",
      action: "Appealed to the insurer and then to the financial ombudsman.",
      outcome: "rejected",
      result:
        "The denial was upheld because the condition was not declared. Lesson: declare all recent treatment when you buy cover.",
    },
  ],
  "vietnam-transport-scams": [
    {
      title: "Rigged taxi meter from the airport",
      tags: ["Hanoi", "₫1,200,000 charged"],
      situation: "The meter ran about 4 times faster than normal on the trip from the airport to the Old Quarter.",
      action: "Photographed the car number and receipt, and reported it to the taxi company and the airport hotline.",
      outcome: "partial",
      result: "The company refunded about 70% of the fare and suspended the driver.",
    },
    {
      title: "Motorbike rental \"scratch\" demand",
      tags: ["Hội An", "US$150 demanded"],
      situation:
        "The rental shop demanded money for scratches that were already on the bike when it was handed over.",
      action:
        "Showed a time-stamped pickup video and calmly offered to go to the local police together.",
      outcome: "full",
      result: "The shop dropped the claim on the spot.",
    },
    {
      title: "Passport held as a rental deposit",
      tags: ["Ho Chi Minh City", "Passport"],
      situation: "The shop refused to return the passport unless the renter paid an inflated repair bill.",
      action: "Contacted the embassy and the tourist police straight away.",
      outcome: "partial",
      result:
        "The passport was returned after a smaller, negotiated payment. Lesson: never leave your passport as a deposit.",
    },
  ],
};
