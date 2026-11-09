export type Article = {
  slug: string;
  title: string;
  country: string;
  category: "hotel" | "flight" | "insurance" | "transport" | "general";
  summary: string;
  updated: string;
  rights: string[];
  steps: string[];
  escalation: string[];
  templates: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "thailand-hotel-deposits",
    title: "Thailand: Recovering hotel security deposits",
    country: "Thailand",
    category: "hotel",
    summary:
      "Thai hotels routinely hold cash or card pre-authorisations as deposits. Under the Consumer Protection Act B.E. 2522, they cannot withhold funds without documented, itemised damage.",
    updated: "2025-06-01",
    rights: [
      "The Consumer Protection Act (CPA) prohibits unfair contract terms and requires clear disclosure of charges.",
      "Hotels must provide an itemised invoice for any deductions from a deposit.",
      "Pre-authorisations on credit cards must be released, typically within 7–14 business days.",
      "Foreign tourists have the same protections as Thai citizens under the CPA.",
    ],
    steps: [
      "Request a written, itemised statement of the alleged damage with photos.",
      "If photos pre-exist your stay or are unclear, demand the hotel prove the damage occurred during your stay.",
      "Send a formal demand letter referencing the Consumer Protection Act and a 14-day deadline.",
      "If unresolved, file a complaint with the Office of the Consumer Protection Board (OCPB).",
    ],
    escalation: [
      "Office of the Consumer Protection Board (OCPB) — call 1166 or file online at ocpb.go.th.",
      "Tourism Authority of Thailand (TAT) tourist police hotline 1155.",
      "Small Claims Court for amounts under THB 300,000 (foreigners can file).",
      "Your card issuer — request a chargeback citing 'services not as described'.",
    ],
    templates: [
      "Pursuant to Section 35 bis of the Thai Consumer Protection Act B.E. 2522, I formally request an itemised account of the deductions made from my deposit, together with photographic evidence dated within my stay.",
      "Failing a satisfactory response within 14 days, I will file a formal complaint with the Office of the Consumer Protection Board.",
    ],
  },
  {
    slug: "thailand-tour-cancellations",
    title: "Thailand: Tour operator cancellations and the CPA",
    country: "Thailand",
    category: "general",
    summary:
      "Tour operators that cancel last-minute or substitute inferior services owe you a refund or like-for-like substitute under Thai consumer law.",
    updated: "2025-05-12",
    rights: [
      "Operators cannot unilaterally substitute materially different services without your consent.",
      "Force majeure clauses must be reasonable and specifically scoped — broad 'any reason' clauses are unenforceable.",
      "You are entitled to a full refund of unprovided services.",
    ],
    steps: [
      "Document what you booked vs what was delivered (screenshots, brochures, itineraries).",
      "Notify the operator in writing within 7 days of the issue.",
      "Demand refund or equivalent substitute within 14 days.",
    ],
    escalation: [
      "OCPB hotline 1166.",
      "Department of Tourism complaint portal.",
      "Civil Court for breach of contract.",
    ],
    templates: [
      "The services delivered materially differed from the booking confirmation dated [DATE]. Under the Consumer Protection Act, I am entitled to a refund of the unprovided portion: [AMOUNT].",
    ],
  },
  {
    slug: "singapore-hotel-bookings",
    title: "Singapore: Hotel booking disputes and CASE escalation",
    country: "Singapore",
    category: "hotel",
    summary:
      "Singapore's Consumer Protection (Fair Trading) Act gives strong remedies against misleading hotel and OTA practices. CASE is the primary escalation channel.",
    updated: "2025-07-02",
    rights: [
      "The Consumer Protection (Fair Trading) Act (CPFTA) prohibits misleading and unfair practices.",
      "OTAs (Agoda, Booking.com, etc.) operating in Singapore are bound by the CPFTA regardless of where they are headquartered.",
      "You may seek 'Lemon Law' style remedies for services not fit for purpose under Part 3 of the CPFTA.",
    ],
    steps: [
      "Capture booking confirmations, chat transcripts, and any 'non-refundable' clauses.",
      "Write to the supplier citing CPFTA and request remedy within 14 days.",
      "Open a case with CASE (Consumers Association of Singapore).",
    ],
    escalation: [
      "CASE — file at case.org.sg or call 6277 5100.",
      "Small Claims Tribunals for claims up to SGD 20,000 (or SGD 30,000 by mutual consent).",
      "Singapore Tourism Board for licensed travel agents.",
    ],
    templates: [
      "Under section 4 of the Consumer Protection (Fair Trading) Act, the conduct described above constitutes an unfair practice. I require [SPECIFIC REMEDY] within 14 days, failing which I will refer this matter to CASE.",
    ],
  },
  {
    slug: "singapore-lemon-law-travel",
    title: "Singapore: Lemon Law applied to travel services",
    country: "Singapore",
    category: "general",
    summary:
      "Singapore's Lemon Law extends beyond goods — services that are not of satisfactory quality entitle you to repair, replacement, refund, or price reduction.",
    updated: "2025-04-20",
    rights: [
      "Services must be performed with reasonable care and skill.",
      "If a service fails to conform, the supplier must remedy it at no extra cost.",
      "If remedy is impossible or disproportionate, you can claim a refund or reduction.",
    ],
    steps: [
      "Notify the supplier in writing within a reasonable time.",
      "Allow one opportunity to remedy.",
      "Escalate to CASE if remedy is refused or inadequate.",
    ],
    escalation: ["CASE", "Small Claims Tribunals"],
    templates: [
      "The service provided on [DATE] failed to conform to the contract. Pursuant to Part 3 of the CPFTA, I require [refund / price reduction / re-performance].",
    ],
  },
  {
    slug: "malaysia-flight-delays",
    title: "Malaysia: Flight delay compensation under MAVCOM",
    country: "Malaysia",
    category: "flight",
    summary:
      "MAVCOM's Malaysian Aviation Consumer Protection Code (MACPC) sets clear obligations for airlines on delays, cancellations, and denied boarding.",
    updated: "2025-08-15",
    rights: [
      "Delays of 2+ hours: meals and refreshments.",
      "Delays of 5+ hours: refund or rerouting at the passenger's choice.",
      "Cancellations: refund within 30 days, plus rerouting if requested.",
      "Denied boarding (overbooking): compensation and care obligations apply.",
    ],
    steps: [
      "Keep boarding passes, delay notifications, and any receipts.",
      "Submit a written claim to the airline within 1 year.",
      "If denied or ignored after 30 days, file with MAVCOM via flysmart.my.",
    ],
    escalation: [
      "MAVCOM Consumer Affairs — flysmart.my or 1-800-18-6966.",
      "Tribunal for Consumer Claims for amounts under MYR 50,000.",
    ],
    templates: [
      "Pursuant to Part III of the Malaysian Aviation Consumer Protection Code 2016, I am entitled to [refund / compensation / rerouting] for flight [NUMBER] on [DATE]. I request resolution within 30 days, failing which I will escalate to MAVCOM.",
    ],
  },
  {
    slug: "insurance-deceptive-denials",
    title: "Region-wide: When travel insurance can legally deny your claim",
    country: "Regional",
    category: "insurance",
    summary:
      "Insurers across SE Asia frequently lean on broad exclusions. Many denials are unenforceable when the exclusion was not clearly disclosed at sale.",
    updated: "2025-09-01",
    rights: [
      "Material exclusions must be disclosed before purchase (duty of utmost good faith applies both ways).",
      "Booking platforms cannot pressure you to cancel an active policy as a condition of refund — this can constitute a deceptive trade practice.",
      "You generally have the right to a written reason for denial that cites the specific clause.",
    ],
    steps: [
      "Request the full policy wording and the specific clause relied on.",
      "Cross-check whether that exclusion was disclosed at point of sale.",
      "If a third party (e.g. an OTA) instructed you to cancel coverage, document that instruction in writing.",
      "Submit a formal complaint to the insurer's internal disputes team within 30 days.",
    ],
    escalation: [
      "Thailand: Office of Insurance Commission (OIC) — 1186.",
      "Singapore: Financial Industry Disputes Resolution Centre (FIDReC).",
      "Malaysia: Ombudsman for Financial Services (OFS).",
      "Indonesia: OJK consumer complaints.",
    ],
    templates: [
      "Please provide the specific policy clause relied on for this denial, together with evidence that it was disclosed to me prior to purchase. Where a third party instructed me to cancel or alter coverage, that instruction is on record and I reserve all rights.",
    ],
  },
  {
    slug: "vietnam-transport-scams",
    title: "Vietnam: Taxi scams and motorbike rental disputes",
    country: "Vietnam",
    category: "transport",
    summary:
      "Rigged meters, inflated airport fares and aggressive damage claims on motorbike rentals are the most common transport disputes in Vietnam. The Law on Protection of Consumers' Rights 2023 and the tourist police give you real leverage.",
    updated: "2025-09-20",
    rights: [
      "Under the Law on Protection of Consumers' Rights (No. 19/2023/QH15), drivers and rental operators must provide accurate pricing and honour the agreed rate.",
      "Licensed taxis must use a working, sealed meter — refusal to use the meter or a meter that runs visibly fast is a regulatory violation.",
      "Motorbike rental shops cannot withhold your passport. Holding a passport as security is unlawful under Vietnamese identity-document regulations.",
      "Damage claims on rented vehicles must be supported by evidence and a fair, market-rate quote — not an arbitrary figure.",
    ],
    steps: [
      "Photograph the vehicle (taxi licence plate, meter, or motorbike condition + odometer) before and after the trip or rental.",
      "Insist on a written rental contract in English or with a translation; never hand over your passport — offer a photocopy or cash deposit instead.",
      "If overcharged, pay only the fair amount, request a receipt, and report the licence plate immediately.",
      "For rental damage disputes, demand an itemised quote from an independent shop before paying anything.",
    ],
    escalation: [
      "Tourist Police hotline 113 (general) or 069 234 5860 (Hanoi tourist support).",
      "Vietnam National Authority of Tourism complaint line: 1800 1099.",
      "Vietnam Competition and Consumer Authority (VCCA) — bvntd.vcca.gov.vn for online complaints.",
      "Your card issuer — chargeback for unauthorised top-ups or inflated rental damage charges.",
    ],
    templates: [
      "Pursuant to Article 10 of the Law on Protection of Consumers' Rights 2023, the price charged was not the price agreed and was not displayed accurately. I am entitled to a refund of the overcharge of [AMOUNT].",
      "Withholding my passport as rental security violates Vietnamese identity-document law. Please return my passport immediately, failing which I will report this to the tourist police on 113.",
    ],
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}
