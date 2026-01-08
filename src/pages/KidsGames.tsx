import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RotateCcw, Volume2, Trophy, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Game Data
const memoryGameData = {
  alphabets: [
    { id: 1, hindi: "अ", english: "A", word: "आम", emoji: "🥭" },
    { id: 2, hindi: "आ", english: "B", word: "बिल्ली", emoji: "🐱" },
    { id: 3, hindi: "इ", english: "C", word: "चिड़िया", emoji: "🐦" },
    { id: 4, hindi: "ई", english: "D", word: "डोल", emoji: "🪣" },
    { id: 5, hindi: "उ", english: "E", word: "उल्लू", emoji: "🦉" },
    { id: 6, hindi: "ऊ", english: "F", word: "फूल", emoji: "🌸" },
  ],
  numbers: [
    { id: 1, number: "1", hindi: "एक", emoji: "1️⃣" },
    { id: 2, number: "2", hindi: "दो", emoji: "2️⃣" },
    { id: 3, number: "3", hindi: "तीन", emoji: "3️⃣" },
    { id: 4, number: "4", hindi: "चार", emoji: "4️⃣" },
    { id: 5, number: "5", hindi: "पाँच", emoji: "5️⃣" },
    { id: 6, number: "6", hindi: "छह", emoji: "6️⃣" },
  ],
  fruits: [
    { id: 1, hindi: "सेब", english: "Apple", emoji: "🍎" },
    { id: 2, hindi: "केला", english: "Banana", emoji: "🍌" },
    { id: 3, hindi: "अंगूर", english: "Grapes", emoji: "🍇" },
    { id: 4, hindi: "आम", english: "Mango", emoji: "🥭" },
    { id: 5, hindi: "संतरा", english: "Orange", emoji: "🍊" },
    { id: 6, hindi: "तरबूज", english: "Watermelon", emoji: "🍉" },
  ],
  animals: [
    { id: 1, hindi: "शेर", english: "Lion", emoji: "🦁" },
    { id: 2, hindi: "हाथी", english: "Elephant", emoji: "🐘" },
    { id: 3, hindi: "बंदर", english: "Monkey", emoji: "🐵" },
    { id: 4, hindi: "गाय", english: "Cow", emoji: "🐄" },
    { id: 5, hindi: "कुत्ता", english: "Dog", emoji: "🐕" },
    { id: 6, hindi: "बिल्ली", english: "Cat", emoji: "🐱" },
  ],
};

const quizQuestions = [
  { emoji: "🍎", options: ["सेब", "केला", "आम", "संतरा"], correct: "सेब", english: "Apple" },
  { emoji: "🐘", options: ["शेर", "हाथी", "बंदर", "गाय"], correct: "हाथी", english: "Elephant" },
  { emoji: "🌸", options: ["पत्ता", "फूल", "पेड़", "घास"], correct: "फूल", english: "Flower" },
  { emoji: "🍌", options: ["सेब", "केला", "अंगूर", "आम"], correct: "केला", english: "Banana" },
  { emoji: "🦁", options: ["बाघ", "शेर", "भालू", "लोमड़ी"], correct: "शेर", english: "Lion" },
  { emoji: "🔴", options: ["नीला", "हरा", "लाल", "पीला"], correct: "लाल", english: "Red" },
  { emoji: "🟢", options: ["नीला", "हरा", "लाल", "पीला"], correct: "हरा", english: "Green" },
  { emoji: "🐦", options: ["मछली", "चिड़िया", "मेंढक", "साँप"], correct: "चिड़िया", english: "Bird" },
  { emoji: "🥕", options: ["आलू", "गाजर", "टमाटर", "प्याज"], correct: "गाजर", english: "Carrot" },
  { emoji: "⭐", options: ["चाँद", "सूरज", "तारा", "बादल"], correct: "तारा", english: "Star" },
];

const sortingData = {
  alphabets: {
    hindi: ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ"],
    english: ["A", "B", "C", "D", "E", "F", "G", "H"],
  },
  numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
};

