const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Club = require('./models/Club'); 

dotenv.config();

// Fix clubs array declaration and add clubKey
const clubs = [
  {
    name: "Organizing Committee",
    instagram: "https://www.instagram.com/oc_kmit",
    description: "The Organising Committee (OC) handles the logistics of all events, workshops, and seminars at KMIT. OC collaborates with the PR team and all clubs to schedule venues and manage event timelines.",
    teamHeads: [
      { name: "YALAVARTHI NIKITHA", rollNumber: "22BD1A05K2", designation: "HEAD OF OC" },
      { name: "TANISH DHARIWAL", rollNumber: "22BD1A661U", designation: "SIC OF OC" },
      { name: "LAKSH VIJAYVARGIYA", rollNumber: "22BD1A050X", designation: "MEMBER OF OC" },
      { name: "ATHARVA AMIT DESHPANDE", rollNumber: "22BD1A05A8", designation: "MEMBER OF OC" },
      { name: "VAESHNAVI", rollNumber: "22BD1A05D1", designation: "MEMBER OF OC" },
      { name: "SUMAIYA", rollNumber: "22BD1A059K", designation: "MEMBER OF OC" },
      { name: "SREE VIBHA P", rollNumber: "22BD1A051Q", designation: "MEMBER OF OC" },
      { name: "SHAILESH PENTUKER", rollNumber: "22BD1A663J", designation: "MEMBER OF OC" }
    ],
    eventsConducted: [
      "KMIT- Saanjh'25", "Patang Utsav", "NAVRAAS - October 2024", "Engineers's Day - September 13th"
    ],
    upcomingEvents: [],
    clubKey: "OC12345"
  },
  {
    name: "Public Relations",
    instagram: "https://www.instagram.com/pr_kmit",
    description: "The Public Relations (PR) team manages KMIT's brand, communication, social media, marketing campaigns, and press releases.",
    teamHeads: [
      { name: "K RISHI MOHAN", rollNumber: "22BD1A0551", designation: "HEAD OF PR" },
      { name: "SREEKRUTHI N", rollNumber: "22BD1A12B5", designation: "SIC OF PR" },
      { name: "AKSHAYA POTHANI", rollNumber: "22BD1A057G", designation: "DOCUMENTATION INCHARGE" },
      { name: "VARDAAN BHATIA", rollNumber: "22BD1A01263", designation: "GRAPHIC DESIGNER" },
      { name: "NITHYA REDDY", rollNumber: "22BD1A059W", designation: "SOCIAL MEDIA HANDLER" },
      { name: "JISHNU ATTANTI", rollNumber: "22BD1A0528", designation: "CONTENT CREATOR" },
      { name: "ADE SANDEEP REDDY", rollNumber: "22BD1A0563", designation: "MEMBER OF PR" }
    ],
    eventsConducted: [],
    upcomingEvents: [],
    clubKey: "PR12346"
  },
  {
    name: "Aakarshan - The Art Club",
    instagram: "https://www.instagram.com/aakarshan_kmit",
    description: "AAKARSHAN encourages visual art exploration and expression. It provides a space to develop joy and meaning in fine arts.",
    teamHeads: [
      { name: "SUJAYEENDRA JOSHI", rollNumber: "21BD1A055R", designation: "SENIOR CLUB HEAD" },
      { name: "ARUN GARIMELLA", rollNumber: "22BD1A660F", designation: "JUNIOR CLUB HEAD" }
    ],
    eventsConducted: [
      "ART CHALLENGE - 10th May 2022", "(DIY) Do it Yourself Series - October 2022", "TENALI RAMA - 17th June 2021", 
      "REPUBLIC DAY - 26th January 2022", "FATHER’S DAY - 20th June 2021", "PRIDE MONTH ART - 18th June 2022",
      "MAKAR SANKRANTI - 15th January 2022", "PIXEL Event - 3rd May 2022", "'ARTISTRY' Art Competition", 
      "Navraas 21 Event - October 2021"
    ],
    upcomingEvents: [
      "DIY Series - February 2023", "VIBGYOR ACTIVITY - December 2022", "Art Competition - September 2023",
      "Aakarshan Stories - May 2023", "Art Series - February 2023", "Art Activity - December 2022"
    ],
    clubKey: "AC12347"
  },
  {
    name: "Aalap - The Music Club",
    instagram: "https://www.instagram.com/aalap_kmit",
    description: "AALAP is KMIT's music club, offering a platform for live performances, collaborations, and exploring the art of sound and music.",
    teamHeads: [
      { name: "K A V KAPARDHI", rollNumber: "21BD1A1224", designation: "SENIOR CLUB HEAD" },
      { name: "JAHNAVI", rollNumber: "22BD1A1225", designation: "JUNIOR CLUB HEAD" }
    ],
    eventsConducted: [
      "Battle of bands - 31st Dec 2022", "IIT Kanpur competition - 9th Jan 2022", "KMIT Pixel - 2nd April 2022",
      "Performance at MGBS metro - 25th June 2022", "Performance at Next Premia Mall - 27th June 2022", 
      "Battle of Bands at MGIT - 1st July 2022", "Comic Gig for Halloween - 31st October 2022"
    ],
    upcomingEvents: [
      "Battle of Bands 2.0", "Aalap x Abhinaya", "Monthly Band Practice", "Retro to Pop Cover",
      "Instagram & YouTube Posts/Reels"
    ],
    clubKey: "MC12348"
  },
  {
    name: "Abhinaya - The Drama Club",
    instagram: "https://www.instagram.com/abhinaya_kmit",
    description: "Abhinaya fosters dramatic expression, story writing, direction, and stage performance. It's a hub for creativity and theatrical arts.",
    teamHeads: [
      { name: "D SUSHANT", rollNumber: "22BD1A6713", designation: "SENIOR CLUB HEAD" },
      { name: "SAI KARTHIK", rollNumber: "22BD1A12B8", designation: "JUNIOR CLUB HEAD" }
    ],
    eventsConducted: [
      "Sankranthi Video - 14 Jan 2022", "Forgotten Heroes Podcast - Jan 2022", "Pixel Skits - 1 Apr 2022",
      "Yoga Day Skit - 18 Jun 2022", "Short Films & Podcasts - Jun to Dec 2022"
    ],
    upcomingEvents: [
      "Event 2.0s", "Collabs with other clubs", "New Podcast Series"
    ],
    clubKey: "DC12349"
  },
  {
    name: "Kaivalya - The Yoga Club",
    instagram: "https://www.instagram.com/kaivalya_kmit",
    description: "Kaivalya teaches the art of yoga, meditation, and mindfulness to help students improve focus, fitness, and inner strength.",
    teamHeads: [
      { name: "Y. SINDHURA CHOWDARY", rollNumber: "20BD1A12B8", designation: "CO-CLUB HEAD" },
      { name: "S. KARTHIK", rollNumber: "20BD1A057G", designation: "CO-CLUB HEAD" }
    ],
    eventsConducted: [
      "Yoga Workshop - 25 Jan 2020", "Suryanamaskaras - 26 Jan 2021", "Darwin X Dasavathara - 1 Apr 2022",
      "Yoga Sadhana - 4 May 2022", "Yoga Workshop on Panic Attacks - 10 Jun 2022", 
      "Yoga Flashmob - 16 Jun 2022", "Yoga Day - 18 Jun 2022"
    ],
    upcomingEvents: [
      "Phases I to VII: Yoga Series (Health, Focus, Personality, Meditation etc.)"
    ],
    clubKey: "YC12350"
  },
  {
    name: "Kmitra",
    instagram: "https://www.instagram.com/kmitra",
    description: "Kmitra is KMIT's monthly magazine covering tech, art, stories, and student opinions, curated by a student editorial team.",
    teamHeads: [
      { name: "SHRIANI REDDY", rollNumber: "22BD1A052J", designation: "REPRESENTATIVE" },
      { name: "ADITYA DONAPATI", rollNumber: "22BD1A052F", designation: "REPRESENTATIVE" }
    ],
    eventsConducted: [],
    upcomingEvents: [],
    clubKey: "KM12351"
  },
  {
    name: "Kreeda - The Sports Club",
    instagram: "https://www.instagram.com/kreeda_kmit",
    description: "Kreeda promotes fitness, sportsmanship, and inter/intra-college tournaments to encourage sports participation among students and faculty.",
    teamHeads: [
      { name: "N HIMA BINDHU", rollNumber: "21BD1A6739", designation: "CO-CLUB HEAD" },
      { name: "SOHAN REDDY", rollNumber: "22BD1A661M", designation: "CO-CLUB HEAD" }
    ],
    eventsConducted: [
      "Recruitments", "Badminton", "Table Tennis", "Basketball", "Volleyball", "Chess", "Throwball", 
      "Inter-class & Intra-college Tournaments"
    ],
    upcomingEvents: [
      "Kabaddi", "Football", "Team Selection", "Sports Fest"
    ],
    clubKey: "SC12352"
  },
  {
    name: "Mudra - The Dance Club",
    instagram: "https://www.instagram.com/mudra_kmit",
    description: "Mudra offers a stage for dance forms, team coordination, flash mobs, Instagram reels and classical + fusion choreography.",
    teamHeads: [
      { name: "VAISHNAVI LANKA", rollNumber: "21BD1A1232", designation: "SENIOR CLUB HEAD" },
      { name: "SRUTHI VOODA", rollNumber: "22BD1A1265", designation: "JUNIOR CLUB HEAD" }
    ],
    eventsConducted: [
      "Dance Covers", "IG Reels", "Flashmobs", "Fusion Forms Series", "Promos for Events"
    ],
    upcomingEvents: [
      "Reel Series", "Dance Covers", "Flashmobs", "Style Demos"
    ],
    clubKey: "MC12353"
  },
  {
    name: "Recurse - The Technical Club",
    instagram: "https://www.instagram.com/recurse_kmit",
    description: "Recurse promotes coding, open-source tools, hackathons, workshops and technical growth in programming and electronics.",
    teamHeads: [
      { name: "KARNATI SAI KRISHNA", rollNumber: "21BD1A050K", designation: "CO-CLUB HEAD" },
      { name: "JAI PARMAR", rollNumber: "22BD1A0517", designation: "CO-CLUB HEAD" }
    ],
    eventsConducted: [
      "Code Sangram", "Treasure Hunt", "Linux/OpenCV Workshop", "Ideathon", "Hackathons"
    ],
    upcomingEvents: [
      "Competitive Coding", "Recurse Website", "Tech Blogs", "Hackathons"
    ],
    clubKey: "TC12354"
  },
  {
    name: "Traces of Lenses - The Photography Club",
    instagram: "https://www.instagram.com/tracesoflenses_kmit",
    description: "Photography club that nurtures budding photographers via workshops, critiques, event coverage and creative challenges.",
    teamHeads: [
      { name: "AMOGH", rollNumber: "21BD1A6648", designation: "CO-CLUB HEAD" },
      { name: "P SUSHANTH REDDY", rollNumber: "22BD1A661C", designation: "CO-CLUB HEAD" }
    ],
    eventsConducted: [
      "Critique Sessions", "Weekly & Monthly Challenges", "Photo Walks", "PIXEL Coverage"
    ],
    upcomingEvents: [
      "Event 2.0s", "Club Collabs"
    ],
    clubKey: "PC12355"
  },
  {
    name: "Vachan - The Speakers' Club",
    instagram: "https://www.instagram.com/vachan_kmit",
    description: "Vachan enhances public speaking and expression skills through debates, podcasts, MUN, and storytelling competitions.",
    teamHeads: [
      { name: "G SHIVA RAM", rollNumber: "23BD1A05CJ", designation: "CO-CLUB HEAD" },
      { name: "RISHIKA JALA", rollNumber: "23BD1A056H", designation: "CO-CLUB HEAD" }
    ],
    eventsConducted: [
      "Picture Perfect", "Debate Competition", "Vachanaire Recruitment"
    ],
    upcomingEvents: [
      "MUN V-Charcha", "Vachan x Kmitra Podcast", "Collab Events"
    ],
    clubKey: "VC12356"
  }
];

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kmitclubhub';
    await mongoose.connect(MONGODB_URI);

    // Transform seed data to match Club schema
    const clubsToInsert = clubs.map((c) => {
      // Map club names to their logo files
      const logoMap = {
        "Organizing Committee": "/assets/club logos/OC-Logo.jpg",
        "Public Relations": "/assets/club logos/PR-Logo.jpg",
        "Aakarshan - The Art Club": "/assets/club logos/Aakarshan-logo.jpg",
        "Aalap - The Music Club": "/assets/club logos/Aalap-Logo.jpg",
        "Abhinaya - The Drama Club": "/assets/club logos/AbhinayaLogo.jpg",
        "Kaivalya - The Yoga Club": "/assets/club logos/Kaivalya-Logo.jpeg",
        "Kmitra": "/assets/club logos/Kmitra-Logo.jpg",
        "Kreeda - The Sports Club": "/assets/club logos/Kreeda-Logo.jpg",
        "Mudra - The Dance Club": "/assets/club logos/Mudra-Logo.jpg",
        "Recurse - The Technical Club": "/assets/club logos/Recurse-Logo.jpg",
        "Traces of Lenses - The Photography Club": "/assets/club logos/TOL-Logo.png",
        "Vachan - The Speakers' Club": "/assets/club logos/Vachan-Logo.jpg"
      };

      return {
        name: c.name,
        description: c.description || '',
        logoUrl: logoMap[c.name] || '',
        category: 'general',
        coordinators: [],
        gallery: [],
        clubKey: c.clubKey || '',
        teamHeads: c.teamHeads || [],
        eventsConducted: c.eventsConducted || [],
        upcomingEvents: c.upcomingEvents || [],
        instagram: c.instagram || ''
      };
    });

    await Club.deleteMany(); // Optional: clears old data
    await Club.insertMany(clubsToInsert);
    console.log("✅ Club data seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
}

seed();
