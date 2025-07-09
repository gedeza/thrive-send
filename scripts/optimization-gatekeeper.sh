#!/bin/bash

# ===============================================================================
# OPTIMIZATION GATEKEEPER SCRIPT
# ===============================================================================
# A comprehensive shell script that analyzes all code generation attempts
# against optimization principles and blocks violations with specific guidance.
#
# Usage: ./optimization-gatekeeper.sh [command] [options]
# 
# Commands:
#   analyze <file>        - Analyze a single file
#   check-commit          - Check staged files before commit
#   watch                 - Watch directory for changes
#   validate-project      - Validate entire project
#   install-hooks         - Install git hooks
#   setup                 - Initial setup
#
# Author: Optimization Hook System
# Version: 1.0.0
# ===============================================================================

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly CONFIG_FILE="${PROJECT_ROOT}/.optimization-gatekeeper.conf"
readonly LOG_FILE="${PROJECT_ROOT}/.optimization-gatekeeper.log"
readonly PRINCIPLES_FILE="${PROJECT_ROOT}/optimization-principles.md"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m' # No Color

# Emojis
readonly ERROR_EMOJI="🔴"
readonly WARNING_EMOJI="🟡"
readonly SUCCESS_EMOJI="🟢"
readonly INFO_EMOJI="🔵"
readonly SECURITY_EMOJI="🔒"
readonly PERFORMANCE_EMOJI="⚡"
readonly COST_EMOJI="💰"
readonly MAINTAINABILITY_EMOJI="🔧"
readonly BLOCK_EMOJI="🚫"
readonly ANALYZE_EMOJI="🔍"
readonly GUIDANCE_EMOJI="💡"

# Global variables
VERBOSE=false
DRY_RUN=false
STRICT_MODE=false
AUTOFIX=false
BLOCK_ON_WARNINGS=false
EXIT_CODE=0

# Default thresholds
PERFORMANCE_THRESHOLD=70
SECURITY_THRESHOLD=80
MAINTAINABILITY_THRESHOLD=70
COST_THRESHOLD=75
OVERALL_THRESHOLD=70

# ===============================================================================
# UTILITY FUNCTIONS
# ===============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case "$level" in
        ERROR)   echo -e "${RED}${ERROR_EMOJI} ERROR: $message${NC}" >&2 ;;
        WARNING) echo -e "${YELLOW}${WARNING_EMOJI} WARNING: $message${NC}" ;;
        SUCCESS) echo -e "${GREEN}${SUCCESS_EMOJI} SUCCESS: $message${NC}" ;;
        INFO)    echo -e "${BLUE}${INFO_EMOJI} INFO: $message${NC}" ;;
        DEBUG)   [[ "$VERBOSE" == true ]] && echo -e "${PURPLE}DEBUG: $message${NC}" ;;
    esac
}

show_usage() {
    cat << EOF
${BOLD}Optimization Gatekeeper${NC} - Code Quality Guardian

${BOLD}USAGE:${NC}
    $0 [command] [options]

${BOLD}COMMANDS:${NC}
    analyze <file>           Analyze a single file for optimization violations
    check-commit            Check staged files before commit (git hook)
    watch [directory]       Watch directory for file changes
    validate-project        Validate entire project against principles
    install-hooks           Install git hooks for automatic checking
    setup                   Initial setup and configuration
    status                  Show gatekeeper status and statistics
    config                  Show/edit configuration
    help                    Show this help message

${BOLD}OPTIONS:${NC}
    -v, --verbose           Enable verbose output
    -d, --dry-run          Show what would be done without executing
    -s, --strict           Enable strict mode (higher thresholds)
    -a, --autofix          Attempt to automatically fix violations
    -w, --block-warnings   Block on warnings, not just errors
    -t, --threshold <num>  Set custom overall threshold (default: 70)
    -c, --config <file>    Use custom configuration file

${BOLD}EXAMPLES:${NC}
    $0 analyze src/components/Button.tsx
    $0 check-commit --strict
    $0 validate-project --dry-run
    $0 watch src/ --verbose
    $0 install-hooks

${BOLD}EXIT CODES:${NC}
    0    Success, no violations found
    1    Violations found and blocked
    2    Configuration or setup error
    3    File not found or permission error

For more information, see: ${PROJECT_ROOT}/scripts/README.md
EOF
}

load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE"
        log DEBUG "Configuration loaded from $CONFIG_FILE"
    else
        log INFO "No configuration file found, using defaults"
        create_default_config
    fi
}

