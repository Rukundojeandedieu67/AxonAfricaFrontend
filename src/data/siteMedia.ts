/**
 * Site body media — swap these URLs for real AxonAfrica photos/videos (Cloudinary or /public/media/).
 * Prefer short MP4 (H.264) under ~8MB for mobile networks.
 */
export const siteMedia = {
  home: {
    highlightVideo:
      import.meta.env.VITE_HOME_VIDEO_URL ||
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    highlightPoster: import.meta.env.VITE_HOME_VIDEO_POSTER || '',
    highlightCaption: 'Cohort highlight — replace with real innovator / workspace footage.',
  },
  program: {
    pathwayVideo:
      import.meta.env.VITE_PROGRAM_VIDEO_URL ||
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    pathwayPoster: import.meta.env.VITE_PROGRAM_VIDEO_POSTER || '',
    pathwayCaption: 'How Seed → Plant → Canopy works — replace with program walkthrough.',
  },
  about: {
    storyVideo:
      import.meta.env.VITE_ABOUT_VIDEO_URL ||
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    storyPoster: import.meta.env.VITE_ABOUT_VIDEO_POSTER || '',
    storyCaption: 'Our story — replace with founder / team film.',
  },
  stories: {
    featuredVideo:
      import.meta.env.VITE_STORIES_VIDEO_URL ||
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    featuredPoster: import.meta.env.VITE_STORIES_VIDEO_POSTER || '',
    workspaceImage: import.meta.env.VITE_STORIES_IMAGE_URL || '',
  },
  innovators: {
    introVideo: import.meta.env.VITE_INNOVATORS_VIDEO_URL || '',
  },
} as const
