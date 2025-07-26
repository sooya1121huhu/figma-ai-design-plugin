// Figma AI Design Plugin
// 기획서를 입력받아 GPT로 분석하고 Figma 디자인을 생성하는 플러그인

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
            role: 'system',
            content: 'You are a UI/UX designer. Create simple, mobile-friendly UI components.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    throw error;
  }
}

// 기본 컴포넌트 생성 함수 (JSON 파싱 실패 시 사용)
function createDefaultComponents(section: {name: string, content: string}, startY: number): any[] {
  const components = [];
  
  switch (section.name) {
    case '헤더':
      components.push({
        name: 'Header Title',
        type: 'text',
        content: '웨딩홀 리뷰',
        width: 300,
        height: 40,
        x: 0,
        y: startY,
        backgroundColor: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'BOLD',
        textAlign: 'CENTER'
      });
      break;
      
    case '평점':
      components.push({
        name: 'Rating Container',
        type: 'frame',
        width: 320,
        height: 80,
        x: 0,
        y: startY,
        backgroundColor: '#F8F9FA',
        layoutMode: 'VERTICAL',
        itemSpacing: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 16,
        paddingBottom: 16,
        children: [
          {
            name: 'Rating Label',
            type: 'text',
            content: '평점을 선택해주세요',
            width: 288,
            height: 24,
            x: 16,
            y: startY + 16,
            backgroundColor: '#F8F9FA',
            fontSize: 16,
            fontWeight: 'BOLD',
            textAlign: 'LEFT'
          }
        ]
      });
      break;
      
    case '사진업로드':
      components.push({
        name: 'Photo Upload',
        type: 'rectangle',
        width: 320,
        height: 120,
        x: 0,
        y: startY,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderColor: '#E9ECEF',
        borderWidth: 2
      });
      break;
      
    case '텍스트입력':
      components.push({
        name: 'Text Input',
        type: 'rectangle',
        width: 320,
        height: 100,
        x: 0,
        y: startY,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderColor: '#E9ECEF',
        borderWidth: 1
      });
      break;
      
    case '버튼':
      components.push({
        name: 'Submit Button',
        type: 'rectangle',
        width: 320,
        height: 48,
        x: 0,
        y: startY,
        backgroundColor: '#FF6B9D',
        borderRadius: 24
      });
      break;
      
    default:
      components.push({
        name: 'Default Component',
        type: 'text',
        content: section.content || '컴포넌트',
        width: 300,
        height: 40,
        x: 0,
        y: startY,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'NORMAL',
        textAlign: 'LEFT'
      });
  }
  
  return components;
}

// 기획서를 섹션별로 분석하는 함수
function analyzePlanSections(planText: string): Array<{name: string, content: string}> {
  const sections = [];
  
  // 더 정교한 섹션 패턴 정의
  const sectionPatterns = [
    { 
      name: "헤더", 
      keywords: ["제목", "부제", "타이틀", "title", "subtitle"],
      priority: 1
    },
    { 
      name: "평점", 
      keywords: ["평점", "별점", "rating", "점수", "star", "별"],
      priority: 2
    },
    { 
      name: "사진업로드", 
      keywords: ["사진", "업로드", "이미지", "photo", "upload", "image"],
      priority: 3
    },
    { 
      name: "텍스트입력", 
      keywords: ["입력", "후기", "내용", "text", "input", "textarea", "리뷰"],
      priority: 4
    },
    { 
      name: "버튼", 
      keywords: ["버튼", "제출", "등록", "button", "submit", "확인"],
      priority: 5
    }
  ];
  
  // 각 섹션에 해당하는 내용 추출 (우선순위 순서대로)
  const sortedPatterns = sectionPatterns.sort((a, b) => a.priority - b.priority);
  
  for (const section of sortedPatterns) {
    const matchingLines = planText.split('\n').filter(line => 
      section.keywords.some(keyword => 
        line.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    if (matchingLines.length > 0) {
      sections.push({
        name: section.name,
        content: matchingLines.join('\n')
      });
    }
  }
  
  // 매칭되지 않은 내용이 있으면 "기타" 섹션으로 추가
  if (sections.length === 0) {
    sections.push({
      name: "전체",
      content: planText
    });
  }
  
  return sections;
}

// 각 섹션별로 디자인을 생성하는 함수
async function generateSectionDesign(apiKey: string, section: {name: string, content: string}, startY: number): Promise<any[]> {
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
    
    // 더 강력한 JSON 파싱
    let cleanedResponse = response.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/,(\s*[}\]])/g, '$1') // trailing comma 제거
      .trim();
    
    // JSON 배열 패턴 찾기
    const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      cleanedResponse = arrayMatch[0];
    }
    
    // 괄호 균형 확인
    const openBrackets = (cleanedResponse.match(/\[/g) || []).length;
    const closeBrackets = (cleanedResponse.match(/\]/g) || []).length;
    
    if (openBrackets !== closeBrackets) {
      console.log(`${section.name}: JSON 괄호 불균형, 기본 컴포넌트 생성`);
      return createDefaultComponents(section, startY);
    }
    
    const components = JSON.parse(cleanedResponse);
    
    // Y 위치 조정
    let currentY = startY;
    for (const component of components) {
      component.y = currentY;
      currentY += (component.height || 60) + 10; // 10px 간격
    }
    
    return components;
  } catch (error) {
    console.error(`${section.name} 섹션 생성 오류:`, error);
    return createDefaultComponents(section, startY);
  }
}