create_default_config() {
    cat > "$CONFIG_FILE" << 'EOF'
# Optimization Gatekeeper Configuration
# Generated automatically - modify as needed

# Thresholds (0-100)
PERFORMANCE_THRESHOLD=70
SECURITY_THRESHOLD=80
MAINTAINABILITY_THRESHOLD=70
COST_THRESHOLD=75
OVERALL_THRESHOLD=70

# Behavior
STRICT_MODE=false
AUTOFIX=false
BLOCK_ON_WARNINGS=false
VERBOSE=false

# File patterns to include/exclude
INCLUDE_PATTERNS="*.ts *.tsx *.js *.jsx *.py *.java *.cpp *.c"
EXCLUDE_PATTERNS="node_modules/* .git/* dist/* build/* *.min.js"

# Integration settings
ENABLE_GIT_HOOKS=true
ENABLE_REALTIME_WATCH=false
ENABLE_CI_INTEGRATION=true

# Notification settings
ENABLE_NOTIFICATIONS=true
NOTIFICATION_LEVEL="error"  # error, warning, info

# Metrics collection
ENABLE_METRICS=true
METRICS_RETENTION_DAYS=30
EOF
    log INFO "Default configuration created at $CONFIG_FILE"
}

check_dependencies() {
    local missing_deps=()
    
    # Check for required commands
    for cmd in node npm jq git; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    # Check for optional but recommended commands
    for cmd in rg fd; do
        if ! command -v "$cmd" &> /dev/null; then
            log WARNING "Recommended tool '$cmd' not found. Consider installing for better performance."
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log ERROR "Missing required dependencies: ${missing_deps[*]}"
        log ERROR "Please install missing dependencies and try again"
        exit 2
    fi
}

# ===============================================================================
# OPTIMIZATION PRINCIPLES VALIDATION ENGINE
# ===============================================================================

validate_optimization_principles() {
    local file_path="$1"
    local file_content="$2"
    local violations=()
    local warnings=()
    local suggestions=()
    
    log DEBUG "Validating optimization principles for: $file_path"
    
    # Performance Principle Checks
    check_performance_principles "$file_path" "$file_content" violations warnings suggestions
    
    # Security Principle Checks
    check_security_principles "$file_path" "$file_content" violations warnings suggestions
    
    # Maintainability Principle Checks
    check_maintainability_principles "$file_path" "$file_content" violations warnings suggestions
    
    # Cost Optimization Principle Checks
    check_cost_principles "$file_path" "$file_content" violations warnings suggestions
    
    # Calculate overall score
    local score
    score=$(calculate_optimization_score "$file_path" "$file_content")
    
    # Return results
    echo "{
        \"file\": \"$file_path\",
        \"score\": $score,
        \"violations\": [$(IFS=,; echo "${violations[*]}")],
        \"warnings\": [$(IFS=,; echo "${warnings[*]}")],
        \"suggestions\": [$(IFS=,; echo "${suggestions[*]}")]
    }"
}

check_performance_principles() {
    local file_path="$1"
    local content="$2"
    local -n violations_ref=$3
    local -n warnings_ref=$4
    local -n suggestions_ref=$5
    
    # Check for N+1 query patterns
    if echo "$content" | grep -q "\.forEach.*await\|for.*await.*query\|while.*await.*find"; then
        violations_ref+=("\"N+1 query pattern detected\"")
        suggestions_ref+=("\"Use batch queries or Promise.all to avoid N+1 patterns\"")
    fi
    
    # Check for React performance anti-patterns
    if [[ "$file_path" =~ \.(tsx|jsx)$ ]]; then
        if echo "$content" | grep -q "useState.*!.*useCallback\|useState.*!.*useMemo"; then
            warnings_ref+=("\"React component may have unnecessary re-renders\"")
            suggestions_ref+=("\"Use useCallback for event handlers and useMemo for expensive calculations\"")
        fi
        
        # Check for inline object/array creation in JSX
        if echo "$content" | grep -q "style={{.*}}\|onClick={() => \|onSubmit={() =>"; then
            warnings_ref+=("\"Inline object/function creation in JSX may cause re-renders\"")
            suggestions_ref+=("\"Move objects/functions outside component or use useCallback/useMemo\"")
        fi
    fi
    
    # Check for inefficient loops
    if echo "$content" | grep -q "for (.*; i < .*\.length; i++)\|while.*\.length"; then
        warnings_ref+=("\"Inefficient loop detected - length calculated on each iteration\"")
        suggestions_ref+=("\"Cache array length in variable before loop\"")
    fi
    
    # Check for large bundle imports
    if echo "$content" | grep -q "import.*from ['\"]lodash['\"]\|import.*from ['\"]moment['\"]\|import.*from ['\"]antd['\"]"; then
        warnings_ref+=("\"Large library import detected - may increase bundle size\"")
        suggestions_ref+=("\"Use tree-shaking compatible imports or smaller alternatives\"")
    fi
    
    # Check for missing image optimization
    if [[ "$file_path" =~ \.(tsx|jsx)$ ]] && echo "$content" | grep -q "<img.*src" && ! echo "$content" | grep -q "next/image\|Image.*from.*next"; then
        warnings_ref+=("\"Unoptimized images detected\"")
        suggestions_ref+=("\"Use Next.js Image component for automatic optimization\"")
    fi
}

