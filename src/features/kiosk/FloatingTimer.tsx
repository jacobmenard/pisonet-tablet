import { useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';

import { LEVEL_COLOR } from '../../components/TimePill';
import { formatClock } from '../../domain/format';
import { useRemaining } from '../../hooks/useRemaining';
import { radius, space } from '../../theme/tokens';

/**
 * Draggable time bubble shown on top of other apps. On the device this is
 * drawn by the native overlay service; this JS version mirrors its look and
 * behavior for the preview.
 */
export function FloatingTimer() {
  const { msLeft, level } = useRemaining();
  const [{ pos, responder }] = useState(() => {
    const value = new Animated.ValueXY({ x: 0, y: 0 });
    const offset = { x: 0, y: 0 };
    return {
      pos: value,
      responder: PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => value.setValue({ x: offset.x + g.dx, y: offset.y + g.dy }),
        onPanResponderRelease: (_, g) => {
          offset.x += g.dx;
          offset.y += g.dy;
        },
      }),
    };
  });

  const color = LEVEL_COLOR[level];
  return (
    <Animated.View
      {...responder.panHandlers}
      style={[styles.bubble, { borderColor: color, transform: pos.getTranslateTransform() }]}
      accessibilityRole="timer"
      accessibilityLabel={`Time remaining ${formatClock(msLeft)}`}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.time, { color }]}>{formatClock(msLeft)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    top: space.lg,
    right: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 2,
    backgroundColor: 'rgba(11,16,32,0.88)',
    zIndex: 900,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  time: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
