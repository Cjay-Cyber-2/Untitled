/**
 * ─────────────────────────────────────────────────────────────
 *  UNTITLED — all site content lives in this one file.
 *  Everything marked PLACEHOLDER is safe to replace.
 *  Photos: drop files into /public/images and set `photo: '/images/ada.jpg'`.
 * ─────────────────────────────────────────────────────────────
 */

export type ColorKey = 'lime' | 'apricot' | 'lilac' | 'blush' | 'sky' | 'butter';
export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'x' | 'threads' | 'linkedin' | 'github' | 'behance' | 'dribbble' | 'website';
export type Status = 'Shipped' | 'In progress' | 'Paused' | 'Idea';

export const palette: Record<ColorKey, string> = {
  lime: '#D4FF4F',
  apricot: '#FF8C69',
  lilac: '#C7B3FF',
  blush: '#FFB8C6',
  sky: '#9FD8FF',
  butter: '#FFE27A',
};

export interface Member {
  slug: string;
  first: string;
  last: string;
  color: ColorKey;
  role: string;
  campus: string;
  oneLiner: string;
  bio: string;
  madeOf: [string, string, string];
  status: string;
  error: string;
  fact: string;
  learning: string;
  skills: string[];
  openTo: string[];
  photo: string | null;
  email: string;
  socials: Partial<Record<Platform, string>>;
}

export interface Project {
  slug: string;
  name: string;
  line: string;
  problem: string;
  stack: string[];
  status: Status;
  year: string;
  /** member slugs; for group projects pair each with what they did */
  team: { who: string; did: string }[];
  links: { live?: string; code?: string; video?: string };
  image: string | null;
  color: ColorKey;
  /** one behind-the-scenes line, shown as a sticky comment */
  note: string;
}

export interface Drop {
  title: string;
  platform: Platform;
  url: string;
  who: string; // member slug or 'all'
  views: string;
  thumb: string | null;
  vertical: boolean;
}

/* ───────────── GROUP ───────────── */

export const site = {
  name: 'Untitled',
  tagline: 'Six builders. One blank page. Building everything in public.',
  description:
    'Untitled is six Learn2Earn fellows building apps, sites and experiments in public. See what we make together, what we make alone, and follow along.',
  email: 'hello@untitled.placeholder', // PLACEHOLDER
  city: 'Lagos, Nigeria',
  since: '2026',
  totalFollowers: 12480, // PLACEHOLDER: sum of all platforms, used by the counter
  socials: [
    // PLACEHOLDER handles, links and counts
    { platform: 'youtube', handle: '@untitled.builds', url: 'https://youtube.com/', followers: '2.1K', label: 'Build vlogs' },
    { platform: 'tiktok', handle: '@untitled.builds', url: 'https://tiktok.com/', followers: '5.4K', label: 'Daily chaos' },
    { platform: 'instagram', handle: '@untitled.builds', url: 'https://instagram.com/', followers: '2.8K', label: 'Reels + BTS' },
    { platform: 'x', handle: '@untitledbuilds', url: 'https://x.com/', followers: '1.1K', label: 'Build logs' },
    { platform: 'threads', handle: '@untitled.builds', url: 'https://threads.net/', followers: '640', label: 'Thoughts' },
    { platform: 'github', handle: 'untitled-builds', url: 'https://github.com/', followers: '120', label: 'The code' },
  ] as { platform: Platform; handle: string; url: string; followers: string; label: string }[],
};

/* ───────────── THE SIX ───────────── */

