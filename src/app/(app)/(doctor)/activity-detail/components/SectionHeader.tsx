import { SectionHeader as UiSectionHeader } from "../../../../../shared/components/ui";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return <UiSectionHeader title={title} subtitle={subtitle} />;
}
