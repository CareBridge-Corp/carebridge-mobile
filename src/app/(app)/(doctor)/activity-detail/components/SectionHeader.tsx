import { SectionHeader as UiSectionHeader } from "../../../../../shared/components/ui";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return <UiSectionHeader title={title} />;
}
