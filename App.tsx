
import React, { useState, useCallback, useEffect } from 'react';
import { generateQuestions } from './services/mathService';
import { verifyAnswer } from './services/geminiService';
import { Question, AppStatus } from './types';
import MathDisplay from './components/MathDisplay';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.START);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const startQuiz = () => {
    const q = generateQuestions(4);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-6 text-white text-center">
          <h1 className="text-3xl font-bold tracking-tight">因式分解挑戰</h1>
          <p className="text-indigo-100 mt-2 opacity-90">Algebraic Factorization Master</p>
        </div>

        <div className="p-8">
          {status === AppStatus.START && (
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-indigo-50 rounded-full">
                  <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                歡迎來到因式分解測驗！<br/>
                系統將會隨機生成 4 題數學題，請輸入正確的因式分解式。
              </p>
              <button 
                onClick={startQuiz}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-200"
              >
                開始測驗
              </button>
            </div>
          )}

          {status === AppStatus.QUIZ && questions[currentIdx] && (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-slate-400 font-medium">
                <span>第 {currentIdx + 1} / {questions.length} 題</span>
                <span className="text-indigo-600">目前得分：{score}</span>
              </div>

              <div className="py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <MathDisplay tex={questions[currentIdx].expression} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">請輸入您的解答：</label>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="例如: (x+2)(x-1)"
                    disabled={!!feedback || loading}
                    className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all text-lg font-medium"
                    autoFocus
                  />
                </div>

                {!feedback && (
                  <button
                    type="submit"
                    disabled={!userInput || loading}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 
                      ${!userInput || loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        AI 正在驗證...
                      </>
                    ) : '提交答案'}
                  </button>
                )}
              </form>

              {feedback && (
                <div className={`p-6 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300 ${feedback.correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${feedback.correct ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                      {feedback.correct ? '✓' : '✕'}
                    </div>
                    <div>
                      <h4 className={`font-bold ${feedback.correct ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {feedback.correct ? '回答正確！' : '回答錯誤'}
                      </h4>
                      <p className="text-slate-600 mt-1">{feedback.explanation}</p>
                      {!feedback.correct && (
                        <div className="mt-4 pt-4 border-t border-rose-100">
                          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">參考答案</span>
                          <div className="mt-1 font-mono text-slate-800 bg-white p-2 rounded border border-rose-100">
                            {questions[currentIdx].expectedAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNext}
                    className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all"
                  >
                    {currentIdx === questions.length - 1 ? '查看結算' : '下一題'}
                  </button>
                </div>
              )}
            </div>
          )}

          {status === AppStatus.RESULT && (
            <div className="text-center space-y-8 py-4">
              <div className="relative inline-block">
                <svg className="w-32 h-32 text-indigo-100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    className="text-indigo-600"
                    strokeDasharray={`${(score / questions.length) * 283} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{score} / {questions.length}</span>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">分</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {score === questions.length ? '卓越非凡！完璧歸趙' : score >= questions.length / 2 ? '表現不錯，再接再厲' : '需要多加練習喔'}
                </h2>
                <p className="text-slate-500 mt-2">
                  您完成了所有題目，總得分為 {Math.round((score / questions.length) * 100)} 分。
                </p>
              </div>

              <button 
                onClick={startQuiz}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-xl transition-all"
              >
                再試一次
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Powered by Gemini AI</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(dot => (
              <div key={dot} className={`w-1.5 h-1.5 rounded-full ${status === AppStatus.QUIZ && currentIdx + 1 >= dot ? 'bg-indigo-400' : 'bg-slate-200'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
