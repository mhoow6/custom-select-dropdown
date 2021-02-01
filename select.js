// export default라는 문법은 해당 모듈엔 개체 하나만 있다는 사실을 명확하게 나타냄
// default를 안 붙이면, 모듈을 내볼때 import {Select} 이런식으로 해야함
export default class Select {
  // Node(element) 객체를 받아와 Select 객체에 담음
  constructor(element) {
    this.element = element;
    this.options = getFormattedOptions(element.querySelectorAll("option"));
    this.customElement = document.createElement("div");
    this.labelElement = document.createElement("span");
    this.optionsCustomElement = document.createElement("ul");
    setupCustomElement(this);
    element.style.display = "none"; // 바닐라 selectBox을 안 보이게 함
    element.after(this.customElement); // 바닐라 selectBox 다음에 커스텀한 selectBox를 배치
  }

  // get 구문은 객체의 property를 가져올때 호출되는 함수로 바인딩함
  get selectedOption() {
    // find() 메서드는 주어진 판별 함수를 만족하는 첫 번째 요소의 값을 반환
    // querySelectorAll("options")으로 가져온 this.options 배열에서
    // 각 객체 중 selected가 true인 조건(option.selected)의 첫 번째 요소(객체)를 가져옴
    return this.options.find((option) => option.selected);
  }

  get selectedOptionIndex() {
    return this.options.indexOf(this.selectedOption);
  }

  selectValue(value) {
    // this.options Array를 받아와 Element 중 value 인자로 넘어온
    // 값과 비교해서 일치한 값을 return해준다.
    const newSelectedOption = this.options.find((option) => {
      return option.value === value;
    });

    // 이전에 선택된 option 객체
    const prevSelectedOption = this.selectedOption;

    // 이전에 선택된 option 객체의 selected 속성을 false로
    // 이전에 선택된 option 객체 안에 있는 element 객체의 selected 속성도 false로
    prevSelectedOption.selected = false;
    prevSelectedOption.element.selected = false;

    // 현재 선택된 option 객체의 selected 속성을 false로
    // 현재 선택된 option 객체 안에 있는 element 객체의 selected 속성도 false로
    newSelectedOption.selected = true;
    newSelectedOption.element.selected = true;

    // 현재 선택된 option 객체의 label 속성을 labelElement의 텍스트로 함
    this.labelElement.innerText = newSelectedOption.label;

    // `data.."]` 와 같이 `(백틱)으로 묶은 문자열을 탬플릿 리터럴이라고 함
    // 주로 문자열안에 변수명을 넣어야할 경우 가독성을 위해 사용됨
    // 커스텀한 선택상자에서 data값이 이전에 선택된 값인 객체의
    // class에서 "selected"을 없앤다.
    this.optionsCustomElement
      .querySelector(`[data-value="${prevSelectedOption.value}"]`)
      .classList.remove("selected");

    // 커스텀한 선택상자에서 data값이 새로 선택된 값인 객체의
    // class에서 "selected"을 추가한다.
    const newCustomElement = this.optionsCustomElement.querySelector(
      `[data-value="${newSelectedOption.value}"]`
    );
    newCustomElement.classList.add("selected");

    // scrollIntoView 메소드는 스크롤 할 때 화면이 수직으로 정렬될 위치를 결정함
    // block: nearest의 경우 start와 end를 혼합한 속성이라 보면 됌
    newCustomElement.scrollIntoView({ block: "nearest" });
  }
}