// Figma 컴포넌트 생성 함수
async function createFigmaComponent(designData: any, parent: SceneNode = figma.currentPage): Promise<FrameNode> {
  // 폰트 로드
  await loadFontWithFallback();
  
  // 메인 프레임 생성
  const frame = figma.createFrame();
  frame.name = designData.name || "Generated Design";
  frame.resize(designData.width || 375, designData.height || 600);
  frame.x = designData.x || 0;
  frame.y = designData.y || 0;
  
  // 배경색 설정
  if (designData.backgroundColor) {
    frame.fills = [{ type: 'SOLID', color: hexToRgb(designData.backgroundColor) }];
  }
  
  // Auto Layout 설정 (안전하게 설정)
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
      console.log('Auto Layout 설정 실패:', error);
    }
  }
  
  // 자식 요소들 생성
  if (designData.children && Array.isArray(designData.children)) {
    let yOffset = 0;
    for (const child of designData.children) {
      yOffset = await createChildNode(child, frame, yOffset);
    }
  }
  
  // 부모에 추가
  parent.appendChild(frame);
  
  return frame;
}

// 폰트 로드 함수 (fallback 포함)
async function loadFontWithFallback(): Promise<void> {
  const fonts = ['Inter', 'Roboto', 'Segoe UI', 'Arial'];
  
  for (const font of fonts) {
    try {
      await figma.loadFontAsync({ family: font, style: 'Regular' });
      await figma.loadFontAsync({ family: font, style: 'Bold' });
      console.log(`폰트 로드 성공: ${font}`);
      return;
    } catch (error) {
      console.log(`폰트 로드 실패: ${font}`);
    }
  }
  
  throw new Error('사용 가능한 폰트를 찾을 수 없습니다.');
}