check_security_principles() {
    local file_path="$1"
    local content="$2"
    local -n violations_ref=$3
    local -n warnings_ref=$4
    local -n suggestions_ref=$5
    
    # Check for missing input validation
    if [[ "$file_path" =~ /api/ ]] && echo "$content" | grep -q "req\.body\|request\.body" && ! echo "$content" | grep -q "validate\|schema\|zod\|joi"; then
        violations_ref+=("\"API endpoint missing input validation\"")
        suggestions_ref+=("\"Add schema validation using Zod or similar library\"")
    fi
    
    # Check for missing authentication
    if [[ "$file_path" =~ /api/ ]] && ! echo "$content" | grep -q "auth\|authenticate\|user\|session\|token" && ! echo "$content" | grep -q "public\|health\|status"; then
        violations_ref+=("\"API endpoint missing authentication check\"")
        suggestions_ref+=("\"Add authentication middleware or session validation\"")
    fi
    
    # Check for SQL injection vulnerabilities
    if echo "$content" | grep -q "\${.*}.*query\|\`.*\${.*}.*\`.*execute"; then
        violations_ref+=("\"Potential SQL injection vulnerability\"")
        suggestions_ref+=("\"Use parameterized queries or ORM methods\"")
    fi
    
    # Check for XSS vulnerabilities
    if echo "$content" | grep -q "dangerouslySetInnerHTML\|innerHTML.*=\|document\.write"; then
        violations_ref+=("\"Potential XSS vulnerability\"")
        suggestions_ref+=("\"Sanitize user input and avoid direct HTML injection\"")
    fi
    
    # Check for hardcoded secrets
    if echo "$content" | grep -qE "(password|secret|key|token).*[=:].*['\"][^'\"]{8,}['\"]"; then
        violations_ref+=("\"Potential hardcoded secret detected\"")
        suggestions_ref+=("\"Move secrets to environment variables\"")
    fi
    
    # Check for insecure HTTP usage
    if echo "$content" | grep -q "http://.*api\|fetch.*http://"; then
        warnings_ref+=("\"Insecure HTTP usage detected\"")
        suggestions_ref+=("\"Use HTTPS for all API communications\"")
    fi
}

check_maintainability_principles() {
    local file_path="$1"
    local content="$2"
    local -n violations_ref=$3
    local -n warnings_ref=$4
    local -n suggestions_ref=$5
    
    # Check function complexity
    local complexity
    complexity=$(calculate_cyclomatic_complexity "$content")
    if [[ $complexity -gt 10 ]]; then
        warnings_ref+=("\"High cyclomatic complexity: $complexity\"")
        suggestions_ref+=("\"Break down complex functions into smaller, focused functions\"")
    fi
    
    # Check for long functions
    local function_lines
    function_lines=$(echo "$content" | awk '/function.*{|.*=> {/{flag=1; count=0} flag{count++} /^}/{if(flag) print count; flag=0}' | sort -nr | head -1)
    if [[ ${function_lines:-0} -gt 50 ]]; then
        warnings_ref+=("\"Long function detected: $function_lines lines\"")
        suggestions_ref+=("\"Consider splitting long functions into smaller, more focused functions\"")
    fi
    
    # Check for magic numbers
    if echo "$content" | grep -qE "[^a-zA-Z_][0-9]{2,}[^0-9]" && ! echo "$content" | grep -q "const.*=.*[0-9]"; then
        warnings_ref+=("\"Magic numbers detected\"")
        suggestions_ref+=("\"Replace magic numbers with named constants\"")
    fi
    
    # Check for missing TypeScript types
    if [[ "$file_path" =~ \.ts$ ]] && echo "$content" | grep -q ": any\|as any"; then
        warnings_ref+=("\"TypeScript 'any' type usage detected\"")
        suggestions_ref+=("\"Replace 'any' with specific types for better type safety\"")
    fi
    
    # Check for code duplication
    local duplicate_lines
    duplicate_lines=$(echo "$content" | sort | uniq -d | wc -l)
    if [[ $duplicate_lines -gt 5 ]]; then
        warnings_ref+=("\"Code duplication detected: $duplicate_lines duplicate lines\"")
        suggestions_ref+=("\"Extract common code into reusable functions or utilities\"")
    fi
    
    # Check for missing error handling
    if echo "$content" | grep -q "await\|\.then\|fetch\|api" && ! echo "$content" | grep -q "try.*catch\|\.catch\|error"; then
        warnings_ref+=("\"Missing error handling for async operations\"")
        suggestions_ref+=("\"Add proper error handling with try-catch or .catch()\"")
    fi
}

