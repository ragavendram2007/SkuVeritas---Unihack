# SkuVeritas — Hackathon Presentation Script & Q&A Playbook

---

## 🎯 60-Second Presentation Walkthrough Path

### 1. The Problem & Operator Dashboard (`http://localhost:5174`)
> *"E-commerce product catalogs suffer from conflicting supplier data, unit mislabels, and stale revisions. SkuVeritas is a product data trust engine that doesn't just score data — it diagnoses conflicts, routes risks, and gets smarter over time."*

- **Show**: Impact Metrics Banner (*"X Auto-Published, Y Risk Discrepancies Intercepted"*).
- **Demo Action**: Type into "Ask SkuVeritas": *"Which products are currently blocked and why?"*

---

### 2. Product Dossier & The "BLOCKED" Verdict Stamp (`PR-9000`)
> *"Every product is investigated as a formal Case File Dossier. Here is PR-9000, a high pressure regulator valve."*

- **Show**: Credibility Dial Gauge ($95.2\%$) and the bold, angled **`[ BLOCKED ]`** Verdict Stamp.
- **Show Banner**: 3-Tier Routing Decision: *"Blocked: pressure_rating risk 0.145 exceeds hard-block threshold 0.10 despite 85.5% confidence."*

---

### 3. Evidence Chain & 4-Tier Reasoning Trail
> *"Why did it block? 3 sources report 200 PSI, but 1 scraped webpage reports 300 PSI. SkuVeritas didn't guess — its 4-tier deterministic engine detected that 300 PSI ≈ 20.7 bar, a classic bar-to-PSI unit mislabeling."*

- **Demo Action**: Click **View Evidence** on `pressure_rating` to reveal Exhibit cards (Exhibit A, B, C, D) and stacked weight breakdown bars.

---

### 4. Human Review Action & Adaptive Source Trust
> *"When an analyst intervenes, the system learns in real time."*

- **Demo Action**: Press key `O` (or click Override Value) $\rightarrow$ Enter `"200 PSI"` and justification: `"Verified against physical manufacturer spec sheet"`.
- **Show**: Verdict Stamp flips to **`[ OVERRIDDEN ]`** in cyan.
- **Demo Action**: Switch to **Trust Ledger** tab $\rightarrow$ Show `pr_9000_scraped_webpage` reliability weight automatically nudged down from **`0.40` $\rightarrow$ `0.35`** for future products!

---

### 5. Downstream ERP Export Layer
> *"Hard-blocked products cannot leak into ERP export without explicit human review. Clean and approved records export into header-exact 252-column spreadsheets or simplified ERP JSON APIs."*

- **Demo Action**: Switch to **ERP Export** tab $\rightarrow$ Show `HT-1010` ready for export vs `PR-9000` pre-review lock status.

---

## 🗣 Key Numbers to State Out Loud

1. **76.7% Auto-Publish Rate**: *"Over 76% of multi-source catalog items resolve with 100% consensus, saving hundreds of manual review hours."*
2. **100% Interception Rate**: *"100% of high-criticality pressure/voltage conflicts are intercepted before publishing."*
3. **252 Column Header-Exact Export**: *"Directly compatible with enterprise PIM/ERP systems with zero column drift."*

---

## ❓ Answers to Hard Judge Questions

### Question 1: "Why doesn't the system just trust majority vote?"
> **Answer**: Majority vote fails when multiple low-credibility scrapers repeat an OCR error or a unit mislabel (e.g. 3 sources reading 300 PSI when the spec is 200 PSI / 20.7 bar). SkuVeritas runs **deterministic physical checks** (unit conversion ratios, digit transposition distance, timestamp decay) *before* counting votes or calling LLMs. Majority vote is a heuristic; physical conversion is ground truth.

### Question 2: "How does extraction actually work across unknown catalog files?"
> **Answer**: SkuVeritas uses a two-tier approach. Structured files pass through an automated **FieldDetector** that inspects column content patterns (alphanumeric ratios, text length distributions, proper noun frequencies) without relying on fixed header names. Messier text passes through **schema-constrained LLM extraction** with Pydantic validation and auto-retries. Every cell's source path is logged and inspectable.
