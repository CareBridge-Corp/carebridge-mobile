import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  IconButton,
  Screen,
  SectionHeader,
  Text,
} from "../../../shared/components/ui";
import { borderRadius, colors, layout, spacing } from "../../../shared/theme";
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

      newSound.setOnPlaybackStatusUpdate((playStatus) => {
        if (playStatus.isLoaded) {
          setAudioPosition(playStatus.positionMillis);
          if (playStatus.durationMillis) {
            setAudioDuration(playStatus.durationMillis);
          }
          if (playStatus.didJustFinish) {
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

  const HeaderBar = (
    <View style={styles.headerBar}>
      <IconButton
        icon="chevron-back"
        accessibilityLabel="Back"
        onPress={() => router.back()}
      />
      <View style={styles.headerCenter}>
        <Text variant="title2" align="center">
          Screening details
        </Text>
      </View>
      <Pressable
        onPress={() => setChildSelectorVisible(true)}
        hitSlop={6}
      >
        <Avatar
          uri={activeChild?.profilePictureUrl}
          name={activeChild?.firstName}
          size="sm"
          badgeCount={children.length > 1 ? children.length : undefined}
        />
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <Screen padded={false} background={colors.surfaceMuted}>
        {HeaderBar}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" tone="secondary" style={{ marginTop: spacing[3] }}>
            Loading screening details...
          </Text>
        </View>
      </Screen>
    );
  }

  if (!screening) {
    return (
      <Screen padded={false} background={colors.surfaceMuted}>
        {HeaderBar}
        <EmptyState
          icon="alert-circle-outline"
          title="Screening not found"
          description="Unable to load screening details. Please try again."
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      {HeaderBar}

      <ChildSelectorModal
        visible={childSelectorVisible}
        onClose={() => setChildSelectorVisible(false)}
      />

      <View style={styles.tabContainer}>
        {[
          { label: "Responses", index: 0 },
          { label: "Supporting info", index: 1 },
        ].map((tab) => {
          const active = activeTab === tab.index;
          return (
            <Pressable
              key={tab.index}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => handleTabPress(tab.index)}
            >
              <Text
                variant="bodyMedium"
                weight={active ? "semibold" : "regular"}
                style={{
                  color: active ? colors.primary : colors.textSecondary,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        <View key="0" style={styles.pageContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {screening.answers &&
            Object.keys(screening.answers).length > 0 ? (
              <View>
                <SectionHeader
                  title="M-CHAT responses"
                  eyebrow={`${Object.keys(screening.answers).length} questions`}
                />
                {Object.entries(screening.answers)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([question, answer]) => (
                    <Card
                      key={question}
                      variant="elevated"
                      padding="md"
                      style={styles.answerCard}
                    >
                      <View style={styles.answerRow}>
                        <Text
                          variant="body"
                          style={{ flex: 1 }}
                          numberOfLines={3}
                        >
                          {question}
                        </Text>
                        <Badge
                          label={answer === "yes" ? "Yes" : "No"}
                          tone={answer === "yes" ? "success" : "neutral"}
                          solid
                        />
                      </View>
                    </Card>
                  ))}
              </View>
            ) : null}

            <View style={styles.infoFooter}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.iconMuted}
              />
              <Text variant="caption" tone="tertiary">
                Submitted on {formatDate(screening.createdAt || screening.date)}
              </Text>
            </View>
          </ScrollView>
        </View>

        <View key="1" style={styles.pageContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <SectionHeader title="Additional comments" />
            {screening.parentComment ? (
              <Card variant="elevated" padding="md" style={styles.block}>
                <Text variant="body" tone="secondary">
                  {screening.parentComment}
                </Text>
              </Card>
            ) : (
              <EmptyBlock
                icon="chatbox-outline"
                text="No additional comments provided"
              />
            )}

            <SectionHeader title="Voice note" />
            {screening.audioNote ? (
              <Card variant="elevated" padding="md" style={styles.audioCard}>
                <View style={styles.audioRow}>
                  <View style={styles.audioIcon}>
                    <Ionicons
                      name="musical-notes"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" weight="semibold">
                      Audio recording
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {audioDuration > 0
                        ? `${formatAudioTime(audioPosition)} / ${formatAudioTime(audioDuration)}`
                        : "Tap to play"}
                    </Text>
                  </View>
                  <IconButton
                    icon={
                      isAudioLoading
                        ? "ellipsis-horizontal"
                        : isPlayingAudio
                          ? "pause"
                          : "play"
                    }
                    variant="filled"
                    accessibilityLabel={isPlayingAudio ? "Pause" : "Play"}
                    onPress={() => playAudio(screening.audioNote)}
                    disabled={isAudioLoading}
                  />
                </View>
              </Card>
            ) : (
              <EmptyBlock icon="mic-outline" text="No voice note recorded" />
            )}

            <SectionHeader
              title="Child pictures"
              eyebrow={
                screening.childPictureUrls?.length
                  ? `${screening.childPictureUrls.length} photos`
                  : undefined
              }
            />
            {screening.childPictureUrls &&
            screening.childPictureUrls.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.picturesScroll}
              >
                {screening.childPictureUrls.map(
                  (url: string, index: number) => (
                    <Pressable
                      key={index}
                      style={styles.pictureWrapper}
                      onPress={() => setFullScreenImage(url)}
                    >
                      <Image
                        source={{ uri: url }}
                        style={styles.pictureThumb}
                      />
                    </Pressable>
                  ),
                )}
              </ScrollView>
            ) : (
              <EmptyBlock icon="images-outline" text="No pictures submitted" />
            )}

            {screening.clinicianNotes ? (
              <>
                <SectionHeader title="Clinician review" />
                <Card variant="tinted" padding="md" style={styles.block}>
                  <Badge
                    label="Professional assessment"
                    tone="brand"
                    icon="shield-checkmark"
                    style={styles.clinicianBadge}
                  />
                  <Text variant="body" tone="primary">
                    {screening.clinicianNotes}
                  </Text>
                </Card>
              </>
            ) : null}

            {!screening.parentComment &&
              !screening.audioNote &&
              (!screening.childPictureUrls ||
                screening.childPictureUrls.length === 0) &&
              !screening.clinicianNotes ? (
              <View style={styles.emptyStateFullPage}>
                <EmptyState
                  icon="document-text-outline"
                  title="No supporting information"
                  description="No additional information was submitted with this screening."
                  primaryAction={{
                    label: "Add supporting info",
                    onPress: () => setAddInfoModalVisible(true),
                  }}
                />
              </View>
            ) : null}

            <View style={styles.infoFooter}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.iconMuted}
              />
              <Text variant="caption" tone="tertiary">
                Submitted on {formatDate(screening.createdAt || screening.date)}
              </Text>
            </View>
          </ScrollView>
        </View>
      </PagerView>

      <Modal
        visible={addInfoModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SupportingInfoForm
          screeningId={screening.screeningId}
          onSuccess={() => setAddInfoModalVisible(false)}
          onCancel={() => setAddInfoModalVisible(false)}
        />
      </Modal>

      <Modal
        visible={fullScreenImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={styles.fullScreenImageContainer}>
          <Pressable
            style={styles.closeFullScreenBtn}
            onPress={() => setFullScreenImage(null)}
          >
            <Ionicons name="close" size={28} color={colors.surface} />
          </Pressable>
          {fullScreenImage ? (
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}

function EmptyBlock({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.emptyBlock}>
      <Ionicons name={icon} size={24} color={colors.iconMuted} />
      <Text variant="bodySmall" tone="tertiary">
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    gap: spacing[2],
  },
  headerCenter: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
  },
  answerCard: {
    marginBottom: spacing[2],
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  block: {
    marginBottom: spacing[5],
  },
  audioCard: {
    marginBottom: spacing[5],
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  audioIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  clinicianBadge: {
    marginBottom: spacing[3],
  },
  picturesScroll: {
    marginBottom: spacing[5],
  },
  pictureWrapper: {
    marginRight: spacing[3],
  },
  pictureThumb: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceSunken,
  },
  emptyBlock: {
    alignItems: "center",
    paddingVertical: spacing[5],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderSubtle,
    marginBottom: spacing[5],
    gap: spacing[2],
  },
  emptyStateFullPage: {
    paddingVertical: spacing[6],
  },
  infoFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
    paddingVertical: spacing[4],
  },
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
    padding: spacing[2],
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
});