const soundIdentifyData = [
  { word: "सेब", english: "Apple", emoji: "🍎", options: ["🍎", "🍌", "🍇", "🥭"] },
  { word: "हाथी", english: "Elephant", emoji: "🐘", options: ["🦁", "🐘", "🐵", "🐄"] },
  { word: "गाय", english: "Cow", emoji: "🐄", options: ["🐕", "🐱", "🐄", "🐎"] },
  { word: "फूल", english: "Flower", emoji: "🌸", options: ["🌳", "🌸", "🍃", "🌿"] },
  { word: "केला", english: "Banana", emoji: "🍌", options: ["🍎", "🍌", "🍊", "🍇"] },
  { word: "शेर", english: "Lion", emoji: "🦁", options: ["🦁", "🐯", "🐻", "🦊"] },
  { word: "तारा", english: "Star", emoji: "⭐", options: ["🌙", "☀️", "⭐", "☁️"] },
  { word: "गाजर", english: "Carrot", emoji: "🥕", options: ["🥔", "🥕", "🍅", "🧅"] },
];

const spellingWords = [
  { word: "CAT", hint: "🐱 बिल्ली", hindi: "बिल्ली" },
  { word: "DOG", hint: "🐕 कुत्ता", hindi: "कुत्ता" },
  { word: "SUN", hint: "☀️ सूरज", hindi: "सूरज" },
  { word: "BALL", hint: "⚽ गेंद", hindi: "गेंद" },
  { word: "BOOK", hint: "📚 किताब", hindi: "किताब" },
  { word: "FISH", hint: "🐟 मछली", hindi: "मछली" },
  { word: "TREE", hint: "🌳 पेड़", hindi: "पेड़" },
  { word: "STAR", hint: "⭐ तारा", hindi: "तारा" },
  { word: "MOON", hint: "🌙 चाँद", hindi: "चाँद" },
  { word: "BIRD", hint: "🐦 चिड़िया", hindi: "चिड़िया" },
];

