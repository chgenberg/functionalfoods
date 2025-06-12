"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  FiCalendar, FiClock, FiVideo, FiMessageCircle, FiUser, FiStar,
  FiArrowLeft, FiPhone, FiMail, FiCheckCircle, FiPlus, FiSend
} from "react-icons/fi";
import Image from 'next/image';

const coach = {
    name: 'Ulrika Davidsson',
    title: 'Grundare & Huvudcoach',
    avatar: '/coaches/ulrika.png',
    bio: 'Med över 20 års erfarenhet hjälper Ulrika dig att hitta grundorsaken till dina hälsoproblem och skapa en hållbar livsstil.'
};

const availableSlots = [
  { date: 'Måndag 15/7', time: '10:00' },
  { date: 'Måndag 15/7', time: '14:00' },
  { date: 'Tisdag 16/7', time: '11:00' },
  { date: 'Torsdag 18/7', time: '09:00' },
  { date: 'Torsdag 18/7', time: '13:00' },
  { date: 'Fredag 19/7', time: '10:00' },
];

type Slot = {
  date: string;
  time: string;
};

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState("sessions");
  const [newMessage, setNewMessage] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  // Dummy coaching data
  const coachingProfile = {
    name: "Ulrika Davidsson",
    title: "Certifierad Funktionell Nutrition Coach",
    rating: 4.9,
    experience: "8+ år",
    specialties: ["Hormonell balans", "Tarmhälsa", "Anti-inflammation", "Vikthantering"],
    bio: "Som certifierad funktionell nutritionist hjälper jag dig att optimera din hälsa genom personlig kostanpassning och livsstilsförändringar.",
    image: "/coach-ulrika.jpg"
  };

  const upcomingSessions = [
    {
      id: 1,
      date: "2024-06-15",
      time: "14:00-15:00",
      type: "video",
      topic: "Måltidsplanering för hormonell balans",
      status: "confirmed"
    },
    {
      id: 2,
      date: "2024-06-22", 
      time: "10:00-11:00",
      type: "video",
      topic: "Supplementrådgivning och uppföljning",
      status: "confirmed"
    }
  ];

  const pastSessions = [
    {
      id: 3,
      date: "2024-06-01",
      time: "14:00-15:00", 
      topic: "Introduktion och hälsobedömning",
      rating: 5,
      notes: "Genomgång av mina hälsomål och nuvarande kostvanor"
    },
    {
      id: 4,
      date: "2024-05-25",
      time: "10:00-11:00",
      topic: "Personlig kostplan",
      rating: 5,
      notes: "Fick en skräddarsydd kostplan baserad på mina behov"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "coach",
      message: "Hej Anna! Hur känns det med de nya rutinerna vi pratade om förra veckan?",
      timestamp: "2024-06-10 09:30",
      read: true
    },
    {
      id: 2,
      sender: "user",
      message: "Hej Ulrika! Det går bra, jag har följt måltidsplanen du gav mig. Känner mig redan mer energisk!",
      timestamp: "2024-06-10 10:15",
      read: true
    },
    {
      id: 3,
      sender: "coach", 
      message: "Så roligt att höra! Fortsätt så. Kom ihåg att dricka extra mycket vatten denna vecka.",
      timestamp: "2024-06-10 11:00",
      read: true
    },
    {
      id: 4,
      sender: "user",
      message: "Tack för påminnelsen! Ser fram emot vårt nästa möte på fredag.",
      timestamp: "2024-06-11 08:20",
      read: false
    }
  ];

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Logic to send message would go here
      setNewMessage("");
    }
  };

  const handleBooking = () => {
    if(selectedSlot) {
      setIsBooked(true);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Personlig Coaching</h1>
        <p className="text-gray-600 mt-1">Få skräddarsydda råd och stöd på din hälsoresa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Coach and Booking */}
        <div className="lg:col-span-2 space-y-8">
            {/* Coach Info */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                <Image src={coach.avatar} alt={coach.name} width={150} height={150} className="rounded-full shadow-lg" />
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-800">{coach.name}</h2>
                    <p className="text-primary font-semibold mb-2">{coach.title}</p>
                    <p className="text-gray-600">{coach.bio}</p>
                </div>
            </div>

            {/* Booking Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Boka en session</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {availableSlots.map((slot, index) => (
                        <button 
                            key={index}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-4 rounded-xl text-center border-2 transition-all duration-200 ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time ? 'bg-primary border-primary text-white shadow-lg scale-105' : 'bg-gray-50 border-gray-200 hover:border-primary'}`}
                        >
                            <p className="font-semibold">{slot.date}</p>
                            <p className="text-lg font-bold">{slot.time}</p>
                        </button>
                    ))}
                </div>
                {selectedSlot && !isBooked && (
                     <div className="mt-8 text-center animate-fade-in">
                        <p className="text-gray-700 mb-4">Du har valt: <span className="font-bold text-primary">{`${selectedSlot.date} kl. ${selectedSlot.time}`}</span>. Klicka nedan för att bekräfta.</p>
                        <button onClick={handleBooking} className="btn-primary-lg">
                            Bekräfta bokning
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Right column: Upcoming and Confirmation */}
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Dina bokade sessioner</h3>
                {isBooked && selectedSlot ? (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                            <div className="flex items-center gap-3">
                                <FiCheckCircle className="text-green-600 w-6 h-6" />
                                <div>
                                    <p className="font-bold text-green-800">Bokning bekräftad!</p>
                                    <p className="text-sm text-green-700">{`${selectedSlot.date} kl. ${selectedSlot.time}`}</p>
                                </div>
                            </div>
                            <p className="text-sm text-green-700 mt-2">En kalenderinbjudan har skickats till din e-post.</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Du har inga kommande bokningar.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
       <style jsx global>{`
         .btn-primary-lg {
           @apply bg-primary hover:bg-accent text-white font-bold px-8 py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105;
        }
         @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 