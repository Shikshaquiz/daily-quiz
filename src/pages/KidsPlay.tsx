import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Volume2, Gamepad2 } from "lucide-react";

// Hindi Alphabet Data
const hindiAlphabet = [
  { letter: "अ", word: "अनार", emoji: "🍎" },
  { letter: "आ", word: "आम", emoji: "🥭" },
  { letter: "इ", word: "इमली", emoji: "🌿" },
  { letter: "ई", word: "ईख", emoji: "🎋" },
  { letter: "उ", word: "उल्लू", emoji: "🦉" },
  { letter: "ऊ", word: "ऊन", emoji: "🧶" },
  { letter: "ए", word: "एड़ी", emoji: "🦶" },
  { letter: "ऐ", word: "ऐनक", emoji: "👓" },
  { letter: "ओ", word: "ओखली", emoji: "🥣" },
  { letter: "औ", word: "औरत", emoji: "👩" },
  { letter: "क", word: "कमल", emoji: "🪷" },
  { letter: "ख", word: "खरगोश", emoji: "🐰" },
  { letter: "ग", word: "गाय", emoji: "🐄" },
  { letter: "घ", word: "घड़ी", emoji: "⏰" },
  { letter: "च", word: "चम्मच", emoji: "🥄" },
  { letter: "छ", word: "छाता", emoji: "☂️" },
  { letter: "ज", word: "जहाज", emoji: "🚢" },
  { letter: "झ", word: "झंडा", emoji: "🚩" },
  { letter: "ट", word: "टमाटर", emoji: "🍅" },
  { letter: "ठ", word: "ठेला", emoji: "🛒" },
  { letter: "ड", word: "डमरू", emoji: "🥁" },
  { letter: "ढ", word: "ढोल", emoji: "🪘" },
  { letter: "ण", word: "बाण", emoji: "🏹" },
  { letter: "त", word: "तरबूज", emoji: "🍉" },
  { letter: "थ", word: "थाली", emoji: "🍽️" },
  { letter: "द", word: "दवाई", emoji: "💊" },
  { letter: "ध", word: "धनुष", emoji: "🏹" },
  { letter: "न", word: "नल", emoji: "🚿" },
  { letter: "प", word: "पतंग", emoji: "🪁" },
  { letter: "फ", word: "फूल", emoji: "🌸" },
  { letter: "ब", word: "बत्तख", emoji: "🦆" },
  { letter: "भ", word: "भालू", emoji: "🐻" },
  { letter: "म", word: "मछली", emoji: "🐟" },
  { letter: "य", word: "यज्ञ", emoji: "🔥" },
  { letter: "र", word: "रथ", emoji: "🛞" },
  { letter: "ल", word: "लालटेन", emoji: "🏮" },
  { letter: "व", word: "वायलिन", emoji: "🎻" },
  { letter: "श", word: "शेर", emoji: "🦁" },
  { letter: "ष", word: "षटकोण", emoji: "⬡" },
  { letter: "स", word: "सेब", emoji: "🍎" },
  { letter: "ह", word: "हाथी", emoji: "🐘" },
];

// English Alphabet Data
const englishAlphabet = [
  { letter: "A", word: "Apple", emoji: "🍎" },
  { letter: "B", word: "Ball", emoji: "⚽" },
  { letter: "C", word: "Cat", emoji: "🐱" },
  { letter: "D", word: "Dog", emoji: "🐕" },
  { letter: "E", word: "Elephant", emoji: "🐘" },
  { letter: "F", word: "Fish", emoji: "🐟" },
  { letter: "G", word: "Grapes", emoji: "🍇" },
  { letter: "H", word: "Hat", emoji: "🎩" },
  { letter: "I", word: "Ice cream", emoji: "🍦" },
  { letter: "J", word: "Jug", emoji: "🫖" },
  { letter: "K", word: "Kite", emoji: "🪁" },
  { letter: "L", word: "Lion", emoji: "🦁" },
  { letter: "M", word: "Monkey", emoji: "🐒" },
  { letter: "N", word: "Nest", emoji: "🪺" },
  { letter: "O", word: "Orange", emoji: "🍊" },
  { letter: "P", word: "Parrot", emoji: "🦜" },
  { letter: "Q", word: "Queen", emoji: "👸" },
  { letter: "R", word: "Rabbit", emoji: "🐰" },
  { letter: "S", word: "Sun", emoji: "☀️" },
  { letter: "T", word: "Tiger", emoji: "🐅" },
  { letter: "U", word: "Umbrella", emoji: "☂️" },
  { letter: "V", word: "Van", emoji: "🚐" },
  { letter: "W", word: "Watch", emoji: "⌚" },
  { letter: "X", word: "Xylophone", emoji: "🎵" },
  { letter: "Y", word: "Yak", emoji: "🐃" },
  { letter: "Z", word: "Zebra", emoji: "🦓" },
];

