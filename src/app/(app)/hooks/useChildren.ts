import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import { useChildrenStore } from "../store/childrenStore";

interface CreateChildData {
  firstName: string;
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
        const response = await apiClient.get("/users/children");
        const children = response.data.children || [];
        setChildren(children);
        setLoading(false);
        return response.data;
      } catch (error: any) {
        setError(error.response?.data?.error || "Failed to fetch children");
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
      const response = await apiClient.post("/users/children", data);
      return response.data;
    },
    onSuccess: (data) => {
      addChild(data.child);
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || "Failed to create child profile");
    },
  });
}
