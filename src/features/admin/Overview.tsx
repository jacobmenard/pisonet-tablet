import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { SHOW_SIMULATOR } from '../../components/DevCoinPanel';
import { formatClock, formatMinutes, formatPeso } from '../../domain/format';
import { ACCEPTED_COINS } from '../../domain/rates';
import { remainingMs } from '../../domain/session';
import { useCoinStatus } from '../../hooks/useCoinStatus';
import { useNow } from '../../hooks/useKioskRuntime';
import { wallNow } from '../../services/clock';
import { useSessionStore } from '../../state/sessionStore';
import { useShopStore } from '../../state/shopStore';
import { colors, radius, space, type } from '../../theme/tokens';
import { coinBreakdown, dailyTotals, sampleLogs, startOfDay, todaySummary } from './reports';
import { Card, SectionTitle, Stat } from './ui';

const PHASE_LABEL = { idle: 'Locked, waiting for coin', crediting: 'Coins inserted, not started', active: 'In use', grace: "Time's up (grace period)" };

export function Overview({ onChangePin }: { onChangePin: () => void }) {
  const coinLog = useShopStore((s) => s.coinLog);
  const sessionLog = useShopStore((s) => s.sessionLog);
  const pinHash = useShopStore((s) => s.settings.pinHash);
  const now = wallNow();
  const today = todaySummary(coinLog, sessionLog, now);
  const week = dailyTotals(coinLog, now, 7);
  const breakdown = coinBreakdown(coinLog, startOfDay(now));
  const weekTotal = week.reduce((s, d) => s + d.pesos, 0);

  return (
    <View style={{ gap: space.xl }}>
      <SectionTitle
        title="Overview"
        subtitle={new Date(now).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
        right={
          SHOW_SIMULATOR ? (
            <Button
              label="Load demo data"
              variant="ghost"
              onPress={() => {
                const { coins, sessions } = sampleLogs(now);
                useShopStore.setState({ coinLog: coins, sessionLog: sessions });
              }}
            />
          ) : null
        }
      />

      {pinHash === null && (
        <View style={styles.warn} accessibilityRole="alert">
          <Text style={styles.warnText}>You’re still using the default PIN (1234). Change it before opening the shop.</Text>
          <Button label="Change PIN" variant="coin" onPress={onChangePin} />
        </View>
      )}

      <View style={styles.row}>
        <Stat label="Sales today" value={formatPeso(today.pesos)} accent={colors.coin} hint={`${today.coinCount} coins`} />
        <Stat label="Sessions today" value={String(today.sessions)} hint={today.sessions ? `avg ${formatMinutes(today.avgMinutes)}` : 'none yet'} />
        <Stat label="Last 7 days" value={formatPeso(weekTotal)} hint={`avg ${formatPeso(Math.round(weekTotal / 7))}/day`} />
      </View>

      <View style={styles.row}>
        <Card style={{ flex: 2, minWidth: 360 }}>
          <Text style={styles.cardTitle}>Sales, last 7 days</Text>
          <WeekChart data={week} />
        </Card>
        <Card style={{ flex: 1, minWidth: 260, gap: space.md }}>
          <Text style={styles.cardTitle}>Coins today</Text>
          {ACCEPTED_COINS.map((c) => (
            <View key={c} style={styles.coinRow}>
              <View style={styles.coinDot}>
                <Text style={styles.coinDotText}>₱{c}</Text>
              </View>
              <Text style={styles.coinCount}>× {breakdown[c]}</Text>
              <Text style={styles.coinTotal}>{formatPeso(breakdown[c] * c)}</Text>
            </View>
          ))}
        </Card>
      </View>

      <LiveStatus />
    </View>
  );
}

function WeekChart({ data }: { data: { dayStart: number; pesos: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.pesos));
  const empty = data.every((d) => d.pesos === 0);
  return (
    <View style={styles.chart} accessibilityLabel={data.map((d) => `${new Date(d.dayStart).toLocaleDateString('en-PH', { weekday: 'short' })} ${d.pesos} pesos`).join(', ')}>
      {empty && <Text style={styles.chartEmpty}>No sales yet. Coins will show up here.</Text>}
      {data.map((d, i) => {
        const isToday = i === data.length - 1;
        return (
          <View key={d.dayStart} style={styles.barCol}>
            <Text style={styles.barValue}>{d.pesos > 0 ? formatPeso(d.pesos) : ''}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height: `${(d.pesos / max) * 100}%`, backgroundColor: isToday ? colors.coin : colors.surfaceHigh }]} />
            </View>
            <Text style={[styles.barLabel, isToday && { color: colors.text }]}>
              {isToday ? 'Today' : new Date(d.dayStart).toLocaleDateString('en-PH', { weekday: 'short' })}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function LiveStatus() {
  const now = useNow(1000);
  const phase = useSessionStore((s) => s.phase);
  const endsAt = useSessionStore((s) => s.endsAt);
  const addFree = useSessionStore((s) => s.addFreeMinutes);
  const endSession = useSessionStore((s) => s.endSession);
  const coinStatus = useCoinStatus();
  const tabletLabel = useShopStore((s) => s.settings.tabletLabel);
  const inUse = phase === 'active' || phase === 'grace';

  return (
    <Card style={{ gap: space.lg }}>
      <View style={styles.liveHead}>
        <Text style={styles.cardTitle}>{tabletLabel} right now</Text>
        <View style={[styles.badge, { backgroundColor: coinStatus === 'connected' ? colors.success + '22' : colors.danger + '22' }]}>
          <Text style={{ ...type.small, color: coinStatus === 'connected' ? colors.success : colors.danger }}>
            Coin slot {coinStatus === 'connected' ? 'online' : 'offline'}
          </Text>
        </View>
      </View>
      <View style={styles.liveBody}>
        <View style={{ flex: 1 }}>
          <Text style={styles.liveState}>{PHASE_LABEL[phase]}</Text>
          {phase === 'active' && <Text style={styles.liveTime}>{formatClock(remainingMs(endsAt, now))} left</Text>}
        </View>
        <Button label="+15 min free" variant="surface" onPress={() => addFree(15)} />
        <Button label="+30 min free" variant="surface" onPress={() => addFree(30)} />
        {inUse && <Button label="Force end" variant="danger" onPress={endSession} />}
      </View>
      <Text style={styles.liveHint}>Free time isn’t counted as sales.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.lg, flexWrap: 'wrap' },
  warn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.coin,
    backgroundColor: colors.coin + '14',
  },
  warnText: { ...type.body, color: colors.coin, flex: 1 },
  cardTitle: { ...type.h3, color: colors.text },

  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, height: 220, marginTop: space.lg },
  chartEmpty: { ...type.body, color: colors.textFaint, position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center' },
  barCol: { flex: 1, alignItems: 'center', gap: space.xs, height: '100%' },
  barValue: { ...type.small, color: colors.textMuted, fontSize: 11 },
  barTrack: { flex: 1, width: '70%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, minHeight: 2 },
  barLabel: { ...type.small, color: colors.textFaint },

  coinRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  coinDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.coin, alignItems: 'center', justifyContent: 'center' },
  coinDotText: { ...type.small, color: colors.coinInk, fontWeight: '800' },
  coinCount: { ...type.body, color: colors.textMuted, flex: 1 },
  coinTotal: { ...type.h3, color: colors.text, fontVariant: ['tabular-nums'] },

  liveHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  liveBody: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap' },
  liveState: { ...type.h2, color: colors.text },
  liveTime: { ...type.h3, color: colors.time, marginTop: 2, fontVariant: ['tabular-nums'] },
  liveHint: { ...type.small, color: colors.textFaint },
});
