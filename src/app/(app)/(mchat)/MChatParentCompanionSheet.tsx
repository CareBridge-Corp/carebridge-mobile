import { Ionicons } from "@expo/vector-icons";
import { useConversation } from "@elevenlabs/react-native";
import { LogLevel, LoggerNames, setLogLevel } from "livekit-client";
import React, { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { apiClient } from "../../../shared/api/client";
import {
  CompanionLoadingAnimation,
  CompanionWaveform,
} from "../../../shared/components/CompanionVoiceVisualizer";
import { Button, IconButton, Text } from "../../../shared/components/ui";
import { borderRadius, colors, spacing } from "../../../shared/theme";
import {
  MChatCompanionMessage,
  useMChatStore,
} from "../store/mchatStore";

interface CompanionQuestion {
  id: number;
  question: string;
  area: string;
  description?: string;
  example?: string;
}

interface MChatParentCompanionProps {
  childId: string;
  language: string;
  question: CompanionQuestion;
}

interface CompanionResponse {
  message: string;
  source: "ai" | "approved-fallback";
  model: string | null;
  requestId: string;
}

interface VoiceContext extends Record<string, string | number | boolean> {
  child_age_months: number;
  current_question_id: number;
  current_question: string;
  current_question_area: string;
  current_question_description: string;
  current_question_example: string;
  language: string;
}

interface VoiceTokenResponse {
  conversationToken: string;
  conversationId: string | null;
  context: VoiceContext;
}

let signalLogRestoreTimer: ReturnType<typeof setTimeout> | null = null;

function restoreSignalLogging() {
  if (signalLogRestoreTimer) {
    clearTimeout(signalLogRestoreTimer);
    signalLogRestoreTimer = null;
  }
  setLogLevel(LogLevel.info, LoggerNames.Signal);
}

function quietExpectedSignalClose() {
  if (signalLogRestoreTimer) clearTimeout(signalLogRestoreTimer);
  setLogLevel(LogLevel.silent, LoggerNames.Signal);
  signalLogRestoreTimer = setTimeout(restoreSignalLogging, 1200);
}

function createMessage(
  role: MChatCompanionMessage["role"],
  content: string,
): MChatCompanionMessage {
  return {
    id: `${Date.now()}-${role}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

export default function MChatParentCompanion({
  childId,
  language,
  question,
}: MChatParentCompanionProps) {
  const { t } = useTranslation();
  const conversationState = useMChatStore(
    (state) => state.companionConversations[question.id],
  );
  const voiceQuestionId = useMChatStore(
    (state) => state.companionVoiceQuestionId,
  );
  const voiceStatus = useMChatStore((state) => state.companionVoiceStatus);
  const voiceMuted = useMChatStore((state) => state.companionVoiceMuted);
  const addMessage = useMChatStore((state) => state.addCompanionMessage);
  const setDraft = useMChatStore((state) => state.setCompanionDraft);
  const setSending = useMChatStore((state) => state.setCompanionSending);
  const setVoiceError = useMChatStore(
    (state) => state.setCompanionVoiceError,
  );
  const setVoiceState = useMChatStore(
    (state) => state.setCompanionVoiceState,
  );
  const setVoiceMuted = useMChatStore(
    (state) => state.setCompanionVoiceMuted,
  );

  const messages = conversationState?.messages ?? [];
  const draft = conversationState?.draft ?? "";
  const isSending = conversationState?.isSending ?? false;
  const voiceError = conversationState?.voiceError ?? false;
  const activeVoiceQuestionIdRef = useRef<number | null>(null);
  const voiceRequestRef = useRef(0);
  const voiceSessionRequestedRef = useRef(false);
  const isStoppingVoiceRef = useRef(false);

  const finishVoiceInteraction = useCallback((questionId: number | null) => {
    if (questionId === null) return;
    const state = useMChatStore.getState();
    if (state.companionVoiceQuestionId === questionId) {
      setVoiceState(null, "idle");
    }
    if (activeVoiceQuestionIdRef.current === questionId) {
      activeVoiceQuestionIdRef.current = null;
    }
  }, [setVoiceState]);

  const conversation = useConversation({
    onMessage: ({ message, role }) => {
      const content = message.trim();
      const activeQuestionId = activeVoiceQuestionIdRef.current;
      if (content && activeQuestionId !== null) {
        addMessage(
          activeQuestionId,
          createMessage(role === "agent" ? "assistant" : "user", content),
        );
      }
    },
    onError: () => {
      if (isStoppingVoiceRef.current) return;
      const activeQuestionId = activeVoiceQuestionIdRef.current;
      voiceSessionRequestedRef.current = false;
      if (activeQuestionId !== null) setVoiceError(activeQuestionId, true);
      finishVoiceInteraction(activeQuestionId);
    },
    onDisconnect: (details) => {
      const activeQuestionId = activeVoiceQuestionIdRef.current;
      const expectedDisconnect =
        isStoppingVoiceRef.current || details.reason === "user";
      voiceSessionRequestedRef.current = false;
      isStoppingVoiceRef.current = false;
      if (
        !expectedDisconnect &&
        details.reason === "error" &&
        activeQuestionId !== null
      ) {
        setVoiceError(activeQuestionId, true);
      }
      finishVoiceInteraction(activeQuestionId);
    },
  });
  const conversationRef = useRef(conversation);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  const voiceActive =
    conversation.status === "connecting" || conversation.status === "connected";
  const isVoiceForQuestion =
    voiceQuestionId === question.id && voiceStatus !== "idle";

  useEffect(() => {
    const activeQuestionId = activeVoiceQuestionIdRef.current;
    if (activeQuestionId === null) return;

    if (conversation.status === "connecting") {
      setVoiceState(activeQuestionId, "connecting");
    } else if (conversation.status === "connected") {
      setVoiceState(
        activeQuestionId,
        conversation.isSpeaking ? "speaking" : "listening",
      );
    }
  }, [conversation.isSpeaking, conversation.status, setVoiceState]);

  const startVoiceConversation = useCallback(async () => {
    if (voiceActive || useMChatStore.getState().companionVoiceStatus !== "idle") {
      return;
    }

    const questionId = question.id;
    restoreSignalLogging();
    activeVoiceQuestionIdRef.current = questionId;
    voiceSessionRequestedRef.current = false;
    isStoppingVoiceRef.current = false;
    const requestId = ++voiceRequestRef.current;
    setVoiceError(questionId, false);
    setVoiceMuted(false);
    setVoiceState(questionId, "connecting");

    try {
      const response = await apiClient.post<VoiceTokenResponse>(
        "/companion/mchat/voice/token",
        {
          childId,
          questionId,
          questionText: question.question,
          questionArea: question.area,
          questionDescription: question.description ?? "",
          questionExample: question.example ?? "",
          language,
        },
      );

      if (requestId !== voiceRequestRef.current) return;

      const contextUpdate = [
        `The child is ${response.context.child_age_months} months old.`,
        `The current M-CHAT question is Q${response.context.current_question_id}: ${response.context.current_question}`,
        `Development area: ${response.context.current_question_area}.`,
        response.context.current_question_description
          ? `Approved explanation: ${response.context.current_question_description}`
          : "",
        response.context.current_question_example
          ? `Approved example: ${response.context.current_question_example}`
          : "",
        `Reply language: ${response.context.language}.`,
      ]
        .filter(Boolean)
        .join("\n");

      voiceSessionRequestedRef.current = true;
      conversation.startSession({
        conversationToken: response.conversationToken,
        connectionType: "webrtc",
        dynamicVariables: response.context,
        stripAudioTags: true,
        onConnect: () => {
          isStoppingVoiceRef.current = false;
          setVoiceState(questionId, "listening");
          conversation.sendContextualUpdate(contextUpdate);
        },
      });
    } catch {
      voiceSessionRequestedRef.current = false;
      setVoiceError(questionId, true);
      finishVoiceInteraction(questionId);
    }
  }, [
    childId,
    conversation,
    finishVoiceInteraction,
    language,
    question,
    setVoiceError,
    setVoiceMuted,
    setVoiceState,
    voiceActive,
  ]);

  const stopVoiceConversation = useCallback(() => {
    const activeQuestionId = activeVoiceQuestionIdRef.current;
    const hasSession = voiceSessionRequestedRef.current || voiceActive;
    const wasConnecting =
      useMChatStore.getState().companionVoiceStatus === "connecting";

    voiceRequestRef.current += 1;
    if ((!hasSession && !wasConnecting) || isStoppingVoiceRef.current) return;

    voiceSessionRequestedRef.current = false;
    isStoppingVoiceRef.current = true;
    if (hasSession) {
      quietExpectedSignalClose();
      conversation.endSession();
      return;
    }

    isStoppingVoiceRef.current = false;
    finishVoiceInteraction(activeQuestionId);
  }, [conversation, finishVoiceInteraction, voiceActive]);

  useEffect(() => {
    const activeQuestionId = activeVoiceQuestionIdRef.current;
    if (activeQuestionId !== null && activeQuestionId !== question.id) {
      stopVoiceConversation();
    }
  }, [question.id, stopVoiceConversation]);

  useEffect(
    () => () => {
      voiceRequestRef.current += 1;
      if (voiceSessionRequestedRef.current) {
        quietExpectedSignalClose();
        conversationRef.current.endSession();
      }
      finishVoiceInteraction(activeVoiceQuestionIdRef.current);
    },
    [finishVoiceInteraction],
  );

  const sendMessage = async () => {
    const questionId = question.id;
    const message = draft.trim();
    if (!message || isSending) return;

    const history = (
      useMChatStore.getState().companionConversations[questionId]?.messages ?? []
    )
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));

    addMessage(questionId, createMessage("user", message));
    setDraft(questionId, "");
    setSending(questionId, true);

    try {
      const response = await apiClient.post<CompanionResponse>(
        "/companion/mchat/message",
        {
          childId,
          questionId,
          questionText: question.question,
          questionArea: question.area,
          questionDescription: question.description ?? "",
          questionExample: question.example ?? "",
          language,
          message,
          history,
        },
      );
      addMessage(questionId, createMessage("assistant", response.message));
    } catch {
      addMessage(
        questionId,
        createMessage("assistant", t("mchat.companionErrorMessage")),
      );
    } finally {
      setSending(questionId, false);
    }
  };

  const voiceStatusText =
    voiceStatus === "connecting"
      ? t("mchat.companionVoiceConnecting")
      : voiceStatus === "speaking"
        ? t("mchat.companionVoiceSpeaking")
        : t("mchat.companionVoiceListening");

  return (
    <View style={styles.container}>
      {isVoiceForQuestion ? (
        <View style={styles.voiceStrip}>
          <View style={styles.voiceVisual}>
            {voiceStatus === "connecting" ? (
              <CompanionLoadingAnimation />
            ) : (
              <CompanionWaveform
                speaking={voiceStatus === "speaking"}
                muted={voiceMuted}
              />
            )}
          </View>
          <View style={styles.voiceCopy}>
            <Text variant="bodySmall" weight="semibold" tone="brand">
              {voiceStatusText}
            </Text>
            <Text variant="caption" tone="secondary">
              {t("mchat.companionVoiceLive")}
            </Text>
          </View>
          {conversation.status === "connected" ? (
            <IconButton
              icon={voiceMuted ? "mic-off" : "mic"}
              size="sm"
              variant="tinted"
              accessibilityLabel={
                voiceMuted
                  ? t("mchat.companionVoiceUnmute")
                  : t("mchat.companionVoiceMute")
              }
              onPress={() => {
                const nextMuted = !voiceMuted;
                conversation.setMuted(nextMuted);
                setVoiceMuted(nextMuted);
              }}
            />
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("mchat.companionVoiceStop")}
            onPress={stopVoiceConversation}
            style={({ pressed }) => [
              styles.stopButton,
              pressed && styles.controlPressed,
            ]}
          >
            <Ionicons name="stop" size={12} color={colors.primary} />
            <Text variant="caption" tone="brand" weight="semibold">
              {t("mchat.companionVoiceStop")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Button
          label={t("mchat.companionOpen")}
          variant="secondary"
          size="sm"
          leadingIcon="mic"
          onPress={() => void startVoiceConversation()}
        />
      )}

      {voiceError ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text variant="caption" style={styles.errorText}>
            {t("mchat.companionVoiceError")}
          </Text>
        </View>
      ) : null}

      {messages.length > 0 || isSending ? (
        <View style={styles.thread}>
          <View style={styles.threadHeader}>
            <View style={styles.threadMark}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            </View>
            <Text variant="caption" tone="secondary" weight="semibold">
              {t("mchat.companionConversationForQuestion")}
            </Text>
          </View>

          <View style={styles.messages}>
            {messages.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.messageBubble,
                  item.role === "user"
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                {item.role === "assistant" ? (
                  <Text variant="caption" tone="brand" style={styles.aiLabel}>
                    {t("mchat.companionAiLabel")}
                  </Text>
                ) : null}
                <Text
                  variant="bodySmall"
                  style={item.role === "user" ? styles.userMessageText : undefined}
                >
                  {item.content}
                </Text>
              </View>
            ))}

            {isSending ? (
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <View style={styles.thinkingRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text variant="caption" tone="secondary">
                    {t("mchat.companionThinking")}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={(value) => setDraft(question.id, value)}
          placeholder={t("mchat.companionPlaceholder")}
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={1500}
          editable={!isSending}
          style={styles.input}
          onSubmitEditing={() => void sendMessage()}
          blurOnSubmit={false}
        />
        <IconButton
          icon="arrow-up"
          variant="filled"
          accessibilityLabel={t("mchat.companionSend")}
          disabled={!draft.trim() || isSending}
          onPress={() => void sendMessage()}
        />
      </View>

      <Text variant="caption" tone="tertiary" style={styles.disclaimer}>
        {t("mchat.companionDisclaimer")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing[3],
    gap: spacing[2],
  },
  voiceStrip: {
    minHeight: 64,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primarySubtle,
  },
  voiceVisual: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceCopy: {
    flex: 1,
  },
  stopButton: {
    minHeight: 34,
    paddingHorizontal: spacing[2],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  controlPressed: {
    backgroundColor: colors.primaryMuted,
    transform: [{ scale: 0.98 }],
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    backgroundColor: colors.errorBackground,
  },
  errorText: {
    flex: 1,
    color: colors.error,
  },
  thread: {
    paddingTop: spacing[1],
  },
  threadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  threadMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryMuted,
  },
  messages: {
    gap: spacing[2],
  },
  messageBubble: {
    maxWidth: "88%",
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing[1],
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceSunken,
    borderBottomLeftRadius: spacing[1],
  },
  userMessageText: {
    color: colors.textInverse,
  },
  aiLabel: {
    marginBottom: spacing[1],
  },
  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[2],
    paddingTop: spacing[1],
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 104,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    textAlignVertical: "top",
  },
  disclaimer: {
    paddingHorizontal: spacing[1],
    textAlign: "center",
  },
});