check_cost_principles() {
    local file_path="$1"
    local content="$2"
    local -n violations_ref=$3
    local -n warnings_ref=$4
    local -n suggestions_ref=$5
    
    # Check for expensive database operations
    if echo "$content" | grep -q "SELECT \*\|findMany()\|find({})"; then
        warnings_ref+=("\"Potentially expensive database query detected\"")
        suggestions_ref+=("\"Select only needed columns and add proper indexing\"")
    fi
    
    # Check for API calls in loops
    if echo "$content" | grep -q "for.*fetch\|forEach.*api\|while.*await.*http"; then
        violations_ref+=("\"API calls in loops detected - expensive pattern\"")
        suggestions_ref+=("\"Batch API calls or use pagination to reduce costs\"")
    fi
    
    # Check for large data structures
    if echo "$content" | grep -qE "new Array\([0-9]{4,}\)\|\.fill\([^)]*[0-9]{4,}"; then
        warnings_ref+=("\"Large data structure allocation detected\"")
        suggestions_ref+=("\"Consider lazy loading or pagination for large datasets\"")
    fi
    
    # Check for memory leaks
    if echo "$content" | grep -q "setInterval\|setTimeout" && ! echo "$content" | grep -q "clearInterval\|clearTimeout\|useEffect.*return"; then
        warnings_ref+=("\"Potential memory leak: missing cleanup for timers\"")
        suggestions_ref+=("\"Add cleanup logic for timers and event listeners\"")
    fi
    
    # Check for inefficient rendering
    if [[ "$file_path" =~ \.(tsx|jsx)$ ]] && echo "$content" | grep -q "map.*return.*<" && ! echo "$content" | grep -q "key="; then
        warnings_ref+=("\"Missing React key props in lists - inefficient rendering\"")
        suggestions_ref+=("\"Add unique key props to list items for efficient rendering\"")
    fi
}

calculate_cyclomatic_complexity() {
    local content="$1"
    local complexity=1
    
    # Count decision points
    local decision_points
    decision_points=$(echo "$content" | grep -cE "(if|else if|for|while|switch|case|catch|\&\&|\|\||\?)" || echo "0")
    
    complexity=$((complexity + decision_points))
    echo "$complexity"
}

calculate_optimization_score() {
    local file_path="$1"
    local content="$2"
    
    # Base score
    local score=100
    
    # Deduct points for complexity
    local complexity
    complexity=$(calculate_cyclomatic_complexity "$content")
    if [[ $complexity -gt 5 ]]; then
        score=$((score - (complexity - 5) * 5))
    fi
    
    # Deduct points for file size
    local lines
    lines=$(echo "$content" | wc -l)
    if [[ $lines -gt 200 ]]; then
        score=$((score - (lines - 200) / 10))
    fi
    
    # Security bonus/penalty
    if echo "$content" | grep -q "validate\|auth"; then
        score=$((score + 5))
    fi
    
    if echo "$content" | grep -q "dangerouslySetInnerHTML\|innerHTML"; then
        score=$((score - 20))
    fi
    
    # Performance bonus/penalty
    if [[ "$file_path" =~ \.(tsx|jsx)$ ]] && echo "$content" | grep -q "useCallback\|useMemo"; then
        score=$((score + 5))
    fi
    
    if echo "$content" | grep -q "\.forEach.*await"; then
        score=$((score - 15))
    fi
    
    # Ensure score is within bounds
    if [[ $score -lt 0 ]]; then score=0; fi
    if [[ $score -gt 100 ]]; then score=100; fi
    
    echo "$score"
}

# ===============================================================================
# VIOLATION DETECTION AND BLOCKING
# ===============================================================================

analyze_file() {
    local file_path="$1"
    
    if [[ ! -f "$file_path" ]]; then
        log ERROR "File not found: $file_path"
        return 3
    fi
    
    # Check if file should be analyzed
    if ! should_analyze_file "$file_path"; then
        log DEBUG "Skipping file (excluded pattern): $file_path"
        return 0
    fi
    
    log INFO "Analyzing file: $file_path"
    
    local content
    content=$(cat "$file_path")
    
    local result
    result=$(validate_optimization_principles "$file_path" "$content")
    
    local score
    score=$(echo "$result" | jq -r '.score')
    
    local violations
    violations=$(echo "$result" | jq -r '.violations[]' 2>/dev/null || echo "")
    
    local warnings
    warnings=$(echo "$result" | jq -r '.warnings[]' 2>/dev/null || echo "")
    
    local suggestions
    suggestions=$(echo "$result" | jq -r '.suggestions[]' 2>/dev/null || echo "")
    
    # Display results
    display_analysis_results "$file_path" "$score" "$violations" "$warnings" "$suggestions"
    
    # Check if we should block
    local should_block=false
    
    if [[ -n "$violations" ]]; then
        should_block=true
    fi
    
    if [[ "$BLOCK_ON_WARNINGS" == true && -n "$warnings" ]]; then
        should_block=true
    fi
    
    if [[ $score -lt $OVERALL_THRESHOLD ]]; then
        should_block=true
    fi
    
    if [[ "$should_block" == true ]]; then
        log ERROR "Code quality violations detected in $file_path"
        show_violation_guidance "$file_path" "$violations" "$warnings" "$suggestions"
        return 1
    fi
    
    log SUCCESS "File passed optimization checks: $file_path (Score: $score)"
    return 0
}

