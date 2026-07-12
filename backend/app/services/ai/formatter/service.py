import logging

logger = logging.getLogger("app.services.ai.formatter")

class FormatterService:
    """
    Normalizes AI outputs, validating markdown syntax, header hierarchies, and disclaimers.
    """
    def format_response(self, text: str) -> str:
        if not text:
            return ""

        # Clean spaces and line breaks
        lines = text.split("\n")
        formatted_lines = []
        in_code_block = False

        for line in lines:
            stripped = line.strip()
            if stripped.startswith("```"):
                in_code_block = not in_code_block
                formatted_lines.append(line)
                continue

            if in_code_block:
                formatted_lines.append(line)
                continue

            # Normalize headers spacing
            if stripped.startswith("##"):
                formatted_lines.append(f"\n{stripped}\n")
            elif stripped.startswith("-") or stripped.startswith("*"):
                # Standardize bullet list spacing
                formatted_lines.append(line)
            else:
                formatted_lines.append(line)

        # Re-join lines and strip excessive whitespace
        formatted_text = "\n".join(formatted_lines)
        while "\n\n\n" in formatted_text:
            formatted_text = formatted_text.replace("\n\n\n", "\n\n")

        # Standard disclaimer append
        disclaimer_trigger = "astrology offers interpretations"
        disclaimer_text = (
            "\n\n---\n\n"
            "**Reminder:** Astrology offers interpretations of planetary energies rather than absolute physical certainties. "
            "Your free will and personal actions (Karma) remain the ultimate driving forces in shaping your life path."
        )

        if disclaimer_trigger not in formatted_text.lower():
            formatted_text += disclaimer_text

        return formatted_text.strip()

# Singleton instance
formatter_service = FormatterService()
