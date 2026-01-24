
import React, { useState, useCallback, useEffect } from 'react';
import { generateQuestions } from './services/mathService';
import { verifyAnswer } from './services/geminiService';
import { Question, AppStatus, Difficulty } from './types';
import MathDisplay from './components/MathDisplay';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.START);
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const startQuiz = (selectedDiff: Difficulty) => {
    setDifficulty(selectedDiff);
    const q = generateQuestions(selectedDiff, 5); // 5 questions for a better session
    setQuestions(q);
    setCurrentIdx(0);
    setScore(0);
    setStatus(AppStatus.QUIZ);
    setFeedback(null);
    setUserInput('');
    setShowResult(false);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setUserInput('');
      setFeedback(null);
      setShowResult(false);
    } else {
      setStatus(AppStatus.RESULT);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput || loading || feedback) return;

    setLoading(true);
    const result = await verifyAnswer(
      questions[currentIdx].expression,
      userInput,
      questions[currentIdx].expectedAnswer
    );
    setLoading(false);
    setFeedback(result);
    if (result.correct) {
      setScore(prev => prev + 1);
    }
    setShowResult(true);
  };

  const progressPercentage = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  const difficultyConfig = {
    EASY: { color: 'bg-emerald-500', label: '基礎', hover: 'hover:bg-emerald-600', ring: 'ring-emerald-100', text: 'text-emerald-700' },
    MEDIUM: { color: 'bg-amber-500', label: '進階', hover: 'hover:bg-amber-600', ring: 'ring-amber-100', text: 'text-amber-700' },
    HARD: { color: 'bg-rose-500', label: '挑戰', hover: 'hover:bg-rose-600', ring: 'ring-rose-100', text: 'text-rose-700' }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-8 text-white text-center relative">
          <h1 className="text-3xl font-black tracking-tight uppercase">MathFactor</h1>
          <p className="text-indigo-100 mt-1 font-medium opacity-80 italic">因式分解 AI 智慧測驗</p>
          
          {status === AppStatus.QUIZ && (
            <div className="absolute top-4 right-4">
               <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm border border-white/20 ${difficultyConfig[difficulty].color}`}>
                 {difficultyConfig[difficulty].label}模式
               </span>
            </div>
          )}
        </div>

        {/* Global Progress Bar */}
        {status === AppStatus.QUIZ && (
          <div className="w-full bg-slate-100 h-2 overflow-hidden">
            <div 
              className={`${difficultyConfig[difficulty].color} h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        )}

        <div className="p-8">
          {status === AppStatus.START && (
            <div className="text-center space-y-8 py-4">
              <div className="flex justify-center mb-2">
                <div className="p-5 bg-indigo-50 rounded-3xl shadow-inner border border-indigo-100">
                  <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">選擇難度開始測驗</h3>
                <p className="text-slate-500 text-sm">Gemini AI 將即時驗證您的數學邏輯</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((level) => (
                  <button 
                    key={level}
                    onClick={() => startQuiz(level)}
                    className={`group relative overflow-hidden w-full p-5 rounded-2xl transition-all duration-300 border-2 text-left flex items-center justify-between
                      ${level === 'EASY' ? 'border-emerald-100 bg-emerald-50 hover:border-emerald-500' : 
                        level === 'MEDIUM' ? 'border-amber-100 bg-amber-50 hover:border-amber-500' : 
                        'border-rose-100 bg-rose-50 hover:border-rose-500'}`}
                  >
                    <div>
                      <div className={`text-sm font-black uppercase tracking-widest ${difficultyConfig[level].text}`}>
                        {difficultyConfig[level].label}
                      </div>
                      <div className="text-slate-600 text-xs mt-1">
                        {level === 'EASY' ? '基礎二次項與差平方' : 
                         level === 'MEDIUM' ? '十字交乘與完全平方' : 
                         '複雜係數與多變數挑戰'}
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${difficultyConfig[level].color}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {status === AppStatus.QUIZ && questions[currentIdx] && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Current Problem</h4>
                  <div className="text-2xl font-black text-slate-800">
                    題號 <span className="text-indigo-600">{currentIdx + 1}</span>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Score</div>
                   <div className="text-2xl font-black text-emerald-500">{score}</div>
                </div>
              </div>

              <div className="py-12 bg-slate-50 rounded-3xl border-2 border-slate-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-center">
                <MathDisplay tex={questions[currentIdx].expression} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-2 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Your Solution
                  </label>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="(x+a)(x+b)"
                    disabled={!!feedback || loading}
                    className="w-full px-6 py-5 border-2 border-slate-200 rounded-2xl focus:ring-8 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all text-xl font-bold bg-white text-slate-800 placeholder:text-slate-200"
                    autoFocus
                  />
                </div>

                {!feedback && (
                  <button
                    type="submit"
                    disabled={!userInput || loading}
                    className={`w-full py-5 rounded-2xl font-black text-white transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm
                      ${!userInput || loading ? 'bg-slate-200 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 active:shadow-none shadow-indigo-200'}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>AI Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Result</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </>
                    )}
                  </button>
                )}
              </form>

              {feedback && (
                <div className={`p-8 rounded-3xl animate-in fade-in zoom-in-95 duration-300 border-2 ${feedback.correct ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100' : 'bg-rose-50 border-rose-200 shadow-rose-100'} shadow-xl`}>
                  <div className="flex gap-6">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${feedback.correct ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'} text-white shadow-lg`}>
                      {feedback.correct ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-black text-xl uppercase tracking-tight ${feedback.correct ? 'text-emerald-900' : 'text-rose-900'}`}>
                        {feedback.correct ? 'Correct Logic' : 'Incorrect Form'}
                      </h4>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">{feedback.explanation}</p>
                      {!feedback.correct && (
                        <div className="mt-5 pt-5 border-t border-rose-100">
                          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Expected Structure</span>
                          <div className="mt-2 font-mono text-lg text-slate-800 bg-white p-4 rounded-xl border border-rose-100 shadow-sm overflow-x-auto whitespace-nowrap">
                            {questions[currentIdx].expectedAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNext}
                    className="mt-8 w-full py-5 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-slate-200 uppercase tracking-widest text-sm"
                  >
                    {currentIdx === questions.length - 1 ? 'Finish Challenge' : 'Next Level'}
                  </button>
                </div>
              )}
            </div>
          )}

          {status === AppStatus.RESULT && (
            <div className="text-center space-y-10 py-6 animate-in zoom-in-90 duration-700">
              <div className="relative inline-flex">
                <svg className="w-48 h-48 text-slate-50" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    className="text-indigo-600 transition-all duration-1000 ease-out"
                    strokeDasharray={`${(score / questions.length) * 283} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900 leading-none">{score}</span>
                  <div className="w-12 h-1 bg-slate-100 my-2"></div>
                  <span className="text-lg text-slate-400 font-black uppercase tracking-widest">{questions.length}</span>
                </div>
              </div>

              <div className="space-y-3 px-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {score === questions.length ? 'PERFECT SCORE' : score >= questions.length / 2 ? 'GREAT PROGRESS' : 'KEEP PRACTICING'}
                </h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                   您在 <span className={`font-bold ${difficultyConfig[difficulty].text}`}>{difficultyConfig[difficulty].label}模式</span> 中獲得了 {Math.round((score / questions.length) * 100)}% 的成績。
                </p>
              </div>

              <button 
                onClick={() => setStatus(AppStatus.START)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-8 rounded-2xl transition-all shadow-2xl hover:shadow-indigo-100 uppercase tracking-widest text-sm"
              >
                Return to Menu
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Neural Verified
          </span>
          <div className="flex gap-2">
            {questions.length > 0 && Array.from({ length: questions.length }).map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2.5 h-1 rounded-full transition-all duration-500 ${status === AppStatus.QUIZ && currentIdx >= idx ? 'bg-indigo-500 w-6' : 'bg-slate-200'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
