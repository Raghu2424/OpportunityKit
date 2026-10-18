// Demo student profiles so anyone can test the product without typing. All fictional.

export const SAMPLE_PROFILES = [
  {
    key: 'aarav',
    blurb: 'Computer Science, year 3. Strong web skills, mixed documents.',
    profile: {
      name: 'Aarav (sample)',
      course: 'Computer Science / IT',
      year: 3,
      cgpa: 8.2,
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Python'],
      interests: ['Web Development', 'Artificial Intelligence', 'Open Source'],
      achievements: ['Finalist at a college hackathon (sample)', 'Built and published a personal portfolio site (sample)'],
      documents: ['resume', 'id'],
    },
  },
  {
    key: 'meera',
    blurb: 'Design, year 2. Strong design skills with a few documents ready.',
    profile: {
      name: 'Meera (sample)',
      course: 'Design / Fine Arts',
      year: 2,
      cgpa: 7.4,
      skills: ['Figma', 'Wireframing', 'User Research', 'Illustration'],
      interests: ['UI/UX', 'Social Impact'],
      achievements: ['Designed the poster series for the college fest (sample)'],
      documents: ['portfolio', 'id', 'transcript'],
    },
  },
  {
    key: 'sneha',
    blurb: 'Science, year 3. Incomplete profile, so you will see Missing Information.',
    profile: {
      name: 'Sneha (sample)',
      course: 'Science (Physics, Chemistry, Maths)',
      year: 3,
      cgpa: '',
      skills: [],
      interests: ['Research'],
      achievements: [],
      documents: [],
    },
  },
];

export const EMPTY_PROFILE = {
  name: '',
  course: '',
  year: '',
  cgpa: '',
  skills: [],
  interests: [],
  achievements: [],
  documents: [],
};
