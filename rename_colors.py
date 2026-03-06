import os
import re

directories = ['app', 'components', 'lib']
replacements = {
    r'#f8f4e9': '#e9ece8',
    r'#f3e4c7': '#c8d6ce',
    r'#fff6e5': '#f2f5f1',
    r'#212a3b': '#132a1c',
    r'#3d485e': '#1f452d',
    r'#222c37': '#385945',
    r'#663820': '#1b452e',
    r'#7a4528': '#112e1d',
    r'#8B7355': '#4a6e58',
    r'rgba\(33, 42, 59': 'rgba(19, 42, 28'
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
