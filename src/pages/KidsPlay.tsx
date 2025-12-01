import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Volume2 } from "lucide-react";

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

const KidsPlay = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [selectedPahada, setSelectedPahada] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("hindi");

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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/classes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">🎮 Kids Play</h1>
            <p className="text-sm text-muted-foreground">सीखें और मज़े करें!</p>
          </div>
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
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="hindi" className="text-xs md:text-sm">हिंदी</TabsTrigger>
            <TabsTrigger value="english" className="text-xs md:text-sm">ABC</TabsTrigger>
            <TabsTrigger value="numbers" className="text-xs md:text-sm">गिनती</TabsTrigger>
            <TabsTrigger value="pahada" className="text-xs md:text-sm">पहाड़ा</TabsTrigger>
            <TabsTrigger value="jod" className="text-xs md:text-sm">जोड़</TabsTrigger>
          </TabsList>

          <TabsContent value="hindi">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {hindiAlphabet.map((item) => renderAlphabetCard(item, true))}
            </div>
          </TabsContent>

          <TabsContent value="english">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {englishAlphabet.map((item) => renderAlphabetCard(item, false))}
            </div>
          </TabsContent>

          <TabsContent value="numbers">
            <p className="text-center text-muted-foreground mb-4">1 से 100 तक गिनती सीखें</p>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {numbers.map((item) => renderNumberCard(item))}
            </div>
          </TabsContent>

          <TabsContent value="pahada">
            <p className="text-center text-muted-foreground mb-4">1 से 20 तक पहाड़ा सीखें</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {pahadas.map((item) => renderPahadaCard(item))}
              </div>
              {selectedPahada && (
                <div>
                  {renderPahadaTable(selectedPahada)}
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
        </Tabs>
      </div>
    </div>
  );
};

export default KidsPlay;
