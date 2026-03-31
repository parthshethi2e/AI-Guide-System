import { SURVEY_CATEGORIES } from "./survey-data.js";

export type MaturityLevel = "nascent" | "emerging" | "developing" | "advanced" | "leading";

export interface CategoryScore {
  category: string;
  categoryLabel: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: "short_term" | "mid_term" | "long_term";
  priority: "critical" | "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  tools: string[];
}

interface AnswerMap {
  [questionId: string]: number;
}

export function computeCategoryScores(
  answers: { questionId: string; category: string; numericValue?: number | null }[]
): CategoryScore[] {
  const answerMap: AnswerMap = {};
  for (const a of answers) {
    if (a.numericValue != null) {
      answerMap[a.questionId] = a.numericValue;
    }
  }

  return SURVEY_CATEGORIES.map((cat) => {
    let weightedScore = 0;
    let maxWeightedScore = 0;

    for (const q of cat.questions) {
      const val = answerMap[q.id] ?? 0;
      weightedScore += val * q.weight;
      maxWeightedScore += 5 * q.weight;
    }

    const percentage = maxWeightedScore > 0 ? (weightedScore / maxWeightedScore) * 100 : 0;

    return {
      category: cat.id,
      categoryLabel: cat.label,
      score: Math.round(weightedScore * 10) / 10,
      maxScore: Math.round(maxWeightedScore * 10) / 10,
      percentage: Math.round(percentage * 10) / 10,
    };
  });
}

export function classifyMaturityLevel(overallPercentage: number): MaturityLevel {
  if (overallPercentage < 20) return "nascent";
  if (overallPercentage < 40) return "emerging";
  if (overallPercentage < 60) return "developing";
  if (overallPercentage < 80) return "advanced";
  return "leading";
}

export function getMaturityLabel(level: MaturityLevel): string {
  const labels: Record<MaturityLevel, string> = {
    nascent: "Nascent",
    emerging: "Emerging",
    developing: "Developing",
    advanced: "Advanced",
    leading: "Leading",
  };
  return labels[level];
}