export const members: Member[] = [
  {
    slug: 'ada',
    first: 'Ada', // PLACEHOLDER
    last: 'Placeholder',
    color: 'lime',
    role: 'Frontend developer',
    campus: 'Lagos',
    oneLiner: 'I make buttons feel good to press.',
    bio: 'I build interfaces that people actually enjoy using. I got into code by redesigning my church website without asking anyone, and I have been fixing other people’s UIs ever since. Right now I am obsessed with motion, accessibility and shipping small things fast.',
    madeOf: ['TypeScript', 'jollof', 'unearned confidence'],
    status: 'fighting CSS, currently losing',
    error: '404: sleep not found',
    fact: 'Once fixed a production bug from inside a danfo, on 2% battery.',
    learning: 'WebGL shaders',
    skills: ['React', 'TypeScript', 'GSAP', 'Figma', 'Astro', 'Tailwind'],
    openTo: ['Internships', 'Freelance', 'Collabs'],
    photo: null,
    email: 'ada@untitled.placeholder',
    socials: { x: 'https://x.com/', instagram: 'https://instagram.com/', github: 'https://github.com/', linkedin: 'https://linkedin.com/' },
  },
  {
    slug: 'tobi',
    first: 'Tobi', // PLACEHOLDER
    last: 'Placeholder',
    color: 'apricot',
    role: 'Backend developer',
    campus: 'Lagos',
    oneLiner: 'If it is slow, I have probably already rewritten it.',
    bio: 'I like the parts of software nobody sees: databases, queues, APIs that do not fall over. I started with Python scripts to automate my mum’s shop inventory. These days I build the engines behind our projects and complain about latency for fun.',
    madeOf: ['Go', 'cold zobo', 'strong opinions'],
    status: 'deploying on a Friday (again)',
    error: '500: it works on my machine',
    fact: 'Can recite the full menu of every buka within 2km of campus.',
    learning: 'Distributed systems',
    skills: ['Go', 'Node.js', 'PostgreSQL', 'Docker', 'Redis', 'Python'],
    openTo: ['Internships', 'Full-time', 'Collabs'],
    photo: null,
    email: 'tobi@untitled.placeholder',
    socials: { x: 'https://x.com/', github: 'https://github.com/', linkedin: 'https://linkedin.com/' },
  },
  {
    slug: 'zara',
    first: 'Zara', // PLACEHOLDER
    last: 'Placeholder',
    color: 'lilac',
    role: 'Product designer',
    campus: 'Abuja',
    oneLiner: 'I draw it first, then argue about it.',
    bio: 'I design products from the first sketch to the last pixel, and I code enough to be dangerous. I came into tech through graphic design and fell in love with user research. I care about products that feel obvious, even when they were hard to make.',
    madeOf: ['Figma', 'sticky notes', 'too many tabs'],
    status: 'moving a box 2px to the left',
    error: 'Warning: kerning detected',
    fact: 'Has 3,000+ screenshots of “nice buttons” saved on their phone.',
    learning: '3D in the browser',
    skills: ['Figma', 'UX research', 'Prototyping', 'Framer', 'HTML/CSS', 'Branding'],
    openTo: ['Freelance', 'Internships', 'Speaking'],
    photo: null,
    email: 'zara@untitled.placeholder',
    socials: { instagram: 'https://instagram.com/', dribbble: 'https://dribbble.com/', behance: 'https://behance.net/', linkedin: 'https://linkedin.com/' },
  },
  {
    slug: 'kemi',
    first: 'Kemi', // PLACEHOLDER
    last: 'Placeholder',
    color: 'blush',
    role: 'Content lead + developer',
    campus: 'Ilorin',
    oneLiner: 'I build things, then make you watch me build them.',
    bio: 'I am the reason our phones are always recording. I write code and I tell the story of the code, so more people see what we are building. I started making tech videos to explain things to my younger siblings and accidentally got good at it.',
    madeOf: ['CapCut', 'JavaScript', 'main character energy'],
    status: 'editing the same 8 seconds',
    error: 'Error: ring light overheated',
    fact: 'Has filmed every single team meeting. There is footage. Lots of it.',
    learning: 'Motion design',
    skills: ['JavaScript', 'Content strategy', 'Video editing', 'React', 'Copywriting', 'Notion'],
    openTo: ['Collabs', 'Brand deals', 'Freelance'],
    photo: null,
    email: 'kemi@untitled.placeholder',
    socials: { tiktok: 'https://tiktok.com/', instagram: 'https://instagram.com/', youtube: 'https://youtube.com/', x: 'https://x.com/' },
  },
  {
    slug: 'femi',
    first: 'Femi', // PLACEHOLDER
    last: 'Placeholder',
    color: 'sky',
    role: 'Mobile developer',
    campus: 'Lagos',
    oneLiner: 'Your app, but it works offline.',
    bio: 'I build mobile apps that survive bad network, old phones and impatient users, which is to say, apps for Nigeria. I started by modding games on my first Android phone. Now I ship cross-platform apps and I test everything on the cheapest phone I can find.',
    madeOf: ['Flutter', 'puff-puff', 'battery saver mode'],
    status: 'waiting for Gradle. Still.',
    error: 'Timeout: NEPA took light',
    fact: 'Owns four phones. Uses five.',
    learning: 'Kotlin Multiplatform',
    skills: ['Flutter', 'Dart', 'Firebase', 'Kotlin', 'React Native', 'SQLite'],
    openTo: ['Internships', 'Freelance', 'Full-time'],
    photo: null,
    email: 'femi@untitled.placeholder',
    socials: { x: 'https://x.com/', github: 'https://github.com/', linkedin: 'https://linkedin.com/' },
  },
  {
    slug: 'ngozi',
    first: 'Ngozi', // PLACEHOLDER
    last: 'Placeholder',
    color: 'butter',
    role: 'Data + AI developer',
    campus: 'Abuja',
    oneLiner: 'I teach computers to guess better than me.',
    bio: 'I work with data and AI to turn messy information into decisions. I got into tech through a statistics class I almost dropped. Now I build models, dashboards and small AI tools, and I am the one who asks “but what does the data say?” in every argument.',
    madeOf: ['Python', 'chin chin', 'confidence intervals'],
    status: 'training a model, training patience',
    error: 'ValueError: vibes not numeric',
    fact: 'Kept a spreadsheet of every name the group rejected. With charts.',
    learning: 'LLM evaluation',
    skills: ['Python', 'Pandas', 'SQL', 'PyTorch', 'Streamlit', 'Power BI'],
    openTo: ['Internships', 'Research', 'Collabs'],
    photo: null,
    email: 'ngozi@untitled.placeholder',
    socials: { x: 'https://x.com/', github: 'https://github.com/', linkedin: 'https://linkedin.com/' },
  },
];

