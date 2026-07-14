import {
  patchRequest,
} from "../../utils/helpers/common/http-methods";

export const Users_APIS = {
  updateProfile: (body: any) => patchRequest("/v1/users", body),
};
