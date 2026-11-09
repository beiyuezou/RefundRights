// Fixed bilingual names so every run cites the same law the same way.
export const STATUTE_GLOSSARY: { en: string; zh: string }[] = [
  { en: "Consumer Protection (Fair Trading) Act (CPFTA)", zh: "新加坡《消费者保护（公平交易）法》" },
  { en: "Consumers Association of Singapore (CASE)", zh: "新加坡消费者协会（CASE）" },
  { en: "Competition and Consumer Commission of Singapore (CCCS)", zh: "新加坡竞争与消费者委员会（CCCS）" },
  { en: "Small Claims Tribunals", zh: "新加坡小额索偿法庭" },
  { en: "Consumer Protection Act B.E. 2522", zh: "泰国《消费者保护法》佛历2522年" },
  { en: "Office of the Consumer Protection Board (OCPB)", zh: "泰国消费者保护委员会办公室（OCPB）" },
  { en: "Consumer Protection Act 1999", zh: "马来西亚《1999年消费者保护法》" },
  { en: "Malaysian Aviation Consumer Protection Code 2016 (MACPC)", zh: "马来西亚《2016年航空消费者保护守则》（MACPC）" },
  { en: "Malaysian Aviation Commission (MAVCOM)", zh: "马来西亚航空委员会（MAVCOM）" },
  { en: "Tribunal for Consumer Claims", zh: "马来西亚消费者索赔仲裁庭" },
  { en: "Law No. 8/1999 on Consumer Protection (UU Perlindungan Konsumen)", zh: "印度尼西亚《1999年第8号消费者保护法》" },
  { en: "Consumer Dispute Settlement Agency (BPSK)", zh: "印度尼西亚消费者纠纷解决机构（BPSK）" },
  { en: "Law on Protection of Consumers' Rights 2023", zh: "越南《2023年消费者权益保护法》" },
];

export function glossaryBlock(): string {
  return (
    "STATUTE GLOSSARY (use these exact names; in Chinese write `中文名 (English name)`):\n" +
    STATUTE_GLOSSARY.map((g) => `- ${g.en} = ${g.zh}`).join("\n")
  );
}
