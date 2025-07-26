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
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2e3
        })
      });
      if (!response.ok) {
        throw new Error(`OpenAI API \uC624\uB958: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API \uD638\uCD9C \uC624\uB958:", error);
      throw error;
    }
  }
  async function createFigmaComponent(designData, parent = figma.currentPage) {
    const frame = figma.createFrame();
    frame.name = designData.name || "Generated Component";
    frame.resize(designData.width || 400, designData.height || 300);
    frame.x = designData.x || 0;
    frame.y = designData.y || 0;
    frame.layoutMode = "VERTICAL";
    frame.primaryAxisAlignItems = "MIN";
    frame.counterAxisAlignItems = "MIN";
    frame.itemSpacing = 16;
    frame.paddingLeft = 24;
    frame.paddingRight = 24;
    frame.paddingTop = 24;
    frame.paddingBottom = 24;
    if (designData.backgroundColor) {
      frame.fills = [{ type: "SOLID", color: hexToRgb(designData.backgroundColor) }];
    }
    if (designData.children && Array.isArray(designData.children)) {
      let yOffset = 0;
      for (const child of designData.children) {
        yOffset = await createChildNode(child, frame, yOffset);
      }
    }
    return frame;
  }
  async function loadFontWithFallback() {
    const fonts = [
      { family: "Inter", style: "Regular" },
      { family: "Roboto", style: "Regular" },
      { family: "Segoe UI", style: "Regular" },
      { family: "Arial", style: "Regular" }
    ];
    for (const font of fonts) {
      try {
        await figma.loadFontAsync(font);
        console.log(`\uD3F0\uD2B8 \uB85C\uB4DC \uC131\uACF5: ${font.family}`);
        return;
      } catch (error) {
        console.log(`\uD3F0\uD2B8 \uB85C\uB4DC \uC2E4\uD328: ${font.family}`, error);
        continue;
      }
    }
    throw new Error("\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uD3F0\uD2B8\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  async function createChildNode(childData, parent, yOffset = 0) {
    let node;
    let currentYOffset = yOffset;
    switch (childData.type) {
      case "text":
        node = figma.createText();
        try {
          await loadFontWithFallback();
          node.characters = childData.content || "";
          node.fontSize = 16;
          node.textAlignHorizontal = "CENTER";
          node.textAlignVertical = "CENTER";
        } catch (error) {
          console.error("\uD3F0\uD2B8 \uB85C\uB4DC \uC2E4\uD328:", error);
          node.characters = childData.content || "";
        }
        break;
      case "frame":
        node = figma.createFrame();
        node.layoutMode = "VERTICAL";
        node.primaryAxisAlignItems = "MIN";
        node.counterAxisAlignItems = "MIN";
        node.itemSpacing = 16;
        node.paddingLeft = 24;
        node.paddingRight = 24;
        node.paddingTop = 24;
        node.paddingBottom = 24;
        if (childData.backgroundColor) {
          node.fills = [{ type: "SOLID", color: hexToRgb(childData.backgroundColor) }];
        }
        break;
      case "rectangle":
        node = figma.createRectangle();
        if (childData.backgroundColor) {
          node.fills = [{ type: "SOLID", color: hexToRgb(childData.backgroundColor) }];
        }
        break;
      case "ellipse":
        node = figma.createEllipse();
        if (childData.backgroundColor) {
          node.fills = [{ type: "SOLID", color: hexToRgb(childData.backgroundColor) }];
        }
        break;
      default:
        node = figma.createFrame();
    }
    let defaultWidth = 400;
    let defaultHeight = 200;
    if (childData.type === "text") {
      defaultWidth = 300;
      defaultHeight = 60;
    }
    node.name = childData.name || "Generated Element";
    node.resize(childData.width || defaultWidth, childData.height || defaultHeight);
    if (childData.x !== void 0) {
      node.x = childData.x;
    } else {
      node.x = 0;
    }
    if (childData.y !== void 0) {
      node.y = childData.y;
    } else {
      node.y = currentYOffset;
      currentYOffset += (childData.height || defaultHeight) + 16;
    }
    if (node.type === "FRAME" && childData.layoutMode) {
      node.layoutMode = childData.layoutMode;
      if (childData.primaryAxisAlignItems) {
        node.primaryAxisAlignItems = childData.primaryAxisAlignItems;
      }
      if (childData.counterAxisAlignItems) {
        node.counterAxisAlignItems = childData.counterAxisAlignItems;
      }
      if (childData.itemSpacing !== void 0) {
        node.itemSpacing = childData.itemSpacing;
      }
      if (childData.paddingLeft !== void 0) {
        node.paddingLeft = childData.paddingLeft;
      }
      if (childData.paddingRight !== void 0) {
        node.paddingRight = childData.paddingRight;
      }
      if (childData.paddingTop !== void 0) {
        node.paddingTop = childData.paddingTop;
      }
      if (childData.paddingBottom !== void 0) {
        node.paddingBottom = childData.paddingBottom;
      }
    }
    parent.appendChild(node);
    if (childData.children && Array.isArray(childData.children)) {
      let childYOffset = 0;
      for (const grandChild of childData.children) {
        childYOffset = await createChildNode(grandChild, node, childYOffset);
      }
    }
    return currentYOffset;
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
        figma.ui.postMessage({
          type: "generation-status",
          message: "GPT \uBD84\uC11D \uC911...",
          status: "processing"
        });
        const step1Prompt = `You are a senior product designer with expertise in Figma and mobile UI design.

Your task is to analyze the following planning document and generate a comprehensive UI component list for a clean, mobile-friendly wireframe layout.

Use visual hierarchy, proper spacing, and modern design components. Group related elements together logically.

Use soft, wedding-themed colors (soft pinks, corals, whites, light grays) and emphasize clarity and friendliness.

Here is the planning document written by the user:
"""
${planText}
"""

Please generate a detailed component list that includes:
- Section headers with clear typography hierarchy
- Input fields with proper labels and placeholders
- Interactive elements (buttons, toggles, sliders)
- Rating components (star ratings, scales)
- Image upload areas with visual indicators
- Large, prominent CTA (Call-to-Action) buttons
- Proper spacing and grouping containers

Return a JSON array with the following structure:
[
  {
    "name": "Component Name",
    "type": "text|frame|rectangle|ellipse",
    "content": "Text content (for text type)",
    "width": number,
    "height": number,
    "x": number,
    "y": number,
    "backgroundColor": "#colorcode (optional)",
    "fontSize": number (for text),
    "textAlign": "LEFT|CENTER|RIGHT",
    "children": [child components array]
  }
]

Focus on creating a logical, aesthetic grouping of UI elements that fits a mobile screen layout (320-375px width).
Use wedding-themed colors: #FF6B9D (soft pink), #FF8A80 (coral), #F8F9FA (light gray), #FFFFFF (white), #6C757D (text gray).

Return only valid JSON without any additional text or markdown formatting.`;
        const componentListResponse = await callOpenAI(apiKey, step1Prompt);
        let componentList;
        try {
          let cleanedResponse = componentListResponse.trim();
          cleanedResponse = cleanedResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
          console.log("\uC815\uB9AC\uB41C \uC751\uB2F5:", cleanedResponse);
          componentList = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.error("\uCEF4\uD3EC\uB10C\uD2B8 \uB9AC\uC2A4\uD2B8 \uD30C\uC2F1 \uC624\uB958:", parseError);
          console.log("\uD30C\uC2F1 \uC2E4\uD328\uD55C \uC751\uB2F5:", componentListResponse);
          const jsonMatch = componentListResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              componentList = JSON.parse(jsonMatch[0]);
              console.log("JSON \uCD94\uCD9C \uC131\uACF5:", componentList);
            } catch (extractError) {
              console.error("JSON \uCD94\uCD9C \uD6C4 \uD30C\uC2F1 \uC2E4\uD328:", extractError);
              throw new Error("\uCEF4\uD3EC\uB10C\uD2B8 \uB9AC\uC2A4\uD2B8\uB97C \uD30C\uC2F1\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
            }
          } else {
            throw new Error("\uCEF4\uD3EC\uB10C\uD2B8 \uB9AC\uC2A4\uD2B8\uB97C \uD30C\uC2F1\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
          }
        }
        figma.ui.postMessage({
          type: "generation-status",
          message: "\uB514\uC790\uC778 \uC0DD\uC131 \uC911...",
          status: "processing"
        });
        const step2Prompt = `You are a senior Figma designer specializing in mobile UI design and component architecture.

Your task is to convert the following component list into a well-structured Figma design JSON that will create a beautiful, mobile-friendly UI layout.

The design should follow modern mobile design principles:
- Proper visual hierarchy with clear typography
- Consistent spacing and alignment
- Mobile-first responsive layout (320-375px width)
- Wedding-themed color palette
- Clean, professional appearance

Component List:
${JSON.stringify(componentList, null, 2)}

Please convert this into a Figma-compatible JSON structure with the following specifications:

{
  "name": "Main Frame Name",
  "width": 375,
  "height": number (calculated based on content),
  "backgroundColor": "#FFFFFF",
  "layoutMode": "VERTICAL",
  "primaryAxisAlignItems": "MIN",
  "counterAxisAlignItems": "MIN",
  "itemSpacing": 16,
  "paddingLeft": 24,
  "paddingRight": 24,
  "paddingTop": 24,
  "paddingBottom": 24,
  "children": [
    {
      "type": "text|frame|rectangle|ellipse",
      "name": "Element Name",
      "content": "Text content (for text type)",
      "width": number,
      "height": number,
      "x": number,
      "y": number,
      "backgroundColor": "#colorcode",
      "fontSize": number (for text elements),
      "textAlign": "LEFT|CENTER|RIGHT",
      "layoutMode": "VERTICAL" (for frame containers),
      "itemSpacing": number (for frame containers),
      "paddingLeft": number,
      "paddingRight": number,
      "paddingTop": number,
      "paddingBottom": number,
      "children": [child elements array]
    }
  ]
}

Design Guidelines:
- Use wedding-themed colors: #FF6B9D (soft pink), #FF8A80 (coral), #F8F9FA (light gray), #FFFFFF (white), #6C757D (text gray)
- Ensure proper spacing between elements (16px minimum)
- Group related elements in frame containers
- Use appropriate font sizes (16px for body text, 20px+ for headers)
- Create a logical visual hierarchy

Return only valid JSON without any additional text or markdown formatting.`;
        const designJsonResponse = await callOpenAI(apiKey, step2Prompt);
        let designData;
        try {
          let cleanedResponse = designJsonResponse.trim();
          cleanedResponse = cleanedResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
          console.log("\uC815\uB9AC\uB41C \uB514\uC790\uC778 \uC751\uB2F5:", cleanedResponse);
          designData = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.error("\uB514\uC790\uC778 JSON \uD30C\uC2F1 \uC624\uB958:", parseError);
          console.log("\uD30C\uC2F1 \uC2E4\uD328\uD55C \uB514\uC790\uC778 \uC751\uB2F5:", designJsonResponse);
          const jsonMatch = designJsonResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              designData = JSON.parse(jsonMatch[0]);
              console.log("\uB514\uC790\uC778 JSON \uCD94\uCD9C \uC131\uACF5:", designData);
            } catch (extractError) {
              console.error("\uB514\uC790\uC778 JSON \uCD94\uCD9C \uD6C4 \uD30C\uC2F1 \uC2E4\uD328:", extractError);
              throw new Error("\uB514\uC790\uC778 JSON\uC744 \uD30C\uC2F1\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
            }
          } else {
            throw new Error("\uB514\uC790\uC778 JSON\uC744 \uD30C\uC2F1\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
          }
        }
        try {
          console.log("Figma \uCEF4\uD3EC\uB10C\uD2B8 \uC0DD\uC131 \uC2DC\uC791:", designData);
          const result = await createFigmaComponent(designData);
          console.log("Figma \uCEF4\uD3EC\uB10C\uD2B8 \uC0DD\uC131 \uC644\uB8CC:", result);
        } catch (error) {
          console.error("Figma \uCEF4\uD3EC\uB10C\uD2B8 \uC0DD\uC131 \uC624\uB958:", error);
          console.error("\uC624\uB958 \uC2A4\uD0DD:", error.stack);
          throw new Error(`Figma \uCEF4\uD3EC\uB10C\uD2B8 \uC0DD\uC131 \uC2E4\uD328: ${error.message}`);
        }
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