// Numbers Data 1-100
const generateNumbers = () => {
  const hindiNumbers = [
    "शून्य", "एक", "दो", "तीन", "चार", "पांच", "छह", "सात", "आठ", "नौ", "दस",
    "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस",
    "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाईस", "उनतीस", "तीस",
    "इकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस", "चालीस",
    "इकतालीस", "बयालीस", "तैंतालीस", "चवालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास", "पचास",
    "इक्यावन", "बावन", "तिरपन", "चौवन", "पचपन", "छप्पन", "सत्तावन", "अट्ठावन", "उनसठ", "साठ",
    "इकसठ", "बासठ", "तिरसठ", "चौंसठ", "पैंसठ", "छियासठ", "सड़सठ", "अड़सठ", "उनहत्तर", "सत्तर",
    "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छिहत्तर", "सतहत्तर", "अठहत्तर", "उनासी", "अस्सी",
    "इक्यासी", "बयासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सतासी", "अठासी", "नवासी", "नब्बे",
    "इक्यानबे", "बानबे", "तिरानबे", "चौरानबे", "पचानबे", "छियानबे", "सतानबे", "अठानबे", "निन्यानबे", "सौ"
  ];
  
  return Array.from({ length: 100 }, (_, i) => ({
    number: String(i + 1),
    word: `${hindiNumbers[i + 1]} / ${i + 1}`,
    emoji: i < 10 ? `${i + 1}️⃣` : "🔢",
  }));
};

const numbers = generateNumbers();

// Pahada (Multiplication Tables) 1-20
const generatePahada = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    table: i + 1,
    name: `${i + 1} का पहाड़ा`,
  }));
};

const pahadas = generatePahada();

// Addition examples
const generateAdditions = () => {
  const additions = [];
  for (let i = 1; i <= 20; i++) {
    for (let j = 1; j <= 10; j++) {
      if (additions.length < 50) {
        additions.push({
          num1: i,
          num2: j,
          result: i + j,
          display: `${i} + ${j} = ${i + j}`,
        });
      }
    }
  }
  return additions;
};

const additions = generateAdditions();

// Subtraction examples
const generateSubtractions = () => {
  const subtractions = [];
  for (let i = 10; i <= 30; i++) {
    for (let j = 1; j <= 9; j++) {
      if (subtractions.length < 50 && i > j) {
        subtractions.push({
          num1: i,
          num2: j,
          result: i - j,
          display: `${i} - ${j} = ${i - j}`,
        });
      }
    }
  }
  return subtractions;
};

const subtractions = generateSubtractions();

// Multiplication examples
const generateMultiplications = () => {
  const multiplications = [];
  for (let i = 2; i <= 10; i++) {
    for (let j = 1; j <= 10; j++) {
      if (multiplications.length < 50) {
        multiplications.push({
          num1: i,
          num2: j,
          result: i * j,
          display: `${i} × ${j} = ${i * j}`,
        });
      }
    }
  }
  return multiplications;
};

const multiplications = generateMultiplications();

