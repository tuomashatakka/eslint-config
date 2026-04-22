/**
 * @fileoverview ESLint rule to enforce grouping of class properties
 * @author tuomashatakka
 */

'use strict'


/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce grouping of class properties",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          groups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                types: {
                  type: "array",
                  items: { type: "string" },
                },
                matches: {
                  type: "array",
                  items: { type: "string" },
                },
                order: { type: "integer", minimum: 0 },
              },
              required: ["name", "order"],
              additionalProperties: false,
            },
            default: [
              {
                name: "static-properties",
                types: ["ClassProperty"],
                matches: ["static"],
                order: 0,
              },
              {
                name: "static-methods",
                types: ["MethodDefinition"],
                matches: ["static"],
                order: 1,
              },
              {
                name: "instance-properties",
                types: ["ClassProperty"],
                matches: [],
                order: 2,
              },
              {
                name: "constructor",
                types: ["MethodDefinition"],
                matches: ["constructor"],
                order: 3,
              },
              {
                name: "instance-methods",
                types: ["MethodDefinition"],
                matches: [],
                order: 4,
              },
            ],
          },
          paddingBetweenGroups: {
            type: "integer",
            minimum: 0,
            default: 1,
          },
          enforceAlphabeticalSorting: {
            type: "boolean",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongGroupOrder:
        "Class member '{{member}}' should be in group '{{expectedGroup}}' ({{expectedGroupOrder}}) but is in group '{{actualGroup}}' ({{actualGroupOrder}}).",
      wrongAlphabeticalOrder:
        "Class members in the same group should be ordered alphabetically. '{{memberA}}' should come before '{{memberB}}'.",
      incorrectPaddingBetweenGroups:
        "Expected {{expected}} empty {{lineText}} between class member groups, but found {{actual}}."
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};

    // Get configured options with defaults
    const groups = options.groups || [
      {
        name: "static-properties",
        types: ["ClassProperty"],
        matches: ["static"],
        order: 0,
      },
      {
        name: "static-methods",
        types: ["MethodDefinition"],
        matches: ["static"],
        order: 1,
      },
      {
        name: "instance-properties",
        types: ["ClassProperty"],
        matches: [],
        order: 2,
      },
      {
        name: "constructor",
        types: ["MethodDefinition"],
        matches: ["constructor"],
        order: 3,
      },
      {
        name: "instance-methods",
        types: ["MethodDefinition"],
        matches: [],
        order: 4,
      },
    ];

    const paddingBetweenGroups = options.paddingBetweenGroups !== undefined ? options.paddingBetweenGroups : 1;
    const enforceAlphabeticalSorting = options.enforceAlphabeticalSorting !== undefined ? options.enforceAlphabeticalSorting : false;

    /**
     * Determine which group a class member belongs to
     * @param {ASTNode} node The class member node
     * @returns {Object|null} The group object or null if not matched
     */
    function getMemberGroup(node) {
      let nodeType = node.type;

      // Normalize TypeScript property types to match ESLint's ClassProperty
      if (nodeType === "PropertyDefinition" || nodeType === "TSPropertyDefinition") {
        nodeType = "ClassProperty";
      }

      // For each group, check if the node matches the group criteria
      for (const group of groups) {
        // Skip if the node type doesn't match any in the group's types
        if (!group.types.includes(nodeType)) {
          continue;
        }

        // For MethodDefinition nodes
        if (nodeType === "MethodDefinition") {
          const isConstructor = node.kind === "constructor";
          const isStatic = !!node.static;

          // If this is a constructor and the group is for constructors
          if (isConstructor && group.matches.includes("constructor")) {
            return group;
          }

          // If this is a static method and the group is for static methods
          if (isStatic && group.matches.includes("static")) {
            return group;
          }

          // If this is not static and not a constructor and the group is for regular instance methods
          if (!isStatic && !isConstructor && !group.matches.includes("static") && !group.matches.includes("constructor")) {
            return group;
          }
        }

        // For ClassProperty nodes
        if (nodeType === "ClassProperty") {
          const isStatic = !!node.static;

          // If this is a static property and the group is for static properties
          if (isStatic && group.matches.includes("static")) {
            return group;
          }

          // If this is not static and the group is for regular instance properties
          if (!isStatic && !group.matches.includes("static")) {
            return group;
          }
        }
      }

      return null;
    }

    /**
     * Get the member name for a node
     * @param {ASTNode} node The class member node
     * @returns {string} The member name
     */
    function getMemberName(node) {
      if (node.type === "MethodDefinition" || node.type === "ClassProperty" ||
          node.type === "PropertyDefinition" || node.type === "TSPropertyDefinition") {
        if (node.key.type === "Identifier") {
          return node.key.name;
        } else if (node.key.type === "Literal") {
          return String(node.key.value);
        }
      }
      return "";
    }

    /**
     * Check if members are in correct group order
     * @param {Array<Object>} members Array of { node, group } objects
     */
    function checkGroupOrder(members) {
      let lastGroupOrder = -1;
      let lastGroup = null;

      for (let i = 0; i < members.length; i++) {
        const { node, group } = members[i];
        if (!group) continue;

        const currentGroupOrder = group.order;
        const memberName = getMemberName(node);

        // Check if group order is correct
        if (currentGroupOrder < lastGroupOrder) {
          const lastGroupInfo = lastGroup;

          context.report({
            node,
            messageId: "wrongGroupOrder",
            data: {
              member: memberName,
              expectedGroup: lastGroupInfo.name,
              expectedGroupOrder: lastGroupInfo.order,
              actualGroup: group.name,
              actualGroupOrder: group.order,
            },
          });
        }

        lastGroupOrder = currentGroupOrder;
        lastGroup = group;
      }
    }

    /**
     * Check if members within the same group are sorted alphabetically
     * @param {Array<Object>} members Array of { node, group } objects
     */
    function checkAlphabeticalOrder(members) {
      if (!enforceAlphabeticalSorting) return;

      // Group members by their group
      const groupedMembers = {};

      for (const member of members) {
        if (!member.group) continue;

        const groupName = member.group.name;
        if (!groupedMembers[groupName]) {
          groupedMembers[groupName] = [];
        }

        groupedMembers[groupName].push(member);
      }

      // Check each group for alphabetical ordering
      for (const groupName in groupedMembers) {
        const groupMembers = groupedMembers[groupName];

        for (let i = 1; i < groupMembers.length; i++) {
          const prevNode = groupMembers[i - 1].node;
          const currentNode = groupMembers[i].node;

          const prevName = getMemberName(prevNode);
          const currentName = getMemberName(currentNode);

          if (prevName && currentName && prevName.localeCompare(currentName) > 0) {
            context.report({
              node: currentNode,
              messageId: "wrongAlphabeticalOrder",
              data: {
                memberA: currentName,
                memberB: prevName,
              },
            });
          }
        }
      }
    }

    /**
     * Check padding between different groups
     * @param {Array<Object>} members Array of { node, group } objects
     */
    function checkGroupPadding(members) {
      if (paddingBetweenGroups <= 0 || members.length < 2) return;

      let currentGroup = null;

      for (let i = 1; i < members.length; i++) {
        const prevMember = members[i - 1];
        const currentMember = members[i];

        // Skip if either member doesn't have a valid group
        if (!prevMember.group || !currentMember.group) continue;

        // If the groups are different, check padding
        if (prevMember.group.name !== currentMember.group.name) {
          const prevNode = prevMember.node;
          const currentNode = currentMember.node;

          const prevNodeEnd = prevNode.loc.end.line;
          const currentNodeStart = currentNode.loc.start.line;
          const blankLines = currentNodeStart - prevNodeEnd - 1;

          if (blankLines !== paddingBetweenGroups) {
            context.report({
              node: currentNode,
              messageId: "incorrectPaddingBetweenGroups",
              data: {
                expected: paddingBetweenGroups,
                actual: blankLines,
                lineText: paddingBetweenGroups === 1 ? "line" : "lines",
              },
              fix(fixer) {
                const endOfPrevNode = sourceCode.getLastToken(prevNode);
                const startOfCurrentNode = sourceCode.getFirstToken(currentNode);
                const range = [
                  endOfPrevNode.range[1],
                  startOfCurrentNode.range[0],
                ];

                // Create the desired padding
                const newLines = "\n".repeat(paddingBetweenGroups + 1); // +1 for end of current line

                return fixer.replaceTextRange(range, newLines);
              },
            });
          }
        }
      }
    }

    return {
      ClassBody(node) {
        if (!node.body || node.body.length <= 1) {
          return;
        }

        // Map each node to its group
        const members = node.body.map(memberNode => ({
          node: memberNode,
          group: getMemberGroup(memberNode),
        }));

        // Run checks
        checkGroupOrder(members);
        checkAlphabeticalOrder(members);
        checkGroupPadding(members);
      },
    };
  },
};
