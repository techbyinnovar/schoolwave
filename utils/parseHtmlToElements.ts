import { Element, ElementType } from '../types/email';

// Utility to parse inline CSS string to object
function parseStyleString(style: string): Record<string, string> {
  return style.split(';').reduce((acc, rule) => {
    const [key, value] = rule.split(':');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {} as Record<string, string>);
}

// Main parser
export function parseElementsFromHtml(html: string): Element[] {
  if (!html) return [];

  // DOMParser is only available in the browser
  if (typeof window === 'undefined' || !window.DOMParser) return [];

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const mainTable = doc.querySelector('table.main-table');
  if (!mainTable) return [];

  const elements: Element[] = [];
  let idCounter = 0;

  // Helper to parse a <td> as a column (array of child elements)
  function parseTd(td: HTMLElement): Element[] {
    const children: Element[] = [];
    let style = td.getAttribute('style') || '';
    let styles = parseStyleString(style);

    // 1. If <td> contains direct <tr> children, treat each as a separate element
    const directTrs = Array.from(td.children).filter((child): child is HTMLTableRowElement => child.tagName === 'TR');
    if (directTrs.length > 0) {
      directTrs.forEach((tr) => {
        const tds = (tr as HTMLTableRowElement).querySelectorAll('td');
        tds.forEach((nestedTd) => {
          children.push(...parseTd(nestedTd as HTMLElement));
        });
      });
      return children;
    }

    // 2. If the td contains a nested table, treat each nested <tr> as a separate element
    const nestedTable = td.querySelector('table');
    if (nestedTable) {
      nestedTable.querySelectorAll('tr').forEach((nestedRow) => {
        const nestedTds = nestedRow.querySelectorAll('td');
        nestedTds.forEach((nestedTd) => {
          children.push(...parseTd(nestedTd));
        });
      });
      return children;
    }

    // 3. Otherwise, treat the td itself as a single element
    let type: ElementType = 'text';
    let content = td.innerHTML.trim();
    if (td.querySelector('a')) {
      type = 'button';
      const a = td.querySelector('a');
      if (a) content = a.textContent || '';
    } else if (td.querySelector('img')) {
      type = 'image';
      const img = td.querySelector('img');
      if (img) content = img.getAttribute('src') || '';
    } else if (td.querySelector('hr')) {
      type = 'divider';
      content = '';
    } else if (styles.height && !td.textContent?.trim()) {
      type = 'spacer';
      content = '';
    } else if (styles.fontWeight === 'bold' || parseInt(styles.fontSize || '', 10) >= 20) {
      type = 'heading';
      content = td.textContent || '';
    } else {
      // Default: text
      content = td.innerHTML.replace(/<br\s*\/?>(\n)?/g, '\n');
    }
    children.push({
      id: `element-${Date.now()}-${idCounter++}`,
      type,
      content,
      styles,
    });
    return children;
  }

  // Find all top-level <tr> elements, directly under <table> or inside a <tbody>
  let rowElements: HTMLTableRowElement[] = [];
  Array.from(mainTable.children).forEach((child) => {
    if (child.tagName === 'TR') {
      rowElements.push(child as HTMLTableRowElement);
    } else if (child.tagName === 'TBODY') {
      rowElements.push(...Array.from(child.children).filter((grandchild): grandchild is HTMLTableRowElement => grandchild.tagName === 'TR'));
    }
  });
  rowElements.forEach((row) => {
    const tds = row.querySelectorAll('td');
    if (!tds.length) return;
    // Parse each <td> as a column (array of child elements)
    const columns: Element[][] = [];
    tds.forEach((td) => {
      columns.push(parseTd(td as HTMLTableCellElement));
    });
    // Collect row styles (from <tr> or first <td>)
    const rowStyle = row.getAttribute('style') || tds[0].getAttribute('style') || '';
    const rowStyles = parseStyleString(rowStyle);
    elements.push({
      id: `element-${Date.now()}-${idCounter++}`,
      type: 'row',
      content: '',
      styles: rowStyles,
      columns,
    });
  });

  return elements;
}

