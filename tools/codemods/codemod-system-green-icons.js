/*
  Codemod: Apply SYSTEM_GREEN green color to all icon usages (Lucide and MUI) across your codebase.

  HOW TO USE:
  1. Place this script at /tools/codemods/codemod-system-green-icons.js
  2. Install dependencies:
     npm install --save-dev jscodeshift
  3. Run:
     npx jscodeshift -t tools/codemods/codemod-system-green-icons.js src/

  What it does:
  - For Lucide icons, adds SYSTEM_GREEN to className unless already present.
  - For @mui/icons-material icons, adds { sx: { color: '#16A34A' } } unless already present.

  NOTE:
  - Make sure SYSTEM_GREEN is imported somewhere e.g. `import { SYSTEM_GREEN } from "@/styles/systemGreen";`
  - Review results and manually fix any complex/edge cases or false positives as this is a best-effort codemod!
*/

const SYSTEM_GREEN = "text-green-600 dark:text-green-400"; // for simple regex fallback

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Helper: Add SYSTEM_GREEN to className as string or template expression
  function addSystemGreenToClassName(attrVal) {
    if (
      attrVal &&
      attrVal.type === "Literal" &&
      typeof attrVal.value === "string"
    ) {
      if (attrVal.value.includes("text-green")) return attrVal;
      return j.literal(`${attrVal.value} ${SYSTEM_GREEN}`);
    }
    // Handle JSXExpressionContainer with template or concatenation
    if (
      attrVal &&
      attrVal.type === "JSXExpressionContainer" &&
      attrVal.expression.type === "TemplateLiteral"
    ) {
      const existing = attrVal.expression.quasis.map((q) => q.value.raw).join("");
      if (existing.includes("text-green")) return attrVal;
      attrVal.expression.quasis[0].value.raw =
        attrVal.expression.quasis[0].value.raw + ` ${SYSTEM_GREEN} `;
      return attrVal;
    }
    // Unsafe case: just append
    return attrVal;
  }

  // Lucide Icon Pattern: <Icon className="..."/>
  root.find(j.JSXElement)
    .filter((el) => {
      const opening = el.node.openingElement;
      if (!opening.name) return false;
      // Heuristics: Tag starts uppercase and not a known special tag
      return (
        typeof opening.name.name === "string" &&
        /^[A-Z][A-Za-z0-9]+$/.test(opening.name.name) &&
        (
          opening.name.name.endsWith("Icon") ||
          [
            // lucide common
            "Calendar",
            "Plus",
            "Mail",
            "FileText",
            "Clock",
            "Twitter",
            "Linkedin",
            "Facebook",
            "Instagram",
            "ChevronLeft",
            "ChevronRight",
            "Search",
            "Filter",
            "LayoutGrid",
            "LayoutList",
            // mui common (for detection, we treat separately)
          ].includes(opening.name.name)
        )
      );
    })
    .forEach((el) => {
      // Find className attribute
      const classAttrIdx = el.node.openingElement.attributes.findIndex(
        (attr) =>
          attr.type === "JSXAttribute" && attr.name.name === "className"
      );
      if (classAttrIdx >= 0) {
        const attr = el.node.openingElement.attributes[classAttrIdx];
        // Add SYSTEM_GREEN if not present
        el.node.openingElement.attributes[classAttrIdx].value = addSystemGreenToClassName(
          attr.value
        );
      } else {
        // Add className
        el.node.openingElement.attributes.push(
          j.jsxAttribute(
            j.jsxIdentifier("className"),
            j.literal(SYSTEM_GREEN)
          )
        );
      }
    });

  // MUI Icon Pattern: <XIcon ... />
  root.find(j.JSXElement)
    .filter((el) => {
      const opening = el.node.openingElement;
      if (!opening.name) return false;
      // Heuristics: Looks like an MUI icon by suffix or import or usage
      return (
        typeof opening.name.name === "string" &&
        (
          opening.name.name.endsWith("Icon") ||
          [
            "AddIcon",
            "DeleteIcon",
            "ImageIcon",
            "CloudUploadIcon",
            "RefreshIcon",
            "SettingsIcon",
            "InfoIcon",
            "CodeIcon",
            "ExpandMoreIcon"
          ].includes(opening.name.name)
        )
      );
    })
    .forEach((el) => {
      // Find sx prop
      const hasSx = el.node.openingElement.attributes.find(
        (attr) =>
          attr.type === "JSXAttribute" && attr.name.name === "sx"
      );
      if (!hasSx) {
        // Add sx prop
        el.node.openingElement.attributes.push(
          j.jsxAttribute(
            j.jsxIdentifier("sx"),
            j.jsxExpressionContainer(
              j.objectExpression([
                j.property(
                  "init",
                  j.identifier("color"),
                  j.literal("#16A34A")
                ),
              ])
            )
          )
        );
      }
      // Skip if already has sx
    });

  return root.toSource({ quote: "double" });
};