export function generateRecommendations(
  categoryScores: CategoryScore[],
  maturityLevel: MaturityLevel,
  industry: string
): Recommendation[] {
  const recs: Recommendation[] = [];
  const scoreMap: Record<string, number> = {};
  for (const cs of categoryScores) {
    scoreMap[cs.category] = cs.percentage;
  }

  // Data Infrastructure recommendations
  const diScore = scoreMap["data_infrastructure"] ?? 0;
  if (diScore < 40) {
    recs.push({
      id: "di_foundation",
      title: "Establish a Modern Data Foundation",
      description: "Implement a centralized data platform with a data warehouse or data lakehouse architecture. Begin with cloud migration of key data sources and establish basic data governance policies including ownership, quality standards, and access controls.",
      category: "Data Infrastructure",
      timeframe: "short_term",
      priority: "critical",
      effort: "high",
      impact: "high",
      tools: ["Snowflake", "Databricks", "Google BigQuery", "Apache Spark", "dbt"],
    });
    recs.push({
      id: "di_governance",
      title: "Implement Data Governance Program",
      description: "Launch a formal data governance initiative including a data catalog, data stewardship roles, data quality metrics, and data lineage tracking. Establish a data governance council with cross-functional representation.",
      category: "Data Infrastructure",
      timeframe: "mid_term",
      priority: "high",
      effort: "medium",
      impact: "high",
      tools: ["Collibra", "Alation", "Apache Atlas", "Great Expectations", "Monte Carlo"],
    });
  } else if (diScore < 70) {
    recs.push({
      id: "di_realtime",
      title: "Build Real-Time Data Capabilities",
      description: "Evolve from batch-centric data processing to streaming and near-real-time data pipelines. Implement event streaming infrastructure to enable real-time analytics and AI model scoring.",
      category: "Data Infrastructure",
      timeframe: "mid_term",
      priority: "high",
      effort: "high",
      impact: "high",
      tools: ["Apache Kafka", "Apache Flink", "AWS Kinesis", "Google Pub/Sub", "Confluent"],
    });
  } else {
    recs.push({
      id: "di_optimization",
      title: "Optimize Data Platform for AI Workloads",
      description: "Evolve your data infrastructure to support AI-specific workloads including feature stores, vector databases for embeddings, and data versioning for ML reproducibility.",
      category: "Data Infrastructure",
      timeframe: "long_term",
      priority: "medium",
      effort: "medium",
      impact: "high",
      tools: ["Feast", "Tecton", "Pinecone", "Weaviate", "Delta Lake"],
    });
  }

  // Technology Stack
  const tsScore = scoreMap["technology_stack"] ?? 0;
  if (tsScore < 40) {
    recs.push({
      id: "ts_cloud",
      title: "Accelerate Cloud Migration",
      description: "Develop and execute a cloud migration roadmap for core systems. Prioritize applications that will enable AI capabilities. Adopt cloud-native services to reduce infrastructure overhead and enable AI/ML services.",
      category: "Technology Stack",
      timeframe: "short_term",
      priority: "critical",
      effort: "high",
      impact: "high",
      tools: ["AWS", "Google Cloud", "Microsoft Azure", "Terraform", "Kubernetes"],
    });
  } else if (tsScore < 70) {
    recs.push({
      id: "ts_mlops",
      title: "Build MLOps Infrastructure",
      description: "Implement an MLOps platform to industrialize model development and deployment. Establish model registries, automated testing pipelines, and production monitoring to move from experimental to production AI.",
      category: "Technology Stack",
      timeframe: "mid_term",
      priority: "high",
      effort: "high",
      impact: "high",
      tools: ["MLflow", "Kubeflow", "SageMaker", "Vertex AI", "Azure ML", "Weights & Biases"],
    });
    recs.push({
      id: "ts_bi",
      title: "Expand Self-Service Analytics",
      description: "Deploy a modern business intelligence platform enabling self-service analytics across the organization. Embed analytics directly into operational systems to drive data-driven decision making.",
      category: "Technology Stack",
      timeframe: "short_term",
      priority: "medium",
      effort: "medium",
      impact: "medium",
      tools: ["Tableau", "Power BI", "Looker", "Metabase", "Apache Superset"],
    });
  } else {
    recs.push({
      id: "ts_platform",
      title: "Build Internal AI Platform",
      description: "Develop an internal AI platform that democratizes model access across the organization. Include model serving infrastructure, prompt management, fine-tuning capabilities, and guardrails for responsible AI deployment.",
      category: "Technology Stack",
      timeframe: "long_term",
      priority: "medium",
      effort: "high",
      impact: "high",
      tools: ["LangChain", "LlamaIndex", "BentoML", "Ray Serve", "Seldon Core"],
    });
  }

  // AI/ML Usage
  const aiScore = scoreMap["ai_ml_usage"] ?? 0;
  if (aiScore < 30) {
    recs.push({
      id: "ai_quickwins",
      title: "Launch AI Quick Wins Program",
      description: "Identify and implement 2-3 high-value, low-risk AI use cases to demonstrate business value quickly. Focus on areas with clean data and clear success metrics such as demand forecasting, churn prediction, or document classification.",
      category: "AI/ML Usage",
      timeframe: "short_term",
      priority: "critical",
      effort: "medium",
      impact: "high",
      tools: ["Google AutoML", "AWS SageMaker Canvas", "H2O.ai", "DataRobot", "Azure Cognitive Services"],
    });
  } else if (aiScore < 60) {
    recs.push({
      id: "ai_scale",
      title: "Scale AI Across Business Functions",
      description: "Systematically expand AI adoption beyond initial use cases. Develop a portfolio approach to AI investment with clear prioritization criteria, success metrics, and a review cadence for AI initiatives across all business units.",
      category: "AI/ML Usage",
      timeframe: "mid_term",
      priority: "high",
      effort: "medium",
      impact: "high",
      tools: ["OpenAI API", "Anthropic Claude", "Hugging Face", "Databricks ML", "Azure OpenAI"],
    });
    recs.push({
      id: "ai_genai",
      title: "Deploy Enterprise Generative AI",
      description: "Implement a governed generative AI program with sanctioned tools, clear policies, and productivity measurement. Start with internal productivity use cases before customer-facing applications.",
      category: "AI/ML Usage",
      timeframe: "short_term",
      priority: "high",
      effort: "low",
      impact: "high",
      tools: ["Microsoft Copilot", "Google Workspace AI", "Anthropic Claude for Teams", "GitHub Copilot"],
    });
  } else {
    recs.push({
      id: "ai_innovation",
      title: "Build AI Innovation Capability",
      description: "Establish an AI Center of Excellence to drive frontier AI research and innovation. Explore custom model fine-tuning, multimodal AI, and proprietary AI capabilities that create sustainable competitive advantage.",
      category: "AI/ML Usage",
      timeframe: "long_term",
      priority: "medium",
      effort: "high",
      impact: "high",
      tools: ["Hugging Face Enterprise", "NVIDIA AI Enterprise", "Google Vertex AI", "Custom fine-tuning"],
    });
  }

  // Workforce Skills
  const wsScore = scoreMap["workforce_skills"] ?? 0;
  if (wsScore < 40) {
    recs.push({
      id: "ws_literacy",
      title: "Launch Organization-Wide AI Literacy Program",
      description: "Implement a structured AI literacy program for all employees covering AI fundamentals, use cases in your industry, and how to work effectively alongside AI systems. Include leaders and board members.",
      category: "Workforce Skills",
      timeframe: "short_term",
      priority: "critical",
      effort: "medium",
      impact: "high",
      tools: ["Coursera for Business", "LinkedIn Learning", "Google AI Academy", "Udemy for Business"],
    });
    recs.push({
      id: "ws_hiring",
      title: "Build AI Talent Pipeline",
      description: "Develop a targeted AI talent acquisition strategy. Define the AI roles needed (data scientists, ML engineers, AI product managers), create competitive compensation packages, and establish university partnerships for talent pipeline.",
      category: "Workforce Skills",
      timeframe: "short_term",
      priority: "high",
      effort: "medium",
      impact: "high",
      tools: ["LinkedIn Recruiter", "Kaggle", "Toptal", "Handshake (university partnerships)"],
    });
  } else if (wsScore < 70) {
    recs.push({
      id: "ws_advanced",
      title: "Develop Advanced AI Specializations",
      description: "Create specialized career tracks for AI professionals including ML engineers, AI architects, and responsible AI leads. Establish internal communities of practice and peer learning networks.",
      category: "Workforce Skills",
      timeframe: "mid_term",
      priority: "high",
      effort: "medium",
      impact: "medium",
      tools: ["AWS Certification", "Google Cloud Certification", "Deep Learning Specialization (Coursera)"],
    });
  } else {
    recs.push({
      id: "ws_research",
      title: "Establish AI Research Capability",
      description: "Create an applied AI research function to drive innovation at the frontier. Partner with leading universities, publish research, and participate in open-source AI communities to attract top talent.",
      category: "Workforce Skills",
      timeframe: "long_term",
      priority: "medium",
      effort: "high",
      impact: "high",
      tools: ["Internal research labs", "University partnerships", "NeurIPS / ICML / ICLR involvement"],
    });
  }

  // Leadership Vision
  const lvScore = scoreMap["leadership_vision"] ?? 0;
  if (lvScore < 40) {
    recs.push({
      id: "lv_strategy",
      title: "Develop an AI Strategy",
      description: "Engage senior leadership in a structured AI strategy development process. Define the organization's AI ambition, prioritize AI investment areas, assign executive ownership, and communicate the vision to all employees.",
      category: "Leadership Vision",
      timeframe: "short_term",
      priority: "critical",
      effort: "low",
      impact: "high",
      tools: ["BCG AI Maturity Assessment", "McKinsey AI Strategy Framework", "MIT CDOIQ resources"],
    });
  } else if (lvScore < 70) {
    recs.push({
      id: "lv_cdo",
      title: "Appoint Chief AI / Data Officer",
      description: "Establish C-suite accountability for AI transformation by appointing a Chief AI Officer or elevating the Chief Data Officer role. This role should have cross-functional authority and board-level visibility.",
      category: "Leadership Vision",
      timeframe: "short_term",
      priority: "high",
      effort: "low",
      impact: "high",
      tools: ["CDAO role definition", "AI leadership council", "OKR framework for AI"],
    });
  } else {
    recs.push({
      id: "lv_ecosystem",
      title: "Build an AI Ecosystem and Partnerships",
      description: "Leverage your AI maturity to build an external AI ecosystem. Partner with AI startups, academic institutions, and industry groups. Consider publishing AI research, contributing to open-source, and joining AI industry bodies.",
      category: "Leadership Vision",
      timeframe: "long_term",
      priority: "medium",
      effort: "medium",
      impact: "medium",
      tools: ["Partnership with OpenAI / Anthropic", "AWS Partner Network", "AI industry consortia"],
    });
  }

  // Operational Processes
  const opScore = scoreMap["operational_processes"] ?? 0;
  if (opScore < 40) {
    recs.push({
      id: "op_automation",
      title: "Implement Intelligent Process Automation",
      description: "Map high-volume, repetitive business processes and automate them using RPA and workflow automation. Start with back-office operations (finance, HR, IT) before moving to core operations.",
      category: "Operational Processes",
      timeframe: "short_term",
      priority: "high",
      effort: "medium",
      impact: "high",
      tools: ["UiPath", "Automation Anywhere", "Microsoft Power Automate", "Zapier", "Make"],
    });
  } else if (opScore < 70) {
    recs.push({
      id: "op_decisions",
      title: "Embed Predictive Analytics in Decision Processes",
      description: "Integrate predictive models directly into core operational decision processes. Replace manual forecast reviews with automated ML-driven recommendations embedded in the tools your teams already use.",
      category: "Operational Processes",
      timeframe: "mid_term",
      priority: "high",
      effort: "medium",
      impact: "high",
      tools: ["Salesforce Einstein", "SAP AI", "Oracle Analytics", "Domino Data Lab"],
    });
  } else {
    recs.push({
      id: "op_autonomous",
      title: "Develop Autonomous Decision Systems",
      description: "Implement AI systems capable of making and executing decisions autonomously within defined guardrails. Apply to pricing optimization, supply chain management, dynamic resource allocation, and real-time customer interactions.",
      category: "Operational Processes",
      timeframe: "long_term",
      priority: "medium",
      effort: "high",
      impact: "high",
      tools: ["Reinforcement Learning platforms", "Agentic AI frameworks", "Vertex AI Agent Builder"],
    });
  }

  // Governance & Ethics
  const geScore = scoreMap["governance_ethics"] ?? 0;
  if (geScore < 40) {
    recs.push({
      id: "ge_framework",
      title: "Establish AI Governance Framework",
      description: "Create foundational AI governance policies covering model documentation requirements, risk classification of AI systems, approval workflows for AI deployment, and basic oversight structures. Assign an AI risk owner.",
      category: "Governance & Ethics",
      timeframe: "short_term",
      priority: "critical",
      effort: "medium",
      impact: "high",
      tools: ["NIST AI RMF", "EU AI Act compliance toolkit", "IBM OpenScale / OpenPages", "OneTrust AI Governance"],
    });
  } else if (geScore < 70) {
    recs.push({
      id: "ge_responsible",
      title: "Build Responsible AI Program",
      description: "Implement a comprehensive responsible AI program including bias testing for all models, explainability requirements for high-risk decisions, model cards for documentation, and an AI ethics review board.",
      category: "Governance & Ethics",
      timeframe: "mid_term",
      priority: "high",
      effort: "medium",
      impact: "high",
      tools: ["Fiddler AI", "Weights & Biases", "Arize AI", "IBM Fairness 360", "Microsoft Responsible AI"],
    });
  } else {
    recs.push({
      id: "ge_leadership",
      title: "Achieve Responsible AI Leadership",
      description: "Pursue external validation of your AI governance practices through third-party audits and certifications. Publish a responsible AI report, engage with regulators proactively, and contribute to industry standards for ethical AI.",
      category: "Governance & Ethics",
      timeframe: "long_term",
      priority: "medium",
      effort: "medium",
      impact: "medium",
      tools: ["BSI AI Assurance", "ISO/IEC 42001", "IEEE AI Ethics certification", "AI governance auditors"],
    });
  }

  // Sort: critical first, then by timeframe
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const timeframeOrder = { short_term: 0, mid_term: 1, long_term: 2 };
  recs.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return timeframeOrder[a.timeframe] - timeframeOrder[b.timeframe];
  });

  return recs;
}

