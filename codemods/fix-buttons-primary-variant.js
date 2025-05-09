/**
 * Codemod: Transform "primary" buttons to DS Button with variant.
 * - Handles string and simple template literal classNames.
 * - Logs for any unsupported className pattern per instance and at end.
 * - Cleans up empty className attributes.
 * - Handles <button> and <Button>.
 *
 * Usage:
 *   npx jscodeshift -t ./codemods/fix-buttons-primary-variant.js src/
 */

const PRIMARY_CLASSES = ["bg-primary", "text-white"];
const PRIM_REGEX = new RegExp(`\\b(${PRIMARY_CLASSES.join("|")})\\b`, "g");

/**
 * @param {string} className
 * @returns {string}
 */
function cleanClass(className) {
  if (!className) return "";
  if (typeof className !== "string") return className;
  return className
    .split(" ")
    .filter(cls => !PRIMARY_CLASSES.includes(cls.trim()))
    .join(" ")
    .trim();
}

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let manualReviewNeeded = false;
  let fileManualUsages = [];

  root.find(j.JSXElement)
    .filter(path => {
      const opening = path.node.openingElement;
      if (!opening.name || !opening.name.name) return false;
      const tag = opening.name.name;
      if (tag !== "button" && tag !== "Button") return false;

      const classAttr = opening.attributes.find(
        a => a && a.name && a.name.name === "className"
      );
      if (!classAttr) return false;

      let val = null;
      if (classAttr.value) {
        // className="..."
        if (classAttr.value.type === "Literal") {
          val = classAttr.value.value;
        }
        // className={'...'}
        else if (classAttr.value.type === "JSXExpressionContainer") {
          let expr = classAttr.value.expression;
          if (expr && expr.type === "Literal") {
            val = expr.value;
          }
          // className={`...`}
          else if (expr && expr.type === "TemplateLiteral" && expr.expressions.length === 0) {
            val = expr.quasis.map(q => q.value.cooked).join("");
          }
        }
      }

      if (typeof val !== "string") {
        manualReviewNeeded = true;
        fileManualUsages.push(j(path).toSource());
        return false;
      }
      return PRIM_REGEX.test(val);
    })
    .forEach(path => {
      const opening = path.node.openingElement;
      // Replace <button ...> with <Button ...>
      if (opening.name && opening.name.name === "button") {
        opening.name.name = "Button";
      }
      // Add/Set variant="primary"
      let hasVariant = opening.attributes.some(
        a => a && a.name && a.name.name === "variant"
      );
      if (!hasVariant) {
        opening.attributes.push(
          j.jsxAttribute(j.jsxIdentifier("variant"), j.stringLiteral("primary"))
        );
      } else {
        opening.attributes = opening.attributes.map(attr =>
          attr && attr.name && attr.name.name === "variant"
            ? j.jsxAttribute(j.jsxIdentifier("variant"), j.stringLiteral("primary"))
            : attr
        );
      }
      // Clean className, and remove if empty
      let classAttrIdx = opening.attributes.findIndex(
        a => a && a.name && a.name.name === "className"
      );
      if (classAttrIdx > -1) {
        let classAttr = opening.attributes[classAttrIdx];
        if (classAttr.value.type === "Literal") {
          const cleaned = cleanClass(classAttr.value.value);
          if (!cleaned) {
            // Remove the attribute if result is empty
            opening.attributes.splice(classAttrIdx, 1);
          } else {
            classAttr.value.value = cleaned;
          }
        } else if (
          classAttr.value.type === "JSXExpressionContainer" &&
          classAttr.value.expression.type === "Literal"
        ) {
          const cleaned = cleanClass(classAttr.value.expression.value);
          if (!cleaned) {
            opening.attributes.splice(classAttrIdx, 1);
          } else {
            classAttr.value.expression.value = cleaned;
          }
        } else if (
          classAttr.value.type === "JSXExpressionContainer" &&
          classAttr.value.expression.type === "TemplateLiteral" &&
          classAttr.value.expression.expressions.length === 0
        ) {
          let raw = classAttr.value.expression.quasis.map(q => q.value.cooked).join("");
          const cleaned = cleanClass(raw);
          if (!cleaned) {
            opening.attributes.splice(classAttrIdx, 1);
          } else {
            classAttr.value.expression = j.literal(cleaned);
          }
        }
      }
    });

  if (manualReviewNeeded && fileManualUsages.length) {
    console.warn(
      `[codemod][fix-buttons-primary-variant] Manual review needed in file: ${file.path}\nUnsupported or complex className usage(s):\n` +
        fileManualUsages.join("\n---\n")
    );
  }

  return root.toSource();
};