function setupCustomElement(select) {
  // Select 객체에서 생성된 customElement(div)에 "custom-select-container" class 추가
  select.customElement.classList.add("custom-select-container");

  // tabindex 전역 특성은 요소가 포커스 가능함을 나타냄
  // 주로 Tab 키를 사용하는 연속적인 키보드 탐색에서 어느 순서에 위치할지 지정하는 용도
  select.customElement.tabIndex = 0;

  // Select 객체에서 생성된 labelElement(span)에 "custom-select-value" class 추가
  select.labelElement.classList.add("custom-select-value");

  // select 객체의 메소드 selectedOption를 통해 return한 객체에서 label 속성을 가져와
  // labelElement의 text 값으로 한다.
  select.labelElement.innerText = select.selectedOption.label;

  // customElement(div)에 labelElement(span)를 마지막 자식 뒤에 추가한다.
  select.customElement.append(select.labelElement);

  // Select 객체에서 생성된 optionsCustomElement(ul)에 "custom-select-options" class 추가
  select.optionsCustomElement.classList.add("custom-select-options");

  // Select 객체에서 생성된 options(배열)의 각 요소(객체)마다 수행
  select.options.forEach((option) => {
    const optionElement = document.createElement("li");

    // <option class="custom-select-option"></option>
    optionElement.classList.add("custom-select-option");

    // option.selected는 element가 선택되면 true 값으로 바뀜
    // toggle(token, true)일 경우 token은 추가만 될 뿐 제거되지는 않음
    // toggle(token, false)일 경우 token은 제거만 될 뿐 추가되지는 않음
    // -> 우리가 아는 toggle() 그대로 하는데, option.selected에 class가
    // toggle 되는 것을 결정하는 것
    optionElement.classList.toggle("selected", option.selected);

    // <option>option.label</option>
    optionElement.innerText = option.label;

    // <option data-value=option.value></option>
    optionElement.dataset.value = option.value;

    optionElement.addEventListener("click", () => {
      select.selectValue(option.value);
      select.optionsCustomElement.classList.remove("show");
    });

    // optionsCustomElement(ul)에 optionElement(li)를 마지막 자식 뒤에 추가한다.
    select.optionsCustomElement.append(optionElement);
  });

  select.customElement.append(select.optionsCustomElement);

  select.labelElement.addEventListener("click", () => {
    select.optionsCustomElement.classList.toggle("show");
  });

  // 선택 상자가 아닌 다른 곳에 마우스 클릭을 해서 포커스를 잃거나
  // Tab 키를 이용해서 포커스를 잃을 때 발생하는 이벤트
  select.customElement.addEventListener("blur", () => {
    select.optionsCustomElement.classList.remove("show");
  });

  let debounceTimeout;
  let searchTerm = "";

  // 키보드를 눌렀을 때 발생하는 이벤트
  select.customElement.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "Space":
        select.optionsCustomElement.classList.toggle("show");
        break;
      case "ArrowUp": {
        // options 배열에서
        // 현재 선택된 옵션 이전 인덱스의 option 객체
        const prevOption = select.options[select.selectedOptionIndex - 1];

        // 위 방향키를 눌러 prevOption이 됬을 경우
        if (prevOption) {
          // prevOption 객체의 값으로 지정
          select.selectValue(prevOption.value);
        }
        break;
      }
      case "ArrowDown": {
        // ArrowUp 케이스와 같은 논리
        const nextOption = select.options[select.selectedOptionIndex + 1];
        if (nextOption) {
          select.selectValue(nextOption.value);
        }
        break;
      }

      // Enter와 Esscape 같은 역할을 하고 싶어서 이어 붙임
      case "Enter":
      case "Escape":
        select.optionsCustomElement.classList.remove("show");
        break;
      default: {
        // clearTimeout은 일정시간 후 함수를 실행하는 함수
        clearTimeout(debounceTimeout);

        // 입력한 키보드 값을 저장해두는 곳
        searchTerm += e.key;

        // 자바스크립트에선 변수명에 함수를 저장하는 행위 가능
        // 0.5초가 흐르면 입력한 키보드 값이 초기화되도록 하는 함수 생성
        debounceTimeout = setTimeout(() => {
          searchTerm = "";
        }, 500);

        // 옵션의 텍스트를 소문자화해서 입력한 값과 비교한 것 중
        // 첫 번째 옵션을 가져옴
        const searchedOption = select.options.find((option) => {
          return option.label.toLowerCase().startsWith(searchTerm);
        });

        // 가져온 옵션을 선택상자의 값으로 지정
        if (searchedOption) {
          select.selectValue(searchedOption.value);
        }
      }
    }
  });
}

// 포맷된 optionElements(배열)을 return하는게 이 메소드의 목적
function getFormattedOptions(optionElements) {
  // [...elements]는 배열임을 알리기 위해 이렇게 표현함
  return [...optionElements].map((optionElement) => {
    // 배열의 각 객체를 안 쪽의 return 형태로 변형
    return {
      value: optionElement.value,
      label: optionElement.label,
      selected: optionElement.selected, // Boolean
      element: optionElement,
    };
  });
}
