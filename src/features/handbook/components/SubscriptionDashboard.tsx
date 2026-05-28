import React from "react";
import { SEO } from "../../../components/SEO";
import { NewsletterSubscription } from "./NewsletterSubscription";

export const SubscriptionDashboard: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  return (
    <div className="flex-1 flex items-center justify-center max-w-[1200px] w-full mx-auto px-lg py-xl">
      {isActive && <SEO title="데일리 챌린지 구독 | 풀스택 개념북" />}
      <NewsletterSubscription variant="dashboard" />
    </div>
  );
};
