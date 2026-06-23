import re

def extract_sections(filepath, is_v1=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    sections = []
    # Find all <section> ... </section>
    matches = re.finditer(r'(<section[^>]*>.*?</section>)', content, flags=re.DOTALL)
    for m in matches:
        sec = m.group(1)
        if is_v1 and 'id="summary"' in sec:
            continue
        sections.append(sec)
    
    # Also extract styles and scripts if needed
    styles = re.findall(r'<style>(.*?)</style>', content, flags=re.DOTALL)
    scripts = re.findall(r'<script>(.*?)</script>', content, flags=re.DOTALL)
    
    return sections, styles, scripts

def main():
    sec1, sty1, scr1 = extract_sections('doc/html/ui_mejoras.html', is_v1=True)
    sec2, sty2, scr2 = extract_sections('doc/html/ui_mejoras_2.html')
    sec3, sty3, scr3 = extract_sections('doc/html/ui_mejoras_3.html')
    
    # We want to preserve the styling of ui_mejoras_3.html mostly, 
    # but since v1 and v2 have their own classes, we should append their specific styles.
    # Actually, we can just dump all styles into the <head> of v3.
    # And dump all sections into the <div class="container"> of v3.
    # And dump all scripts before </body>.
    
    with open('doc/html/ui_mejoras_3.html', 'r', encoding='utf-8') as f:
        v3_content = f.read()
        
    # We will modify v3_content.
    # 1. Insert sections from v1 and v2 after the existing sections in v3.
    # The existing sections in v3 are inside <div class="container">.
    # Let's find the closing </div> of container.
    # Actually, let's just replace the content of <div class="container"> with ALL sections.
    
    all_sections = sec1 + sec2 + sec3
    
    # Renumbering the sec-num
    for i, sec in enumerate(all_sections):
        # replace <span class="sec-num">0X / ...</span> or <div class="section-num">X</div>
        num = i + 1
        sec = re.sub(r'<div class="section-num">\d+</div>', f'<div class="section-num">{num}</div>', sec)
        sec = re.sub(r'<span class="sec-num">\d+ \/', f'<span class="sec-num">{num:02d} /', sec)
        all_sections[i] = sec
        
    sections_html = "\n\n".join(all_sections)
    
    # We need to inject styles.
    # v1 styles has its own body styles which might conflict. Let's filter out general tag selectors like body, *, header, from sty1 and sty2.
    filtered_sty1 = []
    for s in sty1:
        # Very hacky: just append it, CSS specificity might be an issue. Let's wrap v1 sections in a div and scope it? 
        # Actually v1 uses class="section", "cards", "card", "mockup". 
        # v3 uses "sec-header", "details-grid", "info-panel", "mockup-panel".
        # They shouldn't conflict much.
        pass
    
    # Since manual merging of CSS via regex might break things, let's just append the <style> blocks.
    # I'll just append sty1 and sty2 into the head.
    all_styles = "\n".join(sty1 + sty2)
    # Remove @import from appended styles to avoid errors
    all_styles = re.sub(r'@import url.*?;', '', all_styles)
    # Remove body/root resets from appended styles to keep v3 base
    all_styles = re.sub(r':root\s*{[^}]*}', '', all_styles)
    all_styles = re.sub(r'\*\s*{[^}]*}', '', all_styles)
    all_styles = re.sub(r'body\s*{[^}]*}', '', all_styles)
    all_styles = re.sub(r'header\s*{[^}]*}', '', all_styles)
    
    all_scripts = "\n".join(scr1 + scr2 + scr3)
    
    # Rebuild v3
    # Extract everything before <div class="container">
    parts = re.split(r'<div class="container">', v3_content)
    head_part = parts[0]
    tail_part = parts[1]
    
    # Extract everything after the last section in tail_part
    tail_parts = re.split(r'</section>', tail_part)
    footer_part = tail_parts[-1] # The rest of the HTML after the last section
    
    # Insert styles before </head>
    head_part = head_part.replace('</head>', f'<style>\n{all_styles}\n</style>\n</head>')
    
    # Navigation menu
    nav_links = ""
    for i, sec in enumerate(all_sections):
        match = re.search(r'id="(.*?)"', sec)
        title_match = re.search(r'<h[23][^>]*>(.*?)</h[23]>', sec)
        if match and title_match:
            nav_id = match.group(1)
            title = title_match.group(1).replace('—', '-').split('-')[0].strip()
            # Strip tags
            title = re.sub(r'<[^>]+>', '', title)
            nav_links += f'<a href="#{nav_id}" class="nav-btn">{i+1}. {title}</a>\n'
            
    head_part = re.sub(r'<nav class="nav-menu">.*?</nav>', f'<nav class="nav-menu">\n{nav_links}</nav>', head_part, flags=re.DOTALL)
    
    final_html = head_part + '<div class="container">\n' + sections_html + '\n</section>' + footer_part
    
    # Replace the scripts before </body>
    final_html = re.sub(r'<script>.*?</script>', '', final_html, flags=re.DOTALL)
    final_html = final_html.replace('</body>', f'<script>\n{all_scripts}\n</script>\n</body>')
    
    with open('doc/html/ui_mejoras_3_mega.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
        
    print("Mega doc created: ui_mejoras_3_mega.html")

if __name__ == '__main__':
    main()
