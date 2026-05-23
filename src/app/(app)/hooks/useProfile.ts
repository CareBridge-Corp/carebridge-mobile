import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../shared/api/client";
import { useProfileStore } from "../store/profileStore";

export function useProfile() {
  const setProfile = useProfileStore((state) => state.setProfile);

  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const response = await apiClient.get("/users/me");
      console.log("Fetched user profile:", response);

      const user = response.user;
      setProfile(user);
      return user;
    },
  });
}
