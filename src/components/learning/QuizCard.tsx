import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizCardProps {
  title: string;
  questions: QuizQuestion[];
}

const QuizCard = ({ title, questions }: QuizCardProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="k8s-card text-center">
        <HelpCircle className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="font-display font-bold text-xl text-foreground">Quiz Complete!</h3>
        <p className="text-muted-foreground mt-2">
          You got <span className="text-primary font-bold">{score}</span> out of{" "}
          <span className="font-bold">{questions.length}</span> correct
        </p>
        <button
          onClick={handleReset}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="k8s-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {currentQ + 1}/{questions.length}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground mb-4">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(i)}
            className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-all ${
              showResult && i === q.correctIndex
                ? "border-k8s-green bg-k8s-green/10 text-foreground"
                : showResult && i === selected && i !== q.correctIndex
                ? "border-k8s-red bg-k8s-red/10 text-foreground"
                : selected === i
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              {showResult && i === q.correctIndex && <CheckCircle2 className="h-4 w-4 text-k8s-green shrink-0" />}
              {showResult && i === selected && i !== q.correctIndex && <XCircle className="h-4 w-4 text-k8s-red shrink-0" />}
              {opt}
            </div>
          </motion.button>
        ))}
      </div>
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">{q.explanation}</p>
          <button
            onClick={handleNext}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default QuizCard;
