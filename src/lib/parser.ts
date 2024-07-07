/**
 * List of HTML tags that we want to ignore when finding the top level readable elements
 * These elements should not be chosen while rendering the hover player
 */
const IGNORE_LIST = [
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BUTTON",
  "LABEL",
  "SPAN",
  "IMG",
  "PRE",
  "SCRIPT",
];

/**
 *  **TBD:**
 *  Implement a function that returns all the top level readable elements on the page, keeping in mind the ignore list.
 *  Start Parsing inside the body element of the HTMLPage.
 *  A top level readable element is defined as follows:
 *      1. The text node contained in the element should not be empty
 *      2. The element should not be in the ignore list
 *      3. The element should not be a child of another element that has only one child.
 *            For example: <div><blockquote>Some text here</blockquote></div>. div is the top level readable element and not blockquote
 *      4. A top level readable element should not contain another top level readable element.
 *            For example: Consider the following HTML document:
 *            <body>
 *              <div id="root"></div>
 *              <div id="content-1">
 *                <article>
 *                  <header>
 *                    <h1 id="title">An Interesting HTML Document</h1>
 *                    <span>
 *                      <address id="test">John Doe</address>
 *                    </span>
 *                  </header>
 *                  <section></section>
 *                </article>
 *              </div>
 *            </body>;
 *            In this case, #content-1 should not be considered as a top level readable element.
 */
export function getTopLevelReadableElementsOnPage(): HTMLElement[] {
  const bodyElem = window.document.body;
  let allElements: HTMLElement[] = [];

  const result = checkIfValidReadableElement(bodyElem, allElements);
  allElements = result.elementsList;
  return allElements;
}

type ValidElementTypes =  {
  elementsList: HTMLElement[];
  childTopLevelElementExists: boolean
}

const checkIfValidReadableElement = (
  parentElement: HTMLElement,
  allElements: HTMLElement[],
): ValidElementTypes => {
  let elementsList: HTMLElement[] = [...allElements];
  let childTopLevelElementExists = false;
  const allChildren = parentElement.children;

  for (let index = 0; index < allChildren.length; index++) {
    const element: HTMLElement = allChildren[index];

    // case 2: check text node should not be empty
    const elementText = element.textContent;
    if (!elementText || !elementText.trim()) {
      continue;
    }

    // case 4:  A top level readable element should not contain another top level readable element.
    const result = checkIfValidReadableElement(element, elementsList);
    elementsList = result.elementsList;
    childTopLevelElementExists = result.childTopLevelElementExists
      ? result.childTopLevelElementExists
      : childTopLevelElementExists;
    if (
      result.childTopLevelElementExists
    ) {
      continue;
    }
    
    // case 1: check ignore list if this element exists there
    const elementName = element.tagName;
    if (IGNORE_LIST.includes(elementName.toUpperCase())) {
      continue;
    }

    // case 3: The element should not be a child of another element that has only one child.
    if (allChildren.length <= 1) {
      continue;
    }

    childTopLevelElementExists = true;
    elementsList.push(element);
  }

  return { elementsList, childTopLevelElementExists };
};