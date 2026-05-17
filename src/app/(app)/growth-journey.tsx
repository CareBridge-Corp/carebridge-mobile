import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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
import Svg, { Path } from "react-native-svg";
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
  const [pathHeight, setPathHeight] = useState(0);

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

  const pathShape = useMemo(() => {
    const segmentHeight = 140;
    const nodesCount = Math.max(pathNodes.length, 4);
    const totalHeight = nodesCount * segmentHeight + segmentHeight; // Add extra for the bottom curve
    const centerX = width / 2;
    const leftX = width * 0.25;
    const rightX = width * 0.75;

    // Start slightly above the top
    let d = `M ${centerX} -50`;

    for (let i = 0; i < nodesCount; i += 1) {
      const y = i * segmentHeight;
      const nextY = y + segmentHeight;
      const targetX = i % 2 === 0 ? rightX : leftX;
      const controlX = i % 2 === 0 ? centerX + 60 : centerX - 60;
      d += ` C ${controlX} ${y + segmentHeight * 0.3}, ${targetX} ${y + segmentHeight * 0.7}, ${targetX} ${nextY}`;
    }

    // Curve back to the center bottom so it looks like it originates from the bottom center
    const lastY = nodesCount * segmentHeight;
    const lastControlX =
      (nodesCount - 1) % 2 === 0 ? centerX + 60 : centerX - 60;
    d += ` C ${lastControlX} ${lastY + segmentHeight * 0.3}, ${centerX} ${lastY + segmentHeight * 0.7}, ${centerX} ${lastY + segmentHeight + 600}`;

    return { d, totalHeight: totalHeight + 500 };
  }, [pathNodes.length, width]);

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

        <View style={styles.headerCenter}>
          <TouchableOpacity
            style={styles.childAvatarContainer}
            onPress={() => children.length > 0 && setShowChildSelector(true)}
          >
            <View style={styles.childAvatarInner}>
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
            </View>
            <View style={styles.profileEditBadge}>
              <Ionicons name="swap-horizontal" size={12} color="#0C4A6E" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>
              {`${activeChild?.firstName || "Child"}’s Journey`}
            </Text>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${totalProgress}%` }]}
                />
              </View>
              <Text style={styles.progressValue}>{totalProgress}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ref={(ref) => ref?.scrollToEnd({ animated: false })}
      >
        <View
          style={styles.pathContainer}
          onLayout={(event) => setPathHeight(event.nativeEvent.layout.height)}
        >
          {/* SVG Road Path Background */}
          <View style={styles.svgBackgroundContainer}>
            <Svg
              width={width}
              height={Math.max(pathHeight, pathShape.totalHeight)}
              style={styles.journeySvg}
            >
              <Path
                d={pathShape.d}
                stroke="#93C5FD"
                strokeWidth={18}
                strokeOpacity={0.35}
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d={pathShape.d}
                stroke="#0C4A6E"
                strokeWidth={8}
                strokeOpacity={0.55}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="18 12"
              />
            </Svg>
          </View>

          {pathNodes.map((node, index) => {
            const isLeft = index % 2 === 1;
            const activityNode = node as any;

            return (
              <View
                key={node.id}
                style={
                  node.type === "week-header"
                    ? styles.weekRow
                    : [
                        styles.nodeRow,
                        isLeft ? styles.nodeRowLeft : styles.nodeRowRight,
                      ]
                }
              >
                {/* Visual Path Connection between nodes - Now handled by SVG background but kept for specific spacing if needed */}
                {/* {index < pathNodes.length - 1 && (
                  <View 
                    style={[
                      styles.pathLine,
                      isVertical ? styles.pathLineVertical : (isLeft ? styles.pathLineLeft : styles.pathLineRight),
                      { top: isVertical ? -110 : -90 }
                    ]} 
                  />
                )} */}

                {node.type === "week-header" ? (
                  <>
                    <View style={styles.weekSeparator} />
                    <View style={styles.weekLabel}>
                      <Text style={styles.weekLabelText}>{node.title}</Text>
                    </View>
                  </>
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
                        activityNode.isActive && styles.nodeCircleActive,
                      ]}
                      onPress={() => {
                        router.push({
                          pathname: "/(app)/(doctor)/activity-detail",
                          params: {
                            activityId: activityNode.activityId,
                            weekPlanId: activityNode.weekPlanId,
                          },
                        } as any);
                      }}
                    >
                      {activityNode.completed ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={32}
                          color="white"
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
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  headerTextBlock: {
    flex: 1,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#0C4A6E",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0C4A6E",
  },
  headerSpacer: {
    width: 36,
    height: 36,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "visible",
    marginRight: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  childAvatarInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  profileEditBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
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
    position: "relative",
  },
  svgBackgroundContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    alignItems: "center",
    pointerEvents: "none",
  },
  journeySvg: {
    width: "100%",
    height: "100%",
    opacity: 0.5,
  },
  weekRow: {
    width: "100%",
    alignItems: "center",
    marginVertical: 40,
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },
  weekSeparator: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    borderBottomWidth: 2,
    borderBottomColor: "#CBD5E1",
    borderStyle: "dashed",
    zIndex: -1,
  },
  weekLabel: {
    backgroundColor: "white",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  weekLabelText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0C4A6E",
    fontFamily: "Plus Jakarta Sans",
  },
  nodeRow: {
    width: "100%",
    paddingHorizontal: 40,
    marginVertical: 30,
    alignItems: "center",
    position: "relative",
    zIndex: 1,
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
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  nodeCircleCompleted: {
    backgroundColor: "#0C4A6E",
  },
  nodeCircleActive: {
    backgroundColor: "#0C4A6E",
    transform: [{ scale: 1.1 }],
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
