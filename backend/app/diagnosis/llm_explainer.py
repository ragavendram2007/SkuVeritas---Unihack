import os
from typing import Optional, List
from app.models.contract import DiagnosisResult, SourceValueDetail
from app.diagnosis.reasoner import DeterministicReasoner

class LLMExplainer:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.reasoner = DeterministicReasoner()
        self.client = None
        if self.api_key:
            try:
                import anthropic
                self.client = anthropic.Anthropic(api_key=self.api_key)
            except Exception:
                self.client = None

    def diagnose(
        self,
        attribute_name: str,
        resolved_value: str,
        resolved_unit: str,
        sources: List[SourceValueDetail],
        match_confidence: float = 1.0
    ) -> DiagnosisResult:
        """
        Runs deterministic checks first.
        If a deterministic check fired, uses that verdict (and optionally refines plain English with LLM if client exists).
        If no deterministic check fired and LLM client exists, invokes LLM.
        """
        # 1. Deterministic Pass
        diag = self.reasoner.diagnose_conflict(resolved_value, resolved_unit, sources, match_confidence)

        # If clean or deterministic check fired, return immediately or refine explanation
        if diag.cause != "Uncategorized Discrepancy" or not self.client:
            return diag

        # 2. LLM Fallback Pass for Uncategorized Discrepancies
        try:
            source_summary = "\n".join([
                f"- Source '{s.source_id}' ({s.source_type}, prior weight {s.reliability_weight}): {s.value} {s.unit} (Last mod: {s.last_modified})"
                for s in sources
            ])
            
            prompt = f"""You are SkuVeritas AI Data Intelligence Engine.
Analyze the following attribute conflict in an e-commerce catalog record.

Attribute: {attribute_name}
Consensus Value: {resolved_value} {resolved_unit}

Source Data:
{source_summary}

Classify the likely cause of disagreement and provide a brief 2-sentence plain English explanation.
Return JSON format:
{{
  "cause": "<Short Cause Title>",
  "confidence": <float between 0.5 and 0.95>,
  "explanation": "<Plain english explanation>"
}}
"""
            response = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=250,
                temperature=0.2,
                messages=[{"role": "user", "content": prompt}]
            )

            text_content = response.content[0].text
            import json
            import re
            json_match = re.search(r'\{.*\}', text_content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
                diag.cause = data.get("cause", diag.cause)
                diag.confidence = float(data.get("confidence", diag.confidence))
                diag.explanation = data.get("explanation", diag.explanation)
                
                # Add LLM reasoning step to trail
                diag.reasoning_trail.append({
                    "step": "LLM Free-form Analysis",
                    "passed": True,
                    "details": f"Claude AI analyzed source text and context: {diag.explanation}"
                })
        except Exception as e:
            # Silently fallback to deterministic output
            pass

        return diag
