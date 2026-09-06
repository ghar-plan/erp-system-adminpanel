import { Comments_APIS } from "@/libs/apis/comments.api";
import { Projects_APIS } from "@/libs/apis/projects.api";
import {
  confirmationPopup,
  errorToaster,
} from "@/utils/helpers/common/alert-service";

const useComments = () => {
  const getProjects = async (setData: Function) => {
    const response = await Projects_APIS.getAllWithoutPagination();
    const { status = false, data = [] } = response || {};
    setData(status && data ? data : []);
  };

  const getComments = async (
    projectId: string,
    setData: Function,
    queryParams: { offset?: number; limit?: number } = {},
    setTotalElements?: Function,
  ) => {
    const response = await Comments_APIS.getAll({ projectId, ...queryParams });
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total || data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getCommentsSilent = async (
    projectId: string,
    setData: Function,
    queryParams: { offset?: number; limit?: number } = {},
    setTotalElements?: Function,
  ) => {
    const response = await Comments_APIS.getAllSilent({ projectId, ...queryParams });
    const { status = false, data = [] } = response || {};
    if (!status || !data) return;
    setData(data);
    setTotalElements?.(response?.total || data.length);
  };

  const fetchCommentsPage = async (
    projectId: string,
    queryParams: { offset?: number; limit?: number } = {},
  ) => {
    const response = await Comments_APIS.getAllSilent({ projectId, ...queryParams });
    const { status = false, data = [] } = response || {};
    if (!status) return { data: [] as any[], total: 0 };
    return {
      data: Array.isArray(data) ? data : [],
      total: response?.total || data.length || 0,
    };
  };

  const addComment = async (projectId: string, message: string) => {
    const response = await Comments_APIS.create({ projectId, message });
    const { status = false, message: responseMessage = "", data } = response || {};
    if (status) return data || true;
    errorToaster(responseMessage || "Failed to add comment");
    return false;
  };

  const updateComment = async (id: string, message: string) => {
    const response = await Comments_APIS.update(id, { message });
    const { status = false, message: responseMessage = "" } = response || {};
    if (status) return true;
    errorToaster(responseMessage || "Failed to update comment");
    return false;
  };

  const deleteComment = async (id: string) => {
    const result = await confirmationPopup(
      "Delete comment",
      "This comment will be removed from the conversation.",
    );
    if (!result.isConfirmed) return false;
    const response = await Comments_APIS.delete(id);
    const { status = false, message: responseMessage = "" } = response || {};
    if (status) return true;
    errorToaster(responseMessage || "Failed to delete comment");
    return false;
  };

  return {
    getProjects,
    getComments,
    getCommentsSilent,
    fetchCommentsPage,
    addComment,
    updateComment,
    deleteComment,
  };
};

export default useComments;