// 자식 노드 생성 함수
async function createChildNode(childData: any, parent: FrameNode, yOffset: number = 0): Promise<number> {
  let node: SceneNode;
  let currentYOffset = yOffset;
  
  // 기본값 설정
  const width = childData.width || (childData.type === 'text' ? 300 : 400);
  const height = childData.height || (childData.type === 'text' ? 60 : 200);
  const x = childData.x || 0;
  const y = childData.y !== undefined ? childData.y : currentYOffset;
  
  // 노드 타입에 따라 생성
  switch (childData.type) {
          case 'text':
        const textNode = figma.createText();
        textNode.characters = childData.content || 'Sample Text';
        textNode.fontSize = childData.fontSize || 16;
        
        // fontWeight 설정을 안전하게 처리
        if (childData.fontWeight === 'BOLD') {
          try {
            textNode.fontWeight = 'Bold';
          } catch (error) {
            console.log('fontWeight 설정 실패:', error);
          }
        }
        
        // 텍스트 정렬 설정 (가능한 경우)
        try {
          if (childData.textAlign === 'CENTER') {
            textNode.textAlignHorizontal = 'CENTER';
          } else if (childData.textAlign === 'RIGHT') {
            textNode.textAlignHorizontal = 'RIGHT';
          } else {
            textNode.textAlignHorizontal = 'LEFT';
          }
        } catch (error) {
          console.log('텍스트 정렬 설정 실패:', error);
        }
        
        node = textNode;
        break;
      
          case 'frame':
        const frameNode = figma.createFrame();
        frameNode.name = childData.name || 'Frame';
        
        // Auto Layout 설정을 안전하게 처리
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
            console.log('Frame Auto Layout 설정 실패:', error);
          }
        }
        node = frameNode;
        break;
      
          case 'rectangle':
        const rectNode = figma.createRectangle();
        rectNode.name = childData.name || 'Rectangle';
        if (childData.borderRadius) {
          try {
            rectNode.cornerRadius = childData.borderRadius;
          } catch (error) {
            console.log('cornerRadius 설정 실패:', error);
          }
        }
        node = rectNode;
        break;
      
    case 'ellipse':
      const ellipseNode = figma.createEllipse();
      ellipseNode.name = childData.name || 'Ellipse';
      node = ellipseNode;
      break;
      
    case 'star':
      const starNode = figma.createStar();
      starNode.name = childData.name || 'Star';
      node = starNode;
      break;
      
    default:
      const defaultNode = figma.createRectangle();
      defaultNode.name = childData.name || 'Component';
      node = defaultNode;
  }
  
  // 공통 속성 설정
  node.resize(width, height);
  node.x = x;
  node.y = y;
  
  // 배경색 설정 (fills가 지원되는 노드 타입만)
  if (childData.backgroundColor && 'fills' in node) {
    try {
      node.fills = [{ type: 'SOLID', color: hexToRgb(childData.backgroundColor) }];
    } catch (error) {
      console.log('배경색 설정 실패:', error);
    }
  }
  
  // 테두리 설정 (strokes가 지원되는 노드 타입만)
  if (childData.borderColor && childData.borderWidth && 'strokes' in node) {
    try {
      node.strokes = [{ type: 'SOLID', color: hexToRgb(childData.borderColor) }];
      node.strokeWeight = childData.borderWidth;
    } catch (error) {
      console.log('테두리 설정 실패:', error);
    }
  }
  
  // 모서리 반경 설정 (cornerRadius가 지원되는 노드 타입만)
  if (childData.borderRadius && 'cornerRadius' in node) {
    try {
      node.cornerRadius = childData.borderRadius;
    } catch (error) {
      console.log('모서리 반경 설정 실패:', error);
    }
  }
  
  // 그림자 효과 추가 (effects가 지원되는 노드 타입만)
  if ('effects' in node && (childData.type === 'frame' || childData.type === 'rectangle')) {
    try {
      node.effects = [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.1 },
          offset: { x: 0, y: 2 },
          radius: 8,
          visible: true,
          blendMode: 'NORMAL'
        }
      ];
    } catch (error) {
      console.log('그림자 효과 설정 실패:', error);
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
  
  return y + height + 10; // 다음 요소의 Y 위치
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
      
      // 기획서를 섹션별로 분석
      const sections = analyzePlanSections(planText);
      console.log('분석된 섹션들:', sections);
      
      // 전체 디자인 데이터를 저장할 배열
      let allDesignData = [];
      let currentY = 0;
      
      // 각 섹션을 순차적으로 처리
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        figma.ui.postMessage({
          type: 'generation-status',
          message: `${section.name} 생성 중... (${i + 1}/${sections.length})`,
          status: 'processing'
        });
        
        // 각 섹션별로 디자인 생성
        const sectionDesign = await generateSectionDesign(apiKey, section, currentY);
        allDesignData = allDesignData.concat(sectionDesign);
        
        // 다음 섹션의 Y 위치 계산
        if (sectionDesign.length > 0) {
          const lastElement = sectionDesign[sectionDesign.length - 1];
          currentY = lastElement.y + lastElement.height + 20; // 20px 간격
        }
      }
      
      // 전체 디자인을 하나의 프레임으로 생성
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
      
      // Figma에 디자인 생성
      figma.ui.postMessage({
        type: 'generation-status',
        message: 'Figma 컴포넌트 생성 중...',
        status: 'processing'
      });
      
      await createFigmaComponent(mainFrame);
      
      figma.ui.postMessage({
        type: 'generation-status',
        message: '✅ 완료되었습니다!',
        status: 'success'
      });
      
    } catch (error) {
      console.error('디자인 생성 오류:', error);
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