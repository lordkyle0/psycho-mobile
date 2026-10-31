import React from 'react';
import { CheckinForm } from '@/components/checkin/CheckinForm';
import { Screen } from '@/components/layout/Screen';
import { formatLongDate, parseDayKey, toDayKey } from '@/utils/dates';

export function CheckinScreen() {
  const today = toDayKey();
  return (
    <Screen title="Bilan du jour" subtitle={formatLongDate(parseDayKey(today))}>
      <CheckinForm date={today} />
    </Screen>
  );
}