// Shapes Data
const shapes = [
  { name: "वृत्त", english: "Circle", emoji: "⭕", sides: 0 },
  { name: "त्रिभुज", english: "Triangle", emoji: "🔺", sides: 3 },
  { name: "वर्ग", english: "Square", emoji: "🟧", sides: 4 },
  { name: "आयत", english: "Rectangle", emoji: "🟦", sides: 4 },
  { name: "पंचभुज", english: "Pentagon", emoji: "⬠", sides: 5 },
  { name: "षट्भुज", english: "Hexagon", emoji: "⬡", sides: 6 },
  { name: "तारा", english: "Star", emoji: "⭐", sides: 5 },
  { name: "हीरा", english: "Diamond", emoji: "💎", sides: 4 },
  { name: "दिल", english: "Heart", emoji: "❤️", sides: 0 },
  { name: "अंडाकार", english: "Oval", emoji: "🥚", sides: 0 },
];

// Colors Data
const colors = [
  { name: "लाल", english: "Red", emoji: "🔴", hex: "#EF4444" },
  { name: "नीला", english: "Blue", emoji: "🔵", hex: "#3B82F6" },
  { name: "हरा", english: "Green", emoji: "🟢", hex: "#22C55E" },
  { name: "पीला", english: "Yellow", emoji: "🟡", hex: "#EAB308" },
  { name: "नारंगी", english: "Orange", emoji: "🟠", hex: "#F97316" },
  { name: "बैंगनी", english: "Purple", emoji: "🟣", hex: "#A855F7" },
  { name: "गुलाबी", english: "Pink", emoji: "💗", hex: "#EC4899" },
  { name: "भूरा", english: "Brown", emoji: "🟤", hex: "#A16207" },
  { name: "काला", english: "Black", emoji: "⚫", hex: "#000000" },
  { name: "सफेद", english: "White", emoji: "⚪", hex: "#FFFFFF" },
  { name: "ग्रे", english: "Gray", emoji: "🩶", hex: "#6B7280" },
  { name: "आसमानी", english: "Sky Blue", emoji: "🩵", hex: "#38BDF8" },
];

// Days of Week
const daysOfWeek = [
  { hindi: "रविवार", english: "Sunday", emoji: "☀️" },
  { hindi: "सोमवार", english: "Monday", emoji: "🌙" },
  { hindi: "मंगलवार", english: "Tuesday", emoji: "🔴" },
  { hindi: "बुधवार", english: "Wednesday", emoji: "🟢" },
  { hindi: "गुरुवार", english: "Thursday", emoji: "🟡" },
  { hindi: "शुक्रवार", english: "Friday", emoji: "🔵" },
  { hindi: "शनिवार", english: "Saturday", emoji: "🟣" },
];

// Months
const months = [
  { hindi: "जनवरी", english: "January", emoji: "❄️" },
  { hindi: "फरवरी", english: "February", emoji: "💕" },
  { hindi: "मार्च", english: "March", emoji: "🌸" },
  { hindi: "अप्रैल", english: "April", emoji: "🌷" },
  { hindi: "मई", english: "May", emoji: "🌻" },
  { hindi: "जून", english: "June", emoji: "☀️" },
  { hindi: "जुलाई", english: "July", emoji: "🌧️" },
  { hindi: "अगस्त", english: "August", emoji: "🌈" },
  { hindi: "सितंबर", english: "September", emoji: "🍂" },
  { hindi: "अक्टूबर", english: "October", emoji: "🎃" },
  { hindi: "नवंबर", english: "November", emoji: "🍁" },
  { hindi: "दिसंबर", english: "December", emoji: "🎄" },
];

// Fruits Data
const fruits = [
  { hindi: "सेब", english: "Apple", emoji: "🍎" },
  { hindi: "केला", english: "Banana", emoji: "🍌" },
  { hindi: "अंगूर", english: "Grapes", emoji: "🍇" },
  { hindi: "संतरा", english: "Orange", emoji: "🍊" },
  { hindi: "आम", english: "Mango", emoji: "🥭" },
  { hindi: "अनानास", english: "Pineapple", emoji: "🍍" },
  { hindi: "तरबूज", english: "Watermelon", emoji: "🍉" },
  { hindi: "स्ट्रॉबेरी", english: "Strawberry", emoji: "🍓" },
  { hindi: "चेरी", english: "Cherry", emoji: "🍒" },
  { hindi: "नींबू", english: "Lemon", emoji: "🍋" },
  { hindi: "नाशपाती", english: "Pear", emoji: "🍐" },
  { hindi: "आड़ू", english: "Peach", emoji: "🍑" },
  { hindi: "कीवी", english: "Kiwi", emoji: "🥝" },
  { hindi: "नारियल", english: "Coconut", emoji: "🥥" },
  { hindi: "पपीता", english: "Papaya", emoji: "🧡" },
];

