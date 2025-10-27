// Available templates (12 total)
export const availableTemplates = [
  { id: "t1", name: "Employee Onboarding" },
  { id: "t2", name: "Benefits Enrollment" },
  { id: "t3", name: "IT Setup Form" },
  { id: "t4", name: "Compliance Training" },
  { id: "t5", name: "Emergency Contact Form" },
  { id: "t6", name: "Direct Deposit Setup" },
  { id: "t7", name: "Tax Withholding Form" },
  { id: "t8", name: "Background Check Authorization" },
  { id: "t9", name: "Employee Handbook Acknowledgment" },
  { id: "t10", name: "Equipment Request Form" },
  { id: "t11", name: "Parking Pass Application" },
  { id: "t12", name: "Security Clearance Form" },
];

// Generate media uploads (40+ files)
const generateMediaFiles = (userId: string, count: number) => {
  const fileTypes = [
    { ext: "jpg", type: "image/jpeg" },
    { ext: "png", type: "image/png" },
    { ext: "pdf", type: "application/pdf" },
    { ext: "docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  ];

  const fileNames = [
    "passport",
    "drivers_license",
    "resume",
    "cover_letter",
    "diploma",
    "transcript",
    "reference_letter",
    "background_check",
    "w4_form",
    "i9_form",
    "direct_deposit",
    "emergency_contact",
    "medical_form",
    "insurance_card",
    "vaccination_record",
    "id_photo",
    "proof_of_address",
    "bank_statement",
    "contract",
    "offer_letter",
    "benefits_selection",
    "tax_form",
    "certification",
    "license",
    "portfolio",
    "project_sample",
    "writing_sample",
    "code_sample",
    "presentation",
    "work_sample",
  ];

  return Array.from({ length: count }, (_, i) => {
    const fileName = fileNames[i % fileNames.length];
    const fileType = fileTypes[i % fileTypes.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const uploadDate = new Date();
    uploadDate.setDate(uploadDate.getDate() - daysAgo);

    return {
      id: `m${userId}-${i + 1}`,
      name: `${fileName}_${i + 1}.${fileType.ext}`,
      type: fileType.type,
      uploadedAt: uploadDate.toISOString(),
    };
  });
};

// Generate 12 submissions matching all 12 templates
const generateSubmissions = (userId: string) => {
  return availableTemplates.map((template, index) => {
    const isCompleted = Math.random() > 0.3; // 70% completion rate
    const progress = isCompleted ? 100 : Math.floor(Math.random() * 90) + 10;
    const totalQuestions = 15 + Math.floor(Math.random() * 20);
    const answeredQuestions = Math.floor((totalQuestions * progress) / 100);

    let completedAt = null;
    if (isCompleted) {
      const daysAgo = Math.floor(Math.random() * 20);
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() - daysAgo);
      completedAt = completionDate.toISOString();
    }

    return {
      id: `s${userId}-${index + 1}`,
      template: template.name,
      progress,
      completedAt,
      totalQuestions,
      answeredQuestions,
    };
  });
};

// Mock customer data
export const customersData = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "customer",
    createdAt: "2024-10-15T08:30:00Z",
    assignedTemplates: availableTemplates.slice(0, 12),
    onboardingProgress: 85,
    submissions: generateSubmissions("1"),
    media: generateMediaFiles("1", 45),
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@example.com",
    role: "customer",
    createdAt: "2024-10-18T10:15:00Z",
    assignedTemplates: availableTemplates.slice(0, 10),
    onboardingProgress: 60,
    submissions: generateSubmissions("2").slice(0, 10),
    media: generateMediaFiles("2", 42),
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    role: "customer",
    createdAt: "2024-10-16T14:20:00Z",
    assignedTemplates: availableTemplates.slice(0, 12),
    onboardingProgress: 92,
    submissions: generateSubmissions("3"),
    media: generateMediaFiles("3", 48),
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@example.com",
    role: "customer",
    createdAt: "2024-10-19T09:45:00Z",
    assignedTemplates: availableTemplates.slice(0, 8),
    onboardingProgress: 25,
    submissions: generateSubmissions("4").slice(0, 8),
    media: generateMediaFiles("4", 40),
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    role: "customer",
    createdAt: "2024-10-17T16:30:00Z",
    assignedTemplates: availableTemplates.slice(0, 11),
    onboardingProgress: 55,
    submissions: generateSubmissions("5").slice(0, 11),
    media: generateMediaFiles("5", 43),
  },
  {
    id: "6",
    name: "David Martinez",
    email: "d.martinez@example.com",
    role: "customer",
    createdAt: "2024-10-14T11:00:00Z",
    assignedTemplates: availableTemplates.slice(0, 12),
    onboardingProgress: 100,
    submissions: generateSubmissions("6"),
    media: generateMediaFiles("6", 50),
  },
  {
    id: "7",
    name: "Jennifer Lee",
    email: "jennifer.lee@example.com",
    role: "customer",
    createdAt: "2024-10-20T13:15:00Z",
    assignedTemplates: availableTemplates.slice(0, 9),
    onboardingProgress: 35,
    submissions: generateSubmissions("7").slice(0, 9),
    media: generateMediaFiles("7", 41),
  },
  {
    id: "8",
    name: "Robert Taylor",
    email: "r.taylor@example.com",
    role: "customer",
    createdAt: "2024-10-13T15:45:00Z",
    assignedTemplates: availableTemplates.slice(0, 12),
    onboardingProgress: 100,
    submissions: generateSubmissions("8"),
    media: generateMediaFiles("8", 47),
  },
];

export const statsData = {
  totalCustomers: 148,
  customersChange: "+12.3%",
  activeCustomers: 127,
  activeChange: "+8.1%",
  avgCompletion: 76.4,
  completionChange: "+4.2%",
  newThisWeek: 18,
  newChange: "+5 from last week",
};
