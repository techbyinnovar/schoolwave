import { Element } from '../../types/email';

export const generateHTML = (elements: Element[]): string => {
  if (elements.length === 0) {
    return '';
  }

  const doctype = '<!DOCTYPE html>';
  const head = `
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>`;

  const elementsHTML = elements.map(element => {
    return generateElementHTML(element);
  }).join('\n');

  const body = `<body style="margin:0; padding:0; font-family: Arial, sans-serif; line-height:1.4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:100%;">
    <tr>
      <td style="padding:0;">
        <table class="main-table" align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; border-collapse:collapse; width:600px;">
          ${elementsHTML}
        </table>
      </td>
    </tr>
  </table>
</body>`;

  return `${doctype}
<html lang="en">
${head}
${body}
</html>`;
};

const generateElementHTML = (element: Element): string => {
  const { type, content, styles } = element;
  // Convert all style keys to kebab-case for email compatibility
  function camelToKebab(str: string) {
    return str.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
  }
  // Only output kebab-case properties, avoid duplicates
  const seen = new Set<string>();
  let stylesString = Object.entries(styles)
    .map(([key, value]) => {
      const kebabKey = camelToKebab(key);
      if (seen.has(kebabKey)) return '';
      seen.add(kebabKey);
      return `${kebabKey}: ${value};`;
    })
    .filter(Boolean)
    .join(' ');
  // For robustness, ensure background-color and color are present in kebab-case
  if (!/background-color:/i.test(stylesString) && styles.backgroundColor) {
    stylesString += ` background-color: ${styles.backgroundColor};`;
  }
  if (!/color:/i.test(stylesString) && styles.color) {
    stylesString += ` color: ${styles.color};`;
  }

  switch (type) {
    case 'row': {
      // Render a <tr> with <td>s for each column, and generate HTML for each child element
      const colHtml = (element.columns || []).map(col => {
        const childrenHtml = col.map(child => generateElementHTML(child)).join('');
        return `<td style="vertical-align:top; padding:0 8px;">${childrenHtml}</td>`;
      }).join('');
      return `<tr>${colHtml}</tr>`;
    }
    case 'text':
      return `<tr><td style="${stylesString}">${content.replace(/\n/g, '<br>')}</td></tr>`;
    
    case 'heading':
      return `<tr><td style="${stylesString}">${content}</td></tr>`;
    
    case 'button': {
      // Extra robust: set background-color and color on both td and a
      const tdStyle = `text-align: ${styles.textAlign || 'center'}; padding: ${styles.padding || '16px'}; background-color: ${styles.backgroundColor || '#0066CC'};`;
      const aStyle = `display: inline-block; ${stylesString} text-decoration: none; background-color: ${styles.backgroundColor || '#0066CC'}; color: ${styles.color || '#ffffff'};`;
      return `
<tr>
  <td style="${tdStyle}">
    <a href="#" style="${aStyle}">${content}</a>
  </td>
</tr>`;
    }
    case 'image':
      return `
<tr>
  <td style="text-align: ${styles.textAlign || 'center'}; padding: ${styles.padding || '16px'}; background-color: ${styles.backgroundColor || '#ffffff'};">
    <img src="${content}" alt="Email image" style="max-width: 100%;" />
  </td>
</tr>`;
    
    case 'divider':
      return `<tr><td style="${stylesString}"><hr style="border: none; ${styles.borderTop || 'border-top: 1px solid #E5E5EA;'} margin: 0;" /></td></tr>`;
    
    case 'spacer':
      return `<tr><td style="height: ${styles.height || '32px'}; background-color: ${styles.backgroundColor || '#ffffff'};"></td></tr>`;
    
    default:
      return '';
  }
};