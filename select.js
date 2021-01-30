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
    const newSelectedOption = this.options.find((option) => {
      return option.value === value;
    });
    const prevSelectedOption = this.selectedOption;
    prevSelectedOption.selected = false;
    prevSelectedOption.element.selected = false;

    newSelectedOption.selected = true;
    newSelectedOption.element.selected = true;

    this.labelElement.innerText = newSelectedOption.label;
    this.optionsCustomElement
      .querySelector(`[data-value="${prevSelectedOption.value}"]`)
      .classList.remove("selected");
    const newCustomElement = this.optionsCustomElement.querySelector(
      `[data-value="${newSelectedOption.value}"]`
    );
    newCustomElement.classList.add("selected");
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

    // (27:11)
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

  select.customElement.addEventListener("blur", () => {
    select.optionsCustomElement.classList.remove("show");
  });

  let debounceTimeout;
  let searchTerm = "";
  select.customElement.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "Space":
        select.optionsCustomElement.classList.toggle("show");
        break;
      case "ArrowUp": {
        const prevOption = select.options[select.selectedOptionIndex - 1];
        if (prevOption) {
          select.selectValue(prevOption.value);
        }
        break;
      }
      case "ArrowDown": {
        const nextOption = select.options[select.selectedOptionIndex + 1];
        if (nextOption) {
          select.selectValue(nextOption.value);
        }
        break;
      }
      case "Enter":
      case "Escape":
        select.optionsCustomElement.classList.remove("show");
        break;
      default: {
        clearTimeout(debounceTimeout);
        searchTerm += e.key;
        debounceTimeout = setTimeout(() => {
          searchTerm = "";
        }, 500);

        const searchedOption = select.options.find((option) => {
          return option.label.toLowerCase().startsWith(searchTerm);
        });
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
