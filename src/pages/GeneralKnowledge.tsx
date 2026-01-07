import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Globe, FlaskConical, Landmark, MapPin, Newspaper, Trophy, Users, Calendar, Flag, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CurrentAffairsFact {
  title: string;
  value: string;
  english: string;
  category: string;
}

// GK Categories with content
const gkCategories = [
  {
    id: "current-affairs",
    name: "करंट अफेयर्स",
    english: "Current Affairs",
    icon: Newspaper,
    color: "from-rose-500 to-orange-500",
    facts: [] as { title: string; value: string; english: string }[]
  },
  {
    id: "india",
    name: "भारत",
    english: "India",
    icon: Flag,
    color: "from-orange-500 to-green-500",
    facts: [
      { title: "राजधानी", value: "नई दिल्ली", english: "Capital: New Delhi" },
      { title: "राज्य", value: "28 राज्य + 8 केंद्र शासित प्रदेश", english: "28 States + 8 UTs" },
      { title: "राष्ट्रीय पक्षी", value: "मोर", english: "National Bird: Peacock" },
      { title: "राष्ट्रीय पशु", value: "बाघ", english: "National Animal: Tiger" },
      { title: "राष्ट्रीय फूल", value: "कमल", english: "National Flower: Lotus" },
      { title: "राष्ट्रीय फल", value: "आम", english: "National Fruit: Mango" },
      { title: "राष्ट्रीय खेल", value: "हॉकी", english: "National Game: Hockey" },
      { title: "राष्ट्रीय नदी", value: "गंगा", english: "National River: Ganga" },
      { title: "राष्ट्रगान", value: "जन गण मन", english: "National Anthem: Jana Gana Mana" },
      { title: "राष्ट्रगीत", value: "वंदे मातरम", english: "National Song: Vande Mataram" },
      { title: "मुद्रा", value: "भारतीय रुपया (₹)", english: "Currency: Indian Rupee" },
      { title: "सबसे बड़ा राज्य", value: "राजस्थान (क्षेत्रफल)", english: "Largest State: Rajasthan" },
      { title: "सबसे छोटा राज्य", value: "गोवा (क्षेत्रफल)", english: "Smallest State: Goa" },
      { title: "सबसे ज्यादा जनसंख्या", value: "उत्तर प्रदेश", english: "Most Populated: Uttar Pradesh" },
      { title: "स्वतंत्रता दिवस", value: "15 अगस्त 1947", english: "Independence: 15 Aug 1947" },
    ]
  },
  {
    id: "world",
    name: "विश्व",
    english: "World",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
    facts: [
      { title: "कुल देश", value: "195 देश", english: "Total Countries: 195" },
      { title: "सबसे बड़ा देश", value: "रूस", english: "Largest: Russia" },
      { title: "सबसे छोटा देश", value: "वेटिकन सिटी", english: "Smallest: Vatican City" },
      { title: "सबसे ज्यादा जनसंख्या", value: "भारत", english: "Most Populated: India" },
      { title: "सबसे लंबी नदी", value: "नील नदी", english: "Longest River: Nile" },
      { title: "सबसे ऊंचा पर्वत", value: "माउंट एवरेस्ट", english: "Highest: Mt. Everest" },
      { title: "सबसे बड़ा महासागर", value: "प्रशांत महासागर", english: "Largest Ocean: Pacific" },
      { title: "सबसे बड़ा रेगिस्तान", value: "सहारा", english: "Largest Desert: Sahara" },
      { title: "सबसे गहरी झील", value: "बैकाल झील", english: "Deepest Lake: Baikal" },
      { title: "सबसे बड़ा द्वीप", value: "ग्रीनलैंड", english: "Largest Island: Greenland" },
      { title: "UN मुख्यालय", value: "न्यूयॉर्क", english: "UN HQ: New York" },
      { title: "विश्व बैंक मुख्यालय", value: "वाशिंगटन डी.सी.", english: "World Bank: Washington D.C." },
    ]
  },
  {
    id: "science",
    name: "विज्ञान",
    english: "Science",
    icon: FlaskConical,
    color: "from-purple-500 to-pink-500",
    facts: [
      { title: "प्रकाश की गति", value: "3 लाख km/s", english: "Speed of Light: 300,000 km/s" },
      { title: "ध्वनि की गति", value: "343 m/s (हवा में)", english: "Speed of Sound: 343 m/s" },
      { title: "पानी का सूत्र", value: "H₂O", english: "Water Formula: H₂O" },
      { title: "मानव शरीर में हड्डियां", value: "206", english: "Bones in Human Body: 206" },
      { title: "मानव शरीर में दांत", value: "32 (वयस्क)", english: "Teeth: 32 (Adults)" },
      { title: "सबसे बड़ा ग्रह", value: "बृहस्पति", english: "Largest Planet: Jupiter" },
      { title: "सबसे छोटा ग्रह", value: "बुध", english: "Smallest Planet: Mercury" },
      { title: "पृथ्वी का उपग्रह", value: "चंद्रमा", english: "Earth's Satellite: Moon" },
      { title: "सूर्य का तापमान", value: "6000°C (सतह)", english: "Sun Surface: 6000°C" },
      { title: "DNA का पूरा नाम", value: "Deoxyribonucleic Acid", english: "DNA Full Form" },
      { title: "विटामिन C", value: "खट्टे फल (नींबू, संतरा)", english: "Vitamin C: Citrus Fruits" },
      { title: "आयरन की कमी", value: "एनीमिया", english: "Iron Deficiency: Anemia" },
    ]
  },
  {
    id: "history",
    name: "इतिहास",
    english: "History",
    icon: Landmark,
    color: "from-amber-500 to-yellow-500",
    facts: [
      { title: "सिंधु घाटी सभ्यता", value: "2500 ईसा पूर्व", english: "Indus Valley: 2500 BC" },
      { title: "मौर्य साम्राज्य", value: "322-185 ईसा पूर्व", english: "Maurya Empire: 322-185 BC" },
      { title: "गुप्त साम्राज्य", value: "320-550 ई.", english: "Gupta Empire: 320-550 AD" },
      { title: "मुगल साम्राज्य", value: "1526-1857", english: "Mughal Empire: 1526-1857" },
      { title: "प्रथम विश्व युद्ध", value: "1914-1918", english: "World War I: 1914-1918" },
      { title: "द्वितीय विश्व युद्ध", value: "1939-1945", english: "World War II: 1939-1945" },
      { title: "भारत की आजादी", value: "15 अगस्त 1947", english: "India Independence: 1947" },
      { title: "गणतंत्र दिवस", value: "26 जनवरी 1950", english: "Republic Day: 26 Jan 1950" },
      { title: "प्रथम प्रधानमंत्री", value: "जवाहरलाल नेहरू", english: "First PM: Jawaharlal Nehru" },
      { title: "राष्ट्रपिता", value: "महात्मा गांधी", english: "Father of Nation: Mahatma Gandhi" },
      { title: "भारतीय संविधान निर्माता", value: "डॉ. बी.आर. अंबेडकर", english: "Constitution: Dr. B.R. Ambedkar" },
    ]
  },
  {
    id: "geography",
    name: "भूगोल",
    english: "Geography",
    icon: MapPin,
    color: "from-green-500 to-emerald-500",
    facts: [
      { title: "पृथ्वी की आयु", value: "4.5 अरब वर्ष", english: "Earth Age: 4.5 Billion Years" },
      { title: "महाद्वीप", value: "7 (एशिया, अफ्रीका, यूरोप...)", english: "Continents: 7" },
      { title: "महासागर", value: "5 (प्रशांत, अटलांटिक...)", english: "Oceans: 5" },
      { title: "भारत की सीमा", value: "7 देशों से लगती है", english: "India borders 7 countries" },
      { title: "हिमालय की सबसे ऊंची चोटी", value: "माउंट एवरेस्ट (8848 m)", english: "Everest: 8848m" },
      { title: "भारत की सबसे लंबी नदी", value: "गंगा (2525 km)", english: "Longest River: Ganga" },
      { title: "सबसे बड़ा राज्य", value: "राजस्थान (क्षेत्रफल)", english: "Largest State: Rajasthan" },
      { title: "सबसे लंबा समुद्र तट", value: "गुजरात", english: "Longest Coastline: Gujarat" },
      { title: "भारत का सबसे ठंडा स्थान", value: "द्रास (लद्दाख)", english: "Coldest: Dras, Ladakh" },
      { title: "भारत का सबसे गर्म स्थान", value: "चूरू (राजस्थान)", english: "Hottest: Churu, Rajasthan" },
    ]
  },
  {
    id: "sports",
    name: "खेल",
    english: "Sports",
    icon: Trophy,
    color: "from-red-500 to-rose-500",
    facts: [
      { title: "क्रिकेट विश्व कप विजेता", value: "भारत (1983, 2011)", english: "Cricket WC: India 1983, 2011" },
      { title: "ओलंपिक 2024", value: "पेरिस, फ्रांस", english: "Olympics 2024: Paris, France" },
      { title: "FIFA विश्व कप 2022", value: "अर्जेंटीना", english: "FIFA 2022: Argentina" },
      { title: "IPL शुरुआत", value: "2008", english: "IPL Started: 2008" },
      { title: "भारत का राष्ट्रीय खेल", value: "हॉकी", english: "National Game: Hockey" },
      { title: "क्रिकेट का भगवान", value: "सचिन तेंदुलकर", english: "God of Cricket: Sachin" },
      { title: "फ्लाइंग सिख", value: "मिल्खा सिंह", english: "Flying Sikh: Milkha Singh" },
      { title: "ओलंपिक स्वर्ण (व्यक्तिगत)", value: "अभिनव बिंद्रा (2008)", english: "Gold: Abhinav Bindra" },
      { title: "टेनिस ग्रैंड स्लैम", value: "4 (ऑस्ट्रेलियन, फ्रेंच, विंबलडन, US)", english: "4 Grand Slams" },
    ]
  },
  {
    id: "leaders",
    name: "महापुरुष",
    english: "Great Leaders",
    icon: Users,
    color: "from-indigo-500 to-violet-500",
    facts: [
      { title: "राष्ट्रपिता", value: "महात्मा गांधी", english: "Father of Nation: Mahatma Gandhi" },
      { title: "लौह पुरुष", value: "सरदार वल्लभभाई पटेल", english: "Iron Man: Sardar Patel" },
      { title: "चाचा नेहरू", value: "जवाहरलाल नेहरू", english: "Chacha Nehru" },
      { title: "नेताजी", value: "सुभाष चंद्र बोस", english: "Netaji: Subhash Chandra Bose" },
      { title: "भगत सिंह", value: "शहीद-ए-आज़म", english: "Bhagat Singh: Martyr" },
      { title: "मिसाइल मैन", value: "डॉ. एपीजे अब्दुल कलाम", english: "Missile Man: APJ Abdul Kalam" },
      { title: "बाबासाहेब", value: "डॉ. बी.आर. अंबेडकर", english: "Babasaheb: Dr. Ambedkar" },
      { title: "स्वामी विवेकानंद", value: "युवाओं के प्रेरणास्रोत", english: "Swami Vivekananda" },
      { title: "रबीन्द्रनाथ टैगोर", value: "गुरुदेव, नोबेल पुरस्कार", english: "Tagore: Nobel Laureate" },
    ]
  },
  {
    id: "dates",
    name: "महत्वपूर्ण दिवस",
    english: "Important Days",
    icon: Calendar,
    color: "from-teal-500 to-cyan-500",
    facts: [
      { title: "गणतंत्र दिवस", value: "26 जनवरी", english: "Republic Day: 26 Jan" },
      { title: "स्वतंत्रता दिवस", value: "15 अगस्त", english: "Independence Day: 15 Aug" },
      { title: "गांधी जयंती", value: "2 अक्टूबर", english: "Gandhi Jayanti: 2 Oct" },
      { title: "शिक्षक दिवस", value: "5 सितंबर", english: "Teachers Day: 5 Sep" },
      { title: "बाल दिवस", value: "14 नवंबर", english: "Children's Day: 14 Nov" },
      { title: "विश्व पर्यावरण दिवस", value: "5 जून", english: "Environment Day: 5 Jun" },
      { title: "विश्व स्वास्थ्य दिवस", value: "7 अप्रैल", english: "Health Day: 7 Apr" },
      { title: "अंतर्राष्ट्रीय योग दिवस", value: "21 जून", english: "Yoga Day: 21 Jun" },
      { title: "राष्ट्रीय विज्ञान दिवस", value: "28 फरवरी", english: "Science Day: 28 Feb" },
      { title: "हिंदी दिवस", value: "14 सितंबर", english: "Hindi Diwas: 14 Sep" },
    ]
  },
];

