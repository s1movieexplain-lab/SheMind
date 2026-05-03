import { Module } from './types';

export const APP_ID = 'shemind-app';

export const ETHICAL_DISCLAIMER = {
  en: "Every individual is different. These lessons provide psychological patterns and general understanding, but always prioritize personal boundaries and mutual respect.",
  hi: "Har vyakti alag hota hai. Yeh paath manovigyanik patterns aur samanya samajh pradan karte hain, lekin hamesha vyaktigat simao aur aapsi samman ko prathmikta dein.",
  bn: "প্রতিটি মানুষ আলাদা। এই পাঠগুলো মনস্তাত্ত্বিক প্যাটার্ন এবং সাধারণ ধারণা প্রদান করে, তবে সর্বদা ব্যক্তিগত সীমানা এবং পারস্পরিক সম্মানকে অগ্রাধিকার দিন।"
};

export const INITIAL_MODULES: Module[] = [
  {
    id: 'eq-basics',
    title: 'The Foundation of EQ',
    titleHi: 'Emotional Intelligence ke Basics',
    icon: 'Brain',
    description: 'Understanding the core of emotional connection and empathy.',
    lessons: [
      {
        id: 'eq-1',
        title: 'Empathy over Solutions',
        titleHi: 'Samadhan se upar Hamdardee',
        titleBn: 'সমাধানের আগে সহানুভূতি',
        duration: '2:15',
        category: 'Emotions',
        content: {
          en: "Often, when a woman shares a problem, she is seeking emotional validation rather than a quick fix. Empathy means feeling with her, not just for her.",
          hi: "Aksar, jab ek mahila apni samasya sajha karti hai, toh woh samadhan ke bajaye bhavnatmak samarthan talash rahi hoti hai.",
          bn: "প্রায়শই, যখন কোনও নারী কোনো সমস্যার কথা শেয়ার করেন, তিনি দ্রুত সমাধানের চেয়ে মানসিক সমর্থনের বেশি খোঁজ করেন।"
        },
        scenario: {
          en: "She shares a tough day at work. You immediately offer 3 ways to fix her boss's behavior.",
          hi: "Usne kaam par ek mushkil din ke baare mein bataya. Aapne turant uske boss ke vyavhar ko theek karne ke 3 tareeke bataye.",
          bn: "তিনি কর্মক্ষেত্রে একটি কঠিন দিনের কথা বলছেন। আপনি তৎক্ষণাৎ তার বসের আচরণ ঠিক করার ৩টি উপায় বলতে শুরু করলেন।"
        },
        tips: {
          do: ["Listen first", "Validate feelings", "Ask: Do you want to vent or solve?"],
          dont: ["Interrupt with solutions", "Minimize the problem", "Compare it to your day"]
        },
        recap: {
          en: "Validation is the first step to emotional safety.",
          hi: "Bhavnatmak suraksha ke liye manyata pehla kadam hai.",
          bn: "মানসিক নিরাপত্তার জন্য স্বীকৃতি হল প্রথম ধাপ।"
        }
      },
      {
        id: 'eq-2',
        title: 'Emotional Self-Regulation',
        titleHi: 'Bhavnatmak Swam-Niyantran',
        titleBn: 'মানসিক আত্ম-নিয়ন্ত্রণ',
        duration: '2:40',
        category: 'Emotions',
        content: {
          en: "Before you can support her, you must understand your own triggers. Self-regulation isn't about suppressing feelings, but managing them so they don't harm the connection.",
          hi: "Uski madad karne se pehle, aapko apne gusse ya chidchidapan ke kashakon ko samajhna hoga. Swam-niyantran ka matlab bhavnaon ko dabana nahi, balki unhe aise sambhalna hai ki ve rishte ko nuksan na pahunchayein.",
          bn: "অন্যকে সাহায্য করার আগে আপনার নিজের অনুভূতিগুলো বুঝতে হবে। আত্ম-নিয়ন্ত্রণ মানে অনুভূতি চেপে রাখা নয়, বরং সেগুলোকে এমনভাবে পরিচালনা করা যাতে সম্পর্কের ক্ষতি না হয়।"
        },
        scenario: {
          en: "You get defensive and raise your voice when she points out a mistake.",
          hi: "Jab woh koi galti batati hai, toh aap apne bachav mein bolne lagte hain aur chilla dete hain.",
          bn: "যখন তিনি কোনো ভুলের কথা বলেন, তখন আপনি রেগে যান এবং চিৎকার শুরু করেন।"
        },
        tips: {
          do: ["Take a deep breath and pause", "Admit when you're feeling reactive", "Listen without defending"],
          dont: ["Shout or blame", "Shut down emotionally", "Deflect with your own complaints"]
        },
        recap: {
          en: "Cool heads build warm hearts.",
          hi: "Thanda dimaag garm dil banata hai.",
          bn: "শান্ত মাথা উষ্ণ হৃদয় তৈরি করে।"
        }
      }
    ]
  },
  {
    id: 'communication',
    title: 'Modern Communication',
    titleHi: 'Aadhunik Samvad',
    icon: 'MessageCircle',
    description: 'Clear, respectful, and effective communication styles.',
    lessons: [
      {
        id: 'comm-1',
        title: 'Active Listening',
        titleHi: 'Sactive Sun-na',
        duration: '1:50',
        category: 'Communication',
        content: {
          en: "Active listening involves being fully present. It's not just about waiting for your turn to speak, but understanding the subtext behind words.",
          hi: "Sactive sun-ne ka matlab hai poori tarah maujood hona. Yeh sirf apni baari ka intezar karna nahi hai, balki shabdon ke peeche ke arth ko samajhna hai.",
          bn: "সক্রিয়ভাবে শোনার অর্থ হল সম্পূর্ণ উপস্থিত থাকা। এটি কেবল আপনার কথা বলার পালার জন্য অপেক্ষা করা নয়, বরং শব্দের পেছনের অর্থ বোঝা।"
        },
        scenario: {
          en: "You are scrolling on your phone while she explains a complex emotional situation.",
          hi: "Jab woh ek jatil bhavnatmak sthiti samjha rahi hote hai, tab aap phone scroll kar rahe hote hain.",
          bn: "তিনি একটি জটিল মানসিক পরিস্থিতি ব্যাখ্যা করছেন আর আপনি ফোনে স্ক্রল করছেন।"
        },
        tips: {
          do: ["Maintain eye contact", "Nod and ask follow-up questions", "Put the phone away"],
          dont: ["Look at screens", "Fidget", "Assume you know what she'll say"]
        },
        recap: {
          en: "Presence is the greatest gift of communication.",
          hi: "Samvad ka sabse bada uphar upastithi hai.",
          bn: "উপস্থিতি হলো যোগাযোগের সেরা উপহার।"
        }
      },
      {
        id: 'comm-2',
        title: 'The Art of Validation',
        titleHi: 'Satyapan ki Kala',
        duration: '2:30',
        category: 'Communication',
        content: {
          en: "Validation is acknowledging her perspective as valid, even if you disagree. It common-sense empathy that makes her feel heard and safe.",
          hi: "Satyapan ka matlab hai uske drishtikon ko sahi man-na, bhale hi aap asahmat hon. Yeh saamanya sahanubhooti hai jo use suna hua aur surakshit mehsoos karati hai.",
          bn: "স্বীকৃতি হলো তার দৃষ্টিভঙ্গিকে বৈধ হিসেবে মেনে নেওয়া, এমনকি আপনি দ্বিমত পোষণ করলেও। এটি সাধারণ সহানুভূতি যা তাকে সুরক্ষিত বোধ করায়।"
        },
        scenario: {
          en: "She says 'I feel overwhelmed'. You respond with 'There's no reason to feel that way, it's just a small thing'.",
          hi: "Woh kehti hai 'Main bahut dabav mehsoos kar rahi hoon'. Aap jawab dete hain 'Aisa mehsoos karne ka koi karan nahi hai, yeh toh bas ek choti si baat hai'.",
          bn: "সে বলছে 'আমি খুব চাপ অনুভব করছি'। আপনি উত্তর দিলেন 'এমন অনুভব করার কোনো কারণ নেই, এটি একটি ছোট ব্যাপার'।"
        },
        tips: {
          do: ["Say: 'I can see why that would be stressful'", "Acknowledge the effort", "Stay emotionally present"],
          dont: ["Dismiss feelings as 'illogical'", "Try to snap her out of it", "Give unsolicited logic"]
        },
        recap: {
          en: "Feelings don't need logic; they need acknowledgment.",
          hi: "Bhavnaon ko tark ki nahi; unhe pehchan ki zaroorat hoti hai.",
          bn: "অনুভূতির যুক্তির প্রয়োজন নেই; স্বীকৃতির প্রয়োজন।"
        }
      }
    ]
  },
  {
    id: 'dynamics',
    title: 'Respect & Attraction',
    titleHi: 'Samman aur Akarshan',
    icon: 'Brain',
    description: 'Healthy vs Manipulative dynamics in modern relationships.',
    lessons: [
      {
        id: 'dyn-1',
        title: 'Building Authentic Respect',
        titleHi: 'Asli Samman Banana',
        duration: '2:45',
        category: 'Attraction',
        content: {
          en: "Long-term attraction is built on mutual respect for boundaries. Manipulation might work momentarily, but respect builds the foundation for lasting love.",
          hi: "Lambe samay ka akarshan seemao ke aapsi samman par banta hai. Chhalava thodi der ke liye kaam kar sakta hai, lekin samman sthayi prem ki buniyaad banata hai.",
          bn: "দীর্ঘমেয়াদী আকর্ষণ পারস্পরিক সম্মানের ওপর গড়ে ওঠে। কৌশল সাময়িকভাবে কাজ করতে পারে, কিন্তু সম্মান স্থায়ী প্রেমের ভিত্তি তৈরি করে।"
        },
        scenario: {
          en: "You feel tempted to use 'psychological tricks' to get her attention.",
          hi: "Aap uska dhyan khinchne ke liye 'manovigyanik chaalein' istemal karne ke liye lalchate hain.",
          bn: "আপনি তার মনোযোগ পেতে 'মনস্তাত্ত্বিক কৌশল' ব্যবহার করার প্রলোভন বোধ করছেন।"
        },
        tips: {
          do: ["Be honest about your intentions", "Appreciate her individuality", "Support her personal goals"],
          dont: ["Use manipulation tactics", "Play mind games", "Try to control her choices"]
        },
        recap: {
          en: "Love without respect is a house without a foundation.",
          hi: "Samman ke bina prem, buniyaad ke bina ghar hai.",
          bn: "সম্মানহীন প্রেম হলো ভিত্তিহীন ঘর।"
        }
      },
      {
        id: 'dyn-2',
        title: 'Emotional Availability',
        titleHi: 'Bhavnatmak Upalabdhta',
        duration: '2:10',
        category: 'Attraction',
        content: {
          en: "Being emotionally available means being open to sharing your own feelings and being receptive to hers. It's the opposite of being 'mysterious' or 'cold'.",
          hi: "Bhavnatmak roop se upalabdh hone ka matlab hai apni bhavnaon ko sajha karne ke liye khula hona aur uski bhavnaon ko sweekarna. Yeh 'rahasyamayi' ya 'thanda' hone ka ulta hai.",
          bn: "মানসিকভাবে উপলব্ধ থাকার অর্থ হলো নিজের অনুভূতি শেয়ার করা এবং তার অনুভূতির প্রতি সংবেদনশীল হওয়া। এটি রহস্যময় বা গম্ভীর হওয়ার বিপরীত।"
        },
        scenario: {
          en: "You hide your stress to look 'strong' but end up being distant and moody.",
          hi: "Aap 'mazboot' dikhne ke liye apna tanaav chhupate hain lekin ant mein door aur chidchide ho jate hain.",
          bn: "আপনি 'শক্তিশালী' দেখানোর জন্য আপনার মানসিক চাপ লুকিয়ে রাখেন তবে শেষ পর্যন্ত দূরে চলে যান।"
        },
        tips: {
          do: ["Share your day's highs and lows", "Express appreciation often", "Be consistent"],
          dont: ["Hide your vulnerability", "Go 'silent' when stressed", "Fear emotional depth"]
        },
        recap: {
          en: "Vulnerability is a sign of true confidence.",
          hi: "Kamzori dikhana asli vishwas ki nishani hai.",
          bn: "নিজের দুর্বলতা প্রকাশ করা সত্যিকারের আত্মবিশ্বাসের লক্ষণ।"
        }
      }
    ]
  },
  {
    id: 'habits',
    title: 'Daily Habits & Rituals',
    titleHi: 'Dainik Aadatein',
    icon: 'Heart',
    description: 'Small habits that make a big difference in emotional connection.',
    lessons: [
      {
        id: 'habits-1',
        title: 'The Power of Small Gestures',
        titleHi: 'Chhote Isharon ki Shakti',
        duration: '1:45',
        category: 'Habits',
        content: {
          en: "Consistent small acts of kindness, like a thoughtful text or a small favor, build more intimacy than one grand gesture once a year.",
          hi: "Daya ke nirantar chhote karya, jaise ek soch-samajh kar bheja gaya message ya ek chhoti si madad, saal mein ek baar ki gayi badi koshish se zyada kareebi banate hain.",
          bn: "পারস্পরিক দয়ার ছোট ছোট কাজ, যেমন একটি সুন্দর মেসেজ বা একটি ছোট সাহায্য, বছরে একবার বড় কিছুর চেয়ে বেশি ঘনিষ্ঠতা তৈরি করে।"
        },
        scenario: {
          en: "You wait for birthdays to show appreciation but ignore small daily opportunities.",
          hi: "Aap samman dikhane ke liye janamdin ka intezar karte hain lekin dainik chhote avsaron ko nazarandaz karte hain.",
          bn: "আপনি প্রশংসা দেখানোর জন্য জন্মদিনের জন্য অপেক্ষা করেন কিন্তু প্রতিদিনের ছোট সুযোগগুলো উপেক্ষা করেন।"
        },
        tips: {
          do: ["Send 'thinking of you' texts", "Help with small chores", "Remember the small details"],
          dont: ["Take her for granted", "Only be romantic on special occasions", "Keep score"]
        },
        recap: {
          en: "Love is found in the details.",
          hi: "Prem vishayon mein milta hai.",
          bn: "ভালোবাসা ছোট ছোট খুঁটিনাটি বিষয়ের মাঝে পাওয়া যায়।"
        }
      },
      {
        id: 'habits-2',
        title: 'The "Unplugged" Ritual',
        titleHi: 'Phone-Mukt Samay',
        titleBn: 'ফোন-মুক্ত সময়',
        duration: '2:00',
        category: 'Habits',
        content: {
          en: "Dedicate at least 15 minutes a day to uninterrupted conversation without any screens. This 'unplugged' time signals that she is a priority above technology.",
          hi: "Din mein kam se kam 15 minute bina kisi screen ke nirantar samvad ke liye dein. Yeh 'unplugged' samay sanket deta hai ki woh technology se upar ek prathmikta hai.",
          bn: "প্রতিদিন অন্তত ১৫ মিনিট কোনো স্ক্রিন বা ফোন ছাইড়া শুধু কথা বলার জন্য রাখুন। এই সময়টা প্রমাণ করে যে আপনার কাছে প্রযুক্তির চেয়ে সেই মানুষটি বেশি গুরুত্বপূর্ণ।"
        },
        scenario: {
          en: "Dinner time is spent with both people browsing social media silently.",
          hi: "Raat ka khana dono ke social media browse karte hue khamoshi se nikal jata hai.",
          bn: "রাতের খাবারের সময় দুজনেই চুপচাপ সামাজিক যোগাযোগ মাধ্যম ব্রাউজ করতে ব্যস্ত থাকেন।"
        },
        tips: {
          do: ["Put phones in another room", "Ask open-ended questions", "Focus on the present"],
          dont: ["Check notifications", "Keep the TV on", "Multitask while talking"]
        },
        recap: {
          en: "Attention is the rarest and purest form of generosity.",
          hi: "Dhyan udarta ka sabse durlabh aur shuddh roop hai.",
          bn: "মনোযোগ হলো উদারতার সবচেয়ে বিরল এবং বিশুদ্ধ রূপ।"
        }
      }
    ]
  }
];
