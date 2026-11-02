import DocumentCreate from "./create";
import { DocumentType } from "@/utils/helpers/models/documents/document.dto";

export default function QuotationCreate() {
  return <DocumentCreate type={DocumentType.QUOTATION} />;
}
