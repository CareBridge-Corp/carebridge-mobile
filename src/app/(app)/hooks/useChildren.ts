import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import { useChildrenStore } from "../store/childrenStore";

interface CreateChildData {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  region?: string;
}

export function useChildren() {
  const { setChildren, setLoading, setError } = useChildrenStore();

  return useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      setLoading(true);
      try {
        const response: any = await apiClient.get("/users/children");
        const children = response.children || [];
        setChildren(children);
        setLoading(false);
        return response;
      } catch (error: any) {
        setError(error.message || "Failed to fetch children");
        setLoading(false);
        throw error;
      }
    },
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();
  const { addChild, setError } = useChildrenStore();

  return useMutation({
    mutationFn: async (data: CreateChildData) => {
      const response: any = await apiClient.post("/users/children", data);
      return response;
    },
    onSuccess: (data) => {
      if (data && data.child) {
        addChild(data.child);
      }
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || "Failed to create child profile");
    },
  });
}
