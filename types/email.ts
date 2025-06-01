export type ElementType = 'text' | 'heading' | 'button' | 'image' | 'divider' | 'spacer' | 'row';

export interface Element {
  id: string;
  type: ElementType;
  content: string;
  styles: Record<string, string>;
  // For row elements only: columns is an array (length = number of columns), each column is an array of elements
  columns?: Element[][];
}