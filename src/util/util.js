export default (() => {
  const getTopToBody = (obj) => {
    let value = 0;
    if (obj.offsetParent) {
      do {
        value += obj.offsetTop;
      } while ((obj = obj.offsetParent));
    }
    return value;
  };
  const getLeftToBody = (obj) => {
    let value = 0;
    if (obj.offsetParent) {
      do {
        value += obj.offsetLeft;
      } while ((obj = obj.offsetParent));
    }
    return value;
  };
  const insertAfter = (newElement, targetElement) => {
    let parent = targetElement.parentNode;
    if (parent.lastchild === targetElement) {
      parent.appendChild(newElement);
    } else {
      parent.insertBefore(newElement, targetElement.nextSibling);
    }
  };
  return {
    getTopToBody,
    getLeftToBody,
    insertAfter,
  };
})();