/* ───────────── BUILT TOGETHER ───────────── */

export const groupProjects: Project[] = [
  {
    slug: 'danfo',
    name: 'Danfo',
    line: 'Live bus routes and fares for Lagos, crowdsourced by riders.',
    problem: 'Nobody knows the real fare until the conductor says it.',
    stack: ['Flutter', 'Go', 'PostgreSQL', 'Mapbox'],
    status: 'In progress',
    year: '2026',
    team: [
      { who: 'femi', did: 'Mobile app' },
      { who: 'tobi', did: 'API + data' },
      { who: 'zara', did: 'Design' },
    ],
    links: { live: '#', code: '#', video: '#' },
    image: null,
    color: 'butter',
    note: 'who put “Oshodi” in the wrong state 😭',
  },
  {
    slug: 'pidgin-gpt',
    name: 'Abeg AI',
    line: 'A study buddy that explains hard topics in plain Pidgin.',
    problem: 'Textbook English makes simple ideas feel impossible.',
    stack: ['Python', 'React', 'FastAPI', 'LLMs'],
    status: 'Shipped',
    year: '2026',
    team: [
      { who: 'ngozi', did: 'Model + prompts' },
      { who: 'ada', did: 'Frontend' },
      { who: 'kemi', did: 'Launch content' },
    ],
    links: { live: '#', code: '#', video: '#' },
    image: null,
    color: 'lilac',
    note: 'ship it. SHIP IT.',
  },
  {
    slug: 'owambe',
    name: 'Owambe OS',
    line: 'Plan the party, split the aso-ebi bill, track the RSVPs.',
    problem: 'Event planning lives in 14 WhatsApp groups.',
    stack: ['Next.js', 'Supabase', 'Paystack'],
    status: 'Shipped',
    year: '2026',
    team: [
      { who: 'ada', did: 'Frontend' },
      { who: 'tobi', did: 'Payments' },
      { who: 'zara', did: 'Brand + UI' },
    ],
    links: { live: '#', code: '#' },
    image: null,
    color: 'blush',
    note: 'make the logo bigger (no)',
  },
  {
    slug: 'this-site',
    name: 'This website',
    line: 'Six cursors, one blank page. You are looking at it.',
    problem: 'We needed one place to show everything we build.',
    stack: ['Astro', 'GSAP', 'Lenis'],
    status: 'In progress',
    year: '2026',
    team: [
      { who: 'zara', did: 'Concept + design' },
      { who: 'ada', did: 'Animation' },
      { who: 'kemi', did: 'Copy' },
    ],
    links: { code: '#' },
    image: null,
    color: 'lime',
    note: 'still untitled btw',
  },
];

