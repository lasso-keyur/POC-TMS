# Sentiment Analysis for Employee Surveys — Industry Research Report

**Date:** March 2026
**Project:** POC-TMS (EmpSurvey Module)
**Purpose:** Evaluate industry approaches, tools, and techniques for integrating sentiment analysis into the employee survey platform.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Market Overview & Industry Trends](#market-overview--industry-trends)
3. [NLP Techniques & Models](#nlp-techniques--models)
4. [Leading Platforms & Tools](#leading-platforms--tools)
5. [Open-Source Libraries](#open-source-libraries)
6. [Enterprise Approaches](#enterprise-approaches)
7. [Integration Architecture](#integration-architecture)
8. [Applicability to EmpSurvey](#applicability-to-empsurvey)
9. [Challenges & Limitations](#challenges--limitations)
10. [Recommendations](#recommendations)
11. [References](#references)

---

## 1. Executive Summary

Sentiment analysis — the automated detection of emotional tone and opinion from text — has become a critical capability for employee survey platforms. As organizations increasingly rely on continuous feedback, the ability to process open-ended survey responses at scale and extract actionable sentiment insights is a key differentiator.

This report surveys the current state of the industry, evaluating NLP models (VADER, BERT, GPT-based LLMs), commercial platforms, open-source tools, and integration patterns relevant to the EmpSurvey module within POC-TMS.

**Key findings:**
- Transformer-based models (BERT, RoBERTa) dominate when fine-tuned on domain-specific data, with accuracy reaching 86–97% depending on the domain.
- Large Language Models (GPT-4, Claude) match or exceed fine-tuned models in zero-shot scenarios, with GPT-4 surpassing RoBERTa by ~21% accuracy in educational surveys.
- Hybrid approaches (rule-based + transformer) achieve the best balance of accuracy (87.6%) and efficiency.
- The global sentiment analysis market is projected to exceed $6 billion by 2027, with employee experience as a fast-growing segment.

---

## 2. Market Overview & Industry Trends

### Market Size & Growth
| Metric | Value |
|--------|-------|
| Sentiment analytics systems (2025) | $4.27 billion |
| Sentiment analytics systems (2026 projected) | $5.61 billion |
| Sentiment analytics CAGR | 31.4% |
| Employee feedback software (2025) | $1.10 billion |
| Employee feedback software (2026 projected) | $1.28 billion (to $3.15B by 2034) |
| Employee experience management (2025) | $6.7 billion |
| Employee experience management (2035 projected) | $12.9 billion |
| Disengaged employees cost globally (Gallup) | $8.8 trillion/year |
| Continuous listening programs lower turnover by | 24% (Gallup, 2025) |

### Key Industry Trends

1. **AI-Native Survey Platforms** — Platforms like Qualtrics XM, Culture Amp, and Medallia now embed real-time sentiment analysis directly into survey workflows, offering instant theme detection and sentiment scoring as responses arrive. Software holds ~63% share of the employee experience management market (2025).

2. **Shift from Annual to Continuous Listening** — Organizations are moving from annual engagement surveys to continuous pulse surveys, requiring real-time or near-real-time sentiment processing capabilities. Organizations with continuous listening see 24% lower turnover (Gallup, 2025).

3. **Multi-Dimensional Sentiment** — Beyond positive/negative/neutral, modern tools detect specific emotions (frustration, enthusiasm, anxiety), intensity levels, and topic-specific sentiment (e.g., positive about team culture but negative about compensation).

4. **Aspect-Based Sentiment Analysis (ABSA)** — Increasingly used to extract sentiment toward specific workplace aspects (management, growth opportunities, work-life balance) from free-text responses.

5. **Multilingual Sentiment Analysis** — With global workforces, platforms now support 50+ languages for sentiment detection, often using multilingual transformer models (mBERT, XLM-RoBERTa).

6. **Privacy-First Analysis** — Growing emphasis on anonymized, aggregated sentiment insights to maintain employee trust, especially in regulated industries (healthcare, finance).

7. **Executive AI Urgency** — Executive urgency to incorporate AI tools has increased 7x in the past six months (Slack Workforce Index), while 93% of workers still do not consider AI outputs completely trustworthy for work-related tasks.

### Employee Sentiment Macro Trends (2020–2026)
- Between August 2020 and April 2024, overall US employee sentiment fell ~5.6% across all industries
- Sentiment stabilized mid-2024 and improved throughout 2025 — the first improvement in nearly three years
- Early 2026: Gallup data shows a renewed decline in worker sentiment as hiring slowed to its slowest pace in years

---

## 3. NLP Techniques & Models

### 3.1 Rule-Based / Lexicon Approaches

#### VADER (Valence Aware Dictionary and sEntiment Reasoner)
- **Type:** Rule-based, lexicon-driven
- **How it works:** Matches words against a predefined lexicon of human-assigned sentiment scores. Applies heuristics for negation, capitalization, punctuation, and degree adverbs. Outputs a compound score between -1 (most negative) and +1 (most positive).
- **Strengths:** Fast, interpretable, no training required, works well on short informal text
- **Weaknesses:** Limited contextual understanding, struggles with sarcasm, domain-specific jargon, and complex sentence structures
- **Accuracy:** Correlation r = 0.59 with human ratings (healthcare study, 2025)
- **Best for:** Real-time scoring, baseline sentiment, resource-constrained environments

#### TextBlob
- **Type:** Rule-based with pattern analysis
- **Strengths:** Simple API, handles subjectivity detection
- **Weaknesses:** Less nuanced polarity detection than VADER, especially for neutral and negative sentiments

### 3.2 Machine Learning (Traditional)

#### Naive Bayes / SVM / Random Forest
- **Type:** Supervised learning on labeled data
- **Strengths:** Interpretable, fast inference, well-understood
- **Weaknesses:** Requires feature engineering (TF-IDF, n-grams), limited contextual understanding
- **Accuracy:** 70–82% on survey text (varies by dataset and feature engineering quality)

### 3.3 Deep Learning / Transformer Models

#### BERT (Bidirectional Encoder Representations from Transformers)
- **Type:** Pre-trained transformer, bidirectional context
- **Variants:** BERT-base, BERT-large, DistilBERT, RoBERTa, FinBERT, BiomedBERT
- **How it works:** Pre-trained on massive text corpora using masked language modeling and next-sentence prediction. Fine-tuned on domain-specific labeled data for sentiment classification.
- **Strengths:** Deep contextual understanding, handles ambiguity, achieves state-of-the-art on many benchmarks
- **Accuracy:** r = 0.74 correlation with human ratings (healthcare), 86.2% accuracy (social media), up to 97% when fine-tuned on domain-specific data
- **Best for:** Domain-specific sentiment when labeled training data is available

#### RoBERTa (Robustly Optimized BERT)
- **Type:** Optimized BERT variant
- **Strengths:** Highest accuracy on multi-class sentiment (97% on mental health labels), better training procedure than BERT
- **Best for:** High-stakes, nuanced sentiment classification

#### DistilBERT
- **Type:** Compressed BERT (40% fewer parameters)
- **Strengths:** Retains 97% of BERT's performance, 60% faster inference
- **Best for:** Production deployments where speed matters

### 3.4 Large Language Models (LLMs)

#### GPT-3.5 / GPT-4
- **Zero-shot accuracy:** Matches fine-tuned BERT on standard benchmarks
- **GPT-4 in education surveys:** ~21% higher accuracy and ~32% higher F1-score than RoBERTa
- **Strengths:** No fine-tuning required, handles complex/ambiguous language, provides explanations for sentiment classifications, excels at aspect-based analysis
- **Weaknesses:** Higher cost per inference, latency, potential data privacy concerns with external APIs

#### Claude (Anthropic)
- **Strengths:** Strong at nuanced understanding, longer context windows (200K tokens), safety-focused, excellent at structured extraction from unstructured text
- **Best for:** Batch processing of open-ended survey responses with detailed categorization

### 3.5 Comparative Performance Summary

| Model | Accuracy | Speed | Cost | Training Data Required | Best Use Case |
|-------|----------|-------|------|----------------------|---------------|
| VADER | 60–70% | Very Fast | Free | None | Real-time baseline |
| TextBlob | 55–65% | Very Fast | Free | None | Quick prototyping |
| Naive Bayes/SVM | 70–82% | Fast | Low | Moderate | Structured responses |
| BERT (fine-tuned) | 85–97% | Moderate | Medium | Significant | Domain-specific analysis |
| DistilBERT | 83–95% | Fast | Medium | Significant | Production at scale |
| RoBERTa | 87–97% | Moderate | Medium | Significant | High-accuracy needs |
| GPT-4 / Claude | 85–95% | Slow | High | None (zero-shot) | Complex free-text analysis |
| Hybrid (VADER + BERT) | 87–88% | Moderate | Medium | Moderate | Balanced accuracy + speed |

---

## 4. Leading Platforms & Tools

### Commercial Platforms

| Platform | Sentiment Capabilities | Integration Model | Pricing Tier |
|----------|----------------------|-------------------|-------------|
| **Qualtrics XM** | Real-time text analytics (Text iQ), sentence-level scoring (-5 to +5), 15+ languages, 50K+ employees | Embedded in survey platform | Enterprise ($30K–$250K+/yr) |
| **Culture Amp** | AI-driven comment analysis, theme extraction, sentiment trends, attrition risk prediction | Native to platform | Enterprise |
| **Medallia** | Athena AI engine, real-time text mining, acquired MonkeyLearn (2022) for no-code ML | API + Embedded | Enterprise |
| **Peakon (Workday)** | Continuous listening, NLP-driven insights, engagement prediction | Native to Workday | Enterprise |
| **Viva Glint (Microsoft)** | Copilot-powered comment analysis, natural language exploration, integrates with Viva Insights (327% ROI reported) | Native to Microsoft 365 | Enterprise |
| **MonkeyLearn (Medallia)** | Drag-and-drop custom sentiment classifiers, no-code model building | API-first | Mid-market ($299–$499/mo) |
| **Lattice** | Pulse surveys and engagement measurement with sentiment tracking | Native | Mid-market |
| **SurveyMonkey (Momentive)** | Built-in sentiment analysis for open-ended questions | Embedded | SMB–Enterprise |
| **Happily.ai** | Daily conversational pulse checks replacing static annual surveys | Native | Mid-market |
| **Polly (Slack)** | "Hot Topics" AI feature groups open-ended feedback by sentiment (2026) | Slack integration | SMB–Mid-market |

### API-Based Services

| Service | Model | Pricing | Highlights |
|---------|-------|---------|------------|
| **Google Cloud NLP** | Pre-trained + AutoML | Per-request | Entity sentiment, content classification |
| **AWS Comprehend** | Pre-trained + custom | Per-request | Real-time + batch, custom entity recognition |
| **Azure AI Language** | Pre-trained + custom | Per-request | Opinion mining, aspect-based sentiment |
| **IBM Watson NLU** | Pre-trained | Per-request | Emotion detection (5 emotions), keyword sentiment |
| **OpenAI API** | GPT-4 | Per-token | Zero-shot, highly flexible |
| **Anthropic API** | Claude | Per-token | Nuanced analysis, long-context |

---

## 5. Open-Source Libraries

### Python Ecosystem

| Library | Type | Best For |
|---------|------|----------|
| **NLTK + VADER** | Lexicon-based | Quick sentiment scoring, educational use |
| **TextBlob** | Pattern-based | Simple sentiment + subjectivity |
| **spaCy** | Industrial NLP | Tokenization, NER, pipeline integration |
| **Hugging Face Transformers** | Pre-trained models | BERT, RoBERTa, DistilBERT fine-tuning |
| **Flair** | Stacked embeddings | High-accuracy NLP tasks (r=0.80 in healthcare) |
| **scikit-learn** | Classical ML | Feature-based classification pipelines |
| **PyTorch / TensorFlow** | Deep learning | Custom model training |

### JavaScript / TypeScript Ecosystem (Relevant to EmpSurvey)

| Library | Type | Best For |
|---------|------|----------|
| **compromise** | Rule-based NLP | Lightweight text processing in Node.js |
| **natural** | Classical NLP | Tokenization, stemming, Bayes classification |
| **wink-sentiment** | Lexicon-based | VADER-like sentiment in JS |
| **TensorFlow.js** | Deep learning | Client-side model inference |
| **Hugging Face Inference API** | API | Server-side transformer inference |

### Java Ecosystem (Relevant to EmpSurvey API)

| Library | Type | Best For |
|---------|------|----------|
| **Stanford CoreNLP** | Academic NLP | Comprehensive NLP pipeline with sentiment |
| **Apache OpenNLP** | Classical NLP | Tokenization, POS tagging, classification |
| **DL4J (Deeplearning4j)** | Deep learning | JVM-native neural networks |
| **LangChain4j** | LLM orchestration | Integrating LLMs into Java apps |

---

## 6. Enterprise Approaches

### How Leading Companies Handle Employee Sentiment

**Microsoft (Viva Glint)**
- Uses continuous listening with pulse surveys, deeply integrated with Microsoft 365
- **Copilot in Viva Glint** uses generative AI to summarize all comments, filter by sentiment, and generate prescriptive recommendations
- Combines survey sentiment with **Viva Insights** workplace analytics (meeting patterns, collaboration data, work habits)
- Privacy safeguards: configurable thresholds (5+ respondents for quantitative, 10+ for comments)
- Reports potential 327% total ROI with payback in under six months

**Google**
- Annual **Googlegeist** survey with 88%+ response rate despite 30-minute completion time
- People Analytics team analyzes aggregate trends by gender, ethnicity, job level
- **Project Oxygen** found that managers greatly influence retention, leading to targeted manager programs
- Covers inclusion, manager effectiveness, fairness of promotion/compensation, and company values
- Notable finding (2022): Only 46% found total compensation competitive (down 12 pts YoY), while mission satisfaction scored 90%

**Salesforce / Slack**
- Rebuilt **Slackbot** as a personal AI agent that analyzes feedback from pilot channels — grouping responses by sentiment, identifying themes, and suggesting priorities with inline citations
- Internal adoption: 25,000 weekly active users among 80,000 employees (80% retention, 96% satisfaction — highest of any Slack AI feature)
- Slack positioning as "agentic operating system" with partners including OpenAI, Anthropic, Google

**IBM**
- Watson-powered sentiment analysis on employee feedback
- Aspect-based sentiment for specific workplace dimensions
- Predictive analytics linking sentiment to retention and performance

### Common Patterns Across Enterprises

1. **Multi-layer analysis:** Combine numerical ratings with text sentiment for richer insights
2. **Longitudinal tracking:** Track sentiment trends over time, not just point-in-time snapshots
3. **Manager-level aggregation:** Provide actionable insights at the team/manager level while maintaining anonymity
4. **Theme clustering:** Group open-ended responses into themes before applying sentiment analysis
5. **Benchmark comparisons:** Compare sentiment scores against industry/company benchmarks

---

## 7. Integration Architecture

### Architecture Patterns for Survey Sentiment Analysis

#### Pattern 1: Real-Time (Synchronous)
```
Survey Response → API Gateway → Sentiment Service → Store Result
                                      ↓
                               NLP Model (VADER/API)
```
- **Latency:** <500ms for VADER, 1–3s for LLM API
- **Best for:** Instant feedback, live dashboards
- **Trade-off:** Cost scales linearly with responses

#### Pattern 2: Batch Processing (Asynchronous)
```
Survey Responses → Message Queue → Batch Processor → Store Results
                                        ↓
                                  NLP Model (BERT/LLM)
```
- **Latency:** Minutes to hours
- **Best for:** Large-scale analysis, detailed multi-model processing
- **Trade-off:** Not suitable for real-time dashboards

#### Pattern 3: Hybrid (Recommended for EmpSurvey)
```
Survey Response → Quick Score (VADER) → Store → Dashboard (immediate)
                       ↓
              Queue for Deep Analysis
                       ↓
              LLM/BERT Enrichment → Update Store → Enhanced Dashboard
```
- **Latency:** Instant basic score, enriched within minutes
- **Best for:** Balancing user experience with deep analysis
- **Trade-off:** Slightly more complex architecture

### Recommended Data Model Extension

```sql
-- Proposed addition to existing SURVEY_ANSWERS table
ALTER TABLE SURVEY_ANSWERS ADD (
    SENTIMENT_SCORE    NUMBER(5,4),    -- -1.0000 to 1.0000
    SENTIMENT_LABEL    VARCHAR2(20),   -- POSITIVE, NEGATIVE, NEUTRAL, MIXED
    SENTIMENT_MODEL    VARCHAR2(50),   -- Model used (VADER, BERT, GPT-4, etc.)
    EMOTION_TAGS       VARCHAR2(500),  -- JSON array: ["frustration","hope"]
    THEMES             VARCHAR2(1000), -- JSON array: ["work-life-balance","management"]
    ANALYZED_AT        TIMESTAMP,
    CONFIDENCE_SCORE   NUMBER(3,2)     -- 0.00 to 1.00
);

-- Aggregated sentiment per survey
CREATE TABLE SURVEY_SENTIMENT_SUMMARY (
    SUMMARY_ID         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    SURVEY_ID          NUMBER NOT NULL REFERENCES SURVEYS(SURVEY_ID),
    QUESTION_ID        NUMBER REFERENCES SURVEY_QUESTIONS(QUESTION_ID),
    AVG_SENTIMENT      NUMBER(5,4),
    POSITIVE_PCT       NUMBER(5,2),
    NEUTRAL_PCT        NUMBER(5,2),
    NEGATIVE_PCT       NUMBER(5,2),
    TOP_THEMES         CLOB,           -- JSON array of top themes
    TOP_EMOTIONS       CLOB,           -- JSON array of top emotions
    RESPONSE_COUNT     NUMBER,
    ANALYZED_AT        TIMESTAMP,
    MODEL_VERSION      VARCHAR2(50)
);
```

---

## 8. Applicability to EmpSurvey

### Current State
The EmpSurvey module already has strong foundations for sentiment analysis:

| Feature | Status | Sentiment Relevance |
|---------|--------|-------------------|
| Text-type questions | Implemented | Primary input for sentiment analysis |
| Rating scale questions | Implemented | Numerical sentiment proxy (1-5 scale) |
| `SURVEY_ANSWERS.ANSWER_TEXT` (CLOB) | Implemented | Stores open-ended responses for NLP |
| Team Mate Voices template | Implemented | Contains sentiment-rich questions |
| REST API architecture | Implemented | Extensible for sentiment endpoints |
| Anonymous responses | Implemented | Supports privacy-first sentiment analysis |

### High-Value Sentiment Analysis Targets

Based on the existing `TEAM_MATE_VOICES_QUESTIONS` template:

| Question | Analysis Type |
|----------|--------------|
| "What is the biggest challenge you face in your role?" | Theme extraction + sentiment |
| "What could we improve most in our workplace culture?" | Aspect-based sentiment + priority ranking |
| Rating questions (1-5 scale) | Correlate with text sentiment for validation |

### Proposed API Endpoints

```
POST   /api/surveys/{id}/analyze          -- Trigger sentiment analysis for a survey
GET    /api/surveys/{id}/sentiment         -- Get sentiment summary for a survey
GET    /api/surveys/{id}/sentiment/themes  -- Get detected themes
GET    /api/surveys/{id}/sentiment/trends  -- Get sentiment trends over time
GET    /api/answers/{id}/sentiment         -- Get sentiment for individual answer
```

---

## 9. Challenges & Limitations

### Technical Challenges

1. **Sarcasm & Irony Detection** — "Oh great, another mandatory training" reads as positive to simple models but conveys negative sentiment. LLMs handle this better than rule-based approaches.

2. **Domain-Specific Language** — Corporate jargon, acronyms, and workplace-specific terms may not be in pre-trained vocabularies. Fine-tuning on HR/employee feedback data is often necessary.

3. **Short Responses** — Survey answers are often brief (3–10 words), providing limited context for models. Hybrid approaches (combining rating + text) help mitigate this.

4. **Multilingual Responses** — Global workforces may respond in multiple languages within a single survey.

5. **Mixed Sentiment** — A single response may contain both positive and negative sentiments: "I love my team but the tools are terrible." Aspect-based approaches handle this better.

6. **Context Dependency** — The same words can carry different sentiment depending on the question context. Question-aware models improve accuracy.

### Ethical & Organizational Challenges

1. **Employee Trust** — Workers may self-censor if they believe their responses are being analyzed by AI, reducing data quality.

2. **Anonymity vs. Actionability** — Detailed sentiment analysis may inadvertently de-anonymize respondents in small teams.

3. **Bias in Models** — Pre-trained models may carry biases related to language style, dialect, or cultural expression patterns.

4. **Over-Reliance on Automation** — Sentiment scores should augment, not replace, human interpretation of qualitative feedback.

5. **Data Privacy & Compliance** — Sending employee feedback to external LLM APIs raises GDPR/privacy concerns. On-premise or private cloud deployment may be required.

---

## 10. Recommendations

### Short-Term (Phase 1 — 1–2 Sprints)
1. **Add VADER-based sentiment scoring** to the Java backend using Stanford CoreNLP or a lightweight library
2. **Store sentiment scores** in the existing `SURVEY_ANSWERS` table (add columns as proposed above)
3. **Build a basic sentiment dashboard** showing positive/negative/neutral distribution per survey
4. **Correlate text sentiment with rating scores** for validation

### Medium-Term (Phase 2 — 3–4 Sprints)
1. **Integrate an LLM API** (Claude or GPT-4) for deep analysis of open-ended responses
2. **Implement aspect-based sentiment analysis** to detect themes (management, culture, growth, compensation)
3. **Add the hybrid architecture** — VADER for instant scoring, LLM for enriched batch analysis
4. **Create the sentiment summary tables** and trend tracking endpoints

### Long-Term (Phase 3 — Future)
1. **Fine-tune a domain-specific BERT model** on accumulated employee feedback data
2. **Build predictive models** linking sentiment trends to attrition risk
3. **Add multilingual support** using XLM-RoBERTa or multilingual LLMs
4. **Implement real-time pulse sentiment monitoring** with WebSocket-based dashboards

### Recommended Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Quick Scoring | VADER (via Stanford CoreNLP in Java) | Fast, free, no external dependencies |
| Deep Analysis | Claude API / GPT-4 API | Best zero-shot accuracy, no training needed |
| Fine-Tuned Model | Hugging Face DistilBERT | Balance of accuracy and speed for production |
| Data Pipeline | Spring Batch / Kafka | Async processing for large survey datasets |
| Visualization | React + Chart.js / Recharts | Consistent with existing EmpSurvey frontend |

---

## 11. References

### Academic & Research Papers
1. PMC (2025). "Sentiment Analysis in Healthcare: A Comparison of VADER, BERT, and Flair NLP Models" — https://pmc.ncbi.nlm.nih.gov/articles/PMC12382424/
2. Frontiers in Political Science (2025). "Sentiment Analysis of UN Speeches: VADER vs BERT" — https://www.frontiersin.org/journals/political-science/articles/10.3389/fpos.2025.1546822/full
3. NHSJS (2025). "Sentiment Analysis on Survey Data: LLMs vs Dedicated Neural Networks" — https://nhsjs.com/2025/a-case-study-of-sentiment-analysis-on-survey-data-using-llms-versus-dedicated-neural-networks/
4. Nature Scientific Reports (2025). "Multi-task Opinion Enhanced Hybrid BERT Model for Mental Health Analysis" — https://www.nature.com/articles/s41598-025-86124-6
5. Frontiers in Big Data (2025). "Analyzing Student Mental Health with RoBERTa-Large" — https://www.frontiersin.org/journals/big-data/articles/10.3389/fdata.2025.1615788/full
6. ArXiv (2025). "Visualizing Public Opinion: Real-Time Sentiment Dashboard Using VADER and DistilBERT" — https://arxiv.org/html/2504.15448v2
7. PMC (2025). "From Words to Action: Automatic Sentiment Analysis of Patient Experience Comments" — https://pmc.ncbi.nlm.nih.gov/articles/PMC12548608/
8. ArXiv (2025). "Bridging Emotions and Architecture: Sentiment Analysis in Distributed Systems" — https://arxiv.org/html/2503.18260

### Market Research & Industry Reports
9. GII Research (2026). "Sentiment Analytics Systems Global Market Report" — https://www.giiresearch.com/report/tbrc1983101-sentiment-analytics-systems-global-market-report.html
10. IntelMarketResearch (2026). "Employee Feedback Software Market Outlook 2026–2034" — https://www.intelmarketresearch.com/employee-feedback-software-market-35646
11. GM Insights (2025). "Employee Experience Management Market Size" — https://www.gminsights.com/industry-analysis/employee-experience-management-market
12. Aon (2025). "Employee Sentiment Study" — https://www.aon.com/en/insights/reports/employee-sentiment-study
13. Gallup (2025). Workplace engagement and sentiment data
14. Revelio Labs (2025). "After a Three-Year Slide, Employee Sentiment Has Turned a Corner" — https://www.reveliolabs.com/news/social/after-a-three-year-slide-employee-sentiment-has-finally-turned-a-corner/

### Enterprise & Platform Sources
15. Microsoft Viva Glint — https://www.microsoft.com/en-us/microsoft-viva/glint
16. Microsoft Copilot in Viva Glint — https://techcommunity.microsoft.com/blog/viva_glint_blog/microsoft-copilot-in-viva-glint-bringing-ai-to-comment-analysis---updated-march-/4003914
17. Google Googlegeist Survey — https://fortune.com/2022/03/15/google-googlegeist-survey-employees-unhappy-with-pay/
18. Salesforce Slackbot AI Agent — https://salesforcedevops.net/index.php/2026/01/13/slackbot-gets-a-glow-up/
19. Slack Workforce Index — https://slack.com/blog/news/the-workforce-index-june-2024

### Best Practices & Guides
20. HP (2025). "Expert Tips for Employee Sentiment and Survey Analysis" — https://workforceexperience.hp.com/learning/employee-experience/employee-sentiment/
21. AllHRSoftware (2025). "AI-Powered Sentiment Analysis for Employee Surveys: 5-Step Guide" — https://allhrsoftware.com/blog/ai-powered-sentiment-analysis-for-employee-surveys-5-step-guide/
22. AIMultiple (2026). "Top 7 Sentiment Analysis Challenges" — https://research.aimultiple.com/sentiment-analysis-challenges/

---

*This research report was prepared to inform the sentiment analysis feature roadmap for the POC-TMS EmpSurvey module.*
