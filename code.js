(() => {
  // code.ts
  figma.showUI(__html__, { width: 400, height: 500 });
  async function callOpenAI(apiKey, prompt, model = "gpt-4o") {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are a UI/UX designer. Create simple, mobile-friendly UI components."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1e3,
          temperature: 0.7
        })
      });
      if (!response.ok) {
        throw new Error(`OpenAI API \uC624\uB958: ${response.status}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API \uD638\uCD9C \uC624\uB958:", error);
      throw error;
    }
  }
  function createDefaultComponents(section, startY) {
    const components = [];
    switch (section.name) {
      case "\uD5E4\uB354":
        components.push({
          name: "Header Title",
          type: "text",
          content: "\uC6E8\uB529\uD640 \uB9AC\uBDF0",
          width: 300,
          height: 40,
          x: 0,
          y: startY,
          backgroundColor: "#FFFFFF",
          fontSize: 24,
          fontWeight: "BOLD",
          textAlign: "CENTER"
        });
        break;
      case "\uD3C9\uC810":
        components.push({
          name: "Rating Container",
          type: "frame",
          width: 320,
          height: 80,
          x: 0,
          y: startY,
          backgroundColor: "#F8F9FA",
          layoutMode: "VERTICAL",
          itemSpacing: 16,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 16,
          paddingBottom: 16,
          children: [
            {
              name: "Rating Label",
              type: "text",
              content: "\uD3C9\uC810\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694",
              width: 288,
              height: 24,
              x: 16,
              y: startY + 16,
              backgroundColor: "#F8F9FA",
              fontSize: 16,
              fontWeight: "BOLD",
              textAlign: "LEFT"
            }
          ]
        });
        break;
      case "\uC0AC\uC9C4\uC5C5\uB85C\uB4DC":
        components.push({
          name: "Photo Upload",
          type: "rectangle",
          width: 320,
          height: 120,
          x: 0,
          y: startY,
          backgroundColor: "#F8F9FA",
          borderRadius: 8,
          borderColor: "#E9ECEF",
          borderWidth: 2
        });
        break;
      case "\uD14D\uC2A4\uD2B8\uC785\uB825":
        components.push({
          name: "Text Input",
          type: "rectangle",
          width: 320,
          height: 100,
          x: 0,
          y: startY,
          backgroundColor: "#FFFFFF",
          borderRadius: 8,
          borderColor: "#E9ECEF",
          borderWidth: 1
        });
        break;
      case "\uBC84\uD2BC":
        components.push({
          name: "Submit Button",
          type: "rectangle",
          width: 320,
          height: 48,
          x: 0,
          y: startY,
          backgroundColor: "#FF6B9D",
          borderRadius: 24
        });
        break;
      default:
        components.push({
          name: "Default Component",
          type: "text",
          content: section.content || "\uCEF4\uD3EC\uB10C\uD2B8",
          width: 300,
          height: 40,
          x: 0,
          y: startY,
          backgroundColor: "#FFFFFF",
          fontSize: 16,
          fontWeight: "NORMAL",
          textAlign: "LEFT"
        });
    }
    return components;
  }
  function analyzePlanSections(planText) {
    const sections = [];
    const sectionPatterns = [
      {
        name: "\uD5E4\uB354",
        keywords: ["\uC81C\uBAA9", "\uBD80\uC81C", "\uD0C0\uC774\uD2C0", "title", "subtitle"],
        priority: 1
      },
      {
        name: "\uD3C9\uC810",
        keywords: ["\uD3C9\uC810", "\uBCC4\uC810", "rating", "\uC810\uC218", "star", "\uBCC4"],
        priority: 2
      },
      {
        name: "\uC0AC\uC9C4\uC5C5\uB85C\uB4DC",
        keywords: ["\uC0AC\uC9C4", "\uC5C5\uB85C\uB4DC", "\uC774\uBBF8\uC9C0", "photo", "upload", "image"],
        priority: 3
      },
      {
        name: "\uD14D\uC2A4\uD2B8\uC785\uB825",
        keywords: ["\uC785\uB825", "\uD6C4\uAE30", "\uB0B4\uC6A9", "text", "input", "textarea", "\uB9AC\uBDF0"],
        priority: 4
      },
      {
        name: "\uBC84\uD2BC",
        keywords: ["\uBC84\uD2BC", "\uC81C\uCD9C", "\uB4F1\uB85D", "button", "submit", "\uD655\uC778"],
        priority: 5
      }
    ];
    const sortedPatterns = sectionPatterns.sort((a, b) => a.priority - b.priority);
    for (const section of sortedPatterns) {
      const matchingLines = planText.split("\n").filter(
        (line) => section.keywords.some(
          (keyword) => line.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      if (matchingLines.length > 0) {
        sections.push({
          name: section.name,
          content: matchingLines.join("\n")
        });
      }
    }
    if (sections.length === 0) {
      sections.push({
        name: "\uC804\uCCB4",
        content: planText
      });
    }
    return sections;
  }
  async function generateSectionDesign(apiKey, section, startY) {
    const prompt = `You are a senior UI/UX designer at Apple/Google. Create production-ready mobile UI components.

Section: ${section.name}
Content: ${section.content}

## Design System:
- **Mobile First**: 375px width, iOS/Android guidelines
- **Typography**: Inter font, 12/14/16/18/20/24/32px scale
- **Spacing**: 8px grid system (8, 16, 24, 32, 48px)
- **Colors**: Wedding theme (#FF6B9D primary, #FF8A80 secondary, #FFFFFF background, #F8F9FA surface, #212529 text, #6C757D secondary text)
- **Shadows**: Subtle elevation (0 2px 8px rgba(0,0,0,0.1))
- **Border Radius**: 8px for cards, 24px for buttons, 4px for inputs

## Component Guidelines:

### Headers:
- Title: 24px, bold, #212529, center aligned
- Subtitle: 16px, normal, #6C757D, center aligned
- Section headers: 18px, bold, #212529, left aligned

### Rating Components:
- Create individual star components (5 stars)
- Star size: 20px, #FF6B9D for filled, #E9ECEF for empty
- Horizontal layout with proper spacing

### Buttons:
- Height: 48px minimum
- Border radius: 24px
- Primary: #FF6B9D background, white text
- Secondary: transparent background, #FF6B9D border and text

### Input Fields:
- Height: 48px
- Border radius: 8px
- Border: 1px #E9ECEF
- Focus state: #FF6B9D border

### Cards/Containers:
- Background: #FFFFFF
- Border radius: 8px
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Padding: 16px or 24px

Return a JSON array with production-quality components:

[
  {
    "name": "Component Name",
    "type": "text|frame|rectangle|ellipse|star",
    "content": "Text content (for text type)",
    "width": number,
    "height": number,
    "x": number,
    "y": ${startY},
    "backgroundColor": "#FFFFFF",
    "fontSize": number,
    "fontWeight": "NORMAL|BOLD",
    "textAlign": "LEFT|CENTER|RIGHT",
    "borderRadius": number,
    "borderColor": "#E9ECEF",
    "borderWidth": number,
    "layoutMode": "HORIZONTAL|VERTICAL" (for frames),
    "itemSpacing": number,
    "paddingLeft": number,
    "paddingRight": number,
    "paddingTop": number,
    "paddingBottom": number,
    "children": [child components array]
  }
]

Create pixel-perfect, production-ready components. Return only valid JSON.`;
    try {
      const response = await callOpenAI(apiKey, prompt);
      let cleanedResponse = response.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/,(\s*[}\]])/g, "$1").trim();
      const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleanedResponse = arrayMatch[0];
      }
      const openBrackets = (cleanedResponse.match(/\[/g) || []).length;
      const closeBrackets = (cleanedResponse.match(/\]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        console.log(`${section.name}: JSON \uAD04\uD638 \uBD88\uADE0\uD615, \uAE30\uBCF8 \uCEF4\uD3EC\uB10C\uD2B8 \uC0DD\uC131`);
        return createDefaultComponents(section, startY);
      }
      const components = JSON.parse(cleanedResponse);
      let currentY = startY;
      for (const component of components) {
        component.y = currentY;
        currentY += (component.height || 60) + 10;
      }
      return components;
    } catch (error) {
      console.error(`${section.name} \uC139\uC158 \uC0DD\uC131 \uC624\uB958:`, error);
      return createDefaultComponents(section, startY);
    }
  }
  async function createFigmaComponent(designData, parent = figma.currentPage) {
    await loadFontWithFallback();
    const frame = figma.createFrame();
    frame.name = designData.name || "Generated Design";
    frame.resize(designData.width || 375, designData.height || 600);
    frame.x = designData.x || 0;
    frame.y = designData.y || 0;
    if (designData.backgroundColor) {
      frame.fills = [{ type: "SOLID", color: hexToRgb(designData.backgroundColor) }];
    }
    if (designData.layoutMode) {
      try {
        frame.layoutMode = designData.layoutMode;
        frame.primaryAxisAlignItems = designData.primaryAxisAlignItems || "MIN";
        frame.counterAxisAlignItems = designData.counterAxisAlignItems || "MIN";
        frame.itemSpacing = designData.itemSpacing || 16;
        frame.paddingLeft = designData.paddingLeft || 24;
        frame.paddingRight = designData.paddingRight || 24;
        frame.paddingTop = designData.paddingTop || 24;
        frame.paddingBottom = designData.paddingBottom || 24;
      } catch (error) {
        console.log("Auto Layout \uC124\uC815 \uC2E4\uD328:", error);
      }
    }
    if (designData.children && Array.isArray(designData.children)) {
      let yOffset = 0;
      for (const child of designData.children) {
        yOffset = await createChildNode(child, frame, yOffset);
      }
    }
    parent.appendChild(frame);
    return frame;
  }
  async function loadFontWithFallback() {
    const fonts = ["Inter", "Roboto", "Segoe UI", "Arial"];
    for (const font of fonts) {
      try {
        await figma.loadFontAsync({ family: font, style: "Regular" });
        await figma.loadFontAsync({ family: font, style: "Bold" });
        console.log(`\uD3F0\uD2B8 \uB85C\uB4DC \uC131\uACF5: ${font}`);
        return;
      } catch (error) {
        console.log(`\uD3F0\uD2B8 \uB85C\uB4DC \uC2E4\uD328: ${font}`);
      }
    }
    throw new Error("\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uD3F0\uD2B8\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  async function createChildNode(childData, parent, yOffset = 0) {
    let node;
    let currentYOffset = yOffset;
    const width = childData.width || (childData.type === "text" ? 300 : 400);
    const height = childData.height || (childData.type === "text" ? 60 : 200);
    const x = childData.x || 0;
    const y = childData.y !== void 0 ? childData.y : currentYOffset;
    switch (childData.type) {
      case "text":
        const textNode = figma.createText();
        textNode.characters = childData.content || "Sample Text";
        textNode.fontSize = childData.fontSize || 16;
        if (childData.fontWeight === "BOLD") {
          try {
            textNode.fontWeight = "Bold";
          } catch (error) {
            console.log("fontWeight \uC124\uC815 \uC2E4\uD328:", error);
          }
        }
        try {
          if (childData.textAlign === "CENTER") {
            textNode.textAlignHorizontal = "CENTER";
          } else if (childData.textAlign === "RIGHT") {
            textNode.textAlignHorizontal = "RIGHT";
          } else {
            textNode.textAlignHorizontal = "LEFT";
          }
        } catch (error) {
          console.log("\uD14D\uC2A4\uD2B8 \uC815\uB82C \uC124\uC815 \uC2E4\uD328:", error);
        }
        node = textNode;
        break;
      case "frame":
        const frameNode = figma.createFrame();
        frameNode.name = childData.name || "Frame";
        if (childData.layoutMode) {
          try {
            frameNode.layoutMode = childData.layoutMode;
            frameNode.primaryAxisAlignItems = childData.primaryAxisAlignItems || "MIN";
            frameNode.counterAxisAlignItems = childData.counterAxisAlignItems || "MIN";
            frameNode.itemSpacing = childData.itemSpacing || 16;
            frameNode.paddingLeft = childData.paddingLeft || 16;
            frameNode.paddingRight = childData.paddingRight || 16;
            frameNode.paddingTop = childData.paddingTop || 16;
            frameNode.paddingBottom = childData.paddingBottom || 16;
          } catch (error) {
            console.log("Frame Auto Layout \uC124\uC815 \uC2E4\uD328:", error);
          }
        }
        node = frameNode;
        break;
      case "rectangle":
        const rectNode = figma.createRectangle();
        rectNode.name = childData.name || "Rectangle";
        if (childData.borderRadius) {
          try {
            rectNode.cornerRadius = childData.borderRadius;
          } catch (error) {
            console.log("cornerRadius \uC124\uC815 \uC2E4\uD328:", error);
          }
        }
        node = rectNode;
        break;
      case "ellipse":
        const ellipseNode = figma.createEllipse();
        ellipseNode.name = childData.name || "Ellipse";
        node = ellipseNode;
        break;
      case "star":
        const starNode = figma.createStar();
        starNode.name = childData.name || "Star";
        node = starNode;
        break;
      default:
        const defaultNode = figma.createRectangle();
        defaultNode.name = childData.name || "Component";
        node = defaultNode;
    }
    node.resize(width, height);
    node.x = x;
    node.y = y;
    if (childData.backgroundColor && "fills" in node) {
      try {
        node.fills = [{ type: "SOLID", color: hexToRgb(childData.backgroundColor) }];
      } catch (error) {
        console.log("\uBC30\uACBD\uC0C9 \uC124\uC815 \uC2E4\uD328:", error);
      }
    }
    if (childData.borderColor && childData.borderWidth && "strokes" in node) {
      try {
        node.strokes = [{ type: "SOLID", color: hexToRgb(childData.borderColor) }];
        node.strokeWeight = childData.borderWidth;
      } catch (error) {
        console.log("\uD14C\uB450\uB9AC \uC124\uC815 \uC2E4\uD328:", error);
      }
    }
    if (childData.borderRadius && "cornerRadius" in node) {
      try {
        node.cornerRadius = childData.borderRadius;
      } catch (error) {
        console.log("\uBAA8\uC11C\uB9AC \uBC18\uACBD \uC124\uC815 \uC2E4\uD328:", error);
      }
    }
    if ("effects" in node && (childData.type === "frame" || childData.type === "rectangle")) {
      try {
        node.effects = [
          {
            type: "DROP_SHADOW",
            color: { r: 0, g: 0, b: 0, a: 0.1 },
            offset: { x: 0, y: 2 },
            radius: 8,
            visible: true,
            blendMode: "NORMAL"
          }
        ];
      } catch (error) {
        console.log("\uADF8\uB9BC\uC790 \uD6A8\uACFC \uC124\uC815 \uC2E4\uD328:", error);
      }
    }
    parent.appendChild(node);
    if (childData.children && Array.isArray(childData.children)) {
      let childYOffset = 0;
      for (const grandChild of childData.children) {
        childYOffset = await createChildNode(grandChild, node, childYOffset);
      }
    }
    return y + height + 10;
  }
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      };
    }
    return { r: 0, g: 0, b: 0 };
  }
  figma.ui.onmessage = async (msg) => {
    console.log("code.ts: \uBA54\uC2DC\uC9C0 \uC218\uC2E0\uB428:", msg);
    if (msg.type === "hello-from-ui") {
      console.log("UI\uC5D0\uC11C \uBC1B\uC740 \uBA54\uC2DC\uC9C0:", msg.message);
      figma.ui.postMessage({
        type: "response-from-code",
        message: "Hello from Code! \uBA54\uC2DC\uC9C0\uB97C \uBC1B\uC558\uC2B5\uB2C8\uB2E4."
      });
    }
    if (msg.type === "verify-api-key") {
      const apiKey = msg.key;
      console.log("code.ts: verify-api-key \uBA54\uC2DC\uC9C0 \uC218\uC2E0\uB428");
      console.log("API Key \uC778\uC99D \uC694\uCCAD \uBC1B\uC74C:", apiKey.substring(0, 10) + "...");
      if (apiKey.startsWith("sk-") || apiKey.startsWith("Bearer ")) {
        try {
          console.log("API Key \uD615\uC2DD \uAC80\uC99D \uC131\uACF5");
          await figma.clientStorage.setAsync("openai-api-key", apiKey);
          console.log("OpenAI API Key\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
          figma.ui.postMessage({
            type: "verify-success"
          });
          console.log("\uC778\uC99D \uC131\uACF5: \uD615\uC2DD \uAC80\uC99D \uC644\uB8CC (\uC2E4\uC81C API \uD638\uCD9C\uC740 \uC0DD\uB7B5)");
        } catch (error) {
          console.error("API Key \uC800\uC7A5 \uC911 \uC624\uB958:", error);
          figma.ui.postMessage({
            type: "verify-fail"
          });
        }
      } else {
        console.log("\uC798\uBABB\uB41C API Key \uD615\uC2DD:", apiKey);
        figma.ui.postMessage({
          type: "verify-fail"
        });
      }
    }
    if (msg.type === "start-generation") {
      try {
        const apiKey = await figma.clientStorage.getAsync("openai-api-key");
        if (!apiKey) {
          figma.ui.postMessage({
            type: "generation-status",
            message: "\u274C API Key\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 API Key\uB97C \uC778\uC99D\uD574\uC8FC\uC138\uC694.",
            status: "error"
          });
          return;
        }
        const planText = msg.payload;
        const sections = analyzePlanSections(planText);
        console.log("\uBD84\uC11D\uB41C \uC139\uC158\uB4E4:", sections);
        let allDesignData = [];
        let currentY = 0;
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          figma.ui.postMessage({
            type: "generation-status",
            message: `${section.name} \uC0DD\uC131 \uC911... (${i + 1}/${sections.length})`,
            status: "processing"
          });
          const sectionDesign = await generateSectionDesign(apiKey, section, currentY);
          allDesignData = allDesignData.concat(sectionDesign);
          if (sectionDesign.length > 0) {
            const lastElement = sectionDesign[sectionDesign.length - 1];
            currentY = lastElement.y + lastElement.height + 20;
          }
        }
        const mainFrame = {
          name: "Review Page",
          type: "frame",
          width: 375,
          height: currentY + 50,
          x: 0,
          y: 0,
          backgroundColor: "#FFFFFF",
          children: allDesignData
        };
        figma.ui.postMessage({
          type: "generation-status",
          message: "Figma \uCEF4\uD3EC\uB10C\uD2B8 \uC0DD\uC131 \uC911...",
          status: "processing"
        });
        await createFigmaComponent(mainFrame);
        figma.ui.postMessage({
          type: "generation-status",
          message: "\u2705 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!",
          status: "success"
        });
      } catch (error) {
        console.error("\uB514\uC790\uC778 \uC0DD\uC131 \uC624\uB958:", error);
        figma.ui.postMessage({
          type: "generation-status",
          message: `\u274C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4: ${error.message}`,
          status: "error"
        });
      }
    }
  };
  console.log("Figma AI Design Plugin\uC774 \uC2DC\uC791\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
})();
