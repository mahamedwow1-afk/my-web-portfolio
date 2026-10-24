// Single source of truth for portfolio data
export interface Profile {
  name: string
  title: string
  bio: string
  location: string
  avatarUrl: string
  githubUrl: string
  linkedinUrl?: string
  email?: string
  twitterUrl?: string
  resumeUrl?: string
  repos: Repo[]
}

export interface Repo {
  name: string
  description: string
  htmlUrl: string
  language: string | null
  stars: number
  updatedAt: string
}

export const profile: Profile = {
  name: 'Mahamed Yasser',
  title: 'Python Developer & Video Editor',
  bio: 'I am a Python developer and video editor. I build automation tools and tell stories with video.',
  location: 'Qalyubia, Egypt',
  avatarUrl: 'https://avatars.githubusercontent.com/u/225742058?v=4',
  githubUrl: 'https://github.com/mahamedwow1-afk',
  email: 'mahamedwow1@gmail.com',
  repos: [
    {
      name: 'media-organizer-pro',
      description: 'Professional Python automation tool for organizing video, image, and audio files using FFmpeg and machine learning',
      htmlUrl: 'https://github.com/mahamedwow1-afk/media-organizer-pro',
      language: 'Python',
      stars: 1,
      updatedAt: '2026-10-20'
    },
    {
      name: 'Smart-File-Organizer',
      description: 'Professional Python GUI application to organize files into categorized folders automatically with modern interface',
      htmlUrl: 'https://github.com/mahamedwow1-afk/Smart-File-Organizer',
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
      name: 'my-first-app',
      description: 'First Python application - Learning project for OOP, file handling, and UI fundamentals',
      htmlUrl: 'https://github.com/mahamedwow1-afk/my-first-app',
      language: 'CSS',
      stars: 1,
      updatedAt: '2026-10-20'
    }
  ]
}

export const skills = {
  languages: ['Python', 'JavaScript', 'Bash'],
  tools: ['FFmpeg', 'Git', 'Docker', 'Premiere Pro'],
  focus: ['Automation', 'File Handling', 'Video Editing', 'Color Grading']
}
