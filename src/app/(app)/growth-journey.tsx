import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { spacing } from "../../shared/theme";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { useRoadmaps } from "./hooks/useRoadmaps";
import { useChildrenStore } from "./store/childrenStore";

const { width } = Dimensions.get("window");

export default function GrowthJourneyScreen() {
  const router = useRouter();
  const { activeChild, children } = useChildrenStore();
  const { data: roadmapData } = useRoadmaps(activeChild?.childId);
  const [showChildSelector, setShowChildSelector] = useState(false);

  const activeRoadmap = roadmapData?.roadmaps?.[0];
  const weekPlans = activeRoadmap?.weekPlans || [];

  // Flatten activities with metadata for path rendering
  const rawNodes = weekPlans.flatMap((wp, weekIdx) => {
    // Add a Week Header node
    const headerNode = {
      type: "week-header" as const,
      id: wp.weekPlanId,
      title: `Week ${wp.weekNumber}: ${wp.description.split(" ").slice(0, 2).join(" ")}`,
      status: wp.status,
    };

    const activityNodes = (wp.activities || []).map((activity, actIdx) => {
      const status = wp.activityStatuses?.find(
        (s) => s.activityId === activity.activityId,
      );
      return {
        type: "activity" as const,
        id: `${wp.weekPlanId}-${activity.activityId}`,
        activityId: activity.activityId,
        title: activity.title,
        weekPlanId: wp.weekPlanId,
        completed: status?.completed || false,
        isActive: wp.status === "IN_PROGRESS" && !status?.completed,
        weekStatus: wp.status,
      };
    });

    return [headerNode, ...activityNodes];
  });

  // Reverse path for bottom-to-top progression
  const pathNodes = [...rawNodes].reverse();

  const totalProgress = activeRoadmap
    ? Math.round(
        (weekPlans.reduce(
          (acc, wp) =>
            acc + (wp.activityStatuses?.filter((s) => s.completed).length || 0),
          0,
        ) /
          weekPlans.reduce(
            (acc, wp) => acc + (wp.activities?.length || 0),
            0,
          )) *
          100,
      ) || 0
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#0C4A6E" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <TouchableOpacity
            style={styles.childAvatarContainer}
            onPress={() => children.length > 0 && setShowChildSelector(true)}
          >
            {activeChild?.profilePictureUrl ? (
              <Image
                source={{ uri: activeChild.profilePictureUrl }}
                style={styles.childAvatar}
              />
            ) : (
              <View style={styles.childAvatarFallback}>
                <Ionicons name="person" size={20} color="#0C4A6E" />
              </View>
            )}
            {children.length > 1 && (
              <View style={styles.childCountBadge}>
                <Text style={styles.childCountText}>{children.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeChild?.firstName || "Child"}'s Journey
          </Text>
        </View>

        <View style={styles.progressBadge}>
          <Ionicons name="star" size={16} color="#0C4A6E" />
          <Text style={styles.progressText}>{totalProgress}%</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ref={(ref) => ref?.scrollToEnd({ animated: false })}
      >
        <View style={styles.pathContainer}>
          {pathNodes.map((node, index) => {
            // Adjust left/right based on reversed index to maintain alternating look
            const isLeft = index % 2 === 1;
            const isVertical = node.type === "week-header";
            const activityNode = node as any;

            return (
              <View
                key={node.id}
                style={[
                  styles.nodeRow,
                  isLeft ? styles.nodeRowLeft : styles.nodeRowRight,
                ]}
              >
                {index < pathNodes.length - 1 && (
                  <View
                    style={[
                      styles.pathLine,
                      isVertical
                        ? styles.pathLineVertical
                        : isLeft
                          ? styles.pathLineLeft
                          : styles.pathLineRight,
                      { top: isVertical ? -110 : -90 },
                    ]}
                  />
                )}

                {node.type === "week-header" ? (
                  <View style={styles.weekHeaderContainer}>
                    <View
                      style={[
                        styles.weekLabel,
                        node.status === "PENDING" && styles.weekLabelLocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.weekLabelText,
                          node.status === "PENDING" &&
                            styles.weekLabelTextLocked,
                        ]}
                      >
                        {node.title}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <>
                    {activityNode.isActive && (
                      <View
                        style={[
                          styles.activeTooltip,
                          isLeft ? styles.tooltipLeft : styles.tooltipRight,
                        ]}
                      >
                        <Text style={styles.tooltipLabel}>
                          CURRENT ACTIVITY
                        </Text>
                        <Text style={styles.tooltipTitle}>
                          {activityNode.title}
                        </Text>
                        <View style={styles.tooltipTime}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#64748B"
                          />
                          <Text style={styles.tooltipTimeText}>5 mins</Text>
                        </View>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.nodeCircle,
                        activityNode.completed && styles.nodeCircleCompleted,
                        activityNode.weekStatus === "PENDING" &&
                          styles.nodeCircleLocked,
                        activityNode.isActive && styles.nodeCircleActive,
                      ]}
                      onPress={() => {
                        if (activityNode.weekStatus !== "PENDING") {
                          router.push({
                            pathname: "/(app)/(doctor)/activity-detail",
                            params: {
                              activityId: activityNode.activityId,
                              weekPlanId: activityNode.weekPlanId,
                            },
                          } as any);
                        }
                      }}
                    >
                      {activityNode.completed ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={32}
                          color="white"
                        />
                      ) : activityNode.weekStatus === "PENDING" ? (
                        <Ionicons
                          name="lock-closed"
                          size={24}
                          color="#94A3B8"
                        />
                      ) : activityNode.isActive ? (
                        <Ionicons name="happy" size={32} color="white" />
                      ) : (
                        <View style={styles.nodeStandardInner} />
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })}
        </View>
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
    backgroundColor: "#F9F9FD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  childAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 8,
    backgroundColor: "#F1F5F9",
  },
  childAvatar: {
    width: "100%",
    height: "100%",
  },
  childAvatarFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    borderWidth: 2,
    borderColor: "white",
  },
  childCountText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0C4A6E",
    fontFamily: "Plus Jakarta Sans",
  },
  progressBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0C4A6E",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  pathContainer: {
    paddingVertical: 40,
    alignItems: "center",
    width: "100%",
  },
  weekHeaderContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 40,
  },
  weekLabel: {
    backgroundColor: "white",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  weekLabelLocked: {
    backgroundColor: "#F1F5F9",
    elevation: 0,
    shadowOpacity: 0,
  },
  weekLabelText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0C4A6E",
    fontFamily: "Plus Jakarta Sans",
  },
  weekLabelTextLocked: {
    color: "#94A3B8",
  },
  nodeRow: {
    width: "100%",
    paddingHorizontal: 40,
    marginVertical: 30,
    alignItems: "center",
    position: "relative",
  },
  nodeRowLeft: {
    alignItems: "flex-start",
    paddingLeft: width * 0.25,
  },
  nodeRowRight: {
    alignItems: "flex-end",
    paddingRight: width * 0.25,
  },
  nodeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nodeCircleCompleted: {
    backgroundColor: "#0C4A6E",
  },
  nodeCircleActive: {
    backgroundColor: "#0C4A6E",
    transform: [{ scale: 1.1 }],
  },
  nodeCircleLocked: {
    backgroundColor: "#E2E2E6",
    shadowOpacity: 0,
    elevation: 0,
  },
  nodeStandardInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    opacity: 0.5,
  },
  activeTooltip: {
    position: "absolute",
    bottom: 90,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    width: 200,
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    zIndex: 10,
  },
  tooltipLeft: {
    left: width * 0.25 - 60,
  },
  tooltipRight: {
    right: width * 0.25 - 60,
  },
  pathLine: {
    position: "absolute",
    width: 6,
    height: 120,
    backgroundColor: "#DBEAFE",
    zIndex: -1,
    borderRadius: 3,
  },
  pathLineLeft: {
    left: width * 0.25 + 37,
    transform: [{ rotate: "25deg" }],
  },
  pathLineRight: {
    right: width * 0.25 + 37,
    transform: [{ rotate: "-25deg" }],
  },
  pathLineVertical: {
    left: "50%",
    marginLeft: -3,
    height: 80,
    transform: [{ rotate: "0deg" }],
  },
  tooltipLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1,
    marginBottom: 4,
  },
  tooltipTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0C4A6E",
    marginBottom: 8,
  },
  tooltipTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tooltipTimeText: {
    fontSize: 12,
    color: "#64748B",
  },
});
