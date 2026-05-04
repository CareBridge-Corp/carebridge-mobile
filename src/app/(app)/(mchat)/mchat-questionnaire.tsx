import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { useMChatStore } from "../store/mchatStore";

const MCHAT_QUESTIONS = [
  {
    id: 1,
    question:
      "If you point at something across the room, does your child look at it?",
    example:
      "(FOR EXAMPLE, if you point at a toy or an animal, does your child look at the toy or animal?)",
  },
  {
    id: 2,
    question: "Have you ever wondered if your child might be deaf?",
    example: "",
  },
  {
    id: 3,
    question: "Does your child play pretend or make-believe?",
    example:
      "(FOR EXAMPLE, pretend to drink from an empty cup, pretend to talk on a phone, or pretend to feed a doll or stuffed animal?)",
  },
  {
    id: 4,
    question: "Does your child like climbing on things?",
    example: "(FOR EXAMPLE, furniture, playground equipment, or stairs)",
  },
  {
    id: 5,
    question:
      "Does your child make unusual finger movements near his or her eyes?",
    example:
      "(FOR EXAMPLE, does your child wiggle his or her fingers close to his or her eyes?)",
  },
  {
    id: 6,
    question:
      "Does your child point with one finger to ask for something or to get help?",
    example: "(FOR EXAMPLE, pointing to a snack or toy that is out of reach)",
  },
  {
    id: 7,
    question:
      "Does your child point with one finger to show you something interesting?",
    example:
      "(FOR EXAMPLE, pointing to an airplane in the sky or a big truck in the road)",
  },
  {
    id: 8,
    question: "Is your child interested in other children?",
    example:
      "(FOR EXAMPLE, does your child watch other children, smile at them, or go to them?)",
  },
  {
    id: 9,
    question:
      "Does your child show you things by bringing them to you or holding them up for you to see – not to get help, but just to share?",
    example:
      "(FOR EXAMPLE, showing you a flower, a stuffed animal, or a toy truck)",
  },
  {
    id: 10,
    question: "Does your child respond when you call his or her name?",
    example:
      "(FOR EXAMPLE, does he or she look up, talk or babble, or stop what he or she is doing when you call his or her name?)",
  },
  {
    id: 11,
    question: "When you smile at your child, does he or she smile back at you?",
    example: "",
  },
  {
    id: 12,
    question: "Does your child get upset by everyday noises?",
    example:
      "(FOR EXAMPLE, does your child scream or cry to noise such as a vacuum cleaner or loud music?)",
  },
  {
    id: 13,
    question: "Does your child walk?",
    example: "",
  },
  {
    id: 14,
    question:
      "Does your child look you in the eye when you are talking to him or her, playing with him or her, or dressing him or her?",
    example: "",
  },
  {
    id: 15,
    question: "Does your child try to copy what you do?",
    example:
      "(FOR EXAMPLE, wave bye-bye, clap, or make a funny noise when you do)",
  },
  {
    id: 16,
    question:
      "If you turn your head to look at something, does your child look around to see what you are looking at?",
    example: "",
  },
  {
    id: 17,
    question: "Does your child try to get you to watch him or her?",
    example:
      "(FOR EXAMPLE, does your child look at you for praise, or say “look” or “watch me”?)",
  },
  {
    id: 18,
    question:
      "Does your child understand when you tell him or her to do something?",
    example:
      "(FOR EXAMPLE, if you don’t point, can your child understand “put the book on the chair” or “bring me the blanket”?)",
  },
  {
    id: 19,
    question:
      "If something new happens, does your child look at your face to see how you feel about it?",
    example:
      "(FOR EXAMPLE, if he or she hears a strange or funny noise, or sees a new toy, will he or she look at your face?)",
  },
  {
    id: 20,
    question: "Does your child like movement activities?",
    example: "(FOR EXAMPLE, being swung or bounced on your knee)",
  },
];