should_analyze_file() {
    local file_path="$1"
    
    # Check include patterns
    local include_match=false
    for pattern in $INCLUDE_PATTERNS; do
        if [[ "$file_path" == $pattern ]]; then
            include_match=true
            break
        fi
    done
    
    if [[ "$include_match" == false ]]; then
        return 1
    fi
    
    # Check exclude patterns
    for pattern in $EXCLUDE_PATTERNS; do
        if [[ "$file_path" == $pattern ]]; then
            return 1
        fi
    done
    
    return 0
}

display_analysis_results() {
    local file_path="$1"
    local score="$2"
    local violations="$3"
    local warnings="$4"
    local suggestions="$5"
    
    echo
    echo -e "${BOLD}${ANALYZE_EMOJI} Analysis Results for: $(basename "$file_path")${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Score display with color coding
    local score_color
    if [[ $score -ge 80 ]]; then
        score_color="$GREEN"
    elif [[ $score -ge 60 ]]; then
        score_color="$YELLOW"
    else
        score_color="$RED"
    fi
    
    echo -e "📊 ${BOLD}Overall Score:${NC} ${score_color}${score}/100${NC}"
    
    # Violations
    if [[ -n "$violations" ]]; then
        echo -e "\n${RED}${ERROR_EMOJI} ${BOLD}Violations (BLOCKING):${NC}"
        while IFS= read -r violation; do
            if [[ -n "$violation" ]]; then
                echo -e "  ${RED}•${NC} $violation"
            fi
        done <<< "$violations"
    fi
    
    # Warnings
    if [[ -n "$warnings" ]]; then
        echo -e "\n${YELLOW}${WARNING_EMOJI} ${BOLD}Warnings:${NC}"
        while IFS= read -r warning; do
            if [[ -n "$warning" ]]; then
                echo -e "  ${YELLOW}•${NC} $warning"
            fi
        done <<< "$warnings"
    fi
    
    # Suggestions
    if [[ -n "$suggestions" ]]; then
        echo -e "\n${CYAN}${GUIDANCE_EMOJI} ${BOLD}Suggestions:${NC}"
        while IFS= read -r suggestion; do
            if [[ -n "$suggestion" ]]; then
                echo -e "  ${CYAN}•${NC} $suggestion"
            fi
        done <<< "$suggestions"
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

show_violation_guidance() {
    local file_path="$1"
    local violations="$2"
    local warnings="$3"
    local suggestions="$4"
    
    echo
    echo -e "${RED}${BLOCK_EMOJI} ${BOLD}CODE GENERATION BLOCKED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "File: ${BOLD}$file_path${NC}"
    echo -e "Reason: Optimization principle violations detected"
    echo
    
    # Specific guidance based on violation types
    if echo "$violations" | grep -q "N+1 query"; then
        show_n_plus_one_guidance
    fi
    
    if echo "$violations" | grep -q "input validation"; then
        show_security_guidance
    fi
    
    if echo "$violations" | grep -q "authentication"; then
        show_auth_guidance
    fi
    
    if echo "$violations" | grep -q "SQL injection"; then
        show_sql_injection_guidance
    fi
    
    if echo "$violations" | grep -q "API calls in loops"; then
        show_api_loop_guidance
    fi
    
    # General guidance
    echo -e "\n${GUIDANCE_EMOJI} ${BOLD}How to Fix:${NC}"
    echo -e "1. Address the violations listed above"
    echo -e "2. Run the analyzer again: ${CYAN}$0 analyze $file_path${NC}"
    echo -e "3. Consider using autofix: ${CYAN}$0 analyze $file_path --autofix${NC}"
    echo -e "4. For help: ${CYAN}$0 help${NC}"
    
    echo -e "\n${INFO_EMOJI} ${BOLD}Need Help?${NC}"
    echo -e "• Review optimization principles: ${CYAN}cat $PRINCIPLES_FILE${NC}"
    echo -e "• Check configuration: ${CYAN}$0 config${NC}"
    echo -e "• Enable autofix: ${CYAN}$0 config set autofix true${NC}"
    
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

show_n_plus_one_guidance() {
    cat << 'EOF'

🔴 N+1 Query Pattern Detected

This anti-pattern occurs when you execute N+1 database queries instead of 1 optimized query.

❌ Bad:
  users.forEach(async user => {
    const posts = await db.post.findMany({ where: { userId: user.id } });
  });

✅ Good:
  const userIds = users.map(u => u.id);
  const posts = await db.post.findMany({ 
    where: { userId: { in: userIds } },
    include: { user: true }
  });

EOF
}

show_security_guidance() {
    cat << 'EOF'

🔒 Input Validation Required

All API endpoints must validate input data to prevent security vulnerabilities.

❌ Bad:
  export async function POST(req: Request) {
    const data = await req.json();
    // Direct use without validation
    return await db.user.create({ data });
  }

✅ Good:
  const userSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email()
  });
  
  export async function POST(req: Request) {
    const body = await req.json();
    const data = userSchema.parse(body);
    return await db.user.create({ data });
  }

EOF
}

