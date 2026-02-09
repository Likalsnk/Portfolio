
import os
import re
import json

def strip_comments(text):
    return re.sub(r'//.*', '', text)

def get_keys_from_js(content, lang):
    # This is a heuristic parser. 
    # It assumes the file structure:
    # en: { ... }, ua: { ... }
    
    # Find the start of the language block
    start_pattern = f'{lang}:' + r'\s*\{'
    start_match = re.search(start_pattern, content)
    if not start_match:
        return set()
    
    start_index = start_match.end()
    
    # Find the matching closing brace (simple counter)
    brace_count = 1
    end_index = start_index
    for i, char in enumerate(content[start_index:]):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
        
        if brace_count == 0:
            end_index = start_index + i
            break
            
    block_content = content[start_index:end_index]
    
    # Extract keys
    # Keys are quoted strings followed by a colon
    keys = set()
    # We strip comments first
    clean_block = re.sub(r'//.*', '', block_content)
    
    for match in re.finditer(r'"([^"]+)"\s*:', clean_block):
        keys.add(match.group(1))
        
    return keys

def main():
    # 1. Load Translations
    with open('translations.js', 'r', encoding='utf-8') as f:
        content = f.read()
        
    en_keys = get_keys_from_js(content, 'en')
    ua_keys = get_keys_from_js(content, 'ua')
    
    print(f"Loaded {len(en_keys)} EN keys and {len(ua_keys)} UA keys.")
    
    # Check consistency
    missing_in_ua = en_keys - ua_keys
    missing_in_en = ua_keys - en_keys
    
    if missing_in_ua:
        print("Keys missing in UA:", missing_in_ua)
    if missing_in_en:
        print("Keys missing in EN:", missing_in_en)

    # 2. Scan HTML files
    used_keys = set()
    broken_links = []
    
    root_dir = os.getcwd()
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip node_modules and .git
        if 'node_modules' in dirnames:
            dirnames.remove('node_modules')
        if '.git' in dirnames:
            dirnames.remove('.git')
            
        for filename in filenames:
            if not filename.endswith('.html'):
                continue
                
            filepath = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(filepath, root_dir)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                file_content = f.read()
                
            # Find data-i18n attributes
            # data-i18n="key", data-i18n-tooltip="key", etc.
            # We look for any attribute starting with data-i18n
            for match in re.finditer(r'data-i18n(?:-[a-z]+)?="([^"]+)"', file_content):
                used_keys.add(match.group(1))
                
            # Check links
            for match in re.finditer(r'href="([^"]+)"', file_content):
                link = match.group(1)
                if link.startswith(('#', 'http', 'mailto:', 'javascript:')):
                    continue
                
                # Resolve link
                # Remove anchors and query params
                clean_link = link.split('#')[0].split('?')[0]
                if not clean_link:
                    continue
                    
                target_path = os.path.normpath(os.path.join(dirpath, clean_link))
                
                if not os.path.exists(target_path):
                     broken_links.append((rel_path, link))

    # 3. Report
    missing_keys = used_keys - en_keys
    if missing_keys:
        print("\nMissing translation keys (used in HTML but not in translations.js):")
        for k in missing_keys:
            print(f" - {k}")
    else:
        print("\nAll used translation keys are present.")
        
    if broken_links:
        print("\nBroken internal links:")
        for file, link in broken_links:
            print(f" - In {file}: {link}")
    else:
        print("\nNo broken internal links found.")

if __name__ == "__main__":
    main()
