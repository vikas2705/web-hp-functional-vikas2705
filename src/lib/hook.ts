import { useEffect, useState } from "react";

/**
 * Gets bounding boxes for an element. This is implemented for you
 */
export function getElementBounds(elem: HTMLElement) {
  const bounds = elem.getBoundingClientRect();
  const top = bounds.top + window.scrollY;
  const left = bounds.left + window.scrollX;

  return {
    x: left,
    y: top,
    top,
    left,
    width: bounds.width,
    height: bounds.height,
  };
}

/**
 * **TBD:** Implement a function that checks if a point is inside an element
 */
export function isPointInsideElement(
  coordinate: { x: number; y: number },
  element: HTMLElement
): boolean {
  const elementBounds = getElementBounds(element);
  const { x, y } = elementBounds;

  if (coordinate.x >= x && coordinate.x <= x+elementBounds.width && coordinate.y >= y && coordinate.y <= y+elementBounds.height) {
    return true;
  } 
  return false;
}

const convertHeightInPxlToNum = (heightInPxl: string): number => {
  if (!heightInPxl) {
    return 0;
  }

  return Number(heightInPxl.substring(0, heightInPxl.length - 2));
}

/**
 * **TBD:** Implement a function that returns the height of the first line of text in an element
 * We will later use this to size the HTML element that contains the hover player
 */
export function getLineHeightOfFirstLine(element: HTMLElement): number {
  let maxHeight = 0;

  /* calculate height of parent element*/
  const heightParentElem = window.getComputedStyle(element).lineHeight;
  const parentElementHeight = convertHeightInPxlToNum(heightParentElem);
  maxHeight = Math.max(parentElementHeight, maxHeight);

  // check if parent element has first line of text
  const firstText = element.childNodes[0].nodeValue?.trim()
  if (firstText) {
    return maxHeight;
  }
  
  const allChildren = element.children;

  for (let index = 0; index < allChildren.length; index++) {
    const childElement = allChildren[index];

    if (!childElement.children.length) {
      const heightInPx = window.getComputedStyle(childElement).lineHeight;
      const heightInNums = convertHeightInPxlToNum(heightInPx);
      maxHeight = Math.max(heightInNums, maxHeight);
        
      const firstText = childElement.childNodes[0].nodeValue?.trim();
      if (firstText) {
        return maxHeight;
      }
  } else {
      maxHeight = Math.max(getLineHeightOfFirstLine(childElement), maxHeight);
      const firstText = element.childNodes[0].nodeValue?.trim();

      if (firstText) {
        return maxHeight;
      }
    }
  }

  return maxHeight;
}

export type HoveredElementInfo = {
  element: HTMLElement;
  top: number;
  left: number;
  heightOfFirstLine: number;
};

/**
 * **TBD:** Implement a React hook to be used to help to render hover player
 * Return the absolute coordinates on where to render the hover player
 * Returns null when there is no active hovered paragraph
 * Note: If using global event listeners, attach them window instead of document to ensure tests pass
 */
export function useHoveredParagraphCoordinate(
  parsedElements: HTMLElement[]
): HoveredElementInfo | null {
  const [hoveredElement, setHoveredElement] =
    useState<HoveredElementInfo | null> (null);

  useEffect(() => {
    function handleCheckPosition(event: any) {
      const coordinate = {
        x: event.clientX + window.scrollX,
        y: event.clientY + window.scrollY,
      };
      parsedElements.forEach((parsedElement) => {
        const bounds = getElementBounds(parsedElement);
        const isPointInside = isPointInsideElement(coordinate, parsedElement);
        console.log({ isPointInside: isPointInside });

        if (isPointInside)
          setHoveredElement({
            element: parsedElement,
            top: bounds.top,
            left: bounds.left,
            heightOfFirstLine: getLineHeightOfFirstLine(parsedElement),
          });
      });
    }
    // bind the event listener on mousemove
    window.addEventListener("mousemove", handleCheckPosition);
    return () => {
      window.removeEventListener("mousemove", handleCheckPosition);
    };
  }, [parsedElements]);

  return hoveredElement;
}
