// Figma 플러그인 메인 코드
// UI와의 메시지 통신을 처리하고 플러그인 기능을 구현합니다

figma.showUI(__html__, { width: 400, height: 500 });

// OpenAI API 호출 함수
async function callOpenAI(apiKey: string, prompt: string, model: string = 'gpt-4o'): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    throw error;
  }
}

// Figma 컴포넌트 생성 함수
async function createFigmaComponent(designData: any, parent: SceneNode = figma.currentPage): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = designData.name || 'Generated Component';
  frame.resize(designData.width || 400, designData.height || 300);
  frame.x = designData.x || 0;
  frame.y = designData.y || 0;
  
  // Auto Layout 적용
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisAlignItems = "MIN";
  frame.counterAxisAlignItems = "MIN";
  frame.itemSpacing = 16;
  frame.paddingLeft = 24;
  frame.paddingRight = 24;
  frame.paddingTop = 24;
  frame.paddingBottom = 24;
  
  if (designData.backgroundColor) {
    frame.fills = [{ type: 'SOLID', color: hexToRgb(designData.backgroundColor) }];
  }
  
  // 자식 요소들 생성
  if (designData.children && Array.isArray(designData.children)) {
    let yOffset = 0;
    for (const child of designData.children) {
      yOffset = await createChildNode(child, frame, yOffset);
    }
  }
  
  return frame;
}

// 폰트 로드 함수 (fallback 포함)
async function loadFontWithFallback(): Promise<void> {
  const fonts = [
    { family: "Inter", style: "Regular" },
    { family: "Roboto", style: "Regular" },
    { family: "Segoe UI", style: "Regular" },
    { family: "Arial", style: "Regular" }
  ];
  
  for (const font of fonts) {
    try {
      await figma.loadFontAsync(font);
      console.log(`폰트 로드 성공: ${font.family}`);
      return;
    } catch (error) {
      console.log(`폰트 로드 실패: ${font.family}`, error);
      continue;
    }
  }
  
  throw new Error('사용 가능한 폰트를 찾을 수 없습니다.');
}

