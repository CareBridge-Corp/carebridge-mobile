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

        console.log("Fetched children data:", children);
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
      // 1. Create Child Record
      const childData = {
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        gender: data.gender,
        region: data.region,
      };

      const response: any = await apiClient.post("/users/children", childData);

      const childId =
        response.data?.childId || response.childId || response.child?.childId;

      if (!childId) {
        throw new Error("Failed to get child ID from server response");
      }

      // 2. Upload Profile Picture
      if (data.profilePicture) {
        const formData = new FormData();
        const filename = data.profilePicture.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("image", {
          uri: data.profilePicture,
          name: filename,
          type,
        } as any);

        await multipartApiClient.post(
          `/users/children/${childId}/profile-picture`,
          formData,
        );
      }

      // 3. Upload Birth Certificate if applicable
      if (data.birthCertificate) {
        const formData = new FormData();
        const filename =
          data.birthCertificate.split("/").pop() || "certificate.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("file", {
          uri: data.birthCertificate,
          name: filename,
          type,
        } as any);

        // Assuming similar endpoint for birth certificate
        try {
          await multipartApiClient.post(
            `/users/children/${childId}/birth-certificate`,
            formData,
          );
        } catch (err) {
          console.log("Birth certificate upload failed", err);
        }
      }

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

export function useDeleteChild() {
  const queryClient = useQueryClient();
  const { removeChild, setError } = useChildrenStore();

  return useMutation({
    mutationFn: async (childId: string) => {
      const response = await apiClient.delete(`/users/children/${childId}`);
      return response;
    },
    onSuccess: (_, childId) => {
      removeChild(childId);
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || "Failed to delete child profile");
    },
  });
}
