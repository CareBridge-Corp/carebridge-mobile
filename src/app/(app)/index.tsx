import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../(auth)/store/authStore";
import apiClient from "../../shared/api/client";
import { colors, spacing, typography } from "../../shared/theme";

import { EmptyChildView } from "./components/EmptyChildView";
import { HasChildView } from "./components/HasChildView";

export default function AppHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { data: childrenData, isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      // Assuming standard API response. Need to check if count is 0
      const response = await apiClient.get("/users/children");
      return response;
    },
  });

  const hasChildren = childrenData?.data && childrenData.data.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundBlue}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.userName}>{user?.firstName || "Guest"}</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={colors.text} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? null : hasChildren ? <HasChildView /> : <EmptyChildView />}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBlue,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    marginBottom: 4,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
});