show_auth_guidance() {
    cat << 'EOF'

🔐 Authentication Check Missing

All protected API endpoints must verify user authentication.

❌ Bad:
  export async function POST(req: Request) {
    // No auth check
    const data = await req.json();
    return await db.sensitiveData.create({ data });
  }

✅ Good:
  export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const data = await req.json();
    return await db.sensitiveData.create({ 
      data: { ...data, userId } 
    });
  }

EOF
}

show_sql_injection_guidance() {
    cat << 'EOF'

💉 SQL Injection Vulnerability

Avoid string interpolation in database queries.

❌ Bad:
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  const result = await db.$executeRaw(query);

✅ Good:
  const result = await db.user.findUnique({
    where: { id: userId }
  });
  
  // Or with raw queries:
  const result = await db.$executeRaw`
    SELECT * FROM users WHERE id = ${userId}
  `;

EOF
}

show_api_loop_guidance() {
    cat << 'EOF'

💰 Expensive API Calls in Loop

Making API calls inside loops can be very expensive and slow.

❌ Bad:
  for (const item of items) {
    await fetch(`/api/process/${item.id}`);
  }

✅ Good:
  // Batch processing
  await fetch('/api/process/batch', {
    method: 'POST',
    body: JSON.stringify({ ids: items.map(i => i.id) })
  });
  
  // Or parallel processing with limit
  const promises = items.map(item => 
    fetch(`/api/process/${item.id}`)
  );
  await Promise.all(promises);

EOF
}

# ===============================================================================
# MAIN COMMAND HANDLERS
# ===============================================================================

cmd_analyze() {
    local file="$1"
    
    if [[ -z "$file" ]]; then
        log ERROR "File path required for analyze command"
        echo "Usage: $0 analyze <file>"
        exit 2
    fi
    
    analyze_file "$file"
}

