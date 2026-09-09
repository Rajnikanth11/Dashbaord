// Static content data for the drill-down flow: Schools -> Classes -> Subjects -> Topics.
// In a real setup this would come from an API (fetch/GraphQL) instead of being inlined.

const SIMS = [
  { slug: "acid-base-solutions", title: "Acid-Base Solutions", subjects: ["chemistry"] },
  { slug: "area-builder", title: "Area Builder", subjects: ["math-and-statistics"] },
  { slug: "atomic-interactions", title: "Atomic Interactions", subjects: ["physics", "chemistry"] },
  { slug: "balancing-chemical-equations", title: "Balancing Chemical Equations", subjects: ["chemistry"] },
  { slug: "balloons-and-static-electricity", title: "Balloons and Static Electricity", subjects: ["physics", "chemistry"] },
  { slug: "bending-light", title: "Bending Light", subjects: ["physics"] },
  { slug: "build-a-fraction", title: "Build a Fraction", subjects: ["math-and-statistics"] },
  { slug: "build-a-molecule", title: "Build a Molecule", subjects: ["chemistry"] },
  { slug: "build-an-atom", title: "Build an Atom", subjects: ["physics", "chemistry"] },
  { slug: "buoyancy", title: "Buoyancy", subjects: ["physics"] },
  { slug: "circuit-construction-kit-dc", title: "Circuit Construction Kit: DC", subjects: ["physics"] },
  { slug: "concentration", title: "Concentration", subjects: ["chemistry"] },
  { slug: "density", title: "Density", subjects: ["physics", "chemistry", "biology"] },
  { slug: "energy-forms-and-changes", title: "Energy Forms and Changes", subjects: ["physics", "chemistry"] },
  { slug: "energy-skate-park", title: "Energy Skate Park", subjects: ["physics"] },
  { slug: "equality-explorer", title: "Equality Explorer", subjects: ["math-and-statistics"] },
  { slug: "forces-and-motion-basics", title: "Forces and Motion: Basics", subjects: ["physics"] },
  { slug: "fraction-matcher", title: "Fraction Matcher", subjects: ["math-and-statistics"] },
  { slug: "friction", title: "Friction", subjects: ["physics"] },
  { slug: "function-builder", title: "Function Builder", subjects: ["math-and-statistics"] },
  { slug: "gene-expression-essentials", title: "Gene Expression Essentials", subjects: ["biology"] },
  { slug: "graphing-lines", title: "Graphing Lines", subjects: ["math-and-statistics"] },
  { slug: "graphing-quadratics", title: "Graphing Quadratics", subjects: ["math-and-statistics"] },
  { slug: "gravity-and-orbits", title: "Gravity and Orbits", subjects: ["physics", "earth-and-space"] },
  { slug: "greenhouse-effect", title: "Greenhouse Effect", subjects: ["physics"] },
  { slug: "membrane-transport", title: "Membrane Transport", subjects: ["chemistry", "biology"] },
  { slug: "molarity", title: "Molarity", subjects: ["chemistry"] },
  { slug: "molecule-shapes", title: "Molecule Shapes", subjects: ["chemistry"] },
  { slug: "natural-selection", title: "Natural Selection", subjects: ["biology"] },
  { slug: "neuron", title: "Neuron", subjects: ["biology"] },
  { slug: "ohms-law", title: "Ohm's Law", subjects: ["physics", "math-and-statistics"] },
  { slug: "pendulum-lab", title: "Pendulum Lab", subjects: ["physics", "math-and-statistics"] },
  { slug: "ph-scale", title: "pH Scale", subjects: ["chemistry", "biology"] },
  { slug: "projectile-motion", title: "Projectile Motion", subjects: ["physics", "math-and-statistics"] },
  { slug: "ratio-and-proportion", title: "Ratio and Proportion", subjects: ["math-and-statistics"] },
  { slug: "reactants-products-and-leftovers", title: "Reactants, Products and Leftovers", subjects: ["chemistry"] },
  { slug: "states-of-matter", title: "States of Matter", subjects: ["physics", "chemistry"] },
  { slug: "wave-interference", title: "Wave Interference", subjects: ["physics", "earth-and-space"] },
  { slug: "waves-intro", title: "Waves Intro", subjects: ["physics", "earth-and-space"] },
];

// Simulations bundled locally as self-contained PhET HTML builds, served
// from public/sims/. Only slugs listed here get a working "Open simulation"
// button in the topic modal — everything else in SIMS is metadata-only.
const SIM_FILES = {
  "acid-base-solutions": "sims/acid-base-solutions.html",
  "bending-light": "sims/bending-light.html",
  "greenhouse-effect": "sims/greenhouse-effect.html",
  "pendulum-lab": "sims/pendulum-lab.html",
  "ph-scale": "sims/ph-scale.html",
};

const SCHOOL_DATA = [
  {
    name: "Green Valley Public School",
    location: "Bengaluru",
    classes: [
      { name: "Class 6", subjects: ["Mathematics", "Science", "Physics"] },
      { name: "Class 7", subjects: ["Mathematics", "Science", "Chemistry"] },
      { name: "Class 8", subjects: ["Mathematics", "Physics", "Chemistry"] },
    ],
  },
  {
    name: "Sunrise International School",
    location: "Hyderabad",
    classes: [
      { name: "Class 8", subjects: ["Mathematics", "Physics", "Biology"] },
      { name: "Class 9", subjects: ["Mathematics", "Physics", "Chemistry"] },
      { name: "Class 10", subjects: ["Mathematics", "Physics", "Chemistry", "Biology"] },
    ],
  },
  {
    name: "Vidya Mandir School",
    location: "Mysuru",
    classes: [
      { name: "Class 9", subjects: ["Mathematics", "Physics", "Chemistry"] },
      { name: "Class 10", subjects: ["Mathematics", "Physics", "Chemistry", "Biology"] },
    ],
  },
  {
    name: "National Scholars Academy",
    location: "Chennai",
    classes: [
      { name: "Class 11", subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
      { name: "Class 12", subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
    ],
  },
];

const SUBJECT_MAP = {
  Mathematics: "math-and-statistics",
  Physics: "physics",
  Chemistry: "chemistry",
  Biology: "biology",
  Science: "physics",
};

const TOPIC_OVERRIDES = {
  Physics: ["Forces & Motion", "Energy", "Waves", "Electricity & Circuits", "Light", "Gravity"],
  Chemistry: ["Atoms & Molecules", "States of Matter", "Chemical Reactions", "Acids & Bases", "Molarity"],
  Mathematics: ["Fractions", "Algebra", "Geometry", "Graphs", "Probability", "Ratios & Proportion"],
  Biology: ["Cells", "Natural Selection", "Genetics", "Membrane Transport", "Human Body"],
  Science: ["Matter", "Energy", "Forces", "Light", "Electricity"],
};

const BASE_PROGRESS = [35, 62, 48, 78, 55, 30, 70, 44];
