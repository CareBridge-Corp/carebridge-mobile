import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Badge,
  Card,
  IconButton,
  ProgressBar,
  Screen,
  Text,
} from "../../../shared/components/ui";
import { useLanguageStore } from "../../../shared/store/languageStore";
import {
  borderRadius,
  colors,
  shadows,
  spacing,
} from "../../../shared/theme";
import { useMChatQuestions } from "../hooks/useScreeningProgress";
import { useChildrenStore } from "../store/childrenStore";
import { useMChatStore } from "../store/mchatStore";

const MCHAT_QUESTIONS = [
  {
    id: 1,
    question:
      "If you point at something across the room, does your child look at it?",
    example:
      "For example, if you point at a toy or an animal, does your child look at the toy or animal?",
  },
  { id: 2, question: "Have you ever wondered if your child might be deaf?", example: "" },
  {
    id: 3,
    question: "Does your child play pretend or make-believe?",
    example:
      "For example, pretend to drink from an empty cup, pretend to talk on a phone, or pretend to feed a doll.",
  },
  { id: 4, question: "Does your child like climbing on things?", example: "" },
  {
    id: 5,
    question:
      "Does your child make unusual finger movements near his or her eyes?",
    example: "",
  },
  {
    id: 6,
    question:
      "Does your child point with one finger to ask for something or to get help?",
    example: "",
  },
  {
    id: 7,
    question:
      "Does your child point with one finger to show you something interesting?",
    example: "",
  },
  { id: 8, question: "Is your child interested in other children?", example: "" },
  {
    id: 9,
    question:
      "Does your child show you things by bringing them to you – not to get help, but just to share?",
    example: "",
  },
  { id: 10, question: "Does your child respond when you call his or her name?", example: "" },
  { id: 11, question: "When you smile at your child, does he or she smile back at you?", example: "" },
  { id: 12, question: "Does your child get upset by everyday noises?", example: "" },
  { id: 13, question: "Does your child walk?", example: "" },
  { id: 14, question: "Does your child look you in the eye when you are talking?", example: "" },
  { id: 15, question: "Does your child try to copy what you do?", example: "" },
  { id: 16, question: "If you turn your head to look at something, does your child look around to see what you are looking at?", example: "" },
  { id: 17, question: "Does your child try to get you to watch him or her?", example: "" },
  { id: 18, question: "Does your child understand when you tell him or her to do something?", example: "" },
  { id: 19, question: "If something new happens, does your child look at your face to see how you feel about it?", example: "" },
  { id: 20, question: "Does your child like movement activities?", example: "" },
];

