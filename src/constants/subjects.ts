/**
 * 과목(Subject) 매핑 상수.
 * 핸드북 카테고리 네비게이션과 모의면접 과목 선택 양쪽에서 공유합니다.
 */

export interface SubjectMap {
  label: string;
  /** DB subject 키 목록 (예: ["javascript", "typescript"]) */
  subjects?: string[];
  /** DB category 이름 */
  category?: string;
}

/**
 * 전체 과목 매핑 테이블.
 * - 핸드북: 카테고리 탭 + API 호출 필터
 * - 모의면접: 과목 선택 체크박스 그룹
 */
export const SUBJECT_MAPS: Record<string, SubjectMap> = {
  HOME:         { label: "홈" },
  JAVASCRIPT:   { label: "JavaScript",  subjects: ["javascript", "typescript"] },
  REACT:        { label: "React",       subjects: ["react", "nextjs"] },
  HTML_CSS:     { label: "HTML/CSS",    subjects: ["html_css", "web_performance"] },
  NETWORK:      { label: "네트워크",    subjects: ["network"] },
  OS:           { label: "OS·시스템",   subjects: ["os", "computer_architecture"] },
  DATABASE:     { label: "데이터베이스", subjects: ["database"] },
  JAVA:         { label: "Java",        subjects: ["java"] },
  SPRING:       { label: "Spring",      subjects: ["spring"] },
  DEVOPS:       { label: "DevOps",      subjects: ["devops"] },
  ARCHITECTURE: { label: "아키텍처",    subjects: ["software_engineering", "system_design", "design_pattern"] },
  ALGORITHM:    { label: "알고리즘",    subjects: ["algorithm", "data_structure"] },
  ALL:          { label: "전체 질문" },
};

/**
 * 모의면접에서 사용하는 과목 키 → DB subject 이름 매핑.
 * SUBJECT_MAPS에서 subjects 배열을 추출하여 flatMap용으로 사용합니다.
 */
export function getDbSubjectsForKey(key: string): string[] {
  return SUBJECT_MAPS[key]?.subjects ?? [];
}
