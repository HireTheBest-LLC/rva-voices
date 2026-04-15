export interface Story {
  id: string;
  title: string;
  author: string;
  neighborhood: string;
  lat: number;
  lng: number;
  excerpt: string;
  type: "photo" | "video" | "voice" | "text";
  theme: string;
  date: string;
  imageUrl?: string;
  audioUrl?: string;
  consentGiven: boolean;
  sourceAttribution?: string;
  featured?: boolean;
  youtubeUrl?: string;
}

export const sampleStories: Story[] = [
  {
    id: "featured-1",
    title: "RVA Legacy Map — Featured Story",
    author: "Vicktoria AI",
    neighborhood: "The Fan",
    lat: 37.5537,
    lng: -77.4742,
    excerpt: "Discover the stories, history, and legacy of Richmond, Virginia through the voices of the people who shaped it. This featured video introduces the RVA Legacy Map project and its mission to preserve and amplify the lived experiences of Richmond residents.",
    type: "video",
    theme: "Arts & Culture",
    date: "2026-03-28",
    consentGiven: true,
    featured: true,
    youtubeUrl: "https://www.youtube.com/embed/XketKSx_ovs",
  },
  // {
  //   id: "1",
  //   title: "Growing Up on 2nd Street in Jackson Ward",
  //   author: "Margaret T.",
  //   neighborhood: "Jackson Ward",
  //   lat: 37.5485,
  //   lng: -77.4365,
  //   excerpt: "I remember the Hippodrome Theatre on a Saturday night — you could hear the music from three blocks away. My grandmother would take us to get ice cream after church, and the whole neighborhood felt like family.",
  //   type: "voice",
  //   theme: "Community Life",
  //   date: "2026-03-15",
  //   imageUrl: "https://images.unsplash.com/photo-1655324330958-8404961d8ebb?w=1080&q=80&auto=format",
  //   consentGiven: true,
  // },
  // {
  //   id: "2",
  //   title: "The Day They Demolished Fulton",
  //   author: "James W.",
  //   neighborhood: "Fulton",
  //   lat: 37.5265,
  //   lng: -77.4075,
  //   excerpt: "We didn't have much warning. One day they told us we had to leave, and the bulldozers came not long after. I was twelve. I still dream about our front porch.",
  //   type: "voice",
  //   theme: "Displacement & Change",
  //   date: "2026-03-10",
  //   imageUrl: "https://images.unsplash.com/photo-1578680142744-5884c3d7f350?w=1080&q=80&auto=format",
  //   consentGiven: true,
  //   sourceAttribution: "Inspired by Historic Fulton Oral History Project — VCU Libraries (copyright The Valentine)",
  // },
  {
    id: "3",
    title: "My Father's Barbershop on Broad Street",
    author: "Denise R.",
    neighborhood: "Church Hill",
    lat: 37.5335,
    lng: -77.4145,
    excerpt: "Daddy's barbershop was where everyone came to talk politics, sports, and life. He cut hair for three generations of men in this neighborhood. The shop is gone now, but the stories live on.",
    type: "photo",
    theme: "Family Heritage",
    date: "2026-03-12",
    imageUrl: "https://images.unsplash.com/photo-1616970463449-12b603a61622?w=1080&q=80&auto=format",
    consentGiven: true,
  },
  {
    id: "4",
    title: "Walking to School Through Carver",
    author: "William H.",
    neighborhood: "Carver",
    lat: 37.5565,
    lng: -77.4465,
    excerpt: "Every morning we walked past the same houses, past Mrs. Johnson's garden, past the corner store. The whole community looked out for us kids. You couldn't get into trouble because somebody's mama was always watching.",
    type: "text",
    theme: "Community Life",
    date: "2026-03-08",
    consentGiven: true,
    sourceAttribution: "Inspired by Carver-VCU Partnership Oral History Collection — VCU Libraries",
  },
  // {
  //   id: "5",
  //   title: "The Flood of '72 in Shockoe Bottom",
  //   author: "Patricia M.",
  //   neighborhood: "Shockoe Bottom",
  //   lat: 37.5345,
  //   lng: -77.4275,
  //   excerpt: "The water came up so fast. We lost everything in our first-floor apartment. But what I remember most is how the neighbors helped each other. People opened their doors to strangers.",
  //   type: "photo",
  //   theme: "Resilience",
  //   date: "2026-02-28",
  //   imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&q=80&auto=format",
  //   consentGiven: true,
  // },
  // {
  //   id: "6",
  //   title: "Music on the Corner in Oregon Hill",
  //   author: "Carlos V.",
  //   neighborhood: "Oregon Hill",
  //   lat: 37.5365,
  //   lng: -77.4505,
  //   excerpt: "We'd sit on the stoop and play guitar until the streetlights came on. The whole block was our audience. That's where I learned that music doesn't need a stage — it just needs people who listen.",
  //   type: "voice",
  //   theme: "Arts & Culture",
  //   date: "2026-03-20",
  //   imageUrl: "https://images.unsplash.com/photo-1555069855-e580a9adbf43?w=1080&q=80&auto=format",
  //   consentGiven: true,
  // },
  {
    id: "7",
    title: "Grandmother's Garden in Randolph",
    author: "Aisha K.",
    neighborhood: "Randolph",
    lat: 37.5225,
    lng: -77.4575,
    excerpt: "My grandmother kept the most beautiful garden on the block. Collard greens, tomatoes, and sunflowers taller than me. She said the garden was her way of keeping the South Carolina soil close.",
    type: "photo",
    theme: "Family Heritage",
    date: "2026-03-18",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1080&q=80&auto=format",
    consentGiven: true,
  },
  // {
  //   id: "8",
  //   title: "StoryCorps: One Small Step Conversation",
  //   author: "Library of Virginia Participants",
  //   neighborhood: "Downtown",
  //   lat: 37.5395,
  //   lng: -77.4335,
  //   excerpt: "Through the One Small Step initiative, Richmond residents with different political views sat down for meaningful conversations at the Library of Virginia. Over 500 conversations were recorded.",
  //   type: "voice",
  //   theme: "Civic Dialogue",
  //   date: "2023-10-15",
  //   consentGiven: true,
  //   sourceAttribution: "StoryCorps One Small Step — Richmond Model Community (archive.storycorps.org)",
  // },
];

