import os
import re

directories = ['app', 'components', 'lib']
replacements = {
    r'#e9ece8': '#f8fafc',
    r'#c8d6ce': '#f1f5f9',
    r'#f2f5f1': '#ffffff',
    r'#132a1c': '#0f172a',
    r'#1f452d': '#334155',
    r'#385945': '#475569',
    r'#1b452e': '#3b82f6',
    r'#112e1d': '#2563eb',
    r'#4a6e58': '#94a3b8',
    r'rgba\(19, 42, 28': 'rgba(15, 23, 42'
}

for root_dir in directories:
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.tsx') or filename.endswith('.ts') or filename.endswith('.css'):
                filepath = os.path.join(dirpath, filename)
                with open(filepath, 'r') as f:
                    content = f.read()

                original_content = content
                for old, new in replacements.items():
                    content = re.sub(old, new, content, flags=re.IGNORECASE)

                if content != original_content:
                    with open(filepath, 'w') as f:
                        f.write(content)
                    print(f"Updated {filepath}")