interface MemoryCard {
  id: number;
  content: string;
  type: "emoji" | "text";
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const KidsGames = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("memory");
  
  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryCategory, setMemoryCategory] = useState<"fruits" | "animals">("fruits");
  
  // Quiz Game State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  // Sorting Game State
  const [sortingItems, setSortingItems] = useState<string[]>([]);
  const [sortingType, setSortingType] = useState<"hindi" | "english" | "numbers">("numbers");
  const [sortingComplete, setSortingComplete] = useState(false);
  
  // Sound Game State
  const [soundQuestion, setSoundQuestion] = useState(0);
  const [soundScore, setSoundScore] = useState(0);
  const [soundAnswered, setSoundAnswered] = useState(false);

  // Spelling Game State
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [spellingInput, setSpellingInput] = useState("");
  const [spellingScore, setSpellingScore] = useState(0);
  const [spellingAnswered, setSpellingAnswered] = useState(false);
  const [spellingCorrect, setSpellingCorrect] = useState<boolean | null>(null);

  // Speech function
  const speakText = useCallback((text: string, lang: string = "hi-IN") => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Initialize Memory Game
  const initMemoryGame = useCallback(() => {
    const data = memoryGameData[memoryCategory];
    const cards: MemoryCard[] = [];
    
    data.forEach((item, index) => {
      cards.push({
        id: index * 2,
        content: item.emoji,
        type: "emoji",
        pairId: item.id,
        isFlipped: false,
        isMatched: false,
      });
      cards.push({
        id: index * 2 + 1,
        content: item.hindi,
        type: "text",
        pairId: item.id,
        isFlipped: false,
        isMatched: false,
      });
    });
    
    // Shuffle cards
    const shuffled = cards.sort(() => Math.random() - 0.5);
    setMemoryCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMemoryMoves(0);
  }, [memoryCategory]);

  // Initialize Sorting Game
  const initSortingGame = useCallback(() => {
    let items: string[];
    if (sortingType === "numbers") {
      items = [...sortingData.numbers];
    } else {
      items = [...sortingData.alphabets[sortingType]];
    }
    // Shuffle
    setSortingItems(items.sort(() => Math.random() - 0.5));
    setSortingComplete(false);
  }, [sortingType]);

  useEffect(() => {
    initMemoryGame();
  }, [initMemoryGame]);

  useEffect(() => {
    initSortingGame();
  }, [initSortingGame]);

  // Memory Game Logic
  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;
    
    const card = memoryCards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    const newCards = memoryCards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setMemoryCards(newCards);
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    
    if (newFlipped.length === 2) {
      setMemoryMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);
      
      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found
        setTimeout(() => {
          setMemoryCards(cards => cards.map(c => 
            c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
          ));
          setMatchedPairs(m => m + 1);
          setFlippedCards([]);
          toast.success("🎉 बहुत बढ़िया! Match हो गया!");
          speakText("बहुत बढ़िया");
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setMemoryCards(cards => cards.map(c => 
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Quiz Game Logic
  const handleQuizAnswer = (answer: string) => {
    if (quizAnswered) return;
    
    setSelectedAnswer(answer);
    setQuizAnswered(true);
    
    if (answer === quizQuestions[currentQuestion].correct) {
      setQuizScore(s => s + 1);
      toast.success("🎉 सही जवाब!");
      speakText("सही जवाब");
    } else {
      toast.error(`❌ गलत! सही जवाब: ${quizQuestions[currentQuestion].correct}`);
      speakText("गलत जवाब");
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(q => q + 1);
      setQuizAnswered(false);
      setSelectedAnswer(null);
    } else {
      toast.success(`🏆 खेल पूरा! Score: ${quizScore + (selectedAnswer === quizQuestions[currentQuestion].correct ? 1 : 0)}/${quizQuestions.length}`);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setSelectedAnswer(null);
  };

  // Sorting Game Logic
  const handleSortingDrag = (dragIndex: number, dropIndex: number) => {
    const newItems = [...sortingItems];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, removed);
    setSortingItems(newItems);
    
    // Check if sorted correctly
    let correctOrder: string[];
    if (sortingType === "numbers") {
      correctOrder = sortingData.numbers;
    } else {
      correctOrder = sortingData.alphabets[sortingType];
    }
    
    if (JSON.stringify(newItems) === JSON.stringify(correctOrder)) {
      setSortingComplete(true);
      toast.success("🎉 बहुत बढ़िया! सही क्रम में लगा दिया!");
      speakText("बहुत बढ़िया");
    }
  };

  const moveItem = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortingItems.length) return;
    handleSortingDrag(index, newIndex);
  };

  // Sound Game Logic
  const handleSoundAnswer = (emoji: string) => {
    if (soundAnswered) return;
    
    setSoundAnswered(true);
    
    if (emoji === soundIdentifyData[soundQuestion].emoji) {
      setSoundScore(s => s + 1);
      toast.success("🎉 सही पहचाना!");
      speakText("सही पहचाना");
    } else {
      toast.error(`❌ गलत! सही जवाब: ${soundIdentifyData[soundQuestion].emoji}`);
    }
  };

  const nextSoundQuestion = () => {
    if (soundQuestion < soundIdentifyData.length - 1) {
      setSoundQuestion(q => q + 1);
      setSoundAnswered(false);
    } else {
      toast.success(`🏆 खेल पूरा! Score: ${soundScore}/${soundIdentifyData.length}`);
    }
  };

  const resetSoundGame = () => {
    setSoundQuestion(0);
    setSoundScore(0);
    setSoundAnswered(false);
  };

  const playSoundQuestion = () => {
    const data = soundIdentifyData[soundQuestion];
    speakText(data.word, "hi-IN");
    setTimeout(() => {
      speakText(data.english, "en-US");
    }, 1500);
  };

  // Spelling Game Logic
  const handleSpellingSubmit = () => {
    if (spellingAnswered || !spellingInput.trim()) return;
    
    setSpellingAnswered(true);
    const isCorrect = spellingInput.trim().toUpperCase() === spellingWords[spellingIndex].word;
    setSpellingCorrect(isCorrect);
    
    if (isCorrect) {
      setSpellingScore(s => s + 1);
      toast.success("🎉 सही Spelling!");
      speakText("बहुत बढ़िया, सही spelling");
    } else {
      toast.error(`❌ गलत! सही Spelling: ${spellingWords[spellingIndex].word}`);
      speakText("गलत, फिर से कोशिश करो");
    }
  };

  const nextSpellingWord = () => {
    if (spellingIndex < spellingWords.length - 1) {
      setSpellingIndex(i => i + 1);
      setSpellingInput("");
      setSpellingAnswered(false);
      setSpellingCorrect(null);
    } else {
      toast.success(`🏆 खेल पूरा! Score: ${spellingScore}/${spellingWords.length}`);
    }
  };

  const resetSpellingGame = () => {
    setSpellingIndex(0);
    setSpellingInput("");
    setSpellingScore(0);
    setSpellingAnswered(false);
    setSpellingCorrect(null);
  };

  const speakSpellingHint = () => {
    const data = spellingWords[spellingIndex];
    speakText(data.hindi, "hi-IN");
    setTimeout(() => {
      speakText(data.word.split('').join(' '), "en-US");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/kids-play")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-2xl font-bold">🎮 खेल-खेल में पढ़ाई</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 gap-2 h-auto p-2 bg-white/80 backdrop-blur mb-6">
            <TabsTrigger value="memory" className="text-xs sm:text-sm py-3 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              🃏 Memory
            </TabsTrigger>
            <TabsTrigger value="quiz" className="text-xs sm:text-sm py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white">
              ❓ Quiz
            </TabsTrigger>
            <TabsTrigger value="sorting" className="text-xs sm:text-sm py-3 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              🔢 क्रम
            </TabsTrigger>
            <TabsTrigger value="sound" className="text-xs sm:text-sm py-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              🔊 सुनो
            </TabsTrigger>
            <TabsTrigger value="spelling" className="text-xs sm:text-sm py-3 data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              ✏️ Spelling
            </TabsTrigger>
          </TabsList>

          {/* Memory Match Game */}
          <TabsContent value="memory">
            <Card className="p-6 bg-white/90 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={memoryCategory === "fruits" ? "default" : "outline"}
                      onClick={() => setMemoryCategory("fruits")}
                    >
                      🍎 फल
                    </Button>
                    <Button
                      size="sm"
                      variant={memoryCategory === "animals" ? "default" : "outline"}
                      onClick={() => setMemoryCategory("animals")}
                    >
                      🦁 जानवर
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
                    <Trophy className="h-4 w-4 text-purple-600" />
                    <span className="font-bold text-purple-700">{matchedPairs}/{memoryGameData[memoryCategory].length}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                    <span className="text-sm text-blue-700">Moves: {memoryMoves}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={initMemoryGame}>
                    <RotateCcw className="h-4 w-4 mr-1" /> Reset
                  </Button>
                </div>
              </div>

              {matchedPairs === memoryGameData[memoryCategory].length && (
                <div className="text-center p-6 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-xl mb-6 animate-pulse">
                  <h3 className="text-2xl font-bold text-orange-700">🎉 बहुत बढ़िया! आपने जीत लिया!</h3>
                  <p className="text-orange-600">कुल {memoryMoves} moves में पूरा किया</p>
                </div>
              )}

              <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                {memoryCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    disabled={card.isMatched}
                    className={`aspect-square rounded-xl text-2xl font-bold transition-all duration-300 transform ${
                      card.isFlipped || card.isMatched
                        ? "bg-gradient-to-br from-purple-400 to-pink-400 text-white rotate-0 scale-100"
                        : "bg-gradient-to-br from-blue-400 to-purple-500 text-white hover:scale-105"
                    } ${card.isMatched ? "opacity-60 scale-95" : "shadow-lg hover:shadow-xl"}`}
                  >
                    {card.isFlipped || card.isMatched ? card.content : "?"}
                  </button>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Quiz Game */}
          <TabsContent value="quiz">
            <Card className="p-6 bg-white/90 backdrop-blur max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-700">Score: {quizScore}/{quizQuestions.length}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Q: {currentQuestion + 1}/{quizQuestions.length}
                </div>
                <Button size="sm" variant="outline" onClick={resetQuiz}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>

              <div className="text-center mb-8">
                <p className="text-lg text-muted-foreground mb-4">यह क्या है? (What is this?)</p>
                <div className="text-8xl mb-4 animate-bounce">
                  {quizQuestions[currentQuestion].emoji}
                </div>
                <p className="text-sm text-muted-foreground">
                  ({quizQuestions[currentQuestion].english})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {quizQuestions[currentQuestion].options.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleQuizAnswer(option)}
                    disabled={quizAnswered}
                    className={`text-lg py-6 transition-all ${
                      quizAnswered
                        ? option === quizQuestions[currentQuestion].correct
                          ? "bg-green-500 hover:bg-green-500 text-white"
                          : option === selectedAnswer
                          ? "bg-red-500 hover:bg-red-500 text-white"
                          : "opacity-50"
                        : "hover:scale-105"
                    }`}
                    variant={quizAnswered ? "default" : "outline"}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {quizAnswered && (
                <Button 
                  className="w-full" 
                  onClick={nextQuizQuestion}
                  disabled={currentQuestion === quizQuestions.length - 1 && quizAnswered}
                >
                  {currentQuestion === quizQuestions.length - 1 ? "🏆 खेल पूरा!" : "अगला सवाल →"}
                </Button>
              )}
            </Card>
          </TabsContent>

          {/* Sorting Game */}
          <TabsContent value="sorting">
            <Card className="p-6 bg-white/90 backdrop-blur max-w-2xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={sortingType === "numbers" ? "default" : "outline"}
                    onClick={() => setSortingType("numbers")}
                  >
                    🔢 Numbers
                  </Button>
                  <Button
                    size="sm"
                    variant={sortingType === "hindi" ? "default" : "outline"}
                    onClick={() => setSortingType("hindi")}
                  >
                    अ Hindi
                  </Button>
                  <Button
                    size="sm"
                    variant={sortingType === "english" ? "default" : "outline"}
                    onClick={() => setSortingType("english")}
                  >
                    A English
                  </Button>
                </div>
                <Button size="sm" variant="outline" onClick={initSortingGame}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>

              <p className="text-center text-lg text-muted-foreground mb-6">
                👆 सही क्रम में लगाओ (Arrange in correct order)
              </p>

              {sortingComplete && (
                <div className="text-center p-4 bg-gradient-to-r from-green-200 to-teal-200 rounded-xl mb-6 animate-pulse">
                  <h3 className="text-xl font-bold text-green-700">🎉 बहुत बढ़िया! सही क्रम!</h3>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {sortingItems.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-xl shadow-lg transition-all ${
                        sortingComplete
                          ? "bg-gradient-to-br from-green-400 to-teal-400 text-white"
                          : "bg-gradient-to-br from-blue-400 to-purple-500 text-white"
                      }`}
                    >
                      {item}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => moveItem(index, "left")}
                        disabled={index === 0 || sortingComplete}
                      >
                        ←
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => moveItem(index, "right")}
                        disabled={index === sortingItems.length - 1 || sortingComplete}
                      >
                        →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                💡 Tip: ← → buttons से items को move करें
              </p>
            </Card>
          </TabsContent>

          {/* Sound & Identify Game */}
          <TabsContent value="sound">
            <Card className="p-6 bg-white/90 backdrop-blur max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-orange-600" />
                  <span className="font-bold text-orange-700">Score: {soundScore}/{soundIdentifyData.length}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Q: {soundQuestion + 1}/{soundIdentifyData.length}
                </div>
                <Button size="sm" variant="outline" onClick={resetSoundGame}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>

              <div className="text-center mb-8">
                <p className="text-lg text-muted-foreground mb-4">🎧 सुनो और सही चित्र चुनो</p>
                
                <Button
                  size="lg"
                  onClick={playSoundQuestion}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  <Volume2 className="h-8 w-8 mr-2" />
                  🔊 सुनो
                </Button>

                <p className="text-sm text-muted-foreground mt-4">
                  (Click to hear the word)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {soundIdentifyData[soundQuestion].options.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => handleSoundAnswer(emoji)}
                    disabled={soundAnswered}
                    className={`text-5xl py-8 transition-all ${
                      soundAnswered
                        ? emoji === soundIdentifyData[soundQuestion].emoji
                          ? "bg-green-500 hover:bg-green-500"
                          : "opacity-50"
                        : "hover:scale-105"
                    }`}
                    variant="outline"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>

              {soundAnswered && (
                <Button 
                  className="w-full" 
                  onClick={nextSoundQuestion}
                  disabled={soundQuestion === soundIdentifyData.length - 1}
                >
                  {soundQuestion === soundIdentifyData.length - 1 ? "🏆 खेल पूरा!" : "अगला सवाल →"}
                </Button>
              )}
            </Card>
          </TabsContent>

          {/* Spelling Game */}
          <TabsContent value="spelling">
            <Card className="p-6 bg-white/90 backdrop-blur max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-pink-100 px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-pink-600" />
                  <span className="font-bold text-pink-700">Score: {spellingScore}/{spellingWords.length}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Word: {spellingIndex + 1}/{spellingWords.length}
                </div>
                <Button size="sm" variant="outline" onClick={resetSpellingGame}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>

              <div className="text-center mb-8">
                <p className="text-lg text-muted-foreground mb-4">✏️ इसकी Spelling लिखो</p>
                
                <div className="text-6xl mb-4">{spellingWords[spellingIndex].hint.split(' ')[0]}</div>
                <p className="text-xl font-bold text-pink-600 mb-2">{spellingWords[spellingIndex].hindi}</p>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={speakSpellingHint}
                  className="mb-4"
                >
                  <Volume2 className="h-4 w-4 mr-1" /> सुनो
                </Button>

                {spellingAnswered && (
                  <div className={`p-3 rounded-lg mb-4 ${spellingCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                    <p className={`font-bold text-lg ${spellingCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {spellingCorrect ? '✅ सही!' : `❌ सही Spelling: ${spellingWords[spellingIndex].word}`}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 justify-center mb-4">
                  <input
                    type="text"
                    value={spellingInput}
                    onChange={(e) => setSpellingInput(e.target.value.toUpperCase())}
                    disabled={spellingAnswered}
                    placeholder="यहाँ लिखो..."
                    className="text-center text-2xl font-bold tracking-widest uppercase border-2 border-pink-300 rounded-xl px-4 py-3 w-48 focus:outline-none focus:border-pink-500"
                    maxLength={10}
                    onKeyDown={(e) => e.key === 'Enter' && handleSpellingSubmit()}
                  />
                </div>

                <div className="flex gap-2 justify-center flex-wrap mb-4">
                  {spellingWords[spellingIndex].word.split('').map((letter, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 flex items-center justify-center text-xl font-bold rounded-lg border-2 ${
                        spellingAnswered
                          ? spellingInput[i]?.toUpperCase() === letter
                            ? 'bg-green-100 border-green-400 text-green-700'
                            : 'bg-red-100 border-red-400 text-red-700'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}
                    >
                      {spellingAnswered ? letter : (spellingInput[i] || '_')}
                    </div>
                  ))}
                </div>

                {!spellingAnswered && (
                  <Button 
                    onClick={handleSpellingSubmit}
                    disabled={!spellingInput.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    ✓ Check Spelling
                  </Button>
                )}

                {spellingAnswered && (
                  <Button 
                    className="w-full" 
                    onClick={nextSpellingWord}
                    disabled={spellingIndex === spellingWords.length - 1}
                  >
                    {spellingIndex === spellingWords.length - 1 ? "🏆 खेल पूरा!" : "अगला शब्द →"}
                  </Button>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KidsGames;
