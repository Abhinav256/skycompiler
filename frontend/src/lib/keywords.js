export const LANGUAGE_KEYWORDS = {
  python: [
    // Basic Keywords
    "print", "def", "if", "else", "elif", "for", "while", "return", "import", "from",
    "class", "try", "except", "finally", "with", "as", "lambda", "yield", "None",
    "True", "False", "in", "is", "and", "or", "not", "pass", "break", "continue",
    // Built-in Functions & Types
    "list", "dict", "set", "tuple", "str", "int", "float", "bool", "len", "range",
    "enumerate", "zip", "map", "filter", "sorted", "min", "max", "sum", "abs",
    "open", "print", "input", "type", "isinstance", "getattr", "setattr", "hasattr",
    // Common Data Structure Methods
    ".append", ".extend", ".insert", ".remove", ".pop", ".clear", ".index", ".count", ".sort", ".reverse",
    ".keys", ".values", ".items", ".get", ".update", ".setdefault", ".popitem",
    ".add", ".remove", ".discard", ".intersection", ".union", ".difference", ".symmetric_difference",
  ],
  c: [
    // Basic Keywords
    "int", "float", "double", "char", "void", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "return", "struct", "union", "enum",
    "typedef", "static", "extern", "volatile", "const", "sizeof", "goto",
    // Standard Library Functions
    "printf", "scanf", "sprintf", "fprintf", "sscanf", "strlen", "strcpy", "strncpy", "strcmp", "strncmp",
    "memset", "memcpy", "memmove", "malloc", "calloc", "realloc", "free", "exit", "fopen", "fclose",
    "fread", "fwrite", "fseek", "ftell", "rewind", "fflush", "remove", "rename",
  ],
  cpp: [
    // Basic Keywords
    "int", "float", "double", "char", "void", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "return", "struct", "union", "enum",
    "typedef", "static", "extern", "volatile", "const", "sizeof", "template", "typename", "constexpr",
    // STL Containers
    "vector", "list", "deque", "stack", "queue", "priority_queue", "set", "multiset", "map", "multimap",
    "unordered_set", "unordered_map", "pair", "tuple", "string", "array",
    // STL Functions & I/O
    "cout", "cin", "endl", "cerr", "clog", "printf", "scanf", "sort", "stable_sort", "partial_sort",
    "lower_bound", "upper_bound", "binary_search", "max", "min", "abs", "sqrt", "pow", "swap",
    // Common Member Functions
    ".push_back", ".push_front", ".pop_back", ".pop_front", ".insert", ".erase", ".clear", ".empty",
    ".size", ".front", ".back", ".begin", ".end", ".find", "operator=", "at",
  ],
  java: [
    // Basic Keywords
    "public", "private", "protected", "static", "final", "class", "interface",
    "extends", "implements", "new", "this", "super", "void", "int", "float",
    "double", "char", "boolean", "if", "else", "for", "while", "do", "switch",
    "case", "break", "continue", "return", "try", "catch", "finally", "throw", "throws",
    // Common Classes/Data Structures
    "String", "Integer", "Double", "Boolean", "ArrayList", "LinkedList", "Vector", "Stack",
    "HashMap", "LinkedHashMap", "TreeMap", "HashSet", "LinkedHashSet", "TreeSet",
    "PriorityQueue", "StringBuilder", "StringBuffer", "Object", "RuntimeException",
    // Common Methods
    "System.out.println", "System.out.print", "Math.max", "Math.min", "Math.abs", "Math.sqrt",
    ".add", ".remove", ".get", ".set", ".size", ".isEmpty", ".contains", ".clear",
    ".put", ".getOrDefault", ".containsKey", ".keySet", ".values", ".entrySet",
    ".substring", ".toLowerCase", ".toUpperCase", ".trim", ".equals", ".hashCode",
  ],
  javascript: [
    // Basic Keywords
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "try", "catch", "finally", "throw",
    "async", "await", "import", "export", "default", "class", "extends", "super",
    "this", "new", "typeof", "instanceof", "void", "delete", "in",
    // Global Objects & Methods
    "console.log", "console.error", "console.warn", "console.table", "console.dir",
    "JSON.parse", "JSON.stringify", "Math.max", "Math.min", "Math.abs", "Math.sqrt", "Math.floor", "Math.ceil", "Math.round",
    "parseInt", "parseFloat", "isNaN", "encodeURIComponent", "decodeURIComponent",
    "setTimeout", "setInterval", "clearInterval", "clearTimeout", "Promise", "fetch",
    // Array Methods
    ".push", ".pop", ".shift", ".unshift", ".splice", ".slice", ".concat", ".join",
    ".reverse", ".sort", ".indexOf", ".lastIndexOf", ".includes", ".startsWith", ".endsWith",
    ".map", ".filter", ".reduce", ".forEach", ".some", ".every", ".find", ".findIndex",
    // Object Methods
    "Object.keys", "Object.values", "Object.entries", "Object.assign",
    // String Methods
    ".split", ".replace", ".replaceAll", ".trim", ".toUpperCase", ".toLowerCase", ".substring", ".slice",
  ],
  typescript: [
    // JS Keywords + TS specific
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "try", "catch", "finally", "throw",
    "async", "await", "import", "export", "default", "class", "extends", "super",
    "this", "new", "type", "interface", "enum", "abstract", "readonly", "private",
    "protected", "public", "as", "is", "keyof", "typeof", "unknown", "never",
    // Shared with JS
    "console.log", "JSON.parse", "JSON.stringify", "Math.max", "Math.min",
    ".map", ".filter", ".reduce", ".push", ".pop", ".forEach",
  ],
  go: [
    // Basic Keywords
    "func", "package", "import", "return", "if", "else", "for", "switch", "case",
    "default", "break", "continue", "go", "chan", "select", "range", "defer",
    "map", "struct", "interface", "type", "var", "const", "nil",
    // Standard Library
    "fmt.Println", "fmt.Printf", "fmt.Sprintf", "fmt.Scanf", "fmt.Scanln",
    "append", "make", "len", "cap", "copy", "panic", "recover", "delete",
    "errors.New", "fmt.Errorf", "time.Now", "time.Sleep", "os.Open", "os.ReadFile",
    // Common types
    "string", "int", "int64", "float64", "bool", "byte", "rune",
  ],
  rust: [
    // Basic Keywords
    "fn", "let", "mut", "if", "else", "for", "while", "loop", "match", "return",
    "use", "mod", "pub", "impl", "trait", "struct", "enum", "type", "async",
    "await", "move", "dyn", "static", "where", "unsafe", "crate", "self", "Sized",
    // Standard Library Macros & Types
    "println!", "print!", "format!", "vec!", "panic!", "assert!", "assert_eq!", "assert_ne!",
    "Option", "Result", "Some", "None", "Ok", "Err", "String", "Vec", "HashMap", "BTreeMap",
    "HashSet", "BTreeSet", "Box", "Rc", "Arc", "Mutex", "RwLock",
    // Common Methods
    ".push", ".pop", ".insert", ".remove", ".get", ".contains", ".len", ".is_empty",
    ".iter", ".iter_mut", ".map", ".filter", ".collect", ".fold", ".unwrap", ".expect",
  ],
  kotlin: [
    // Basic Keywords
    "fun", "val", "var", "if", "else", "for", "while", "do", "switch", "return",
    "import", "package", "class", "interface", "extends", "implements", "when",
    "try", "catch", "finally", "throw", "is", "as", "in", "object", "companion", "sealed",
    "data", "enum", "inner", "lateinit", "override", "super", "this", "it",
    // Common functions/types
    "println", "Int", "Long", "Double", "Float", "Boolean", "String", "Any", "Unit",
    "ArrayList", "HashMap", "HashSet", "mutableListOf", "listOf", "mutableMapOf", "mapOf",
    "mutableSetOf", "setOf",
    // Common Methods
    ".add", ".remove", ".get", ".set", ".size", ".isEmpty", ".contains", ".clear",
    ".filter", ".map", ".reduce", ".fold", ".forEach", ".first", ".last",
  ],
  swift: [
    // Basic Keywords
    "func", "let", "var", "if", "else", "for", "while", "do", "switch", "case",
    "return", "import", "class", "struct", "enum", "extension", "protocol",
    "guard", "print", "Optional", "weak", "strong", "self", "super", "defer",
    "throw", "try", "catch", "where", "in", "as", "as?", "as!",
    // Common Types
    "String", "Int", "Double", "Float", "Bool", "Array", "Dictionary", "Set", "Tuple",
    "Optional", "CLLocation", "URL", "Date",
    // Common Methods
    ".append", ".remove", ".insert", ".count", ".isEmpty", ".contains", ".first", ".last",
    ".map", ".filter", ".reduce", ".flatMap", ".compactMap", ".sorted",
  ],
  csharp: [
    // Basic Keywords
    "public", "private", "protected", "internal", "static", "final", "class",
    "interface", "extends", "implements", "new", "this", "super", "void", "int",
    "float", "double", "char", "bool", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "return", "try", "catch", "finally",
    "throw", "using", "namespace", "async", "await", "var", "dynamic", "get", "set",
    // Common Classes/Types
    "Console.WriteLine", "Console.ReadLine", "String", "Int32", "Double", "Boolean",
    "List", "Dictionary", "HashSet", "Queue", "Stack", "StringBuilder", "Task",
    "LINQ", "Enumerable", "Select", "Where", "OrderBy", "GroupBy", "First", "FirstOrDefault",
    // Common Methods
    ".Add", ".Remove", ".Clear", ".Count", ".Contains", ".ContainsKey", ".TryGetValue",
    ".Substring", ".ToLower", ".ToUpper", ".Trim", ".Equals",
  ],
  bash: [
    // Basic Keywords
    "if", "then", "else", "elif", "fi", "for", "while", "do", "done", "case",
    "esac", "function", "local", "export", "readonly", "return", "exit",
    // Common Commands
    "echo", "printf", "read", "grep", "sed", "awk", "curl", "wget", "find", "ls",
    "cd", "mkdir", "rm", "cp", "mv", "chmod", "chown", "cat", "head", "tail",
    "sort", "uniq", "tr", "cut", "tee", "pipe", "redirect", "ssh", "scp",
    // Special Variables
    "$?", "$0", "$1", "$#", "$@", "$*", "$?", "$!", "%%", "##",
  ],
  sql: [
    // Basic Keywords
    "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "JOIN", "GROUP BY",
    "ORDER BY", "HAVING", "LIMIT", "OFFSET", "UNION", "CREATE", "DROP", "ALTER",
    "TABLE", "VIEW", "INDEX", "CONSTRAINT", "PRIMARY KEY", "FOREIGN KEY",
    "DISTINCT", "AS", "IN", "BETWEEN", "LIKE", "IS NULL", "AND", "OR", "NOT",
    "CASE", "WHEN", "THEN", "ELSE", "END", "COALESCE", "CAST", "CONVERT",
    // Common Functions
    "COUNT", "SUM", "AVG", "MIN", "MAX", "CONCAT", "SUBSTRING", "UPPER", "LOWER",
    "TRIM", "NOW", "CURRENT_TIMESTAMP", "DATE_FORMAT", "IFNULL", "COALESCE",
  ],
  dart: [
    // Basic Keywords
    "void", "int", "double", "bool", "String", "dynamic", "var", "final", "const",
    "func", "if", "else", "for", "while", "do", "switch", "case", "break", "continue",
    "return", "import", "class", "extends", "implements", "mixin", "this", "new",
    "async", "await", "future", "stream", "yield", "try", "catch", "finally",
    // Common Types & Functions
    "print", "List", "Map", "Set", "Iterable", "Comparable", "Comparable",
    "SizedBox", "Container", "Column", "Row", "Text", "Image", "Center",
    // Common Methods
    ".add", ".remove", ".length", ".isEmpty", ".contains", ".first", ".last",
    ".map", ".where", ".reduce", ".forEach", ".toList", ".toSet", ".toMap",
  ],
  php: [
    // Basic Keywords
    "function", "return", "if", "else", "for", "while", "do", "switch", "case",
    "break", "continue", "try", "catch", "finally", "throw", "class", "interface",
    "extends", "implements", "new", "this", "echo", "print", "global", "static",
    "unset", "isset", "empty", "null", "array", "as", "foreach", "while",
    // Common Functions
    "strlen", "strpos", "str_replace", "substr", "trim", "explode", "implode",
    "array_push", "array_pop", "array_shift", "array_unshift", "array_merge",
    "array_map", "array_filter", "count", "sizeof", "json_encode", "json_decode",
    "header", "die", "exit", "require", "require_once", "include", "include_once",
  ],
  ruby: [
    // Basic Keywords
    "def", "end", "if", "else", "elsif", "unless", "for", "while", "until", "do",
    "case", "when", "break", "next", "return", "module", "class", "yield",
    "lambda", "puts", "print", "attr_reader", "attr_writer", "attr_accessor",
    "self", "super", "nil", "true", "false",
    // Common Methods
    ".push", ".pop", ".shift", ".unshift", ".insert", ".delete", ".clear",
    ".each", ".map", ".select", ".reject", ".reduce", ".fold", ".find", ".any",
    ".all", ".none", ".compact", ".flatten", ".join", ".split", ".strip",
  ],
  web: [
    // HTML Tags
    "div", "span", "p", "a", "img", "input", "button", "form", "select", "option",
    "ul", "ol", "li", "section", "article", "header", "footer", "nav", "main",
    "script", "style", "link", "meta", "body", "html", "head", "title", "h1", "h2",
    "h3", "h4", "h5", "h6", "br", "hr", "canvas", "svg", "video", "audio",
    // CSS Properties
    "display", "position", "top", "right", "bottom", "left", "margin", "padding",
    "width", "height", "flex", "grid", "justify-content", "align-items",
    "background", "color", "font-size", "font-family", "border", "border-radius",
    "box-shadow", "opacity", "transition", "animation", "z-index", "overflow",
    // Common HTML Attributes
    "class", "id", "src", "href", "alt", "type", "value", "placeholder", "name",
    "style", "onclick", "onsubmit", "target", "rel", "datetime",
  ]
};
