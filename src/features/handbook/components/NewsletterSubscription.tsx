import React, { useState } from "react";
import { apiService } from "../../../services/api";
import { Button } from "../../../components/ui/Button";
import { SUBJECT_MAPS } from "../../../constants/subjects";

interface NewsletterSubscriptionProps {
  variant?: "sidebar" | "dashboard";
}

const getSubjectEmoji = (key: string): string => {
  switch (key) {
    case "JAVASCRIPT": return "🟡";
    case "REACT": return "⚛️";
    case "HTML_CSS": return "🎨";
    case "NETWORK": return "📡";
    case "WEB": return "🌐";
    case "OS": return "💻";
    case "DATABASE": return "🗄️";
    case "JAVA": return "☕";
    case "SPRING": return "🍃";
    case "DEVOPS": return "♾️";
    case "ARCHITECTURE": return "📐";
    case "ALGORITHM": return "🧩";
    default: return "📝";
  }
};

export const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({ variant = "sidebar" }) => {
  const [emailInput, setEmailInput] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["ALL"]);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [unsubscribed, setUnsubscribed] = useState<boolean>(false);
  const [subError, setSubError] = useState<string | null>(null);

  // Unsubscribe modal states
  const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState<boolean>(false);
  const [unsubscribeEmailInput, setUnsubscribeEmailInput] = useState<string>("");
  const [unsubscribeSuccess, setUnsubscribeSuccess] = useState<boolean>(false);
  const [unsubscribeError, setUnsubscribeError] = useState<string | null>(null);
  const [isUnsubscribingApi, setIsUnsubscribingApi] = useState<boolean>(false);

  const openUnsubscribeModal = () => {
    setUnsubscribeEmailInput(emailInput);
    setUnsubscribeError(null);
    setUnsubscribeSuccess(false);
    setIsUnsubscribeModalOpen(true);
  };

  const handleToggleCategory = (key: string) => {
    if (key === "ALL") {
      setSelectedCategories(["ALL"]);
    } else {
      setSelectedCategories((prev) => {
        const filtered = prev.filter((k) => k !== "ALL");
        if (filtered.includes(key)) {
          const next = filtered.filter((k) => k !== key);
          return next.length === 0 ? ["ALL"] : next;
        } else {
          return [...filtered, key];
        }
      });
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    const normalizedEmail = emailInput.trim();
    if (!normalizedEmail) return;

    if (!validateEmail(normalizedEmail)) {
      setSubError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (selectedCategories.length === 0) {
      setSubError("최소 하나 이상의 카테고리를 선택해 주세요.");
      return;
    }

    setIsSubscribing(true);
    setSubError(null);
    setSubscribed(false);
    setUnsubscribed(false);
    try {
      const categoryParam = selectedCategories.join(",");
      await apiService.subscribeNewsletter(normalizedEmail, categoryParam);
      setSubscribed(true);
      setEmailInput("");
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      setSubError(error.message || "구독 등록에 실패했습니다.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleModalUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = unsubscribeEmailInput.trim();
    if (!normalizedEmail) return;

    if (!validateEmail(normalizedEmail)) {
      setUnsubscribeError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsUnsubscribingApi(true);
    setUnsubscribeError(null);
    setUnsubscribeSuccess(false);
    try {
      await apiService.unsubscribeNewsletter(normalizedEmail);
      setUnsubscribeSuccess(true);
      setUnsubscribeEmailInput("");
      // Keep it open for 2 seconds to show success state, then close
      setTimeout(() => {
        setIsUnsubscribeModalOpen(false);
        setUnsubscribeSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      setUnsubscribeError(error.message || "구독 해제에 실패했습니다.");
    } finally {
      setIsUnsubscribingApi(false);
    }
  };

  if (variant === "dashboard") {
    return (
      <div className="w-full max-w-[960px] mx-auto bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl p-lg md:p-xl relative overflow-hidden transition-all duration-300">
        {/* Accent Light Glow effect in background */}
        <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-apple-primary/5 dark:bg-apple-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none select-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-xl relative z-10">
          {/* Left Side: Benefits & Copy */}
          <div className="md:col-span-7 flex flex-col justify-between gap-xl">
            <div className="flex flex-col gap-md">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-apple-primary dark:text-apple-primary-on-dark bg-apple-primary/5 dark:bg-apple-primary/10 border border-apple-primary/15 dark:border-apple-primary/20 px-3 py-1 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span>데일리 챌린지 구독</span>
                  <span className="font-bold text-[9px] bg-apple-primary/10 px-1 py-[1px] rounded">Daily</span>
                </span>
              </div>
              <h2 className="text-[26px] md:text-[34px] font-bold text-apple-ink dark:text-white leading-tight font-display tracking-tight">
                매일 아침 9시,<br />메일함에서 시작하는 하루 5분 면접 준비.
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-apple-body-muted leading-relaxed max-w-[480px]">
                바쁜 일상 속 단 5분만 투자해 보세요. 엄선된 1개의 핵심 기술 면접 질문이 메일로 전송됩니다. (해설과 꼬리 질문은 메일 내 상세 버튼을 눌러 바로 접근할 수 있습니다.)
              </p>
            </div>

            {/* Email Card Preview Mockup */}
            <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-apple-surface-black rounded-xl p-md max-w-[480px] shadow-[rgba(0,0,0,0.01)_0px_4px_16px] dark:shadow-[rgba(0,0,0,0.3)_0px_8px_24px] select-none transition-all duration-300 hover:border-apple-primary/20 hover:scale-[1.005] my-md md:my-0">
              {/* Fake Inbox Header */}
              <div className="flex items-center justify-between pb-xs border-b border-black/5 dark:border-white/5 text-[11px]">
                <div className="flex items-center gap-xs">
                  <div className="w-5 h-5 rounded-full bg-apple-primary/10 text-apple-primary dark:text-apple-primary-on-dark flex items-center justify-center font-bold text-[10px]">
                    F
                  </div>
                  <div>
                    <span className="font-semibold text-apple-ink dark:text-white">풀스택 개념북 챌린지</span>
                    <span className="text-gray-400 dark:text-apple-body-muted/40 font-mono ml-xxs">&lt;challenge@concept-book.com&gt;</span>
                  </div>
                </div>
                <span className="text-gray-400 dark:text-apple-body-muted/60 font-mono">오전 9:00</span>
              </div>
              {/* Email Body */}
              <div className="pt-sm flex flex-col gap-xs">
                <span className="text-[11px] text-gray-400 dark:text-apple-body-muted">안녕하세요! 오늘의 데일리 챌린지 질문을 발송해 드립니다.</span>
                <div className="bg-apple-canvas-parchment dark:bg-apple-surface-tile-1/40 border border-black/5 dark:border-white/5 rounded p-sm my-xxs">
                  <p className="text-[12px] font-semibold text-apple-ink dark:text-white leading-normal">
                    Q. React 19의 Server Component와 Client Component의 경계 및 데이터 직렬화 메커니즘을 설명하시오.
                  </p>
                </div>
                {/* Action Blue CTA Preview */}
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-xxs bg-apple-primary text-white text-[11px] font-semibold px-md py-xs rounded-full cursor-default">
                    <span>해설 및 꼬리 질문 보러가기</span>
                    <span className="text-[10px]">➔</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist benefits */}
            <div className="flex flex-col gap-sm border-t border-black/5 dark:border-white/5 pt-md max-w-[480px]">
              <div className="flex gap-sm">
                <div className="w-5 h-5 rounded-full bg-apple-primary/10 text-apple-primary dark:text-apple-primary-on-dark flex items-center justify-center flex-shrink-0 mt-[2px]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-apple-ink dark:text-white">카테고리 다중 구독</h4>
                  <p className="text-[11px] text-gray-500 dark:text-apple-body-muted mt-[1px]">원하는 과목만 쏙쏙 골라서 받아보는 개인화 메일링</p>
                </div>
              </div>
              <div className="flex gap-sm">
                <div className="w-5 h-5 rounded-full bg-apple-primary/10 text-apple-primary dark:text-apple-primary-on-dark flex items-center justify-center flex-shrink-0 mt-[2px]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-apple-ink dark:text-white">꼬리 질문 & 함정 피하기</h4>
                  <p className="text-[11px] text-gray-500 dark:text-apple-body-muted mt-[1px]">해설 페이지에서 면접관 시각의 꼬리 질문과 주의 사항(Caveats) 제공</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Subscription Form */}
          <div className="md:col-span-5 flex flex-col justify-between gap-lg bg-apple-canvas-parchment dark:bg-[#2C2C2E]/30 border border-black/5 dark:border-white/5 rounded-xl p-lg">
            <div className="flex flex-col gap-md">
              <div>
                <h3 className="text-[14px] font-semibold text-apple-ink dark:text-white">구독 설정</h3>
                <p className="text-[11px] text-gray-500 dark:text-apple-body-muted mt-[2px]">원하는 과목을 선택하고 이메일을 등록하세요.</p>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-sm">
                <div className="flex flex-col gap-xxs">
                  <label htmlFor="subscriber-email-dashboard" className="text-[10px] font-mono uppercase tracking-wider text-gray-400 dark:text-apple-body-muted font-semibold">이메일 주소</label>
                  <div className="relative">
                    <input
                      type="email"
                      id="subscriber-email-dashboard"
                      placeholder="yourname@domain.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      disabled={isSubscribing}
                      required
                      className="w-full bg-white dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-md py-sm pl-md pr-10 text-[13px] text-apple-ink dark:text-white placeholder-gray-400 dark:placeholder-apple-body-muted/40 focus:outline-none focus:ring-1 focus:ring-apple-primary focus:border-apple-primary transition-all disabled:opacity-50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none text-[14px]">✉️</span>
                  </div>
                </div>

                <div className="flex flex-col gap-xxs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 dark:text-apple-body-muted font-semibold">구독 카테고리 (다중 선택 가능)</span>
                  <div className="flex flex-wrap gap-2 mt-xxs">
                    {Object.entries(SUBJECT_MAPS)
                      .sort(([keyA], [keyB]) => {
                        if (keyA === "ALL") return -1;
                        if (keyB === "ALL") return 1;
                        return 0;
                      })
                      .map(([key, map]) => {
                        const isSelected = selectedCategories.includes(key);
                        const isAll = key === "ALL";
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleToggleCategory(key)}
                            disabled={isSubscribing}
                            className={`px-md py-[6px] text-[11px] font-medium rounded-full border transition-all duration-200 cursor-pointer select-none active:scale-[0.97] flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-apple-primary/10 text-apple-primary dark:text-apple-primary-on-dark border-apple-primary/35 dark:border-apple-primary/45 shadow-xs"
                                : "bg-black/5 dark:bg-white/5 text-gray-500 dark:text-apple-body-muted border-black/10 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/15 dark:hover:border-white/10"
                            }`}
                          >
                            <span className="text-[11px]">{isAll ? "🌐" : getSubjectEmoji(key)}</span>
                            <span>{map.label}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="flex flex-col gap-sm mt-md">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    disabled={isSubscribing}
                    onClick={handleSubscribe}
                    className="w-full hover:scale-[1.01] transition-all flex items-center justify-center"
                  >
                    {isSubscribing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        구독 등록 중...
                      </>
                    ) : (
                      "챌린지 구독하기"
                    )}
                  </Button>
                  
                  <div className="text-center mt-xs">
                    <button
                      type="button"
                      disabled={isSubscribing}
                      onClick={openUnsubscribeModal}
                      className="text-[11px] text-gray-400 hover:text-apple-primary dark:text-apple-body-muted dark:hover:text-apple-primary-on-dark transition-colors underline focus:outline-none cursor-pointer"
                    >
                      구독 해제(취소)를 원하시나요?
                    </button>
                  </div>
                </div>
              </form>

              {subscribed && (
                <div className="text-green-500 text-[11px] font-mono mt-xs animate-fade-in text-center flex items-center justify-center gap-1 bg-green-500/5 py-xs px-sm rounded border border-green-500/10">
                  <span>✓</span>
                  <span>구독이 완료되었습니다! 매일 아침 메일함을 확인해주세요.</span>
                </div>
              )}
              {unsubscribed && (
                <div className="text-amber-600 dark:text-yellow-500 text-[11px] font-mono mt-xs animate-fade-in text-center flex items-center justify-center gap-1 bg-amber-500/5 py-xs px-sm rounded border border-amber-500/10">
                  <span>✓</span>
                  <span>구독이 취소되었습니다. 언제든 다시 신청하실 수 있습니다.</span>
                </div>
              )}
              {subError && (
                <div className="text-red-500 text-[11px] font-mono mt-xs text-center flex items-center justify-center gap-1 bg-red-500/5 py-xs px-sm rounded border border-red-500/10">
                  <span>✗</span>
                  <span>{subError}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unsubscribe Modal */}
        {isUnsubscribeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-xs animate-fade-in" onClick={() => setIsUnsubscribeModalOpen(false)}>
            <div 
              className="w-full max-w-[380px] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-2xl p-lg relative shadow-xl animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setIsUnsubscribeModalOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-apple-ink dark:hover:text-white text-[16px] focus:outline-none cursor-pointer select-none"
                aria-label="닫기"
              >
                ✕
              </button>

              <div className="flex flex-col gap-sm">
                <div className="text-center md:text-left">
                  <span className="text-[20px]">📭</span>
                  <h3 className="text-[16px] font-bold text-apple-ink dark:text-white mt-xs">데일리 챌린지 구독 해제</h3>
                  <p className="text-[11px] text-gray-500 dark:text-apple-body-muted mt-[2px]">
                    구독을 해제할 이메일 주소를 입력해 주세요.
                  </p>
                </div>

                <form onSubmit={handleModalUnsubscribe} className="flex flex-col gap-sm mt-xs">
                  <div className="flex flex-col gap-xxs">
                    <label htmlFor="modal-unsubscribe-email" className="sr-only">이메일 주소</label>
                    <input
                      type="email"
                      id="modal-unsubscribe-email"
                      placeholder="yourname@domain.com"
                      value={unsubscribeEmailInput}
                      onChange={(e) => setUnsubscribeEmailInput(e.target.value)}
                      disabled={isUnsubscribingApi}
                      required
                      className="w-full bg-white dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-md py-sm px-md text-[13px] text-apple-ink dark:text-white placeholder-gray-400 dark:placeholder-apple-body-muted/40 focus:outline-none focus:ring-1 focus:ring-apple-primary focus:border-apple-primary transition-all disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-xs mt-xs">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isUnsubscribingApi}
                      className="w-full py-sm text-[13px] font-semibold bg-apple-primary text-white rounded-full hover:bg-apple-primary-focus active:scale-[0.98] transition-all flex items-center justify-center gap-xs"
                    >
                      {isUnsubscribingApi ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>처리 중...</span>
                        </>
                      ) : (
                        "구독 해제하기"
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsUnsubscribeModalOpen(false)}
                      className="w-full py-sm text-[12px] font-medium text-gray-400 hover:text-apple-ink dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                </form>

                {unsubscribeSuccess && (
                  <div className="text-green-500 text-[11px] font-mono mt-xs animate-fade-in text-center flex items-center justify-center gap-1 bg-green-500/5 py-xs px-sm rounded border border-green-500/10">
                    <span>✓</span>
                    <span>구독 취소가 정상적으로 처리되었습니다.</span>
                  </div>
                )}
                {unsubscribeError && (
                  <div className="text-red-500 text-[11px] font-mono mt-xs text-center flex items-center justify-center gap-1 bg-red-500/5 py-xs px-sm rounded border border-red-500/10">
                    <span>✗</span>
                    <span>{unsubscribeError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="border-t border-black/10 dark:border-white/5 pt-md mt-sm flex flex-col gap-xs">
        <span className="font-display font-semibold text-[11px] tracking-wider uppercase text-apple-primary dark:text-apple-primary-on-dark flex items-center gap-xxs">
          <span>데일리 챌린지 구독</span>
          <span className="text-[10px] bg-apple-primary/10 border border-apple-primary text-apple-primary dark:text-apple-primary-on-dark px-xxs py-[1px] rounded">Daily</span>
        </span>
        <p className="text-[11px] text-gray-500 dark:text-apple-body-muted leading-relaxed">
          매일 오전 9시, 엄선된 1개의 면접 질문을 메일로 발송해 드립니다. (상세 해설은 메일 내 버튼을 통해 확인 가능)
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-xxs mt-xxs">
          <label htmlFor="subscriber-email" className="sr-only">구독 이메일 주소</label>
          <div className="relative mb-xxs">
            <input
              type="email"
              id="subscriber-email"
              placeholder="yourname@domain.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={isSubscribing}
              required
              className="w-full bg-apple-canvas-parchment dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-md py-xs pl-sm pr-8 text-[12px] text-apple-ink dark:text-white placeholder-gray-400 dark:placeholder-apple-body-muted/40 focus:outline-none focus:border-apple-primary transition-all disabled:opacity-50"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none text-[12px]">✉️</span>
          </div>
          
          <div className="flex flex-col gap-xxs mt-xxs">
            <span className="text-[10px] text-gray-400 dark:text-apple-body-muted font-semibold">구독 카테고리 (다중 가능)</span>
            <div className="flex flex-wrap gap-1.5 mt-[2px]">
              {Object.entries(SUBJECT_MAPS)
                .sort(([keyA], [keyB]) => {
                  if (keyA === "ALL") return -1;
                  if (keyB === "ALL") return 1;
                  return 0;
                })
                .map(([key, map]) => {
                  const isSelected = selectedCategories.includes(key);
                  const isAll = key === "ALL";
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleToggleCategory(key)}
                      disabled={isSubscribing}
                      className={`px-sm py-[4px] text-[9.5px] font-medium rounded-full border transition-all duration-200 cursor-pointer select-none active:scale-[0.97] flex items-center gap-1 ${
                        isSelected
                          ? "bg-apple-primary/10 text-apple-primary dark:text-apple-primary-on-dark border-apple-primary/35 dark:border-apple-primary/45"
                          : "bg-black/5 dark:bg-white/5 text-gray-500 dark:text-apple-body-muted border-black/10 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/15 dark:hover:border-white/10"
                      }`}
                    >
                      <span className="text-[10px]">{isAll ? "🌐" : getSubjectEmoji(key)}</span>
                      <span>{map.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="flex flex-col gap-xxs mt-md">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isSubscribing}
              onClick={handleSubscribe}
              className="w-full hover:scale-[1.01] transition-all flex items-center justify-center"
            >
              {isSubscribing ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>등록 중...</span>
                </>
              ) : (
                "데일리 챌린지 구독"
              )}
            </Button>
            
            <div className="text-center mt-xxs">
              <button
                type="button"
                disabled={isSubscribing}
                onClick={openUnsubscribeModal}
                className="text-[10px] text-gray-400 hover:text-apple-primary dark:text-apple-body-muted dark:hover:text-apple-primary-on-dark transition-colors underline focus:outline-none cursor-pointer"
              >
                구독 취소
              </button>
            </div>
          </div>
        </form>
        {subscribed && (
          <p className="text-green-500 text-[10px] font-mono mt-xxs animate-fade-in">
            ✓ 구독이 완료되었습니다!
          </p>
        )}
        {unsubscribed && (
          <p className="text-amber-600 dark:text-yellow-500 text-[10px] font-mono mt-xxs animate-fade-in">
            ✓ 구독이 취소되었습니다.
          </p>
        )}
        {subError && (
          <p className="text-red-500 text-[10px] font-mono mt-xxs">
            ✗ {subError}
          </p>
        )}
      </div>

      {/* Unsubscribe Modal */}
      {isUnsubscribeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-xs animate-fade-in" onClick={() => setIsUnsubscribeModalOpen(false)}>
          <div 
            className="w-full max-w-[340px] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-2xl p-lg relative shadow-xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setIsUnsubscribeModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-apple-ink dark:hover:text-white text-[16px] focus:outline-none cursor-pointer select-none"
              aria-label="닫기"
            >
              ✕
            </button>

            <div className="flex flex-col gap-sm">
              <div className="text-center md:text-left">
                <span className="text-[20px]">📭</span>
                <h3 className="text-[15px] font-bold text-apple-ink dark:text-white mt-xs">데일리 챌린지 구독 해제</h3>
                <p className="text-[11px] text-gray-500 dark:text-apple-body-muted mt-[2px]">
                  구독을 해제할 이메일 주소를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handleModalUnsubscribe} className="flex flex-col gap-sm mt-xs">
                <div className="flex flex-col gap-xxs">
                  <label htmlFor="sidebar-modal-unsubscribe-email" className="sr-only">이메일 주소</label>
                  <input
                    type="email"
                    id="sidebar-modal-unsubscribe-email"
                    placeholder="yourname@domain.com"
                    value={unsubscribeEmailInput}
                    onChange={(e) => setUnsubscribeEmailInput(e.target.value)}
                    disabled={isUnsubscribingApi}
                    required
                    className="w-full bg-apple-canvas-parchment dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-md py-sm px-md text-[12px] text-apple-ink dark:text-white placeholder-gray-400 dark:placeholder-apple-body-muted/40 focus:outline-none focus:border-apple-primary transition-all disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-xs mt-xs">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isUnsubscribingApi}
                    className="w-full py-sm text-[11px] font-semibold bg-apple-primary text-white rounded-full hover:bg-apple-primary-focus active:scale-[0.98] transition-all flex items-center justify-center gap-xs"
                  >
                    {isUnsubscribingApi ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>처리 중...</span>
                      </>
                    ) : (
                      "구독 해제하기"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsUnsubscribeModalOpen(false)}
                    className="w-full py-sm text-[11px] font-medium text-gray-400 hover:text-apple-ink dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </form>

              {unsubscribeSuccess && (
                <div className="text-green-500 text-[10px] font-mono mt-xs animate-fade-in text-center flex items-center justify-center gap-1 bg-green-500/5 py-xs px-sm rounded border border-green-500/10">
                  <span>✓</span>
                  <span>구독 취소가 완료되었습니다.</span>
                </div>
              )}
              {unsubscribeError && (
                <div className="text-red-500 text-[10px] font-mono mt-xs text-center flex items-center justify-center gap-1 bg-red-500/5 py-xs px-sm rounded border border-red-500/10">
                  <span>✗</span>
                  <span>{unsubscribeError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