// 자식 노드 생성 함수
async function createChildNode(childData: any, parent: FrameNode, yOffset: number = 0): Promise<number> {
  let node: SceneNode;
  let currentYOffset = yOffset;
  
  switch (childData.type) {
    case 'text':
      node = figma.createText();
      try {
        await loadFontWithFallback();
        (node as TextNode).characters = childData.content || '';
        (node as TextNode).fontSize = 16;
        (node as TextNode).textAlignHorizontal = "CENTER";
        (node as TextNode).textAlignVertical = "CENTER";
      } catch (error) {
        console.error('폰트 로드 실패:', error);
        // 기본 텍스트로 설정
        (node as TextNode).characters = childData.content || '';
      }
      break;
      
    case 'frame':
      node = figma.createFrame();
      // Auto Layout 적용 (frame 타입인 경우)
      (node as FrameNode).layoutMode = "VERTICAL";
      (node as FrameNode).primaryAxisAlignItems = "MIN";
      (node as FrameNode).counterAxisAlignItems = "MIN";
      (node as FrameNode).itemSpacing = 16;
      (node as FrameNode).paddingLeft = 24;
      (node as FrameNode).paddingRight = 24;
      (node as FrameNode).paddingTop = 24;
      (node as FrameNode).paddingBottom = 24;
      
      if (childData.backgroundColor) {
        node.fills = [{ type: 'SOLID', color: hexToRgb(childData.backgroundColor) }];
      }
      break;
      
    case 'rectangle':
      node = figma.createRectangle();
      if (childData.backgroundColor) {
        node.fills = [{ type: 'SOLID', color: hexToRgb(childData.backgroundColor) }];
      }
      break;
      
    case 'ellipse':
      node = figma.createEllipse();
      if (childData.backgroundColor) {
        node.fills = [{ type: 'SOLID', color: hexToRgb(childData.backgroundColor) }];
      }
      break;
      
    default:
      node = figma.createFrame();
  }
  
  // 기본 크기 설정
  let defaultWidth = 400;
  let defaultHeight = 200;
  
  if (childData.type === 'text') {
    defaultWidth = 300;
    defaultHeight = 60;
  }
  
  // 공통 속성 설정
  node.name = childData.name || 'Generated Element';
  node.resize(childData.width || defaultWidth, childData.height || defaultHeight);
  
  // 위치 설정 (x, y가 명시되지 않은 경우 자동 정렬)
  if (childData.x !== undefined) {
    node.x = childData.x;
  } else {
    node.x = 0;
  }
  
  if (childData.y !== undefined) {
    node.y = childData.y;
  } else {
    node.y = currentYOffset;
    currentYOffset += (childData.height || defaultHeight) + 16; // 16px 간격 (개선된 간격)
  }
  
  // Auto Layout 속성 설정 (frame인 경우)
  if (node.type === 'FRAME' && childData.layoutMode) {
    node.layoutMode = childData.layoutMode;
    if (childData.primaryAxisAlignItems) {
      node.primaryAxisAlignItems = childData.primaryAxisAlignItems;
    }
    if (childData.counterAxisAlignItems) {
      node.counterAxisAlignItems = childData.counterAxisAlignItems;
    }
    if (childData.itemSpacing !== undefined) {
      node.itemSpacing = childData.itemSpacing;
    }
    if (childData.paddingLeft !== undefined) {
      node.paddingLeft = childData.paddingLeft;
    }
    if (childData.paddingRight !== undefined) {
      node.paddingRight = childData.paddingRight;
    }
    if (childData.paddingTop !== undefined) {
      node.paddingTop = childData.paddingTop;
    }
    if (childData.paddingBottom !== undefined) {
      node.paddingBottom = childData.paddingBottom;
    }
  }
  
  // 부모에 추가
  parent.appendChild(node);
  
  // 재귀적으로 자식 요소들 생성
  if (childData.children && Array.isArray(childData.children)) {
    let childYOffset = 0;
    for (const grandChild of childData.children) {
      childYOffset = await createChildNode(grandChild, node as FrameNode, childYOffset);
    }
  }
  
  return currentYOffset;
}

