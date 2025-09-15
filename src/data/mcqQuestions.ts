export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-3)
  explanation?: string;
}

export const acidBaseMCQQuestions: MCQQuestion[] = [
  {
    id: 1,
    question: "Which of the following is a strong acid?",
    options: ["Acetic acid", "Hydrochloric acid", "Citric acid", "Carbonic acid"],
    correctAnswer: 1,
    explanation: "Hydrochloric acid (HCl) is a strong acid that completely dissociates in water."
  },
  {
    id: 2,
    question: "What is the pH of a neutral solution?",
    options: ["0", "7", "14", "10"],
    correctAnswer: 1,
    explanation: "A neutral solution has a pH of 7, which is neither acidic nor basic."
  },
  {
    id: 3,
    question: "Which indicator turns red in acidic solutions?",
    options: ["Phenolphthalein", "Methyl orange", "Litmus", "Universal indicator"],
    correctAnswer: 2,
    explanation: "Litmus turns red in acidic solutions and blue in basic solutions."
  },
  {
    id: 4,
    question: "What happens when an acid reacts with a base?",
    options: ["Formation of salt and water", "Formation of gas", "Formation of precipitate", "No reaction"],
    correctAnswer: 0,
    explanation: "Acid-base neutralization reactions produce salt and water."
  },
  {
    id: 5,
    question: "Which of the following is a weak base?",
    options: ["Sodium hydroxide", "Ammonium hydroxide", "Potassium hydroxide", "Calcium hydroxide"],
    correctAnswer: 1,
    explanation: "Ammonium hydroxide (NH4OH) is a weak base that partially dissociates in water."
  },
  {
    id: 6,
    question: "What is the chemical formula for sulfuric acid?",
    options: ["HCl", "H2SO4", "HNO3", "H3PO4"],
    correctAnswer: 1,
    explanation: "Sulfuric acid has the chemical formula H2SO4."
  },
  {
    id: 7,
    question: "Which pH value indicates a strong base?",
    options: ["pH 1", "pH 7", "pH 10", "pH 14"],
    correctAnswer: 3,
    explanation: "pH 14 indicates a very strong base, while pH 10 indicates a weak base."
  },
  {
    id: 8,
    question: "What is the conjugate base of HCl?",
    options: ["H2O", "Cl-", "H3O+", "OH-"],
    correctAnswer: 1,
    explanation: "When HCl donates a proton, it becomes Cl-, which is its conjugate base."
  },
  {
    id: 9,
    question: "Which acid is found in vinegar?",
    options: ["Citric acid", "Acetic acid", "Lactic acid", "Tartaric acid"],
    correctAnswer: 1,
    explanation: "Vinegar contains acetic acid (CH3COOH)."
  },
  {
    id: 10,
    question: "What is the pH range for acidic solutions?",
    options: ["0-7", "7-14", "0-14", "1-6"],
    correctAnswer: 0,
    explanation: "Acidic solutions have pH values between 0 and 7."
  },
  {
    id: 11,
    question: "Which of the following is an amphoteric substance?",
    options: ["HCl", "NaOH", "H2O", "NaCl"],
    correctAnswer: 2,
    explanation: "Water (H2O) is amphoteric because it can act as both an acid and a base."
  },
  {
    id: 12,
    question: "What color does phenolphthalein turn in basic solutions?",
    options: ["Red", "Blue", "Pink", "Yellow"],
    correctAnswer: 2,
    explanation: "Phenolphthalein turns pink in basic solutions and is colorless in acidic solutions."
  },
  {
    id: 13,
    question: "Which acid is present in gastric juice?",
    options: ["Sulfuric acid", "Nitric acid", "Hydrochloric acid", "Phosphoric acid"],
    correctAnswer: 2,
    explanation: "Gastric juice contains hydrochloric acid (HCl) which helps in digestion."
  },
  {
    id: 14,
    question: "What is the conjugate acid of NH3?",
    options: ["NH4+", "NH2-", "N2H4", "N2"],
    correctAnswer: 0,
    explanation: "When NH3 accepts a proton, it becomes NH4+, which is its conjugate acid."
  },
  {
    id: 15,
    question: "Which of the following is a salt?",
    options: ["HCl", "NaOH", "NaCl", "H2SO4"],
    correctAnswer: 2,
    explanation: "NaCl (sodium chloride) is a salt formed from the reaction of HCl and NaOH."
  },
  {
    id: 16,
    question: "What is the chemical formula for nitric acid?",
    options: ["HCl", "H2SO4", "HNO3", "H3PO4"],
    correctAnswer: 2,
    explanation: "Nitric acid has the chemical formula HNO3."
  },
  {
    id: 17,
    question: "Which of the following is a strong base?",
    options: ["Ammonium hydroxide", "Sodium hydroxide", "Calcium hydroxide", "Magnesium hydroxide"],
    correctAnswer: 1,
    explanation: "Sodium hydroxide (NaOH) is a strong base that completely dissociates in water."
  },
  {
    id: 18,
    question: "What is the pH of a solution with [H+] = 1 × 10^-3 M?",
    options: ["1", "3", "7", "11"],
    correctAnswer: 1,
    explanation: "pH = -log[H+] = -log(1 × 10^-3) = 3."
  },
  {
    id: 19,
    question: "Which acid is present in lemons?",
    options: ["Acetic acid", "Citric acid", "Lactic acid", "Tartaric acid"],
    correctAnswer: 1,
    explanation: "Lemons contain citric acid which gives them their sour taste."
  },
  {
    id: 20,
    question: "What is the conjugate base of H2O?",
    options: ["H3O+", "OH-", "H2O2", "O2-"],
    correctAnswer: 1,
    explanation: "When H2O donates a proton, it becomes OH-, which is its conjugate base."
  },
  {
    id: 21,
    question: "Which indicator is colorless in acidic solutions and pink in basic solutions?",
    options: ["Litmus", "Methyl orange", "Phenolphthalein", "Universal indicator"],
    correctAnswer: 2,
    explanation: "Phenolphthalein is colorless in acidic solutions and pink in basic solutions."
  },
  {
    id: 22,
    question: "What is the chemical formula for phosphoric acid?",
    options: ["H3PO3", "H3PO4", "H2PO4", "HPO4"],
    correctAnswer: 1,
    explanation: "Phosphoric acid has the chemical formula H3PO4."
  },
  {
    id: 23,
    question: "Which of the following is a weak acid?",
    options: ["Hydrochloric acid", "Sulfuric acid", "Acetic acid", "Nitric acid"],
    correctAnswer: 2,
    explanation: "Acetic acid (CH3COOH) is a weak acid that partially dissociates in water."
  },
  {
    id: 24,
    question: "What is the pH of a solution with [OH-] = 1 × 10^-5 M?",
    options: ["5", "7", "9", "14"],
    correctAnswer: 2,
    explanation: "pOH = -log[OH-] = 5, so pH = 14 - pOH = 14 - 5 = 9."
  },
  {
    id: 25,
    question: "Which acid is present in ant stings?",
    options: ["Formic acid", "Acetic acid", "Citric acid", "Lactic acid"],
    correctAnswer: 0,
    explanation: "Ant stings contain formic acid (methanoic acid) which causes the burning sensation."
  },
  {
    id: 26,
    question: "What is the conjugate acid of OH-?",
    options: ["H2O", "H3O+", "O2-", "H2O2"],
    correctAnswer: 0,
    explanation: "When OH- accepts a proton, it becomes H2O, which is its conjugate acid."
  },
  {
    id: 27,
    question: "Which indicator turns yellow in acidic solutions and red in basic solutions?",
    options: ["Litmus", "Methyl orange", "Phenolphthalein", "Universal indicator"],
    correctAnswer: 1,
    explanation: "Methyl orange turns yellow in acidic solutions and red in basic solutions."
  },
  {
    id: 28,
    question: "What is the chemical formula for carbonic acid?",
    options: ["H2CO3", "HCO3-", "CO3-2", "H2CO2"],
    correctAnswer: 0,
    explanation: "Carbonic acid has the chemical formula H2CO3."
  },
  {
    id: 29,
    question: "Which of the following is a strong acid?",
    options: ["Acetic acid", "Carbonic acid", "Hydrochloric acid", "Citric acid"],
    correctAnswer: 2,
    explanation: "Hydrochloric acid (HCl) is a strong acid that completely dissociates in water."
  },
  {
    id: 30,
    question: "What color does litmus turn in basic solutions?",
    options: ["Red", "Blue", "Green", "Yellow"],
    correctAnswer: 1,
    explanation: "Litmus turns blue in basic solutions and red in acidic solutions."
  },
  {
    id: 31,
    question: "Which of the following is an example of a weak base?",
    options: ["Sodium hydroxide (NaOH)", "Potassium hydroxide (KOH)", "Calcium hydroxide (Ca(OH)2)", "Ammonium hydroxide (NH4OH)"],
    correctAnswer: 3,
    explanation: "Ammonium hydroxide (NH4OH) is a weak base that partially dissociates in water."
  },
  {
    id: 32,
    question: "What is the main component of a bee sting that causes pain and irritation?",
    options: ["Citric acid", "Lactic acid", "Methanoic acid", "Acetic acid"],
    correctAnswer: 2,
    explanation: "Bee stings contain methanoic acid (formic acid) which causes pain and irritation."
  },
  {
    id: 33,
    question: "In the chlor-alkali process, chlorine gas is produced at the:",
    options: ["Anode", "Cathode", "In the solution", "It is not produced"],
    correctAnswer: 0,
    explanation: "In the chlor-alkali process, chlorine gas is produced at the anode."
  },
  {
    id: 34,
    question: "A solution with a pH of 2 has a ______ H+ ion concentration than a solution with a pH of 5.",
    options: ["Lower", "Higher", "Equal", "It cannot be determined"],
    correctAnswer: 1,
    explanation: "Lower pH means higher H+ ion concentration, so pH 2 has higher H+ concentration than pH 5."
  },
  {
    id: 35,
    question: "Which acid is present in tomatoes?",
    options: ["Citric Acid", "Acetic Acid", "Oxalic Acid", "Tartaric Acid"],
    correctAnswer: 2,
    explanation: "Tomatoes contain oxalic acid which gives them their characteristic taste."
  },
  {
    id: 36,
    question: "The chemical reaction 2NaOH + Zn → ?",
    options: ["Na2O + Zn(OH)2", "Na2ZnO2 + H2", "2NaH + ZnO2", "No reaction occurs"],
    correctAnswer: 1,
    explanation: "The reaction produces sodium zincate (Na2ZnO2) and hydrogen gas (H2)."
  },
  {
    id: 37,
    question: "The appearance of a blue-green color in the solution when copper oxide reacts with hydrochloric acid is due to the formation of:",
    options: ["Cu(OH)2", "CuO", "CuCl2", "H2O"],
    correctAnswer: 2,
    explanation: "The blue-green color is due to the formation of copper chloride (CuCl2)."
  },
  {
    id: 38,
    question: "What is the correct procedure for diluting an acid?",
    options: ["Add water to the acid", "Add acid to the water", "Mix them in any order", "Heat the acid before adding water"],
    correctAnswer: 1,
    explanation: "Always add acid to water, never water to acid, to prevent splashing and injury."
  },
  {
    id: 39,
    question: "Tooth decay can be prevented by using toothpaste which is generally:",
    options: ["Acidic", "Basic", "Neutral", "Salty"],
    correctAnswer: 1,
    explanation: "Toothpaste is generally basic to neutralize the acids produced by bacteria."
  },
  {
    id: 40,
    question: "Salts formed from a strong base and a weak acid will be:",
    options: ["Acidic (pH < 7)", "Basic (pH > 7)", "Neutral (pH = 7)", "It depends on the salt"],
    correctAnswer: 1,
    explanation: "Salts from strong base and weak acid are basic because the weak acid's conjugate base hydrolyzes."
  },
  {
    id: 41,
    question: "Which of the following is NOT a product of the chlor-alkali process?",
    options: ["Sodium hydroxide (NaOH)", "Chlorine (Cl2)", "Hydrogen (H2)", "Carbon Dioxide (CO2)"],
    correctAnswer: 3,
    explanation: "Carbon dioxide is not a product of the chlor-alkali process. The products are NaOH, Cl2, and H2."
  },
  {
    id: 42,
    question: "Which chemical is used in the manufacture of borax?",
    options: ["Baking Soda", "Plaster of Paris", "Washing Soda", "Bleaching Powder"],
    correctAnswer: 2,
    explanation: "Washing soda (Na2CO3·10H2O) is used in the manufacture of borax."
  },
  {
    id: 43,
    question: "The formula for hydrated copper sulphate is:",
    options: ["CuSO4", "CuSO4·2H2O", "CuSO4·5H2O", "CuSO4·7H2O"],
    correctAnswer: 2,
    explanation: "Hydrated copper sulphate has the formula CuSO4·5H2O (blue vitriol)."
  },
  {
    id: 44,
    question: "Olfactory indicators work by changing their:",
    options: ["Color", "Taste", "Odour", "State"],
    correctAnswer: 2,
    explanation: "Olfactory indicators work by changing their odour in acidic and basic solutions."
  },
  {
    id: 45,
    question: "What happens when excess carbon dioxide (CO2) is passed through lime water (Ca(OH)2)?",
    options: ["The solution remains milky", "The milkiness disappears", "The solution turns blue", "The solution evaporates"],
    correctAnswer: 1,
    explanation: "When excess CO2 is passed, the milkiness disappears due to formation of soluble calcium bicarbonate."
  },
  {
    id: 46,
    question: "Which acid is present in sour milk or curd?",
    options: ["Citric Acid", "Lactic Acid", "Acetic Acid", "Oxalic Acid"],
    correctAnswer: 1,
    explanation: "Sour milk or curd contains lactic acid produced by bacterial fermentation."
  },
  {
    id: 47,
    question: "A solution turns red litmus blue. Its pH is likely to be:",
    options: ["1", "4", "5", "10"],
    correctAnswer: 3,
    explanation: "If red litmus turns blue, the solution is basic, so pH is likely to be 10."
  },
  {
    id: 48,
    question: "In the preparation of baking soda, the raw materials used are NaCl, H2O, CO2 and ______?",
    options: ["N2", "O2", "NH3", "H2"],
    correctAnswer: 2,
    explanation: "Ammonia (NH3) is used in the Solvay process to prepare baking soda."
  },
  {
    id: 49,
    question: "The pH of our body functions within a narrow range of:",
    options: ["5.0 to 5.8", "6.0 to 6.8", "7.0 to 7.8", "8.0 to 8.8"],
    correctAnswer: 2,
    explanation: "The pH of our body functions within a narrow range of 7.0 to 7.8."
  },
  {
    id: 50,
    question: "The chemical formula for Sodium Zincate is:",
    options: ["NaZnO2", "Na2ZnO2", "NaZn2O2", "Na2ZnO"],
    correctAnswer: 1,
    explanation: "Sodium zincate has the chemical formula Na2ZnO2."
  }
];
