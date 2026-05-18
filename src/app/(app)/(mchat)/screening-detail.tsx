import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { ChildSelectorModal } from "../components/ChildSelectorModal";
import { SupportingInfoForm } from "../components/SupportingInfoForm";
import { useScreeningDetail } from "../hooks/useScreenings";
import { useChildrenStore } from "../store/childrenStore";

export default function ScreeningDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: screeningData, isLoading } = useScreeningDetail(id);
  const screening = screeningData;

  const { children, activeChild } = useChildrenStore();
  const [childSelectorVisible, setChildSelectorVisible] = React.useState(false);
  const [addInfoModalVisible, setAddInfoModalVisible] = React.useState(false);
  const [fullScreenImage, setFullScreenImage] = React.useState<string | null>(
    null,
  );

  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [isAudioLoading, setIsAudioLoading] = React.useState(false);
  const [audioDuration, setAudioDuration] = React.useState(0);
  const [audioPosition, setAudioPosition] = React.useState(0);

  const [activeTab, setActiveTab] = React.useState(0);
  const pagerRef = React.useRef<PagerView>(null);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  const handlePageSelected = (e: any) => {
    setActiveTab(e.nativeEvent.position);
  };

  const playAudio = async (url: string) => {
    try {
      if (sound) {
        if (isPlayingAudio) {
          await sound.pauseAsync();
          setIsPlayingAudio(false);
        } else {
          await sound.playAsync();
          setIsPlayingAudio(true);
        }
        return;
      }

      setIsAudioLoading(true);
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, isLooping: false },
      );

      setSound(newSound);
      setIsAudioLoading(false);
      setIsPlayingAudio(true);

      if (status.isLoaded && status.durationMillis) {
        setAudioDuration(status.durationMillis);
      }

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setAudioPosition(status.positionMillis);
          if (status.durationMillis) {
            setAudioDuration(status.durationMillis);
          }
          if (status.didJustFinish) {
            setIsPlayingAudio(false);
            newSound.stopAsync().then(() => {
              newSound.setPositionAsync(0);
              setAudioPosition(0);
            });
          }
        }
      });
    } catch (error) {
      console.error("Error playing audio", error);
      setIsAudioLoading(false);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAudioTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0C4A6E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Screening Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0C4A6E" />
          <Text style={styles.loadingText}>Loading screening details...</Text>
        </View>
      </View>
    );
  }

  if (!screening) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0C4A6E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Screening Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Screening Not Found</Text>
          <Text style={styles.errorText}>
            Unable to load screening details. Please try again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Screening Details</Text>

        {/* Child Profile Selector */}
        <TouchableOpacity
          style={styles.childSelector}
          onPress={() => setChildSelectorVisible(true)}
        >
          {activeChild?.profilePictureUrl ? (
            <Image
              source={{ uri: activeChild.profilePictureUrl }}
              style={styles.childAvatar}
            />
          ) : (
            <View style={styles.childAvatarPlaceholder}>
              <Ionicons name="person" size={20} color="#0C4A6E" />
            </View>
          )}
          {children.length > 1 && (
            <View style={styles.childCountBadge}>
              <Text style={styles.childCountText}>{children.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Child Selector Modal */}
      <ChildSelectorModal
        visible={childSelectorVisible}
        onClose={() => setChildSelectorVisible(false)}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.activeTab]}
          onPress={() => handleTabPress(0)}
        >
          <Text
            style={[styles.tabText, activeTab === 0 && styles.activeTabText]}
          >
            Responses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => handleTabPress(1)}
        >
          <Text
            style={[styles.tabText, activeTab === 1 && styles.activeTabText]}
          >
            Supporting Info
          </Text>
        </TouchableOpacity>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {/* Page 0: Responses Tab Content */}
        <View key="0" style={styles.pageContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* M-CHAT Responses */}
            {screening.answers && Object.keys(screening.answers).length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list-outline" size={20} color="#0C4A6E" />
                  <Text style={styles.sectionTitle}>M-CHAT Responses</Text>
                  <View style={styles.responseCount}>
                    <Text style={styles.responseCountText}>
                      {Object.keys(screening.answers).length}
                    </Text>
                  </View>
                </View>
                {Object.entries(screening.answers)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([question, answer]) => (
                    <View key={question} style={styles.answerCard}>
                      <Text style={styles.questionLabel}>{question}</Text>
                      <View style={styles.answerDivider} />
                      <View
                        style={[
                          styles.answerBadge,
                          answer === "yes" ? styles.answerYes : styles.answerNo,
                        ]}
                      >
                        <Text style={styles.answerText}>
                          {answer === "yes" ? "Yes" : "No"}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Info Footer */}
            <View style={styles.infoFooter}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#A0B8C8"
              />
              <Text style={styles.infoFooterText}>
                Screening submitted on{" "}
                {formatDate(screening.createdAt || screening.date)}
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Page 1: Supporting Info Tab Content */}
        <View key="1" style={styles.pageContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Additional Comments Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="chatbox-outline" size={20} color="#0C4A6E" />
                <Text style={styles.sectionTitle}>Additional Comments</Text>
              </View>
              {screening.parentComment ? (
                <View style={styles.descriptionCard}>
                  <Text style={styles.descriptionText}>
                    {screening.parentComment}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyInfoCard}>
                  <Ionicons name="chatbox-outline" size={32} color="#C0D4E0" />
                  <Text style={styles.emptyInfoText}>
                    No additional comments provided
                  </Text>
                </View>
              )}
            </View>

            {/* Voice Note Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="mic-outline" size={20} color="#0C4A6E" />
                <Text style={styles.sectionTitle}>Voice Note</Text>
              </View>
              {screening.audioNote ? (
                <View style={styles.audioCard}>
                  <View style={styles.audioIconContainer}>
                    <Ionicons name="musical-notes" size={24} color="#0C4A6E" />
                  </View>
                  <View style={styles.audioInfo}>
                    <Text style={styles.audioTitle}>Audio Recording</Text>
                    <Text style={styles.audioSubtext}>
                      {audioDuration > 0
                        ? `${formatAudioTime(audioPosition)} / ${formatAudioTime(audioDuration)}`
                        : "Tap to play"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => playAudio(screening.audioNote)}
                    disabled={isAudioLoading}
                  >
                    {isAudioLoading ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Ionicons
                        name={isPlayingAudio ? "pause" : "play"}
                        size={20}
                        color={colors.white}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyInfoCard}>
                  <Ionicons name="mic-outline" size={32} color="#C0D4E0" />
                  <Text style={styles.emptyInfoText}>
                    No voice note recorded
                  </Text>
                </View>
              )}
            </View>

            {/* Child Pictures Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="images-outline" size={20} color="#0C4A6E" />
                <Text style={styles.sectionTitle}>
                  Child Pictures
                  {screening.childPictureUrls &&
                    screening.childPictureUrls.length > 0 &&
                    ` (${screening.childPictureUrls.length})`}
                </Text>
              </View>
              {screening.childPictureUrls &&
              screening.childPictureUrls.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.picturesScroll}
                >
                  {screening.childPictureUrls.map(
                    (url: string, index: number) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.pictureWrapper}
                        onPress={() => setFullScreenImage(url)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: url }}
                          style={styles.pictureThumb}
                        />
                      </TouchableOpacity>
                    ),
                  )}
                </ScrollView>
              ) : (
                <View style={styles.emptyInfoCard}>
                  <Ionicons name="images-outline" size={32} color="#C0D4E0" />
                  <Text style={styles.emptyInfoText}>
                    No pictures submitted
                  </Text>
                </View>
              )}
            </View>

            {/* Clinician Notes Section */}
            {screening.clinicianNotes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="medical" size={20} color="#0C4A6E" />
                  <Text style={styles.sectionTitle}>Clinician Review</Text>
                </View>
                <View style={styles.clinicianCard}>
                  <View style={styles.clinicianBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color={colors.white}
                    />
                    <Text style={styles.clinicianBadgeText}>
                      Professional Assessment
                    </Text>
                  </View>
                  <Text style={styles.clinicianNotes}>
                    {screening.clinicianNotes}
                  </Text>
                </View>
              </View>
            )}

            {/* Empty State for Supporting Info */}
            {!screening.parentComment &&
              !screening.audioNote &&
              (!screening.childPictureUrls ||
                screening.childPictureUrls.length === 0) &&
              !screening.clinicianNotes && (
                <View style={styles.emptyStateFullPage}>
                  <Ionicons
                    name="document-text-outline"
                    size={64}
                    color="#A0B8C8"
                  />
                  <Text style={styles.emptyStateTitle}>
                    No Supporting Information
                  </Text>
                  <Text style={styles.emptyStateText}>
                    No additional information was submitted with this screening.
                  </Text>
                  <TouchableOpacity
                    style={styles.addInfoButtonCentered}
                    onPress={() => setAddInfoModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="add-circle"
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.addInfoButtonCenteredText}>
                      Add Supporting Information
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            {/* Info Footer */}
            <View style={styles.infoFooter}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#A0B8C8"
              />
              <Text style={styles.infoFooterText}>
                Screening submitted on{" "}
                {formatDate(screening.createdAt || screening.date)}
              </Text>
            </View>
          </ScrollView>
        </View>
      </PagerView>

      {/* Supporting Info Form Modal */}
      <Modal
        visible={addInfoModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SupportingInfoForm
          screeningId={screening.screeningId}
          onSuccess={() => {
            setAddInfoModalVisible(false);
            // Optionally refetch screening data here
          }}
          onCancel={() => setAddInfoModalVisible(false)}
        />
      </Modal>

      {/* Full Screen Image Modal */}
      <Modal
        visible={fullScreenImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={styles.fullScreenImageContainer}>
          <TouchableOpacity
            style={styles.closeFullScreenBtn}
            onPress={() => setFullScreenImage(null)}
          >
            <Ionicons name="close" size={32} color={colors.white} />
          </TouchableOpacity>
          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenImageContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeFullScreenBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0F5",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  childSelector: {
    position: "relative",
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  childAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
  },
  childCountBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#0C4A6E",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  childCountText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0F5",
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#0C4A6E",
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: "#A0B8C8",
  },
  activeTabText: {
    color: "#0C4A6E",
    fontWeight: typography.fontWeight.bold,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#EF4444",
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    textAlign: "center",
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    flex: 1,
  },
  responseCount: {
    backgroundColor: "#0C4A6E",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  responseCountText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  answerCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8F0F5",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  questionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    maxWidth: "80%",
    lineHeight: 30,
  },
  answerDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8F0F5",
  },
  answerBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    flexShrink: 0,
  },
  answerYes: {
    backgroundColor: "#10B981",
  },
  answerNo: {
    backgroundColor: "#6B7280",
  },
  answerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  descriptionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xl,
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8F0F5",
  },
  descriptionText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    lineHeight: 22,
  },
  audioCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxxl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8F0F5",
  },
  audioIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F7FB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 2,
  },
  audioSubtext: {
    fontSize: typography.fontSize.xs,
    color: "#A0B8C8",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0C4A6E",
    justifyContent: "center",
    alignItems: "center",
  },
  picturesCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8F0F5",
  },
  picturesIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F7FB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  picturesCount: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  picturesText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  clinicianCard: {
    backgroundColor: "#F0F7FB",
    borderRadius: borderRadius.xxxl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: "#0C4A6E",
  },
  clinicianBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#0C4A6E",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  clinicianBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textTransform: "uppercase",
  },
  clinicianNotes: {
    fontSize: typography.fontSize.sm,
    color: "#0C4A6E",
    lineHeight: 22,
  },
  infoFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  infoFooterText: {
    fontSize: typography.fontSize.xs,
    color: "#A0B8C8",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#5A7A8F",
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyStateFullPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyInfoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#C0D4E0",
  },
  emptyInfoText: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
    marginTop: spacing.sm,
    textAlign: "center",
  },
  picturesScroll: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
  },
  pictureWrapper: {
    marginRight: spacing.md,
  },
  pictureThumb: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xl,
    backgroundColor: "#E8F0F5",
  },
  addInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F0F5",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxxl,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  addInfoButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  addInfoButtonCentered: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxxl,
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  addInfoButtonCenteredText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
