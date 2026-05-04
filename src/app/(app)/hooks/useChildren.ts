import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import multipartApiClient from "../../../shared/api/multipartClient";
import { useChildrenStore } from "../store/childrenStore";

interface CreateChildData {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  region?: string;
  profilePicture?: string;
  birthCertificate?: string;
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
      const hasImages = !!data.profilePicture || !!data.birthCertificate;

      if (hasImages) {
        const formData = new FormData();
        formData.append("firstName", data.firstName);
        formData.append("lastName", data.lastName);
        formData.append("dob", data.dob);
        formData.append("gender", data.gender);
        if (data.region) formData.append("region", data.region);

        if (data.profilePicture) {
          const filename = data.profilePicture.split("/").pop() || "profile.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";
          formData.append("profilePicture", {
            uri: data.profilePicture,
            name: filename,
            type,
          } as any);
        }

        if (data.birthCertificate) {
          const filename = data.birthCertificate.split("/").pop() || "certificate.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";
          formData.append("birthCertificate", {
            uri: data.birthCertificate,
            name: filename,
            type,
          } as any);
        }

        const response: any = await multipartApiClient.post("/users/children", formData);
        return response;
      }

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
