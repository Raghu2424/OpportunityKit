// Shared reference data used by the profile form, the demo opportunities and the matching engine.

export const COURSES = [
  'Computer Science / IT',
  'Electronics & Electrical',
  'Mechanical / Civil Engineering',
  'Business / Commerce',
  'Science (Physics, Chemistry, Maths)',
  'Life Sciences & Health',
  'Design / Fine Arts',
  'Arts & Humanities',
];

export const YEARS = [1, 2, 3, 4, 5];

export const CATEGORIES = ['Internship', 'Scholarship', 'Hackathon', 'Program'];

// Documents a student may need. `hint` is the next-step advice shown in the checklist.
export const DOCUMENTS = {
  resume: {
    label: 'Resume / CV',
    hint: 'Write a one-page resume with your education, skills and projects. Use a plain single-column layout.',
  },
  transcript: {
    label: 'Academic transcript or marksheet',
    hint: 'Download the latest transcript from your university portal or request it from your department office.',
  },
  recommendation: {
    label: 'Recommendation letter',
    hint: 'Ask a professor or mentor at least two weeks ahead. Send them your resume and the opportunity details.',
  },
  portfolio: {
    label: 'Portfolio or GitHub profile',
    hint: 'Publish two or three of your best projects with a short description of what you built and why.',
  },
  sop: {
    label: 'Statement of purpose',
    hint: 'Write 300 to 500 words: why this opportunity, what you have done so far, and what you will do with it.',
  },
  id: {
    label: 'College ID or identity proof',
    hint: 'Keep a clear scan or photo of your college ID card ready to upload.',
  },
  income: {
    label: 'Income certificate',
    hint: 'Apply through your local government office or portal. It can take several days, so start early.',
  },
};

export const SKILL_SUGGESTIONS = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Python', 'SQL', 'Git', 'Excel', 'Statistics',
  'Data Visualization', 'Machine Learning', 'Figma', 'Wireframing', 'User Research',
  'Communication', 'Research', 'Writing', 'CAD', 'MATLAB', 'Linux', 'Networking',
  'Financial Modelling', 'IoT', 'Tailwind CSS',
];

export const INTEREST_SUGGESTIONS = [
  'Web Development', 'UI/UX', 'Artificial Intelligence', 'Data Science', 'Sustainability',
  'Social Impact', 'Healthcare', 'Education', 'Finance', 'Open Source', 'Robotics', 'Research',
];
