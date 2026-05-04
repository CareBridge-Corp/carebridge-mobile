import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../(auth)/store/authStore";
import { colors, spacing, typography } from "../../shared/theme";

import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { EmptyChildView } from "./components/EmptyChildView";
import { HasChildView } from "./components/HasChildView";
import { HomeSkeletonView } from "./components/HomeSkeletonView";
import { useChildren } from "./hooks/useChildren";
import { useChildrenStore } from "./store/childrenStore";

export default function AppHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { activeChild, children } = useChildrenStore();

  console.log(children);
  const [showChildSelector, setShowChildSelector] = useState(false);

  // Fetch children and sync with store
  const { isLoading } = useChildren();

  const hasChildren = children.length > 0;

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
          <Text style={styles.userName}>
            {activeChild ? activeChild.firstName : user?.firstName || "Guest"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => children.length > 0 && setShowChildSelector(true)}
          activeOpacity={0.7}
        >
          {activeChild?.profilePictureUrl ? (
            <Image
              source={{ uri: activeChild.profilePictureUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons name="person" size={28} color={colors.text} />
          )}
          {children.length > 1 && (
            <View style={styles.childCountBadge}>
              <Text style={styles.childCountText}>{children.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <HomeSkeletonView />
        ) : hasChildren ? (
          <HasChildView />
        ) : (
          <EmptyChildView />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Child Selector Modal */}
      <ChildSelectorModal
        visible={showChildSelector}
        onClose={() => setShowChildSelector(false)}
      />
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
    position: "relative",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  childCountBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#10B981",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  childCountText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
});
