import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Animated, Modal, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { colors, radii } from "../theme";

export function ModalSheet({
  children,
  contentStyle,
  onClose,
  placement = "bottom",
  visible,
}: {
  children: ReactNode;
  contentStyle?: ViewStyle;
  onClose: () => void;
  placement?: "bottom" | "center";
  visible: boolean;
}) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    overlayOpacity.setValue(0);
    slide.setValue(1);
    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ];

    if (placement === "bottom") {
      animations.push(
        Animated.timing(slide, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      );
    }

    Animated.parallel(animations).start();
  }, [overlayOpacity, placement, slide, visible]);

  if (placement === "center") {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <Animated.View
          style={[styles.overlayCenter, { opacity: overlayOpacity }]}
        >
          <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
          <Pressable onPress={() => {}} style={styles.centerWrapper}>
            <View style={[styles.contentCenter, contentStyle]}>{children}</View>
          </Pressable>
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable onPress={onClose} style={styles.dismissArea}>
          <Animated.View
            style={{
              transform: [
                {
                  translateY: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 600],
                  }),
                },
              ],
            }}
          >
            <Pressable onPress={() => {}}>
              <View style={[styles.content, contentStyle]}>{children}</View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  overlayCenter: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: radii.dialog,
  },
  centerWrapper: {
    width: "100%",
    maxWidth: 390,
  },
  dismissArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingBottom: 40,
  },
  contentCenter: {
    backgroundColor: colors.background,
    borderRadius: radii.dialog,
  },
});
