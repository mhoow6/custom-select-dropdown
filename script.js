// select.js에서 Select 클래스를 import
import Select from "./select.js";

// data-custom 속성을 가진 element들을 가져와 selectElements에 저장
// selectElements의 타입은 NodeList(배열)
const selectElements = document.querySelectorAll("[data-custom]");

// selectElements의 각 배열요소마다 익명함수를 적용시킴
// selectElement가 아닌 다른 이름으로 해도 아무 상관없음
selectElements.forEach((selectElement) => {
  new Select(selectElement);
});
