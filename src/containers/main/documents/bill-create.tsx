import DocumentCreate from "./create";
import { DocumentType } from "@/utils/helpers/models/documents/document.dto";

export default function BillCreate() {
  return <DocumentCreate type={DocumentType.BILL} />;
}
