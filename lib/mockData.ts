// lib/mockData.ts

export interface CMO {
  id: string;
  cmo_number: string;
  title: string;
  programs: string[];
  year: number;
}

export interface Section {
  id: string;
  cmo_id: string;
  section_number: string;
  section_title: string;
  sort_order: number;
}

export interface Requirement {
  id: string;
  cmo_id: string;
  section_id: string;
  description: string;
  required_evidence: string;
  sort_order: number;
}

export interface EvaluationResponse {
  requirement_id: string;
  actual_situation: string;
  google_link: string;
  hei_compliance: "Complied" | "Not Complied" | "";
  ched_compliance: "Complied" | "Not Complied" | "";
  link_accessible: "Yes" | "No" | "";
  ched_remarks: string;
}

// Mock CMO Data
export const mockCMOs: CMO[] = [
  {
    id: "1",
    cmo_number: "CMO No. 17, Series of 2017",
    title: "Policies, Standards, and Guidelines for BSBA program",
    programs: ["118"], // BSBA
    year: 2017,
  },
  {
    id: "2",
    cmo_number: "CMO No. 105, Series of 2017",
    title: "Policies, Standards and Guidelines for BSIT program",
    programs: ["181"], // BSIT
    year: 2017,
  },
  {
    id: "3",
    cmo_number: "CMO No. 53, Series of 2007",
    title: "Revised Policies and Standards for BS Psychology",
    programs: ["202", "44"], // BS Psychology and BA Psychology
    year: 2007,
  },
];

// Mock Sections - Complete for BSBA (CMO 1)
export const mockSections: Section[] = [
  // ==================== BSBA Sections (CMO 1) ====================
  {
    id: "1",
    cmo_id: "1",
    section_number: "I",
    section_title: "Legal Basis",
    sort_order: 1,
  },
  {
    id: "2",
    cmo_id: "1",
    section_number: "II",
    section_title: "Program Administration",
    sort_order: 2,
  },
  {
    id: "3",
    cmo_id: "1",
    section_number: "III",
    section_title: "General Education Faculty",
    sort_order: 3,
  },
  {
    id: "4",
    cmo_id: "1",
    section_number: "IV",
    section_title: "Curriculum",
    sort_order: 4,
  },
  {
    id: "5",
    cmo_id: "1",
    section_number: "V",
    section_title: "Library - Library Holdings",
    sort_order: 5,
  },
  {
    id: "6",
    cmo_id: "1",
    section_number: "VI",
    section_title: "Laboratory and Equipment",
    sort_order: 6,
  },
  {
    id: "7",
    cmo_id: "1",
    section_number: "VII",
    section_title: "Instructional Facilities (Classroom, Environment, Audio Visual Facilities, etc.)",
    sort_order: 7,
  },
  {
    id: "8",
    cmo_id: "1",
    section_number: "VIII",
    section_title: "Students Affairs & Services",
    sort_order: 8,
  },
  {
    id: "9",
    cmo_id: "1",
    section_number: "IX",
    section_title: "Manuals & Policies",
    sort_order: 9,
  },

  // ==================== BSIT Sections (CMO 2) ====================
  {
    id: "10",
    cmo_id: "2",
    section_number: "I",
    section_title: "Legal Basis",
    sort_order: 1,
  },
  {
    id: "11",
    cmo_id: "2",
    section_number: "II",
    section_title: "Faculty Qualifications",
    sort_order: 2,
  },
  {
    id: "12",
    cmo_id: "2",
    section_number: "III",
    section_title: "Curriculum Requirements",
    sort_order: 3,
  },
  {
    id: "13",
    cmo_id: "2",
    section_number: "IV",
    section_title: "Laboratory Facilities",
    sort_order: 4,
  },
  {
    id: "14",
    cmo_id: "2",
    section_number: "V",
    section_title: "Library Resources",
    sort_order: 5,
  },
  {
    id: "15",
    cmo_id: "2",
    section_number: "VI",
    section_title: "Student Services",
    sort_order: 6,
  },

  // ==================== BS Psychology Sections (CMO 3) ====================
  {
    id: "16",
    cmo_id: "3",
    section_number: "I",
    section_title: "Program Overview",
    sort_order: 1,
  },
  {
    id: "17",
    cmo_id: "3",
    section_number: "II",
    section_title: "Faculty Requirements",
    sort_order: 2,
  },
  {
    id: "18",
    cmo_id: "3",
    section_number: "III",
    section_title: "Curriculum and Practicum",
    sort_order: 3,
  },
  {
    id: "19",
    cmo_id: "3",
    section_number: "IV",
    section_title: "Facilities and Equipment",
    sort_order: 4,
  },
];