cmd_check_commit() {
    log INFO "Checking staged files before commit..."
    
    # Get staged files
    local staged_files
    if ! staged_files=$(git diff --cached --name-only --diff-filter=AM 2>/dev/null); then
        log ERROR "Not in a git repository or git not available"
        exit 2
    fi
    
    if [[ -z "$staged_files" ]]; then
        log INFO "No staged files to check"
        exit 0
    fi
    
    local failed_files=()
    local total_files=0
    
    while IFS= read -r file; do
        if should_analyze_file "$file"; then
            total_files=$((total_files + 1))
            log INFO "Checking staged file: $file"
            
            if ! analyze_file "$file"; then
                failed_files+=("$file")
            fi
        fi
    done <<< "$staged_files"
    
    if [[ ${#failed_files[@]} -gt 0 ]]; then
        echo
        log ERROR "Commit blocked! ${#failed_files[@]} of $total_files files failed optimization checks:"
        for file in "${failed_files[@]}"; do
            echo -e "  ${RED}•${NC} $file"
        done
        echo
        echo -e "${GUIDANCE_EMOJI} ${BOLD}To fix:${NC}"
        echo -e "1. Address the violations in the files above"
        echo -e "2. Re-stage the fixed files: ${CYAN}git add <files>${NC}"
        echo -e "3. Try committing again"
        echo -e "4. Or bypass checks: ${CYAN}git commit --no-verify${NC} ${YELLOW}(not recommended)${NC}"
        exit 1
    fi
    
    log SUCCESS "All staged files passed optimization checks ($total_files files)"
    exit 0
}

cmd_watch() {
    local watch_dir="${1:-$PROJECT_ROOT}"
    
    if [[ ! -d "$watch_dir" ]]; then
        log ERROR "Directory not found: $watch_dir"
        exit 3
    fi
    
    log INFO "Watching directory for changes: $watch_dir"
    log INFO "Press Ctrl+C to stop watching"
    
    # Use fswatch if available, otherwise fall back to simple monitoring
    if command -v fswatch &> /dev/null; then
        fswatch -o "$watch_dir" | while read -r; do
            handle_file_change "$watch_dir"
        done
    else
        log WARNING "fswatch not found, using basic file monitoring"
        local last_check=$(date +%s)
        
        while true; do
            local current_time=$(date +%s)
            
            # Check for recently modified files
            find "$watch_dir" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read -r file; do
                local file_time
                file_time=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null || echo "0")
                
                if [[ $file_time -gt $last_check ]]; then
                    log INFO "File changed: $file"
                    analyze_file "$file" || true
                fi
            done
            
            last_check=$current_time
            sleep 2
        done
    fi
}

handle_file_change() {
    local watch_dir="$1"
    # This would be called when files change
    # For now, just log that a change was detected
    log DEBUG "File system change detected in $watch_dir"
}

cmd_validate_project() {
    log INFO "Validating entire project against optimization principles..."
    
    local total_files=0
    local passed_files=0
    local failed_files=0
    local total_score=0
    
    # Find all relevant files
    local files
    if command -v fd &> /dev/null; then
        files=$(fd -e ts -e tsx -e js -e jsx . "$PROJECT_ROOT")
    else
        files=$(find "$PROJECT_ROOT" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx")
    fi
    
    while IFS= read -r file; do
        if should_analyze_file "$file"; then
            total_files=$((total_files + 1))
            
            if [[ "$VERBOSE" == true ]]; then
                log INFO "Analyzing: $file"
            fi
            
            if analyze_file "$file" >/dev/null 2>&1; then
                passed_files=$((passed_files + 1))
            else
                failed_files=$((failed_files + 1))
            fi
            
            # Calculate score for statistics
            local content
            content=$(cat "$file")
            local score
            score=$(calculate_optimization_score "$file" "$content")
            total_score=$((total_score + score))
        fi
    done <<< "$files"
    
    # Display summary
    echo
    echo -e "${BOLD}${ANALYZE_EMOJI} Project Validation Summary${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "📊 Files analyzed: ${BOLD}$total_files${NC}"
    echo -e "✅ Files passed: ${GREEN}$passed_files${NC}"
    echo -e "❌ Files failed: ${RED}$failed_files${NC}"
    
    if [[ $total_files -gt 0 ]]; then
        local avg_score=$((total_score / total_files))
        local pass_rate=$((passed_files * 100 / total_files))
        
        echo -e "📈 Average score: ${BOLD}$avg_score/100${NC}"
        echo -e "📊 Pass rate: ${BOLD}$pass_rate%${NC}"
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [[ $failed_files -gt 0 ]]; then
        log ERROR "Project validation failed: $failed_files files have optimization violations"
        exit 1
    else
        log SUCCESS "Project validation passed: All files meet optimization standards"
        exit 0
    fi
}

cmd_install_hooks() {
    log INFO "Installing git hooks..."
    
    local git_dir
    if ! git_dir=$(git rev-parse --git-dir 2>/dev/null); then
        log ERROR "Not in a git repository"
        exit 2
    fi
    
    local hooks_dir="$git_dir/hooks"
    
    # Create pre-commit hook
    cat > "$hooks_dir/pre-commit" << EOF
#!/bin/bash
# Auto-generated optimization gatekeeper pre-commit hook

cd "\$(git rev-parse --show-toplevel)"
exec "${SCRIPT_DIR}/optimization-gatekeeper.sh" check-commit
EOF
    
    chmod +x "$hooks_dir/pre-commit"
    log SUCCESS "Pre-commit hook installed"
    
    # Create pre-push hook
    cat > "$hooks_dir/pre-push" << EOF
#!/bin/bash
# Auto-generated optimization gatekeeper pre-push hook

cd "\$(git rev-parse --show-toplevel)"
echo "Running project validation before push..."
exec "${SCRIPT_DIR}/optimization-gatekeeper.sh" validate-project
EOF
    
    chmod +x "$hooks_dir/pre-push"
    log SUCCESS "Pre-push hook installed"
    
    log INFO "Git hooks installed successfully"
    log INFO "Commits will now be automatically checked for optimization violations"
}

cmd_setup() {
    log INFO "Setting up Optimization Gatekeeper..."
    
    # Check dependencies
    check_dependencies
    
    # Create config file
    if [[ ! -f "$CONFIG_FILE" ]]; then
        create_default_config
    else
        log INFO "Configuration file already exists: $CONFIG_FILE"
    fi
    
    # Create log file
    touch "$LOG_FILE"
    log INFO "Log file created: $LOG_FILE"
    
    # Install git hooks if in a git repository
    if git rev-parse --git-dir &>/dev/null; then
        read -p "Install git hooks for automatic checking? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cmd_install_hooks
        fi
    fi
    
    log SUCCESS "Optimization Gatekeeper setup complete!"
    log INFO "Run '$0 help' for usage information"
}

cmd_status() {
    echo -e "${BOLD}${INFO_EMOJI} Optimization Gatekeeper Status${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Configuration status
    if [[ -f "$CONFIG_FILE" ]]; then
        echo -e "📋 Configuration: ${GREEN}✓ Found${NC} ($CONFIG_FILE)"
    else
        echo -e "📋 Configuration: ${RED}✗ Missing${NC}"
    fi
    
    # Git hooks status
    if git rev-parse --git-dir &>/dev/null; then
        local git_dir
        git_dir=$(git rev-parse --git-dir)
        if [[ -f "$git_dir/hooks/pre-commit" ]]; then
            echo -e "🔗 Git hooks: ${GREEN}✓ Installed${NC}"
        else
            echo -e "🔗 Git hooks: ${YELLOW}⚠ Not installed${NC}"
        fi
    else
        echo -e "🔗 Git hooks: ${YELLOW}⚠ Not in git repository${NC}"
    fi
    
    # Dependencies status
    echo -e "🔧 Dependencies:"
    for cmd in node npm jq git; do
        if command -v "$cmd" &> /dev/null; then
            echo -e "  • $cmd: ${GREEN}✓${NC}"
        else
            echo -e "  • $cmd: ${RED}✗${NC}"
        fi
    done
    
    # Statistics
    if [[ -f "$LOG_FILE" ]]; then
        local log_lines
        log_lines=$(wc -l < "$LOG_FILE")
        echo -e "📊 Log entries: $log_lines"
        
        local errors
        errors=$(grep -c "ERROR" "$LOG_FILE" 2>/dev/null || echo "0")
        echo -e "❌ Recent errors: $errors"
        
        local successes
        successes=$(grep -c "SUCCESS" "$LOG_FILE" 2>/dev/null || echo "0")
        echo -e "✅ Recent successes: $successes"
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

cmd_config() {
    local action="${1:-show}"
    local key="$2"
    local value="$3"
    
    case "$action" in
        show)
            if [[ -f "$CONFIG_FILE" ]]; then
                echo -e "${BOLD}Configuration:${NC}"
                cat "$CONFIG_FILE"
            else
                log ERROR "Configuration file not found: $CONFIG_FILE"
                exit 2
            fi
            ;;
        edit)
            if command -v "$EDITOR" &> /dev/null; then
                "$EDITOR" "$CONFIG_FILE"
            else
                log ERROR "No editor found. Set EDITOR environment variable or edit manually: $CONFIG_FILE"
                exit 2
            fi
            ;;
        set)
            if [[ -z "$key" || -z "$value" ]]; then
                log ERROR "Usage: $0 config set <key> <value>"
                exit 2
            fi
            
            # Update configuration
            if grep -q "^$key=" "$CONFIG_FILE"; then
                sed -i.bak "s/^$key=.*/$key=$value/" "$CONFIG_FILE"
            else
                echo "$key=$value" >> "$CONFIG_FILE"
            fi
            log SUCCESS "Configuration updated: $key=$value"
            ;;
        *)
            log ERROR "Unknown config action: $action"
            echo "Usage: $0 config [show|edit|set <key> <value>]"
            exit 2
            ;;
    esac
}

