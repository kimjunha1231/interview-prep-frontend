import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  question?: {
    title: string;
    perfectAnswer: string;
    summary?: string;
    explanation?: string;
  } | null;
}

export const SEO: React.FC<SEOProps> = ({ title, description, question }) => {
  const pageTitle = title 
    ? `${title} | Interview Handbook` 
    : "Interview Handbook - AI 모의 면접 및 개념 학습";
  const pageDesc = description || "시니어 면접관 시점의 날카로운 피드백과 모의 면접을 통해 기술 면접 및 포트폴리오를 완벽 대비하세요.";

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
          "text": `${question.summary || ""} ${question.perfectAnswer || ""}`.trim()
        }
      }
    ]
  } : null;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
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
