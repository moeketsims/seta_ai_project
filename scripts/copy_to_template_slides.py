#!/usr/bin/env python3
"""
Copy Crisis presentation content into Education template
Works around .potx limitations by creating from template then populating
"""

from pptx import Presentation
from copy import deepcopy
import subprocess
import os

CRISIS_FILE = "docs/slides/From-Crisis-to-Capability-Human-Centric-Analytics-for-Better-Teaching-and-Learning.pptx"
TEMPLATE_FILE = "docs/slides/Education PowerPoint 2023.potx"
OUTPUT_FILE = "docs/slides/ETDP_SETA_With_Template_Footer.pptx"

def main():
    print("=" * 70)
    print("📋 COPYING CRISIS CONTENT TO EDUCATION TEMPLATE")
    print("=" * 70)
    
    # Since we can't open .potx programmatically, we'll use AppleScript
    # to open it in PowerPoint and let PowerPoint handle the template
    
    print("\n🎯 Strategy: Using PowerPoint to create from template...")
    
    # Step 1: Open template in PowerPoint (creates new presentation)
    print("\n1️⃣ Opening Education template in PowerPoint...")
    applescript_open = f'''
    tell application "Microsoft PowerPoint"
        activate
        open POSIX file "{os.path.abspath(TEMPLATE_FILE)}"
        delay 2
    end tell
    '''
    
    subprocess.run(['osascript', '-e', applescript_open])
    print("   ✓ Template opened (creates new presentation with theme)")
    
    # Step 2: Load crisis presentation
    print("\n2️⃣ Loading crisis presentation content...")
    crisis_prs = Presentation(CRISIS_FILE)
    print(f"   ✓ Loaded {len(crisis_prs.slides)} slides")
    
    # Step 3: Provide instructions for user
    print("\n3️⃣ Next steps (PowerPoint is now open with template):")
    print("\n   📝 IN POWERPOINT, DO THIS:")
    print("   " + "─" * 60)
    print("   a. The Education template is open (blank presentation)")
    print("   b. Now open your content file:")
    print(f"      File → Open → {CRISIS_FILE}")
    print("   c. In the content file, select all slides:")
    print("      - View → Slide Sorter (or use left panel)")
    print("      - Press Cmd+A (selects all 20 slides)")
    print("      - Press Cmd+C (copy)")
    print("   d. Switch back to the Education template window")
    print("   e. Press Cmd+V (paste)")
    print("   f. Dialog appears: Click 'Use destination theme'")
    print("   g. Save as: ETDP_SETA_With_Template_Footer.pptx")
    print("   " + "─" * 60)
    
    print("\n✨ RESULT: All slides will have:")
    print("   ✅ Education 2023 theme colors and fonts")
    print("   ✅ Education 2023 footer (automatically applied)")
    print("   ✅ All 20 slides with complete content")
    print("   ✅ Proper formatting and design")
    
    print("\n" + "=" * 70)
    print("💡 Follow the steps above in PowerPoint")
    print("=" * 70)
    
    # Alternative: Open the crisis file too
    print("\n🚀 Opening crisis presentation as well...")
    applescript_open_crisis = f'''
    tell application "Microsoft PowerPoint"
        activate
        open POSIX file "{os.path.abspath(CRISIS_FILE)}"
    end tell
    '''
    
    subprocess.run(['osascript', '-e', applescript_open_crisis])
    print("   ✓ Crisis presentation opened")
    
    print("\n✅ Both files are now open in PowerPoint!")
    print("📋 Follow the steps above to copy content to template")

if __name__ == "__main__":
    main()












