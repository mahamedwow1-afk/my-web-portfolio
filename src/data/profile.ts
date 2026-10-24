// Single source of truth for portfolio data
export interface Profile {
  name: string
  title: string
  bio: string
  location: string
  avatarUrl: string
  githubUrl: string
  email: string
  socials: SocialLink[]
  repos: Repo[]
  projects: PortfolioProject[]
  skills: SkillData
  experience: ExperienceEntry[]
  education: EducationEntry[]
}

export interface SocialLink {
  platform: string
  url: string
  label: string
}

export interface Repo {
  name: string
  description: string
  htmlUrl: string
  language: string | null
  stars: number
  updatedAt: string
}

export interface PortfolioProject {
  title: string
  category: 'web' | 'automation' | 'tool' | 'experiment'
  description: string
  longDescription?: string
  techStack: string[]
  image?: string
  liveUrl?: string
  githubUrl: string
  featured?: boolean
}

export interface SkillData {
  languages: string[]
  frameworks: string[]
  tools: string[]
  softSkills: string[]
}

export interface ExperienceEntry {
  role: string
  organization: string
  period: string
  description: string
  technologies: string[]
}

export interface EducationEntry {
  degree: string
  institution: string
  period: string
  description: string
}

export const profile: Profile = {
  name: 'Mahamed Yasser',
  title: 'Full-Stack Web & Python Developer',
  bio: 'Professional web developer and automation engineer specializing in modern web applications, Python automation tools, and digital media production.',
  location: 'Qalyubia, Egypt',
  avatarUrl: 'https://avatars.githubusercontent.com/u/225742058?v=4',
  githubUrl: 'https://github.com/mahamedwow1-afk',
  email: 'mahamedwow1@gmail.com',
  socials: [
    { platform: 'github', url: 'https://github.com/mahamedwow1-afk', label: 'GitHub' },
    { platform: 'email', url: 'mailto:mahamedwow1@gmail.com', label: 'Email' }
  ],
  repos: [
    {
      name: 'media-organizer-pro',
      description: 'Professional Python automation tool for organizing video, image, and audio files using FFmpeg and ML',
      htmlUrl: 'https://github.com/mahamedwow1-afk/media-organizer-pro',
      language: 'Python',
      stars: 1,
      updatedAt: '2026-10-20'
    },
    {
      name: 'platform',
      description: 'Interactive educational platform with course management, exams, forums, and real-time statistics dashboard',
      htmlUrl: 'https://github.com/mahamedwow1-afk/platform',
      language: 'JavaScript',
      stars: 1,
      updatedAt: '2026-10-20'
    },
    {
      name: 'Smart-File-Organizer',
      description: 'Professional Python GUI application to organize files into categorized folders automatically',
      htmlUrl: 'https://github.com/mahamedwow1-afk/Smart-File-Organizer',
      language: 'Python',
      stars: 1,
      updatedAt: '2026-10-20'
    },
    {
      name: 'my-first-app',
      description: 'Task management and notes web application with persistent local storage',
      htmlUrl: 'https://github.com/mahamedwow1-afk/my-first-app',
      language: 'CSS / JS',
      stars: 1,
      updatedAt: '2026-10-20'
    }
  ],
  projects: [
    {
      title: 'E-Learning Platform',
      category: 'web',
      description: 'Full-featured educational portal with student dashboards, interactive exams, and admin analytics',
      longDescription: 'A comprehensive learning management system featuring real-time course tracking, interactive examination modules, student progress analytics, and an intuitive admin dashboard for content management.',
      techStack: ['JavaScript', 'HTML5', 'CSS3', 'REST API', 'LocalStorage'],
      githubUrl: 'https://github.com/mahamedwow1-afk/platform',
      featured: true
    },
    {
      title: 'Media Organizer Pro',
      category: 'automation',
      description: 'Advanced media management using FFmpeg automation and machine learning',
      longDescription: 'Professional-grade media organization tool leveraging FFmpeg for video/audio processing, ML-based content classification, automated metadata extraction, and intelligent file categorization.',
      techStack: ['Python', 'FFmpeg', 'Machine Learning', 'OpenCV', 'PyQt'],
      githubUrl: 'https://github.com/mahamedwow1-afk/media-organizer-pro',
      featured: true
    },
    {
      title: 'Smart File Organizer',
      category: 'tool',
      description: 'GUI desktop application for automatic file organization and categorization',
      longDescription: 'Cross-platform desktop application with drag-and-drop interface, custom folder rules, batch processing, and real-time preview. Features intelligent file type detection and automatic naming conventions.',
      techStack: ['Python', 'Tkinter', 'OS Module', 'Shutil'],
      githubUrl: 'https://github.com/mahamedwow1-afk/Smart-File-Organizer',
      featured: true
    },
    {
      title: 'Task & Notes App',
      category: 'web',
      description: 'Responsive task manager with real-time search and persistent storage',
      longDescription: 'Modern web application featuring real-time task filtering, category management, statistics dashboard, dark/light theme support, and local storage persistence for offline access.',
      techStack: ['JavaScript', 'CSS Grid', 'Flexbox', 'LocalStorage'],
      githubUrl: 'https://github.com/mahamedwow1-afk/my-first-app',
      featured: false
    }
  ],
  skills: {
    languages: ['Python', 'JavaScript (ES6+)', 'HTML5/CSS3', 'Bash/Shell'],
    frameworks: ['React (Learning)', 'Node.js (Basic)', 'Flask (Basic)'],
    tools: ['Git & GitHub', 'FFmpeg', 'Docker', 'VS Code', 'Adobe Premiere Pro'],
    softSkills: ['Problem Solving', 'Self-Learning', 'Attention to Detail', 'Creative Thinking']
  },
  experience: [
    {
      role: 'Self-Taught Developer & Automation Engineer',
      organization: 'Freelance / Personal Projects',
      period: '2024 - Present',
      description: 'Building automation tools, web applications, and media processing systems through dedicated self-study and practical projects.',
      technologies: ['Python', 'Web Development', 'Automation', 'Video Editing']
    }
  ],
  education: [
    {
      degree: 'Thanaweya Amma (General Secondary)',
      institution: 'Ministry of Education, Egypt',
      period: 'Currently Studying',
      description: 'Pursuing secondary education while building technical skills through online courses and hands-on projects.'
    }
  ]
}
