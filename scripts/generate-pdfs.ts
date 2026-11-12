import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '..', 'public', 'pdfs');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface PageContentBlock {
  title: string;
  subtitle?: string;
  sections: {
    heading?: string;
    items?: string[];
    paragraphs?: string[];
  }[];
}

async function createMultiPagePdf(
  title: string,
  docCode: string,
  pagesContent: PageContentBlock[],
  outputPath: string
) {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const totalPages = pagesContent.length;
  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;

  const primaryColor = rgb(0.12, 0.28, 0.65); // Deep Blue
  const secondaryColor = rgb(0.3, 0.35, 0.45); // Slate
  const textColor = rgb(0.15, 0.17, 0.22); // Dark slate
  const lineGray = rgb(0.85, 0.88, 0.92); // Light border
  const headerBgColor = rgb(0.96, 0.97, 0.99); // Soft surface

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const block = pagesContent[pageIdx];
    let y = pageHeight - margin;

    // Header Background Box
    page.drawRectangle({
      x: margin,
      y: y - 48,
      width: contentWidth,
      height: 52,
      color: headerBgColor,
      borderColor: lineGray,
      borderWidth: 1,
    });

    // Top Accent Bar
    page.drawRectangle({
      x: margin,
      y: y + 2,
      width: contentWidth,
      height: 3,
      color: primaryColor,
    });

    // Header Title
    page.drawText('MAHARASHTRA STATE SECONDARY EDUCATION BOARD • SCIENCE 2', {
      x: margin + 12,
      y: y - 14,
      size: 9,
      font: fontBold,
      color: primaryColor,
    });

    page.drawText(title.toUpperCase(), {
      x: margin + 12,
      y: y - 28,
      size: 11,
      font: fontBold,
      color: textColor,
    });

    page.drawText(`Ref: ${docCode} | Academic Year 2025–2026 | Class 10 (SSC)`, {
      x: margin + 12,
      y: y - 40,
      size: 8,
      font: fontRegular,
      color: secondaryColor,
    });

    y -= 64;

    // Page Section Title
    page.drawText(block.title, {
      x: margin,
      y: y,
      size: 14,
      font: fontBold,
      color: primaryColor,
    });
    y -= 16;

    if (block.subtitle) {
      page.drawText(block.subtitle, {
        x: margin,
        y: y,
        size: 9.5,
        font: fontOblique,
        color: secondaryColor,
      });
      y -= 14;
    }

    // Divider line
    page.drawLine({
      start: { x: margin, y: y },
      end: { x: pageWidth - margin, y: y },
      thickness: 0.8,
      color: lineGray,
    });
    y -= 14;

    // Sections & Paragraphs
    for (const sec of block.sections) {
      if (sec.heading) {
        if (y < margin + 60) break;
        page.drawText(sec.heading, {
          x: margin,
          y: y,
          size: 11,
          font: fontBold,
          color: rgb(0.15, 0.22, 0.4),
        });
        y -= 14;
      }

      if (sec.paragraphs) {
        for (const p of sec.paragraphs) {
          const lines = wrapText(p, fontRegular, 9, contentWidth);
          for (const line of lines) {
            if (y < margin + 40) break;
            page.drawText(line, {
              x: margin,
              y: y,
              size: 9,
              font: fontRegular,
              color: textColor,
            });
            y -= 12.5;
          }
          y -= 4;
        }
      }

      if (sec.items) {
        for (const item of sec.items) {
          const isAnswer = item.startsWith('Ans:') || item.startsWith('Model Answer:');
          const isNote = item.startsWith('Note:') || item.startsWith('• Hint:');
          const itemFont = isAnswer ? fontOblique : fontRegular;
          const itemColor = isAnswer ? rgb(0.1, 0.45, 0.2) : isNote ? rgb(0.4, 0.25, 0.1) : textColor;
          
          const lines = wrapText(item, itemFont, 8.5, contentWidth - 14);
          for (let li = 0; li < lines.length; li++) {
            if (y < margin + 40) break;
            if (li === 0 && !item.startsWith('   ')) {
              page.drawText('•', {
                x: margin + 2,
                y: y,
                size: 9,
                font: fontBold,
                color: primaryColor,
              });
            }
            page.drawText(lines[li], {
              x: margin + 12,
              y: y,
              size: 8.5,
              font: itemFont,
              color: itemColor,
            });
            y -= 11.5;
          }
          y -= 3;
        }
      }
      y -= 6;
    }

    // Running Footer
    const footerY = margin - 18;
    page.drawLine({
      start: { x: margin, y: footerY + 16 },
      end: { x: pageWidth - margin, y: footerY + 16 },
      thickness: 0.8,
      color: lineGray,
    });

    page.drawText('EduAI Platform • AI-Powered Educational Analysis & Cognitive Taxonomy', {
      x: margin,
      y: footerY + 4,
      size: 8,
      font: fontRegular,
      color: secondaryColor,
    });

    const pageStr = `Page ${pageIdx + 1} of ${totalPages}`;
    const pageStrWidth = fontBold.widthOfTextAtSize(pageStr, 8);
    page.drawText(pageStr, {
      x: pageWidth - margin - pageStrWidth,
      y: footerY + 4,
      size: 8,
      font: fontBold,
      color: primaryColor,
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Saved: ${outputPath} (${totalPages} pages, ${pdfBytes.length} bytes)`);
}

function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;
    const width = font.widthOfTextAtSize(testLine, size);
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
}

// -------------------------------------------------------------
// DOCUMENT 1: 5 PAGES (Board Model Examination & Question Bank)
// -------------------------------------------------------------
const doc1Pages: PageContentBlock[] = [
  // Page 1
  {
    title: 'SECTION A: Objective Questions & Knowledge Retrieval',
    subtitle: 'Time Allowed: 2 Hours | Maximum Marks: 40 | Question 1 (A & B) - 10 Marks',
    sections: [
      {
        heading: 'General Instructions for Examination',
        paragraphs: [
          '1. All questions are compulsory. Internal choices are provided within respective sections.',
          '2. Draw neat, well-labelled diagrams wherever required in biology questions.',
          '3. Numbers to the right indicate full marks for that specific question.',
          '4. Evaluation follows the updated Maharashtra State Board Class 10 Science 2 Blueprint.'
        ]
      },
      {
        heading: 'Q.1 (A) Choose the correct alternative and complete statements (5 Marks)',
        items: [
          '1. The transfer of genetic information from a molecule of DNA to mRNA is called as ______ process. (a) Translation (b) Transcription (c) Translocation (d) Mutation [Bloom: Remember | Difficulty: Easy]',
          'Ans: (b) Transcription - mRNA is synthesized complementary to the DNA template strand under RNA polymerase.',
          '2. Vestigial organ ______ present in the human body is morphological proof of evolution. (a) Appendix (b) Intestine (c) Lungs (d) Heart [Bloom: Remember | Difficulty: Easy]',
          'Ans: (a) Appendix - Appendix is functionless in humans but functional in ruminant herbivores for cellulose digestion.',
          '3. The causality behind sudden evolutionary genetic variations was explained by ______ through his Mutation Theory. (a) Hugo de Vries (b) Gregor Mendel (c) Charles Darwin (d) Lamarck [Bloom: Remember | Difficulty: Easy]',
          'Ans: (a) Hugo de Vries (1901) formulated the Mutation theory of evolution.',
          '4. Organisms that produce their own organic food using sunlight and chlorophyll are called ______. (a) Producers (b) Primary consumers (c) Decomposers (d) Parasites [Bloom: Remember | Difficulty: Easy]',
          'Ans: (a) Producers (Autotrophs).',
          '5. Electricity generated by using thermal energy from solar radiation is known as ______ electricity. (a) Solar thermal (b) Nuclear (c) Hydroelectric (d) Geothermal [Bloom: Remember | Difficulty: Easy]',
          'Ans: (a) Solar thermal electricity generation.'
        ]
      }
    ]
  },
  // Page 2
  {
    title: 'SECTION A (Contd.): Correlation, Odd One Out & Definitions',
    subtitle: 'Question 1 (B) - 5 Marks | Factual & Conceptual Recall',
    sections: [
      {
        heading: 'Q.1 (B) Solve the following sub-questions (1 Mark Each)',
        items: [
          '1. Find the odd one out and justify: Transcription, Translation, Translocation, Mutation. [Bloom: Analyze | Difficulty: Easy]',
          'Ans: Mutation. Reason: Transcription, translation, and translocation are normal sequential biological steps of protein synthesis, whereas mutation is an accidental sudden change in nucleotide sequence.',
          '2. Identify correlation: Peripatus : Connecting link :: Human appendix : ______ [Bloom: Understand | Difficulty: Easy]',
          'Ans: Vestigial organ.',
          '3. State True or False with rectification: "The gender of an unborn child is scientifically determined by the maternal ovum." [Bloom: Evaluate | Difficulty: Medium]',
          'Ans: False. Rectification: The gender of a human child is determined by the paternal sperm (which carries either an X or a Y chromosome); all maternal ova contain only X chromosomes.',
          '4. Write the name of the international disaster relief and search agency in India: [Bloom: Remember | Difficulty: Easy]',
          'Ans: National Disaster Response Force (NDRF).',
          '5. Match the following: (Column A: Solar panel) -> (Column B: Conversion): [Bloom: Understand | Difficulty: Easy]',
          'Ans: Photovoltaic cells convert radiant solar energy directly into direct current (DC) electrical energy without rotating turbines.'
        ]
      },
      {
        heading: 'SECTION B: Conceptual Understanding & Reasoning (Q.2 - 10 Marks)',
        paragraphs: [
          'Attempt any FIVE out of the following seven sub-questions (2 Marks each).'
        ],
        items: [
          'Q.2 (1) Give scientific reason: Peripatus is designated as a living connecting link between Phylum Annelida and Phylum Arthropoda. [Bloom: Understand | Difficulty: Medium]',
          'Ans: Peripatus displays segmented body, thin cuticle, and parapodia-like organ structures characteristic of Annelids, while simultaneously exhibiting trachea and an open circulatory system typical of Arthropods.',
          'Q.2 (2) Give scientific reason: Microbial enzymes are preferred over chemical catalysts in modern eco-friendly industries. [Bloom: Analyze | Difficulty: Medium]',
          'Ans: Microbial enzymes function effectively at lower temperatures, normal atmospheric pressure, and neutral pH, thus drastically saving thermal energy, eliminating hazardous effluents, and providing higher substrate specificity.'
        ]
      }
    ]
  },
  // Page 3
  {
    title: 'SECTION B (Contd.) & SECTION C: Analytical Reasoning',
    subtitle: 'Question 2 (Contd.) & Question 3 - Short & Intermediate Analytical Questions',
    sections: [
      {
        heading: 'Q.2 (Contd.) Attempt Remaining Questions (2 Marks Each)',
        items: [
          'Q.2 (3) Distinguish between: Lamarckism vs Darwinism (Natural Selection). [Bloom: Analyze | Difficulty: Medium]',
          'Ans: Lamarckism proposes that characters acquired by an organism through continuous use or disuse during its lifetime are transmitted to offspring. Darwinism states that nature naturally selects pre-existing favorable genetic variations that confer higher survival fitness.',
          'Q.2 (4) Explain two major functions of the testis in the human male reproductive system. [Bloom: Understand | Difficulty: Easy]',
          'Ans: 1. Production and maturation of male haploid gametes (sperms) inside seminiferous tubules. 2. Secretion of the steroid hormone testosterone responsible for secondary male sexual characteristics.',
          'Q.2 (5) Define vestigial organs. List any four vestigial organs found in the human body. [Bloom: Remember | Difficulty: Easy]',
          'Ans: Vestigial organs are degenerated or underdeveloped useless organs of organisms. Examples: 1. Appendix 2. Tail-bone (Coccyx) 3. Wisdom teeth 4. Ear muscles (Pinna movement).'
        ]
      },
      {
        heading: 'SECTION C: Detailed Explanations & Justifications (Q.3 - 15 Marks)',
        paragraphs: [
          'Attempt any FIVE out of seven questions (3 Marks each).'
        ],
        items: [
          'Q.3 (1) Read the statement and justify in your own words: "Geographical and reproductive isolation of organisms gradually leads to speciation." [Bloom: Evaluate | Difficulty: Hard]',
          'Ans: Each species thrives in distinct ecological habitats with unique dietary, climatic, and reproductive requirements. When a population becomes isolated by geographical barriers (mountains, rivers, continental drift), gene flow ceases. Over extended evolutionary epochs, accumulated genetic mutations and varied natural selection pressures create reproductive incompatibility, establishing a distinct new species.',
          'Q.3 (2) Justify why the study of fossils and carbon-dating methods is indispensable in evolutionary biology. [Bloom: Evaluate | Difficulty: Medium]',
          'Ans: Fossils preserve structural remnants and impressions of ancient organisms across geological rock strata. Radiocarbon dating (measuring remaining C-14 compared to stable C-12) establishes precise chronology, proving that invertebrates evolved first in ancient eras, followed by fish, amphibians, reptiles, and mammals.'
        ]
      }
    ]
  },
  // Page 4
  {
    title: 'SECTION C (Contd.): Applied Disasters & Environmental Health',
    subtitle: 'Question 3 (Contd.) - 3 Marks Each | Practical Application & Bloom: Apply',
    sections: [
      {
        heading: 'Q.3 (Contd.) Practical Science 2 Case Studies',
        items: [
          'Q.3 (3) What are the core objectives of conducting a disaster management mock drill in schools and public centers? [Bloom: Apply | Difficulty: Medium]',
          'Ans: 1. To evaluate readiness, quick response time, and operational coordination during sudden emergencies. 2. To test the functionality of firefighting gear, alarms, and emergency evacuation exits. 3. To impart hands-on rescue and first-aid skills, eliminating panic among students and personnel.',
          'Q.3 (4) Explain the three primary stages of the Disaster Management Cycle: Pre-disaster, Emergency, and Post-disaster recovery. [Bloom: Understand | Difficulty: Medium]',
          'Ans: • Pre-disaster: Hazard mapping, early warning systems, preventive infrastructure reinforcement, and citizen training. • Emergency Phase: Immediate search and rescue, medical triage, food/water supply, and life preservation. • Post-disaster: Debris removal, disease prevention, infrastructure rehabilitation, and long-term socio-economic rebuilding.',
          'Q.3 (5) Write short notes on: Cybercrime hazards and technology addiction among teenagers. [Bloom: Understand | Difficulty: Medium]',
          'Ans: Excessive screen time and social media fixation cause interpersonal alienation, visual strain, insomnia, and psychological anxiety. Cyber risks include phishing fraud, unauthorized biometric sharing, and cyberbullying. Remedial measures involve parental counseling, digital detox habits, sports participation, and statutory reporting under the IT Act.',
          'Q.3 (6) Distinguish between: Conventional Thermal Power Generation vs Solar Photovoltaic Generation. [Bloom: Analyze | Difficulty: Medium]',
          'Ans: Thermal generation burns coal to generate steam, emitting harmful greenhouse gases (CO2, SO2) and depleting fossil reserves. Solar PV generation directly converts solar radiation into DC voltage without mechanical boilers, generating clean, renewable, and pollution-free power.'
        ]
      }
    ]
  },
  // Page 5
  {
    title: 'SECTION D: Long Answer & Comprehensive Synthesis',
    subtitle: 'Question 4 - 5 Marks | Deep Explanations, Central Dogma & Question Bank Matrix',
    sections: [
      {
        heading: 'Q.4 Attempt any ONE of the following comprehensive questions (5 Marks)',
        items: [
          'Q.4 (1) Explain the Central Dogma of Protein Synthesis in living organisms. Detail the three coordinated stages: Transcription, Translation, and Translocation with appropriate terminology. [Bloom: Create / Understand | Difficulty: Hard]',
          'Ans: The Central Dogma establishes that genetic information flows unidirectionally from DNA -> RNA -> Functional Protein.',
          '• Transcription: Inside the cell nucleus, the double-stranded DNA uncoils. The enzyme RNA polymerase synthesizes a single-stranded messenger RNA (mRNA) complementary to the DNA template strand, replacing Thymine (T) with Uracil (U).',
          '• Translation: The synthesized mRNA emerges into the cytoplasm and docks onto a ribosome. The mRNA sequence is deciphered in groups of three nitrogenous bases called triplet codons. Transfer RNA (tRNA) molecules possessing complementary anticodons transport specific amino acids to the ribosomal site.',
          '• Translocation: The ribosome sequentially advances along the mRNA chain by the distance of exactly one triplet codon. Peptide bonds are synthesized between successive amino acids, assembling a nascent polypeptide chain.',
          'Q.4 (2) Describe the flood disaster management framework across pre-disaster, warning, emergency rescue, rehabilitation, and long-term riverbank reconstruction phases. [Bloom: Evaluate | Difficulty: Hard]',
          'Ans: Pre-disaster: River catchment desilting, radar meteorological monitoring, and flood-line zoning. Warning: Sirens, emergency SMS broadcasting, and livestock evacuation. Emergency: NDRF motorized boat deployment, helivac of stranded victims, water purification kits. Rehabilitation: Shelter camps, chlorination against cholera, and school resumption.'
        ]
      },
      {
        heading: 'Board Question Bank Specification & Marking Summary',
        paragraphs: [
          'Total Marks: 40 | Question Count: 18 Questions across 4 Sections.',
          'Cognitive Distribution: Remember: 25% | Understand: 35% | Apply: 20% | Analyze: 12% | Evaluate/Create: 8%.',
          'Difficulty Distribution: Easy: 40% (16 Marks) | Medium: 42% (17 Marks) | Hard: 18% (7 Marks).'
        ]
      }
    ]
  }
];

// -------------------------------------------------------------
// DOCUMENT 2: 8 PAGES (State Board Curriculum Syllabus & Chapter Units)
// -------------------------------------------------------------
const doc2Pages: PageContentBlock[] = [
  // Page 1
  {
    title: 'STATE BOARD SCIENCE 2: CURRICULUM ARCHITECTURE',
    subtitle: 'Maharashtra State Board Class 10 SSC • Academic Regulations & Weightage Matrix',
    sections: [
      {
        heading: '1. Preamble & Pedagogical Objectives',
        paragraphs: [
          'Science and Technology Part 2 encompasses Biological Sciences, Human Physiology, Genetics, Environmental Conservation, Green Energy Technologies, Social Health, and Disaster Management.',
          'The curriculum aims to foster empirical scientific inquiry, ecological stewardship, biological literacy, and responsible societal citizenship in compliance with national educational standards.'
        ]
      },
      {
        heading: '2. Examination Pattern & Unit-Wise Marks Distribution',
        items: [
          'Written Board Examination: 40 Marks (Time: 2 Hours)',
          'Internal Continuous Comprehensive Evaluation & Practicals: 10 Marks',
          'Total Science 2 Assessment: 50 Marks (Combined with Science 1 for a 100-mark composite science score)',
          'Unit 1: Genetics & Evolution (Chapters 1 & 2): 12 Marks with options',
          'Unit 2: Life Processes & Reproduction (Chapters 2 & 3): 14 Marks with options',
          'Unit 3: Ecology, Environment & Green Energy (Chapters 4 & 5): 12 Marks with options',
          'Unit 4: Animal Classification & Applied Microbiology (Chapters 6 & 7): 12 Marks with options',
          'Unit 5: Biotechnology, Social Health & Disasters (Chapters 8, 9 & 10): 12 Marks with options'
        ]
      }
    ]
  },
  // Page 2
  {
    title: 'CHAPTER 1: HEREDITY AND EVOLUTION',
    subtitle: 'Core Unit 1 | Theory Hours: 14 | Evaluated Marks: 6 (without option), 8 (with option)',
    sections: [
      {
        heading: 'Syllabus Sub-Topics & Curricular Coverage',
        items: [
          '1.1 Hereditary mechanisms and genetic transmission from parental generation to offspring.',
          '1.2 Central Dogma: Transcription, Translation, and Translocation mechanisms.',
          '1.3 Mutation: Sudden sequence changes, Hugo de Vries theory, and sickle-cell gene alteration.',
          '1.4 Evolution: Definition as gradual, progressive change across geological epochs.',
          '1.5 Evidences of Evolution: Morphological, Anatomical (homologous bones), Vestigial organs (appendix, coccyx, ear muscles), Palaeontological & Carbon-14 dating, Connecting links (Peripatus, Platypus), and Embryological stages.',
          '1.6 Theories of Evolution: Darwin’s Natural Selection, Survival of the Fittest, Origin of Species, Lamarckism (use/disuse & inheritance of acquired characters), and modern Speciation drivers.',
          '1.7 Human Evolution: 7 crore years timeline from Lemur-like ancestors, Ramapithecus, Australopithecus, Neanderthal man to intelligent Homo sapiens.'
        ]
      },
      {
        heading: 'Key Student Learning Outcomes (SLOs)',
        paragraphs: [
          'Students will be able to justify evolutionary homologies, trace human fossil progression, decipher codon-amino acid translation, and critique Lamarckian versus Darwinian evolutionary models.'
        ]
      }
    ]
  },
  // Page 3
  {
    title: 'CHAPTER 2 & 3: LIFE PROCESSES IN LIVING ORGANISMS',
    subtitle: 'Energy Release, Cell Division & Reproduction Systems | Evaluated Marks: 12 (with option)',
    sections: [
      {
        heading: 'Chapter 2: Respiration, Nutrient Metabolism & Cell Division',
        items: [
          '• Cellular respiration: Aerobic (Glycolysis / EMP pathway, TCA cycle / Krebs cycle, Electron Transfer Chain) vs Anaerobic fermentation.',
          '• Production of ATP currency through cellular oxidation of carbohydrates, proteins, and lipids.',
          '• Mitosis (Karyokinesis: Prophase, Metaphase, Anaphase, Telophase, and Cytokinesis) for somatic growth and repair.',
          '• Meiosis (Meiosis I and Meiosis II) with crossing over for genetic diversity in germ cells.'
        ]
      },
      {
        heading: 'Chapter 3: Reproduction & Human Reproductive Health',
        items: [
          '• Asexual reproduction: Binary fission, Multiple fission, Budding, Fragmentation, Regeneration, Vegetative propagation, and Spore formation.',
          '• Sexual reproduction in flowering plants: Pollination, Double fertilization, seed germination.',
          '• Human Male Reproductive System: Testes, scrotum, vas deferens, seminal vesicles, prostate, urethra.',
          '• Human Female Reproductive System: Ovaries, fallopian tubes, uterus, cervix, vagina, and Menstrual cycle hormonal cascades (FSH, LH, Estrogen, Progesterone).',
          '• Assisted Reproductive Technologies (ART): In-Vitro Fertilization (IVF), Surrogacy, and Sperm banks.'
        ]
      }
    ]
  },
  // Page 4
  {
    title: 'CHAPTER 4: ENVIRONMENTAL MANAGEMENT',
    subtitle: 'Ecosystem Balance, Conservation Ecology & Solid Waste | Evaluated Marks: 7 (with option)',
    sections: [
      {
        heading: 'Core Conceptual Learning Units',
        items: [
          '• Ecosystem components: Biotic (producers, consumers, decomposers) and Abiotic (soil, temperature, moisture, minerals).',
          '• Environmental pollution: Air, Water, and Soil contaminants and their biological magnification through food chains.',
          '• Biodiversity hot spots: Western Ghats, Indo-Burma, and Sundaland reserves.',
          '• Classification of Threatened Species: Endangered, Rare, Vulnerable, and Indeterminate species (IUCN Red List guidelines).',
          '• Sacred Groves (Devrai): Indigenous community-managed forest patches preserving endemic medicinal flora and sacred fauna.',
          '• Solid Waste Management: Principles of 3R (Reduce, Reuse, Recycle), composting, vermicomposting, and landfill hazards.'
        ]
      },
      {
        heading: 'Environmental Ethics & Citizen Responsibilities',
        paragraphs: [
          'Focuses on individual ecological footprint reduction, tree plantation mandates, single-use plastic eradication, and citizen compliance with environmental protection acts.'
        ]
      }
    ]
  },
  // Page 5
  {
    title: 'CHAPTER 5: TOWARDS GREEN ENERGY',
    subtitle: 'Sustainable Energy Generation, Renewable Technologies | Evaluated Marks: 6 (with option)',
    sections: [
      {
        heading: 'Comparative Energy Generation Systems',
        items: [
          '• Principle of Electromagnetic Induction (Michael Faraday) utilized in rotating turbine generators.',
          '• Thermal Power Plants: Chemical energy in coal -> Thermal energy -> Kinetic energy in steam -> Mechanical energy in turbine -> Electrical energy. Environmental drawbacks: Greenhouse gases (CO2), acid rain precursors (SOx, NOx), toxic ash disposal.',
          '• Nuclear Power Plants: Controlled fission of Uranium-235 or Plutonium-239. Merits: High energy yield without air pollution; Risks: Radioactive waste storage and catastrophic meltdown risks.',
          '• Hydroelectric Power Plants: Potential energy of dam water -> Kinetic energy -> Turbine -> Generator. Merits: Zero fuel combustion; Demerits: Submergence of fertile lands and rehabilitation issues.',
          '• Solar Energy Technologies: Photovoltaic solar cells (Silicon semiconductors) converting radiant photon energy directly into DC electricity; Solar thermal power plants concentrating sunlight to generate steam.'
        ]
      }
    ]
  },
  // Page 6
  {
    title: 'CHAPTER 6 & 7: ANIMAL CLASSIFICATION & APPLIED MICROBIOLOGY',
    subtitle: 'Taxonomy Criteria & Industrial Biotechnology | Evaluated Marks: 10 (with option)',
    sections: [
      {
        heading: 'Chapter 6: Criteria for New Animal Classification',
        items: [
          '• Levels of Organization: Cellular (Porifera), Tissue (Cnidaria), Organ, and Organ-System level (Arthropoda, Chordata).',
          '• Body Symmetry: Asymmetrical (Sponges), Radial (Hydra, Sea star), and Bilateral (Planaria, Fish, Humans).',
          '• Germ Layers: Diploblastic (Ectoderm, Endoderm) vs Triploblastic (Ectoderm, Mesoderm, Endoderm).',
          '• Body Cavity (Coelom): Acoelomate, Pseudocoelomate (Aschelminthes), and Eucoelomate.',
          '• Major Phyla: Porifera, Coelenterata, Platyhelminthes, Aschelminthes, Annelida, Arthropoda, Mollusca, Echinodermata, Hemichordata, and Chordata (Pisces, Amphibia, Reptilia, Aves, Mammalia).'
        ]
      },
      {
        heading: 'Chapter 7: Applied Microbiology & Food Technology',
        items: [
          '• Industrial production of dairy products: Yogurt, Cheese production using Lactobacillus bulgaricus and Streptococcus thermophilus.',
          '• Probiotics: Active bacterial supplements maintaining beneficial gut microbiome balance.',
          '• Microbial enzymes, amino acids, biofuel generation (ethanol from molasses), and bioremediation of oil spills using Alcanivorax borkumensis.'
        ]
      }
    ]
  },
  // Page 7
  {
    title: 'CHAPTER 8 & 9: CELL BIOLOGY, BIOTECHNOLOGY & SOCIAL HEALTH',
    subtitle: 'Stem Cells, Gene Editing & Psychosocial Wellbeing | Evaluated Marks: 9 (with option)',
    sections: [
      {
        heading: 'Chapter 8: Cell Biology and Biotechnology',
        items: [
          '• Stem Cells: Totipotent, Pluripotent, and Multipotent stem cells obtained from umbilical cord blood, blastocysts, and adult bone marrow for organ regeneration and regenerative medicine.',
          '• Genetic Engineering: Recombinant DNA technology, transgenic crops (Bt Cotton, Golden Rice enriched with Vitamin A), and therapeutic human insulin production.',
          '• Cloning: Reproductive cloning (Dolly the sheep) and therapeutic tissue cloning.'
        ]
      },
      {
        heading: 'Chapter 9: Social Health & Digital Age Challenges',
        items: [
          '• Factors affecting social health: Mental stress, addiction to tobacco, alcohol, gutkha, and narcotics.',
          '• Incurable diseases, social exclusion, and irrational superstitions.',
          '• Communication Technology & Cyber Hazards: Compulsive selfie clicking, mobile screen fatigue, cyberbullying, online gambling, and financial cybercrimes.',
          '• Stress Management Techniques: Laughter clubs, regular physical exercise, hobbies (music, reading, gardening), meditation, and professional psychological counseling (e.g., Childline 1098).'
        ]
      }
    ]
  },
  // Page 8
  {
    title: 'CHAPTER 10: DISASTER MANAGEMENT & EVALUATION BLUEPRINT',
    subtitle: 'Emergency Protocols, Mock Drills & Board Blueprint Rubric | Evaluated Marks: 6 (with option)',
    sections: [
      {
        heading: 'Chapter 10: Disaster Classification & Response Framework',
        items: [
          '• Disaster Categorization: Geological (Earthquakes, Volcanism, Landslides), Climatic (Cyclones, Floods, Cloudbursts, Drought), and Man-made (Industrial chemical gas leaks, Nuclear accidents, Riots, Forest fires).',
          '• Disaster Management Cycle: 1. Preparedness 2. Early Warning 3. Immediate Rescue 4. Relief Supplies 5. Rehabilitation & Reconstruction.',
          '• First Aid Protocols: ABC Principle (Airway, Breathing, Circulation), pressure bandages for arterial bleeding, RICE protocol for sprains, and burns neutralization.',
          '• Essential Disaster Signs & Universal Symbols: Exit routes, fire alarm pull stations, radiation hazard emblems, and inflammable liquid notices.'
        ]
      },
      {
        heading: 'Science 2 Question Paper Weightage Blueprint Scheme',
        items: [
          '• Objective Q.1 (A & B): 10 Questions × 1 Mark = 10 Marks (Compulsory)',
          '• Short Answer Q.2 (A & B): 5 Questions × 2 Marks = 10 Marks (Choice: 5 out of 7)',
          '• Conceptual Q.3: 5 Questions × 3 Marks = 15 Marks (Choice: 5 out of 7)',
          '• Long Answer Q.4: 1 Question × 5 Marks = 5 Marks (Choice: 1 out of 2)',
          '• Total Composite Marks: 40 Marks (60 Marks with full optional questions)'
        ]
      }
    ]
  }
];

// -------------------------------------------------------------
// DOCUMENT 3: 16 PAGES (Master Study Guide & Solved Exemplars)
// -------------------------------------------------------------
const doc3Pages: PageContentBlock[] = [
  // Page 1
  {
    title: 'MASTER STUDY GUIDE: SCIENCE 2 COMPREHENSIVE COMPENDIUM',
    subtitle: 'Secondary School Certificate (SSC) Class 10 • Comprehensive Academic Companion',
    sections: [
      {
        heading: 'Executive Study Architecture',
        paragraphs: [
          'This Master Study Guide serves as an authoritative synthesis of the Maharashtra State Board Class 10 Science 2 curriculum. It integrates concise theoretical revision, annotated conceptual diagrams, comparative tables, and comprehensive model solved exemplars aligned with Bloom’s Revised Taxonomy.'
        ]
      },
      {
        heading: 'Module Directory',
        items: [
          'Unit I: Central Dogma, Molecular Genetics & Mutation Dynamics (Pages 2–3)',
          'Unit II: Evidences of Evolution, Chronology & Connecting Links (Pages 4–5)',
          'Unit III: Human Reproduction, Gametogenesis & Menstrual Cycle (Page 6)',
          'Unit IV: Conservation Ecology, Biodiversity & Solid Waste Strategies (Page 7)',
          'Unit V: Green Energy Systems & Electric Power Thermodynamics (Page 8)',
          'Unit VI: Psychosocial Health, Stress Management & Digital Wellness (Page 9)',
          'Unit VII: Disaster Management Operational Lifecycle & First Aid Protocols (Page 10)',
          'Unit VIII: Solved Exemplars 1 – Objective & Correlative Questions (Page 11)',
          'Unit IX: Solved Exemplars 2 – Scientific Reasons & 2-Mark Explanations (Page 12)',
          'Unit X: Solved Exemplars 3 – Comparative Distinctions & Tables (Page 13)',
          'Unit XI: Solved Exemplars 4 – 3-Mark Analytical Justifications (Page 14)',
          'Unit XII: Solved Exemplars 5 – 5-Mark Comprehensive Case Studies (Page 15)',
          'Unit XIII: High-Yield Revision Matrix & Examination Success Strategy (Page 16)'
        ]
      }
    ]
  },
  // Page 2
  {
    title: 'UNIT I: CENTRAL DOGMA & PROTEIN SYNTHESIS',
    subtitle: 'Molecular Genetics: DNA Transcription, RNA Translation, and Ribosomal Translocation',
    sections: [
      {
        heading: '1. The Central Dogma Principle',
        paragraphs: [
          'The Central Dogma establishes the unidirectional transmission of biological information encoded in master DNA blueprints into operational cellular protein molecules: DNA -> mRNA (Transcription) -> Polypeptide Protein (Translation).'
        ]
      },
      {
        heading: '2. Transcription: mRNA Synthesis',
        items: [
          '• Occurs within the cellular nucleus governed by RNA polymerase enzymes.',
          '• The hydrogen bonds of double-stranded DNA unwind selectively at the promoter site.',
          '• A single-stranded messenger RNA (mRNA) is synthesized complementary to the DNA template strand.',
          '• In RNA nucleotide assembly, Uracil (U) substitutes for Thymine (T) opposite Adenine (A).'
        ]
      },
      {
        heading: '3. Translation & Triplet Codons',
        items: [
          '• Synthesized mRNA departs through nuclear pores into the cytoplasm and binds to ribosomal subunits.',
          '• The mRNA sequence is deciphered in discrete 3-nitrogenous-base units termed Triplet Codons.',
          '• Dr. Har Gobind Khorana shared the Nobel Prize (1968) for deciphering amino acid triplet codon mappings.',
          '• Transfer RNA (tRNA) possessing complementary Anticodons shuttles specific amino acids to the active ribosomal decoding site.'
        ]
      },
      {
        heading: '4. Ribosomal Translocation & Polypeptide Elongation',
        items: [
          '• Peptide bonds link adjacent amino acids via catalytic activity of ribosomal RNA (rRNA).',
          '• The ribosome advances sequentially along the mRNA by the exact distance of one triplet codon: Translocation.'
        ]
      }
    ]
  },
  // Page 3
  {
    title: 'UNIT I (Contd.): MUTATION DYNAMICS & SPECIATION',
    subtitle: 'Hugo de Vries Mutation Principle & Mechanisms of Speciation',
    sections: [
      {
        heading: '1. Genetic Mutation Mechanisms',
        items: [
          '• A gene is a functional segment of DNA regulating specific biochemical traits.',
          '• Any sudden accidental modification in nucleotide sequence is termed a Mutation.',
          '• Minor point mutations may cause hereditary disorders such as Sickle-cell anaemia (substitution of valine for glutamic acid in hemoglobin beta chain).',
          '• Major chromosomal mutations introduce structural inversions, deletions, or duplications providing raw variations for natural selection.'
        ]
      },
      {
        heading: '2. Speciation Drivers',
        items: [
          '• Species Definition: A group of morphologically and genetically similar organisms capable of freely interbreeding under natural conditions to produce fertile offspring.',
          '• Geographical Isolation: Physical barriers (mountain ranges, marine expansion, continental rift) partition a parent population, halting gene flow.',
          '• Reproductive Isolation: Divergent mating periods, anatomical differences, or courtship rituals prevent interbreeding even if geographical contact is restored.',
          '• Natural Selection Differential: Divergent environments impose distinctive survival pressures, cementing genomic divergence.'
        ]
      }
    ]
  },
  // Page 4
  {
    title: 'UNIT II: EVIDENCES OF ORGANIC EVOLUTION',
    subtitle: 'Morphological, Anatomical, Vestigial, Palaeontological & Embryological Evidence',
    sections: [
      {
        heading: '1. Comparative Morphology & Anatomy',
        items: [
          '• Morphological Evidence: Similarities in facial characteristics, snout orientation, ear pinna, and hair coverage across mammalian lineages suggest descent from common ancestors.',
          '• Anatomical Evidence: Forelimb of human, foreleg of ox, flipper of whale, and patagium of bat possess radically different functions (grasping, walking, swimming, flying) yet display identical underlying bone configurations (humerus, radius, ulna, carpals, metacarpals, phalanges).'
        ]
      },
      {
        heading: '2. Vestigial Organs in Humans',
        items: [
          '• Degenerated or functionless structures that were functional in ancestral species.',
          '• Appendix: Non-functional in humans; fully functional in ruminants for cellulose breakdown.',
          '• Coccyx (Tail-bone): Remnant of ancestral mammalian vertebral tail.',
          '• Wisdom Teeth (Third Molars): Redundant due to modern cooked food diets.',
          '• Auricular Muscles: Non-functional in humans; functional in monkeys, dogs, and horses for ear rotation.'
        ]
      },
      {
        heading: '3. Palaeontological Evidence & Carbon Dating',
        items: [
          '• Stratigraphic fossil distribution demonstrates ancient invertebrates in deep Paleozoic layers, followed by fishes, amphibians, reptiles in Mesozoic, and birds/mammals in Coenozoic.',
          '• Willard Libby Carbon Dating: Calculates ratio of radioactive C-14 decay relative to non-radioactive C-12.'
        ]
      }
    ]
  },
  // Page 5
  {
    title: 'UNIT II (Contd.): CONNECTING LINKS & HUMAN EVOLUTION',
    subtitle: 'Living Evolutionary Bridges & The 7-Crore Year Chronology to Homo Sapiens',
    sections: [
      {
        heading: '1. Living Connecting Links',
        items: [
          '• Organisms exhibiting morphological and physiological characteristics spanning two distinct phyla or classes.',
          '• Peripatus: Connecting link between Annelida (segmented body, thin cuticle, parapodia) and Arthropoda (tracheal respiration, open circulatory system).',
          '• Duck-billed Platypus: Connecting link between Reptiles (oviparous egg-laying, cloaca) and Mammals (mammary glands, hair).',
          '• Lungfish: Connecting link between Pisces (fins, scales) and Amphibia (pulmonary respiration through lungs).'
        ]
      },
      {
        heading: '2. Chronology of Human Evolution',
        items: [
          '• 7 Crore Years Ago: Extinction of dinosaurs during the Earth Ice Age; emergence of arboreal Lemur-like ancestors.',
          '• 4 Crore Years Ago: Aegyptopithecus in Africa lost tails; enlargement of brain and stereoscopic vision.',
          '• 2 Crore Years Ago: Dryopithecus and Ramapithecus adapted to open grasslands.',
          '• 40 Lakh Years Ago: Australopithecus exhibited bipedal locomotion and upright posture.',
          '• 20 Lakh Years Ago: Homo habilis (Handy Man) crafted primitive stone tools.',
          '• 15 Lakh Years Ago: Homo erectus discovered fire and migrated into Asia and Europe.',
          '• 1.5 Lakh Years Ago: Neanderthal Man buried dead with ceremonial rituals.',
          '• 50,000 Years Ago: Cro-Magnon Man developed cave art and advanced tools.',
          '• 10,000 Years Ago: Modern Homo sapiens initiated organized agriculture and settled civilizations.'
        ]
      }
    ]
  },
  // Page 6
  {
    title: 'UNIT III: HUMAN REPRODUCTIVE SYSTEM & HEALTH',
    subtitle: 'Anatomy, Hormonal Regulation, Menstrual Cycle & Assisted Reproduction',
    sections: [
      {
        heading: '1. Human Reproductive Organs',
        items: [
          '• Male System: Scrotum housing paired Testes (operating at 2-3°C below core body temperature for spermatogenesis), Epididymis, Vas deferens, Seminal vesicles, Prostate gland, Cowper’s glands, and Urethra.',
          '• Female System: Paired Ovaries, Fallopian tubes (Oviducts - site of fertilization), Uterus (muscular womb for blastocyst implantation), Cervix, and Vagina.'
        ]
      },
      {
        heading: '2. Hormonal Regulation of the Menstrual Cycle (28-day cycle)',
        items: [
          '• Follicular Phase (Days 1–13): Pituitary FSH stimulates primary follicle growth; maturing follicle secretes Estrogen rebuilding endometrium.',
          '• Ovulation Phase (Day 14): Pituitary LH surge triggers rupture of Graafian follicle, releasing secondary oocyte into oviduct.',
          '• Luteal Phase (Days 15–28): Ruptured follicle transforms into Corpus Luteum, secreting high levels of Progesterone for uterine lining maintenance.',
          '• Menstruation (Days 1–5): If unfertilized, Corpus Luteum degenerates into Corpus Albicans; progesterone plummets, shedding endometrium.'
        ]
      },
      {
        heading: '3. Assisted Reproductive Technologies (ART)',
        items: [
          '• In-Vitro Fertilization (IVF): Oocytes and sperms fertilized in vitro, followed by blastocyst embryo transfer.',
          '• Surrogacy: Biological embryo implanted into the surrogate mother’s uterus for full gestation.',
          '• Sperm Banks: Cryopreserved donor semen compliant with ethical and infectious disease screening.'
        ]
      }
    ]
  },
  // Page 7
  {
    title: 'UNIT IV: ECOLOGY, BIODIVERSITY & WASTE MANAGEMENT',
    subtitle: 'Ecological Balance, Hotspots, Sacred Groves & 3R Waste Paradigm',
    sections: [
      {
        heading: '1. Biodiversity Levels & Global Hotspots',
        items: [
          '• Genetic Diversity: Intra-species variation (e.g. thousands of distinct rice or mango cultivars).',
          '• Species Diversity: Inter-species richness within a given geographical biome.',
          '• Ecosystem Diversity: Landscape richness spanning terrestrial, aquatic, estuarine, and marine biomes.',
          '• Biodiversity Hotspots: Western Ghats, Eastern Himalayas, and Indo-Burma regions housing threatened endemic wildlife.'
        ]
      },
      {
        heading: '2. Sacred Groves (Devrai)',
        items: [
          '• Ancient forest sanctuaries protected by rural indigenous communities in the name of local deities.',
          '• Harbor rare medicinal plants, undisturbed seed gene banks, and endemic micro-fauna safe from commercial deforestation.'
        ]
      },
      {
        heading: '3. Modern Solid Waste Management Principles',
        items: [
          '• Source Segregation: Immediate division into biodegradable wet waste, recyclable dry waste, and domestic hazardous waste.',
          '• The 3R Philosophy: Reduce consumption, Reuse non-degradable containers, and Recycle plastics, paper, and glass.',
          '• Vermicomposting: Earthworm cultures (Eisenia fetida) transforming organic vegetable waste into nutrient-rich humus.',
          '• Sanitary Landfilling: Engineered clay-lined subterranean pits with leachate capture and methane extraction pipes.'
        ]
      }
    ]
  },
  // Page 8
  {
    title: 'UNIT V: TOWARDS GREEN ENERGY SYSTEMS',
    subtitle: 'Thermodynamics of Power Generation: Thermal vs Solar vs Hydroelectric',
    sections: [
      {
        heading: '1. Electromagnetic Induction & Power Generation',
        items: [
          '• Discovered by Michael Faraday: When magnetic flux linked with a conductive coil changes, an electric potential difference is induced.',
          '• All turbine-driven generating stations (thermal, nuclear, hydro, wind) operate on this principle.'
        ]
      },
      {
        heading: '2. Comparative Technology Matrix',
        items: [
          '• Thermal Power: Coal combustion produces steam driving turbines. Efficiency: ~35%. Issues: Airborne particulate matter (SPM), CO2 emissions causing global warming, acid rain.',
          '• Nuclear Power: Fission of Uranium-235 splits atoms releasing massive heat. Zero greenhouse gas emission during operation, but high risk of ionizing radiation leaks and millenia-long toxic nuclear waste disposal.',
          '• Hydroelectric Power: High-elevation water rotates Kaplan or Pelton turbines. Clean renewable source, but alters aquatic ecosystems and requires massive population resettlement.',
          '• Solar Photovoltaic (PV): Directly converts photon energy into Direct Current (DC) electricity via semiconductor p-n junctions without mechanical friction or water consumption.'
        ]
      }
    ]
  },
  // Page 9
  {
    title: 'UNIT VI: SOCIAL HEALTH & DIGITAL WELLBEING',
    subtitle: 'Substance Abuse Hazards, Mental Stress Factors & Remedial Coping Strategies',
    sections: [
      {
        heading: '1. Dimensions of Social Health',
        items: [
          '• Social health is the capacity of an individual to establish harmonious, empathetic, and constructive interpersonal relationships within community and family structures.',
          '• Threats to social health: Chronic diseases, poverty, loneliness, communal prejudices, addiction, and uncontrolled cyber obsession.'
        ]
      },
      {
        heading: '2. Addiction Hazards (Tobacco & Alcohol)',
        items: [
          '• Tobacco & Gutkha: Contain highly toxic carcinogens (nicotine, tar, nitrosamines) inducing oral cancer, emphysema, and cardiovascular ischemia.',
          '• Alcohol: Causes hepatic cirrhosis, neurodegenerative cognitive decline, delayed reflexes, and economic devastation of households.'
        ]
      },
      {
        heading: '3. Cyber Threats & Stress Management Protocols',
        items: [
          '• Excessive Smartphone & Gaming Use: Impairs sleep melatonin cycles, fosters social withdrawal, and risks cyber exploitation.',
          '• Stress Alleviation Measures: Physical sports, musical arts, laughter therapy clubs, nature interaction, family communication, and statutory helpline support (Childline 1098 / Tele-MANAS).'
        ]
      }
    ]
  },
  // Page 10
  {
    title: 'UNIT VII: DISASTER MANAGEMENT PROTOCOLS',
    subtitle: 'Disaster Classification, Mitigation Lifecycle & First Aid Action Principles',
    sections: [
      {
        heading: '1. Disaster Classification',
        items: [
          '• Natural Disasters: Earthquakes, tsunamis, volcanic eruptions, tropical cyclones, cloudburst flash floods, droughts.',
          '• Man-made Disasters: Industrial chemical gas leaks (Bhopal Disaster 1984), nuclear radiation accidents (Chernobyl 1986, Fukushima 2011), war, and terrorism.'
        ]
      },
      {
        heading: '2. Disaster Mitigation Lifecycle',
        items: [
          '• 1. Pre-disaster Preparation: Risk hazard mapping, civil defense training, and disaster mock drills in educational centers.',
          '• 2. Warning Phase: Sirens, radio broadcasts, and mandatory coastal evacuations.',
          '• 3. Emergency Rescue Phase: Search, extraction, medical triage by NDRF (National Disaster Response Force).',
          '• 4. Rehabilitation Phase: Debris clearance, safe potable water, epidemic vaccination, transient shelters.',
          '• 5. Reconstruction Phase: Seismic-resistant architectural construction and economic livelihood revival.'
        ]
      },
      {
        heading: '3. Vital First Aid Action Protocols',
        items: [
          '• ABC Protocol: Airway clearance -> Breathing verification -> Circulation check and chest compressions (CPR).',
          '• Severe Hemorrhage: Apply direct pressure with sterile pad; apply tourniquet proximal to wound if arterial bleeding persists.',
          '• Burn Injuries: Irrigate with clean cool flowing water for at least 15 minutes; do not apply unverified oily ointments.'
        ]
      }
    ]
  },
  // Page 11
  {
    title: 'SOLVED EXEMPLARS 1: OBJECTIVES & FACTUAL RECALL',
    subtitle: 'Model 1-Mark Questions Solved with Board Marking Rubrics | Bloom: Remember',
    sections: [
      {
        heading: 'Factual & Objective Model Questions',
        items: [
          'Q1. Complete the statement: The enzyme responsible for synthesizing messenger RNA from DNA template is ______.',
          'Model Answer: RNA polymerase. (Mark: 1)',
          'Q2. Identify correlation: Connecting link between Reptiles and Mammals : Duck-billed platypus :: Connecting link between Annelida and Arthropoda : ______.',
          'Model Answer: Peripatus. (Mark: 1)',
          'Q3. Which scientist first proposed the concept of "Survival of the Fittest"?',
          'Model Answer: Herbert Spencer coined the phrase, and Charles Darwin adopted it in "Origin of Species" to describe natural selection. (Mark: 1)',
          'Q4. Find the odd one out: Appendix, Wisdom teeth, Eye lens, Coccyx.',
          'Model Answer: Eye lens. Reason: Eye lens is an active, essential functional optical organ, while appendix, wisdom teeth, and coccyx are vestigial organs in humans. (Mark: 1)',
          'Q5. Name the bacteria engineered to biologically decompose maritime petroleum oil spills.',
          'Model Answer: Alcanivorax borkumensis (Hydrocarbonoclastic bacteria). (Mark: 1)',
          'Q6. True or False: "Solar thermal electricity generation directly converts sunlight to DC using semiconductor silicon wafers."',
          'Model Answer: False. Solar photovoltaic (PV) cells directly convert sunlight to DC; solar thermal plants use parabolic reflectors to boil water and drive steam turbines. (Mark: 1)'
        ]
      }
    ]
  },
  // Page 12
  {
    title: 'SOLVED EXEMPLARS 2: SCIENTIFIC REASONS & 2-MARK ANSWERS',
    subtitle: 'Conceptual Justifications with Logical Scientific Cause-and-Effect Sequences',
    sections: [
      {
        heading: 'Scientific Reasoning Model Answers',
        items: [
          'Q1. Give scientific reason: The study of developing embryos provides compelling evidence for organic evolution. (2 Marks)',
          'Model Answer: (1) Comparative embryological examinations reveal that very young embryos of diverse vertebrates (fish, salamanders, tortoises, birds, humans) exhibit strikingly identical morphological characteristics, including pharyngeal gill clefts and rudimentary tail structures.',
          '(2) As developmental gestation proceeds, specialized class distinctions emerge. This initial embryonic homology proves that all vertebrate classes evolved from a common evolutionary ancestor. (Mark: 2)',
          'Q2. Give scientific reason: Microbial enzymes are replacing traditional chemical catalysts in modern industrial chemistry. (2 Marks)',
          'Model Answer: (1) Microbial enzymes operate efficiently at ambient temperature, normal atmospheric pressure, and neutral pH, resulting in immense thermal energy savings compared to chemical processes.',
          '(2) Furthermore, enzymes exhibit absolute substrate specificity, eliminate hazardous heavy-metal pollutants, and produce minimal toxic chemical effluents. (Mark: 2)',
          'Q3. Give scientific reason: The sex of an unborn human infant is determined strictly by the paternal contribution. (2 Marks)',
          'Model Answer: (1) Human females possess homogeneous sex chromosomes (44 + XX) and produce only X-bearing ova.',
          '(2) Human males are heterogametic (44 + XY) producing 50% X-bearing sperms and 50% Y-bearing sperms. Fertilization of an ovum with a Y-sperm yields a male (XY), while fertilization with an X-sperm yields a female (XX). Hence, father’s sperm alone determines gender. (Mark: 2)'
        ]
      }
    ]
  },
  // Page 13
  {
    title: 'SOLVED EXEMPLARS 3: COMPARATIVE DISTINCTIONS & TABLES',
    subtitle: 'Structured Tabular Comparisons for High-Yield Board Marks (2 & 3 Marks)',
    sections: [
      {
        heading: 'Comparison 1: Darwinism vs Lamarckism',
        items: [
          '• Point of Difference: Basis of Evolutionary Change',
          '  Darwinism: Natural selection acts upon existing inherent genetic variations within a population.',
          '  Lamarckism: Morphological changes occur due to deliberate use or disuse of organs during an individual’s lifetime.',
          '• Point of Difference: Heritability of Modifications',
          '  Darwinism: Only germline genetic mutations are transmitted to successive offspring.',
          '  Lamarckism: Somatic acquired characters are claimed to be inherited (a claim scientifically disproven).',
          '• Point of Difference: Published Milestone',
          '  Darwinism: "Origin of Species" (1859). | Lamarckism: "Philosophie Zoologique" (1809).'
        ]
      },
      {
        heading: 'Comparison 2: Solar Photovoltaic vs Conventional Thermal Electricity',
        items: [
          '• Fuel & Energy Source: Solar PV uses boundless solar photon radiation; Thermal uses finite fossil coal.',
          '• Environmental Byproducts: Solar PV has zero greenhouse emissions during operation; Thermal releases CO2, SO2, and fly ash.',
          '• Mechanical Operation: Solar PV has no moving machinery (solid-state semiconductor); Thermal uses high-pressure steam boilers and rotating generators.'
        ]
      }
    ]
  },
  // Page 14
  {
    title: 'SOLVED EXEMPLARS 4: 3-MARK ANALYTICAL QUESTIONS',
    subtitle: 'Bloom: Evaluate & Analyze | Methodical Multi-Point Explanations',
    sections: [
      {
        heading: 'Analytical Questions & Justifications',
        items: [
          'Q1. Read the statement and justify in your own words: "Geographical and reproductive isolation of organisms gradually leads to speciation." (3 Marks)',
          'Model Answer: (1) Speciation is the evolutionary process of new species formation. Each natural species is uniquely adapted to specific geographical habitats, nutritional niches, and reproductive seasons.',
          '(2) When physical geological barriers (e.g., canyon formation, rising sea levels, mountain building) divide a parent population, interbreeding between sub-populations halts entirely (Geographical Isolation).',
          '(3) Over prolonged generations, each isolated sub-population undergoes independent spontaneous mutations and experiences distinct environmental selection forces.',
          '(4) Eventually, anatomical or chromosomal divergences prevent them from successfully interbreeding even if they reunite (Reproductive Isolation). This culmination establishes separate, permanent species. (Mark: 3)',
          'Q2. Explain why conducting disaster management mock drills in educational institutions is of vital importance. (3 Marks)',
          'Model Answer: (1) Mock drills evaluate actual institutional response speed, evacuation efficiency, and operational coordination during simulated fires or earthquakes.',
          '(2) They verify whether emergency fire extinguishers, alarm systems, and exit corridors are clear and fully functional.',
          '(3) They condition pupils and faculty to eliminate panic, adopt the Drop-Cover-Hold safety posture, and practice essential rescue and bandage skills. (Mark: 3)'
        ]
      }
    ]
  },
  // Page 15
  {
    title: 'SOLVED EXEMPLARS 5: 5-MARK LONG ANSWER MASTERY',
    subtitle: 'Comprehensive Essays, Multi-Step Biological Mechanisms & Flowcharts',
    sections: [
      {
        heading: 'Q. Detail the complete molecular pathway of Protein Synthesis (Central Dogma) including Transcription, Translation, and Translocation. (5 Marks)',
        items: [
          'Model Answer Architecture:',
          '1. Conceptual Definition: Proteins dictate cellular biochemical processes. The synthesis of functional proteins directed by DNA through intermediary RNA molecules is termed Central Dogma.',
          '2. Transcription: Inside the nucleus, RNA polymerase attaches to the DNA promoter. The complementary single strand of mRNA is formed against the template strand. Adenine pairs with Uracil (instead of Thymine), and Cytosine pairs with Guanine. After synthesis, mRNA translocates through nuclear pores into the cytoplasm. (Mark: 1.5)',
          '3. Translation: The mRNA binds to a ribosome. Each three successive nitrogenous bases represent a Triplet Codon specifying an amino acid. Specific transfer RNA (tRNA) possessing an Anticodon complementary to the mRNA codon delivers the corresponding amino acid. (Mark: 1.5)',
          '4. Translocation & Peptide Bonding: The ribosome moves progressively along the mRNA strand by the distance of exactly one codon. Ribosomal RNA (rRNA) catalytically forms peptide bonds between consecutive amino acids, elongating the polypeptide chain until a stop codon (UAA, UAG, UGA) is reached. The protein then folds into its active tertiary conformation. (Mark: 2)'
        ]
      },
      {
        heading: 'Q. Describe Flood Disaster Management across Pre-Disaster, Emergency, and Rehabilitation Phases. (5 Marks)',
        items: [
          'Model Answer Highlights: Pre-disaster involves flood-plain zoning, river dredging, and meteorological radar alerts. Emergency involves NDRF motorized boat rescue, medical triage, and food drop operations. Rehabilitation involves water chlorination against cholera epidemics, structural repairs of bridges, and economic compensation for farmers.'
        ]
      }
    ]
  },
  // Page 16
  {
    title: 'HIGH-YIELD REVISION MATRIX & EXAM STRATEGY',
    subtitle: 'Final Board Examination Readiness Checklist & Golden Rules for 40/40',
    sections: [
      {
        heading: 'Science 2 Golden Examination Rules',
        items: [
          '1. Diagram Rule: In Biology (Human Reproductive System, Central Dogma, Mitosis), draw neat pencil diagrams with all labels on the right-hand side using a ruler.',
          '2. Keywords Rule: Bold or underline biological terms: Transcription, Uracil, Anticodon, Homologous, Vestigial, NDRF, Photovoltaic.',
          '3. Time Allocation Strategy (120 Minutes Total):',
          '   • Q.1 (A & B) [10 Marks]: 20 Minutes (Read carefully, avoid guessing without elimination).',
          '   • Q.2 (A & B) [10 Marks]: 25 Minutes (Bullet points with scientific cause and effect).',
          '   • Q.3 [15 Marks]: 45 Minutes (Provide 3 distinct substantial analytical points for every 3-mark question).',
          '   • Q.4 [5 Marks]: 20 Minutes (Structured long answer with headings and diagrams).',
          '   • Final Review: 10 Minutes (Check question numbers, diagrams, and units).'
        ]
      },
      {
        heading: 'Mastery Checklist across 22 Science 2 Dataset Topics',
        paragraphs: [
          'Ensure complete mastery of: heredity, human evolution, theories of evolution, evidences of evolution, protein synthesis, dna genes and chromosomes, mutation, types of disasters, disaster management cycle, first aid, disaster signs, human reproductive system, reproductive health, biodiversity, solar energy, addiction, interpersonal relationships, social media, stress management, and superstitions.'
        ]
      }
    ]
  }
];

async function main() {
  console.log('Generating Science 2 Official PDFs...');

  // 1. Board Model Examination & Question Bank (5 Pages)
  await createMultiPagePdf(
    'Science 2: Board Model Examination & Question Bank',
    'SCI2-EXAM-2026',
    doc1Pages,
    path.join(outputDir, 'Science2_Board_Model_Examination_Question_Bank.pdf')
  );

  // 2. State Board Curriculum Syllabus & Chapter Learning Units (8 Pages)
  await createMultiPagePdf(
    'Science 2: State Board Curriculum Syllabus & Chapter Learning Units',
    'SCI2-SYLLABUS-2026',
    doc2Pages,
    path.join(outputDir, 'Science2_Curriculum_Syllabus_Chapter_Units.pdf')
  );

  // 3. Master Study Guide & Solved Exemplars (16 Pages)
  await createMultiPagePdf(
    'Science 2: Master Study Guide & Solved Exemplars',
    'SCI2-NOTES-2026',
    doc3Pages,
    path.join(outputDir, 'Science2_Master_Study_Guide_Solved_Exemplars.pdf')
  );

  console.log('All 3 PDFs generated successfully in public/pdfs/');
}

main().catch(console.error);