// Mock Requirements - Complete for all sections
export const mockRequirements: Requirement[] = [
  // ==================== BSBA - Legal Basis ====================
  {
    id: "1",
    cmo_id: "1",
    section_id: "1",
    description:
      "<p><strong>CMO No. 17, Series of 2017.</strong></p><p><strong>Policies, Standards, and Guidelines for BSBA program.</strong></p><p><br></p><p><strong>RA 7722, Higher Education Act of 1994, in pursuance of an outcomes-based quality assurance system as advocated under CMO NO. 46 S. 2012, and by virtue of commission en banc Resolution No. 231-2017 dated March 28, 2017, the following policies, standards and guidelines (PSG'S) are hereby adopted and promulgated by the commission.</strong></p>",
    required_evidence: "N/A",
    sort_order: 1,
  },

  // ==================== BSBA - Program Administration ====================
  {
    id: "2",
    cmo_id: "1",
    section_id: "2",
    description:
      "<p><strong>General Qualifications of Dean/Director of the Program</strong></p><p><br></p><p>The program in BSBA should be administered by a full-time Program Coordinator or Chairman.</p><p>- Be a Filipino citizen, except in meritorious cases;</p><p>- A doctoral degree in Business Administration/Management; or a doctoral degree in related field and a master's degree in business administration/management.</p><p>- Have at least five (5) years teaching experience at the tertiary level;</p><p>- Preferably have at least five (5) years' experience in administrative or supervisory capacity in government, civil society, and educational institution or a business enterprise.</p>",
    required_evidence: "Professional Portfolio file 201 and various certificates",
    sort_order: 1,
  },
  {
    id: "3",
    cmo_id: "1",
    section_id: "2",
    description:
      "<p><strong>Chairs or Coordinators</strong></p><p>- Chair or coordinators may be appointed to help in the administration of specific fields or disciplines in the program and should possess the following qualifications:</p><p>· A masters degree in Business Administration Management or a Masters degree in any related field and a bachelors degree in business;</p><p>· At least 3 yrs teaching experience at the tertiary level.</p>",
    required_evidence: "Professional Portfolio file 201 and various certificates",
    sort_order: 2,
  },

  // ==================== BSBA - General Education Faculty ====================
  {
    id: "4",
    cmo_id: "1",
    section_id: "3",
    description:
      "<p>All faculty should possess the educational qualifications, professional experience, classroom teaching ability, computer literacy, scholarly research productivity, and other attributes essential for successful conduct of the undergraduate accounting program.</p>",
    required_evidence: "TOR 201",
    sort_order: 1,
  },
  {
    id: "5",
    cmo_id: "1",
    section_id: "3",
    description:
      "<p>At least 75% of all <strong><u>business and professional courses</u></strong> must be taught by faculty with business or related graduate degrees, with at least one third of them (25%) taught by all business and professional courses maybe taught by industry practitioners who do not hold graduate degrees.</p>",
    required_evidence: "TOR 201",
    sort_order: 2,
  },
  {
    id: "6",
    cmo_id: "1",
    section_id: "3",
    description:
      "<p><strong><u>General education</u></strong> courses in the program should be taught by faculty member with appropriate master degrees.</p>",
    required_evidence: "TOR 201",
    sort_order: 3,
  },
  {
    id: "7",
    cmo_id: "1",
    section_id: "3",
    description:
      "<p>All faculty member teaching accounting courses should be taught by CPA's. All taxation subject should be handled by CPA's or lawyers and all business law courses should be handled by lawyers</p><p>and</p><p><br></p><p>- Any tenured/full time/full load faculty</p><p>- Teaching load 24 units per term</p><p>- Faculty ranking and evaluating</p><p>- Faculty staff and development</p>",
    required_evidence: "TOR 201",
    sort_order: 4,
  },

  // ==================== BSBA - Curriculum ====================
  {
    id: "8",
    cmo_id: "1",
    section_id: "4",
    description:
      "<p>The BSBA program is both an applied social science and a field of management. As such the curriculum includes courses in general education and public administration, special core courses and electives.</p><p>The curriculum for the BSBA program should be consistent with the school's mission statement.</p>",
    required_evidence: "Course Curriculum",
    sort_order: 1,
  },
  {
    id: "9",
    cmo_id: "1",
    section_id: "4",
    description:
      "<p>a. The curricular requirement for each program should follow the minimum number of units prescribed by the CHED.</p>",
    required_evidence: "Course Curriculum",
    sort_order: 2,
  },
  {
    id: "10",
    cmo_id: "1",
    section_id: "4",
    description:
      "<p>b. The school is free to enhance and to follow different patterns and modalities based on the needs of its clientele.</p>",
    required_evidence: "Course Curriculum",
    sort_order: 3,
  },
  {
    id: "11",
    cmo_id: "1",
    section_id: "4",
    description:
      "<p>c. As a minimum, the BSBA curriculum shall consist of at least 122 academic units divided into SIX (6) parts: general education, Common Business And Management Education Course; Core Accounting Education Course And, cognate, major/professional course:</p><p>Gen. Education Courses - 36</p><p>NSTP - 6</p><p>Physical Educ courses - 8</p><p>Common business core - 6</p><p>Business Adm mgt. core - 24</p><p>Professional Major - 24</p><p>Electives - 12</p><p>Internship (600hrs) - 6</p><p><strong>TOTAL UNITS - 122</strong></p>",
    required_evidence: "Course Curriculum",
    sort_order: 4,
  },

  // ==================== BSBA - Library Holdings ====================
  {
    id: "12",
    cmo_id: "1",
    section_id: "5",
    description:
      "<p>Universities and colleges offering the BSBA program should have library resources that are relevant and adequate in terms of quality and quantity; helpful in serving the needs of scholarship and research; and progressively developing and growing in accordance with the institutional development plans.</p>",
    required_evidence: "Ocular Visit",
    sort_order: 1,
  },
  {
    id: "13",
    cmo_id: "1",
    section_id: "5",
    description:
      "<p>a. The number of holdings and reference materials for each curricular offering should be in proportion to the enrollment and needs of the students.</p>",
    required_evidence: "Ocular Visit",
    sort_order: 2,
  },
  {
    id: "14",
    cmo_id: "1",
    section_id: "5",
    description:
      "<p>b. In addition to books, other academic resources should include a substantial number of journals and other professional publications in both digital and printed forms.</p>",
    required_evidence: "Ocular Visit",
    sort_order: 3,
  },
  {
    id: "15",
    cmo_id: "1",
    section_id: "5",
    description:
      "<p>The library should be adequately staffed with professionally qualified and trained personnel supportive of the school's academic programs.</p><p>There should be a universally accepted library classification system with card catalogues or computer-based system and a connection to the world web enable students to access to these facilities.</p><p>The open-shelf system is encourage.</p><p>The library should be conveniently located and open at reasonable hours for use of faculty and students.</p>",
    required_evidence: "Ocular Visit",
    sort_order: 4,
  },

  // ==================== BSBA - Laboratory and Equipment ====================
  {
    id: "16",
    cmo_id: "1",
    section_id: "6",
    description:
      "<p>- Typing Laboratory Facilities.</p><p><br></p><p>- A computer laboratory with Internet connection for students use.</p>",
    required_evidence: "Ocular Inspection",
    sort_order: 1,
  },

  // ==================== BSBA - Instructional Facilities ====================
  {
    id: "17",
    cmo_id: "1",
    section_id: "7",
    description:
      "<p>College and universities offering the BSBA program should provide adequate physical facilities for their courses.</p><p><br></p><p>All institutions should maintain a campus conducive to promote the quality of its graduates.</p>",
    required_evidence: "Ocular Inspection",
    sort_order: 1,
  },
  {
    id: "18",
    cmo_id: "1",
    section_id: "7",
    description:
      "<p>Higher Education Institutions provide the necessary audio-visual room and equipment to facilitate the teaching-learning process such as Computer, Overhead Projector, Slide Projector, LCD Projector and Sound System.</p>",
    required_evidence: "Ocular Visit",
    sort_order: 2,
  },

  // ==================== BSBA - Students Affairs & Services ====================
  {
    id: "19",
    cmo_id: "1",
    section_id: "8",
    description:
      "<p>Facilities for support services such as health, guidance, and employment/placement services may be shared with other units of the school.</p><p>School Registrar</p>",
    required_evidence: "Ocular Visit, PRC ID, TOR, Certifications, PRC ID, Ocular Visit",
    sort_order: 1,
  },
  {
    id: "20",
    cmo_id: "1",
    section_id: "8",
    description:
      "<p><strong>Guidance & Testing Center</strong></p><p>- Functions and ratio of Guidance counselors.</p><p>- Guidance Program</p><p>- Equipment and Facilities</p>",
    required_evidence: "Ocular Visit, PRC ID, TOR, Certifications",
    sort_order: 2,
  },
  {
    id: "21",
    cmo_id: "1",
    section_id: "8",
    description:
      "<p><strong>School Clinic</strong></p><p>- Availability of school nurse, Dentist, and physician.</p><p>- Equipment and Facilities</p><p>- Supplies of medicines.</p>",
    required_evidence: "Ocular Visit, PRC ID, TOR, Certifications",
    sort_order: 3,
  },
  {
    id: "22",
    cmo_id: "1",
    section_id: "8",
    description:
      "<p><strong>School Canteen</strong></p><p>- Location/Sanitation</p><p>- Personnel</p><p>- Sanitary Permit</p>",
    required_evidence: "Ocular Visit, PRC ID, TOR, Certifications",
    sort_order: 4,
  },

  // ==================== BSBA - Manuals & Policies ====================
  {
    id: "23",
    cmo_id: "1",
    section_id: "9",
    description:
      "<p>- Administrative Manual</p><p>- Faculty Manual</p><p>- Student Handbook</p><p>- Health & Safety Manual</p>",
    required_evidence: "Copies of Faculty, Administrative Manuals, Student Handbook",
    sort_order: 1,
  },

  // ==================== BSIT - Legal Basis ====================
  {
    id: "24",
    cmo_id: "2",
    section_id: "10",
    description:
      "<p><strong>CMO No. 105, Series of 2017.</strong></p><p>Policies, Standards and Guidelines for the Bachelor of Science in Information Technology (BSIT) program in compliance with RA 7722, Higher Education Act of 1994.</p><p><br></p><p>This CMO prescribes the minimum standards for the BSIT program to ensure quality education and produce competent IT professionals.</p>",
    required_evidence: "N/A",
    sort_order: 1,
  },

  // ==================== BSIT - Faculty Qualifications ====================
  {
    id: "25",
    cmo_id: "2",
    section_id: "11",
    description:
      "<p><strong>Program Chair/Coordinator:</strong></p><p>- Master's degree in Information Technology, Computer Science or related field</p><p>- At least 5 years teaching experience at the tertiary level</p><p>- Industry experience preferred</p><p>- Active in research and professional development</p>",
    required_evidence: "TOR, Certificates, Professional Portfolio, 201 File",
    sort_order: 1,
  },
  {
    id: "26",
    cmo_id: "2",
    section_id: "11",
    description:
      "<p><strong>Faculty Members:</strong></p><p>- At least 60% must have master's degrees in IT or related fields</p><p>- At least 30% must have industry certifications (e.g., CISCO, Microsoft, Oracle)</p><p>- Regular training and professional development required</p><p>- Industry practitioners may teach specialized courses</p>",
    required_evidence: "Faculty credentials, Certifications, Training records",
    sort_order: 2,
  },
  {
    id: "27",
    cmo_id: "2",
    section_id: "11",
    description:
      "<p><strong>Faculty Development:</strong></p><p>- Continuous training programs in emerging technologies</p><p>- Faculty-industry linkage programs</p><p>- Research and publication support</p><p>- Attendance to IT conferences and seminars</p>",
    required_evidence: "Training certificates, Conference attendance records",
    sort_order: 3,
  },

  // ==================== BSIT - Curriculum Requirements ====================
  {
    id: "28",
    cmo_id: "2",
    section_id: "12",
    description:
      "<p><strong>Minimum Curriculum Requirements:</strong></p><p>The BSIT program shall consist of a minimum of 120 units distributed as follows:</p><p>- General Education Courses: 36 units</p><p>- IT Core Courses: 54 units</p><p>- IT Electives: 15 units</p><p>- Practicum/OJT (min 486 hours): 6 units</p><p>- Capstone Project: 6 units</p><p>- NSTP: 6 units</p><p>- Physical Education: 8 units</p>",
    required_evidence: "Approved Curriculum, Course syllabi",
    sort_order: 1,
  },
  {
    id: "29",
    cmo_id: "2",
    section_id: "12",
    description:
      "<p><strong>Core IT Subjects must include:</strong></p><p>- Programming (multiple languages)</p><p>- Data Structures and Algorithms</p><p>- Database Management Systems</p><p>- Web Development</p><p>- Network Administration</p><p>- System Analysis and Design</p><p>- Information Security</p><p>- Software Engineering</p>",
    required_evidence: "Course syllabi, Laboratory manuals",
    sort_order: 2,
  },
  {
    id: "30",
    cmo_id: "2",
    section_id: "12",
    description:
      "<p><strong>Capstone Project:</strong></p><p>- Students must develop a working software/system</p><p>- Must demonstrate application of learned concepts</p><p>- Must be defended before a panel</p><p>- Documentation must follow industry standards</p>",
    required_evidence: "Capstone project guidelines, Sample projects",
    sort_order: 3,
  },

  // ==================== BSIT - Laboratory Facilities ====================
  {
    id: "31",
    cmo_id: "2",
    section_id: "13",
    description:
      "<p><strong>Computer Laboratory Requirements:</strong></p><p>- Minimum 1:1 student to computer ratio</p><p>- Computers with minimum specifications for current software development</p><p>- Internet connectivity of at least 10 Mbps per laboratory</p><p>- Licensed software applications and development tools</p><p>- Air-conditioned environment</p>",
    required_evidence: "Ocular Visit, Equipment inventory, Software licenses",
    sort_order: 1,
  },
  {
    id: "32",
    cmo_id: "2",
    section_id: "13",
    description:
      "<p><strong>Specialized Laboratories:</strong></p><p>- Networking laboratory with routers, switches, and network equipment</p><p>- Hardware laboratory for assembly and troubleshooting</p><p>- Server room for database and system administration</p><p>- Multimedia laboratory for graphics and video editing</p>",
    required_evidence: "Ocular Visit, Laboratory manuals, Equipment list",
    sort_order: 2,
  },
  {
    id: "33",
    cmo_id: "2",
    section_id: "13",
    description:
      "<p><strong>Laboratory Management:</strong></p><p>- Qualified laboratory technician/s</p><p>- Laboratory rules and regulations</p><p>- Equipment maintenance schedule</p><p>- Laboratory utilization records</p><p>- Safety and security measures</p>",
    required_evidence: "Laboratory policies, Maintenance records, Technician credentials",
    sort_order: 3,
  },

  // ==================== BSIT - Library Resources ====================
  {
    id: "34",
    cmo_id: "2",
    section_id: "14",
    description:
      "<p><strong>IT-Related Library Holdings:</strong></p><p>- Current IT textbooks and reference materials</p><p>- Programming language references</p><p>- IT journals and periodicals (print and digital)</p><p>- E-books and online resources</p><p>- Access to IEEE, ACM, and other IT databases</p>",
    required_evidence: "Library inventory, Subscription proof, Ocular visit",
    sort_order: 1,
  },
  {
    id: "35",
    cmo_id: "2",
    section_id: "14",
    description:
      "<p><strong>Digital Library Resources:</strong></p><p>- Online learning platforms access</p><p>- Digital repositories of research papers</p><p>- Video tutorials and e-learning materials</p><p>- Virtual library system</p>",
    required_evidence: "Subscription records, Access credentials",
    sort_order: 2,
  },

  // ==================== BSIT - Student Services ====================
  {
    id: "36",
    cmo_id: "2",
    section_id: "15",
    description:
      "<p><strong>Career Development Services:</strong></p><p>- IT career counseling</p><p>- Job placement assistance</p><p>- Industry linkage programs</p><p>- Internship coordination</p><p>- Alumni tracking system</p>",
    required_evidence: "Program documentation, MOAs with companies, Placement records",
    sort_order: 1,
  },
  {
    id: "37",
    cmo_id: "2",
    section_id: "15",
    description:
      "<p><strong>Student Organizations:</strong></p><p>- IT student organization/club</p><p>- Participation in hackathons and competitions</p><p>- Technical seminars and workshops</p><p>- Certification training programs</p>",
    required_evidence: "Organization records, Activity reports, Certificates",
    sort_order: 2,
  },

  // ==================== BS Psychology - Program Overview ====================
  {
    id: "38",
    cmo_id: "3",
    section_id: "16",
    description:
      "<p><strong>CMO No. 53, Series of 2007.</strong></p><p>The BS Psychology program aims to produce competent graduates who can pursue careers in various psychological fields or continue to graduate studies.</p><p><br></p><p>The program provides a strong foundation in psychological theories, research methods, and applied psychology.</p>",
    required_evidence: "Program prospectus, Mission-Vision statement",
    sort_order: 1,
  },
  {
    id: "39",
    cmo_id: "3",
    section_id: "16",
    description:
      "<p><strong>Program Requirements:</strong></p><p>The program must maintain a minimum of 162 units including:</p><p>- General Education: 63 units</p><p>- Professional Courses: 84 units</p><p>- Practicum/Internship: 9 units</p><p>- NSTP: 6 units</p>",
    required_evidence: "Curriculum map, Course syllabi",
    sort_order: 2,
  },
  {
    id: "40",
    cmo_id: "3",
    section_id: "16",
    description:
      "<p><strong>Program Learning Outcomes:</strong></p><p>Graduates should be able to:</p><p>- Apply psychological principles to real-world situations</p><p>- Conduct psychological research ethically</p><p>- Demonstrate competence in psychological assessment</p><p>- Practice within ethical guidelines of psychology</p>",
    required_evidence: "Program outcomes documentation, Assessment results",
    sort_order: 3,
  },

  // ==================== BS Psychology - Faculty Requirements ====================
  {
    id: "41",
    cmo_id: "3",
    section_id: "17",
    description:
      "<p><strong>Program Head:</strong></p><p>- PhD in Psychology or EdD with MA in Psychology</p><p>- Licensed Psychologist (RPsy)</p><p>- At least 5 years teaching experience in psychology</p><p>- Active in research and publication</p><p>- Member of Philippine Psychological Association</p>",
    required_evidence: "201 file, PRC License, CV, Publications list",
    sort_order: 1,
  },
  {
    id: "42",
    cmo_id: "3",
    section_id: "17",
    description:
      "<p><strong>Faculty Requirements:</strong></p><p>- All psychology courses must be taught by licensed psychologists</p><p>- At least 60% with MA in Psychology</p><p>- At least 30% with PhD in Psychology or ongoing PhD studies</p><p>- Continuing professional education (CPD) compliance</p><p>- Active PRC license renewal</p>",
    required_evidence: "Faculty credentials, PRC licenses, CPD certificates",
    sort_order: 2,
  },
  {
    id: "43",
    cmo_id: "3",
    section_id: "17",
    description:
      "<p><strong>Practicum Supervisors:</strong></p><p>- Licensed psychologists with at least 3 years clinical experience</p><p>- Accredited by the university</p><p>- Training in supervision and mentoring</p><p>- Active in professional practice</p>",
    required_evidence: "Supervisor credentials, Training certificates, Accreditation docs",
    sort_order: 3,
  },

  // ==================== BS Psychology - Curriculum and Practicum ====================
  {
    id: "44",
    cmo_id: "3",
    section_id: "18",
    description:
      "<p><strong>Core Psychology Courses must include:</strong></p><p>- General Psychology</p><p>- Developmental Psychology</p><p>- Abnormal Psychology</p><p>- Social Psychology</p><p>- Physiological Psychology</p><p>- Psychological Statistics</p><p>- Psychological Testing and Measurement</p><p>- Experimental Psychology</p><p>- Theories of Personality</p>",
    required_evidence: "Curriculum, Course syllabi, Textbook list",
    sort_order: 1,
  },
  {
    id: "45",
    cmo_id: "3",
    section_id: "18",
    description:
      "<p><strong>Practicum Requirements:</strong></p><p>- Minimum 750 hours of supervised practicum</p><p>- Clinical, industrial, or community setting</p><p>- MOA with practicum agencies</p><p>- Regular supervision and monitoring</p><p>- Practicum journal and case studies</p><p>- Final practicum evaluation</p>",
    required_evidence: "Practicum manual, MOAs, Evaluation forms, Student portfolios",
    sort_order: 2,
  },
  {
    id: "46",
    cmo_id: "3",
    section_id: "18",
    description:
      "<p><strong>Research Requirements:</strong></p><p>- Thesis or comprehensive exam option</p><p>- Must follow APA format</p><p>- Ethics review for human subjects research</p><p>- Defense before panel of licensed psychologists</p>",
    required_evidence: "Research guidelines, Sample theses, Ethics board approval",
    sort_order: 3,
  },

  // ==================== BS Psychology - Facilities and Equipment ====================
  {
    id: "47",
    cmo_id: "3",
    section_id: "19",
    description:
      "<p><strong>Psychology Laboratory:</strong></p><p>- One-way mirror observation room</p><p>- Audio-visual recording equipment</p><p>- Psychological testing materials</p><p>- Assessment tools and instruments</p><p>- Secure storage for test materials</p>",
    required_evidence: "Ocular visit, Equipment inventory, Laboratory manual",
    sort_order: 1,
  },
  {
    id: "48",
    cmo_id: "3",
    section_id: "19",
    description:
      "<p><strong>Psychological Test Library:</strong></p><p>- Standardized psychological tests (IQ, personality, aptitude)</p><p>- Filipino-normed tests when available</p><p>- Test manuals and scoring guides</p><p>- Secure storage and inventory system</p><p>- Regular updating of test materials</p>",
    required_evidence: "Test inventory, Purchase orders, Storage protocols",
    sort_order: 2,
  },
  {
    id: "49",
    cmo_id: "3",
    section_id: "19",
    description:
      "<p><strong>Counseling/Therapy Rooms:</strong></p><p>- Private, soundproof counseling rooms</p><p>- Appropriate furniture and ambiance</p><p>- Play therapy materials for child psychology</p><p>- Group therapy space</p>",
    required_evidence: "Ocular visit, Room allocation, Photos",
    sort_order: 3,
  },
  {
    id: "50",
    cmo_id: "3",
    section_id: "19",
    description:
      "<p><strong>Library Psychology Holdings:</strong></p><p>- Current psychology textbooks and references</p><p>- Psychological journals (print and online)</p><p>- DSM-5 and ICD-11</p><p>- Access to PsycINFO and other psychology databases</p>",
    required_evidence: "Library inventory, Journal subscriptions, Database access",
    sort_order: 4,
  },
];

