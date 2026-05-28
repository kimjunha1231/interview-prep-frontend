import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  question?: {
    title: string;
    perfectAnswer: string;
    summary?: string;
    explanation?: string;
  } | null;
}

const stripMarkdown = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/[#*`_~\[\]()\-+]/g, "") // Remove Markdown syntax characters
    .replace(/\s+/g, " ")             // Clean consecutive whitespace/newlines
    .trim();
};

export const SEO: React.FC<SEOProps> = ({ title, description, keywords, question }) => {
  const pageTitle = title 
    ? (title.includes("|") ? title : `${title} | Interview Handbook`)
    : "Interview Handbook - AI 모의 면접 및 개념 학습";
  
  const pageDesc = description || "프론트엔드, 백엔드, CS 기술 면접부터 포트폴리오 맞춤 질문까지! 모의 면접으로 AI 피드백을 받고 매일매일 1개의 랜덤 질문을 받아보세요.";
  
  const pageKeywords = keywords || "프론트엔드 면접 준비, 백엔드 면접 준비, AI 모의 면접, CS 면접, 기술 면접 대비, 개발자 이직, 포트폴리오 면접, 면접 피드백, 자바 스프링 면접, 리액트 면접";

  // Schema.org FAQPage JSON-LD structures generator for GEO
  const jsonLd = question ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": question.title,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": stripMarkdown(`${question.summary || ""} ${question.perfectAnswer || ""}`)
        }
      }
    ]
  } : null;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta name="keywords" content={pageKeywords} />
      
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:type" content="website" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      
      {/* Search Engine Crawler Metadata */}
      <meta name="robots" content="index, follow" />

      {/* Dynamic JSON-LD injection for Generative Engine Optimization (GEO) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