export default function MChatQuestionnaireScreen() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const { answers, setAnswer } = useMChatStore();

  const question = MCHAT_QUESTIONS[currentQuestion];
  const totalQuestions = MCHAT_QUESTIONS.length;

  const handleAnswer = (answer: boolean) => {
    setAnswer(`Q${question.id}`, answer);

    // Move to next question or finish
    if (currentQuestion < MCHAT_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Navigate to supporting info step
      setTimeout(() => {
        router.push("/(app)/(mchat)/mchat-supporting-info" as Href);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    if (currentQuestion < MCHAT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F0F5" />

      {/* Header with Navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>

        {/* Progress Dots */}
        <View style={styles.progressDotsContainer}>
          {MCHAT_QUESTIONS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentQuestion && styles.progressDotActive,
                index < currentQuestion && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestion === MCHAT_QUESTIONS.length - 1 &&
              styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentQuestion === MCHAT_QUESTIONS.length - 1}
        >
          <Ionicons
            name="arrow-forward"
            size={28}
            color={
              currentQuestion === MCHAT_QUESTIONS.length - 1
                ? "#C0D4E0"
                : "#0C4A6E"
            }
          />
        </TouchableOpacity>
      </View>

      {/* Question at Top */}
      <View style={styles.topQuestionContainer}>
        <Text style={styles.topQuestionText}>{question.question}</Text>
        {answers[`Q${question.id}`] !== undefined && (
          <View style={styles.answerBadge}>
            <Text style={styles.answerBadgeText}>
              {answers[`Q${question.id}`] ? "Yes" : "No"}
            </Text>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.questionCard}>
          <View style={styles.questionNumberContainer}>
            <Text style={styles.questionNumber}>
              {String(currentQuestion + 1).padStart(2, "0")}
            </Text>
            <View style={styles.questionDot} />
          </View>

          <Text style={styles.questionTextLarge}>{question.question}</Text>

          {question.example ? (
            <Text style={styles.exampleText}>{question.example}</Text>
          ) : null}
        </View>
      </View>

      {/* Answer Buttons at Bottom */}
      <View style={styles.answerContainer}>
        <TouchableOpacity
          style={[
            styles.answerButton,
            answers[`Q${question.id}`] === false && styles.answerButtonSelected,
          ]}
          onPress={() => handleAnswer(false)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.answerText,
              answers[`Q${question.id}`] === false && styles.answerTextSelected,
            ]}
          >
            No
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.answerButton,
            answers[`Q${question.id}`] === true && styles.answerButtonSelected,
          ]}
          onPress={() => handleAnswer(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.answerText,
              answers[`Q${question.id}`] === true && styles.answerTextSelected,
            ]}
          >
            Yes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F0F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  progressDotsContainer: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C0D4E0",
  },
  progressDotActive: {
    backgroundColor: "#0C4A6E",
  },
  progressDotCompleted: {
    backgroundColor: "#5A7A8F",
  },
  topQuestionContainer: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topQuestionText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    flex: 1,
    marginRight: spacing.md,
  },
  answerBadge: {
    backgroundColor: "#0C4A6E",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  answerBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xxxl,
  },
  questionNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  questionNumber: {
    fontSize: 64,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    letterSpacing: -2,
  },
  questionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#B8D4E6",
    marginLeft: spacing.sm,
  },
  questionTextLarge: {
    fontSize: 28,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    lineHeight: 36,
    marginBottom: spacing.lg,
  },
  exampleText: {
    fontSize: typography.fontSize.md,
    color: "#A0B8C8",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  answerContainer: {
    flexDirection: "row",
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingBottom: 50,
    paddingTop: spacing.lg,
  },
  answerButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: "#D1DFE8",
    alignItems: "center",
    justifyContent: "center",
  },
  answerButtonSelected: {
    backgroundColor: "#0C4A6E",
    borderColor: "#0C4A6E",
  },
  answerText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  answerTextSelected: {
    color: colors.white,
  },
});
