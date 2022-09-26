export default function createEl(tagName, classNamesArr, innerContent, parentNode, ...attributes) {
  const element = document.createElement(tagName);

  if (classNamesArr) {
    if (Array.isArray(classNamesArr)) {
      classNamesArr.forEach((className) => element.classList.add(className));
    } else if (typeof classNamesArr === 'string') {
      element.classList.add(`${classNamesArr}`);
    }
  }

  if (innerContent) {
    if (Array.isArray(innerContent)) {
      innerContent.forEach((child) => element.append(child));
    } else if (typeof innerContent === 'object') {
      element.append(innerContent);
    } else if (typeof innerContent === 'string') {
      element.innerHTML = innerContent;
    }
  }

  if (attributes.length) {
    attributes.forEach(([attrName, attrValue]) => {
      if (attrValue) {
        if (attrName === 'code') {
          element.dataset[attrName] = attrValue;
        } else {
          element.setAttribute(attrName, attrValue);
        }
      } else {
        element.setAttribute(attrName, '');
      }
    });
  }

  if (parentNode) parentNode.append(element);

  return element;
}