export function generateExecutiveSummary(
  organizationName: string,
  industry: string,
  maturityLevel: MaturityLevel,
  overallPercentage: number,
  categoryScores: CategoryScore[]
): string {
  const label = getMaturityLabel(maturityLevel);
  const sorted = [...categoryScores].sort((a, b) => b.percentage - a.percentage);
  const topCategory = sorted[0];
  const bottomCategory = sorted[sorted.length - 1];

  const summaries: Record<MaturityLevel, string> = {
    nascent: `${organizationName} is at the beginning of its AI journey. With an overall AI maturity score of ${overallPercentage.toFixed(1)}%, the organization is classified as ${label} — meaning AI adoption is largely unexplored or experimental. This presents a significant opportunity: organizations that invest in AI foundations today are building competitive advantages for tomorrow. The priority must be establishing data infrastructure, building basic AI literacy, and securing executive commitment to an AI strategy before attempting complex AI deployments.`,
    emerging: `${organizationName} has begun exploring AI capabilities and shows early signs of adoption, achieving an overall AI maturity score of ${overallPercentage.toFixed(1)}%. Classified as ${label}, the organization has some AI initiatives underway but has yet to scale them systematically. The key challenges are moving from isolated experiments to production AI systems, closing talent gaps, and developing the governance structures needed to deploy AI responsibly at scale. A structured AI roadmap with clear ownership and investment is the critical next step.`,
    developing: `${organizationName} is making meaningful progress in its AI transformation, achieving an overall AI maturity score of ${overallPercentage.toFixed(1)}% and classified as ${label}. The organization has moved beyond experimentation and is operating AI systems in production, though significant gaps remain in scaling capabilities. The focus should shift to broadening AI deployment across business functions, strengthening MLOps infrastructure, and embedding AI-driven decision making into core operational processes.`,
    advanced: `${organizationName} demonstrates strong AI capabilities, achieving an overall AI maturity score of ${overallPercentage.toFixed(1)}% and classified as ${label}. The organization has successfully deployed AI across multiple domains and is seeing measurable business impact. The opportunity now lies in achieving AI leadership — building innovation capabilities, developing proprietary AI assets, and leveraging AI as a source of sustained competitive differentiation in the ${industry} sector.`,
    leading: `${organizationName} is among the most AI-mature organizations in its sector, achieving an outstanding AI maturity score of ${overallPercentage.toFixed(1)}% and classified as ${label}. AI is deeply embedded as a source of competitive advantage. The focus should be on continuous innovation at the AI frontier, building ecosystem leadership, and ensuring responsible AI practices keep pace with rapidly advancing capabilities. Maintaining this position requires ongoing investment in talent, research, and governance.`,
  };

  return summaries[maturityLevel];
}

export function identifyStrengthsAndGaps(categoryScores: CategoryScore[]): {
  strengthAreas: string[];
  gapAreas: string[];
} {
  const sorted = [...categoryScores].sort((a, b) => b.percentage - a.percentage);
  const strengthAreas = sorted
    .filter((cs) => cs.percentage >= 60)
    .slice(0, 3)
    .map((cs) => `${cs.categoryLabel} (${cs.percentage.toFixed(0)}%)`);

  const gapAreas = sorted
    .filter((cs) => cs.percentage < 50)
    .slice(-3)
    .reverse()
    .map((cs) => `${cs.categoryLabel} (${cs.percentage.toFixed(0)}%)`);

  return { strengthAreas, gapAreas };
}
