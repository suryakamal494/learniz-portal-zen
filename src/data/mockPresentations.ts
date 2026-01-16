export interface PPTSlide {
  id: string;
  type: 'title' | 'intro' | 'content' | 'diagram' | 'summary' | 'qa';
  title: string;
  content?: string[];
  imageUrl?: string;
  notes?: string;
}

export interface GeneratedPPT {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  topic: string;
  createdAt: string;
  slides: PPTSlide[];
}

export const mockGeneratedPPT: GeneratedPPT = {
  id: "ppt-001",
  title: "Newton's Laws of Motion",
  subject: "Physics",
  chapter: "Mechanics",
  topic: "Laws of Motion",
  createdAt: new Date().toISOString(),
  slides: [
    {
      id: "slide-1",
      type: "title",
      title: "Newton's Laws of Motion",
      content: [
        "A comprehensive exploration of the fundamental principles governing motion",
        "Physics - Mechanics",
        "Prepared for Grade 11 Students"
      ],
      notes: "Welcome slide - introduce the topic and its importance in physics"
    },
    {
      id: "slide-2",
      type: "intro",
      title: "Introduction to Motion",
      content: [
        "Motion is the change in position of an object over time",
        "Sir Isaac Newton formulated three fundamental laws in 1687",
        "These laws form the foundation of classical mechanics",
        "Understanding these laws helps explain everyday phenomena"
      ],
      notes: "Set the historical context and importance"
    },
    {
      id: "slide-3",
      type: "content",
      title: "First Law: Law of Inertia",
      content: [
        "An object at rest stays at rest unless acted upon by an external force",
        "An object in motion continues in motion with the same speed and direction",
        "Inertia is the resistance to change in motion",
        "Examples: Seatbelts, tablecloth trick, spacecraft in space"
      ],
      imageUrl: "/placeholder.svg",
      notes: "Emphasize real-world examples students can relate to"
    },
    {
      id: "slide-4",
      type: "diagram",
      title: "Understanding Inertia",
      content: [
        "Mass is a measure of inertia",
        "Greater mass = Greater inertia",
        "A truck has more inertia than a bicycle"
      ],
      imageUrl: "/placeholder.svg",
      notes: "Visual demonstration of inertia concepts"
    },
    {
      id: "slide-5",
      type: "content",
      title: "Second Law: F = ma",
      content: [
        "Force equals mass times acceleration (F = ma)",
        "Acceleration is directly proportional to applied force",
        "Acceleration is inversely proportional to mass",
        "Net force determines the change in motion"
      ],
      notes: "Key mathematical relationship to remember"
    },
    {
      id: "slide-6",
      type: "diagram",
      title: "Force and Acceleration Relationship",
      content: [
        "Doubling the force doubles the acceleration",
        "Doubling the mass halves the acceleration",
        "Vector nature of force and acceleration"
      ],
      imageUrl: "/placeholder.svg",
      notes: "Graphical representation of F=ma"
    },
    {
      id: "slide-7",
      type: "content",
      title: "Third Law: Action and Reaction",
      content: [
        "For every action, there is an equal and opposite reaction",
        "Forces always occur in pairs",
        "Action and reaction forces act on different objects",
        "Examples: Rocket propulsion, walking, swimming"
      ],
      notes: "Common misconceptions to address"
    },
    {
      id: "slide-8",
      type: "summary",
      title: "Key Takeaways",
      content: [
        "First Law: Objects resist changes in motion (Inertia)",
        "Second Law: F = ma (Force-Mass-Acceleration relationship)",
        "Third Law: Action = Reaction (Force pairs)",
        "These laws apply to all objects in classical mechanics"
      ],
      notes: "Summarize the three laws concisely"
    },
    {
      id: "slide-9",
      type: "qa",
      title: "Questions & Discussion",
      content: [
        "What questions do you have about Newton's Laws?",
        "Can you think of other real-world examples?",
        "How do these laws apply to sports and daily activities?"
      ],
      notes: "Encourage student participation"
    }
  ]
};

