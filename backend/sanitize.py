import bleach

def sanitize_text(text: str) -> str:
    """Strip dangerous HTML/scripts from user input."""
    if not text:
        return text
    # Strip ALL html tags, leaving only safe plain text
    return bleach.clean(text, tags=[], attributes={}, strip=True)