// Vegetables Data
const vegetables = [
  { hindi: "गाजर", english: "Carrot", emoji: "🥕" },
  { hindi: "टमाटर", english: "Tomato", emoji: "🍅" },
  { hindi: "आलू", english: "Potato", emoji: "🥔" },
  { hindi: "प्याज", english: "Onion", emoji: "🧅" },
  { hindi: "लहसुन", english: "Garlic", emoji: "🧄" },
  { hindi: "मिर्च", english: "Chilli", emoji: "🌶️" },
  { hindi: "बैंगन", english: "Brinjal", emoji: "🍆" },
  { hindi: "खीरा", english: "Cucumber", emoji: "🥒" },
  { hindi: "मक्का", english: "Corn", emoji: "🌽" },
  { hindi: "ब्रोकली", english: "Broccoli", emoji: "🥦" },
  { hindi: "पत्तागोभी", english: "Cabbage", emoji: "🥬" },
  { hindi: "मटर", english: "Peas", emoji: "🫛" },
  { hindi: "शिमला मिर्च", english: "Capsicum", emoji: "🫑" },
  { hindi: "मूली", english: "Radish", emoji: "🥗" },
  { hindi: "पालक", english: "Spinach", emoji: "🥬" },
];

// Animals Data
const animals = [
  { hindi: "शेर", english: "Lion", emoji: "🦁" },
  { hindi: "हाथी", english: "Elephant", emoji: "🐘" },
  { hindi: "बाघ", english: "Tiger", emoji: "🐅" },
  { hindi: "भालू", english: "Bear", emoji: "🐻" },
  { hindi: "बंदर", english: "Monkey", emoji: "🐒" },
  { hindi: "गाय", english: "Cow", emoji: "🐄" },
  { hindi: "कुत्ता", english: "Dog", emoji: "🐕" },
  { hindi: "बिल्ली", english: "Cat", emoji: "🐱" },
  { hindi: "घोड़ा", english: "Horse", emoji: "🐴" },
  { hindi: "खरगोश", english: "Rabbit", emoji: "🐰" },
  { hindi: "चूहा", english: "Mouse", emoji: "🐭" },
  { hindi: "सूअर", english: "Pig", emoji: "🐷" },
  { hindi: "भेड़", english: "Sheep", emoji: "🐑" },
  { hindi: "बकरी", english: "Goat", emoji: "🐐" },
  { hindi: "ऊंट", english: "Camel", emoji: "🐪" },
  { hindi: "जिराफ", english: "Giraffe", emoji: "🦒" },
  { hindi: "ज़ेबरा", english: "Zebra", emoji: "🦓" },
  { hindi: "गैंडा", english: "Rhino", emoji: "🦏" },
  { hindi: "मगरमच्छ", english: "Crocodile", emoji: "🐊" },
  { hindi: "साँप", english: "Snake", emoji: "🐍" },
];