const GeneralKnowledge = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("current-affairs");
  const [currentAffairs, setCurrentAffairs] = useState<CurrentAffairsFact[]>([]);
  const [currentAffairsDate, setCurrentAffairsDate] = useState<string>("");
  const [isLoadingCurrentAffairs, setIsLoadingCurrentAffairs] = useState(false);

  const fetchCurrentAffairs = async () => {
    setIsLoadingCurrentAffairs(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-current-affairs');
      
      if (error) {
        console.error('Error fetching current affairs:', error);
        toast.error('करंट अफेयर्स लोड करने में समस्या हुई');
        return;
      }

      if (data?.facts) {
        setCurrentAffairs(data.facts);
        setCurrentAffairsDate(data.date || '');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('करंट अफेयर्स लोड करने में समस्या हुई');
    } finally {
      setIsLoadingCurrentAffairs(false);
    }
  };

  useEffect(() => {
    fetchCurrentAffairs();
  }, []);

  const currentCategory = gkCategories.find(cat => cat.id === activeCategory);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'राष्ट्रीय': return 'bg-orange-500';
      case 'अंतर्राष्ट्रीय': return 'bg-blue-500';
      case 'खेल': return 'bg-red-500';
      case 'विज्ञान': return 'bg-purple-500';
      case 'अर्थव्यवस्था': return 'bg-green-500';
      case 'नियुक्ति': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/classes")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">📚 सामान्य ज्ञान</h1>
              <p className="text-sm text-muted-foreground">General Knowledge</p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-9 mb-6 h-auto">
            {gkCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="text-xs py-2 flex flex-col items-center gap-1"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Current Affairs Tab */}
          <TabsContent value="current-affairs">
            <div className="space-y-4">
              {/* Category Header */}
              <Card className="p-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Newspaper className="w-8 h-8" />
                    <div>
                      <h2 className="text-xl font-bold">📰 करंट अफेयर्स</h2>
                      <p className="text-sm opacity-90">Current Affairs - AI Updated Daily</p>
                      {currentAffairsDate && (
                        <p className="text-xs opacity-75 mt-1">📅 {currentAffairsDate}</p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={fetchCurrentAffairs}
                    disabled={isLoadingCurrentAffairs}
                    className="flex items-center gap-2"
                  >
                    {isLoadingCurrentAffairs ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    रिफ्रेश
                  </Button>
                </div>
              </Card>

              {/* Loading State */}
              {isLoadingCurrentAffairs && currentAffairs.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">AI से करंट अफेयर्स लोड हो रहे हैं...</p>
                  </div>
                </div>
              )}

              {/* Current Affairs Grid */}
              {currentAffairs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentAffairs.map((fact, index) => (
                    <Card 
                      key={index} 
                      className="p-4 hover:shadow-lg transition-all border-2 hover:border-primary"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-muted-foreground">{fact.title}</p>
                          {fact.category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getCategoryBadgeColor(fact.category)}`}>
                              {fact.category}
                            </span>
                          )}
                        </div>
                        <p className="text-base font-bold text-primary">{fact.value}</p>
                        <p className="text-xs text-muted-foreground">{fact.english}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Other Categories */}
          {gkCategories.filter(cat => cat.id !== 'current-affairs').map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="space-y-4">
                {/* Category Header */}
                <Card className={`p-4 bg-gradient-to-r ${category.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <category.icon className="w-8 h-8" />
                    <div>
                      <h2 className="text-xl font-bold">{category.name}</h2>
                      <p className="text-sm opacity-90">{category.english}</p>
                    </div>
                  </div>
                </Card>

                {/* Facts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.facts.map((fact, index) => (
                    <Card 
                      key={index} 
                      className="p-4 hover:shadow-lg transition-all border-2 hover:border-primary"
                    >
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{fact.title}</p>
                        <p className="text-lg font-bold text-primary">{fact.value}</p>
                        <p className="text-xs text-muted-foreground">{fact.english}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Facts */}
        <Card className="mt-6 p-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            💡 त्वरित तथ्य (Quick Facts)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold text-primary">195</p>
              <p className="text-xs text-muted-foreground">देश (Countries)</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold text-primary">28</p>
              <p className="text-xs text-muted-foreground">भारतीय राज्य (States)</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold text-primary">7</p>
              <p className="text-xs text-muted-foreground">महाद्वीप (Continents)</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold text-primary">5</p>
              <p className="text-xs text-muted-foreground">महासागर (Oceans)</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GeneralKnowledge;