// Program options
export const programOptions = [
  { value: "482", label: "BACHELOR OF SCIENCE IN CIVIL ENGINEERING - GEOTECHNICAL ENGINEERING" },
  { value: "483", label: "BACHELOR OF SCIENCE IN CIVIL ENGINEERING - STRUCTURAL ENGINEERING" },
  { value: "1", label: "AGRI-BUSINESS TECHNOLOGY" },
  { value: "2", label: "AGRICULTURAL TECHNOLOGY" },
  { value: "3", label: "ASSOCIATE IN AGRICULTURAL BUSINESS MANAGEMENT" },
  { value: "4", label: "ASSOCIATE IN AGRICULTURAL TECHNOLOGY" },
  { value: "691", label: "ASSOCIATE IN AGRICULTURE" },
  { value: "5", label: "ASSOCIATE IN COMPUTER TECHNOLOGY" },
  { value: "714", label: "ASSOCIATE IN COMPUTER TECHNOLOGY - UI/UX SPECIALIZATION" },
  { value: "6", label: "ASSOCIATE IN HOSPITALITY MANAGEMENT" },
  { value: "7", label: "ASSOCIATE IN HOTEL AND RESTAURANT MANAGEMENT" },
  { value: "8", label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - ARCHITECTURAL DRAFTING" },
  { value: "9", label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - AUTOMOTIVE TECHNOLOGY" },
  { value: "10", label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - CIVIL TECHNOLOGY" },
  { value: "11", label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - ELECTRICAL TECHNOLOGY" },
  { value: "12", label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - ELECTRONICS TECHNOLOGY" },
  { value: "13", label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - MACHINE SHOP TECHNOLOGY" },
  { value: "14", label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - WOODWORKING TECHNOLOGY" },
  { value: "692", label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY" },
  { value: "15", label: "ASSOCIATE IN RADIOLOGIC TECHNOLOGY" },
  { value: "80", label: "BACHELOR OF SCIENCE IN ACCOUNTANCY" },
  { value: "85", label: "BACHELOR OF SCIENCE IN AGRIBUSINESS" },
  { value: "92", label: "BACHELOR OF SCIENCE IN AGRICULTURE" },
  { value: "113", label: "BACHELOR OF SCIENCE IN ARCHITECTURE" },
  { value: "114", label: "BACHELOR OF SCIENCE IN BIOLOGY" },
  { value: "118", label: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION" },
  { value: "132", label: "BACHELOR OF SCIENCE IN CHEMISTRY" },
  { value: "133", label: "BACHELOR OF SCIENCE IN CIVIL ENGINEERING" },
  { value: "135", label: "BACHELOR OF SCIENCE IN COMPUTER ENGINEERING" },
  { value: "136", label: "BACHELOR OF SCIENCE IN COMPUTER SCIENCE" },
  { value: "137", label: "BACHELOR OF SCIENCE IN CRIMINOLOGY" },
  { value: "632", label: "BACHELOR IN ELEMENTARY EDUCATION" },
  { value: "631", label: "BACHELOR IN SECONDARY EDUCATION - SCIENCE" },
  { value: "634", label: "BACHELOR IN SECONDARY EDUCATION - MATHEMATICS" },
  { value: "635", label: "BACHELOR IN SECONDARY EDUCATION - ENGLISH" },
  { value: "146", label: "BACHELOR OF SCIENCE IN ELECTRICAL ENGINEERING" },
  { value: "147", label: "BACHELOR OF SCIENCE IN ELECTRONICS AND COMMUNICATIONS ENGINEERING" },
  { value: "151", label: "BACHELOR OF SCIENCE IN ENTREPRENEURSHIP" },
  { value: "165", label: "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT" },
  { value: "166", label: "BACHELOR OF SCIENCE IN HOTEL AND RESTAURANT MANAGEMENT" },
  { value: "169", label: "BACHELOR OF SCIENCE IN INDUSTRIAL ENGINEERING" },
  { value: "181", label: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY" },
  { value: "188", label: "BACHELOR OF SCIENCE IN MARINE ENGINEERING" },
  { value: "189", label: "BACHELOR OF SCIENCE IN MARINE TRANSPORTATION" },
  { value: "190", label: "BACHELOR OF SCIENCE IN MATHEMATICS" },
  { value: "191", label: "BACHELOR OF SCIENCE IN MECHANICAL ENGINEERING" },
  { value: "192", label: "BACHELOR OF SCIENCE IN MEDICAL TECHNOLOGY" },
  { value: "193", label: "BACHELOR OF SCIENCE IN MIDWIFERY" },
  { value: "195", label: "BACHELOR OF SCIENCE IN NURSING" },
  { value: "200", label: "BACHELOR OF SCIENCE IN PHARMACY" },
  { value: "201", label: "BACHELOR OF SCIENCE IN PHYSICAL THERAPY" },
  { value: "202", label: "BACHELOR OF SCIENCE IN PSYCHOLOGY" },
  { value: "205", label: "BACHELOR OF SCIENCE IN SOCIAL WORK" },
  { value: "207", label: "BACHELOR OF SCIENCE IN TOURISM" },
  { value: "208", label: "BACHELOR OF SCIENCE IN TOURISM MANAGEMENT" },
  { value: "43", label: "BACHELOR OF ARTS IN POLITICAL SCIENCE" },
  { value: "44", label: "BACHELOR OF ARTS IN PSYCHOLOGY" },
  { value: "28", label: "BACHELOR OF ARTS IN ENGLISH" },
  { value: "324", label: "MASTER IN BUSINESS ADMINISTRATION" },
  { value: "348", label: "MASTER OF ARTS IN EDUCATION" },
  { value: "67", label: "BACHELOR OF LAWS" },
  { value: "530", label: "DOCTOR OF MEDICINE" },
];

// Helper functions
export function getSectionsByCMOIds(cmoIds: string[]): Section[] {
  return mockSections.filter((section) => cmoIds.includes(section.cmo_id));
}

export function getRequirementsBySectionIds(sectionIds: string[]): Requirement[] {
  return mockRequirements.filter((req) => sectionIds.includes(req.section_id));
}

export function organizeEvaluationData(cmoIds: string[]) {
  const selectedCMOs = mockCMOs.filter((cmo) => cmoIds.includes(cmo.id));

  return selectedCMOs.map((cmo) => {
    const sections = mockSections
      .filter((s) => s.cmo_id === cmo.id)
      .sort((a, b) => a.sort_order - b.sort_order);

    return {
      cmo,
      sections: sections.map((section) => ({
        ...section,
        requirements: mockRequirements
          .filter((r) => r.section_id === section.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      })),
    };
  });
}

export function getAssociatedPrograms(cmoIds: string[]): string[] {
  const associatedProgramIds = new Set<string>();

  cmoIds.forEach((cmoId) => {
    const cmo = mockCMOs.find((c) => c.id === cmoId);
    if (cmo) {
      cmo.programs.forEach((programId) => {
        associatedProgramIds.add(programId);
      });
    }
  });

  return Array.from(associatedProgramIds);
}

export function getProgramOptionsByIds(programIds: string[]) {
  return programOptions.filter((option) => programIds.includes(option.value));
}

export function getAssociatedCMOs(programIds: string[]): string[] {
  const associatedCMOIds = new Set<string>();

  programIds.forEach((programId) => {
    mockCMOs.forEach((cmo) => {
      if (cmo.programs.includes(programId)) {
        associatedCMOIds.add(cmo.id);
      }
    });
  });

  return Array.from(associatedCMOIds);
}

export function getCMOOptionsByIds(cmoIds: string[]) {
  const cmoOptionsArray = mockCMOs.map((cmo) => ({
    value: cmo.id,
    label: `${cmo.cmo_number} - ${cmo.title}`,
  }));
  return cmoOptionsArray.filter((option) => cmoIds.includes(option.value));
}