const KidsPlay = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [selectedPahada, setSelectedPahada] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("hindi");
  const [hindiPage, setHindiPage] = useState(0);
  const [englishPage, setEnglishPage] = useState(0);
  const [numberPage, setNumberPage] = useState(0);
  const [pahadaPage, setPahadaPage] = useState(0);

  const speakText = (text: string, lang: string = "hi-IN") => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderAlphabetCard = (item: any, isHindi: boolean = true) => (
    <Card
      key={item.letter}
      className="p-4 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-primary"
      onClick={() => {
        setSelectedCard(item);
        speakText(isHindi ? `${item.letter} से ${item.word}` : `${item.letter} for ${item.word}`, isHindi ? "hi-IN" : "en-US");
      }}
    >
      <div className="text-center">
        <div className="text-4xl md:text-5xl mb-2">{item.emoji}</div>
        <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{item.letter}</div>
        <div className="text-sm md:text-base text-muted-foreground">{item.word}</div>
      </div>
    </Card>
  );

  const renderNumberCard = (item: any) => (
    <Card
      key={item.number}
      className="p-3 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-primary"
      onClick={() => {
        setSelectedCard({ ...item, type: 'number' });
        speakText(`${item.number}, ${item.word.split(' / ')[0]}`, "hi-IN");
      }}
    >
      <div className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{item.number}</div>
        <div className="text-xs md:text-sm text-muted-foreground truncate">{item.word}</div>
      </div>
    </Card>
  );

  const renderPahadaCard = (item: any) => (
    <Card
      key={item.table}
      className={`p-4 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 ${selectedPahada === item.table ? 'border-primary bg-primary/10' : 'hover:border-primary'}`}
      onClick={() => {
        setSelectedPahada(item.table);
        setSelectedCard({ type: 'pahada', table: item.table });
      }}
    >
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{item.table}</div>
        <div className="text-xs md:text-sm text-muted-foreground">{item.name}</div>
      </div>
    </Card>
  );

  const renderPahadaTable = (tableNum: number) => {
    return (
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10">
        <h3 className="text-xl font-bold text-center mb-4 text-primary">{tableNum} का पहाड़ा</h3>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="p-2 bg-card rounded-lg text-center cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => speakText(`${tableNum} एकम ${tableNum * (i + 1)}`, "hi-IN")}
            >
              <span className="font-semibold">{tableNum} × {i + 1} = {tableNum * (i + 1)}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderAdditionCard = (item: any) => (
    <Card
      key={`${item.num1}-${item.num2}`}
      className="p-3 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-accent"
      onClick={() => {
        setSelectedCard({ type: 'addition', ...item });
        speakText(`${item.num1} जमा ${item.num2} बराबर ${item.result}`, "hi-IN");
      }}
    >
      <div className="text-center">
        <div className="text-lg md:text-xl font-bold text-accent">{item.display}</div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/classes")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">🎮 Kids Play</h1>
              <p className="text-sm text-muted-foreground">सीखें और मज़े करें!</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/kids-games")}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white gap-2"
          >
            <Gamepad2 className="h-5 w-5" />
            <span className="hidden sm:inline">खेलो और सीखो</span>
            <span className="sm:hidden">🎮</span>
          </Button>
        </div>

        {/* Selected Card Preview */}
        {selectedCard && selectedCard.type !== 'pahada' && (
          <Card className="p-6 mb-6 bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl md:text-6xl">{selectedCard.emoji || "🔢"}</div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold">{selectedCard.letter || selectedCard.number || selectedCard.display}</div>
                  <div className="text-lg md:text-xl opacity-90">{selectedCard.word}</div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  if (selectedCard.type === 'addition') {
                    speakText(`${selectedCard.num1} जमा ${selectedCard.num2} बराबर ${selectedCard.result}`, "hi-IN");
                  } else {
                    speakText(selectedCard.word || selectedCard.number, selectedCard.letter?.match(/[A-Z]/) ? "en-US" : "hi-IN");
                  }
                }}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        )}

        {/* Tabs for different content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 md:grid-cols-12 mb-6">
            <TabsTrigger value="hindi" className="text-xs">हिंदी</TabsTrigger>
            <TabsTrigger value="english" className="text-xs">ABC</TabsTrigger>
            <TabsTrigger value="numbers" className="text-xs">गिनती</TabsTrigger>
            <TabsTrigger value="pahada" className="text-xs">पहाड़ा</TabsTrigger>
            <TabsTrigger value="jod" className="text-xs">जोड़</TabsTrigger>
            <TabsTrigger value="ghatav" className="text-xs">घटाव</TabsTrigger>
            <TabsTrigger value="guna" className="text-xs">गुणा</TabsTrigger>
            <TabsTrigger value="shapes" className="text-xs">आकार</TabsTrigger>
            <TabsTrigger value="colors" className="text-xs">रंग</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs">कैलेंडर</TabsTrigger>
            <TabsTrigger value="fruits" className="text-xs">फल-सब्जी</TabsTrigger>
            <TabsTrigger value="animals" className="text-xs">जानवर</TabsTrigger>
          </TabsList>

          <TabsContent value="hindi">
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {hindiAlphabet.slice(hindiPage * 4, hindiPage * 4 + 4).map((item) => renderAlphabetCard(item, true))}
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHindiPage(Math.max(0, hindiPage - 1))}
                  disabled={hindiPage === 0}
                >
                  पिछला
                </Button>
                <span className="px-4 py-2 text-sm">
                  {hindiPage + 1} / {Math.ceil(hindiAlphabet.length / 4)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHindiPage(Math.min(Math.ceil(hindiAlphabet.length / 4) - 1, hindiPage + 1))}
                  disabled={hindiPage >= Math.ceil(hindiAlphabet.length / 4) - 1}
                >
                  अगला
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="english">
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {englishAlphabet.slice(englishPage * 4, englishPage * 4 + 4).map((item) => renderAlphabetCard(item, false))}
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEnglishPage(Math.max(0, englishPage - 1))}
                  disabled={englishPage === 0}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm">
                  {englishPage + 1} / {Math.ceil(englishAlphabet.length / 4)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEnglishPage(Math.min(Math.ceil(englishAlphabet.length / 4) - 1, englishPage + 1))}
                  disabled={englishPage >= Math.ceil(englishAlphabet.length / 4) - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="numbers">
            <p className="text-center text-muted-foreground mb-4">1 से 10 तक गिनती सीखें</p>
            <div className="space-y-4">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {numbers.slice(numberPage * 10, numberPage * 10 + 10).map((item) => renderNumberCard(item))}
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNumberPage(Math.max(0, numberPage - 1))}
                  disabled={numberPage === 0}
                >
                  पिछला
                </Button>
                <span className="px-4 py-2 text-sm">
                  {numberPage * 10 + 1}-{Math.min((numberPage + 1) * 10, 100)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNumberPage(Math.min(Math.ceil(numbers.length / 10) - 1, numberPage + 1))}
                  disabled={numberPage >= Math.ceil(numbers.length / 10) - 1}
                >
                  अगला
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pahada">
            <p className="text-center text-muted-foreground mb-4">1 से 20 तक पहाड़ा सीखें</p>
            <div className="space-y-4">
              {selectedPahada ? (
                <div>
                  {renderPahadaTable(selectedPahada)}
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPahada(Math.max(1, selectedPahada - 1))}
                      disabled={selectedPahada === 1}
                    >
                      पिछला पहाड़ा
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPahada(null)}
                    >
                      सभी देखें
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPahada(Math.min(20, selectedPahada + 1))}
                      disabled={selectedPahada === 20}
                    >
                      अगला पहाड़ा
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {pahadas.map((item) => renderPahadaCard(item))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="jod">
            <p className="text-center text-muted-foreground mb-4">जोड़ना सीखें</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {additions.map((item) => renderAdditionCard(item))}
            </div>
          </TabsContent>

          <TabsContent value="ghatav">
            <p className="text-center text-muted-foreground mb-4">घटाना सीखें</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {subtractions.map((item) => (
                <Card
                  key={`${item.num1}-${item.num2}-sub`}
                  className="p-3 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-destructive"
                  onClick={() => {
                    setSelectedCard({ type: 'subtraction', ...item });
                    speakText(`${item.num1} में से ${item.num2} घटाने पर ${item.result}`, "hi-IN");
                  }}
                >
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-destructive">{item.display}</div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guna">
            <p className="text-center text-muted-foreground mb-4">गुणा करना सीखें</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {multiplications.map((item) => (
                <Card
                  key={`${item.num1}-${item.num2}-mul`}
                  className="p-3 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-purple-500"
                  onClick={() => {
                    setSelectedCard({ type: 'multiplication', ...item });
                    speakText(`${item.num1} गुणा ${item.num2} बराबर ${item.result}`, "hi-IN");
                  }}
                >
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-purple-600">{item.display}</div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shapes">
            <p className="text-center text-muted-foreground mb-4">आकार पहचानें</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {shapes.map((shape) => (
                <Card
                  key={shape.name}
                  className="p-4 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-primary"
                  onClick={() => {
                    setSelectedCard({ type: 'shape', ...shape, letter: shape.emoji, word: `${shape.name} (${shape.english})` });
                    speakText(`यह है ${shape.name}, अंग्रेजी में ${shape.english}`, "hi-IN");
                  }}
                >
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl mb-2">{shape.emoji}</div>
                    <div className="text-lg font-bold text-primary">{shape.name}</div>
                    <div className="text-sm text-muted-foreground">{shape.english}</div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colors">
            <p className="text-center text-muted-foreground mb-4">रंग पहचानें</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {colors.map((color) => (
                <Card
                  key={color.name}
                  className="p-4 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-primary"
                  onClick={() => {
                    setSelectedCard({ type: 'color', ...color, letter: color.emoji, word: `${color.name} (${color.english})` });
                    speakText(`यह है ${color.name} रंग, अंग्रेजी में ${color.english}`, "hi-IN");
                  }}
                >
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-2 border-2 border-border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-sm font-bold">{color.name}</div>
                    <div className="text-xs text-muted-foreground">{color.english}</div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3 text-center">📅 सप्ताह के दिन</h3>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => (
                    <Card
                      key={day.hindi}
                      className="p-3 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-primary"
                      onClick={() => {
                        setSelectedCard({ type: 'day', letter: day.emoji, word: `${day.hindi} (${day.english})` });
                        speakText(`${day.hindi}, अंग्रेजी में ${day.english}`, "hi-IN");
                      }}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{day.emoji}</div>
                        <div className="text-xs font-bold">{day.hindi}</div>
                        <div className="text-xs text-muted-foreground">{day.english}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 text-center">📆 महीने</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {months.map((month) => (
                    <Card
                      key={month.hindi}
                      className="p-3 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-accent"
                      onClick={() => {
                        setSelectedCard({ type: 'month', letter: month.emoji, word: `${month.hindi} (${month.english})` });
                        speakText(`${month.hindi}, अंग्रेजी में ${month.english}`, "hi-IN");
                      }}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{month.emoji}</div>
                        <div className="text-xs font-bold">{month.hindi}</div>
                        <div className="text-xs text-muted-foreground">{month.english}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fruits">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3 text-center">🍎 फल (Fruits)</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {fruits.map((fruit) => (
                    <Card
                      key={fruit.hindi}
                      className="p-4 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-primary bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20"
                      onClick={() => {
                        setSelectedCard({ type: 'fruit', letter: fruit.emoji, word: `${fruit.hindi} (${fruit.english})` });
                        speakText(`${fruit.hindi}, अंग्रेजी में ${fruit.english}`, "hi-IN");
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{fruit.emoji}</div>
                        <div className="text-sm font-bold">{fruit.hindi}</div>
                        <div className="text-xs text-muted-foreground">{fruit.english}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 text-center">🥕 सब्जियां (Vegetables)</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {vegetables.map((veg) => (
                    <Card
                      key={veg.hindi}
                      className="p-4 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-accent bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
                      onClick={() => {
                        setSelectedCard({ type: 'vegetable', letter: veg.emoji, word: `${veg.hindi} (${veg.english})` });
                        speakText(`${veg.hindi}, अंग्रेजी में ${veg.english}`, "hi-IN");
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{veg.emoji}</div>
                        <div className="text-sm font-bold">{veg.hindi}</div>
                        <div className="text-xs text-muted-foreground">{veg.english}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="animals">
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-3 text-center">🦁 जानवर (Animals)</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {animals.map((animal) => (
                  <Card
                    key={animal.hindi}
                    className="p-4 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-primary bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20"
                    onClick={() => {
                      setSelectedCard({ type: 'animal', letter: animal.emoji, word: `${animal.hindi} (${animal.english})` });
                      speakText(`${animal.hindi}, अंग्रेजी में ${animal.english}`, "hi-IN");
                    }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{animal.emoji}</div>
                      <div className="text-sm font-bold">{animal.hindi}</div>
                      <div className="text-xs text-muted-foreground">{animal.english}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KidsPlay;
