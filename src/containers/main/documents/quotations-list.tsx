import DocumentsListing from "./listing";
import { DocumentType } from "@/utils/helpers/models/documents/document.dto";

export default function QuotationsList() {
  return <DocumentsListing type={DocumentType.QUOTATION} />;
}
