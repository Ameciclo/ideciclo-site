/// <reference types="vite/client" />

declare module "html2pdf.js" {
  interface Html2PdfBuilder {
    set(options: Record<string, unknown>): Html2PdfBuilder;
    from(element: HTMLElement): Html2PdfBuilder;
    save(): Promise<void>;
  }

  interface Html2PdfStatic {
    (): Html2PdfBuilder;
  }

  const html2pdf: Html2PdfStatic;
  export default html2pdf;
}
