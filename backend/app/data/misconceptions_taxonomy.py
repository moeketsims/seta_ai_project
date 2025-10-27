"""
CAPS Mathematics Misconceptions Taxonomy
Common mathematical misconceptions for South African curriculum (Grades R-12)
Organized by category with detection patterns and remediation strategies.
"""

from typing import List, Dict, Any

# Misconception categories aligned with CAPS strands
CATEGORIES = {
    "NUMBER_OPERATIONS": "Numbers, Operations, and Relationships",
    "FRACTIONS": "Fractions and Rational Numbers",
    "DECIMALS": "Decimals and Percentages",
    "ALGEBRA": "Patterns, Functions, and Algebra",
    "GEOMETRY": "Space and Shape (Geometry)",
    "MEASUREMENT": "Measurement",
    "DATA": "Data Handling and Probability"
}

# Severity levels
SEVERITY_LEVELS = {
    "LOW": "Minor misunderstanding, easily corrected",
    "MEDIUM": "Significant gap, requires focused intervention",
    "HIGH": "Fundamental misunderstanding, blocks further progress",
    "CRITICAL": "Prevents grade-level mathematics understanding"
}

# Comprehensive misconception taxonomy
MISCONCEPTIONS_TAXONOMY: List[Dict[str, Any]] = [
    # ========================================================================
    # NUMBER OPERATIONS MISCONCEPTIONS
    # ========================================================================
    {
        "id": "misc_001",
        "name": "Multiplication Always Makes Bigger",
        "category": "NUMBER_OPERATIONS",
        "description": "Learner believes multiplication always results in a larger number, failing with fractions/decimals < 1",
        "severity": "HIGH",
        "affected_grades": [4, 5, 6, 7],
        "example_errors": [
            "0.5 × 4 = bigger than 4",
            "1/2 × 8 should give answer bigger than 8"
        ],
        "detection_patterns": [
            "multiplying by fraction/decimal < 1",
            "expects product > both factors"
        ],
        "remediation_strategy": "Use visual models (area models, number lines). Practice with real-world contexts (half of something). Show that multiplication is repeated addition OR scaling.",
        "prerequisite_skills": ["understanding of fractions", "decimal place value"],
        "estimated_remediation_time": 3
    },
    {
        "id": "misc_002",
        "name": "Division Always Makes Smaller",
        "category": "NUMBER_OPERATIONS",
        "description": "Learner believes division always results in a smaller number, failing with fractions/decimals < 1",
        "severity": "HIGH",
        "affected_grades": [4, 5, 6, 7],
        "example_errors": [
            "10 ÷ 0.5 = 5 (instead of 20)",
            "8 ÷ 1/2 should be smaller than 8"
        ],
        "detection_patterns": [
            "dividing by fraction/decimal < 1",
            "expects quotient < dividend"
        ],
        "remediation_strategy": "Use sharing/grouping models. Ask 'how many halves in 10?' Build understanding of division as inverse multiplication.",
        "prerequisite_skills": ["understanding of fractions", "multiplication"],
        "estimated_remediation_time": 3
    },
    {
        "id": "misc_003",
        "name": "Ignoring Order of Operations",
        "category": "NUMBER_OPERATIONS",
        "description": "Learner performs operations left-to-right without following BODMAS/PEMDAS",
        "severity": "MEDIUM",
        "affected_grades": [5, 6, 7, 8, 9],
        "example_errors": [
            "3 + 4 × 2 = 14 (instead of 11)",
            "10 - 2 × 3 = 24 (instead of 4)"
        ],
        "detection_patterns": [
            "left-to-right calculation",
            "addition/subtraction before multiplication/division"
        ],
        "remediation_strategy": "Teach BODMAS mnemonic. Use parentheses to make order explicit. Practice with real-world problems requiring specific order.",
        "prerequisite_skills": ["basic operations"],
        "estimated_remediation_time": 2
    },

    # ========================================================================
    # FRACTIONS MISCONCEPTIONS
    # ========================================================================
    {
        "id": "misc_004",
        "name": "Add/Subtract Fractions by Adding Denominators",
        "category": "FRACTIONS",
        "description": "Learner adds both numerators and denominators: 1/2 + 1/3 = 2/5",
        "severity": "HIGH",
        "affected_grades": [4, 5, 6, 7],
        "example_errors": [
            "1/2 + 1/3 = 2/5",
            "3/4 - 1/2 = 2/2"
        ],
        "detection_patterns": [
            "sum of numerators over sum of denominators",
            "no common denominator found"
        ],
        "remediation_strategy": "Use visual fraction models (circles, bars). Show that pieces must be same size. Practice finding equivalent fractions and common denominators.",
        "prerequisite_skills": ["fraction representation", "equivalent fractions"],
        "estimated_remediation_time": 4
    },
    {
        "id": "misc_005",
        "name": "Larger Denominator Means Larger Fraction",
        "category": "FRACTIONS",
        "description": "Learner believes 1/8 > 1/4 because 8 > 4",
        "severity": "HIGH",
        "affected_grades": [3, 4, 5, 6],
        "example_errors": [
            "1/8 > 1/4",
            "2/10 > 2/5"
        ],
        "detection_patterns": [
            "comparing fractions by denominator size only",
            "ignoring numerator"
        ],
        "remediation_strategy": "Use concrete materials (pizza slices, chocolate bars). Show that more pieces means smaller pieces. Compare with same-size wholes.",
        "prerequisite_skills": ["part-whole understanding"],
        "estimated_remediation_time": 3
    },
    {
        "id": "misc_006",
        "name": "Denominator Confusion in Equivalence",
        "category": "FRACTIONS",
        "description": "Creates equivalent fractions by multiplying only numerator or only denominator",
        "severity": "MEDIUM",
        "affected_grades": [4, 5, 6],
        "example_errors": [
            "1/2 = 2/2 (multiply only numerator)",
            "3/4 = 3/8 (multiply only denominator)"
        ],
        "detection_patterns": [
            "only one part transformed",
            "fraction value changes"
        ],
        "remediation_strategy": "Show that multiplying by n/n = 1. Use visual models showing whole divided into more pieces. Practice with concrete examples.",
        "prerequisite_skills": ["multiplication", "fraction representation"],
        "estimated_remediation_time": 2
    },

    # ========================================================================
    # DECIMALS MISCONCEPTIONS
    # ========================================================================
    {
        "id": "misc_007",
        "name": "Longer Decimal is Larger",
        "category": "DECIMALS",
        "description": "Learner believes more decimal places means larger number: 0.234 > 0.5",
        "severity": "HIGH",
        "affected_grades": [4, 5, 6, 7],
        "example_errors": [
            "0.234 > 0.5 (because 234 > 5)",
            "0.08 > 0.8"
        ],
        "detection_patterns": [
            "comparing by number of digits",
            "ignoring place value"
        ],
        "remediation_strategy": "Use place value charts. Compare to money (R0.50 vs R0.08). Add zeros to show equivalence (0.5 = 0.500). Number line activities.",
        "prerequisite_skills": ["place value", "decimal notation"],
        "estimated_remediation_time": 3
    },
    {
        "id": "misc_008",
        "name": "Decimal Point as Separator",
        "category": "DECIMALS",
        "description": "Treats decimal point as separator between two whole numbers, not place value indicator",
        "severity": "MEDIUM",
        "affected_grades": [4, 5, 6],
        "example_errors": [
            "3.45 is '3 and 45'",
            "Adding 0.2 + 0.3 = 0.5 but can't explain why"
        ],
        "detection_patterns": [
            "reading decimals as two separate numbers",
            "confusion with operations"
        ],
        "remediation_strategy": "Explicit place value teaching. Show connection to fractions (3.45 = 3 45/100). Use base-10 blocks. Practice reading and writing decimals.",
        "prerequisite_skills": ["place value", "fraction/decimal connection"],
        "estimated_remediation_time": 3
    },

    # ========================================================================
    # ALGEBRA MISCONCEPTIONS
    # ========================================================================
    {
        "id": "misc_009",
        "name": "Variable as Label Not Quantity",
        "category": "ALGEBRA",
        "description": "Learner treats variables as labels or abbreviations rather than quantities",
        "severity": "HIGH",
        "affected_grades": [7, 8, 9, 10],
        "example_errors": [
            "'a' stands for 'apples' not number of apples",
            "Can't understand that 'a' can represent any number"
        ],
        "detection_patterns": [
            "confusion when variable represents different values",
            "can't solve simple equations"
        ],
        "remediation_strategy": "Start with simple patterns. Use 'box' or '?' before introducing letters. Show same variable can have different values in different contexts.",
        "prerequisite_skills": ["number sense", "patterns"],
        "estimated_remediation_time": 4
    },
    {
        "id": "misc_010",
        "name": "Equals Sign as 'Do Something'",
        "category": "ALGEBRA",
        "description": "Learner sees '=' as instruction to calculate, not balance/equivalence",
        "severity": "HIGH",
        "affected_grades": [6, 7, 8, 9],
        "example_errors": [
            "3 + 4 = 7 + 2 = 9 (chaining)",
            "Can't solve 8 = x + 3"
        ],
        "detection_patterns": [
            "equals sign always at end",
            "confusion with equations"
        ],
        "remediation_strategy": "Use balance scale metaphor. Show equations with operation on right (7 = 3 + 4). Practice true/false equations. Build relational understanding.",
        "prerequisite_skills": ["number relationships"],
        "estimated_remediation_time": 3
    },
    {
        "id": "misc_011",
        "name": "Letter-Number Separation",
        "category": "ALGEBRA",
        "description": "Cannot combine or compare terms with variables and constants",
        "severity": "MEDIUM",
        "affected_grades": [8, 9, 10],
        "example_errors": [
            "3x + 2 = 5x (adding variable and constant)",
            "Can't simplify 4a + 3"
        ],
        "detection_patterns": [
            "treating variables and numbers as separate",
            "incorrect simplification"
        ],
        "remediation_strategy": "Use concrete objects (x represents apples). Show that 3x means 3 groups of x. Practice with substitution to verify results.",
        "prerequisite_skills": ["variable understanding", "like terms"],
        "estimated_remediation_time": 2
    },

    # ========================================================================
    # GEOMETRY MISCONCEPTIONS
    # ========================================================================
    {
        "id": "misc_012",
        "name": "Orientation Affects Shape Identity",
        "category": "GEOMETRY",
        "description": "Learner believes rotated shapes are different shapes",
        "severity": "MEDIUM",
        "affected_grades": [2, 3, 4, 5],
        "example_errors": [
            "Tilted square is not a square",
            "Diamond and square are different shapes"
        ],
        "detection_patterns": [
            "won't identify rotated shapes",
            "relies on standard orientation"
        ],
        "remediation_strategy": "Physical manipulation of shapes. Sort shapes in different orientations. Use dynamic geometry software. Focus on properties not appearance.",
        "prerequisite_skills": ["shape properties"],
        "estimated_remediation_time": 2
    },
    {
        "id": "misc_013",
        "name": "Perimeter-Area Confusion",
        "category": "GEOMETRY",
        "description": "Confuses or conflates perimeter and area concepts",
        "severity": "MEDIUM",
        "affected_grades": [4, 5, 6, 7],
        "example_errors": [
            "Uses area formula for perimeter",
            "Thinks doubling perimeter doubles area"
        ],
        "detection_patterns": [
            "wrong formula application",
            "confusion about units (m vs m²)"
        ],
        "remediation_strategy": "Distinguish boundary (perimeter) from surface (area). Use real contexts (fencing vs. carpeting). Practice with grid paper. Emphasize units.",
        "prerequisite_skills": ["measurement", "formula application"],
        "estimated_remediation_time": 3
    },

    # ========================================================================
    # MEASUREMENT MISCONCEPTIONS
    # ========================================================================
    {
        "id": "misc_014",
        "name": "Ignoring Units in Conversion",
        "category": "MEASUREMENT",
        "description": "Learner converts units incorrectly or drops units entirely",
        "severity": "MEDIUM",
        "affected_grades": [4, 5, 6, 7, 8],
        "example_errors": [
            "1 km = 100 m (instead of 1000 m)",
            "2 hours = 200 minutes"
        ],
        "detection_patterns": [
            "incorrect conversion factors",
            "missing units in answer"
        ],
        "remediation_strategy": "Use conversion charts. Practice with real measurements. Show relationship between units. Emphasize 'per' in rates. Always include units.",
        "prerequisite_skills": ["multiplication/division", "place value"],
        "estimated_remediation_time": 2
    },

    # ========================================================================
    # DATA & PROBABILITY MISCONCEPTIONS
    # ========================================================================
    {
        "id": "misc_015",
        "name": "Representative Sampling Errors",
        "category": "DATA",
        "description": "Believes small/biased samples represent whole population",
        "severity": "LOW",
        "affected_grades": [7, 8, 9, 10],
        "example_errors": [
            "Surveying only friends is representative",
            "3 trials is enough for probability"
        ],
        "detection_patterns": [
            "small sample sizes",
            "biased sampling methods"
        ],
        "remediation_strategy": "Discuss sampling methods. Compare results from different samples. Show variability in small samples. Teach random sampling.",
        "prerequisite_skills": ["data collection", "populations"],
        "estimated_remediation_time": 2
    },
    {
        "id": "misc_016",
        "name": "Gambler's Fallacy",
        "category": "DATA",
        "description": "Believes past random events affect future independent events",
        "severity": "LOW",
        "affected_grades": [7, 8, 9, 10, 11],
        "example_errors": [
            "Coin landed heads 3 times, tails is 'due'",
            "Hot hand fallacy in sports"
        ],
        "detection_patterns": [
            "expectation of balance in short term",
            "pattern-seeking in random data"
        ],
        "remediation_strategy": "Simulate many trials. Show independence of events. Discuss law of large numbers. Differentiate dependent vs independent events.",
        "prerequisite_skills": ["probability", "independence"],
        "estimated_remediation_time": 2
    },

    # ========================================================================
    # NEGATIVE NUMBERS
    # ========================================================================
    {
        "id": "misc_017",
        "name": "Double Negative Confusion",
        "category": "NUMBER_OPERATIONS",
        "description": "Struggles with subtracting negative numbers or multiplying negatives",
        "severity": "MEDIUM",
        "affected_grades": [6, 7, 8, 9],
        "example_errors": [
            "5 - (-3) = 2 (instead of 8)",
            "-2 × -3 = -6 (instead of 6)"
        ],
        "detection_patterns": [
            "two negatives make negative",
            "confusion with operation signs"
        ],
        "remediation_strategy": "Use number line models. Temperature/debt contexts. Show that subtracting debt adds. Practice with pattern recognition (-2×1, -2×0, -2×-1...).",
        "prerequisite_skills": ["negative numbers", "operations"],
        "estimated_remediation_time": 3
    },

    # ========================================================================
    # RATIO & PROPORTION
    # ========================================================================
    {
        "id": "misc_018",
        "name": "Additive Instead of Multiplicative Reasoning",
        "category": "NUMBER_OPERATIONS",
        "description": "Uses addition/subtraction for proportional situations requiring multiplication/division",
        "severity": "HIGH",
        "affected_grades": [6, 7, 8, 9],
        "example_errors": [
            "If 2 apples cost R5, 4 apples cost R7 (add R2 not double)",
            "Scaling recipes by adding not multiplying"
        ],
        "detection_patterns": [
            "constant difference not constant ratio",
            "linear addition in proportion problems"
        ],
        "remediation_strategy": "Use ratio tables. Show multiplicative relationships explicitly. Compare situations requiring additive vs multiplicative thinking. Double/half strategies.",
        "prerequisite_skills": ["multiplication", "ratios"],
        "estimated_remediation_time": 4
    },

    # ========================================================================
    # EXPONENTS
    # ========================================================================
    {
        "id": "misc_019",
        "name": "Distributing Exponents Incorrectly",
        "category": "ALGEBRA",
        "description": "Applies exponent to each term in sum: (a+b)² = a² + b²",
        "severity": "HIGH",
        "affected_grades": [9, 10, 11],
        "example_errors": [
            "(x + 3)² = x² + 9",
            "(2a)³ = 2a³"
        ],
        "detection_patterns": [
            "missing middle term in expansion",
            "incorrect simplification"
        ],
        "remediation_strategy": "Expand as (a+b)(a+b). Use area models for (a+b)². Practice with numerical examples first. Show why it doesn't distribute.",
        "prerequisite_skills": ["distributive property", "FOIL"],
        "estimated_remediation_time": 3
    },

    # ========================================================================
    # PERCENTAGES
    # ========================================================================
    {
        "id": "misc_020",
        "name": "Percentage as Absolute Value",
        "category": "DECIMALS",
        "description": "Treats percentages as fixed amounts regardless of base",
        "severity": "MEDIUM",
        "affected_grades": [6, 7, 8],
        "example_errors": [
            "10% of any number is always 10",
            "Confusion with percentage increase/decrease"
        ],
        "detection_patterns": [
            "ignoring base value",
            "wrong calculation"
        ],
        "remediation_strategy": "Show percentage as 'per hundred'. Use benchmark percentages (10%, 50%, 25%). Practice finding percentage of different amounts. Fraction-decimal-percentage connections.",
        "prerequisite_skills": ["fractions", "decimals", "proportions"],
        "estimated_remediation_time": 3
    }
]


def get_all_misconceptions() -> List[Dict[str, Any]]:
    """Return full misconception taxonomy"""
    return MISCONCEPTIONS_TAXONOMY


def get_misconceptions_by_category(category: str) -> List[Dict[str, Any]]:
    """Get misconceptions for specific category"""
    return [m for m in MISCONCEPTIONS_TAXONOMY if m["category"] == category]


def get_misconceptions_by_grade(grade: int) -> List[Dict[str, Any]]:
    """Get misconceptions relevant to specific grade"""
    return [m for m in MISCONCEPTIONS_TAXONOMY if grade in m["affected_grades"]]


def get_misconception_by_id(misconception_id: str) -> Dict[str, Any]:
    """Get specific misconception by ID"""
    for m in MISCONCEPTIONS_TAXONOMY:
        if m["id"] == misconception_id:
            return m
    return None


def search_misconceptions(query: str) -> List[Dict[str, Any]]:
    """Search misconceptions by name or description"""
    query = query.lower()
    results = []
    for m in MISCONCEPTIONS_TAXONOMY:
        if (query in m["name"].lower() or
            query in m["description"].lower() or
            any(query in ex.lower() for ex in m["example_errors"])):
            results.append(m)
    return results
