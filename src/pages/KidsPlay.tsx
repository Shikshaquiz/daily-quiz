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

// Numbers Data
const numbers = [
  { number: "1", word: "एक / One", emoji: "1️⃣", items: "🍎" },
  { number: "2", word: "दो / Two", emoji: "2️⃣", items: "🍎🍎" },
  { number: "3", word: "तीन / Three", emoji: "3️⃣", items: "🍎🍎🍎" },
  { number: "4", word: "चार / Four", emoji: "4️⃣", items: "🍎🍎🍎🍎" },
  { number: "5", word: "पांच / Five", emoji: "5️⃣", items: "🍎🍎🍎🍎🍎" },
  { number: "6", word: "छह / Six", emoji: "6️⃣", items: "⭐⭐⭐⭐⭐⭐" },
  { number: "7", word: "सात / Seven", emoji: "7️⃣", items: "⭐⭐⭐⭐⭐⭐⭐" },
  { number: "8", word: "आठ / Eight", emoji: "8️⃣", items: "🌟🌟🌟🌟🌟🌟🌟🌟" },
  { number: "9", word: "नौ / Nine", emoji: "9️⃣", items: "🌟🌟🌟🌟🌟🌟🌟🌟🌟" },
  { number: "10", word: "दस / Ten", emoji: "🔟", items: "🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈" },
];

const KidsPlay = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<any>(null);

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
      className="p-4 cursor-pointer hover:scale-105 transition-all hover:shadow-lg border-2 hover:border-primary"
      onClick={() => {
        setSelectedCard(item);
        speakText(`${item.number}, ${item.word}`, "hi-IN");
      }}
    >
      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{item.number}</div>
        <div className="text-lg md:text-xl mb-1">{item.items}</div>
        <div className="text-xs md:text-sm text-muted-foreground">{item.word}</div>
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
        {selectedCard && (
          <Card className="p-6 mb-6 bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl md:text-6xl">{selectedCard.emoji || selectedCard.items}</div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold">{selectedCard.letter || selectedCard.number}</div>
                  <div className="text-lg md:text-xl opacity-90">{selectedCard.word}</div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => speakText(selectedCard.word, selectedCard.letter?.match(/[A-Z]/) ? "en-US" : "hi-IN")}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        )}

        {/* Tabs for different content */}
        <Tabs defaultValue="hindi" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="hindi">हिंदी वर्णमाला</TabsTrigger>
            <TabsTrigger value="english">English ABC</TabsTrigger>
            <TabsTrigger value="numbers">गिनती 1-10</TabsTrigger>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {numbers.map((item) => renderNumberCard(item))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KidsPlay;