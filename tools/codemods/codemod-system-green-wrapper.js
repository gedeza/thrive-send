and ensures import is present.">
/*
  Codemod: Migrate <Icon .../> usages (Lucide/MUI) to <SystemGreenIcon as={Icon} .../>
  HOW TO USE:
    npx jscodeshift -t tools/codemods/codemod-system-green-wrapper.js src/
*/

const SYSTEM_GREEN_IMPORT = {
  source: "@/components/ui/SystemGreenIcon",
  imported: "SystemGreenIcon"
};

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let iconNamesUsed = new Set();

  // Helper: Find JSXIdentifiers that look like icons (heuristic)
  function isIcon(name) {
    // Lucide: PascalCase, short names, matches common
    // MUI: PascalCase, ends with Icon
    return (
      typeof name === "string" &&
      ((/^[A-Z][A-Za-z0-9]+Icon$/.test(name)) || // MUI e.g. HomeIcon
      [
        "Calendar","Plus","Mail","FileText","Clock","Twitter","Linkedin","Facebook","Instagram","ChevronLeft","ChevronRight","Search","Filter","LayoutGrid","LayoutList","Users","BarChart2","Coins","Rocket","Share2","Check"
      ].includes(name))
    );
  }

  // 1. Replace Icon Usage in JSX
  root.find(j.JSXElement)
    .filter(el => {
      const opening = el.node.openingElement;
      if (!opening || !opening.name || opening.name.type !== "JSXIdentifier")
        return false;
      return isIcon(opening.name.name);
    })
    .forEach(el => {
      const opening = el.node.openingElement;
      const name = opening.name.name;
      iconNamesUsed.add(name);

      // Replace <Icon ... /> or <Icon>...</Icon> 
      //   → <SystemGreenIcon as={Icon} ...rest />
      // Remove direct prop 'color', 'sx', and 'className' (let wrapper handle)
      const filteredAttrs = opening.attributes.filter(attr =>
        !(
          attr.type === "JSXAttribute" && 
          (attr.name.name === "color" ||
           attr.name.name === "sx" ||
           attr.name.name === "className")
        )
      );

      // Spread attributes into new element, inject as={Icon}
      el.node.openingElement = j.jsxOpeningElement(
        j.jsxIdentifier("SystemGreenIcon"),
        [
          j.jsxAttribute(
            j.jsxIdentifier("as"), 
            j.jsxExpressionContainer(j.identifier(name))
          ),
          ...filteredAttrs
        ],
        opening.selfClosing
      );
      el.node.closingElement = opening.selfClosing ? null : j.jsxClosingElement(j.jsxIdentifier("SystemGreenIcon"));
    });

  // 2. Add import { SystemGreenIcon } if missing
  const hasImport = root.find(j.ImportDeclaration, {
    source: { value: SYSTEM_GREEN_IMPORT.source }
  }).size() > 0;

  if (!hasImport) {
    root.find(j.ImportDeclaration)
      .at(0)
      .insertBefore(
        j.importDeclaration(
          [j.importSpecifier(j.identifier(SYSTEM_GREEN_IMPORT.imported))],
          j.literal(SYSTEM_GREEN_IMPORT.source)
        )
      );
  }

  return root.toSource({ quote: "double" });
};