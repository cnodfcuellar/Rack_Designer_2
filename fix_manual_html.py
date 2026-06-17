import re

with open('doc/html/manual.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace transparent inline styles with class
html = html.replace('style="background-color: transparent; border: none; padding: 0;"', 'class="graphic-box transparent"')

# Convert ul.content-list to div.feature-grid
def ul_to_grid(match):
    ul_content = match.group(1)
    lis = re.findall(r'<li>(.*?)</li>', ul_content, re.DOTALL)
    cards = []
    for li in lis:
        strong_match = re.search(r'<strong>(.*?)</strong>(.*)', li, re.DOTALL)
        if strong_match:
            title = strong_match.group(1).replace(':', '').strip()
            desc = strong_match.group(2).strip()
            cards.append(f'        <div class="feature-card">\n          <strong>{title}</strong>\n          <span>{desc}</span>\n        </div>')
        else:
            cards.append(f'        <div class="feature-card">\n          <span>{li}</span>\n        </div>')
    
    grid = '\n'.join(cards)
    return f'<div class="feature-grid">\n{grid}\n      </div>'

html = re.sub(r'<ul class="content-list">\s*(.*?)\s*</ul>', ul_to_grid, html, flags=re.DOTALL)

with open('doc/html/manual.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML lists converted to modern grid cards.")
