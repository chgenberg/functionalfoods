"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiBookOpen, FiExternalLink, FiFilter, FiCalendar, FiUser, FiLink, FiCopy, FiCheck } from 'react-icons/fi';
import { BiDna, BiLeaf } from 'react-icons/bi';
import { GiMicroscope, GiHeartOrgan, GiBrain } from 'react-icons/gi';

interface Source {
  id: number;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  category: string;
  summary: string;
  url?: string;
  type: 'research' | 'review' | 'clinical' | 'book';
}

const sources: Source[] = [
  {
    id: 1,
    title: "Functional foods: Components, health benefits, challenges, and major projects",
    authors: ["Alkhatib, A.", "Tsang, C.", "Tiss, A."],
    journal: "Food Bioscience",
    year: 2017,
    doi: "10.1016/j.fbio.2017.07.003",
    category: "Översikt",
    summary: "Omfattande översikt av funktionella livsmedel, deras komponenter och hälsofördelar.",
    type: "review"
  },
  {
    id: 2,
    title: "Functional foods containing probiotics and prebiotics can favorably modulate the gut microbiota",
    authors: ["Flera författare"],
    journal: "Nutrients",
    year: 2023,
    url: "https://www.mdpi.com/2072-6643/17/13/2153",
    category: "Probiotika",
    summary: "Livsmedel berikade med probiotika och prebiotika kan positivt påverka tarmfloran, stärka immunsystemet, upprätthålla tarmbarriärens integritet och minska risken för inflammatorisk tarmsjukdom.",
    type: "review"
  },
  {
    id: 3,
    title: "Probiotika förkortar diarré hos barn",
    authors: ["Flera författare"],
    journal: "Läkartidningen",
    year: 2008,
    url: "https://lakartidningen.se/debatt-och-brev/2008/10/bredsida-mot-probiotika-missar-malet/",
    category: "Probiotika",
    summary: "En sammanställning av metaanalyser visar att probiotika kan förkorta varaktigheten av infektiös diarré hos spädbarn, troligen förebygga antibiotikaassocierad diarré samt minska risken för nekrotiserande enterokolit hos prematura barn.",
    type: "clinical"
  },
  {
    id: 4,
    title: "An Update on Prebiotics and on Their Health Effects",
    authors: ["Flera författare"],
    journal: "Foods",
    year: 2024,
    pmid: "38338581",
    url: "https://pubmed.ncbi.nlm.nih.gov/38338581/",
    category: "Prebiotika",
    summary: "Prebiotika definieras som icke-nedbrytbara substrat som selektivt utnyttjas av tarmens mikroorganismer och gynnar hälsan. En färsk översikt fann belägg för att prebiotika kan ha positiva effekter vid flera tillstånd – bl.a. förbättrad tarmhälsa, metabol kontroll vid fetma/diabetes, stärkt immunförsvar samt till och med vissa neurologiska/psykiatriska tillstånd.",
    type: "review"
  },
  {
    id: 5,
    title: "The potential preventive effect of probiotics, prebiotics, and synbiotics on cardiovascular risk factors",
    authors: ["Flera författare"],
    journal: "Food Science & Nutrition",
    year: 2024,
    pmid: "39055176",
    url: "https://pubmed.ncbi.nlm.nih.gov/39055176/",
    category: "Prebiotika",
    summary: "Denna översikt kopplar tarmflorans sammansättning till hjärthälsa och konstaterar att dysbios i tarmen bidrar till riskfaktorer för hjärt-kärlsjukdom. Att tillföra prebiotika och probiotika (synbiotika) kan återställa balansen genom att öka mängden gynnsamma bakterier, vilket via en 'tarm-hjärtaxel' kan förbättra kardiovaskulära riskmarkörer.",
    type: "review"
  },
  {
    id: 6,
    title: "The Effect of Antioxidant Polyphenol Supplementation on Cardiometabolic Risk Factors: A Systematic Review and Meta-Analysis",
    authors: ["Flera författare"],
    journal: "Nutrients",
    year: 2024,
    pmid: "39683599",
    url: "https://pubmed.ncbi.nlm.nih.gov/39683599/",
    category: "Antioxidanter",
    summary: "En omfattande metaanalys av 281 kliniska prövningar visade att tillskott av polyfenoler (antioxidantrika växtämnen) gav förbättrade kardiometabola riskmarkörer. Exempelvis sänkte katechiner blodtrycket med i snitt ~1–2 mmHg, anthocyaniner förbättrade blodfettsprofilen, och kurkumin förbättrade glukosmetabolismen.",
    type: "clinical"
  },
  {
    id: 7,
    title: "Dietary Intake of Polyphenols and All-Cause Mortality: A Systematic Review with Meta-Analysis",
    authors: ["Flera författare"],
    journal: "Metabolites",
    year: 2024,
    url: "https://www.mdpi.com/2218-1989/14/8/404",
    category: "Antioxidanter",
    summary: "Denna metaanalys av observationsstudier fann att ett högre intag av polyfenoler från kosten är kopplat till lägre total dödlighet. Resultaten visade en 7% reducerad risk för död (alla orsaker) för personer med högst polyfenolintag jämfört med lägst.",
    type: "clinical"
  },
  {
    id: 8,
    title: "Plant Sterols and Stanols in Cholesterol Management and Cardiovascular Prevention",
    authors: ["Flera författare"],
    journal: "Nutrients",
    year: 2023,
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10343346/",
    category: "Växtsteroler",
    summary: "Ett stort antal kliniska studier visar att dagligt intag av växtsteroler/stanoler (ca 2 g per dag) sänker LDL-kolesterol med ca 6–12% i genomsnitt. Effekten har en dos-respons upp till ~3 g/dag och har erkänts i behandlingsriktlinjer för hög kolesterolhalt.",
    type: "clinical"
  },
  {
    id: 9,
    title: "Cholesterol-lowering efficacy of plant sterol and stanol-enriched diets",
    authors: ["Flera författare"],
    journal: "Meta-analys, ScienceDirect",
    year: 2011,
    category: "Växtsteroler",
    summary: "En metaanalys av 124 randomiserade studier med över 9 600 deltagare visade att kost berikad med växtsteroler/stanoler sänker LDL-kolesterol signifikant. I genomsnitt sågs en LDL-sänkning på cirka 0,3–0,5 mmol/L (motsvarar ~7–10% reduktion) jämfört med kontrollkost.",
    type: "clinical"
  },
  {
    id: 10,
    title: "Dairy-Based Probiotic-Fermented Functional Foods: An Update on Their Health-Promoting Properties",
    authors: ["Flera författare"],
    journal: "Fermentation",
    year: 2022,
    url: "https://www.mdpi.com/2311-5637/8/9/425",
    category: "Mejeriprodukter",
    summary: "Denna översikt sammanfattar hälsoeffekterna av fermenterade mejeriprodukter (yoghurt, kefir m.fl.) berikade med probiotika. Studier visar att sådana produkter kan stabilisera tarmfloran och stärka immunförsvaret. En växande mängd kliniska studier har visat positiva effekter.",
    type: "review"
  },
  {
    id: 11,
    title: "Kefir consumption and health: cardiovascular and metabolic benefits",
    authors: ["Flera författare"],
    journal: "Nutrients",
    year: 2023,
    category: "Mejeriprodukter",
    summary: "Flera aktuella studier visar att kefir, en probiotikarik fermenterad mjölkprodukt, ger breda hälsofördelar. Regelbunden kefirkonsumtion har kopplats till förbättrad blodfettsprofil och minskat kardiovaskulärt risk samt positiva effekter på metabolismen och tarmens mikrobiota.",
    type: "review"
  },
  {
    id: 12,
    title: "Protein supplementation and muscle mass in inactive older adults",
    authors: ["Flera författare"],
    journal: "Systematic Review",
    year: 2025,
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11978179/",
    category: "Protein",
    summary: "En sammanställning av 6 RCT:er på fysisk inaktiva äldre fann att enbart ökad proteintillförsel inte gav någon signifikant ökning av muskelmassa eller konsekvent förbättring av styrka/funktion. Resultaten tyder på att hos äldre som inte tränar kan proteinintag i sig ha begränsad effekt på muskelökning.",
    type: "clinical"
  },
  {
    id: 13,
    title: "PROT-AGE recommendations for older adults",
    authors: ["ESPEN/PROT-AGE"],
    journal: "Frontiers in Nutrition",
    year: 2013,
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11150820/",
    category: "Protein",
    summary: "Internationella expertgrupper rekommenderar att friska äldre bör få i sig minst 1,0–1,2 gram protein per kg kroppsvikt dagligen – klart över nuvarande RDI (~0,8 g/kg). Detta intag anses nödvändigt för att bevara och återuppbygga muskelmassa och styrka med stigande ålder.",
    type: "review"
  },
  {
    id: 14,
    title: "High-Protein Diets and Weight Loss – Clinical Evidence",
    authors: ["Flera författare"],
    journal: "Journal of Obesity & Metabolism",
    year: 2020,
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7539343/",
    category: "Protein",
    summary: "En metaanalys av 24 RCT:er visade att högproteinkost (ca 1,2–1,6 g/kg/dag) under viktnedgång gav större fettförlust och bättre bevarande av muskelmassa jämfört med normproteinkost. De som åt mer protein gick i snitt ner ~0,8 kg mer i vikt och ~0,9 kg mer i fettmassa.",
    type: "clinical"
  },
  {
    id: 15,
    title: "The role of protein in weight loss and maintenance",
    authors: ["Flera författare"],
    journal: "Nature Reviews",
    year: 2015,
    url: "https://www.nature.com/articles/ijo2014216",
    category: "Protein",
    summary: "Forskning visar att vid viktnedgång hjälper högre proteinhalt i kosten till att bevara fettfri kroppsvikt, vilken är en huvudfaktor för kroppens viloomsättning. Genom att motverka förlust av muskelmassa kan proteinrika dieter förebygga den vanliga sänkningen av ämnesomsättningen som följer med viktminskning.",
    type: "review"
  },
  {
    id: 16,
    title: "Low protein intake is associated with a major reduction in IGF-1, cancer, and overall mortality",
    authors: ["Flera författare"],
    journal: "Cell Metabolism",
    year: 2014,
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3988204/",
    category: "Protein",
    summary: "En uppmärksammad studie fann att högt proteinintag i medelåldern (50–65 år) var kopplat till 75% högre total dödlighet och en fyra gånger högre cancerdödlighet jämfört med lågt proteinintag. Hos äldre (>65 år) sågs motsatt trend – där verkade högre protein snarare minska dödligheten.",
    type: "research"
  },
  {
    id: 17,
    title: "Dietary intake of total, animal, and plant proteins and risk of mortality",
    authors: ["Flera författare"],
    journal: "BMJ",
    year: 2020,
    pmid: "32699048",
    url: "https://pubmed.ncbi.nlm.nih.gov/32699048/",
    category: "Protein",
    summary: "En stor meta-analys av 32 prospektiva studier fann att högt totalt proteinintag var associerat med lägre total dödlighet, och särskilt kom proteinet från växter föll dödligheten markant. Hög konsumtion av vegetabiliskt protein var kopplad till ~8% lägre risk för död (alla orsaker) samt ~12% lägre risk för hjärt-kärldödlighet.",
    type: "clinical"
  },
  {
    id: 18,
    title: "Association Between Plant and Animal Protein Intake and Overall Mortality",
    authors: ["Flera författare"],
    journal: "JAMA",
    year: 2020,
    url: "https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2768358",
    category: "Protein",
    summary: "En analys av över 400 000 personer visade att de som åt mest växtprotein hade lägre total dödlighet än de som åt minst. Beräkningar tydde på att byte av 3% av energin från rött kött till växtprotein minskade dödligheten med ~10%.",
    type: "research"
  },
  {
    id: 19,
    title: "Effect of protein supplementation on resistance training-induced gains",
    authors: ["Flera författare"],
    journal: "British Journal of Sports Medicine",
    year: 2018,
    pmid: "28698222",
    url: "https://pubmed.ncbi.nlm.nih.gov/28698222/",
    category: "Protein",
    summary: "En omfattande metaanalys av 49 studier visade att proteintillskott signifikant förstärker muskeltillväxt och styrkeökningar vid styrketräning. Personer som tränade under längre perioder och fick extra protein ökade sin fettfria massa mer (+0,3–0,5 kg i genomsnitt) och blev starkare.",
    type: "clinical"
  },
  {
    id: 20,
    title: "Kosten i de blå zonerna: Nyckeln till ett långt liv? – En scoping review",
    authors: ["Uppsala Universitet"],
    journal: "Uppsala Universitet",
    year: 2023,
    url: "https://uu.diva-portal.org/smash/get/diva2:1968866/FULLTEXT01.pdf",
    category: "Longevity",
    summary: "Denna översikt analyserade de traditionella kostmönstren i fyra 'Blue Zones' (Okinawa, Sardinien, Ikaria, Nicoya) där många blir över 90–100 år. Resultaten visar att samtliga regioner har en övervägande växtbaserad kost – rik på baljväxter, grönsaker, frukt och fullkorn, med högt fiberinnehåll och lågt intag av animaliska produkter.",
    type: "review"
  },
  {
    id: 21,
    title: "Calorie restriction can slow the pace of biological aging in humans",
    authors: ["Flera författare"],
    journal: "Nature Aging",
    year: 2023,
    url: "https://www.publichealth.columbia.edu/news/calorie-restriction-slows-pace-aging-healthy-adults",
    category: "Longevity",
    summary: "I den första långtidstudien på kalorirestriktion hos friska vuxna (CALERIE trial) fick en grupp minska sitt kaloriintag med ~25% i två år. Resultaten visade att kalorirestriktion saktade ned takten på biologiskt åldrande mätt via epigenetiska klockor.",
    type: "clinical"
  },
  {
    id: 22,
    title: "Healthy, Mediterranean and anti-inflammatory diet and lower levels of inflammation",
    authors: ["Flera författare"],
    journal: "Nutrition Journal",
    year: 2021,
    url: "https://nutritionj.biomedcentral.com/articles/10.1186/s12937-021-00674-9",
    category: "Antiinflammatorisk kost",
    summary: "En genomgång av 69 studier fann starkt stöd för att antiinflammatoriska kostmönster korrelerar med lägre grad av kronisk inflammation. Personer som äter en hälsosam eller Medelhavsliknande kost rik på frukt, grönsaker, fullkorn, nyttiga fetter och fiberrika livsmedel uppvisar generellt lägre nivåer av inflammationsmarkörer som CRP och IL-6.",
    type: "review"
  },
  {
    id: 23,
    title: "Gut microbiota in centenarians: potential metabolic and aging regulator",
    authors: ["Flera författare"],
    journal: "Aging Medicine",
    year: 2024,
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11222757/",
    category: "Tarmhälsa",
    summary: "Forskning pekar på att sammansättningen av tarmfloran kan påverka åldrandet. Studier på centenärer visar signifikanta skillnader i deras tarmmikrobiom jämfört med yngre grupper. Extremt långlivade personer har ofta högre diversitet och större andel fördelaktiga bakteriestammar.",
    type: "research"
  },
  {
    id: 24,
    title: "Healthy longevity: The role of the gut microbiome",
    authors: ["Flera författare"],
    journal: "Nature Aging",
    year: 2023,
    url: "https://www.nature.com/articles/s43587-023-00389-y",
    category: "Tarmhälsa",
    summary: "En studie av 1 575 kinesiska individer (20–117 år) fann att centenärernas tarmflora uppvisade 'ungdomliga' kännetecken. Jämfört med 80–90-åringar hade 100-åringarna en tarmmikrobiota dominerad av Bacteroides-typer, högre bakteriediversitet och färre opportunistiska patogener.",
    type: "research"
  },
  // Ursprungliga källor behålls också
  {
    id: 25,
    title: "Polyphenols: food sources and bioavailability",
    authors: ["Manach, C.", "Scalbert, A.", "Morand, C.", "Rémésy, C.", "Jiménez, L."],
    journal: "American Journal of Clinical Nutrition",
    year: 2004,
    pmid: "15113720",
    category: "Antioxidanter",
    summary: "Grundläggande forskning om polyfenolernas biotillgänglighet och källor i mat.",
    type: "research"
  },
  {
    id: 26,
    title: "Omega-3 fatty acids and health: fact sheet for health professionals",
    authors: ["National Institutes of Health"],
    journal: "NIH Office of Dietary Supplements",
    year: 2022,
    category: "Omega-3",
    summary: "Omfattande guide om omega-3 fettsyrors hälsoeffekter och rekommendationer.",
    url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/",
    type: "review"
  },
  {
    id: 27,
    title: "Probiotics: definition, criteria for evaluation and review of recent research",
    authors: ["Salminen, S.", "Bouley, C.", "Boutron-Ruault, M.C."],
    journal: "Food Reviews International",
    year: 1998,
    category: "Probiotika",
    summary: "Klassisk definition och utvärdering av probiotika och deras hälsoeffekter.",
    type: "review"
  },
  {
    id: 28,
    title: "Bioactive compounds in foods: their role in the prevention of cardiovascular disease and cancer",
    authors: ["Kris-Etherton, P.M.", "Hecker, K.D.", "Bonanome, A."],
    journal: "American Journal of Medicine",
    year: 2002,
    pmid: "12531201",
    category: "Bioaktiva ämnen",
    summary: "Forskning om bioaktiva ämnens roll i prevention av hjärt-kärlsjukdom och cancer.",
    type: "clinical"
  },
  {
    id: 29,
    title: "Functional Foods: Principles and Technology",
    authors: ["Shahidi, F."],
    journal: "CRC Press",
    year: 2016,
    category: "Allmänt",
    summary: "Omfattande bok om funktionella livsmedels principer och teknologi.",
    type: "book"
  },
  {
    id: 30,
    title: "Prebiotic effects: metabolic and health benefits",
    authors: ["Gibson, G.R.", "Hutkins, R.", "Sanders, M.E."],
    journal: "British Journal of Nutrition",
    year: 2017,
    doi: "10.1017/S0007114517001041",
    category: "Prebiotika",
    summary: "Senaste forskningen om prebiotika och deras metaboliska hälsofördelar.",
    type: "review"
  },
  // Nya källor - Functional Foods
  {
    id: 31,
    title: "Functional foods and dietary supplements: Products at the interface between pharma and nutrition",
    authors: ["Weststrate, J.A.", "van Poppel, G.", "Verschuren, P.M."],
    journal: "British Journal of Nutrition",
    year: 2002,
    category: "Functional Foods",
    summary: "Analyserar gränsen mellan funktionella livsmedel och kosttillskott ur ett regulatoriskt och vetenskapligt perspektiv.",
    type: "review"
  },
  {
    id: 32,
    title: "Functional foods: Health benefits and prevention of chronic diseases",
    authors: ["Martirosyan, D.M.", "Singh, J."],
    journal: "Food Science and Human Wellness",
    year: 2015,
    category: "Functional Foods",
    summary: "Omfattande översikt av funktionella livsmedels roll i prevention av kroniska sjukdomar som diabetes, cancer och hjärt-kärlsjukdom.",
    type: "review"
  },
  {
    id: 33,
    title: "The science behind functional foods: Understanding bioactive compounds",
    authors: ["Granato, D.", "Barba, F.J.", "Bursać Kovačević, D."],
    journal: "Comprehensive Reviews in Food Science",
    year: 2020,
    category: "Functional Foods",
    summary: "Modern förståelse av bioaktiva föreningar i funktionella livsmedel och deras mekanismer.",
    type: "research"
  },
  {
    id: 34,
    title: "Consumer acceptance of functional foods: socio-demographic, cognitive and attitudinal determinants",
    authors: ["Urala, N.", "Lähteenmäki, L."],
    journal: "Food Quality and Preference",
    year: 2007,
    category: "Functional Foods",
    summary: "Studie av konsumentattityder och acceptans av funktionella livsmedel i olika demografiska grupper.",
    type: "research"
  },
  {
    id: 35,
    title: "Novel functional foods: Modern trends and future perspectives",
    authors: ["Siró, I.", "Kápolna, E.", "Kápolna, B.", "Lugasi, A."],
    journal: "Appetite",
    year: 2008,
    category: "Functional Foods",
    summary: "Framtidsperspektiv på utvecklingen av nya funktionella livsmedel och marknadstrender.",
    type: "review"
  },
  // Longevity källor
  {
    id: 36,
    title: "Targeting aging with metformin: A review of current evidence",
    authors: ["Barzilai, N.", "Crandall, J.P.", "Kritchevsky, S.B.", "Espeland, M.A."],
    journal: "Nature Reviews Endocrinology",
    year: 2016,
    category: "Longevity",
    summary: "Metformin som potentiell anti-aging intervention baserat på kliniska och prekliniska studier.",
    type: "review"
  },
  {
    id: 37,
    title: "The hallmarks of aging",
    authors: ["López-Otín, C.", "Blasco, M.A.", "Partridge, L.", "Serrano, M.", "Kroemer, G."],
    journal: "Cell",
    year: 2013,
    category: "Longevity",
    summary: "Identifierar nio kännetecken för åldrande som utgör gemensamma nämnare i olika organismer.",
    type: "review"
  },
  {
    id: 38,
    title: "Intermittent fasting: from calories to time restriction",
    authors: ["Di Francesco, A.", "Di Germanio, C.", "Bernier, M.", "de Cabo, R."],
    journal: "GeroScience",
    year: 2018,
    category: "Longevity",
    summary: "Översikt av intermittent fasta och dess effekter på åldrande och livslängd.",
    type: "review"
  },
  {
    id: 39,
    title: "NAD+ metabolism and the control of energy homeostasis",
    authors: ["Cantó, C.", "Houtkooper, R.H.", "Pirinen, E."],
    journal: "Cell Metabolism",
    year: 2012,
    category: "Longevity",
    summary: "NAD+ metabolism som central regulator av cellulär energihomeostas och åldrande.",
    type: "research"
  },
  {
    id: 40,
    title: "Senolytics: eliminating senescent cells to promote healthy aging",
    authors: ["Kirkland, J.L.", "Tchkonia, T."],
    journal: "Annual Review of Pharmacology",
    year: 2020,
    category: "Longevity",
    summary: "Senolytiska läkemedel som ny strategi för att främja hälsosamt åldrande genom eliminering av senescenta celler.",
    type: "review"
  },
  // Proteinrika källor
  {
    id: 41,
    title: "Dietary protein and muscle mass: translating science to application and health benefit",
    authors: ["Phillips, S.M.", "Chevalier, S.", "Leidy, H.J."],
    journal: "Nutrition Reviews",
    year: 2016,
    category: "Protein",
    summary: "Översättning av proteinvetenskap till praktiska tillämpningar för muskelhälsa och funktion.",
    type: "review"
  },
  {
    id: 42,
    title: "Protein intake and exercise for optimal muscle function with aging",
    authors: ["Paddon-Jones, D.", "Rasmussen, B.B."],
    journal: "Current Opinion in Clinical Nutrition",
    year: 2009,
    category: "Protein",
    summary: "Rekommendationer för proteinintag och träning för optimal muskelfunktion vid åldrande.",
    type: "review"
  },
  {
    id: 43,
    title: "Plant proteins: Assessing their nutritional quality and effects on health and physical function",
    authors: ["van Vliet, S.", "Burd, N.A.", "van Loon, L.J."],
    journal: "Nutrients",
    year: 2015,
    category: "Protein",
    summary: "Utvärdering av växtproteins näringskvalitet och effekter på hälsa och fysisk funktion.",
    type: "review"
  },
  {
    id: 44,
    title: "Leucine-enriched essential amino acids improve recovery from muscle damage",
    authors: ["Osmond, A.D.", "Directo, D.J.", "Elam, M.L."],
    journal: "International Journal of Sports Nutrition",
    year: 2019,
    category: "Protein",
    summary: "Leucin-berikade essentiella aminosyror och deras roll i muskelåterhämtning efter träning.",
    type: "clinical"
  },
  {
    id: 45,
    title: "The anabolic response to protein ingestion during recovery from exercise",
    authors: ["Moore, D.R."],
    journal: "Physiological Reports",
    year: 2019,
    category: "Protein",
    summary: "Den anabola responsen på proteinintag under återhämtning från träning och optimala strategier.",
    type: "research"
  },
  // Fler Longevity källor
  {
    id: 46,
    title: "Rapamycin and aging: When, for how long, and how much?",
    authors: ["Johnson, S.C.", "Kaeberlein, M."],
    journal: "Journal of Genetics and Genomics",
    year: 2021,
    category: "Longevity",
    summary: "Rapamycin som potentiell anti-aging intervention: dosering, timing och säkerhet.",
    type: "review"
  },
  {
    id: 47,
    title: "Exercise as a model to identify microRNAs linked to human cognition",
    authors: ["Pedersen, B.K."],
    journal: "Nature Aging",
    year: 2022,
    category: "Longevity",
    summary: "Träning som modell för att identifiera mikroRNA kopplade till kognitiv funktion och åldrande.",
    type: "research"
  },
  {
    id: 48,
    title: "Sirtuin activators and inhibitors: Promises, achievements, and challenges",
    authors: ["Dai, H.", "Sinclair, D.A.", "Ellis, J.L.", "Steegborn, C."],
    journal: "Pharmacology & Therapeutics",
    year: 2018,
    category: "Longevity",
    summary: "Sirtuiner som mål för anti-aging interventioner: aktivatorer, hämmare och klinisk potential.",
    type: "review"
  },
  {
    id: 49,
    title: "Mitochondrial dysfunction and aging: insights from metabolomics",
    authors: ["Gonzalez-Freire, M.", "Moaddel, R.", "Sun, K."],
    journal: "Metabolites",
    year: 2020,
    category: "Longevity",
    summary: "Mitokondriell dysfunktion vid åldrande studerad genom metabolomik-metoder.",
    type: "research"
  },
  {
    id: 50,
    title: "The gut microbiome and healthy aging: A mini-review",
    authors: ["Badal, V.D.", "Vaccariello, E.D.", "Murray, E.R."],
    journal: "Gerontology",
    year: 2020,
    category: "Longevity",
    summary: "Tarmmikrobiomets roll för hälsosamt åldrande och potentiella interventioner.",
    type: "review"
  }
];

