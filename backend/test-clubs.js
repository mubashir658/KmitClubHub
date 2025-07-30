const mongoose = require('mongoose');
const Club = require('./models/Club');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kmit-club-hub')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const sampleClub = {
  name: "Aalap - The Music Club",
  logoUrl: "/assets/club logos/Aalap-Logo.jpg",
  description: "The first club formed in KMIT, AALAP – The Music Club of KMIT visions in exploring the various new aspects of music, as the tagline says #EXPLORE YOURSELF. AALAP provides the right platform to all music aspirants and enthusiasts in not only showcasing their talent, but to also explore, innovate and implement such ideas. From live performances and interactive jams to online collaborations, AALAP loves to take challenges and expand its wings, reach out to more and more people and keep entertaining them in the World of Music.",
  instagramLink: "https://instagram.com/aalapkmit",
  teamHeads: [
    {
      name: "K A V Kapardhi",
      rollNumber: "21BD1A1224",
      designation: "Senior Club Head"
    },
    {
      name: "Jahnavi",
      rollNumber: "22BD1A1225",
      designation: "Junior Club Head"
    }
  ],
  eventsConducted: [
    "Battle of bands - 31st Dec 2022",
    "IIT Kanpur competition at Moonshine Project - 9th January 2022",
    "KMIT pixel - 2nd April 2022",
    "Aalap's performance at MGBS metro station - 25th June 2022",
    "AALAP's performance at Next Premia Mall, Irrummanzil - 27th June 2022",
    "Battle of bands in MGIT - 1st July 2022",
    "Comic social gig for Halloween - 31st October 2022"
  ],
  upcomingEvents: [
    "Battle of Bands 2.0",
    "Aalap x Abhinaya",
    "Monthly Band Practice",
    "Retro to Pop Cover",
    "Instagram and YouTube Posts and Reels"
  ]
};

async function insertSampleClub() {
  try {
    // Clear existing clubs with the same name
    await Club.deleteOne({ name: sampleClub.name });
    
    // Insert new club
    const club = new Club(sampleClub);
    const savedClub = await club.save();
    
    console.log('✅ Sample club inserted successfully!');
    console.log('Club ID:', savedClub._id);
    console.log('You can now test the club detail page at: /clubs/' + savedClub._id);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error inserting sample club:', error);
    mongoose.connection.close();
  }
}

insertSampleClub(); 