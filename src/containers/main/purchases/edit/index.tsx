// The create container reads `useParams().id` and switches into edit mode
// automatically, so we simply re-export it here to keep routing semantics
// consistent with the rest of the app (separate create/edit route entries).
export { default } from "../create";