// Mock subjects, chapters, and topics for dropdowns
export const mockPPTSubjects = [
  { id: "physics", name: "Physics" },
  { id: "chemistry", name: "Chemistry" },
  { id: "mathematics", name: "Mathematics" },
  { id: "biology", name: "Biology" }
];

export const mockPPTChapters: Record<string, { id: string; name: string }[]> = {
  physics: [
    { id: "mechanics", name: "Mechanics" },
    { id: "thermodynamics", name: "Thermodynamics" },
    { id: "waves", name: "Waves and Optics" },
    { id: "electricity", name: "Electricity and Magnetism" }
  ],
  chemistry: [
    { id: "atomic", name: "Atomic Structure" },
    { id: "periodic", name: "Periodic Table" },
    { id: "bonding", name: "Chemical Bonding" },
    { id: "reactions", name: "Chemical Reactions" }
  ],
  mathematics: [
    { id: "algebra", name: "Algebra" },
    { id: "calculus", name: "Calculus" },
    { id: "geometry", name: "Geometry" },
    { id: "statistics", name: "Statistics" }
  ],
  biology: [
    { id: "cellbio", name: "Cell Biology" },
    { id: "genetics", name: "Genetics" },
    { id: "ecology", name: "Ecology" },
    { id: "anatomy", name: "Human Anatomy" }
  ]
};

export const mockPPTTopics: Record<string, { id: string; name: string }[]> = {
  mechanics: [
    { id: "motion", name: "Laws of Motion" },
    { id: "kinematics", name: "Kinematics" },
    { id: "energy", name: "Work and Energy" },
    { id: "momentum", name: "Momentum" }
  ],
  thermodynamics: [
    { id: "heat", name: "Heat Transfer" },
    { id: "entropy", name: "Entropy" },
    { id: "laws", name: "Laws of Thermodynamics" }
  ],
  waves: [
    { id: "sound", name: "Sound Waves" },
    { id: "light", name: "Light and Optics" },
    { id: "electromagnetic", name: "Electromagnetic Waves" }
  ],
  electricity: [
    { id: "current", name: "Electric Current" },
    { id: "circuits", name: "Circuits" },
    { id: "magnetism", name: "Magnetism" }
  ],
  atomic: [
    { id: "models", name: "Atomic Models" },
    { id: "electrons", name: "Electron Configuration" }
  ],
  periodic: [
    { id: "trends", name: "Periodic Trends" },
    { id: "groups", name: "Groups and Periods" }
  ],
  bonding: [
    { id: "ionic", name: "Ionic Bonding" },
    { id: "covalent", name: "Covalent Bonding" }
  ],
  reactions: [
    { id: "types", name: "Types of Reactions" },
    { id: "balancing", name: "Balancing Equations" }
  ],
  algebra: [
    { id: "equations", name: "Linear Equations" },
    { id: "quadratic", name: "Quadratic Equations" }
  ],
  calculus: [
    { id: "limits", name: "Limits" },
    { id: "derivatives", name: "Derivatives" },
    { id: "integrals", name: "Integrals" }
  ],
  geometry: [
    { id: "triangles", name: "Triangles" },
    { id: "circles", name: "Circles" }
  ],
  statistics: [
    { id: "probability", name: "Probability" },
    { id: "distributions", name: "Distributions" }
  ],
  cellbio: [
    { id: "structure", name: "Cell Structure" },
    { id: "division", name: "Cell Division" }
  ],
  genetics: [
    { id: "dna", name: "DNA Structure" },
    { id: "heredity", name: "Heredity" }
  ],
  ecology: [
    { id: "ecosystems", name: "Ecosystems" },
    { id: "biodiversity", name: "Biodiversity" }
  ],
  anatomy: [
    { id: "skeletal", name: "Skeletal System" },
    { id: "circulatory", name: "Circulatory System" }
  ]
};