export const neighborhoods = [
  { name: "Jackson Ward", lat: 37.5485, lng: -77.4365, description: "Historic African American cultural and economic hub, 'Black Wall Street of America'" },
  { name: "Church Hill", lat: 37.5335, lng: -77.4145, description: "One of Richmond's oldest neighborhoods, home to St. John's Church" },
  { name: "Fulton", lat: 37.5265, lng: -77.4075, description: "Historic African American neighborhood, largely demolished in urban renewal" },
  { name: "Carver", lat: 37.5565, lng: -77.4465, description: "Community adjacent to VCU with deep residential roots" },
  { name: "Shockoe Bottom", lat: 37.5345, lng: -77.4275, description: "Richmond's oldest commercial district, site of enslaved persons trade" },
  { name: "Oregon Hill", lat: 37.5365, lng: -77.4505, description: "Working-class neighborhood with panoramic views of the James River" },
  { name: "Randolph", lat: 37.5225, lng: -77.4575, description: "South Richmond neighborhood with strong community ties" },
  { name: "Downtown", lat: 37.5395, lng: -77.4335, description: "Richmond's civic and business center" },
  { name: "The Fan", lat: 37.5535, lng: -77.4635, description: "Tree-lined streets with Victorian and Edwardian row houses" },
  { name: "Scott's Addition", lat: 37.5615, lng: -77.4575, description: "Former industrial area turned arts and brewery district" },
];

export const themes = [
  "Community Life",
  "Displacement & Change",
  "Family Heritage",
  "Resilience",
  "Arts & Culture",
  "Civic Dialogue",
  "Civil Rights",
  "Food & Traditions",
];
