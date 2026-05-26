import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";

export function ModalSheet({
  children,
  onClose,
  visible,
}: {
  children: ReactNode;
  onClose: () => void;
  visible: boolean;
}) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    overlayOpacity.setValue(0);
    slide.setValue(1);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [overlayOpacity, slide, visible]);

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
              <View style={styles.content}>{children}</View>
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#f4f1ea",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
  },
});