export default function MChatQuestionnaireScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const activeChild = useChildrenStore((state) => state.activeChild);
  const { language } = useLanguageStore();
  const { data: questionsData, isLoading } = useMChatQuestions(
    activeChild?.childId,
    language,
  );

  const { answers, setAnswer, setSessionMeta } = useMChatStore();

  const questions =
    questionsData?.questions?.map((q) => ({
      id: q.id,
      question: q.question,
      description: q.description ?? "",
      example: q.example ?? "",
      area: q.area,
    })) ??
    MCHAT_QUESTIONS.map((q) => ({
      id: q.id,
      question: q.question,
      area: "general_monitoring",
      description: "",
      example: q.example ?? "",
    }));

  useEffect(() => {
    if (questionsData?.questionIds?.length) {
      setSessionMeta({
        questionIds: questionsData.questionIds,
        screeningMonth: questionsData.screeningMonth,
        carryForwardCount: questionsData.carryForwardCount,
        newQuestionCount: questionsData.newQuestionCount,
      });
    }
  }, [questionsData, setSessionMeta]);

  const questionKey = (id: number) => `Q${id}`;
  const question = questions[currentQuestion];
  const totalQuestions = questions.length;

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswer = (answer: boolean) => {
    if (!question) return;
    setAnswer(questionKey(question.id), answer);
    if (currentQuestion < totalQuestions - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 250);
    } else {
      setTimeout(
        () => router.push("/(app)/(mchat)/mchat-supporting-info" as Href),
        250,
      );
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
    else router.back();
  };

  const handleNext = () => {
    if (!question || answers[questionKey(question.id)] === undefined) {
      startShake();
      return;
    }
    if (currentQuestion < totalQuestions - 1) setCurrentQuestion(currentQuestion + 1);
    else router.push("/(app)/(mchat)/mchat-supporting-info" as Href);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 30,
    onPanResponderRelease: (_, g) => {
      if (g.dx > 50) handleBack();
      else if (g.dx < -50) handleNext();
    },
  });

  if (isLoading || !question) {
    return (
      <Screen background={colors.surfaceMuted}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" tone="secondary" style={{ marginTop: spacing[3] }}>
            {t("mchat.loading")}
          </Text>
        </View>
      </Screen>
    );
  }

  const progressPct = ((currentQuestion + 1) / totalQuestions) * 100;
  const answer = answers[questionKey(question.id)];

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <View style={styles.header} {...panResponder.panHandlers}>
        <IconButton
          icon="chevron-back"
          accessibilityLabel={t("common.back")}
          onPress={handleBack}
        />
        <View style={styles.progressWrap}>
          <Text variant="caption" tone="secondary" style={styles.progressLabel}>
            {t("mchat.questionOf", {
              current: currentQuestion + 1,
              total: totalQuestions,
            })}
          </Text>
          <ProgressBar value={progressPct} />
        </View>
        <IconButton
          icon="chevron-forward"
          accessibilityLabel={t("common.next")}
          onPress={handleNext}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        {...panResponder.panHandlers}
      >
        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
          <Card variant="elevated" padding="lg" style={styles.questionCard}>
            <Text variant="display" tone="brand" style={styles.questionNumber}>
              {String(currentQuestion + 1).padStart(2, "0")}
            </Text>
            <Text variant="title1" style={styles.questionText}>
              {question.question}
            </Text>

            {question.description ? (
              <View style={styles.helpBlock}>
                <Text variant="label" tone="brand">
                  {t("mchat.whatWeAreChecking")}
                </Text>
                <Text variant="bodySmall" tone="secondary">
                  {question.description}
                </Text>
              </View>
            ) : null}

            {question.example ? (
              <View style={[styles.helpBlock, styles.exampleBlock]}>
                <Text variant="label" tone="secondary">
                  {t("mchat.exampleAnswer")}
                </Text>
                <Text variant="bodySmall" tone="secondary">
                  {question.example}
                </Text>
              </View>
            ) : null}

            {answer !== undefined ? (
              <Badge
                label={
                  answer ? t("mchat.yourAnswerYes") : t("mchat.yourAnswerNo")
                }
                tone={answer ? "success" : "neutral"}
                icon={answer ? "checkmark-circle" : "ellipse-outline"}
                style={styles.answerBadge}
              />
            ) : null}
          </Card>
        </Animated.View>
      </ScrollView>

      <Animated.View
        style={[
          styles.answerRow,
          { transform: [{ translateX: shakeAnimation }] },
        ]}
      >
        <Pressable
          onPress={() => handleAnswer(false)}
          style={({ pressed }) => [
            styles.answerBtn,
            answer === false && styles.answerBtnSelected,
            pressed && styles.answerBtnPressed,
          ]}
          accessibilityLabel={t("common.no")}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={answer === false ? colors.textInverse : colors.textPrimary}
          />
          <Text
            variant="bodyMedium"
            style={{
              color: answer === false ? colors.textInverse : colors.textPrimary,
            }}
          >
            {t("common.no")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleAnswer(true)}
          style={({ pressed }) => [
            styles.answerBtn,
            answer === true && styles.answerBtnSelected,
            pressed && styles.answerBtnPressed,
          ]}
          accessibilityLabel={t("common.yes")}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={answer === true ? colors.textInverse : colors.textPrimary}
          />
          <Text
            variant="bodyMedium"
            style={{
              color: answer === true ? colors.textInverse : colors.textPrimary,
            }}
          >
            {t("common.yes")}
          </Text>
        </Pressable>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  progressWrap: {
    flex: 1,
  },
  progressLabel: {
    marginBottom: spacing[1],
    textAlign: "center",
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
  },
  questionCard: {
    ...shadows.md,
    borderRadius: borderRadius.xl,
  },
  questionNumber: {
    marginBottom: spacing[3],
    fontSize: 56,
    lineHeight: 60,
  },
  questionText: {
    marginBottom: spacing[3],
  },
  helpBlock: {
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  exampleBlock: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  answerBadge: {
    marginTop: spacing[3],
  },
  answerRow: {
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
  },
  answerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  answerBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  answerBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
