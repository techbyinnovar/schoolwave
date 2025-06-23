import { Html, Head, Body } from "@react-email/components";
import { componentRegistry } from "../lib/componentRegistry";

export interface EmailRendererProps {
  blocks: Array<{ type: string; props: Record<string, any> }>;
}

export function EmailRenderer({ blocks }: EmailRendererProps) {
  return (
    <Html>
      <Head />
      <Body>
        {blocks.map((block, idx) => {
          const Component = componentRegistry[block.type];
          if (!Component) return null;
          return <Component key={idx} {...block.props} />;
        })}
      </Body>
    </Html>
  );
}