// HEX 색상을 RGB로 변환하는 함수
function hexToRgb(hex: string): RGB {
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

// UI로부터 메시지를 받는 이벤트 리스너
figma.ui.onmessage = async (msg) => {
  console.log('code.ts: 메시지 수신됨:', msg);
  if (msg.type === 'hello-from-ui') {
    console.log('UI에서 받은 메시지:', msg.message);
    
    // UI로 응답 메시지 전송
    figma.ui.postMessage({
      type: 'response-from-code',
      message: 'Hello from Code! 메시지를 받았습니다.'
    });
  }
  
  if (msg.type === 'verify-api-key') {
    const apiKey = msg.key;
    console.log('code.ts: verify-api-key 메시지 수신됨');
    console.log('API Key 인증 요청 받음:', apiKey.substring(0, 10) + '...');
    
    // API Key 형식 검증
    if (apiKey.startsWith('sk-') || apiKey.startsWith('Bearer ')) {
      try {
        // Figma 환경에서는 실제 API 호출이 제한될 수 있으므로 형식만 검증
        console.log('API Key 형식 검증 성공');
        
        // API Key를 Figma 클라이언트 스토리지에 저장
        await figma.clientStorage.setAsync('openai-api-key', apiKey);
        console.log('OpenAI API Key가 성공적으로 저장되었습니다.');
        
        // UI에 성공 메시지 전송
        figma.ui.postMessage({
          type: 'verify-success'
        });
        
        console.log('인증 성공: 형식 검증 완료 (실제 API 호출은 생략)');
      } catch (error) {
        console.error('API Key 저장 중 오류:', error);
        
        // UI에 실패 메시지 전송
        figma.ui.postMessage({
          type: 'verify-fail'
        });
      }
    } else {
      console.log('잘못된 API Key 형식:', apiKey);
      
      // UI에 실패 메시지 전송
      figma.ui.postMessage({
        type: 'verify-fail'
      });
    }
  }
  
  if (msg.type === 'start-generation') {
    try {
      // 저장된 API Key 가져오기
      const apiKey = await figma.clientStorage.getAsync('openai-api-key');
      if (!apiKey) {
        figma.ui.postMessage({
          type: 'generation-status',
          message: '❌ API Key가 설정되지 않았습니다. 먼저 API Key를 인증해주세요.',
          status: 'error'
        });
        return;
      }
      
      const planText = msg.payload;
      
      // Step 1: 기획서를 컴포넌트 리스트로 파싱
      figma.ui.postMessage({
        type: 'generation-status',
        message: 'GPT 분석 중...',
        status: 'processing'
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
        // 응답 정리 (마크다운 코드 블록 제거)
        let cleanedResponse = componentListResponse.trim();
        
        // ```json과 ``` 제거
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        console.log('정리된 응답:', cleanedResponse);
        
        // JSON 파싱 시도
        componentList = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('컴포넌트 리스트 파싱 오류:', parseError);
        console.log('파싱 실패한 응답:', componentListResponse);
        
        // JSON 추출 시도 (더 강력한 정규식)
        const jsonMatch = componentListResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            componentList = JSON.parse(jsonMatch[0]);
            console.log('JSON 추출 성공:', componentList);
          } catch (extractError) {
            console.error('JSON 추출 후 파싱 실패:', extractError);
            throw new Error('컴포넌트 리스트를 파싱할 수 없습니다.');
          }
        } else {
          throw new Error('컴포넌트 리스트를 파싱할 수 없습니다.');
        }
      }
      
      // Step 2: 컴포넌트 리스트를 Figma 디자인 JSON으로 변환
      figma.ui.postMessage({
        type: 'generation-status',
        message: '디자인 생성 중...',
        status: 'processing'
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
        // 응답 정리 (마크다운 코드 블록 제거)
        let cleanedResponse = designJsonResponse.trim();
        
        // ```json과 ``` 제거
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        console.log('정리된 디자인 응답:', cleanedResponse);
        
        // JSON 파싱 시도
        designData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('디자인 JSON 파싱 오류:', parseError);
        console.log('파싱 실패한 디자인 응답:', designJsonResponse);
        
        // JSON 추출 시도 (더 강력한 정규식)
        const jsonMatch = designJsonResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            designData = JSON.parse(jsonMatch[0]);
            console.log('디자인 JSON 추출 성공:', designData);
          } catch (extractError) {
            console.error('디자인 JSON 추출 후 파싱 실패:', extractError);
            throw new Error('디자인 JSON을 파싱할 수 없습니다.');
          }
        } else {
          throw new Error('디자인 JSON을 파싱할 수 없습니다.');
        }
      }
      
      // Step 3: Figma 캔버스에 컴포넌트 생성
      try {
        console.log('Figma 컴포넌트 생성 시작:', designData);
        const result = await createFigmaComponent(designData);
        console.log('Figma 컴포넌트 생성 완료:', result);
      } catch (error) {
        console.error('Figma 컴포넌트 생성 오류:', error);
        console.error('오류 스택:', error.stack);
        throw new Error(`Figma 컴포넌트 생성 실패: ${error.message}`);
      }
      
      // 성공 메시지 전송
      figma.ui.postMessage({
        type: 'generation-status',
        message: '✅ 완료되었습니다!',
        status: 'success'
      });
      
    } catch (error) {
      console.error('디자인 생성 오류:', error);
      
      // 오류 메시지 전송
      figma.ui.postMessage({
        type: 'generation-status',
        message: `❌ 오류가 발생했습니다: ${error.message}`,
        status: 'error'
      });
    }
  }
};

// 플러그인이 시작될 때 실행되는 코드
console.log('Figma AI Design Plugin이 시작되었습니다.'); 