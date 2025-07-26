// Figma 플러그인 UI JavaScript
// 버튼 클릭 이벤트와 메시지 통신을 처리합니다

console.log("UI 스크립트 시작됨");

// 즉시 실행되는 테스트
console.log("즉시 실행 테스트");

// 간단한 초기화 함수
function initPlugin() {
  console.log('플러그인 초기화 시작...');
  
  // 요소 찾기
  const apiKeyInput = document.getElementById('apiKey');
  const authButton = document.getElementById('authButton');
  const verifyStatus = document.getElementById('verifyStatus');
  const authStatus = document.getElementById('authStatus');
  const planInput = document.getElementById('planInput');
  const generateBtn = document.getElementById('generateBtn');
  const generationStatus = document.getElementById('generationStatus');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const messageLog = document.getElementById('messageLog');
  
  console.log('요소 찾기 결과:', {
    apiKeyInput: !!apiKeyInput,
    authButton: !!authButton,
    verifyStatus: !!verifyStatus,
    authStatus: !!authStatus
  });
  
  if (!authButton) {
    console.error('authButton을 찾을 수 없습니다!');
    return;
  }
  
  // 인증 버튼 이벤트 등록
  console.log('인증 버튼 이벤트 등록...');
  authButton.onclick = function() {
    console.log("인증 버튼 클릭됨!");
    alert('버튼이 클릭되었습니다!');
    
    const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
    console.log('API Key:', apiKey ? apiKey.substring(0, 10) + '...' : '없음');
    
    if (!apiKey) {
      if (authStatus) {
        authStatus.innerText = "❌ API Key를 입력해주세요.";
        authStatus.style.color = "red";
      }
      return;
    }
    
    if (!apiKey.startsWith("sk-")) {
      if (authStatus) {
        authStatus.innerText = "❌ API 키 형식이 올바르지 않습니다.";
        authStatus.style.color = "red";
      }
      return;
    }
    
    // 인증 처리
    if (authButton) {
      authButton.innerText = "인증 중...";
      authButton.disabled = true;
    }
    
    if (authStatus) {
      authStatus.innerText = "인증 중...";
      authStatus.style.color = "#f57c00";
    }
    
    // code.ts로 메시지 전송
    try {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'verify-api-key', 
          key: apiKey 
        } 
      }, '*');
      console.log('parent.postMessage 전송 완료');
    } catch (error) {
      console.error('메시지 전송 오류:', error);
    }
  };
  
     // 디자인 생성 버튼 이벤트 등록
   if (generateBtn) {
     console.log('디자인 생성 버튼 이벤트 등록...');
     generateBtn.onclick = function() {
       console.log("디자인 생성 버튼 클릭됨!");
       alert('디자인 생성 버튼이 클릭되었습니다!');
       
       const planText = planInput ? planInput.value.trim() : '';
       console.log('기획서 내용:', planText ? planText.substring(0, 50) + '...' : '없음');
       
       if (!planText) {
         if (generationStatus) {
           generationStatus.innerText = "기획서를 입력해주세요.";
           generationStatus.style.color = "red";
         }
         return;
       }
       
       // 디자인 생성 요청
       if (generationStatus) {
         generationStatus.innerText = "GPT 분석 중...";
         generationStatus.style.color = "#f57c00";
       }
       
       try {
         parent.postMessage({ 
           pluginMessage: { 
             type: 'start-generation', 
             payload: planText 
           } 
         }, '*');
         console.log('디자인 생성 요청 전송 완료');
       } catch (error) {
         console.error('디자인 생성 요청 오류:', error);
       }
     };
   }
   
   console.log('플러그인 초기화 완료!');
 }

// 더 강력한 초기화 방식
function forceInit() {
  console.log('강제 초기화 시도...');
  
  // DOM이 완전히 로드될 때까지 대기
  if (document.readyState === 'complete') {
    initPlugin();
  } else {
    window.addEventListener('load', initPlugin);
  }
  
  // 추가로 여러 타이밍에 시도
  setTimeout(initPlugin, 100);
  setTimeout(initPlugin, 500);
  setTimeout(initPlugin, 1000);
}

// 여러 방법으로 초기화 시도
document.addEventListener('DOMContentLoaded', forceInit);
window.addEventListener('load', forceInit);

// 즉시 실행도 시도
forceInit();

// 메시지 수신 처리
window.addEventListener('message', function(event) {
  const message = event.data.pluginMessage;
  if (message) {
    console.log('메시지 수신:', message);
    
    if (message.type === 'verify-success') {
      const authButton = document.getElementById('authButton');
      const authStatus = document.getElementById('authStatus');
      
      if (authButton) {
        authButton.innerText = "인증 완료";
        authButton.style.backgroundColor = "#4CAF50";
        authButton.disabled = false;
      }
      
      if (authStatus) {
        authStatus.innerText = "✅ 인증 완료되었습니다.";
        authStatus.style.color = "green";
      }
    }
    
         if (message.type === 'verify-fail') {
       const authButton = document.getElementById('authButton');
       const authStatus = document.getElementById('authStatus');
       
       if (authButton) {
         authButton.innerText = "API Key 인증";
         authButton.style.backgroundColor = "#ff6b6b";
         authButton.disabled = false;
       }
       
       if (authStatus) {
         authStatus.innerText = "❌ 인증 실패. 다시 시도해주세요.";
         authStatus.style.color = "red";
       }
     }
     
     if (message.type === 'generation-status') {
       const generationStatus = document.getElementById('generationStatus');
       
       if (generationStatus) {
         generationStatus.innerText = message.message;
         
         if (message.status === 'success') {
           generationStatus.style.color = "green";
         } else if (message.status === 'error') {
           generationStatus.style.color = "red";
         } else {
           generationStatus.style.color = "#f57c00";
         }
       }
     }
  }
}); 