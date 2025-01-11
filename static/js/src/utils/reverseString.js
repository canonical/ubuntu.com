export function reverseString(contentString) {
  var splitContent = contentString.split("");
  var reverseArray = splitContent.reverse();
  var reversedString = reverseArray.join("");
  return reversedString;
}