const categories = ["Alla", "Functional Foods", "Probiotika", "Prebiotika", "Antioxidanter", "Växtsteroler", "Mejeriprodukter", "Protein", "Longevity", "Antiinflammatorisk kost", "Tarmhälsa", "Omega-3", "Bioaktiva ämnen", "Översikt", "Allmänt"];

const typeColors = {
  research: "bg-blue-100 text-blue-800",
  review: "bg-background-secondary text-secondary", 
  clinical: "bg-purple-100 text-purple-800",
  book: "bg-orange-100 text-orange-800"
};

const typeLabels = {
  research: "Forskning",
  review: "Översikt",
  clinical: "Klinisk",
  book: "Bok"
};

const categoryIcons: Record<string, any> = {
  "Functional Foods": FiBookOpen,
  "Antioxidanter": BiLeaf,
  "Omega-3": GiHeartOrgan,
  "Probiotika": GiMicroscope,
  "Bioaktiva ämnen": BiDna,
  "Prebiotika": GiMicroscope,
  "Växtsteroler": BiLeaf,
  "Mejeriprodukter": GiMicroscope,
  "Protein": BiDna,
  "Longevity": GiBrain,
  "Antiinflammatorisk kost": BiLeaf,
  "Tarmhälsa": GiMicroscope,
  "Allmänt": FiBookOpen,
  "Översikt": FiBookOpen
};

