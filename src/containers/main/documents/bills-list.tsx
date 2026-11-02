import DocumentsListing from "./listing";
import { DocumentType } from "@/utils/helpers/models/documents/document.dto";

export default function BillsList() {
  return <DocumentsListing type={DocumentType.BILL} />;
}