/* ───────────── BUILT ALONE ───────────── */

export const soloProjects: Project[] = [
  { slug: 'gradient-lab', name: 'Gradient Lab', line: 'Grainy gradient generator for designers.', problem: '', stack: ['React', 'Canvas'], status: 'Shipped', year: '2026', team: [{ who: 'ada', did: 'Everything' }], links: { live: '#', code: '#' }, image: null, color: 'lime', note: '' },
  { slug: 'queue-lite', name: 'QueueLite', line: 'A tiny job queue for small servers.', problem: '', stack: ['Go', 'Redis'], status: 'Shipped', year: '2026', team: [{ who: 'tobi', did: 'Everything' }], links: { code: '#' }, image: null, color: 'apricot', note: '' },
  { slug: 'type-scale', name: 'Afro Type Specimens', line: 'Type specimens inspired by Lagos signage.', problem: '', stack: ['Figma', 'Framer'], status: 'In progress', year: '2026', team: [{ who: 'zara', did: 'Everything' }], links: { live: '#' }, image: null, color: 'lilac', note: '' },
  { slug: 'clip-cutter', name: 'ClipCutter', line: 'Turns long screen recordings into short clips.', problem: '', stack: ['JavaScript', 'FFmpeg'], status: 'In progress', year: '2026', team: [{ who: 'kemi', did: 'Everything' }], links: { code: '#', video: '#' }, image: null, color: 'blush', note: '' },
  { slug: 'nepa-alert', name: 'NEPA Alert', line: 'Power outage tracker for your street.', problem: '', stack: ['Flutter', 'Firebase'], status: 'Shipped', year: '2026', team: [{ who: 'femi', did: 'Everything' }], links: { live: '#', code: '#' }, image: null, color: 'sky', note: '' },
  { slug: 'naira-watch', name: 'Naira Watch', line: 'Daily exchange-rate dashboard with forecasts.', problem: '', stack: ['Python', 'Streamlit'], status: 'Shipped', year: '2026', team: [{ who: 'ngozi', did: 'Everything' }], links: { live: '#', code: '#' }, image: null, color: 'butter', note: '' },
  { slug: 'micro-motion', name: 'Micro Motion', line: 'A library of copy-paste UI animations.', problem: '', stack: ['CSS', 'GSAP'], status: 'Idea', year: '2026', team: [{ who: 'ada', did: 'Everything' }], links: {}, image: null, color: 'lime', note: '' },
  { slug: 'bukafinder', name: 'BukaFinder', line: 'Find the nearest buka that is actually open.', problem: '', stack: ['Node.js', 'Maps API'], status: 'Paused', year: '2026', team: [{ who: 'tobi', did: 'Everything' }], links: { code: '#' }, image: null, color: 'apricot', note: '' },
];