# ===============================================================================
# MAIN SCRIPT ENTRY POINT
# ===============================================================================

main() {
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -s|--strict)
                STRICT_MODE=true
                PERFORMANCE_THRESHOLD=80
                SECURITY_THRESHOLD=90
                MAINTAINABILITY_THRESHOLD=80
                COST_THRESHOLD=80
                OVERALL_THRESHOLD=80
                shift
                ;;
            -a|--autofix)
                AUTOFIX=true
                shift
                ;;
            -w|--block-warnings)
                BLOCK_ON_WARNINGS=true
                shift
                ;;
            -t|--threshold)
                OVERALL_THRESHOLD="$2"
                shift 2
                ;;
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            --)
                shift
                break
                ;;
            -*)
                log ERROR "Unknown option: $1"
                show_usage
                exit 2
                ;;
            *)
                break
                ;;
        esac
    done
    
    # Load configuration
    load_config
    
    # Get command
    local command="${1:-help}"
    shift || true
    
    # Execute command
    case "$command" in
        analyze)
            cmd_analyze "$@"
            ;;
        check-commit)
            cmd_check_commit "$@"
            ;;
        watch)
            cmd_watch "$@"
            ;;
        validate-project)
            cmd_validate_project "$@"
            ;;
        install-hooks)
            cmd_install_hooks "$@"
            ;;
        setup)
            cmd_setup "$@"
            ;;
        status)
            cmd_status "$@"
            ;;
        config)
            cmd_config "$@"
            ;;
        help|--help|-h)
            show_usage
            exit 0
            ;;
        *)
            log ERROR "Unknown command: $command"
            show_usage
            exit 2
            ;;
    esac
}

# Initialize logging
mkdir -p "$(dirname "$LOG_FILE")"
echo "# Optimization Gatekeeper Log - $(date)" >> "$LOG_FILE"

# Run main function
main "$@"