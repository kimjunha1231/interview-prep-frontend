import React, { useState } from "react";
import { apiService } from "../../../services/api";
import { Button } from "../../../components/ui/Button";

export const NewsletterSubscription: React.FC = () => {
  const [emailInput, setEmailInput] = useState<string>("");
  const [subscriptionCategory, setSubscriptionCategory] = useState<string>("ALL");
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [unsubscribed, setUnsubscribed] = useState<boolean>(false);
  const [subError, setSubError] = useState<string | null>(null);

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

    setIsSubscribing(true);
    setSubError(null);
    setSubscribed(false);
    setUnsubscribed(false);
    try {
      await apiService.subscribeNewsletter(normalizedEmail, subscriptionCategory);
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

  const handleUnsubscribe = async () => {
    const normalizedEmail = emailInput.trim();
    if (!normalizedEmail) return;

    if (!validateEmail(normalizedEmail)) {
      setSubError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsSubscribing(true);
    setSubError(null);
    setSubscribed(false);
    setUnsubscribed(false);
    try {
      await apiService.unsubscribeNewsletter(normalizedEmail);
      setUnsubscribed(true);
      setEmailInput("");
      setTimeout(() => setUnsubscribed(false), 5000);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      setSubError(error.message || "구독 해제에 실패했습니다.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="border-t border-black/10 dark:border-white/5 pt-md mt-sm flex flex-col gap-xs">
      <span className="font-display font-semibold text-[11px] tracking-wider uppercase text-apple-primary dark:text-apple-primary-on-dark flex items-center gap-xxs">
        <span>데일리 챌린지 구독</span>
        <span className="text-[10px] bg-apple-primary/10 border border-apple-primary text-apple-primary dark:text-apple-primary-on-dark px-xxs py-[1px] rounded">Daily</span>
      </span>
      <p className="text-[11px] text-gray-500 dark:text-apple-body-muted leading-relaxed">
        매일 오전 9시, 엄선된 1개의 면접 질문과 해설지를 메일로 발송해 드립니다.
      </p>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-xxs mt-xxs">
        <input
          type="email"
          placeholder="yourname@domain.com"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          disabled={isSubscribing}
          required
          className="w-full bg-apple-canvas-parchment dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-md py-xs px-sm text-[12px] text-apple-ink dark:text-white placeholder-gray-400 dark:placeholder-apple-body-muted/40 focus:outline-none focus:border-apple-primary transition-all disabled:opacity-50"
        />
        
        <select
          value={subscriptionCategory}
          onChange={(e) => setSubscriptionCategory(e.target.value)}
          disabled={isSubscribing}
          className="w-full bg-apple-canvas-parchment dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-md py-xs px-sm text-[12px] text-apple-ink dark:text-white focus:outline-none focus:border-apple-primary transition-all disabled:opacity-50 appearance-none cursor-pointer mt-xxs"
          style={{
            backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'none\' stroke=\'%2386868b\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M4 6l4 4 4-4\'/%3E%3C/svg%3E")',
            backgroundPosition: 'right 12px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '12px'
          }}
        >
          <option value="ALL" className="bg-white dark:bg-apple-surface-black text-apple-ink dark:text-white">전체 질문 (ALL)</option>
          <option value="CS" className="bg-white dark:bg-apple-surface-black text-apple-ink dark:text-white">컴퓨터 과학 (CS)</option>
          <option value="FE" className="bg-white dark:bg-apple-surface-black text-apple-ink dark:text-white">프론트엔드 (Frontend)</option>
          <option value="BE" className="bg-white dark:bg-apple-surface-black text-apple-ink dark:text-white">백엔드 (Backend)</option>
        </select>

        <div className="flex gap-xs mt-xxs">
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSubscribing}
            onClick={handleSubscribe}
            className="flex-1 py-[6px] text-[11px] font-semibold tracking-wider hover:scale-[1.01]"
          >
            {isSubscribing ? "진행 중..." : "구독 신청"}
          </Button>
          <Button
            type="button"
            variant="dark-utility"
            size="sm"
            disabled={isSubscribing}
            onClick={handleUnsubscribe}
            className="flex-1 py-[6px] text-[11px] font-semibold tracking-wider hover:scale-[1.01]"
          >
            구독 취소
          </Button>
        </div>
      </form>
      {subscribed && (
        <p className="text-green-500 text-[10px] font-mono mt-xxs animate-pulse">
          ✓ 구독이 완료되었습니다!
        </p>
      )}
      {unsubscribed && (
        <p className="text-amber-600 dark:text-yellow-500 text-[10px] font-mono mt-xxs animate-pulse">
          ✓ 구독이 취소되었습니다.
        </p>
      )}
      {subError && (
        <p className="text-red-500 text-[10px] font-mono mt-xxs">
          ✗ {subError}
        </p>
      )}
    </div>
  );
};