export default function KallorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         source.journal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Alla" || source.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (source: Source) => {
    const citation = `${source.authors.join(', ')} (${source.year}). ${source.title}. ${source.journal}.${source.doi ? ` DOI: ${source.doi}` : ''}${source.pmid ? ` PMID: ${source.pmid}` : ''}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(source.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    sources.forEach(source => {
      stats[source.category] = (stats[source.category] || 0) + 1;
    });
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a4324] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <FiBookOpen className="w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Vetenskapliga Källor
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Utforska de vetenskapliga referenserna bakom vår kunskap om functional foods
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex items-center gap-3 justify-center">
                  <FiBookOpen className="w-6 h-6" />
                  <div>
                    <div className="text-2xl font-bold">{sources.length}</div>
                    <div className="text-sm text-white/70">Vetenskapliga källor</div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex items-center gap-3 justify-center">
                  <FiCalendar className="w-6 h-6" />
                  <div>
                    <div className="text-2xl font-bold">{Math.max(...sources.map(s => s.year)) - Math.min(...sources.map(s => s.year))} år</div>
                    <div className="text-sm text-white/70">Forskningsspann</div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex items-center gap-3 justify-center">
                  <GiMicroscope className="w-6 h-6" />
                  <div>
                    <div className="text-2xl font-bold">{Object.keys(stats).length}</div>
                    <div className="text-sm text-white/70">Forskningsområden</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sök i källorna</label>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Titel, författare eller tidskrift..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9dc46d] focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forskningsområde</label>
                <div className="relative">
                  <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9dc46d] focus:border-transparent appearance-none cursor-pointer hover:border-gray-300"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category} {category !== "Alla" && stats[category] && `(${stats[category]})`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Active filters */}
            {(searchTerm || selectedCategory !== "Alla") && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Aktiva filter:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#9dc46d]/20 text-[#1a4324] rounded-full text-sm">
                    <FiSearch className="w-3 h-3" />
                    {searchTerm}
                    <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-red-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedCategory !== "Alla" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#9dc46d]/20 text-[#1a4324] rounded-full text-sm">
                    <FiFilter className="w-3 h-3" />
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("Alla")} className="ml-1 hover:text-red-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Results Info */}
        <div className="mb-6 text-gray-600">
          Visar {filteredSources.length} av {sources.length} källor
        </div>

        {/* Sources Grid */}
        <div className="grid gap-6">
          {filteredSources.map((source, index) => {
            const CategoryIcon = categoryIcons[source.category] || FiBookOpen;
            
            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 overflow-hidden"
              >
                {/* Category stripe */}
                <div className="h-1 bg-gradient-to-r from-[#1a4324] to-[#9dc46d] group-hover:h-2 transition-all duration-300"></div>
                
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Left side - Icon and metadata */}
                    <div className="flex-shrink-0">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-16 h-16 bg-gradient-to-br from-[#1a4324] to-[#9dc46d] rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg"
                      >
                        <CategoryIcon className="w-8 h-8" />
                      </motion.div>
                      <div className="space-y-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${typeColors[source.type]} backdrop-blur-sm`}>
                          {typeLabels[source.type]}
                        </span>
                        <div className="text-gray-600">
                          <div className="flex items-center gap-2 text-sm">
                            <FiCalendar className="w-4 h-4 text-[#9dc46d]" />
                            <span className="font-medium">{source.year}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* Right side - Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                          {source.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <FiUser className="w-4 h-4" />
                          <span>{source.authors.join(', ')}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">{source.journal}</span>
                          {source.year && <span> ({source.year})</span>}
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {source.summary}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {source.doi && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              DOI: {source.doi}
                            </span>
                          )}
                          {source.pmid && (
                            <span className="text-xs bg-background text-secondary px-2 py-1 rounded">
                              PMID: {source.pmid}
                            </span>
                          )}
                          <span className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded">
                            {source.category}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard(source)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {copiedId === source.id ? (
                            <>
                              <FiCheck className="w-4 h-4 text-primary" />
                              <span className="text-primary">Kopierad!</span>
                            </>
                          ) : (
                            <>
                              <FiCopy className="w-4 h-4" />
                              <span>Kopiera citat</span>
                            </>
                          )}
                        </button>
                        
                        {(source.url || source.doi) && (
                          <a
                            href={source.url || `https://doi.org/${source.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#1a4324] text-white hover:bg-[#9dc46d] hover:text-[#1a4324] rounded-lg transition-colors"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            <span>Läs mer</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredSources.length === 0 && (
          <div className="text-center py-12">
            <FiBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Inga källor hittades</h3>
            <p className="text-gray-500">Prova att ändra sökterm eller filter</p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-16 p-6 bg-[#1a4324] rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-2">Om våra källor</h3>
          <p className="text-white/90 leading-relaxed">
            Alla källor är noggrant utvalda från peer-reviewade tidskrifter och erkända institutioner. 
            Vi strävar efter att använda den senaste forskningen inom functional foods och näringslära 
            för att ge dig den mest aktuella och vetenskapligt grundade informationen.
          </p>
        </div>
      </div>
    </div>
  );
} 