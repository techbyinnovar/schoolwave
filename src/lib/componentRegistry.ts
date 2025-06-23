import {
  Text,
  Button,
  Img,
  Hr,
  Section,
  Container,
} from "@react-email/components";

export const componentRegistry: Record<string, React.FC<any>> = {
  text: Text,
  button: Button,
  img: Img,
  hr: Hr,
  section: Section,
  container: Container,
};