/* ───────────── BUILDING IN PUBLIC ───────────── */

export const drops: Drop[] = [
  // PLACEHOLDER: your latest videos and posts. `thumb` takes an image path.
  { title: 'We built an app in 48 hours', platform: 'youtube', url: '#', who: 'all', views: '12K views', thumb: null, vertical: false },
  { title: 'POV: the deploy failed at 3am', platform: 'tiktok', url: '#', who: 'tobi', views: '48K views', thumb: null, vertical: true },
  { title: 'Day in the life of a Learn2Earn fellow', platform: 'instagram', url: '#', who: 'kemi', views: '9.2K views', thumb: null, vertical: true },
  { title: 'Rating each other’s code (it got personal)', platform: 'youtube', url: '#', who: 'all', views: '6.7K views', thumb: null, vertical: false },
  { title: 'Designing a logo for a group with no name', platform: 'tiktok', url: '#', who: 'zara', views: '21K views', thumb: null, vertical: true },
  { title: 'I tested our app on a ₦30k phone', platform: 'instagram', url: '#', who: 'femi', views: '15K views', thumb: null, vertical: true },
  { title: 'Teaching AI to speak Pidgin', platform: 'youtube', url: '#', who: 'ngozi', views: '8.1K views', thumb: null, vertical: false },
  { title: 'Six people, one bug, zero sleep', platform: 'tiktok', url: '#', who: 'all', views: '33K views', thumb: null, vertical: true },
];

export const notifications = [
  { icon: '♥', text: '<b>@tolu.dev</b> and 214 others liked your video' },
  { icon: '+', text: '<b>@lagos.tech</b> started following you' },
  { icon: '▶', text: 'Your video passed <b>10,000 views</b>' },
  { icon: '✦', text: 'You are trending in <b>Lagos</b>' },
];

/* ───────────── WHERE WE CAME FROM ───────────── */

export const journey = [
  { tag: 'Level 01', title: 'Apply', text: 'No CV. An email, an ID check and a lot of hope.' },
  { tag: 'Level 02', title: 'The memory game', text: 'A memory test on our phones. Palms sweating.' },
  { tag: 'Level 03', title: 'The puzzle', text: 'A problem-solving challenge built to see how we think.' },
  { tag: 'Level 04', title: '26-day trial', text: 'Bootcamp mode. Learn, build, repeat, sleep sometimes.' },
  { tag: 'Boss level', title: 'Fellowship', text: 'Admitted. Peer-led learning with hundreds of fellows across Nigeria.' },
  { tag: 'Checkpoint', title: 'We found each other', text: 'Six people, one project, zero name ideas.' }, // PLACEHOLDER
  { tag: 'Now', title: 'Building in public', text: 'Which is why you are here.' },
];

/* ───────────── NAME GRAVEYARD ───────────── */

export const rejectedNames = [
  // PLACEHOLDER: real rejected names, who suggested them, how they died
  { name: 'The Six', by: 'tobi', cause: 'killed by a 4–2 vote' },
  { name: '404 Name Not Found', by: 'ada', cause: 'too long for a logo' },
  { name: 'Group Chat (6)', by: 'kemi', cause: 'sounded like spam' },
  { name: 'Hexa', by: 'zara', cause: 'already a crypto coin' },
  { name: 'Lagos Avengers', by: 'femi', cause: 'two of us are in Abuja' },
  { name: 'Null & Void', by: 'ngozi', cause: 'too dark, apparently' },
];

/* ───────────── HELPERS ───────────── */

export const memberBySlug = (slug: string) => members.find((m) => m.slug === slug)!;
export const fullName = (m: Member) => `${m.first} ${m.last}`;
export const projectsFor = (slug: string) => ({
  solo: soloProjects.filter((p) => p.team.some((t) => t.who === slug)),
  group: groupProjects.filter((p) => p.team.some((t) => t.who === slug)),
});
