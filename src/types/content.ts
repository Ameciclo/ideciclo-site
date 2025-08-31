export interface Section {
  title: string;
  content: string[];
}

export interface Organization {
  name: string;
  description: string;
  logo: string;
}

export interface InfoCard {
  title: string;
  subtitle: string;
  metric: string;
  value: string;
  buttonText: string;
  downloadUrl: string;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: string[];
  list?: string[];
  footer?: string;
  subtitle?: string;
  detailedList?: {
    title: string;
    description: string;
  }[];
  hasButton?: boolean;
}